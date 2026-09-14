import { DiagnosticsContext } from "@wgsl/core";
import { FunctionCallAst, parseFunctionCall } from "./function.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { CharLiteral, Op, Sep, StrLiteral, Token, TokenType } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { IdentAst } from "./ident.js";

export const parseExpr = (iter: Iter, minPrecedence: number, ctx: DiagnosticsContext): ExprAst => parseWithSpan<ExprAst>(iter, () => {
	let expr = parseOperand(iter, ctx);

	while (true) {
		const token = iter.peek();

		if (isExprEnd(token))
			break;

		if (token.type === Sep.LParen) {
			expr = parseFunctionCall(iter, expr, ctx);
		} else if (token.type === Sep.LBracket) {
			expr = parseArrayIndex(iter, expr, ctx);
		} else if (token.type.kind !== "Operator") {
			break;
		} else {
			const precedence = BINARY_PRECEDENCE.get(token.type);

			if (precedence === undefined || precedence < minPrecedence)
				break;

			const left = expr;

			expr = parseWithSpan<BinaryOpAst>(iter, () => {
				const op = iter.next();

				if (op.type.kind !== "Operator")
					throw new Error("Expected binary operator");

				const right = parseExpr(iter, precedence + 1, ctx);

				return {
					type: "BinaryOp",
					left,
					op: op.type,
					right,
				};
			});
		}
	}

	return expr;
});

const isExprEnd = (token: Token): boolean => EXPR_END_TOKENS.includes(token.type);

const parseOperand = (iter: Iter, ctx: DiagnosticsContext): ExprAst => {
	const token = iter.peek();

	if (token.type.kind === "Operator") {
		if (!UNARY_OPERATORS.has(token.type))
			throw new Error("Expected unary operator");

		return parseUnary(iter, ctx);
	}

	if (token.type === Sep.LParen) {
		return parseWithSpan<ExprGroupAst>(iter, () => {
			iter.expect(Sep.LParen);
			const expr = parseExpr(iter, 0, ctx);
			iter.expect(Sep.RParen);
			return {
				type: "ExprGroup",
				expr
			};
		});
	} else if (token.type.kind === "Separator") {
		throw new Error("TODO: parse grouped expression " + token.type.sep + " " + JSON.stringify(token.position, null, 4));
	}

	return parseOperandVal(iter, ctx);
};

const parseUnary = (iter: Iter, ctx: DiagnosticsContext): UnaryOpAst => parseWithSpan<UnaryOpAst>(iter, () => {
	const token = iter.next();

	if (token.type.kind !== "Operator")
		throw new Error("Expected unary operator");

	if (!UNARY_OPERATORS.has(token.type))
		throw new Error("Expected unary operator");

	return {
		type: "UnaryOp",
		op: token.type,
		expr: parseOperand(iter, ctx),
	};
});

const parseOperandVal = (iter: Iter, _ctx: DiagnosticsContext): ExprAst => parseWithSpan<ExprAst>(iter, () => {
	const token = iter.next();

	switch (token.type.kind) {
		case "Identifier":
			return {
				type: "Identifier",
				value: token.type.ident,
			};

		case "StringLiteral":
			return {
				type: "StrLiteral",
				value: token.type,
			};

		case "CharLiteral":
			return {
				type: "CharLiteral",
				value: token.type,
			};

		case "NumberLiteral": {
			const source = iter.getSource(token);

			return {
				type: "NumberLiteral",
				value: source.includes(".") ? parseFloat(source) : parseInt(source),
			};
		}

		case "BooleanLiteral": {
			const source = iter.getSource(token);

			return {
				type: "BoolLiteral",
				value: source === "true",
			};
		}

		default:
			throw new Error("Expected an operand expression");
	}
});

const parseArrayIndex = (iter: Iter, expr: ExprAst, ctx: DiagnosticsContext) => parseWithSpan<ArrayIndexAst>(iter, () => {
	return {
		type: "ArrayIndex",
		expr,
		index: parseExpr(iter, 0, ctx)
	}
});


const EXPR_END_TOKENS: readonly TokenType[] = [
	Sep.Colon,
	Sep.Comma,
	Sep.Semicolon,
	Sep.RBrace,
	Sep.RBracket,
	Sep.RParen,
];

const BINARY_PRECEDENCE = new Map<TokenType, number>([
	[Op.Or, 1],
	[Op.And, 2],
	[Op.BitOr, 3],
	[Op.BitXor, 4],
	[Op.BitAnd, 5],
	[Op.Eq, 6],
	[Op.Neq, 6],
	[Op.Lt, 6],
	[Op.LtEq, 6],
	[Op.Gt, 6],
	[Op.GtEq, 6],
	[Op.Shl, 7],
	[Op.Shr, 7],
	[Op.Add, 8],
	[Op.Sub, 8],
	[Op.Mul, 9],
	[Op.Div, 9],
	[Op.Mod, 9],
	[Op.Dot, 10],
]);

const UNARY_OPERATORS = new Set<Op>([
	Op.Sub,
	Op.Not,
	Op.BitNot,
]);

export type ExprAst =
	| FunctionCallAst
	| UnaryOpAst
	| IdentAst
	| StrLiteralAst
	| CharLiteralAst
	| NumberLiteralAst
	| BoolLiteralAst
	| BinaryOpAst
	| ArrayIndexAst
	| ExprGroupAst;

export type StrLiteralAst = AstType<"StrLiteral", {
	value: StrLiteral;
}>;

export type CharLiteralAst = AstType<"CharLiteral", {
	value: CharLiteral;
}>;

export type NumberLiteralAst = AstType<"NumberLiteral", {
	value: number;
}>;

export type BoolLiteralAst = AstType<"BoolLiteral", {
	value: boolean;
}>;

export type BinaryOpAst = AstType<"BinaryOp", {
	left: ExprAst;
	right: ExprAst;
	op: Op;
}>;

export type UnaryOpAst = AstType<"UnaryOp", {
	op: Op;
	expr: ExprAst;
}>;

export type ArrayIndexAst = AstType<"ArrayIndex", {
	expr: ExprAst,
	index: ExprAst,
}>;


export type ExprGroupAst = AstType<"ExprGroup", {
	expr: ExprAst,
}>;
