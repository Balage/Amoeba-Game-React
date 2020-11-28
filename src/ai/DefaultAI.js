import { deepClone } from '../helpers/Utils'
import { AiDifficulty } from './AiDifficulty';

const PLAYER_HUMAN = 1;
const PLAYER_AI = 2;
const PLAYER_MARK = 10;

export default class DefaultAI {
    width = 0;
    height = 0;
    victoryCondition = 0;
    difficulty;
    
    constructor(width, height, victoryCondition, difficulty) {
        this.width = width;
        this.height = height;
        this.victoryCondition = victoryCondition;
        this.difficulty = difficulty;
    }
    
    // Get entire row (-) of squares intersecting the provided coordinates.
    getRowHorizontal(board, originX, originY) {
        let x = 0;
        let result = [];
        while (x < this.width) {
            result.push(board[originY][x]);
            x++;
        }
        return { index: originX, row: result };
    }
    
    // Get entire column (|) of squares intersecting the provided coordinates.
    getRowVertical(board, originX, originY) {
        let y = 0;
        let result = [];
        while (y < this.height) {
            result.push(board[y][originX]);
            y++;
        }
        return { index: originY, row: result };
    }
    
    // Get entire row of left diagonal (\) squares intersecting the provided coordinates.
    getRowDiagLeft(board, originX, originY) {
        let min = Math.min(originX, originY);
        let x = originX - min;
        let y = originY - min;
        let result = [];
        while (x < this.width && y < this.height) {
            result.push(board[y][x]);
            x++;
            y++;
        }
        return { index: min, row: result };
    }
    
    // Get entire row of right diagonal (/) squares intersecting the provided coordinates.
    getRowDiagRight(board, originX, originY) {
        let min = Math.min(originX, this.height - 1 - originY);
        let x = originX - min;
        let y = originY + min;
        let result = [];
        while (x < this.width && y >= 0) {
            result.push(board[y][x]);
            x++;
            y--;
        }
        return { index: min, row: result };
    }
    
    // Get row of squares from all 4 directions intersecting the provided coordinates.
    // Mark coordinates with the provided playerId.
    getCross(board, x, y, playerId) {
        // Get lines crossing [x, y]
        let cross = [
            this.getRowHorizontal(board, x, y),
            this.getRowVertical(board, x, y),
            this.getRowDiagLeft(board, x, y),
            this.getRowDiagRight(board, x, y),
        ];
        // Mark intersection
        for (let i = 0; i < 4; i++) {
            cross[i].row[cross[i].index] = playerId;
        }
        return cross;
    }
    
    // Count length of strike, starting at index.
    // If strike is enclosed and can never reach the length of victoryCondition, 0 is returned.
    countStrikeLength(row, index) {
        let playerId = row[index];
        let count = 1;
        let freeSpaceLeft = 0;
        let freeSpaceRight = 0;
        
        // Count left
        let i = index - 1;
        // Count consecutive player marks
        for (; i >= 0 && row[i] === playerId; i--) {
            count++;
        }
        // Count available space
        for (; i >= 0 && row[i] === 0; i--) {
            freeSpaceLeft++;
        }
        
        // Count right
        i = index + 1;
        // Count consecutive player marks
        for (; i < row.length && row[i] === playerId; i++) {
            count++;
        }
        // Count available space
        for (; i < row.length && row[i] === 0; i++) {
            freeSpaceRight++;
        }
        
        if ((count + freeSpaceLeft + freeSpaceRight) >= this.victoryCondition) {
            return {
                length: count,
                openSides: (freeSpaceLeft > 0 ? 1 : 0) + (freeSpaceRight > 0 ? 1 : 0)
            };
        } else {
            return {
                length: 0,
                openSides: 0
            };
        }
    }
    
    getMaxImportance(movesList) {
        return movesList.length ? Math.max.apply(Math, movesList.map(function(item) { return item.importance })) : 0;
    }
    
    getRandomItem(array) {
        return array.length ? array[Math.floor(Math.random() * array.length)] : null;
    }
    
    getPossibleMoves(board, playerId) {
        let list = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (board[y][x] === 0) {
                    // Calculate possible move
                    let cross = this.getCross(board, x, y, playerId);
                    
                    // Get score for move
                    let importance = 0;
                    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                        let strike = this.countStrikeLength(cross[rowIndex].row, cross[rowIndex].index);
                        if (strike.length >= 3) {
                            importance += Math.pow(10, strike.length);
                            
                            if (this.difficulty >= AiDifficulty.Medium) {
                                if (strike.openSides === 2) {
                                    importance += Math.pow(10, strike.length + 1) / 2;
                                }
                            }
                        }
                    }
                    
                    // Collect only the important ones
                    if (importance > 0) {
                        list.push({
                            x: x,
                            y: y,
                            importance: importance
                        })
                    }
                }
            }
        }
        return list;
    }
    
    getNextMove(board) {
        // Possible moves by AI
        let attackList = this.getPossibleMoves(board, PLAYER_AI);
        
        // Find instant wins
        for (let i = 0; i < attackList.length; i++) {
            let move = attackList[i];
            if (move.importance >= 100000) {
                console.log('AI Quick Attack [' + move.x + '; ' + move.y +  ']');
                return {
                    x: move.x,
                    y: move.y
                };
            }
        }
        
        // Possible moves by player
        let defendList = this.getPossibleMoves(board, PLAYER_HUMAN);
        
        // Find most important tasks
        let mostImportantAttack = this.getMaxImportance(attackList);
        let mostImportantDefense = this.getMaxImportance(defendList);
        
        if (mostImportantAttack > 0 && mostImportantAttack > mostImportantDefense) {
            // Attack
            let movesList = attackList.filter(item => item.importance === mostImportantAttack);
            let move = this.getRandomItem(movesList);
            
            console.log('AI Attack [' + move.x + '; ' + move.y +  '], score: ' + move.importance + ', chosen from ' + movesList.length + ' moves');
            return {
                x: move.x,
                y: move.y
            };
            
        } else if (mostImportantDefense > 0) {
            // Defend
            let movesList = defendList.filter(item => item.importance === mostImportantDefense);
            let move = this.getRandomItem(movesList);
            
            console.log('AI Defend [' + move.x + '; ' + move.y +  '], score: ' + move.importance + ', chosen from ' + movesList.length + ' moves');
            return {
                x: move.x,
                y: move.y
            };
        }
        
        // Random
        let randomMove = this.aiRandomExpansion(board);
        if (randomMove === null) {
            console.error('No available moves found!');
            return;
        }
        console.log('AI Random [' + randomMove.x + '; ' + randomMove.y + ']');
        return randomMove;
    }
    
    aiRandomExpansion(board) {
        let mask = deepClone(board);
        
        // Mark possible positions
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (mask[y][x] === PLAYER_HUMAN || mask[y][x] === PLAYER_AI) {
                    let startX = Math.max(x - 1, 0);
                    let startY = Math.max(y - 1, 0);
                    let endX = Math.min(x + 1, this.width - 1);
                    let endY = Math.min(y + 1, this.height - 1);
                    
                    for (let yy = startY; yy <= endY; yy++) {
                        for (let xx = startX; xx <= endX; xx++) {
                            if (mask[yy][xx] === 0) {
                                mask[yy][xx] = PLAYER_MARK;
                            }
                        }
                    }
                }
            }
        }
        
        // Collect candidates
        let candidates = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (mask[y][x] === PLAYER_MARK) {
                    candidates.push({x: x, y: y});
                }
            }
        }
        
        // Pick one randomly
        return this.getRandomItem(candidates);
    }
}