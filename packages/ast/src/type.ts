import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";

export const parseType = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<TypeAst>(iter, () => {
	let name: IdentAst | null = null;

	if (iter.isNext(Keyword.Array)) {
		name = parseWithSpan(iter, () => {
			iter.skip();
			return {
				type: "Identifier",
				value: "array"
			}
		});
	} else {
		name = parseIdent(iter, ctx);
	}

	if(!name)
		return null;

	if (iter.nextIf(Op.Lt)) {
		let generics: TypeAst[] = [];

		while (!iter.ended) {
			const type = parseType(iter, ctx);
			if (type)
				generics.push(type);
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
