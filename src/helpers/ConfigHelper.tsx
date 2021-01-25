function getLocalStorageName(name: string): string {
    return `game.amoeba.${name}`;
}

//
// LANGUAGE
//
function getUserLanguageFromBrowser(supported: string[]): string {
    if (typeof navigator !== 'undefined') {
        if (typeof navigator.language !== 'undefined') {
            const userLanguage = navigator.language.split('-')[0].toLowerCase();
            if (supported.includes(userLanguage)) {
                return userLanguage;
            }
        }
    }
    return supported[0];
}

export function loadLanguage(supportedLanguages: string[]) {
    let language = localStorage.getItem(getLocalStorageName('language'));
    if (language === null || !supportedLanguages.includes(language)) {
        language = getUserLanguageFromBrowser(supportedLanguages);
        saveLanguage(language);
    }
    return language;
}

export function saveLanguage(language: string): void {
    localStorage.setItem(getLocalStorageName('language'), language);
}