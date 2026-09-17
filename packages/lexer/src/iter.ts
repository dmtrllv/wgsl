import { DiagnosticsContext, DiagnosticSeverity, span } from "@wgsl/core";

export class Iter {
	//private readonly _path: string;
	private readonly _source: string;
	private readonly _ctx: DiagnosticsContext;

	private _nextPtr: number = 0;

	public get ptr(): number {
		return this._nextPtr;
	}

	public get ended(): boolean {
		return this._nextPtr >= this._source.length;
	}

	public constructor(_path: string, source: string, ctx: DiagnosticsContext) {
		//this._path = path;
		this._source = source;
		this._ctx = ctx;
	}

	public skip() {
		this._nextPtr++;
	}

	public skipWhile(match: (c: any) => boolean) {
		while (!this.ended) {
			if (!match(this._source[this._nextPtr])) {
				return;
			}
			this.skip();
		}
	}

	public next(): string | null {
		if (this.ended) {
			this._ctx.add(DiagnosticSeverity.Error, `End of file reached!`, this._source, span(this._nextPtr, this._nextPtr));
			return null;
		}
		return this._source[this._nextPtr++]!;
	}

	public collectWhile(match: (c: string, buffer: string) => boolean): string {
		let buffer = "";
		while (!this.ended) {
			if (!match(this.peek(), buffer))
				break;

			buffer += this.next();
		}
		return buffer;
	}

	public isNext(str: string) {
		return str === this._source.slice(this._nextPtr, this._nextPtr + str.length);
	}

	public matchesNext(match: (str: string) => boolean): boolean {
		return match(this.peek());
	}

	public peek(): string {
		if (this.ended) {
			this._ctx.add(DiagnosticSeverity.Error, `End of file reached!`, this._source, span(this._nextPtr, this._nextPtr));
			return "";
		}
		return this._source[this._nextPtr]!;
	}
}