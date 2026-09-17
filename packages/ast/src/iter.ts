import { DiagnosticsContext, DiagnosticSeverity, span } from "@wgsl/core";
import { Comment, Token, TokenType, tokenTypeToString, Whitespace } from "@wgsl/lexer";

export class Iter {
	public readonly sourcePath: string;

	private readonly _source: string;
	private readonly _tokens: Token[];
	private readonly _ctx: DiagnosticsContext;

	private _nextPtr: number = 0;

	public get ptr(): number {
		return this._nextPtr;
	}

	public get ended(): boolean {
		this.skipUnwanted();
		return this._nextPtr >= this._tokens.length;
	}

	public constructor(path: string, source: string, tokens: Token[], ctx: DiagnosticsContext) {
		this.sourcePath = path;
		this._source = source;
		this._tokens = tokens;
		this._ctx = ctx;
	}

	private skipUnwanted() {
		while (this._tokens[this._nextPtr]?.type === Whitespace || this._tokens[this._nextPtr]?.type === Comment) {
			this._nextPtr++;
		}
	}

	public skip() {
		this.skipUnwanted();
		this._nextPtr++;
	}

	public current(): Token | null {
		if (this._nextPtr === 0) {
			this._ctx.add(DiagnosticSeverity.Error, `Iterator not yet started!`, this._source, span(this._nextPtr, this._nextPtr));
			return null;
		}
		return this._tokens[this._nextPtr - 1]!;
	}

	public peek(skip: number = 0): Token | null {
		this.skipUnwanted();
		if (this.ended) {
			this._ctx.add(DiagnosticSeverity.Error, `End of tokens reached!`, this._source, span(this._nextPtr, this._nextPtr));
			return null;
		}
		return this._tokens[this._nextPtr + skip]!;
	}

	public next(): Token | null {
		if (this.ended) {
			this._ctx.add(DiagnosticSeverity.Error, `End of tokens reached!`, this._source, span(this._nextPtr, this._nextPtr));
			return null;
		}
		return this._tokens[this._nextPtr++]!;
	}

	public getSource(token: Token) {
		return this._source.slice(token.span.start, token.span.end);
	}

	public expect(type: TokenType) {
		const token = this.next();
		if (token && (token.type !== type)) {
			const tokenValue = tokenTypeToString(type);
			const value = this.getSource(token);
			this._ctx.add(DiagnosticSeverity.Error, `Expected ${tokenValue} but found ${token.type.kind}(${value}) at ${this.sourcePath}:${token.position.line}:${token.position.column}!`);
		}
		return token;
	}

	public isNext(type: TokenType) {
		return this.peek()?.type === type;
	}

	public nextIf(type: TokenType): Token | null {
		if (this.peek()?.type === type) {
			return this.next();
		}
		return null;
	}
}