import { Span } from "@wgsl/core";
import { ModuleAst } from "./module.js";
import { ImportAst } from "./import.js";
import { StructAst, StructPropertyAst } from "./struct.js";
import { AttributeAst } from "./attr.js";
import { FunctionArgAst, FunctionArgListAst, FunctionAst } from "./function.js";
import { RenderPassAst } from "./pass.js";
import { IdentAst } from "./ident.js";
import { StmtScopeAst } from "./scope.js";
import { GroupBlockAst } from "./group_block.js";
import { TypeAsts } from "./type_name.js";

export type AstType<Name extends string, Data extends {} = {}> = {
	readonly type: Name;
	readonly span: Span;
} & Data;

export type Ast =
	| ModuleAst
	| DeclarationAsts
	| TypeAsts
	| MiscAsts;

export type DeclarationAsts =
	| StructAst
	| FunctionAst
	| VarAsts
	| RenderPassAst
	| GroupBlockAst
	| ImportAst;

export type VarAsts = AstType<"Var", {}>;

export type MiscAsts =
	| IdentAst
	| StructPropertyAst
	| AttributeAst
	| FunctionArgListAst
	| FunctionArgAst
	| StmtScopeAst;