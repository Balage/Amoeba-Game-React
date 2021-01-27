import React, { useEffect, useState } from 'react';

import GameHeader from './GameHeader';
import Board from './Board';

import DefaultAi from '../ai/DefaultAi';
import { AiDifficulty } from '../ai/AiDifficulty';
import SelectControl from './SelectControl';

import LanguageSelector from './LanguageSelector';

import { loadLanguage, saveLanguage } from './helpers/LocalStorageHelper'
import { StringsContext, SUPPORTED_LANGUAGES, LANGUAGE_STRING_TABLES } from '../localization/StringsContext'

import { createEmptyBoard, cloneBoard, cloneBoardState, foreachBoard, checkWinCondition, countFreeSquares } from './helpers/BoardHelper';

type MarginType = {
    TOP: number,
    SIDE: number,
    BOTTOM: number,
};

const MARGINS: {[key: string]: MarginType} = {
    DESKTOP: {
        TOP: 40 + 20 + 26 + 20,
        SIDE: 40 + 20,
        BOTTOM: 20 * 5 + 10,
    },
    MOBILE: {
        TOP: 20 + 20 + 26 + 20,
        SIDE: 20 + 20,
        BOTTOM: 20 * 5 + 10,
    }
} as const;

const VICTORY_CONDITION = 5;

enum PlayerId {
    Unset = 0,
    Human = 1,
    CPU = 2,
    Neither = 3,
};

function CalculateBoardSize(): { width: number, height: number } {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const squareSize = 24;
    
    const isMobile = screenWidth < 768;
    const currentMargins = isMobile ? MARGINS.MOBILE : MARGINS.DESKTOP;
    
    const boardWidth = screenWidth - currentMargins.SIDE * 2;
    const boardHeight = screenHeight - currentMargins.TOP - currentMargins.BOTTOM;
    
    const boardX = Math.floor(boardWidth / squareSize);
    const actualSquareSize = boardWidth / boardX;
    const boardY = Math.floor(boardHeight / actualSquareSize);
    
    return {
        width: Math.max(VICTORY_CONDITION, boardX),
        height: Math.max(VICTORY_CONDITION, boardY)
    };
}

export default function Game(): JSX.Element {
    const [languageCode, setLanguageCode] = useState(() => loadLanguage(SUPPORTED_LANGUAGES));
    const [strings, setStrings] = useState(() => LANGUAGE_STRING_TABLES[languageCode])
    
    const [winner, setWinner] = useState(PlayerId.Unset);
    const [board, updateBoard] = useState(() => createEmptyBoard(CalculateBoardSize()));
    const [difficulty, setDifficulty] = useState(AiDifficulty.Hard);
    
    const resetGame = (): void => {
        const boardSize = CalculateBoardSize();
        setWinner(PlayerId.Unset);
        updateBoard(createEmptyBoard(boardSize));
    };
    
    const changeDifficulty = (newDifficulty: number): void => {
        setDifficulty(newDifficulty);
        resetGame();
    };
    
    const isValidBoardIndex = (x: number, y: number): boolean => {
        const width = board[0].length;
        const height = board.length;
        return (
            0 <= x && x < width &&
            0 <= y && y < height
        );
    };
    
    const onClickBoard = (x: number, y: number): void => {
        // Game is finished
        if (winner !== PlayerId.Unset) {
            return;
        }
        
        // Square is already marked
        if (board[y][x].state !== 0) {
            return;
        }
        
        const boardCopy = cloneBoard(board);
        
        // Reset highlight
        foreachBoard(boardCopy, function(square) {
            square.highlight = false;
        });
        
        boardCopy[y][x].state = PlayerId.Human;
        boardCopy[y][x].highlight = true;
        
        // Check win condition
        let winResult = checkWinCondition(boardCopy, VICTORY_CONDITION);
        if (winResult !== PlayerId.Unset) {
            updateBoard(boardCopy);
            setWinner(winResult);
            return;
        }
        
        // Check draw condition
        if (countFreeSquares(boardCopy) === 0) {
            updateBoard(boardCopy);
            setWinner(PlayerId.Neither);
            return;
        }
        
        // Let the enemy move
        const aiBoard = cloneBoardState(boardCopy);
        //console.log(boardCopy, aiBoard);
        const enemyMove = DefaultAi(aiBoard, VICTORY_CONDITION, difficulty);
        if (enemyMove != null &&
            isValidBoardIndex(enemyMove.x, enemyMove.y) &&
            boardCopy[enemyMove.y][enemyMove.x].state === 0)
        {
            boardCopy[enemyMove.y][enemyMove.x].state = PlayerId.CPU;
            boardCopy[enemyMove.y][enemyMove.x].highlight = true;
        } else {
            console.error(`Invalid value returned from AI in :`, enemyMove);
            return;
        }
        
        // Check win condition
        winResult = checkWinCondition(boardCopy, VICTORY_CONDITION);
        if (winResult !== PlayerId.Unset) {
            updateBoard(boardCopy);
            setWinner(winResult);
        }
        
        // Check draw condition
        if (countFreeSquares(boardCopy) === 0) {
            updateBoard(boardCopy);
            setWinner(PlayerId.Neither);
            return;
        }
        
        updateBoard(boardCopy);
    }
    
    const changeLanguage = (newLanguageCode: string) => {
        saveLanguage(newLanguageCode);
        setLanguageCode(newLanguageCode);
        setStrings(LANGUAGE_STRING_TABLES[newLanguageCode]);
    };
    
    useEffect(() => {
        document.title = strings.title;
    }, [strings]);
    
    const aiDifficultyOptions: {value: number, label: string}[] = [
        { value: AiDifficulty.Hard,   label: strings.difficulty.hard },
        { value: AiDifficulty.Medium, label: strings.difficulty.medium },
        { value: AiDifficulty.Easy,   label: strings.difficulty.easy },
    ];
    
    return (
        <StringsContext.Provider value={strings}>
            <div className="game-holder">
                <main className="paper-page">
                    <GameHeader winner={winner} onResetClick={resetGame} />
                    <Board board={board} onClick={onClickBoard} />
                    <div className="footer-bar">
                        <LanguageSelector
                            className='language-selector'
                            languages={SUPPORTED_LANGUAGES}
                            selected={languageCode}
                            onChange={changeLanguage}
                        />
                        <SelectControl
                            className="ai-selector"
                            label={strings.difficulty.label}
                            options={aiDifficultyOptions}
                            value={difficulty}
                            onChange={(index) => changeDifficulty(index)}
                        />
                    </div>
                </main>
                <footer>&copy; 2020 {strings.author}, <a href="https://vbstudio.hu/">vbstudio.hu</a></footer>
            </div>
        </StringsContext.Provider>
    );
}