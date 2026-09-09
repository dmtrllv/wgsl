import { DiagnosticsContext } from "@wgsl/core";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { AstType } from "./ast.js";
import { MetaAst, parseMetaExpr } from "./meta.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { parseIdent } from "./ident.js";

export const parseStruct = (iter: Iter, meta: MetaAst[], ctx: DiagnosticsContext) => parseWithSpan<StructAst>(iter, () => {
	iter.expect(Keyword.Struct);
	const name = parseIdent(iter);
	iter.expect(Sep.LBrace);

	const properties: StructPropertyAst[] = [];

	while(!iter.nextIf(Sep.RBrace)) {
		properties.push(parseProperty(iter, ctx))
	}

	iter.expect(Sep.RBrace);

	return {
		type: "Struct",
		meta,
		name,
		properties
	};
});

export const parseProperty = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<StructPropertyAst>(iter, () => {
	const meta: MetaAst[] = [];
	while(iter.isNext(Op.At)) {
		meta.push(parseMetaExpr(iter, ctx));
	}
	
	const name = parseIdent(iter);
	iter.expect(Sep.Colon);
	const typeName = parseTypeName(iter, ctx);

	return {
		type: "StructPropertyAst",
		meta,
		name,
		typeName
	};
});


export const parseTypeName = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<TypeNameAst>(iter, () => {
	const name = parseIdent(iter);

	return {
		type: "TypeNameAst",
		name,
	};
});


export type StructAst = AstType<"Struct", {
	meta: MetaAst[];
	name: string;
	properties: StructPropertyAst[];
}>;

export type StructPropertyAst = AstType<"StructPropertyAst", {
	meta: MetaAst[];
	name: string;
	typeName: TypeNameAst;
}>;

export type TypeNameAst = AstType<"TypeNameAst", {
	name: string;
}>;