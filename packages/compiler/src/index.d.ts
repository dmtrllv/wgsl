import { DiagnosticError, DiagnosticsContext } from "@wgsl/core";
export declare class Compiler {
    readonly rootDir: string;
    readonly sources: Map<string, string>;
    readonly tokens: Map<string, string>;
    constructor(rootDir: string);
    getSource(path: string, ctx: DiagnosticsContext): Promise<string | DiagnosticError>;
    getTokens(path: string, ctx: DiagnosticsContext): Promise<import("@wgsl/lexer").Token[] | DiagnosticError>;
    compile(path: string, ctx: DiagnosticsContext): Promise<import("@wgsl/lexer").Token[] | DiagnosticError>;
}
