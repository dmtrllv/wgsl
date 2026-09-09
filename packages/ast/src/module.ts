import { DiagnosticsContext } from "@wgsl/core";
import { Iter } from "./iter.js";
import { AstType, DeclarationAst } from "./ast.js";
import { ImportAst, parseImport } from "./import.js";
import { parseWithSpan } from "./parser.js";
import { Keyword, Op } from "@wgsl/lexer";
import { MetaAst, parseMetaExpr } from "./meta.js";

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
				declarations.push(parseMeta(iter, ctx));
				break;
			default:
				iter.next();
		}
	}

	return {
		type: "Module",
		imports,
		declarations
	};
});

const parseMeta = (iter: Iter, ctx: DiagnosticsContext) => parseWithSpan<DeclarationAst>(iter, () => {
	const meta: MetaAst[] = [];
	while (iter.isNext(Op.At)) {
		meta.push(parseMetaExpr(iter, ctx));
	}
	const token = iter.peek();
	switch (token.type) {
		case Keyword.Struct:
			console.log("todo parse Keyword.Struct");
			iter.next();
			break;
		case Keyword.Fn:
			console.log("todo parse Keyword.Fn");
			iter.next();
			break;
		case Keyword.Var:
			console.log("todo parse Keyword.Var");
			iter.next();
			break;
		default:
			iter.next();
	}
	if(meta.length)
		console.log(meta)
	return { type: "Struct", meta }
});

export type ModuleAst = AstType<"Module", {
	readonly imports: ImportAst[];
	readonly declarations: DeclarationAst[];
}>;
