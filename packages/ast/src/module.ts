import { DiagnosticsContext, DiagnosticSeverity } from "@wgsl/core";
import { Iter } from "./iter.js";
import { AstType } from "./ast.js";
import { ImportAst, parseImport } from "./import.js";
import { parseWithSpan } from "./parser.js";
import { Keyword, Op, Sep } from "@wgsl/lexer";
import { AttributeAst } from "./attr.js";
import { parseStruct, StructAst } from "./struct.js";
import { FunctionAst, parseFunction, parseFunctionArgList } from "./function.js";
import { parseRenderPass, RenderPassAst } from "./pass.js";
import { parseIdent } from "./ident.js";
import { BindingGroupAst, parseBindingGroup } from "./group_block.js";
import { BindingVarDeclAst, parseBindingVar } from "./binding.js";

export const parseModule = (iter: Iter, ctx: DiagnosticsContext): ModuleAst => parseWithSpan<ModuleAst>(iter, () => {
	const imports: ImportAst[] = [];
	const declarations: DeclarationAst[] = [];

	while (!iter.ended) {
		const token = iter.peek();
		switch (token.type) {
			case Keyword.Import:
				imports.push(parseImport(iter));
				break;
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

	return {
		type: "Module",
		imports,
		declarations
	};
});

const parseAttributed = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<DeclarationWithAttr | BindingGroupAst | RenderPassAst>(iter, () => {
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

const parseAttribute = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<AttributeAst | BindingGroupAst | RenderPassAst>(iter, () => {
	iter.expect(Op.At);
	const ident = parseIdent(iter);
	switch (ident.value) {
		case "object":
		case "material":
		case "global":
			return parseBindingGroup(iter, ident.value, ctx);
		case "pass":
			return parseRenderPass(iter, ctx);
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

export type ModuleAst = AstType<"Module", {
	readonly imports: ImportAst[];
	readonly declarations: DeclarationAst[];
}>;

type DeclarationWithAttr =
	| StructAst
	| FunctionAst
	| BindingVarDeclAst;

type DeclarationAst =
	| StructAst
	| FunctionAst
	| BindingVarDeclAst
	| RenderPassAst
	| BindingGroupAst
	| ImportAst;