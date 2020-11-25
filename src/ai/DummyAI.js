import { deepClone } from '../helpers/ArrayHelper'

export default class DummyAI {
    width = 0;
    height = 0;
    lastBoard = null;
    
    constructor(width, height, victoryCondition) {
        this.width = width;
        this.height = height;
    }
    
    getNextMove(board) {
        // Get user's move
        let playerX = 0;
        let playerY = 0;
        if (this.lastBoard == null) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (board[y][x] === 1) {
                        playerX = x;
                        playerY = y;
                    }
                }
            }
        } else {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (board[y][x] === 1 && board[y][x] !== this.lastBoard[y][x]) {
                        playerX = x;
                        playerY = y;
                    }
                }
            }
        }		
        this.lastBoard = deepClone(board);
        
        // Look for free spaces around
        let freeSpaces = [];
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                let xx = playerX + x;
                let yy = playerY + y;
                if (0 <= xx && xx < this.width && 0 <= y && yy < this.height) {
                    if (board[yy][xx] === 0) {
                        freeSpaces.push({
                            x: xx,
                            y: yy
                        });
                    }
                }
            }
        }
        
        // Try to use free space
        if (freeSpaces.length) {
            let index = Math.floor(Math.random() * freeSpaces.length);
            return freeSpaces[index];
        }
        
        // Look for another free space, anywhere
        let upperLimit = this.width * this.height;
        let x = playerX;
        let y = playerY;
        let i = 0;
        while (i < upperLimit) {
            if (board[y][x] === 0) {
                return {
                    x: x,
                    y: y
                }
            }
            
            x++;
            if (x >= this.width) {
                x = 0;
                y++;
                if (y >= this.height) {
                    y = 0;
                }
            }
        }
        
        // This should not happen
        console.log('No more free space!');
        return { x: 0, y: 0 };
    }
}