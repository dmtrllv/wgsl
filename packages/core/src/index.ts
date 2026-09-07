export type Span = {
	readonly start: number;
	readonly end: number;
}

export type Position = {
	readonly offset: number;
	readonly line: number;
	readonly column: number;
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
	Info: "Info"
} as const;

export type DiagnosticSeverity = keyof typeof DiagnosticSeverity;