import React from 'react';

import GameHeader from './GameHeader';
import Board from './Board';

import AiFactory from './AiFactory';
import AiSelector from './AiSelector';

import img_board_o from './images/board_o.svg';
import img_board_x from './images/board_x.svg';
import img_strike_diagonal from './images/strike_diagonal.svg';
import img_strike_straight from './images/strike_straight.svg';

import { deepClone } from './helpers/ArrayHelper'

const BOARD_STATE = 0;
const BOARD_STRIKE = 1;
const BOARD_HIGHLIGHT = 2;

const MARGIN_DESKTOP_TOP = 106;
const MARGIN_DESKTOP_SIDE = 60;
const MARGIN_DESKTOP_BOTTOM = 100 + 10;

const MARGIN_MOBILE_TOP = 86;
const MARGIN_MOBILE_SIDE = 40;
const MARGIN_MOBILE_BOTTOM = 100 + 10;

const VICTORY_CONDITION = 5;

const PLAYER_ID_HUMAN = 1;
const PLAYER_ID_CPU = 2;
const PLAYER_ID_NEITHER = 3;


export default class Game extends React.Component {
    aiFactory;
    
    constructor(props) {
        super(props);
        
        this.aiFactory = new AiFactory();
        let boardSize = this.calculateBoardSize();
        this.state = {
            // Game board
            boardSize: boardSize,
            board: this.createBoard(boardSize.width, boardSize.height),
            winner: 0,
            
            // AI
            aiSelectOptions: this.aiFactory.getList(),
            aiSelectIndex: 0,
            currentAi: this.aiFactory.getAi(0, boardSize.width, boardSize.height, VICTORY_CONDITION),
        };
    }
    
    componentDidMount() {
        // Preload images
        const imageList = [
            img_board_o,
            img_board_x,
            img_strike_diagonal,
            img_strike_straight
        ];
        imageList.forEach((image) => {
            new Image().src = image
        });
    }
    
    resetGame() {
        let boardSize = this.calculateBoardSize();
        let aiIndex = this.state.aiSelectIndex;
        this.setState({
            boardSize: boardSize,
            board: this.createBoard(boardSize.width, boardSize.height),
            winner: 0,
            currentAi: this.aiFactory.getAi(aiIndex, boardSize.width, boardSize.height, VICTORY_CONDITION),
        })
    }
    
    changeAi(index) {
        this.setState({
            aiSelectIndex: index
        }, this.resetGame);
    }
    
    calculateBoardSize() {
        let screenWidth = window.innerWidth;
        let screenHeight = window.innerHeight;
        let isMobile = screenWidth < 768;
        let squareSize = isMobile ? 24 : 24;
        
        let boardWidth = screenWidth - (isMobile ? MARGIN_MOBILE_SIDE : MARGIN_DESKTOP_SIDE) * 2;
        let boardHeight = screenHeight - (isMobile ? (MARGIN_MOBILE_TOP + MARGIN_MOBILE_BOTTOM) : (MARGIN_DESKTOP_TOP + MARGIN_DESKTOP_BOTTOM));
        
        let boardX = Math.floor(boardWidth / squareSize);
        let actualSquareSize = boardWidth / boardX;
        let boardY = Math.floor(boardHeight / actualSquareSize);
        
        return {
            width: Math.max(3, boardX),
            height: Math.max(3, boardY)
        };
    }
    
    createBoard(width, height) {
        return Array(height).fill(null).map(() => new Array(width).fill(null).map(() => [0, 0, false]));
    }
    
    boardForeach(board, func) {
        for (let y = 0; y < board.length; y++) {
            for (let x = 0; x < board[y].length; x++) {
                func(board[y][x], x, y);
            }
        }
    }
    
    cloneBoardForAi(board) {
        return board.map((row) => row.map((item) => item[0]));
    }
    
    onClickBoard(x, y) {
        // Game is finished
        if (this.state.winner !== 0) {
            return;
        }
        
        const board = deepClone(this.state.board);
        
        // Square is already marked
        if (board[y][x][BOARD_STATE] !== 0) {
            return;
        }
        
        // Reset highlight
        this.boardForeach(board, function(square) {
            square[2] = false;
        });
        
        board[y][x][BOARD_STATE] = PLAYER_ID_HUMAN;
        board[y][x][BOARD_HIGHLIGHT] = true;
        
        // Check win condition
        let winResult = this.checkWinCondition(board, VICTORY_CONDITION);
        if (winResult !== 0) {
            this.setState({
                board: board,
                winner: winResult
            })
            return;
        }
        
        // Check draw condition
        let freeSpaces = this.countFreeSquares(board);
        if (freeSpaces === 0) {
            this.setState({
                board: board,
                winner: PLAYER_ID_NEITHER
            })
            return;
        }
        
        // Let the enemy move
        let move = this.state.currentAi.getNextMove(this.cloneBoardForAi(board));
        let isValidMove = this.isValidBoardIndex(move.x, move.y) && board[move.y][move.x][BOARD_STATE] === 0;
        if (isValidMove) {
            board[move.y][move.x][BOARD_STATE] = PLAYER_ID_CPU;
            board[move.y][move.x][BOARD_HIGHLIGHT] = true;
        } else {
            console.error('Invalid value returned from AI:', move);
            return;
        }
        
        // Check win condition
        winResult = this.checkWinCondition(board, VICTORY_CONDITION);
        if (winResult !== 0) {
            this.setState({
                board: board,
                winner: winResult
            })
        }
        
        // Check draw condition
        freeSpaces = this.countFreeSquares(board);
        if (freeSpaces === 0) {
            this.setState({
                board: board,
                winner: PLAYER_ID_NEITHER
            })
            return;
        }
        
        this.setState({board: board});
    }
    
