import { Ast, DeclarationAst, isValid, VarDeclarationAst } from "@wgsl/ast";
import { ScopedSymbol, Symbol, VariableSymbol } from "./symbol.js";
import { Mutable } from "@wgsl/utils";
import { SymbolTable } from "./table.js";

export class Scope {
	public readonly type: string;
	public readonly parent: Scope | null;
	public readonly symbols = new Map<string, Symbol>();
	public readonly blockScopes: Scope[] = [];
	public readonly table: SymbolTable;

	public constructor(type: ScopeType, parent: Scope | null, symbolTable: SymbolTable) {
		this.type = type;
		this.parent = parent;
		this.table = symbolTable;
	}

	public addVariable(ast: VarDeclarationAst) {
		if(!isValid(ast) || !isValid(ast.name))
			return;

		const name = ast.name.value;

		if (this.symbols.has(name)) {
			throw new Error("duplicate name " + name + " found!");
		}

		const props: Mutable<VariableSymbol> = {
			name,
			type: "Variable",
			kind: "var",
			declaration: ast
		};

		switch (ast.type) {
			case "BindingVar":
				props.accessMode = ast.accessMode;
				props.addressSpace = ast.addressSpace;
				break;
			case "ConstDecl":
				props.kind = "const";
				break;
			case "LetDecl":
				props.kind = "let";
				break;
			case "OverrideDecl":
				props.kind = "override";
				break;
		}

		this.symbols.set(name, props);
	}

	public add<T extends Exclude<Symbol, ScopedSymbol | VariableSymbol>>(type: T["type"], ast: DeclarationAst) {
		if(!isValid(ast) || !isValid(ast.name))
			return;

		const name = ast.name.value;
		if (this.symbols.has(name)) {
			throw new Error("duplicate name " + name + " found!");
		}
		this.symbols.set(name, { type, name, declaration: ast });
	}

	public addScoped<T extends ScopedSymbol>(type: T["type"], ast: DeclarationAst) {
		if(!isValid(ast) || !isValid(ast.name))
			throw new Error(`Cannot add scope for invalid ast!`);
		
		const name = ast.name.value;
		if (this.symbols.has(name)) {
			throw new Error("duplicate name " + name + " found!");
		}
		const scope = new Scope(type, this, this.table);
		this.symbols.set(name, { type, name, declaration: ast, scope } as ScopedSymbol);
		this.table.scopes.set(ast, scope);
		return scope;
	}

	public addBlockScope(ast: Ast) {
		const scope = new Scope("Block", this, this.table);
		this.blockScopes.push(scope);
		this.table.scopes.set(ast, scope);
		return scope;
	}

	public toJSON(): any {
		const symbols: Record<string, any> = {};
		for (const [k, v] of this.symbols) {
			symbols[k] = JSON.parse(JSON.stringify(v));
		}
		return {
			type: this.type,
			scopes: this.blockScopes,
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
	| "Block"