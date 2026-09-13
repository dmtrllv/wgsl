import { AstType } from "./ast.js";
import { FunctionArgListAst } from "./function.js";
import { IdentAst } from "./ident.js";

export type AttributeAst = AstType<"Attribute", {
	name: IdentAst,
	args: FunctionArgListAst
}>;