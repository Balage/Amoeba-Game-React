export function deepClone(items) {
    return items.map(item => Array.isArray(item) ? deepClone(item) : item);
}

export function getUserLanguage(supported) {
    if (typeof navigator !== 'undefined') {
        if (typeof navigator.language !== 'undefined') {
            let userLanguage = ('' + navigator.language).split('-')[0].toLowerCase();
            if (supported.includes(userLanguage)) {
                return userLanguage;
            }
        }
    }
    return supported[0];
}

export function getString(array, key) {
    return (key[0] === '#')
        ? getStringRecurse(array, key.substr(1).split('.'))
        : key;
}

function getStringRecurse(array, keys) {
    let subset = array[keys[0]];
    if (typeof subset === 'undefined') {
        console.error(`String key "${keys[0]}" not found in array:`, array);
    } else if (keys.length > 1) {
        return getStringRecurse(subset, keys.slice(1));
    }
    return subset;
}