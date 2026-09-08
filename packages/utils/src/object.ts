const mapMap = <K, V, T>(obj: Map<K, V>, mapper: (key: K, value: V) => T): Map<K, T> => {
	const newMap = new Map<K, T>();
	for (const [k, v] of obj)
		newMap.set(k, mapper(k, v));
	return newMap;
};

const mapSet = <V, T>(obj: Set<V>, mapper: (key: V, value: V) => T): Set<T> => {
	const newMap = new Set<T>();
	for (const val of obj)
		newMap.add(mapper(val, val));
	return newMap;
};

export function map<V, T>(array: readonly V[], mapper: (key: number, value: V) => T): T[];
export function map<K, V, T>(obj: ReadonlyMap<K, V>, mapper: (key: K, value: V) => T): Map<K, T>;
export function map<V, T>(obj: ReadonlySet<V>, mapper: (key: V, value: V) => T): Set<T>;
export function map<K extends string | number | symbol, V, T>(obj: { [Key in K]: V }, mapper: (key: K, value: V) => T): { [Key in K]: T };
export function map(obj: any, mapper: (key: any, value: any) => any): any {
	if (obj instanceof Map) {
		return mapMap(obj, mapper);
	} else if (obj instanceof Set) {
		return mapSet(obj, mapper);
	} else if (Array.isArray(obj)) {
		return obj.map((v, i) => mapper(i, v));
	} else {
		const newObj: Record<any, any> = {};
		for (const k in obj) {
			newObj[k] = obj[k];
		}
		return newObj;
	}
};

export const getOrInsertAsync = async <K, V>(map: Map<K, V>, key: K, init: () => Promise<V>): Promise<V> => {
	if (!map.has(key))
		map.set(key, await init());
	return map.get(key)!;
};

export const mapParallel = async <V, T>(map: readonly V[], mapper: (value: V, index: number) => Promise<T>): Promise<T[]> => {
	const x = await Promise.all(map.map((val, i) => mapper(val, i)));
	return x;
}