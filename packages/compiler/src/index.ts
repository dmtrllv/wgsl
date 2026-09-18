
import { Diagnostic, DiagnosticError, DiagnosticsContext, isDiagnosticError } from "@wgsl/core";
import { parseSource, Token } from "@wgsl/lexer";
import { ModuleAst, parseTokens } from "@wgsl/ast";
import { SymbolTable } from "@wgsl/symbol";
import { TypeTable } from "@wgsl/type";
import { getOrInsertAsync } from "@wgsl/utils";

export class Compiler {
	public readonly rootDir: string;
	public readonly compiledModules: Map<string, CompiledModule> = new Map();

	public constructor(rootDir: string) {
		this.rootDir = rootDir;
	}

	public async compile(path: string, source: string): Promise<CompiledModule> {
		const ctx = new DiagnosticsContext();

		const tokens = await parseSource(path, source, ctx);
		const ast = !isDiagnosticError(tokens) && tokens ? await parseTokens(path, source, tokens, ctx) : null;
		const symbols = !isDiagnosticError(ast) && ast ? new SymbolTable(ast, ctx) : null;
		const types = !isDiagnosticError(ast) && ast ? await new TypeTable(ast, ctx) : null;

		return {
			path,
			tokens,
			ast,
			symbols,
			types,
			diagnostics: ctx.diagnostics
		}
	}

	public async getModule(path: string, source: string) {
		return getOrInsertAsync(this.compiledModules, path, async () => this.compile(path, source));
	}
}

export type CompiledModule = {
	readonly path: string;
	readonly tokens: Token[] | DiagnosticError | null;
	readonly ast: ModuleAst | DiagnosticError | null;
	readonly symbols: SymbolTable | null;
	readonly types: TypeTable | null;
	readonly diagnostics: Diagnostic[];
};