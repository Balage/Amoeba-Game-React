import { AiDifficulty } from './AiDifficulty';
import { getRandomItem, BoardIterator, BoardIteratorDirection } from './helper/AiHelper';

enum PlayerId {
    Unset = 0,
    Human = 1,
    AI = 2,
}

type PossibleMoveType = {
    x: number;
    y: number;
    importance: number;
}

function getMaxImportance(movesList: PossibleMoveType[]): number {
    return movesList.length
        ? Math.max.apply(Math, movesList.map((item) => item.importance))
        : 0;
}

// Count length of strike, starting at index.
// If strike is enclosed and can never reach the length of victoryCondition, 0 is returned.
function countStrikeLength(iterator: BoardIterator, victoryCondition: number): {length: number, openSides: number} {
    const playerId = iterator.get(0);
    let count = 1;
    let freeSpaceLeft = 0;
    let freeSpaceRight = 0;
    let i: number;
    
    // Count left
    // Count consecutive player marks
    for (i = -1; iterator.get(i) === playerId; i--) {
        count++;
    }
    // Count available space
    for (; i > -victoryCondition && iterator.get(i) === PlayerId.Unset; i--) {
        freeSpaceLeft++;
    }
    
    // Count right
    // Count consecutive player marks
    for (i = 1; iterator.get(i) === playerId; i++) {
        count++;
    }
    // Count available space
    for (; i < victoryCondition && iterator.get(i) === PlayerId.Unset; i++) {
        freeSpaceRight++;
    }
    
    if ((count + freeSpaceLeft + freeSpaceRight) >= victoryCondition) {
        // We only care about sides being open and having enough available cells.
        return {
            length: count,
            openSides: (freeSpaceLeft > 0 ? 1 : 0) + (freeSpaceRight > 0 ? 1 : 0)
        };
    } else {
        // No space to win
        return {
            length: 0,
            openSides: 0
        };
    }
}

function getPossibleMoves(board: number[][], victoryCondition: number, difficulty: number, playerId: number): PossibleMoveType[] {
    const width = board[0].length - 1;
    const height = board.length - 1;
    const list: PossibleMoveType[] = [];
    
    for (let y = 1; y < height; y++) {
        for (let x = 1; x < width; x++) {
            if (board[y][x] === PlayerId.Unset) {
                // Check for at least one neighbor of same player ID
                if (!hasNeighbor(board, x, y, playerId)) {
                    continue;
                }
                
                // Set cell with move
                board[y][x] = playerId;
                
                // Calculate possible move
                const iterators: BoardIterator[] = [
                    new BoardIterator(board, x, y, BoardIteratorDirection.Horizontal),
                    new BoardIterator(board, x, y, BoardIteratorDirection.Vertical),
                    new BoardIterator(board, x, y, BoardIteratorDirection.DiagonalLeft),
                    new BoardIterator(board, x, y, BoardIteratorDirection.DiagonalRight),
                ];
                
                // Get score for move
                let importance = 0;
                for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
                    const strike = countStrikeLength(iterators[rowIndex], victoryCondition);
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
                
                // Reset cell
                board[y][x] = 0;
            }
        }
    }
    return list;
}

const NEIGHBORS: [number, number][] = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
];

// Lack of boundary check expects table to be padded.
export function hasNeighbor(board: number[][], x: number, y: number, playerId: number): boolean {
    for (let index = 0; index < NEIGHBORS.length; index++) {
        if (board[y + NEIGHBORS[index][1]][x + NEIGHBORS[index][0]] === playerId) {
            return true;
        }
    }
    return false;
}

export function hasAnyPlayerNeighbor(board: number[][], x: number, y: number): boolean {
    for (let index = 0; index < NEIGHBORS.length; index++) {
        const value = board[y + NEIGHBORS[index][1]][x + NEIGHBORS[index][0]];
        if (value === PlayerId.Human || value === PlayerId.AI) {
            return true;
        }
    }
    return false;
}

function aiRandomExpansion(board: number[][]): {x: number, y: number} | null {
    const width = board[0].length - 1;
    const height = board.length - 1;
    const candidates: {x: number, y: number}[] = [];
    
    for (let y = 1; y < height; y++) {
        for (let x = 1; x < width; x++) {
            if (board[y][x] === PlayerId.Unset) {
                if (hasAnyPlayerNeighbor(board, x, y)) {
                    candidates.push({x: x, y: y});
                }
            }
        }
    }
    
    // Pick one randomly
    return getRandomItem(candidates);
}

export default function DefaultAi(board: number[][], victoryCondition: number, difficulty: number): {x: number, y: number} | null {
    const startTime = performance.now();
    const result = DefaultAiCall(board, victoryCondition, difficulty);
    const deltaTime = performance.now() - startTime;
    
    if (result === null) {
        console.error('AI: No available moves found!');
        return null;
    } else {
        console.log(`AI: ${result.log} (${deltaTime.toFixed(0)} ms)`);
        return {
            x: result.x - 1, // (Corrigate for padding)
            y: result.y - 1,
        };
    }
}

function DefaultAiCall(board: number[][], victoryCondition: number, difficulty: number): {log: string, x: number, y: number} | null {
    // Possible moves by AI
    const attackList = getPossibleMoves(board, victoryCondition, difficulty, PlayerId.AI);
        
    // Find instant wins
    for (let i = 0; i < attackList.length; i++) {
        const move = attackList[i];
        if (move.importance >= 100000) {
            return {
                log: `Quick Attack.`,
                x: move.x,
                y: move.y,
            };
        }
    }
    
    // Possible moves by player
    const defendList = getPossibleMoves(board, victoryCondition, difficulty, PlayerId.Human);
    
    // Find most important tasks
    const mostImportantAttack = getMaxImportance(attackList);
    const mostImportantDefense = getMaxImportance(defendList);
    
    if (mostImportantAttack > 0 && mostImportantAttack > mostImportantDefense) {
        // Attack
        const movesList = attackList.filter(item => item.importance === mostImportantAttack);
        const move = getRandomItem(movesList);
        if (move === null) {
            return null;
        }
        
        return {
            log: `Attack. Score: ${move.importance}, chosen from ${movesList.length} moves.`,
            x: move.x,
            y: move.y,
        };
        
    } else if (mostImportantDefense > 0) {
        // Defend
        const movesList = defendList.filter(item => item.importance === mostImportantDefense);
        const move = getRandomItem(movesList);
        if (move === null) {
            return null;
        }
        
        return {
            log: `Defend. Score: ${move.importance}, chosen from ${movesList.length} moves.`,
            x: move.x,
            y: move.y,
        };
    }
    
    // Random
    const randomMove = aiRandomExpansion(board);
    if (randomMove === null) {
        return null;
    }
    return {
        log: `Random.`,
        x: randomMove.x,
        y: randomMove.y,
    };
}