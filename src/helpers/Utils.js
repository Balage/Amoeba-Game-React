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