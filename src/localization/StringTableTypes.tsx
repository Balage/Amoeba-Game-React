export type StringTable = {
    title: string,
    result: {
        won: string,
        lose: string,
        draw: string,
        newGame: string,
    },
    difficulty: {
        label: string,
        hard: string,
        medium: string,
        easy: string,
    },
    author: string,
};

export type StringTables = {
    en: StringTable,
    [key: string]: StringTable
}