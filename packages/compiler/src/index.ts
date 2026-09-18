
import { Diagnostic, DiagnosticError, DiagnosticsContext, isDiagnosticError } from "@wgsl/core";
import { parseSource, Token } from "@wgsl/lexer";
import { Ast, ModuleAst, parseTokens } from "@wgsl/ast";
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

	public async invalidate(path: string, source: string) {
		const module = await this.compile(path, source);
		return this.compiledModules.set(path, module);
	}

	public getAst(module: CompiledModule, offset: number): [target: Ast | null, parents: Ast[]] {
		if (!module.ast || isDiagnosticError(module.ast))
			return [null, []];

		const asts: Ast[] = [];

		const findNodeAt = (node: Ast, offset: number): Ast | null => {
			if (offset < node.span.start || offset > node.span.end) {
				return null;
			}

			asts.push(node);

			for (const child of getAstChildren(node)) {
				if (!child)
					continue;

				const result = findNodeAt(child, offset);

				if (result)
					return result;
			}

			return node;
		};

		const ast = findNodeAt(module.ast, offset);
		
		asts.pop();

		return [ast, asts.reverse()];
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

const getAstChildren = (ast: Ast): (Ast | null)[] => {
	const children: (Ast | null)[] = [];

	switch (ast.type) {
		case "Module":
			return [...ast.imports, ...ast.declarations];
		case "Struct":
			return [...ast.attributes, ast.name, ...ast.properties];
		case "Function":
			return [...ast.attributes, ast.name, ast.argList, ast.body];
		case "RenderPass":
			return [ast.name, ...ast.declarations];
		case "BindingGroup":
			return [ast.name, ...ast.declarations];
		case "VarDecl":
		case "LetDecl":
		case "ConstDecl":
		case "OverrideDecl":
			return [ast.name, ast.typeName, ast.expr];
		case "BindingVar":
			return [...ast.attributes, ast.name, ast.resourceType];
		case "Function":
			return [...ast.attributes, ast.name, ast.returnType, ast.argList, ast.body];
		case "FunctionArg":
			return [ast.name, ast.typeName];
		case "StructProperty":
			return [...ast.attributes, ast.name, ast.typeName];
		case "TypeAlias":
			return [ast.typeName];
		case "ConcreteType":
			return [ast.name];
		case "GenericType":
			return [ast.name, ...ast.generics];
		case "FunctionCall":
			return [ast.expr, ast.arguments];

		case "BinaryOp":
			return [ast.left, ast.right];
		case "ArrayIndex":
			return [ast.expr, ast.index];
		case "ExprGroup":
		case "UnaryOp":
			return [ast.expr];
		case "Bitcast":
			return [ast.typeName, ast.arguments];
		case "GenericCall":
			return [...ast.generics, ast.arguments]
		case "ArrayDecl":
			return ast.expressions;
		case "ExprStmt":
		case "ReturnStmt":
			return [ast.expr];
		case "SwitchStmt":
			return [ast.expr, ...ast.cases, ast.defaultCase];
		case "SwitchCase":
			return [...ast.selectors, ast.body];
		case "ForStmt":
			return [ast.initializer, ast.continuing, ast.condition, ast.body];
		case "LoopStmt":
			return [ast.body];
		case "IfElse":
			return [ast.if, ...ast.elseIfs, ast.else];
		case "ContinuingStmt":
			return [ast.body];
		case "ContinueStmt":
		case "DiscardStmt":
		case "BreakStmt":
			return [];
		case "If":
		case "ElseIf":
			return [ast.expr, ast.body];
		case "Else":
			return [ast.body];
		case "Attribute":
			return [ast.name, ast.argList];
		case "FunctionArgList":
			return ast.arguments;
		case "FunctionArgExprList":
			return ast.arguments;
		case "StatementScope":
			return ast.statements;
		case "Import":
		case "Invalid":
			return [];
	}

	return children;
};