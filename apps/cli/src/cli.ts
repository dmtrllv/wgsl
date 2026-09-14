import { clearScreen } from "@wgsl/utils";

clearScreen();

import { Compiler } from "@wgsl/compiler";
import { DiagnosticsContext, isDiagnosticError } from "@wgsl/core";
import { writeFileSync } from "node:fs";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const ctx = new DiagnosticsContext();

const ast = await compiler.getAst("test.wgsl", ctx);
//const ast = await compiler.getTokens("test.wgsl", ctx);

if(!isDiagnosticError(ast) && !ctx.hasErrors()) {
	const json = JSON.stringify(ast, (k, v) => k === "span" ? undefined : v, 4);
	console.log(json);
	writeFileSync("test.ast.json", json, "utf-8");
} else {
	ctx.log();
}