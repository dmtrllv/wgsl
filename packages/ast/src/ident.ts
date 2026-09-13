import { DiagnosticError, DiagnosticSeverity } from "@wgsl/core";
import { Iter } from "./iter.js";
import { AstType } from "./ast.js";
import { parseWithSpan } from "./parser.js";

export const parseIdent = (iter: Iter) => parseWithSpan<IdentAst>(iter, () => {
	const token = iter.next();
	
	if(token.type.kind !== "Identifier") {
		throw new DiagnosticError(DiagnosticSeverity.Error, `expected an identifier but got ${iter.getSource(token)} at ${token.position.line}:${token.position.column}`);
	}

	return {
		type: "Identifier",
		value: token.type.ident
	};
});

export type IdentAst = AstType<"Identifier", {
	value: string;
}>;