import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { IdentAst, parseIdent } from "./ident.js";
import { ExprAst, parseExpr } from "./expr.js";
import { parseType, TypeAst } from "./type.js";
import { AttributeAst } from "./attr.js";

export const parseVarDeclaration = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<VarDeclAst>(iter, () => {
	iter.expect(Keyword.Var);
	const name = parseIdent(iter, ctx);
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

export const parseConstDeclaration = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<ConstDeclAst>(iter, () => {
	iter.expect(Keyword.Const);
	const name = parseIdent(iter, ctx);
	const typeName = iter.nextIf(Sep.Colon) && parseType(iter, ctx);
	const expr = iter.nextIf(Op.Assign) && parseExpr(iter, 0, ctx);
	iter.expect(Sep.Semicolon);
	return {
		type: "ConstDecl",
		attributes,
		name,
		typeName,
		expr
	}
});	

export type ConstDeclAst = AstType<"ConstDecl", {
	name: IdentAst,
	typeName: TypeAst | null,
	expr: ExprAst | null
}>;

export const parseLetDeclaration = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<LetDeclAst>(iter, () => {
	iter.expect(Keyword.Let);
	const name = parseIdent(iter, ctx);
	const typeName = iter.nextIf(Sep.Colon) && parseType(iter, ctx);
	const expr = iter.nextIf(Op.Assign) && parseExpr(iter, 0, ctx);
	iter.expect(Sep.Semicolon);
	return {
		type: "LetDecl",
		name,
		typeName,
		expr
	}
});	

export type LetDeclAst = AstType<"LetDecl", {
	name: IdentAst,
	typeName: TypeAst | null,
	expr: ExprAst | null
}>;


export const parseOverrideDeclaration = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<OverrideDeclAst>(iter, () => {
	iter.expect(Keyword.Override);
	const name = parseIdent(iter, ctx);
	const typeName = iter.nextIf(Sep.Colon) && parseType(iter, ctx);
	const expr = iter.nextIf(Op.Assign) && parseExpr(iter, 0, ctx);
	iter.expect(Sep.Semicolon);
	return {
		type: "OverrideDecl",
		attributes,
		name,
		typeName,
		expr
	}
});	

export type OverrideDeclAst = AstType<"OverrideDecl", {
	attributes: AttributeAst[],
	name: IdentAst,
	typeName: TypeAst | null,
	expr: ExprAst | null
}>;