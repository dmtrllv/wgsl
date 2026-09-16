import { AstType } from "./ast.js";
import { FunctionArgExprListAst } from "./function.js";
import { IdentAst } from "./ident.js";

export type AttributeAst = AstType<"Attribute", {
	name: IdentAst,
	argList: FunctionArgExprListAst | null,
}>;