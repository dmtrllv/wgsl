import { Sep } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { DiagnosticsContext } from "@wgsl/core";
import { BindingVarDeclAst, parseBindingVar } from "./binding.js";
import { AttributeAst } from "./attr.js";
import { IdentAst } from "./ident.js";

export const parseBindingGroup = (iter: Iter, ident: IdentAst, ctx: DiagnosticsContext) => parseWithSpan<BindingGroupAst>(iter, () => {
	iter.expect(Sep.LBrace);

	const declarations: BindingVarDeclAst[] = [];

	while (!iter.ended) {
		if (iter.nextIf(Sep.RBrace)) {
			break;
		}
		const attributes = parseAttributes(iter, ctx);
		declarations.push(parseBindingVar(iter, attributes, ctx));
	}

	return {
		type: "BindingGroup",
		name: ident,
		declarations,
	};
});

const parseAttributes = (_iter: Iter, _ctx: DiagnosticsContext) => {
	const attributes: AttributeAst[] = [];

	return attributes;
};

export type BindingGroupAst = AstType<"BindingGroup", {
	name: IdentAst;
	declarations: BindingVarDeclAst[];
}>;