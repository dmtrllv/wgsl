import { DiagnosticError, DiagnosticSeverity, isDiagnosticError } from "@wgsl/core";
import { parseSource } from "@wgsl/lexer";
import { readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
export class Compiler {
    rootDir;
    sources = new Map();
    tokens = new Map();
    constructor(rootDir) {
        this.rootDir = rootDir;
    }
    async getSource(path, ctx) {
        return ctx.tryAsync(async () => {
            if (!isAbsolute(path)) {
                path = join(this.rootDir, path);
            }
            else if (!path.startsWith(this.rootDir)) {
                throw new DiagnosticError(DiagnosticSeverity.Error, `${path} is not inside the root folder!`);
            }
            if (!path.endsWith(".wgsl")) {
                throw new DiagnosticError(DiagnosticSeverity.Error, `Invalid file extension for ${path}! (Expected a ".wgsl" extension)`);
            }
            const relativePath = path.replace(this.rootDir, "");
            let source = this.sources.get(relativePath);
            if (!source) {
                try {
                    source = await readFile(path, "utf-8");
                    this.sources.set(relativePath, source);
                }
                catch (e) {
                    if (e.code === "ENOENT")
                        throw new DiagnosticError(DiagnosticSeverity.Error, `Could not find file at ${path}`);
                    throw e;
                }
            }
            return source;
        });
    }
    async getTokens(path, ctx) {
        return ctx.tryAsync(async () => {
            const source = await this.getSource(path, ctx);
            if (isDiagnosticError(source))
                return source;
            return parseSource(path, source, ctx);
        });
    }
    async compile(path, ctx) {
        return ctx.tryAsync(async () => {
            const tokens = await this.getTokens(path, ctx);
            return tokens;
        });
    }
}
//# sourceMappingURL=index.js.map