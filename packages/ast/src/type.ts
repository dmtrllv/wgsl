import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { Op, Sep } from "@wgsl/lexer";

export const parseType = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<TypeAst>(iter, () => {
	const name = parseIdent(iter);

	if (iter.nextIf(Op.Lt)) {
		let generics: TypeAst[] = [];

		while (!iter.ended) {
			generics.push(parseType(iter, ctx));
			if (iter.nextIf(Op.Gt)) {
				return {
					type: "GenericType",
					name,
					generics
				};
			}
			iter.expect(Sep.Comma);
		}
	}

	return {
		type: "ConcreteType",
		name
	}
});

export type ConcreteTypeAst = AstType<"ConcreteType", {
	name: IdentAst;
}>;

export type GenericTypeAst = AstType<"GenericType", {
	name: IdentAst;
	generics: TypeAst[];
}>;

export type TypeAst =
	| ConcreteTypeAst
	| GenericTypeAst;
