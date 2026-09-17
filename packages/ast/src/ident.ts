import { DiagnosticsContext, DiagnosticSeverity } from "@wgsl/core";
import { Iter } from "./iter.js";
import { AstType } from "./ast.js";
import { parseWithSpan } from "./parser.js";

export const parseIdent = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<IdentAst>(iter, () => {
	const token = iter.next();

	if (!token)
		return null;

	if (token.type.kind !== "Identifier") {
		const value = iter.getSource(token);
		ctx.add(DiagnosticSeverity.Error, `Expected an identifier but found ${token.type.kind}(${value}) at ${iter.sourcePath}:${token.position.line}:${token.position.columnOffset}!`);
		return null;
	}

	return {
		type: "Identifier",
		value: token.type.ident
	};
});

export type IdentAst = AstType<"Identifier", {
	value: string;
}>;