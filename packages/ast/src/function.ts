import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { AttributeAst } from "./attr.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { parseScope, StmtScopeAst } from "./scope.js";
import { parseType, TypeAst } from "./type.js";
import { ExprAst, parseExpr } from "./expr.js";

export const parseFunction = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<FunctionAst>(iter, () => {
	iter.expect(Keyword.Fn);
	const name = parseIdent(iter);
	const args = parseFunctionArgList(iter, ctx);
	let returnType: TypeAst | null = null;
	if(iter.nextIf(Op.Sub)) {
		iter.expect(Op.Gt);
		returnType = parseType(iter, ctx);
	}
	return {
		type: "Function",
		name,
		attributes,
		argList: args,
		returnType,
		body: parseScope(iter, ctx)
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
		args.push(parseExpr(iter, 0, ctx));
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

export const parseFunctionCall = (iter: Iter, expr: ExprAst, ctx: DiagnosticsContext) => parseWithSpan<FunctionCallAst>(iter, () => {
	return {
		type: "FunctionCall",
		expr,
		arguments: parseFunctionArgExprList(iter, ctx)
	}
});

export type FunctionAst = AstType<"Function", {
	name: IdentAst,
	attributes: AttributeAst[],
	argList: FunctionArgListAst,
	returnType: TypeAst | null;
	body: StmtScopeAst;
}>;

export type FunctionArgListAst = AstType<"FunctionArgList", {
	arguments: FunctionArgAst[],
}>;

export type FunctionArgAst = AstType<"FunctionArg", {
	name: IdentAst,
	typeName: TypeAst,
}>;

export type FunctionArgExprListAst = AstType<"FunctionArgExprList", {
	arguments: ExprAst[],
}>;

export type FunctionCallAst = AstType<"FunctionCall", {
	expr: ExprAst,
	arguments: FunctionArgExprListAst,
}>;