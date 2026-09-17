import { DiagnosticsContext, DiagnosticSeverity } from "@wgsl/core";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { ConstDeclAst, LetDeclAst, parseConstDeclaration, parseLetDeclaration, parseVarDeclaration, VarDeclAst } from "./var.js";
import { Keyword, Sep } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { ExprAst, parseExpr } from "./expr.js";
import { parseScope, StmtScopeAst } from "./scope.js";

export const parseStatement = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<StmtAst>(iter, () => {
	const token = iter.peek();

	if (!token)
		return null;

	switch (token.type) {
		case Keyword.Var:
			return parseVarDeclaration(iter, ctx);
		case Keyword.Let:
			return parseLetDeclaration(iter, ctx);
		case Keyword.Const:
			return parseConstDeclaration(iter, [], ctx);
		case Keyword.Switch:
			return parseSwitch(iter, ctx);
		case Keyword.For:
			return parseFor(iter, ctx);
		case Keyword.Loop:
			return parseLoop(iter, ctx);
		case Keyword.Continuing:
			return parseContinuing(iter, ctx);
		case Keyword.Return:
			return parseReturn(iter, ctx);
		case Keyword.Break:
			return parseBreak(iter, ctx);
		case Keyword.If:
			return parseIfElse(iter, ctx);
		case Keyword.Continue:
			return parseContinue(iter, ctx);
		case Keyword.Discard:
			return parseDiscard(iter, ctx);

		default:
			const expr = parseExpr(iter, 0, ctx);
			iter.expect(Sep.Semicolon);
			return {
				type: "ExprStmt",
				expr
			};
		//}
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
				const pos = iter.current()?.position;
				ctx.add(DiagnosticSeverity.Error, `Multiple default cases found at ${iter.sourcePath}:${pos?.line}:${pos?.columnOffset}`);
			} else {
				iter.expect(Sep.Colon);
				defaultCase = parseScope(iter, ctx);
			}
		} else {
			const s = parseSwitchCase(iter, ctx);
			if (s)
				cases.push(s);
		}
	}

	return {
		type: "SwitchStmt",
		expr,
		cases,
		defaultCase
	};
});

export const parseBreak = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<BreakStmtAst>(iter, () => {
	iter.expect(Keyword.Break);
	iter.expect(Sep.Semicolon);
	return {
		type: "BreakStmt"
	};
});


export const parseContinue = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<ContinueStmtAst>(iter, () => {
	iter.expect(Keyword.Continue);
	iter.expect(Sep.Semicolon);
	return {
		type: "ContinueStmt"
	};
});

export const parseDiscard = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<DiscardStmtAst>(iter, () => {
	iter.expect(Keyword.Discard);
	iter.expect(Sep.Semicolon);
	return {
		type: "DiscardStmt"
	};
});

export const parseSwitchCase = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<SwitchCaseAst>(iter, () => {
	const selectors: ExprAst[] = [];
	iter.expect(Keyword.Case);
	while (true) {
		const expr = parseExpr(iter, 0, ctx);
		if (expr)
			selectors.push(expr);
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
	};
});

export const parseFor = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<ForStmtAst>(iter, () => {
	iter.expect(Keyword.For);
	iter.expect(Sep.LParen);

	let initializer: VarDeclAst | ExprAst | null = null;
	if (!iter.nextIf(Sep.Semicolon)) {
		if (iter.isNext(Keyword.Var)) {
			initializer = parseVarDeclaration(iter, ctx);
		} else {
			initializer = parseExpr(iter, 0, ctx);
			iter.expect(Sep.Semicolon);
		}
	}

	let condition: ExprAst | null = null;
	const t = iter.nextIf(Sep.Semicolon);
	if (t === null) {
		condition = parseExpr(iter, 0, ctx);
		iter.expect(Sep.Semicolon);
	}

	let continuing: ExprAst | null = null;
	if (!iter.nextIf(Sep.RParen)) {
		continuing = parseExpr(iter, 0, ctx);
		iter.expect(Sep.RParen);
	}

	const body = parseScope(iter, ctx);

	return {
		type: "ForStmt",
		initializer,
		condition,
		continuing,
		body,
	};
});

