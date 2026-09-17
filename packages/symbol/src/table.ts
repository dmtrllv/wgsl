import { Ast, isVarDeclarationAst, ModuleAst } from "@wgsl/ast";
import { Scope } from "./scope.js";
import { DiagnosticsContext } from "@wgsl/core";

export class SymbolTable {
	public readonly scopes: Map<Ast, Scope>;
	public readonly moduleScope: Scope;

	public readonly imports = new Map<string, Scope>();

	public constructor(ast: ModuleAst, ctx: DiagnosticsContext) {
		this.scopes = new Map<Ast, Scope>();
		this.moduleScope = new Scope("Module", null, this);
		ast.declarations.forEach(decl => this.resolve(decl, this.moduleScope, ctx));
	}

	private resolve = (ast: Ast, scope: Scope, ctx: DiagnosticsContext) => {
		switch (ast.type) {
			case "Struct":
				const structScope = scope.addScoped("Struct", ast);
				ast.properties.forEach(prop => structScope.add("Property", prop));
				break;
			case "BindingGroup":
				//const bindScope = scope.addScoped("BindingGroup", ast);
				ast.declarations.forEach(decl => this.resolve(decl, scope, ctx));
				break;
			case "Function":
				const fnScope = scope.addScoped("Function", ast);
				ast.argList.arguments.forEach(arg => fnScope.add("Argument", arg));
				ast.body.statements.forEach(stmt => this.resolve(stmt, fnScope, ctx));
				break;
			case "RenderPass":
				const rpScope = scope.addBlockScope(ast);
				ast.declarations.forEach(decl => this.resolve(decl, rpScope, ctx));
				break;
			case "BindingVar":
			case "VarDecl":
			case "LetDecl":
			case "ConstDecl":
			case "OverrideDecl":
				scope.addVariable(ast);
				break;
			case "ForStmt":
				const forScope = scope.addBlockScope(ast);
				if (ast.initializer && isVarDeclarationAst(ast.initializer))
					forScope.addVariable(ast.initializer);
				ast.body.statements.forEach(stmt => this.resolve(stmt, forScope, ctx));
				break;
			case "LoopStmt":
				const loopScope = scope.addBlockScope(ast);
				ast.body.statements.forEach(stmt => this.resolve(stmt, loopScope, ctx));
				break;
			case "SwitchStmt":
				ast.cases.forEach(c => {
					const caseScope = scope.addBlockScope(ast);
					c.body.statements.forEach(stmt => this.resolve(stmt, caseScope, ctx));
				});
				break;
			case "ContinuingStmt":
				const contScope = scope.addBlockScope(ast);
				ast.body.statements.forEach(stmt => this.resolve(stmt, contScope, ctx));
				break;
			case "StatementScope":
				const stmtScope = scope.addBlockScope(ast);
				ast.statements.forEach(stmt => this.resolve(stmt, stmtScope, ctx));
				break;
		}
	}


	private logSymbols = (scope: Scope, offset: number = 0) => {
		const log = (msg: any) => console.log(new Array(offset).fill(' ').join("") + msg);
		for (const [name, s] of scope.symbols) {
			log(`${s.type}: ${name}`);
			if ("scope" in s)
				this.logSymbols(s.scope, offset + 4);
		}
	}

	public log() {
		this.logSymbols(this.moduleScope);
	}
}