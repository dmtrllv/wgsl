import { DeclarationAst, BindingAccessMode, BindingAddressSpace } from "@wgsl/ast";
import { Scope, ScopeType } from "./scope.js";

export type SymbolType<Type extends string, T extends {} = {}> = {
	readonly type: Type;
	readonly name: string;
	readonly declaration: DeclarationAst;
} & T;

export type SymbolTypeWithScope<Type extends ScopeType> = SymbolType<Type, { readonly scope: Scope }>;

export type Symbol =
	| SymbolType<"Struct">
	| SymbolType<"Argument">
	| SymbolType<"TypeAlias">
	| SymbolType<"Const">
	| SymbolType<"Override">
	| VariableSymbol
	| ScopedSymbol;

export type ScopedSymbol =
	| SymbolTypeWithScope<"Function">
	| SymbolTypeWithScope<"RenderPass">
	| SymbolTypeWithScope<"BindingGroup">;

export type VariableKind =
	| "let"
	| "var"
	| "const"
	| "override";

export type VariableSymbol = SymbolType<"Variable", {
	readonly kind: VariableKind;
	readonly addressSpace?: BindingAddressSpace | null;
	readonly accessMode?: BindingAccessMode | null;
}>