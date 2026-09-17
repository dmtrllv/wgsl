import { clearScreen } from "@wgsl/utils";

clearScreen();

import { Compiler } from "@wgsl/compiler";

const rootDir = process.cwd();

const compiler = new Compiler(rootDir);

const modules = await compiler.compileAll();

console.log(modules);