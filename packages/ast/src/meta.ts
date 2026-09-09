import { DiagnosticsContext } from "@wgsl/core";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { AstType } from "./ast.js";
import { Op, Sep } from "@wgsl/lexer";
import { parseIdent } from "./ident.js";

export const parseMetaExpr = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<MetaAst>(iter, () => {
	iter.expect(Op.At);
	const name = parseIdent(iter);
	if (iter.nextIf(Sep.LParen)) {
		iter.skip();
		while(!iter.nextIf(Sep.RParen)) {
			// todo parse args
			iter.skip();
		}
		iter.skip();
	}
	return {
		type: "Meta",
		name,
		args: []
	};
});

export type MetaAst = AstType<"Meta", {
	name: string,
	args: any[]
}>;