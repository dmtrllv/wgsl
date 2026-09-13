import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";

export const parseScope = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<StmtScopeAst>(iter, () => {
	return {
		type: "StatementScope",
		statements: []
	}
});	

export type StmtScopeAst = AstType<"StatementScope", {
	statements: StatementAst[];
}>;

export type StatementAst = any;