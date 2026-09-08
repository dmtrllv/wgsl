import { DiagnosticError, DiagnosticsContext } from "@wgsl/core";
import { Token } from "./token.js";
export declare const parseSource: (path: string, source: string, ctx: DiagnosticsContext) => Token[] | DiagnosticError;
