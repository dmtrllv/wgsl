import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { AttributeAst } from "./attr.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Keyword, Sep } from "@wgsl/lexer";
import { parseScope } from "./scope.js";
import { parseType, TypeAst } from "./type.js";
import { ExprAst, parseExpr } from "./expr.js";

export const parseFunction = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<FunctionAst>(iter, () => {
	iter.expect(Keyword.Fn);
	const name = parseIdent(iter);
	return {
		type: "Function",
		name,
		attributes,
		arguments: parseFunctionArgList(iter, ctx),
		scope: parseScope(iter, ctx)
	};
});

export const parseFunctionArgList = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<FunctionArgListAst>(iter, () => {
	let args: FunctionArgAst[] = [];
	iter.expect(Sep.LParen);
	while (!iter.ended) {
		if (iter.nextIf(Sep.RParen)) {
			break;
		}
		args.push(parseFunctionArg(iter, ctx));
		if (iter.nextIf(Sep.Comma) === null) {
			iter.expect(Sep.RParen);
			break;
		}
	}
	return {
		type: "FunctionArgList",
		arguments: args,

	}
});

export const parseFunctionArg = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<FunctionArgAst>(iter, () => {
	const name = parseIdent(iter);
	iter.expect(Sep.Colon);
	const typeName = parseType(iter, ctx);
	return {
		type: "FunctionArg",
		attributes: [],
		name,
		typeName
	}
});

export const parseFunctionArgExprList = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<FunctionArgExprListAst>(iter, () => {
	const args: ExprAst[] = [];
	iter.expect(Sep.LParen);
	while (!iter.ended) {
		if (iter.nextIf(Sep.RParen)) {
			break;
		}
		args.push(parseExpr(iter, ctx));
		if (iter.nextIf(Sep.Comma) === null) {
			iter.expect(Sep.RParen);
			break;
		}
	}
	return {
		type: "FunctionArgExprList",
		arguments: args
	}
});

export const parseFunctionCall = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<FunctionCallAst>(iter, () => {
	const name = parseIdent(iter);

	const args: ExprAst[] = [];

	return {
		type: "FunctionCall",
		name,
		arguments: args
	}
})

export type FunctionAst = AstType<"Function", {
	name: IdentAst,
	attributes: AttributeAst[],
	arguments: FunctionArgListAst,
}>;

export type FunctionArgListAst = AstType<"FunctionArgList", {
	arguments: FunctionArgAst[];
}>;

export type FunctionArgAst = AstType<"FunctionArg", {
	name: IdentAst;
	typeName: TypeAst;
}>;

export type FunctionArgExprListAst = AstType<"FunctionArgExprList", {
	arguments: ExprAst[];
}>;

export type FunctionCallAst = AstType<"FunctionCall", {
	name: IdentAst,
	arguments: ExprAst[];
}>