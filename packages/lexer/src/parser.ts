import { DiagnosticError, DiagnosticsContext, Position, spanWithSize } from "@wgsl/core";
import { isIdentifier, isKeyword, isOperator, isSeparator, isWhitespace, token, Token, TokenType } from "./token.js";
import { Iter } from "./iter.js";

export const parseSource = (path: string, source: string, ctx: DiagnosticsContext): Token[] | DiagnosticError => {
	return ctx.try(() => {
		const iter = new Iter(path, source, ctx);

		const cursor: Position = new Position();

		const tokens: Token[] = [];

		while (!iter.ended) {
			if (iter.isNext("//")) {
				tokens.push(parseComment(iter, cursor));
				continue;
			} else if (iter.isNext("'")) {
				tokens.push(parseStrLiteral(iter, cursor));
				continue;
			} else if (iter.isNext('"')) {
				tokens.push(parseCharLiteral(iter, cursor));
				continue;
			} else if (iter.matchesNext(isWhitespace)) {
				tokens.push(parseToken("Whitespace", iter.next(), cursor));
			} else if (iter.matchesNext(c => /[0-9]/.test(c))) {
				tokens.push(parseNumberLiteral(iter, cursor));
			} else if (iter.matchesNext(isSeparator)) {
				tokens.push(parseToken("Sep", iter.next(), cursor));
			} else if (iter.matchesNext(isOperator)) {
				tokens.push(parseOp(iter, cursor));
			} else if (iter.matchesNext(c => /[a-zA-Z_]/.test(c))) {
				const str = iter.collectWhile(c => /[a-zA-Z_]/.test(c));
				if (isKeyword(str)) {
					tokens.push(parseToken("Keyword", str, cursor));
				} else if (isIdentifier(str)) {
					tokens.push(parseToken("Ident", str, cursor));
				} else {
					tokens.push(parseToken("Unknown", str, cursor));
				}
			} else {
				tokens.push(parseToken("Unknown", iter.next(), cursor));
			}
		}

		return tokens;
	})
};

const parseToken = (type: TokenType, str: string, cursor: Position): Token => {
	if (type === "Unknown")
		console.log(`Unknown token `, str, cursor);

	const span = spanWithSize(cursor.offset, str.length);
	const pos = cursor.clone();
	cursor.advance(str);
	return token(type, span, pos);
};

const parseComment = (iter: Iter, cursor: Position): Token => {
	const str = iter.collectWhile(c => c !== '\r' && c !== '\n');
	return parseToken("Comment", str, cursor);
};

const parseOp = (iter: Iter, cursor: Position): Token => {
	const str = iter.collectWhile((c, buffer) => isOperator(buffer + c));
	return parseToken("Op", str, cursor);
};

const parseNumberLiteral = (iter: Iter, cursor: Position): Token => {
	let str = iter.next();
	let gotPoint = false;
	str += iter.collectWhile(c => {
		if (/0-9/.test(c))
			return true;
		if (c === '.') {
			if (gotPoint)
				return false;

			gotPoint = true;
			return true;
		}

		return false;
	});

	return parseToken("NumberLiteral", str, cursor);
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

	return parseToken("CharLiteral", str, cursor);
};

const parseStrLiteral = (iter: Iter, cursor: Position): Token => {
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

	return parseToken("StrLiteral", str, cursor);
};