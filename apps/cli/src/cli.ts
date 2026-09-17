import { clearScreen } from "@wgsl/utils";

clearScreen();

import { Compiler } from "@wgsl/compiler";
import { DiagnosticsContext, isDiagnosticError } from "@wgsl/core";
import { writeFileSync } from "node:fs";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const ctx = new DiagnosticsContext();

const symbols = await compiler.getSymbols("test.wgsl", ctx);

if(!isDiagnosticError(symbols) && !ctx.hasErrors()) {
	symbols.log();
	const json = JSON.stringify(symbols, (k, v) => k === "declaration" ? undefined : v, 4);
	writeFileSync("test.symbols.json", json, "utf-8");
} else {
	ctx.log();
}
