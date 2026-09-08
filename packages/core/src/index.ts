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

	public advance(string: string) {
		for (const c of string) {
			this.offset += 1;

			switch (c) {
				case '\n':
					this.column = 1;
					this.line += 1;
					break;
				case '\t':
					this.column += (this.column - (this.column % 4));
					break;
				default:
					this.column += 1;
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

	public assert(condition: boolean | (() => boolean), message: string) {
		if(!condition) {
			throw new DiagnosticError(DiagnosticSeverity.Assert, message);
		}
	}
}

export const isDiagnosticError = (value: any): value is DiagnosticError => value instanceof DiagnosticError;

export class DiagnosticError extends Error implements Diagnostic {
	public readonly severity: DiagnosticSeverity;
	public readonly source: string | undefined;
	public readonly span: Span | undefined;

	public constructor(severity: DiagnosticSeverity, message: string, source?: string, span?: Span) {
		super(message);
		this.severity = severity;
		this.source = source;
		this.span = span;
	}
}

export const DiagnosticSeverity = {
	Error: "Error",
	Warning: "Warning",
	Info: "Info",
	Assert: "Assert"
} as const;

export type DiagnosticSeverity = keyof typeof DiagnosticSeverity;