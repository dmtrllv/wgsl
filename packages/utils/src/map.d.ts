export declare const mapMap: <K, V, T>(obj: Map<K, V>, mapper: (key: K, value: V) => T) => Map<K, T>;
export declare const mapSet: <V, T>(obj: Set<V>, mapper: (key: V, value: V) => T) => Set<T>;
export declare function map<V, T>(array: readonly V[], mapper: (key: number, value: V) => T): T[];
export declare function map<K, V, T>(obj: ReadonlyMap<K, V>, mapper: (key: K, value: V) => T): Map<K, T>;
export declare function map<V, T>(obj: ReadonlySet<V>, mapper: (key: V, value: V) => T): Set<T>;
export declare function map<K extends string | number | symbol, V, T>(obj: {
    [Key in K]: V;
}, mapper: (key: K, value: V) => T): {
    [Key in K]: T;
};
