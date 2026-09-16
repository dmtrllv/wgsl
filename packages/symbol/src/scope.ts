import { DeclarationAst } from "@wgsl/ast";
import { ScopedSymbol, Symbol } from "./symbol.js";

export class Scope {
	public readonly type: string;
	public readonly symbols = new Map<string, Symbol>();

	public constructor(type: ScopeType) {
		this.type = type;
	}

	public add<T extends Exclude<Symbol, ScopedSymbol>>(type: T["type"], ast: DeclarationAst) {
		const name = ast.name.value;
		if (this.symbols.has(name)) {
			throw new Error("duplicate name " + name + " found!");
		}
		this.symbols.set(name, { type, name, declaration: ast });
	}

	public addScoped<T extends ScopedSymbol>(type: T["type"], ast: DeclarationAst) {
		const name = ast.name.value;
		if (this.symbols.has(name)) {
			throw new Error("duplicate name " + name + " found!");
		}
		const scope = new Scope(type);
		this.symbols.set(name, { type, name, declaration: ast, scope } as ScopedSymbol);
		return scope;
	}

	public toJSON() {
		const symbols: Record<string, any>= {};
		for(const [k, v] of this.symbols) {
			symbols[k] = JSON.parse(JSON.stringify(v));
		}
		return {
			type: this.type,
			symbols
		};
	}
}

export type ScopeType =
	| "Module"
	| "Struct"
	| "RenderPass"
	| "BindingGroup"
	| "Function"