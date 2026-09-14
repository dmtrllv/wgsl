import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { IdentAst, parseIdent } from "./ident.js";
import { ExprAst, parseExpr } from "./expr.js";
import { parseType, TypeAst } from "./type.js";

export const parseVarDeclaration = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<VarDeclAst>(iter, () => {
	iter.expect(Keyword.Var);
	const name = parseIdent(iter);
	const typeName = iter.nextIf(Sep.Colon) && parseType(iter, ctx);
	const expr = iter.nextIf(Op.Assign) && parseExpr(iter, 0, ctx);
	iter.expect(Sep.Semicolon);
	return {
		type: "VarDecl",
		name,
		typeName,
		expr
	}
});	

export type VarDeclAst = AstType<"VarDecl", {
	name: IdentAst,
	typeName: TypeAst | null,
	expr: ExprAst | null
}>;