import { DiagnosticError, DiagnosticsContext, Position, spanWithSize } from "@wgsl/core";
import { isIdentifier, isKeyword, isOperator, isSeparator, isWhitespace, Sep, token, Token, TokenType, Whitespace, Unknown, Op, Comment, NumberLiteral, CharLiteral, ident, StrLiteral, Keyword } from "./token.js";
import { Iter } from "./iter.js";

export const parseSource = (path: string, source: string, ctx: DiagnosticsContext): Token[] | DiagnosticError => {
	const iter = new Iter(path, source, ctx);

	const cursor: Position = new Position();

	const tokens: Token[] = [];

	while (!iter.ended) {
		if (iter.isNext("//")) {
			const token = parseComment(iter, cursor);
			if(!token)
				continue;
			tokens.push(token);
		} else if (iter.isNext("'")) {
			const token = parseCharLiteral(iter, cursor);
			if(!token)
				continue;
			tokens.push(token);
		} else if (iter.isNext('"')) {
			const token = parseStrLiteral(iter, cursor);
			if(!token)
				continue;
			tokens.push(token);
		} else if (iter.matchesNext(isWhitespace)) {
			const c = iter.next();
			if (!c)
				continue;
			const token = createToken(Whitespace, c, cursor);
			if(!token)
				continue;
			tokens.push(token);
		} else if (iter.matchesNext(c => /[0-9]/.test(c))) {
			const token = parseNumberLiteral(iter, cursor);
			if(!token)
				continue;
			tokens.push(token);
		} else if (iter.matchesNext(isSeparator)) {
			const token = parseSep(iter, cursor);
			if(!token)
				continue;
			tokens.push(token);
		} else if (iter.matchesNext(isOperator)) {
			const token = parseOp(iter, cursor);
			if(!token)
				continue;
			tokens.push(token);
		} else if (iter.matchesNext(c => /[a-zA-Z0-9_]/.test(c))) {
			const str = iter.collectWhile(c => /[a-zA-Z0-9_]/.test(c));
			if (isKeyword(str)) {
				const token = parseKeyword(str, cursor);
				if(!token)
					continue;
				tokens.push(token);
			} else if (isIdentifier(str)) {
				tokens.push(createToken(ident(str), str, cursor));
			} else {
				tokens.push(createToken(Unknown, str, cursor));
			}
		} else {
			const c = iter.next();
			if (!c)
				return tokens;

			tokens.push(createToken(Unknown, c, cursor));
		}
	}

	return tokens;
};

const parseSep = (iter: Iter, cursor: Position): Token | null => {
	const str = iter.next();
	if (!str)
		return null;
	const sep = Object.values(Sep).find(s => s.sep === str)!; // todo error check
	return createToken(sep, str, cursor);
};

const parseKeyword = (str: string, cursor: Position): Token | null => {
	const keyword = Object.values(Keyword).find(s => s.keyword === str)!; // todo error check
	return createToken(keyword, str, cursor);
};

const createToken = (type: TokenType, str: string, cursor: Position): Token => {
	if (type === Unknown)
		throw new Error(`Unknown token ` + str + " " + JSON.stringify(cursor));
	const pos = cursor.clone();

	const span = spanWithSize(cursor.offset, str.length);
	cursor.advance(str);
	return token(type, span, pos);
};

const parseComment = (iter: Iter, cursor: Position): Token | null => {
	const str = iter.collectWhile(c => c !== '\r' && c !== '\n');
	return createToken(Comment, str, cursor);
};

const parseOp = (iter: Iter, cursor: Position): Token | null => {
	const str = iter.collectWhile((c, buffer) => isOperator(buffer + c));
	const op = Object.values(Op).find(s => s.op === str)!; // todo error check
	return createToken(op, str, cursor);
};

const parseNumberLiteral = (iter: Iter, cursor: Position): Token | null => {
	let str = iter.next();
	if (!str)
		return null;

	const hex = str === "0" && iter.peek() === "x";
	const digit = hex ? /[0-9a-fA-F_]/ : /[0-9_]/;

	str += iter.collectWhile(c => digit.test(c));

	if (iter.peek() === ".") {
		str += iter.next();
		str += iter.collectWhile(c => digit.test(c));
	}

	const exp = hex ? /[pP]/ : /[eE]/;
	if (exp.test(iter.peek())) {
		str += iter.next();
		if (/[+-]/.test(iter.peek())) str += iter.next();
		str += iter.collectWhile(c => /[0-9_]/.test(c));
	}

	if (/[iu fh]/.test(iter.peek()))
		str += iter.next();

	return createToken(NumberLiteral, str, cursor);
};

const parseCharLiteral = (iter: Iter, cursor: Position): Token | null => {
	let str = iter.next();
	if (!str)
		return null;
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

const parseStrLiteral = (iter: Iter, cursor: Position): Token | null => {
	let str = iter.next();
	if (!str)
		return null;
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