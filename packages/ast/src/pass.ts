import { Sep } from "@wgsl/lexer";
import { AstType, VarAsts } from "./ast.js";
import { IdentAst, parseIdent } from "./ident.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";
import { StructAst } from "./struct.js";
import { FunctionAst } from "./function.js";
import { DiagnosticsContext } from "@wgsl/core";
import { TypeNameAst } from "./type_name.js";

export const parseRenderPass = (iter: Iter, _ctx: DiagnosticsContext) => parseWithSpan<RenderPassAst>(iter, () => {
	const name = parseIdent(iter);
	iter.expect(Sep.LBrace);

	const declarations: DeclarationAst[] = [];

	while (!iter.isNext(Sep.RBrace)) {
		//const token = iter.peek();
		//switch (token.type) {
		//	case Op.At:
		//		const attributes = parseAttributes(iter, ctx);
		//		declarations.push(parseWithAttributes(iter, attributes, ctx));
		//		break;
		//	case Keyword.Struct:
		//		declarations.push(parseStruct(iter, [], ctx));
		//		break;
		//	case Keyword.Fn:
		//		declarations.push(parseFunction(iter, [], ctx));
		//		break;
		//	default:
		//		const token = iter.next();
		//		ctx.add(DiagnosticSeverity.Error, `Invalid token ${token}!`);
		//		break;
		//}
		throw new Error("TODO");
	}

	iter.expect(Sep.RBrace);

	return {
		type: "RenderPass",
		name,
		declarations
	}
});


//const parseWithAttributes = (iter: Iter, attributes: AttributeAst[], ctx: DiagnosticsContext) => parseWithSpan<DeclarationAst>(iter, () => {
//	const token = iter.peek();
//	switch (token.type) {
//		case Keyword.Struct:
//			return parseStruct(iter, attributes, ctx);
//		case Keyword.Fn:
//			return parseFunction(iter, attributes, ctx);
//		case Keyword.Var:
//			throw new Error("Todo");
//		default:
//			throw new Error("Invalidos!");
//	}
//});

export type RenderPassAst = AstType<"RenderPass", {
	name: IdentAst,
	declarations: DeclarationAst[]
}>;

export type RenderPassResourceAst = AstType<"RenderPass", {
	resourceName: IdentAst,
	name: IdentAst,
	typeName: TypeNameAst,
}>

type DeclarationAst = StructAst | FunctionAst | VarAsts;