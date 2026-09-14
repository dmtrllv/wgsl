import { Keyword, Op, Sep } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { parseStruct, StructAst } from "./struct.js";
import { FunctionAst, parseFunction, parseFunctionArgList } from "./function.js";
import { DiagnosticsContext, DiagnosticSeverity } from "@wgsl/core";
import { BindingVarDeclAst, parseBindingVar } from "./binding.js";
import { GroupBlockAst, parseGroupBlock } from "./group_block.js";
import { AttributeAst } from "./attr.js";

export const parseRenderPass = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<RenderPassAst>(iter, () => {
	iter.expect(Sep.LParen);
	const name = parseIdent(iter);
	iter.expect(Sep.RParen);
	iter.expect(Sep.LBrace);

	const declarations: DeclarationAst[] = [];

	while (!iter.ended) {
		const token = iter.peek();
		switch (token.type) {
			case Op.At:
				declarations.push(parseAttributed(iter, ctx));
				break;
			case Keyword.Struct:
				declarations.push(parseStruct(iter, [], ctx));
				break;
			case Keyword.Fn:
				declarations.push(parseFunction(iter, [], ctx));
				break;
			case Keyword.Var:
				declarations.push(parseBindingVar(iter, [], ctx));
				break;
			default:
				const token = iter.next();
				ctx.add(DiagnosticSeverity.Error, `Invalid token ${token}!`);
				break;
		}
	}

	iter.expect(Sep.RBrace);

	return {
		type: "RenderPass",
		name,
		declarations
	}
});


const parseAttributed = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<DeclarationWithAttr | GroupBlockAst>(iter, () => {
	const attributes: AttributeAst[] = [];
	while (iter.isNext(Op.At)) {
		const attr = parseAttribute(iter, ctx);
		if (attr.type === "Attribute") {
			attributes.push(attr);
		} else {
			return attr;
		}
	}

	const token = iter.peek();
	switch (token.type) {
		case Keyword.Struct:
			return parseStruct(iter, attributes, ctx);
		case Keyword.Fn:
			return parseFunction(iter, attributes, ctx);
		case Keyword.Var:
			return parseBindingVar(iter, attributes, ctx);
		default:
			console.log(token);
			throw new Error("Invalidos!");
	}
});

const parseAttribute = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<AttributeAst | GroupBlockAst>(iter, () => {
	iter.expect(Op.At);
	const ident = parseIdent(iter);
	switch (ident.value) {
		case "object":
		case "material":
		case "global":
			return parseGroupBlock(iter, ident.value, ctx);
		default:
			if (iter.isNext(Sep.LParen)) {
				return {
					type: "Attribute",
					args: parseFunctionArgList(iter, ctx),

				};
			} else {
				return {
					type: "Attribute",
					args: []
				};
			}
	}
});

export type RenderPassAst = AstType<"RenderPass", {
	name: IdentAst,
	declarations: DeclarationAst[]
}>;

type DeclarationAst = StructAst | FunctionAst | BindingVarDeclAst | GroupBlockAst;

type DeclarationWithAttr = StructAst | FunctionAst | BindingVarDeclAst;