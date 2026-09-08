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
};
export const token = (type, span, position) => {
    return {
        type,
        span,
        position
    };
};
const SEPARATORS = [
    ':', ';', '(', ')', '[', ']', '{', '}', ','
];
const OPERATORS = [
    '+', '-', '/', '*', '%',
    '+=', '-=', '/=', '*=', '%=',
    '=', '++', '--', '&&', '||',
    '<', '>', '<=', '>=', '==', '!=',
    '!', '&', '|', '^', '~', '@', '?',
    '&=', '|=', '^=', '~',
    '<<', '>>', '<<=', '>>=',
];
const WHITESPACES = [
    '\r', '\n', '\t', ' '
];
const KEYWORDS = [
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
export const isSeparator = (str) => SEPARATORS.includes(str);
export const isOperator = (str) => OPERATORS.includes(str);
export const isWhitespace = (str) => WHITESPACES.includes(str);
export const isKeyword = (str) => KEYWORDS.includes(str);
export const isIdentifier = (str) => {
    if (str.length === 0)
        return false;
    if (!/[a-zA-Z_]/.test(str[0]))
        return false;
    if (str.length === 1)
        return true;
    return /[a-zA-Z0-9_]/.test(str.slice(1));
};
//# sourceMappingURL=token.js.map