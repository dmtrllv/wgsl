import { DiagnosticsContext, span } from "@wgsl/core";
import { Token } from "@wgsl/lexer";
import { Iter } from "./iter.js";
import { parseModule } from "./module.js";
import { Ast } from "./ast.js";

export const parseTokens = (source: string, tokens: Token[], ctx: DiagnosticsContext) => {
	const iter = new Iter(source, tokens, ctx);
	return parseModule(iter, ctx);
};

export const parseWithSpan = <T extends Ast>(iter: Iter, parser: () => Omit<T, "span">): T => {
	const startToken = iter.peek();
	const ast = parser();
	const endToken = iter.current();
	return Object.assign(ast, { span: span(startToken.span.start, endToken.span.end) }) as T;
};