import { DiagnosticsContext, span } from "@wgsl/core";
import { Token } from "@wgsl/lexer";
import { Iter } from "./iter.js";
import { parseModule } from "./module.js";
import { Ast, InvalidAst } from "./ast.js";

export const parseTokens = (path: string, source: string, tokens: Token[], ctx: DiagnosticsContext) => {
	const iter = new Iter(path, source, tokens, ctx);
	return parseModule(iter, ctx);
};

export const parseWithSpan = <T extends Ast>(iter: Iter, parser: () => Omit<T, "span"> | null): T | InvalidAst | null => {
	const startToken = iter.peek();
	if (startToken === null)
		return null;

	const ast = parser();

	const endToken = iter.current();
	if (endToken === null)
		return null;

	const s = span(startToken.span.start, endToken.span.end);

	if (ast === null)
		return { type: "Invalid", span: s };

	return Object.assign(ast, { span: s }) as T;
};