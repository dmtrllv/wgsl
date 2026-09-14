import { Position, Span } from "@wgsl/core";

export type TokenKind<Name extends string, Meta extends {} = {}> = {
	readonly kind: Name;
} & Meta;

export type Token = {
	readonly type: TokenType;
	readonly span: Span;
	readonly position: Position;
};

export type TokenType =
	| Whitespace
	| Op
	| Sep
	| Keyword
	| Ident
	| StrLiteral
	| CharLiteral
	| NumberLiteral
	| BoolLiteral
	| Comment
	| Unknown;

export type Whitespace = TokenKind<"Whitespace">;
export type Op = TokenKind<"Operator", { readonly op: string }>;
export type Sep = TokenKind<"Separator", { readonly sep: string }>;
export type Keyword = TokenKind<"Keyword", { readonly keyword: string }>;
export type Ident = TokenKind<"Identifier", { readonly ident: string }>;
export type StrLiteral = TokenKind<"StringLiteral">;
export type CharLiteral = TokenKind<"CharLiteral">;
export type NumberLiteral = TokenKind<"NumberLiteral">;
export type BoolLiteral = TokenKind<"BooleanLiteral">;
export type Comment = TokenKind<"Comment">;
export type Unknown = TokenKind<"Unknown">;

const kind = <Name extends string, Meta extends {} = {}>(name: Name, meta: Meta): TokenKind<Name, Meta> => ({ kind: name, ...meta });

const op = <const T extends string>(op: T) => kind<"Operator", { readonly op: T }>("Operator", { op });
const sep = <const T extends string>(sep: T) => kind<"Separator", { readonly sep: T }>("Separator", { sep });
const keyword = <const T extends string>(keyword: T) => kind<"Keyword", { readonly keyword: T }>("Keyword", { keyword });
export const ident = <const T extends string>(ident: T) => kind<"Identifier", { readonly ident: T }>("Identifier", { ident });

export const Unknown = kind("Unknown", {});
export const StrLiteral = kind("StringLiteral", {});
export const CharLiteral = kind("CharLiteral", {});
export const NumberLiteral = kind("NumberLiteral", {});
export const BoolLiteral = kind("BoolLiteral", {});
export const Comment = kind("Comment", {});

export const Op = {
	Add: op("+"),
	Sub: op("-"),
	Div: op("/"),
	Mul: op("*"),
	Mod: op("%"),
	AddAssign: op("+="),
	SubAssign: op("-="),
	DivAssign: op("/="),
	MulAssign: op("*="),
	ModAssign: op("%="),
	Assign: op("="),
	And: op("&&"),
	Or: op("||"),
	Lt: op("<"),
	Gt: op(">"),
	LtEq: op("<="),
	GtEq: op(">="),
	Eq: op("=="),
	Neq: op("!="),
	Not: op("!"),
	BitAnd: op("&"),
	BitOr: op("|"),
	BitXor: op("^"),
	BitNot: op("~"),
	At: op("@"),
	Question: op("?"),
	BitAndAssign: op("&="),
	BitOrAssign: op("|="),
	BitXorAssign: op("^="),
	Dot: op("."),
	Shl: op("<<"),
	Shr: op(">>"),
	ShlAssign: op("<<="),
	ShrAssign: op(">>="),
} as const;

export const token = (type: TokenType, span: Span, position: Position): Token => {
	return {
		type,
		span,
		position
	};
};

export const Sep = {
	Colon: sep(":"),
	Semicolon: sep(";"),
	LParen: sep("("),
	RParen: sep(")"),
	LBracket: sep("["),
	RBracket: sep("]"),
	LBrace: sep("{"),
	RBrace: sep("}"),
	Comma: sep(","),
} as const;

const WHITESPACES: readonly string[] = [
	"\r", "\n", "\t", " "
];

export const Whitespace = kind("Whitespace", {});

export const Keyword = {
	Alias: keyword("alias"),
	Array: keyword("array"),
	Atomic: keyword("atomic"),
	Bitcast: keyword("bitcast"),
	Break: keyword("break"),
	Case: keyword("case"),
	Const: keyword("const"),
	ConstAssert: keyword("const_assert"),
	Continue: keyword("continue"),
	Continuing: keyword("continuing"),
	Default: keyword("default"),
	Diagnostic: keyword("diagnostic"),
	Discard: keyword("discard"),
	Else: keyword("else"),
	Enable: keyword("enable"),
	Fn: keyword("fn"),
	For: keyword("for"),
	If: keyword("if"),
	Let: keyword("let"),
	Loop: keyword("loop"),
	Override: keyword("override"),
	Requires: keyword("requires"),
	Return: keyword("return"),
	Struct: keyword("struct"),
	Switch: keyword("switch"),
	Type: keyword("type"),
	Var: keyword("var"),
	While: keyword("while"),
	Asm: keyword("asm"),
	Do: keyword("do"),
	Enum: keyword("enum"),
	// reserved?
	Handle: keyword("handle"),
	Premerge: keyword("premerge"),
	Regardless: keyword("regardless"),
	Typedef: keyword("typedef"),
	Union: keyword("union"),
	Using: keyword("using"),
	// custom features/extensions
	Import: keyword("import"),
} as const;

export const isSeparator = (str: string) => !!Object.keys(Sep).find(k => Sep[k as keyof typeof Sep].sep === str);
export const isOperator = (str: string) => !!Object.keys(Op).find(k => Op[k as keyof typeof Op].op === str);
export const isKeyword = (str: string) => !!Object.keys(Keyword).find(k => Keyword[k as keyof typeof Keyword].keyword === str);

export const isWhitespace = (str: string) => WHITESPACES.includes(str);

export const isIdentifier = (str: string) => {
	if (str.length === 0)
		return false;
	if (!/[a-zA-Z_]/.test(str[0]!))
		return false;
	if (str.length === 1)
		return true;
	return /[a-zA-Z0-9_]/.test(str.slice(1));
};

export const tokenTypeToString = (token: TokenType) => {
	switch (token.kind) {
		case "Operator":
			return token.op;
		case "Separator":
			return token.sep;
		case "Keyword":
			return token.keyword;
		default:
			return token.kind;
	}
};