export const parseLoop = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<LoopStmtAst>(iter, () => {
	iter.expect(Keyword.Loop);
	return {
		type: "LoopStmt",
		body: parseScope(iter, ctx)
	};
});

export const parseContinuing = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<ContinuingStmtAst>(iter, () => {
	iter.expect(Keyword.Continuing);
	return {
		type: "ContinuingStmt",
		body: parseScope(iter, ctx)
	};
});

export const parseReturn = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<ReturnStmtAst>(iter, () => {
	iter.expect(Keyword.Return);
	let expr: ExprAst | null = null;
	if (!iter.nextIf(Sep.Semicolon)) {
		expr = parseExpr(iter, 0, ctx);
		iter.expect(Sep.Semicolon);

	}
	return {
		type: "ReturnStmt",
		expr
	};
});

export const parseIfElse = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<IfElseStmtAst>(iter, () => {
	const ifAst = parseWithSpan<IfAst>(iter, () => {
		iter.expect(Keyword.If);
		iter.expect(Sep.LParen);
		const expr = parseExpr(iter, 0, ctx);
		iter.expect(Sep.RParen);
		return {
			type: "If",
			expr,
			body: parseScope(iter, ctx),
		}
	});

	const elseIfs: ElseIfAst[] = [];

	let elseAst: ElseAst | null = null;

	while (!iter.ended) {
		if (!iter.isNext(Keyword.Else))
			break;

		const ifElse = parseWithSpan(iter, () => {
			iter.expect(Keyword.Else);
			if (iter.nextIf(Keyword.If)) {
				iter.expect(Sep.LParen);
				const expr = parseExpr(iter, 0, ctx);
				iter.expect(Sep.RParen);
				return {
					type: "ElseIf",
					expr,
					body: parseScope(iter, ctx)
				}
			}

			return {
				type: "Else",
				body: parseScope(iter, ctx)
			}
		});

		if (!ifElse || ifElse.type === "Else") {
			break;
		}
	}

	return {
		type: "IfElse",
		if: ifAst,
		elseIfs,
		else: elseAst
	}
});

export type StmtAst =
	| VarDeclAst
	| LetDeclAst
	| ConstDeclAst
	| ExprStmtAst
	| ReturnStmtAst
	| SwitchStmtAst
	| SwitchCaseAst
	| ForStmtAst
	| LoopStmtAst
	| IfElseStmtAst
	| ContinuingStmtAst
	| ContinueStmtAst
	| DiscardStmtAst
	| BreakStmtAst
	| IfAst
	| ElseIfAst
	| ElseAst;

export type ExprStmtAst = AstType<"ExprStmt", {
	expr: ExprAst;
}>;

export type BreakStmtAst = AstType<"BreakStmt">;

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
	initializer: VarDeclAst | ExprAst | null;
	condition: ExprAst | null;
	continuing: ExprAst | null;
	body: StmtScopeAst | null;
}>;

export type LoopStmtAst = AstType<"LoopStmt", {
	body: StmtScopeAst
}>;

export type ContinuingStmtAst = AstType<"ContinuingStmt", {
	body: StmtScopeAst
}>;

export type ReturnStmtAst = AstType<"ReturnStmt", {
	expr: ExprAst | null;
}>;

export type IfElseStmtAst = AstType<"IfElse", {
	if: IfAst;
	elseIfs: ElseIfAst[];
	else: ElseAst | null;
}>;

export type IfAst = AstType<"If", {
	expr: ExprAst;
	body: StmtScopeAst;
}>;

export type ElseIfAst = AstType<"ElseIf", {
	expr: ExprAst;
	body: StmtScopeAst;
}>;

export type ElseAst = AstType<"Else", {
	expr: ExprAst;
	body: StmtScopeAst;
}>;

export type ContinueStmtAst = AstType<"ContinueStmt">;
export type DiscardStmtAst = AstType<"DiscardStmt">;