import { Position, Span } from "@wgsl/core";

export const TokenType = {
	Whitespace: "Whitespace",
	Sep: "Separator",
	Op: "Operator",
	Ident: "Identifier",
	Keyword: "Keyword",
	StrLiteral: "String Literal",
	CharLiteral: "Char Literal",
	NumberLiteral: "Number Literal",
	BoolLiteral: "Boolean Literal",
	Comment: "Comment",
	Unknown: "Unknown"
} as const;

export type TokenType = keyof typeof TokenType;

export type Token = {
	readonly type: TokenType;
	readonly span: Span;
	readonly position: Position;
};

export const token = (type: TokenType, span: Span, position: Position): Token => {
	return {
		type,
		span,
		position
	};
};

const SEPARATORS: readonly string[] = [
	':', ';', '(', ')', '[', ']', '{', '}', ','
];

const OPERATORS: readonly string[] = [
	'+', '-', '/', '*', '%',
	'+=', '-=', '/=', '*=', '%=',
	'=', '++', '--', '&&', '||',
	'<', '>', '<=', '>=', '==', '!=',
	'!', '&', '|', '^', '~', '@', '?',
	'&=', '|=', '^=', '~',
	'<<', '>>', '<<=', '>>=',
];

const WHITESPACES: readonly string[] = [
	'\r', '\n', '\t', ' '
];

const KEYWORDS: readonly string[] = [
	'alias', 'array', 'atomic', 'bitcast', 'break',
	'case', 'const', 'const_assert', 'continue', 'continuing',
	'default', 'diagnostic', 'discard', 'else', 'enable',
	'fn', 'for', 'if', 'let', 'loop',
	'override', 'requires', 'return', 'struct', 'switch',
	'type', 'var', 'while',
	
	// reserved
	'asm', 'bf16', 'do', 'enum', 'f16',
	'f64', 'handle', 'i8', 'i16', 'i64',
	'mat', 'premerge', 'regardless', 'sampler', 'sampler_comparison',
	'texture', 'typedef', 'u8', 'u16', 'u64',
	'union', 'using', 'vec', 'void',
];

export const isSeparator = (str: string) => SEPARATORS.includes(str);

export const isOperator = (str: string) => OPERATORS.includes(str);

export const isWhitespace = (str: string) => WHITESPACES.includes(str);

export const isKeyword = (str: string) => KEYWORDS.includes(str);

export const isIdentifier = (str: string) => {
	if(str.length === 0)
		return false;
	if(!/[a-zA-Z_]/.test(str[0]!))
		return false;
	if(str.length === 1)
		return true;
	return /[a-zA-Z0-9_]/.test(str.slice(1));
};