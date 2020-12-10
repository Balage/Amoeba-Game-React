function getLocalStorageName(name) {
    return `game.amoeba.${name}`;
}

//
// LANGUAGE
//
function getUserLanguageFromBrowser(supported) {
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

export function getLanguage(supportedLanguages) {
    let language = localStorage.getItem(getLocalStorageName('language'));
    if (typeof language !== 'string' || !supportedLanguages.includes(language)) {
        language = getUserLanguageFromBrowser(supportedLanguages);
        setLanguage(language);
    }
    return language;
}

export function setLanguage(language) {
    localStorage.setItem(getLocalStorageName('language'), language);
}