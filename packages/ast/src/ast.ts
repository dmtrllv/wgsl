import { Span } from "@wgsl/core";
import { ModuleAst } from "./module.js";
import { ImportAst } from "./import.js";
import { StructAst, StructPropertyAst } from "./struct.js";
import { AttributeAst } from "./attr.js";
import { FunctionArgAst, FunctionArgExprListAst, FunctionArgListAst, FunctionAst } from "./function.js";
import { RenderPassAst } from "./pass.js";
import { IdentAst } from "./ident.js";
import { StmtScopeAst } from "./scope.js";
import { BindingGroupAst } from "./group_block.js";
import { TypeAst } from "./type.js";
import { ExprAst } from "./expr.js";
import { StmtAst } from "./stmt.js";
import { BindingVarDeclAst } from "./binding.js";
import { ConstDeclAst, LetDeclAst, OverrideDeclAst, VarDeclAst } from "./var.js";
import { TypeAliasAst } from "./alias.js";

export type AstType<Name extends string, Data extends {} = {}> = {
	readonly type: Name;
	readonly span: Span;
} & Data;

export type Ast =
	| ModuleAst
	| DeclarationAst
	| TypeAst
	| ExprAst
	| StmtAst
	| MiscAsts;

export type DeclarationAst =
	| StructAst
	| FunctionAst
	| RenderPassAst
	| BindingGroupAst
	| VarDeclarationAst
	| OverrideDeclAst
	| FunctionArgAst
	| StructPropertyAst
	| TypeAliasAst;

export type VarDeclarationAst =
	| BindingVarDeclAst
	| VarDeclAst
	| LetDeclAst
	| ConstDeclAst
	| OverrideDeclAst;

const VAR_DECLARATION_TYPES = [
	"BindingVar",
	"ConstDecl",
	"LetDecl",
	"VarDecl"
];

export const isVarDeclarationAst = (ast: Ast): ast is VarDeclarationAst => VAR_DECLARATION_TYPES.includes(ast.type);

export type MiscAsts =
	| IdentAst
	| AttributeAst
	| FunctionArgListAst
	| FunctionArgExprListAst
	| StmtScopeAst
	| ImportAst;