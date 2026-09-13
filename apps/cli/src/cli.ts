import { clearScreen } from "@wgsl/utils";

clearScreen();

import { Compiler } from "@wgsl/compiler";
import { DiagnosticsContext, isDiagnosticError } from "@wgsl/core";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const ctx = new DiagnosticsContext();

const ast = await compiler.getAst("base.wgsl", ctx);

if(!isDiagnosticError(ast)) {
	console.log(ast);
} else {
	ctx.log();
}