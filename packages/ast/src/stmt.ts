import { DiagnosticsContext } from "@wgsl/core";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { parseVarDeclaration, VarDeclAst } from "./var.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { ExprAst, parseExpr } from "./expr.js";

export const parseStatement = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<StmtAst>(iter, () => {
	const token = iter.peek();

	switch (token.type) {
		case Keyword.Var:
		case Keyword.Let:
		case Keyword.Const:
			return parseVarDeclaration(iter, ctx);
		case Keyword.Switch:
			return parseSwitch(iter, ctx);
		case Keyword.For:
			return parseFor(iter, ctx);
		case Keyword.Loop:
			return parseLoop(iter, ctx);
		case Keyword.While:
			return parseWhile(iter, ctx);
		case Keyword.Return:
			return parseReturn(iter, ctx);
		case Keyword.If:
			return parseIfElse(iter, ctx);

		default:
			const expr = parseExpr(iter, 0, ctx);
			const op = iter.nextIf(Op.Assign);
			if (op) {
				// todo other assignments lik +=, -= etc
				if (op.type.kind !== "Operator")
					throw new Error("?");
				const stmt: Omit<AssignStmtAst, "span"> = {
					type: "AssignStmt",
					left: expr,
					right: parseExpr(iter, 0, ctx),
					assignment: op.type
				};
				iter.expect(Sep.Semicolon);
				return stmt;
			} else {
				iter.expect(Sep.Semicolon);
				return {
					type: "ExprStmt",
					expr
				};
			}

	}
});


export const parseSwitch = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<StmtAst>(iter, () => {
	throw new Error("TODO!");
});

export const parseFor = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<ForStmtAst>(iter, () => {
	throw new Error("TODO!");
});

export const parseLoop = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<LoopStmtAst>(iter, () => {
	throw new Error("TODO!");
});

export const parseWhile = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<WhileStmtAst>(iter, () => {
	throw new Error("TODO!");
});

export const parseReturn = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<ReturnStmtAst>(iter, () => {
	iter.expect(Keyword.Return);
	const expr = parseExpr(iter, 0, ctx);
	iter.expect(Sep.Semicolon);
	return {
		type: "ReturnStmt",
		expr
	};
});

export const parseIfElse = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<IfElseStmtAst>(iter, () => {
	throw new Error("TODO!");
});

export type StmtAst =
	| VarDeclAst
	| ExprStmtAst
	| ReturnStmtAst
	| SwitchStmtAst
	| ForStmtAst
	| LoopStmtAst
	| WhileStmtAst
	| IfElseStmtAst
	| AssignStmtAst;

export type ExprStmtAst = AstType<"ExprStmt", {
	expr: ExprAst;
}>;

export type SwitchStmtAst = AstType<"SwitchStmt", {
	expr: ExprAst;
}>;

export type ForStmtAst = AstType<"ForStmt", {
	expr: ExprAst;
}>;

export type LoopStmtAst = AstType<"LoopStmt", {
	expr: ExprAst;
}>;

export type WhileStmtAst = AstType<"WhileStmt", {
	expr: ExprAst;
}>;
export type ReturnStmtAst = AstType<"ReturnStmt", {
	expr: ExprAst;
}>;

export type IfElseStmtAst = AstType<"ReturnStmt", {
	if: IfAst;
	elseIfs: ElseIfAst[];
	else: ElseAst[];
}>;

export type IfAst = AstType<"If", {
	expr: ExprAst;
}>;

export type ElseIfAst = AstType<"ElseIf", {
	expr: ExprAst;
}>;

export type ElseAst = AstType<"Else", {
	expr: ExprAst;
}>;

export type AssignStmtAst = AstType<"AssignStmt", {
	left: ExprAst;
	right: ExprAst;
	assignment: Op;
}>;