    isValidBoardIndex(x, y) {
        return (
            0 <= x && x < this.state.boardSize.width &&
            0 <= y && y < this.state.boardSize.height
        );
    }
    
    checkWinCondition(board, requiredCount = 5) {
        const width = this.state.boardSize.width;
        const height = this.state.boardSize.height;
        var x, y, lastNumber, count;
        
        var check = function (squareState, angleIndex, stepX, stepY) {
            if (squareState !== lastNumber) {
                lastNumber = squareState;
                count = 1;
            } else if (squareState !== 0) {
                count++;
            }
            if (count >= requiredCount) {
                // Strike square found so far
                for (let i = 0; i < count; i++) {
                    board[y - stepY * i][x - stepX * i][BOARD_STRIKE] = angleIndex;
                }
                // Length can be bigger than requiredCount, try to flood fill in other direction.
                for (let i = 1; ; i++) {
                    let xx = x + stepX * i;
                    let yy = y + stepY * i;
                    if (xx < 0 || yy < 0 || xx >= width || yy >= height || board[yy][xx][BOARD_STATE] !== squareState) {
                        break;
                    }
                    board[yy][xx][BOARD_STRIKE] = angleIndex;
                }
                return squareState;
            }
        }
        
        // Horizontal "-"
        for (y = 0; y < height; y++) {
            lastNumber = 0;
            count = 0;
            for (x = 0; x < width; x++) {
                let result = check(board[y][x][BOARD_STATE], 1, 1, 0);
                if (result > 0) {
                    return result;
                }
            }
        }
        
        // Vertical "|"
        for (x = 0; x < width; x++) {
            lastNumber = 0;
            count = 0;
            for (y = 0; y < height; y++) {
                let result = check(board[y][x][BOARD_STATE], 3, 0, 1);
                if (result > 0) {
                    return result;
                }
            }
        }
        
        // Diagonal "\"
        for (let startY = height - requiredCount; startY > 0; startY--) {
            lastNumber = 0;
            count = 0;
            for (x = 0, y = startY; x < width && y < height; x++, y++) {
                let result = check(board[y][x][BOARD_STATE], 2, 1, 1);
                if (result > 0) {
                    return result;
                }
            }
        }
        for (let startX = 0; startX <= width - requiredCount; startX++) {
            lastNumber = 0;
            count = 0;
            for (x = startX, y = 0; x < width && y < height; x++, y++) {
                let result = check(board[y][x][BOARD_STATE], 2, 1, 1);
                if (result > 0) {
                    return result;
                }
            }
        }
        
        // Diagonal "/"
        for (let startY = requiredCount - 1; startY < height; startY++) {
            lastNumber = 0;
            count = 0;
            for (x = 0, y = startY; x < width && y >= 0; x++, y--) {
                let result = check(board[y][x][BOARD_STATE], 4, 1, -1);
                if (result > 0) {
                    return result;
                }
            }
        }
        for (let startX = 1; startX <= width - requiredCount; startX++) {
            lastNumber = 0;
            count = 0;
            for (x = startX, y = height - 1; x < width && y >= 0; x++, y--) {
                let result = check(board[y][x][BOARD_STATE], 4, 1, -1);
                if (result > 0) {
                    return result;
                }
            }
        }
        
        return 0;
    }
    
    countFreeSquares(board) {
        var count = 0;
        this.boardForeach(board, function(square) {
            if (square[0] === 0) {
                count++;
            }
        });
        return count;
    }
    
    render() {
        return (
            <div className="game-holder">
                <main className="paper-page">
                    <GameHeader winner={this.state.winner} onResetClick={() => this.resetGame()} />
                    <Board board={this.state.board} onClick={(x, y) => this.onClickBoard(x, y)} />
                    <div className="footer-ai">
                        <label>
                            Opponent AI:
                            <AiSelector options={this.state.aiSelectOptions} value={this.state.aiSelectIndex} onChange={(index) => this.changeAi(index)} />
                        </label>
                    </div>
                </main>
                <footer>
                    Copyright 2020 Balázs Vecsey, <a href="https://vbstudio.hu/">vbstudio.hu</a>
                </footer>
            </div>
        );
    }
}