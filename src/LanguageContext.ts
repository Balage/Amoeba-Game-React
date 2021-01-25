import React from 'react';

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

export const LANGUAGE_STRING_TABLES: StringTables = {
    en: {
        title: 'Amoeba',
        result: {
            won: 'You won!',
            lose: 'You lose!',
            draw: 'Draw!',
            newGame: 'New game?',
        },
        difficulty: {
            label: 'Difficulty:',
            hard: 'Hard',
            medium: 'Medium',
            easy: 'Easy',
        },
        author: 'Balázs Vecsey',
    },
    hu: {
        title: 'Amőba',
        result: {
            won: 'Nyertél!',
            lose: 'Vesztettél!',
            draw: 'Döntetlen!',
            newGame: 'Újra?',
        },
        difficulty: {
            label: 'Nehézség:',
            hard: 'Nehéz',
            medium: 'Közepes',
            easy: 'Könnyű',
        },
        author: 'Vecsey Balázs',
    },
};

export const LanguageContext = React.createContext(LANGUAGE_STRING_TABLES.en);