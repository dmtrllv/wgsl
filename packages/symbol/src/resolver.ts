import { Ast, ModuleAst } from "@wgsl/ast";
import { Scope } from "./scope.js";
import { DiagnosticsContext } from "@wgsl/core";

export const resolveSymbols = (ast: ModuleAst, _ctx: DiagnosticsContext): Scope => {
	const scope = new Scope("Module");
	ast.declarations.forEach(decl => resolve(decl, scope));
	return scope;
};

const resolve = (ast: Ast, scope: Scope) => {
	switch (ast.type) {
		case "Struct":
			scope.add("Struct", ast);
			break;
		case "BindingGroup":
			const bindScope = scope.addScoped("BindingGroup", ast);
			ast.declarations.forEach(decl => resolve(decl, bindScope));
			break;
		case "Function":
			const fnScope = scope.addScoped("Function", ast);
			ast.argList.arguments.forEach(arg => fnScope.add("Argument", arg));
			ast.body.statements.forEach(stmt => resolve(stmt, fnScope));
			break;
		case "RenderPass":
			const rpScope = scope.addScoped("RenderPass", ast);
			ast.declarations.forEach(decl => resolve(decl, rpScope));
			break;
	}
}