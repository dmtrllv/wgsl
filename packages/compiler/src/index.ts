
import { DiagnosticError, DiagnosticsContext, DiagnosticSeverity, isDiagnosticError } from "@wgsl/core";
import { parseSource } from "@wgsl/lexer";
import { readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

export class Compiler {
	public readonly rootDir: string;
	public readonly sources: Map<string, string> = new Map();
	public readonly tokens: Map<string, string> = new Map();

	public constructor(rootDir: string) {
		this.rootDir = rootDir;
	}

	public async getSource(path: string, ctx: DiagnosticsContext) {
		return ctx.tryAsync(async () => {
			if (!isAbsolute(path)) {
				path = join(this.rootDir, path);
			} else if (!path.startsWith(this.rootDir)) {
				throw new DiagnosticError(DiagnosticSeverity.Error, `${path} is not inside the root folder!`);
			}

			if (!path.endsWith(".wgsl")) {
				throw new DiagnosticError(DiagnosticSeverity.Error, `Invalid file extension for ${path}! (Expected a ".wgsl" extension)`);
			}

			const relativePath = path.replace(this.rootDir, "");

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
			const source = await this.getSource(path, ctx);
			if (isDiagnosticError(source))
				return source;
			return parseSource(path, source, ctx);
		});
	}

	public async compile(path: string, ctx: DiagnosticsContext) {
		return ctx.tryAsync(async () => {
			const tokens = await this.getTokens(path, ctx);

			return tokens;
		});
	}
}