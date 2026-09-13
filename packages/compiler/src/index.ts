
import { DiagnosticError, DiagnosticsContext, DiagnosticSeverity, isDiagnosticError } from "@wgsl/core";
import { parseSource, Token } from "@wgsl/lexer";
import { ModuleAst, parseTokens } from "@wgsl/ast";
import { readdir, readFile, stat } from "node:fs/promises";
import { isAbsolute, join, sep as PATH_SEP } from "node:path";
import { mapParallel } from "@wgsl/utils";

export class Compiler {
	public readonly rootDir: string;
	public readonly sources: Map<string, string> = new Map();
	public readonly tokens: Map<string, Token[]> = new Map();
	public readonly asts: Map<string, ModuleAst> = new Map();

	public constructor(rootDir: string) {
		this.rootDir = rootDir + PATH_SEP;
	}

	private getFullPath = (path: string) => {
		if (!isAbsolute(path)) {
			return join(this.rootDir, path);
		} else if (!path.startsWith(this.rootDir)) {
			throw new DiagnosticError(DiagnosticSeverity.Error, `${path} is not inside the root folder!`);
		}
		return path;
	}

	private getRelativePath = (path: string) => {
		if (isAbsolute(path)) {
			if (!path.startsWith(this.rootDir)) {
				throw new DiagnosticError(DiagnosticSeverity.Error, `${path} is not inside the root folder!`);
			}
			return path.replace(this.rootDir, "");
		}
		return path;
	}

	public async getSource(path: string, ctx: DiagnosticsContext) {
		return ctx.tryAsync(async () => {
			path = this.getFullPath(path);

			if (!path.endsWith(".wgsl")) {
				throw new DiagnosticError(DiagnosticSeverity.Error, `Invalid file extension for ${path}! (Expected a ".wgsl" extension)`);
			}

			const relativePath = this.getRelativePath(path);

			let source = this.sources.get(relativePath);

			if (!source) {
				try {
					source = await readFile(path, "utf-8");
					this.sources.set(relativePath, source);
				} catch (e: any) {
					if (e.code === "ENOENT")
						throw new DiagnosticError(DiagnosticSeverity.Error, `Could not find file at ${path}`);


					throw e;
				}
			}

			return source;
		});
	}

	public async getTokens(path: string, ctx: DiagnosticsContext) {
		return ctx.tryAsync(async () => {
			path = this.getRelativePath(path);

			if (this.tokens.has(path))
				return this.tokens.get(path)!;

			const source = await this.getSource(path, ctx);

			if (isDiagnosticError(source))
				return source;

			const tokens = await parseSource(path, source, ctx);

			if (!isDiagnosticError(tokens))
				this.tokens.set(path, tokens);

			return tokens;
		});
	}

	public async getAst(path: string, ctx: DiagnosticsContext) {
		return ctx.tryAsync(async () => {
			path = this.getRelativePath(path);

			if (this.asts.has(path))
				return this.asts.get(path)!;

			const source = await this.getSource(path, ctx);

			if (isDiagnosticError(source))
				return source;

			const tokens = await this.getTokens(path, ctx);

			if (isDiagnosticError(tokens))
				return tokens;
			
			const ast = parseTokens(path, source, tokens, ctx);

			if (!isDiagnosticError(tokens))
				this.asts.set(path, ast);

			return ast;
		});
	}

	public async compile(path: string, ctx: DiagnosticsContext) {
		return ctx.tryAsync(async () => {
			const tokens = await this.getTokens(path, ctx);

			return tokens;
		});
	}

	public async getAllSourcePaths() {
		const paths: string[] = [];

		const resolveFiles = async (dir: string) => {
			const entries = await readdir(dir);
			await Promise.all(entries.map(async entry => {
				entry = join(dir, entry);
				if ((await stat(entry)).isFile()) {
					if (entry.endsWith(".wgsl")) {
						paths.push(entry);
					}
				} else {
					await resolveFiles(entry);
				}
			}));
		};

		await resolveFiles(this.rootDir);

		return paths;
	}

	public async compileAll(ctx: DiagnosticsContext) {
		const paths = await this.getAllSourcePaths();

		await mapParallel(paths, async path => {
			await this.getAst(path, ctx);
		});
	}
}