import { AiDifficulty } from './AiDifficulty';

const PLAYER_HUMAN = 1;
const PLAYER_AI = 2;
const PLAYER_MARK = 10;

type RowType = {
    index: number;
    row: number[];
};

type PossibleMoveType = {
    x: number;
    y: number;
    importance: number;
}

// Get entire row (-) of squares intersecting the provided coordinates.
function getRowHorizontal(board: number[][], originX: number, originY: number): RowType {
    const width = board[0].length;
    const result: number[] = [];
    for (let x = 0; x < width; x++) {
        result.push(board[originY][x]);
    }
    return {
        index: originX,
        row: result
    }
}

// Get entire column (|) of squares intersecting the provided coordinates.
function getRowVertical(board: number[][], originX: number, originY: number): RowType {
    const height = board.length;
    const result: number[] = [];
    for (let y = 0; y < height; y++) {
        result.push(board[y][originX]);
    }
    return {
        index: originY,
        row: result
    };
}

// Get entire row of left diagonal (\) squares intersecting the provided coordinates.
function getRowDiagLeft(board: number[][], originX: number, originY: number): RowType {
    const width = board[0].length;
    const height = board.length;
    const result: number[] = [];
    const min = Math.min(originX, originY);
    
    let x = originX - min;
    let y = originY - min;
    while (x < width && y < height) {
        result.push(board[y][x]);
        x++; y++;
    }
    return {
        index: min,
        row: result
    };
}

// Get entire row of right diagonal (/) squares intersecting the provided coordinates.
function getRowDiagRight(board: number[][], originX: number, originY: number): RowType {
    const width = board[0].length;
    const height = board.length;
    const result: number[] = [];
    const min = Math.min(originX, height - 1 - originY);
    
    let x = originX - min;
    let y = originY + min;
    while (x < width && y >= 0) {
        result.push(board[y][x]);
        x++; y--;
    }
    return {
        index: min,
        row: result
    };
}

// Get row of squares from all 4 directions intersecting the provided coordinates.
// Mark coordinates with the provided playerId.
function getCross(board: number[][], x: number, y: number, playerId: number): RowType[] {
    // Get lines crossing [x, y]
    const cross: RowType[] = [
        getRowHorizontal(board, x, y),
        getRowVertical(board, x, y),
        getRowDiagLeft(board, x, y),
        getRowDiagRight(board, x, y),
    ];
    // Mark intersection
    for (let i = 0; i < 4; i++) {
        cross[i].row[cross[i].index] = playerId;
    }
    return cross;
}

// Count length of strike, starting at index.
// If strike is enclosed and can never reach the length of victoryCondition, 0 is returned.
function countStrikeLength(row: number[], index: number, victoryCondition: number): {length: number, openSides: number} {
    const playerId = row[index];
    let count = 1;
    let freeSpaceLeft = 0;
    let freeSpaceRight = 0;
    let i: number;
    
    // Count left
    // Count consecutive player marks
    for (i = index - 1; i >= 0 && row[i] === playerId; i--) {
        count++;
    }
    // Count available space
    for (; i >= 0 && row[i] === 0; i--) {
        freeSpaceLeft++;
    }
    
    // Count right
    // Count consecutive player marks
    for (i = index + 1; i < row.length && row[i] === playerId; i++) {
        count++;
    }
    // Count available space
    for (; i < row.length && row[i] === 0; i++) {
        freeSpaceRight++;
    }
    
    if ((count + freeSpaceLeft + freeSpaceRight) >= victoryCondition) {
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

function getMaxImportance(movesList: PossibleMoveType[]): number {
    return movesList.length
        ? Math.max.apply(Math, movesList.map((item) => item.importance))
        : 0;
}

function getRandomItem<T>(array: T[]): T | null {
    return array.length ? array[Math.floor(Math.random() * array.length)] : null;
}

function getPossibleMoves(board: number[][], victoryCondition: number, difficulty: number, playerId: number): PossibleMoveType[] {
    const width = board[0].length;
    const height = board.length;
    const list: PossibleMoveType[] = [];
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (board[y][x] === 0) {
                // Calculate possible move
                const cross = getCross(board, x, y, playerId);
                
                // Get score for move
                let importance = 0;
                for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                    const strike = countStrikeLength(cross[rowIndex].row, cross[rowIndex].index, victoryCondition);
                    if (strike.length >= 3) {
                        importance += Math.pow(10, strike.length);
                        
                        if (difficulty >= AiDifficulty.Medium) {
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

function aiRandomExpansion(board: number[][]): {x: number, y: number} | null {
    const width = board[0].length;
    const height = board.length;
    const mask = board.map(row => row.map(item => item));
    
    // Mark possible positions
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (mask[y][x] === PLAYER_HUMAN || mask[y][x] === PLAYER_AI) {
                const startX = Math.max(x - 1, 0);
                const startY = Math.max(y - 1, 0);
                const endX = Math.min(x + 1, width - 1);
                const endY = Math.min(y + 1, height - 1);
                
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
    const candidates: {x: number, y: number}[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (mask[y][x] === PLAYER_MARK) {
                candidates.push({x: x, y: y});
            }
        }
    }
    
    // Pick one randomly
    return getRandomItem(candidates);
}

export default function DefaultAi(board: number[][], victoryCondition: number, difficulty: number): {x: number, y: number} | null {
    // Possible moves by AI
    const attackList = getPossibleMoves(board, victoryCondition, difficulty, PLAYER_AI);
        
    // Find instant wins
    for (let i = 0; i < attackList.length; i++) {
        const move = attackList[i];
        if (move.importance >= 100000) {
            console.log(`AI Quick Attack [${move.x}; ${move.y}]`);
            return {
                x: move.x,
                y: move.y
            };
        }
    }
    
    // Possible moves by player
    const defendList = getPossibleMoves(board, victoryCondition, difficulty, PLAYER_HUMAN);
    
    // Find most important tasks
    const mostImportantAttack = getMaxImportance(attackList);
    const mostImportantDefense = getMaxImportance(defendList);
    
    if (mostImportantAttack > 0 && mostImportantAttack > mostImportantDefense) {
        // Attack
        const movesList = attackList.filter(item => item.importance === mostImportantAttack);
        const move = getRandomItem(movesList);
        if (move === null) {
            console.error('No available moves found!');
            return null;
        }
        
        console.log(`AI Attack [${move.x}; ${move.y}], score: ${move.importance}, chosen from ${movesList.length} moves`);
        return {
            x: move.x,
            y: move.y
        };
        
    } else if (mostImportantDefense > 0) {
        // Defend
        const movesList = defendList.filter(item => item.importance === mostImportantDefense);
        const move = getRandomItem(movesList);
        if (move === null) {
            console.error('No available moves found!');
            return null;
        }
        
        console.log(`AI Defend [${move.x}; ${move.y}], score: ${move.importance}, chosen from ${movesList.length} moves`);
        return {
            x: move.x,
            y: move.y
        };
    }
    
    // Random
    const randomMove = aiRandomExpansion(board);
    if (randomMove === null) {
        console.error('No available moves found!');
        return null;
    }
    console.log(`AI Random [${randomMove.x}; ${randomMove.y}]`);
    return randomMove;
}