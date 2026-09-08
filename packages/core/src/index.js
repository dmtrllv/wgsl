export const spanWithSize = (start, size) => span(start, start + size);
export const span = (start, end) => {
    return {
        start,
        end
    };
};
export class Position {
    line = 1;
    column = 1;
    offset = 0;
    advance(string) {
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
    clone() {
        return Object.assign(new Position(), this);
    }
}
export class DiagnosticsContext {
    _diagnostics = [];
    get diagnostics() {
        return [...this._diagnostics];
    }
    constructor() { }
    add(severity, message, source, span) {
        this._diagnostics.push({
            severity,
            message,
            source,
            span
        });
    }
    try(callback) {
        try {
            return callback();
        }
        catch (e) {
            if (e instanceof DiagnosticError) {
                this._diagnostics.push(e);
                return e;
            }
            else {
                throw e;
            }
        }
    }
    async tryAsync(callback) {
        try {
            return await callback();
        }
        catch (e) {
            if (e instanceof DiagnosticError) {
                this._diagnostics.push(e);
                return e;
            }
            else {
                throw e;
            }
        }
    }
    assert(condition, message) {
        if (!condition) {
            throw new DiagnosticError(DiagnosticSeverity.Assert, message);
        }
    }
}
export const isDiagnosticError = (value) => value instanceof DiagnosticError;
export class DiagnosticError extends Error {
    severity;
    source;
    span;
    constructor(severity, message, source, span) {
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
};
//# sourceMappingURL=index.js.map