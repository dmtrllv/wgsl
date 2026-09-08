import { Position, Span } from "@wgsl/core";
export declare const TokenType: {
    readonly Whitespace: "Whitespace";
    readonly Sep: "Separator";
    readonly Op: "Operator";
    readonly Ident: "Identifier";
    readonly Keyword: "Keyword";
    readonly StrLiteral: "String Literal";
    readonly CharLiteral: "Char Literal";
    readonly NumberLiteral: "Number Literal";
    readonly BoolLiteral: "Boolean Literal";
    readonly Comment: "Comment";
    readonly Unknown: "Unknown";
};
export type TokenType = keyof typeof TokenType;
export type Token = {
    readonly type: TokenType;
    readonly span: Span;
    readonly position: Position;
};
export declare const token: (type: TokenType, span: Span, position: Position) => Token;
export declare const isSeparator: (str: string) => boolean;
export declare const isOperator: (str: string) => boolean;
export declare const isWhitespace: (str: string) => boolean;
export declare const isKeyword: (str: string) => boolean;
export declare const isIdentifier: (str: string) => boolean;
