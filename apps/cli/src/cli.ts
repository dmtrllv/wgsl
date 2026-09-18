import { clearScreen, mapParallel } from "@wgsl/utils";

clearScreen();

import { Compiler } from "@wgsl/compiler";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const rootDir = process.cwd();

const getAllSourcePaths = async () => {
	const paths: string[] = [];

	const resolveFiles = async (dir: string) => {
		const entries = await readdir(dir);
		await Promise.all(entries.map(async entry => {
			entry = join(dir, entry);
			if ((await stat(entry)).isFile()) {
				if (entry.endsWith(".wgsl")) {
					paths.push(entry);
				}
			} else {
				await resolveFiles(entry);
			}
		}));
	};

	await resolveFiles(rootDir);

	return paths;
};

const compiler = new Compiler(rootDir);

const paths = await getAllSourcePaths();

const modules = await mapParallel(paths, async path => compiler.compile(path, await readFile(path, "utf-8")));

console.log(modules);