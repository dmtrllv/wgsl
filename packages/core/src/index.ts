export type Span = {
	readonly start: number;
	readonly end: number;
};

export const spanWithSize = (start: number, size: number): Span => span(start, start + size);

export const span = (start: number, end: number): Span => {
	return {
		start,
		end
	};
};

export class Position {
	public line: number = 1;
	public column: number = 1;
	public offset: number = 0;
	public columnOffset: number = 1;

	public advance(string: string) {
		for (const c of string) {
			this.offset++;

			switch (c) {
				case '\r':
					break;

				case '\n':
					this.line++;
					this.columnOffset = 1;
					this.column = 1;
					break;

				case '\t':
					this.column += 4 - ((this.column - 1) % 4);
					this.columnOffset++;
					break;

				default:
					this.column++;
					this.columnOffset++;
					break;
			}
		}
	}

	public clone(): Position {
		return Object.assign(new Position(), this);
	}
}

export type Diagnostic = {
	readonly severity: DiagnosticSeverity;
	readonly message: string;
	readonly span?: Span | undefined;
	readonly source?: string | undefined;
};

export class DiagnosticsContext {
	private readonly _diagnostics: Diagnostic[] = [];

	public get diagnostics(): Diagnostic[] {
		return [...this._diagnostics];
	}

	public constructor() { }

	public add(severity: DiagnosticSeverity, message: string, source?: string, span?: Span) {
		this._diagnostics.push({
			severity,
			message,
			source,
			span
		});
	}

	public try<T>(callback: () => T): T | DiagnosticError {
		try {
			return callback();
		} catch (e) {
			if (e instanceof DiagnosticError) {
				this._diagnostics.push(e);
				return e;
			} else {
				throw e;
			}
		}
	}

	public async tryAsync<T>(callback: () => Promise<T>): Promise<T | DiagnosticError> {
		try {
			return await callback();
		} catch (e) {
			if (e instanceof DiagnosticError) {
				this._diagnostics.push(e);
				return e;
			} else {
				throw e;
			}
		}
	}

	public assert(condition: (() => boolean), message: string, source?: string | undefined, span?: Span | undefined) {
		if (!condition()) {
			throw new DiagnosticError(DiagnosticSeverity.Assert, message, source, span);
		}
	}

	public log() {
		this.diagnostics.forEach(d => {
			if (d instanceof DiagnosticError) {
				console.log(d.stack);
			} else {
				console.log(d.severity + ':', d.message);
			}
		});
	}

	public hasErrors(): boolean {
		return !!this.diagnostics.find(d => d.severity === DiagnosticSeverity.Error);
	}
}

export const isDiagnosticError = (value: any): value is DiagnosticError => value instanceof DiagnosticError;

const isDev = process.env["NODE_ENV"] === "development";

export class DiagnosticError extends Error implements Diagnostic {
	public readonly severity: DiagnosticSeverity;
	public readonly source: string | undefined;
	public readonly span: Span | undefined;

	public constructor(severity: DiagnosticSeverity, message: string, source?: string, span?: Span) {
		super();
		this.severity = severity;
		this.source = source;
		this.span = span;
		const stack = isDev ? (this.stack || "").split("\n").slice(1).join("\n") : "";
		this.stack = `${this.constructor.name}: ${message} \n${stack}`;
		this.message = message;
	}
}

export const DiagnosticSeverity = {
	Error: "Error",
	Warning: "Warning",
	Info: "Info",
	Assert: "Assert"
} as const;

export type DiagnosticSeverity = keyof typeof DiagnosticSeverity;