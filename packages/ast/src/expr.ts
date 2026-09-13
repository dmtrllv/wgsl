import { DiagnosticsContext } from "@wgsl/core";
import { FunctionCallAst } from "./function.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";

export const parseExpr = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<ExprAst>(iter, () => {
	throw new Error("TODO parseExpr");
});

export type ExprAst = FunctionCallAst;