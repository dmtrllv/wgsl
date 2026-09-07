#!/usr/bin/env node

import { Compiler } from "@wgsl/compiler"
import { DiagnosticsContext, isDiagnosticError } from "@wgsl/core";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const ctx = new DiagnosticsContext();

const result = await compiler.compile("base.wgsl", ctx);

if (isDiagnosticError(result)) {
	ctx.diagnostics.forEach(d => {
		console.log(d.severity + ':', d.message);
	});
}
