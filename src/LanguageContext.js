import React from 'react';

export const languageStrings = {
    en: {
        title: 'Amoeba',
        result: {
            won: 'You won!',
            lose: 'You lose!',
            draw: 'Draw!',
            newGame: 'New game?'
        },
        difficulty: {
            label: 'Difficulty:',
            hard: 'Hard',
            medium: 'Medium',
            easy: 'Easy'
        },
        author: 'Balázs Vecsey',
    },
    hu: {
        title: 'Amőba',
        result: {
            won: 'Nyertél!',
            lose: 'Vesztettél!',
            draw: 'Döntetlen!',
            newGame: 'Újra?'
        },
        difficulty: {
            label: 'Nehézség:',
            hard: 'Nehéz',
            medium: 'Közepes',
            easy: 'Könnyű'
        },
        author: 'Vecsey Balázs',
    },
};

export const LanguageContext = React.createContext(
    languageStrings.en
);