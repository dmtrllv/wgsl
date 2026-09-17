import { DeclarationAst, BindingAccessMode, BindingAddressSpace } from "@wgsl/ast";
import { Scope, ScopeType } from "./scope.js";

export type SymbolType<Type extends string, T extends {} = {}> = {
	readonly type: Type;
	readonly name: string;
	readonly declaration: DeclarationAst;
} & T;

export type SymbolTypeWithScope<Type extends ScopeType> = SymbolType<Type, { readonly scope: Scope }>;

export type Symbol =
	| SymbolType<"Argument">
	| SymbolType<"TypeAlias">
	| SymbolType<"Const">
	| SymbolType<"Override">
	| SymbolType<"Property">
	| SymbolType<"RenderPass">
	| VariableSymbol
	| ScopedSymbol;

export type ScopedSymbol =
	| SymbolTypeWithScope<"Struct">
	| SymbolTypeWithScope<"Function">
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