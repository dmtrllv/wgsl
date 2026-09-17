import { DiagnosticsContext } from "@wgsl/core";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { AstType } from "./ast.js";
import { AttributeAst } from "./attr.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { IdentAst, parseIdent } from "./ident.js";
import { parseFunctionArgExprList } from "./function.js";
import { parseType, TypeAst } from "./type.js";

export const parseStruct = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<StructAst>(iter, () => {
	iter.expect(Keyword.Struct);
	const name = parseIdent(iter, ctx);
	if (!name)
		return null;
	iter.expect(Sep.LBrace);

	const properties: StructPropertyAst[] = [];

	while (!iter.ended) {
		if (iter.isNext(Sep.RBrace)) {
			break;
		}
		const prop = parseProperty(iter, ctx)
		if (prop)
			properties.push(prop);

		if (!iter.nextIf(Sep.Comma)) {
			break;
		}
	}

	iter.expect(Sep.RBrace);

	return {
		type: "Struct",
		attributes,
		name,
		properties
	};
});

export const parseProperty = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<StructPropertyAst>(iter, () => {
	const attributes: AttributeAst[] = [];

	while (iter.nextIf(Op.At) !== null) {
		const attr = parseAttribute(iter, ctx);
		if (attr)
			attributes.push(attr);
	}

	const name = parseIdent(iter, ctx);
	if(!name)
		return null;

	iter.expect(Sep.Colon);
	const typeName = parseType(iter, ctx);

	return {
		type: "StructProperty",
		attributes,
		name,
		typeName
	};
});

const parseAttribute = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<AttributeAst>(iter, () => {
	const name = parseIdent(iter, ctx);
	if(!name)
		return null;
	const args = iter.isNext(Sep.LParen) ? parseFunctionArgExprList(iter, ctx) : null;

	return {
		type: "Attribute",
		argList: args,
		name
	};
});

export type StructAst = AstType<"Struct", {
	attributes: AttributeAst[];
	name: IdentAst;
	properties: StructPropertyAst[];
}>;

export type StructPropertyAst = AstType<"StructProperty", {
	attributes: AttributeAst[];
	name: IdentAst;
	typeName: TypeAst;
}>;
