import { clearScreen } from "@wgsl/utils";
import { Scope } from "@wgsl/symbol";

clearScreen();

import { Compiler } from "@wgsl/compiler";
import { DiagnosticsContext, isDiagnosticError } from "@wgsl/core";
import { writeFileSync } from "node:fs";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const ctx = new DiagnosticsContext();

const symbols = await compiler.getSymbols("test.wgsl", ctx);
//const ast = await compiler.getTokens("test.wgsl", ctx);

const logSymbols = (scope: Scope, offset: number = 0) => {
	const log = (msg: any) => console.log(new Array(offset).fill(' ').join("") + msg);
	for(const [name, s] of scope.symbols) {
		log(`${s.type}: ${name}`);
		if("scope" in s) 
			logSymbols(s.scope, offset + 4);
	}
}

if(!isDiagnosticError(symbols) && !ctx.hasErrors()) {
	logSymbols(symbols);
	const json = JSON.stringify(symbols, (k, v) => k === "declaration" ? undefined : v, 4);
	writeFileSync("test.symbols.json", json, "utf-8");
} else {
	ctx.log();
}
