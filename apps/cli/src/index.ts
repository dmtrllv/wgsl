#!/usr/bin/env node

import { Compiler } from "@wgsl/compiler";
import { DiagnosticsContext } from "@wgsl/core";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const ctx = new DiagnosticsContext();

await compiler.compileAll(ctx);

ctx.log();

const x = await compiler.getAst("test.wgsl", ctx);

console.log(x);