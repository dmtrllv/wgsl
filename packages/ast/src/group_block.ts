import { Sep } from "@wgsl/lexer";
import { AstType, VarAsts } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { DiagnosticsContext } from "@wgsl/core";

export const parseGroupBlock = (iter: Iter, kind: GroupBlockKind, _ctx: DiagnosticsContext) => parseWithSpan<GroupBlockAst>(iter, () => {
	iter.expect(Sep.LBrace);
	iter.expect(Sep.RBrace);

	return {
		type: "GroupBlock",
		kind,
		declarations: [],
	}
});

export type GroupBlockAst = AstType<"GroupBlock", {
	kind: GroupBlockKind;
	declarations: VarAsts[];
}>;

type GroupBlockKind =
	| "material"
	| "global"
	| "object";