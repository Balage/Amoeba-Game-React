import React, { useEffect, useState } from 'react';

import GameHeader from './GameHeader';
import Board from './Board';

import DefaultAi from './ai/DefaultAi';
import { AiDifficulty } from './ai/AiDifficulty';
import SelectControl from './ui/SelectControl';

import LanguageSelector from './LanguageSelector';

import { loadLanguage, saveLanguage } from './helpers/ConfigHelper'
import { LanguageContext, LANGUAGE_STRING_TABLES } from './LanguageContext'

import { BoardSquareType, cloneBoard, cloneBoardState, foreachBoard, checkWinCondition, countFreeSquares } from './BoardHelper';


const MARGIN_DESKTOP_TOP = 40 + 20 + 26 + 20;
const MARGIN_DESKTOP_SIDE = 40 + 20;
const MARGIN_DESKTOP_BOTTOM = 20 * 5 + 10;

const MARGIN_MOBILE_TOP = 20 + 20 + 26 + 20;
const MARGIN_MOBILE_SIDE = 20 + 20;
const MARGIN_MOBILE_BOTTOM = 20 * 5 + 10;

const VICTORY_CONDITION = 5;

const PLAYER_ID_HUMAN = 1;
const PLAYER_ID_CPU = 2;
const PLAYER_ID_NEITHER = 3;

const SUPPORTED_LANGUAGES: string[] = [ 'en', 'hu' ];

function CalculateBoardSize(): { width: number, height: number } {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth < 768;
    const squareSize = 24;
    
    const boardWidth = screenWidth - (isMobile ? MARGIN_MOBILE_SIDE : MARGIN_DESKTOP_SIDE) * 2;
    const boardHeight = screenHeight - (isMobile ? (MARGIN_MOBILE_TOP + MARGIN_MOBILE_BOTTOM) : (MARGIN_DESKTOP_TOP + MARGIN_DESKTOP_BOTTOM));
    
    const boardX = Math.floor(boardWidth / squareSize);
    const actualSquareSize = boardWidth / boardX;
    const boardY = Math.floor(boardHeight / actualSquareSize);
    
    return {
        width: Math.max(VICTORY_CONDITION, boardX),
        height: Math.max(VICTORY_CONDITION, boardY)
    };
}

function CreateEmptyBoard(size: {width: number, height: number}): BoardSquareType[][] {
    let board: BoardSquareType[][] = new Array<BoardSquareType[]>();
    for (let y = 0; y < size.height; y++) {
        let row = new Array<BoardSquareType>();
        for (let x = 0; x < size.width; x++) {
            row.push({
                state: 0,
                strike: 0,
                highlight: false
            });
        }
        board.push(row);
    }
    return board;
}

export default function Game(): JSX.Element {
    const [languageCode, setLanguageCode] = useState(() => loadLanguage(SUPPORTED_LANGUAGES));
    const [strings, setStrings] = useState(() => LANGUAGE_STRING_TABLES[languageCode])
    
    const [winner, setWinner] = useState(0);
    const [board, updateBoard] = useState(() => CreateEmptyBoard(CalculateBoardSize()));
    const [difficulty, setDifficulty] = useState(AiDifficulty.Medium);
    
    const resetGame = (): void => {
        const boardSize = CalculateBoardSize();
        setWinner(0);
        updateBoard(CreateEmptyBoard(boardSize));
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
        if (winner !== 0) {
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
        
        boardCopy[y][x].state = PLAYER_ID_HUMAN;
        boardCopy[y][x].highlight = true;
        
        // Check win condition
        let winResult = checkWinCondition(boardCopy, VICTORY_CONDITION);
        if (winResult !== 0) {
            updateBoard(boardCopy);
            setWinner(winResult);
            return;
        }
        
        // Check draw condition
        if (countFreeSquares(boardCopy) === 0) {
            updateBoard(boardCopy);
            setWinner(PLAYER_ID_NEITHER);
            return;
        }
        
        // Let the enemy move
        const enemyMove = DefaultAi(cloneBoardState(boardCopy), VICTORY_CONDITION, difficulty);
        if (enemyMove != null &&
            isValidBoardIndex(enemyMove.x, enemyMove.y) &&
            boardCopy[enemyMove.y][enemyMove.x].state === 0)
        {
            boardCopy[enemyMove.y][enemyMove.x].state = PLAYER_ID_CPU;
            boardCopy[enemyMove.y][enemyMove.x].highlight = true;
        } else {
            console.error('Invalid value returned from AI:', enemyMove);
            return;
        }
        
        // Check win condition
        winResult = checkWinCondition(boardCopy, VICTORY_CONDITION);
        if (winResult !== 0) {
            updateBoard(boardCopy);
            setWinner(winResult);
        }
        
        // Check draw condition
        if (countFreeSquares(boardCopy) === 0) {
            updateBoard(boardCopy);
            setWinner(PLAYER_ID_NEITHER);
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
    }, [languageCode]);
    
    
    const aiDifficultyOptions: {value: number, label: string}[] = [
        { value: AiDifficulty.Medium, label: strings.difficulty.medium },
        { value: AiDifficulty.Easy,   label: strings.difficulty.easy },
    ];
    
    return (
        <LanguageContext.Provider value={strings}>
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
        </LanguageContext.Provider>
    );
}