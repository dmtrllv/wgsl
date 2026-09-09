import { Keyword, Sep, StrLiteral } from "@wgsl/lexer";
import { AstType } from "./ast.js";
import { Iter } from "./iter.js";
import { parseWithSpan } from "./parser.js";

export const parseImport = (iter: Iter) => parseWithSpan<ImportAst>(iter, () => {
	iter.expect(Keyword.Import);
	const path = iter.expect(StrLiteral);
	iter.expect(Sep.Semicolon);
	return {
		type: "Import",
		path: iter.getSource(path).slice(1, -1)
	};
});

export type ImportAst = AstType<"Import", {
	readonly path: string;
}>;