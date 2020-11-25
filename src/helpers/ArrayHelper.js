export function deepClone(items) {
    return items.map(item => Array.isArray(item) ? deepClone(item) : item);
}