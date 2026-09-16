import { DeclarationAst } from "@wgsl/ast";
import { Scope, ScopeType } from "./scope.js";

export type SymbolType<Type extends string, T extends {} = {}> = {
	readonly type: Type;
	readonly name: string;
	readonly declaration: DeclarationAst;
} & T;

export type SymbolTypeWithScope<Type extends ScopeType> = SymbolType<Type, { readonly scope: Scope }>;

export type Symbol =
	| SymbolType<"Struct">
	| SymbolType<"Variable">
	| SymbolType<"Argument">
	| SymbolType<"TypeAlias">
	| SymbolType<"Const">
	| SymbolType<"Override">
	| ScopedSymbol;

export type ScopedSymbol =
	| SymbolTypeWithScope<"Function">
	| SymbolTypeWithScope<"RenderPass">
	| SymbolTypeWithScope<"BindingGroup">;