import { DiagnosticError, DiagnosticSeverity } from "@wgsl/core";
import { Iter } from "./iter.js";

export const parseIdent = (iter: Iter): string => {
	const token = iter.next();
	if(token.type.kind !== "Identifier") {
		throw new DiagnosticError(DiagnosticSeverity.Error, "expected an identifier");
	}
	return token.type.ident;
}