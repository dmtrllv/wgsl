export type Span = {
    readonly start: number;
    readonly end: number;
};
export declare const spanWithSize: (start: number, size: number) => Span;
export declare const span: (start: number, end: number) => Span;
export declare class Position {
    line: number;
    column: number;
    offset: number;
    advance(string: string): void;
    clone(): Position;
}
export type Diagnostic = {
    readonly severity: DiagnosticSeverity;
    readonly message: string;
    readonly span?: Span | undefined;
    readonly source?: string | undefined;
};
export declare class DiagnosticsContext {
    private readonly _diagnostics;
    get diagnostics(): Diagnostic[];
    constructor();
    add(severity: DiagnosticSeverity, message: string, source?: string, span?: Span): void;
    try<T>(callback: () => T): T | DiagnosticError;
    tryAsync<T>(callback: () => Promise<T>): Promise<T | DiagnosticError>;
    assert(condition: boolean | (() => boolean), message: string): void;
}
export declare const isDiagnosticError: (value: any) => value is DiagnosticError;
export declare class DiagnosticError extends Error implements Diagnostic {
    readonly severity: DiagnosticSeverity;
    readonly source: string | undefined;
    readonly span: Span | undefined;
    constructor(severity: DiagnosticSeverity, message: string, source?: string, span?: Span);
}
export declare const DiagnosticSeverity: {
    readonly Error: "Error";
    readonly Warning: "Warning";
    readonly Info: "Info";
    readonly Assert: "Assert";
};
export type DiagnosticSeverity = keyof typeof DiagnosticSeverity;
