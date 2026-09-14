import { DiagnosticError, DiagnosticsContext, Position, spanWithSize } from "@wgsl/core";
import { isIdentifier, isKeyword, isOperator, isSeparator, isWhitespace, Sep, token, Token, TokenType, Whitespace, Unknown, Op, Comment, NumberLiteral, CharLiteral, ident, StrLiteral, Keyword } from "./token.js";
import { Iter } from "./iter.js";

export const parseSource = (path: string, source: string, ctx: DiagnosticsContext): Token[] | DiagnosticError => {
	return ctx.try(() => {
		const iter = new Iter(path, source, ctx);

		const cursor: Position = new Position();

		const tokens: Token[] = [];

		while (!iter.ended) {
			if (iter.isNext("//")) {
				tokens.push(parseComment(iter, cursor));
			} else if (iter.isNext("'")) {
				tokens.push(parseCharLiteral(iter, cursor));
			} else if (iter.isNext('"')) {
				tokens.push(parseStrLiteral(iter, cursor));
			} else if (iter.matchesNext(isWhitespace)) {
				tokens.push(createToken(Whitespace, iter.next(), cursor));
			} else if (iter.matchesNext(c => /[0-9]/.test(c))) {
				tokens.push(parseNumberLiteral(iter, cursor));
			} else if (iter.matchesNext(isSeparator)) {
				tokens.push(parseSep(iter, cursor));
			} else if (iter.matchesNext(isOperator)) {
				tokens.push(parseOp(iter, cursor));
			} else if (iter.matchesNext(c => /[a-zA-Z0-9_]/.test(c))) {
				const str = iter.collectWhile(c => /[a-zA-Z0-9_]/.test(c));
				if (isKeyword(str)) {
					tokens.push(parseKeyword(str, cursor));
				} else if (isIdentifier(str)) {
					tokens.push(createToken(ident(str), str, cursor));
				} else {
					tokens.push(createToken(Unknown, str, cursor));
				}
			} else {
				tokens.push(createToken(Unknown, iter.next(), cursor));
			}
		}

		return tokens;
	})
};

const parseSep = (iter: Iter, cursor: Position): Token => {
	const str = iter.next();
	const sep = Object.values(Sep).find(s => s.sep === str)!; // todo error check
	return createToken(sep, str, cursor);
};

const parseKeyword = (str: string, cursor: Position): Token => {
	const keyword = Object.values(Keyword).find(s => s.keyword === str)!; // todo error check
	return createToken(keyword, str, cursor);
};

const createToken = (type: TokenType, str: string, cursor: Position): Token => {
	if (type === Unknown)
		console.log(`Unknown token `, str, cursor);
	const pos = cursor.clone();

	const span = spanWithSize(cursor.offset, str.length);
	cursor.advance(str);
	return token(type, span, pos);
};

const parseComment = (iter: Iter, cursor: Position): Token => {
	const str = iter.collectWhile(c => c !== '\r' && c !== '\n');
	return createToken(Comment, str, cursor);
};

const parseOp = (iter: Iter, cursor: Position): Token => {
	const str = iter.collectWhile((c, buffer) => isOperator(buffer + c));
	const op = Object.values(Op).find(s => s.op === str)!; // todo error check
	return createToken(op, str, cursor);
};

const parseNumberLiteral = (iter: Iter, cursor: Position): Token => {
	let str = iter.next();
	let gotPoint = false;
	str += iter.collectWhile(c => {
		if (/[0-9]/.test(c))
			return true;
		if (c === '.') {
			if (gotPoint)
				return false;

			gotPoint = true;
			return true;
		}

		return false;
	});

	return createToken(NumberLiteral, str, cursor);
};

const parseCharLiteral = (iter: Iter, cursor: Position): Token => {
	let str = iter.next();
	let escape = false;
	str += iter.collectWhile(c => {
		if (escape) {
			escape = false;
			return true;
		}

		if (c === "'")
			return false;

		if (c === '\\') {
			escape = true;
		}

		return true;
	});
	str += iter.next();

	return createToken(CharLiteral, str, cursor);
};

const parseStrLiteral = (iter: Iter, cursor: Position): Token => {
	let str = iter.next();
	let escape = false;
	str += iter.collectWhile(c => {
		if (escape) {
			escape = false;
			return true;
		}

		if (c === '"')
			return false;

		if (c === '\\') {
			escape = true;
		}

		return true;
	});
	str += iter.next();

	return createToken(StrLiteral, str, cursor);
};