import { DiagnosticsContext, DiagnosticSeverity } from "@wgsl/core";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { parseVarDeclaration, VarDeclAst } from "./var.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { ExprAst, parseExpr } from "./expr.js";
import { parseScope, StmtScopeAst } from "./scope.js";

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


export const parseSwitch = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<SwitchStmtAst>(iter, () => {
	iter.expect(Keyword.Switch);
	iter.expect(Sep.LParen);
	const expr = parseExpr(iter, 0, ctx);
	iter.expect(Sep.RParen);
	iter.expect(Sep.LBrace);

	let cases: SwitchCaseAst[] = [];
	let defaultCase: StmtScopeAst | null = null;

	while (!iter.ended) {
		if (iter.nextIf(Sep.RBrace))
			break;
		if (iter.nextIf(Keyword.Default)) {
			if (defaultCase !== null) {
				const pos = iter.current().position;
				ctx.add(DiagnosticSeverity.Error, `Multiple default cases found at ${iter.sourcePath}:${pos.line}:${pos.columnOffset}`);
			} else {
				iter.expect(Sep.Colon);
				defaultCase = parseScope(iter, ctx);
			}
		} else {
			cases.push(parseSwitchCase(iter, ctx));
		}
	}

	return {
		type: "SwitchStmt",
		expr,
		cases,
		defaultCase
	}
});


export const parseSwitchCase = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<SwitchCaseAst>(iter, () => {
	const selectors: ExprAst[] = [];
	iter.expect(Keyword.Case);
	while (true) {
		selectors.push(parseExpr(iter, 0, ctx));
		if (!iter.nextIf(Sep.Comma)) {
			iter.expect(Sep.Colon);
			break;
		}
	}
	const body = parseScope(iter, ctx);
	return {
		type: "SwitchCase",
		selectors,
		body
	}
});

export const parseFor = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<ForStmtAst>(iter, () => {
	iter.expect(Keyword.For);
	iter.expect(Sep.LParen);

	let initializer: VarDeclAst | AssignStmtAst | null = null;
	if (!iter.nextIf(Sep.Semicolon)) {
		if (iter.isNext(Keyword.Var)) {
			initializer = parseVarDeclaration(iter, ctx);
		} else {
			initializer = parseWithSpan<AssignStmtAst>(iter, () => {
				const expr = parseExpr(iter, 0, ctx);
				const op = iter.next();
				if (op.type.kind !== "Operator")
					throw new Error("Expected an operator!");
				return {
					type: "AssignStmt",
					left: expr,
					right: parseExpr(iter, 0, ctx),
					assignment: op.type
				};
			});
			iter.expect(Sep.Semicolon);
		}
	}
	console.log({ initializer });

	let condition: ExprAst | null = null;
	const t = iter.nextIf(Sep.Semicolon);
	if (t === null) {
		console.log(iter.peek());
		condition = parseExpr(iter, 0, ctx);
		iter.expect(Sep.Semicolon);
	}
	console.log({ condition });

	let continuing: AssignStmtAst | null = null;
	if (!iter.nextIf(Sep.RParen)) {
		continuing = parseWithSpan<AssignStmtAst>(iter, () => {
			const expr = parseExpr(iter, 0, ctx);
			const op = iter.next();
			if (op.type.kind !== "Operator")
				throw new Error("Expected an operator!");
			return {
				type: "AssignStmt",
				left: expr,
				right: parseExpr(iter, 0, ctx),
				assignment: op.type
			};
		});
		iter.expect(Sep.RParen);
	}
	let body: StmtScopeAst = parseScope(iter, ctx);

	return {
		type: "ForStmt",
		initializer,
		condition,
		continuing,
		body,
	}
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
	| SwitchCaseAst
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
	cases: SwitchCaseAst[];
	defaultCase: StmtScopeAst | null;
}>;

export type SwitchCaseAst = AstType<"SwitchCase", {
	selectors: ExprAst[];
	body: StmtScopeAst;
}>;

export type ForStmtAst = AstType<"ForStmt", {
	initializer: VarDeclAst | AssignStmtAst | null;
	condition: ExprAst | null;
	continuing: AssignStmtAst | null;
	body: StmtScopeAst;
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