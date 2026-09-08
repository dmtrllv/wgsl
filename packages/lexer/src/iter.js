export class Iter {
    //private readonly _path: string;
    _source;
    _ctx;
    _nextPtr = 0;
    get ptr() {
        return this._nextPtr;
    }
    get ended() {
        return this._nextPtr >= this._source.length;
    }
    constructor(_path, source, ctx) {
        //this._path = path;
        this._source = source;
        this._ctx = ctx;
    }
    skip() {
        this._nextPtr++;
    }
    skipWhile(match) {
        while (!this.ended) {
            if (!match(this._source[this._nextPtr])) {
                return;
            }
            this.skip();
        }
    }
    next() {
        this._ctx.assert(!this.ended, `End of file reached!`);
        return this._source[this._nextPtr++];
    }
    collectWhile(match) {
        let buffer = "";
        while (!this.ended) {
            if (!match(this.peek(), buffer))
                break;
            buffer += this.next();
        }
        return buffer;
    }
    isNext(str) {
        return str === this._source.slice(this._nextPtr, this._nextPtr + str.length);
    }
    matchesNext(match) {
        return match(this.peek());
    }
    peek() {
        this._ctx.assert(!this.ended, `End of file reached!`);
        return this._source[this._nextPtr];
    }
}
//# sourceMappingURL=iter.js.map