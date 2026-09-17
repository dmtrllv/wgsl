import { parseType, TypeAst } from "./type.js";
import { AstType } from "./ast.js";
import { DiagnosticsContext } from "@wgsl/core";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";

export const parseTypeAlias = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<TypeAliasAst>(iter, () => {
	iter.expect(Keyword.Alias);
	const name = parseIdent(iter);
	iter.expect(Op.Assign);
	const typeName = parseType(iter, ctx);
	iter.expect(Sep.Semicolon);
	return {
		type: "TypeAlias",
		name,
		typeName
	}
});

export type TypeAliasAst = AstType<"TypeAlias", {
	name: IdentAst,
	typeName: TypeAst,
}>;