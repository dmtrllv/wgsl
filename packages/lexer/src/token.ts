import { Span } from "@wgsl/core";

const TOKEN_TYPES = [
	"Whitespace",
	"Sep",
	"Op",
	"Ident",
	"Keyword",
	"StrLiteral",
	"CharLiteral",
	"NumberLiteral",
	"BoolLiteral",
	"Comment",
] as const;

type TokenTypes = typeof TOKEN_TYPES;

export type TokenType<T extends TokenTypes[number] = TokenTypes[number]> = number & {
	readonly type: T;
};

export type Token = {
	readonly type: TokenType;
	readonly span: Span;
};