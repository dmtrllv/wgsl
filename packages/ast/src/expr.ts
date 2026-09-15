import { DiagnosticsContext } from "@wgsl/core";
import { FunctionArgExprListAst, FunctionCallAst, parseFunctionArgExprList, parseFunctionCall } from "./function.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { CharLiteral, Keyword, Op, Sep, StrLiteral, Token, TokenType } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { IdentAst } from "./ident.js";
import { parseType, TypeAst } from "./type.js";

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
		if (!UNARY_OPERATORS.has(token.type)) {
			throw new Error("Expected unary operator");
		}

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
	} else if (token.type === Sep.LBracket) {
		return parseArrayDecl(iter, ctx);
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

const parseOperandVal = (iter: Iter, ctx: DiagnosticsContext): ExprAst => parseWithSpan<ExprAst>(iter, () => {
	const token = iter.next();

	if (token.type === Keyword.Bitcast) {
		iter.expect(Op.Lt);
		const typeName = parseType(iter, ctx);
		iter.expect(Op.Gt);
		return {
			type: "Bitcast",
			typeName,
			arguments: parseFunctionArgExprList(iter, ctx)
		}
	}

	switch (token.type.kind) {
		case "Identifier":
			if (GENERIC_CONSTRUCTORS.includes(token.type.ident)) {
				const generics: TypeAst[] = [];

				iter.expect(Op.Lt);

				while (!iter.ended) {
					generics.push(parseType(iter, ctx));

					if (iter.nextIf(Op.Gt))
						break;

					iter.expect(Sep.Comma);
				}

				return {
					type: "GenericCall",
					name: token.type.ident,
					generics,
					arguments: parseFunctionArgExprList(iter, ctx)
				}
			}
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
			throw new Error(`Expected an operand expression at ${iter.sourcePath}:${token.position.line}:${token.position.columnOffset}`);
	}
});

const parseArrayDecl = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<ArrayDeclAst>(iter, () => {
	const expressions: ExprAst[] = [];

	iter.expect(Sep.LBracket);

	if (!iter.nextIf(Sep.RBracket))
		console.log(iter.peek());
		while (!iter.ended) {
			expressions.push(parseExpr(iter, 0, ctx));
			console.log("parsed expr");
			if (!iter.nextIf(Sep.Comma)) {
				iter.expect(Sep.RBracket);
				break;
			}
		}

	return {
		type: "ArrayDecl",
		expressions
	}
});

const parseArrayIndex = (iter: Iter, expr: ExprAst, ctx: DiagnosticsContext) => parseWithSpan<ArrayIndexAst>(iter, () => {
	return {
		type: "ArrayIndex",
		expr,
		index: parseExpr(iter, 0, ctx)
	}
});

const ASSIGN_EXPR_TOKENS: readonly TokenType[] = [
	Op.Assign,
	Op.AddAssign,
	Op.SubAssign,
	Op.DivAssign,
	Op.MulAssign,
	Op.ModAssign,
	Op.ShlAssign,
	Op.ShrAssign,
	Op.BitOrAssign,
	Op.BitAndAssign,
	Op.BitXorAssign,
];

export const isAssignOperator = (type: TokenType): type is Op => ASSIGN_EXPR_TOKENS.includes(type);

const GENERIC_CONSTRUCTORS: readonly string[] = [
	"array",
	"vec2",
	"vec3",
	"vec4",
	"mat2x2",
	"mat2x3",
	"mat2x4",
	"mat3x2",
	"mat3x3",
	"mat3x4",
	"mat4x2",
	"mat4x3",
	"mat4x4",
];

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

ASSIGN_EXPR_TOKENS.forEach(t => BINARY_PRECEDENCE.set(t, 11));

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
	| ExprGroupAst
	| BitcastAst
	| GenericCallExprAst
	| ArrayDeclAst;

export type ArrayDeclAst = AstType<"ArrayDecl", {
	expressions: ExprAst[]
}>;

export type BitcastAst = AstType<"Bitcast", {
	typeName: TypeAst,
	arguments: FunctionArgExprListAst,
}>

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

export type GenericCallExprAst = AstType<"GenericCall", {
	name: string,
	generics: TypeAst[],
	arguments: FunctionArgExprListAst,
}>