import { DiagnosticsContext } from "@wgsl/core";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { Sep } from "@wgsl/lexer";
import { parseStatement, StmtAst } from "./stmt.js";

export const parseScope = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<StmtScopeAst>(iter, () => {
	iter.expect(Sep.LBrace);
	const statements: StmtAst[] = [];
	while (!iter.ended) {
		if (iter.nextIf(Sep.RBrace))
			break;
		statements.push(parseStatement(iter, ctx));
	}
	
	return {
		type: "StatementScope",
		statements: []
	}
});

export type StmtScopeAst = AstType<"StatementScope", {
	statements: StmtAst[];
}>;