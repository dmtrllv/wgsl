import { DiagnosticError, DiagnosticsContext } from "@wgsl/core";
import { Token } from "./token.js";

export const parseSource = (_source: string, ctx: DiagnosticsContext): Token[] | DiagnosticError => {
	return ctx.try(() => {
		const tokens: Token[] = [];

		return tokens;
	})
};