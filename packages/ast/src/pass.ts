import { Keyword, Op, Sep } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { parseStruct, StructAst } from "./struct.js";
import { FunctionAst, parseFunction, parseFunctionArgList } from "./function.js";
import { DiagnosticsContext, DiagnosticSeverity } from "@wgsl/core";
import { BindingVarDeclAst, parseBindingVar } from "./binding.js";
import { BindingGroupAst, parseBindingGroup } from "./group_block.js";
import { AttributeAst } from "./attr.js";

export const parseRenderPass = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<RenderPassAst>(iter, () => {
	iter.expect(Sep.LParen);
	const name = parseIdent(iter, ctx);
	iter.expect(Sep.RParen);
	iter.expect(Sep.LBrace);

	const declarations: DeclarationAst[] = [];

	while (!iter.ended && !iter.nextIf(Sep.RBrace)) {
		const token = iter.peek();
		switch (token?.type) {
			case Op.At:
				const astAt = parseAttributed(iter, ctx);
				if (astAt)
					declarations.push(astAt);
				break;
			case Keyword.Struct:
				const astStruct = parseStruct(iter, [], ctx);
				if (astStruct)
					declarations.push(astStruct);
				break;
			case Keyword.Fn:
				const astFn = parseFunction(iter, [], ctx);
				if (astFn)
					declarations.push(astFn);
				break;
			case Keyword.Var:
				const astVar = parseBindingVar(iter, [], ctx);
				if (astVar)
					declarations.push(astVar);
				break;
			default:
				const token = iter.next();
				ctx.add(DiagnosticSeverity.Error, `Invalid token ${token}!`);
				break;
		}
	}

	return {
		type: "RenderPass",
		name,
		declarations
	}
});


const parseAttributed = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<DeclarationWithAttr | BindingGroupAst>(iter, () => {
	const attributes: AttributeAst[] = [];
	while (iter.isNext(Op.At)) {
		const attr = parseAttribute(iter, ctx);
		if (attr?.type === "Attribute") {
			attributes.push(attr);
		} else {
			return attr;
		}
	}

	const token = iter.peek();
	switch (token?.type) {
		case Keyword.Struct:
			return parseStruct(iter, attributes, ctx);
		case Keyword.Fn:
			return parseFunction(iter, attributes, ctx);
		case Keyword.Var:
			return parseBindingVar(iter, attributes, ctx);
		default:
			throw new Error("Invalidos!");
	}
});

const parseAttribute = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<AttributeAst | BindingGroupAst>(iter, () => {
	iter.expect(Op.At);
	const ident = parseIdent(iter, ctx);

	if (!ident || !("value" in ident))
		return null;

	switch (ident.value) {
		case "object":
		case "material":
		case "global":
		case "resource":
			return parseBindingGroup(iter, ident, ctx);
		default:
			if (iter.isNext(Sep.LParen)) {
				return {
					type: "Attribute",
					name: ident,
					argList: parseFunctionArgList(iter, ctx),

				};
			} else {
				return {
					type: "Attribute",
					name: ident,
					argList: []
				};
			}
	}
});

export type RenderPassAst = AstType<"RenderPass", {
	name: IdentAst,
	declarations: DeclarationAst[]
}>;

type DeclarationAst = StructAst | FunctionAst | BindingVarDeclAst | BindingGroupAst;

type DeclarationWithAttr = StructAst | FunctionAst | BindingVarDeclAst;