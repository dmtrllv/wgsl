import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { IdentAst } from "./ident.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";

export const parseTypeName = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<TypeNameAst>(iter, () => {
	throw new Error("TODO");
});

export type TypeNameAst = AstType<"TypeName", {
	name: IdentAst;
}>;

export type TypeAsts =
	| TypeNameAst;
	//| GenericTypeAst;