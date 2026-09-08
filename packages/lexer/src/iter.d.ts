import { DiagnosticsContext } from "@wgsl/core";
export declare class Iter {
    private readonly _source;
    private readonly _ctx;
    private _nextPtr;
    get ptr(): number;
    get ended(): boolean;
    constructor(_path: string, source: string, ctx: DiagnosticsContext);
    skip(): void;
    skipWhile(match: (c: any) => boolean): void;
    next(): string;
    collectWhile(match: (c: string, buffer: string) => boolean): string;
    isNext(str: string): boolean;
    matchesNext(match: (str: string) => boolean): boolean;
    peek(): string;
}
