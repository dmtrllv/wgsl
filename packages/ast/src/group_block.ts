import { Sep } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { DiagnosticsContext } from "@wgsl/core";
import { BindingVarDeclAst, parseBindingVar } from "./binding.js";
import { AttributeAst } from "./attr.js";

export const parseGroupBlock = (iter: Iter, kind: GroupBlockKind, ctx: DiagnosticsContext) => parseWithSpan<GroupBlockAst>(iter, () => {
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
		type: "GroupBlock",
		kind,
		declarations,
	};
});

const parseAttributes = (_iter: Iter, _ctx: DiagnosticsContext) => {
	const attributes: AttributeAst[] = [];

	return attributes;
};

export type GroupBlockAst = AstType<"GroupBlock", {
	kind: GroupBlockKind;
	declarations: BindingVarDeclAst[];
}>;

type GroupBlockKind =
	| "material"
	| "global"
	| "object";