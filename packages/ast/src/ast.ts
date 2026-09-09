import { Span } from "@wgsl/core";
import { ModuleAst } from "./module.js";
import { ImportAst } from "./import.js";
import { StructAst, StructPropertyAst, TypeNameAst } from "./struct.js";
import { MetaAst } from "./meta.js";

export type AstType<Name extends string, Meta extends {} = {}> = {
	readonly type: Name;
	readonly span: Span;
} & Meta;

export type DeclarationAst = StructAst | FunctionAst | VarAst | GroupBlockAst;

export type FunctionAst = AstType<"Function", {}>;
export type VarAst = AstType<"Var", {}>;
export type GroupBlockAst = AstType<"GroupBlock", {}>;
export type RenderPassAst = AstType<"RenderPass", {}>;

export type Ast = 
| ModuleAst
| DeclarationAst 
| ImportAst
| MetaAst
| StructPropertyAst
| TypeNameAst;
