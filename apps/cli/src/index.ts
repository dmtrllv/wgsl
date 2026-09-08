#!/usr/bin/env node

import { Compiler } from "@wgsl/compiler"
import { DiagnosticsContext, isDiagnosticError } from "@wgsl/core";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const ctx = new DiagnosticsContext();

const src = await compiler.getSource("base.wgsl", ctx);
const result = await compiler.compile("base.wgsl", ctx);

if (isDiagnosticError(result) || isDiagnosticError(src)) {
	ctx.diagnostics.forEach(d => {
		console.log(d.severity + ':', d.message, d);
	});
} else {
	result.forEach(token => {
		if (token.type !== "Whitespace")
			console.log(token.type, src.slice(token.span.start, token.span.end));
	})
}
