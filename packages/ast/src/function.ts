import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { AttributeAst } from "./attr.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Keyword, Sep } from "@wgsl/lexer";
import { parseScope } from "./scope.js";
import { parseTypeName, TypeAsts } from "./type_name.js";

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
	if (iter.nextIf(Sep.RParen) !== null) {
		while (!iter.ended) {
			args.push(parseFunctionArg(iter, ctx));
			if (iter.nextIf(Sep.Comma) === null) {
				iter.expect(Sep.RParen);
				break;
			}
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
	const typeName = parseTypeName(iter, ctx);
	return {
		type: "FunctionArg",
		name,
		typeName
	}
});

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
	typeName: TypeAsts;
}>;