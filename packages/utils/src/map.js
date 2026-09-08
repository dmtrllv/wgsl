export const mapMap = (obj, mapper) => {
    const newMap = new Map();
    for (const [k, v] of obj)
        newMap.set(k, mapper(k, v));
    return newMap;
};
export const mapSet = (obj, mapper) => {
    const newMap = new Set();
    for (const val of obj)
        newMap.add(mapper(val, val));
    return newMap;
};
export function map(obj, mapper) {
    if (obj instanceof Map) {
        return mapMap(obj, mapper);
    }
    else if (obj instanceof Set) {
        return mapSet(obj, mapper);
    }
    else if (Array.isArray(obj)) {
        return obj.map((v, i) => mapper(i, v));
    }
    else {
        const newObj = {};
        for (const k in obj) {
            newObj[k] = obj[k];
        }
        return newObj;
    }
}
//# sourceMappingURL=map.js.map