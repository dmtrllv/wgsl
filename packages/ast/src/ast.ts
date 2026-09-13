import { Span } from "@wgsl/core";
import { ModuleAst } from "./module.js";
import { ImportAst } from "./import.js";
import { StructAst, StructPropertyAst } from "./struct.js";
import { AttributeAst } from "./attr.js";
import { FunctionArgAst, FunctionArgExprListAst, FunctionArgListAst, FunctionAst } from "./function.js";
import { RenderPassAst } from "./pass.js";
import { IdentAst } from "./ident.js";
import { StmtScopeAst } from "./scope.js";
import { GroupBlockAst } from "./group_block.js";
import { TypeAst } from "./type.js";
import { ExprAst } from "./expr.js";
import { StmtAst } from "./stmt.js";

export type AstType<Name extends string, Data extends {} = {}> = {
	readonly type: Name;
	readonly span: Span;
} & Data;

export type Ast =
	| ModuleAst
	| DeclarationAsts
	| TypeAst
	| ExprAst
	| StmtAst
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
	| FunctionArgExprListAst
	| FunctionArgAst
	| StmtScopeAst;