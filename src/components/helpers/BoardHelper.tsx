export type BoardSquareType = {
    state: number,
    strike: number,
    highlight: boolean
};

export type BoardType = BoardSquareType[][];

export function createEmptyBoard(size: {width: number, height: number}): BoardType {
    let board: BoardType = new Array<BoardSquareType[]>();
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

export function cloneBoard(board: BoardType): BoardType {
    return board.map(row => row.map(item => ({
        state: item.state,
        strike: item.strike,
        highlight: item.highlight,
    })));
}

export function cloneBoardState(board: BoardType): number[][] {
    return board.map((row) => row.map((item) => item.state));
}

export function foreachBoard(
    board: BoardType,
    callback: (item: BoardSquareType, x: number, y: number) => void
): void {
    for (let y = 0; y < board.length; y++) {
        const row = board[y];
        for (let x = 0; x < row.length; x++) {
            callback(row[x], x, y);
        }
    }
}

export function checkWinCondition(board: BoardType, requiredCount: number = 5): number {
    const width = board[0].length;
    const height = board.length;
    
    var x: number;
    var y: number;
    var lastNumber: number;
    var count: number;
    
    const check = (squareState: number, angleIndex: number, stepX: number, stepY: number): number => {
        if (squareState !== lastNumber) {
            lastNumber = squareState;
            count = 1;
        } else if (squareState !== 0) {
            count++;
        }
        if (count >= requiredCount) {
            // Strike square found so far
            for (let i = 0; i < count; i++) {
                board[y - stepY * i][x - stepX * i].strike = angleIndex;
            }
            // Length can be bigger than requiredCount, try to flood fill in other direction.
            for (let i = 1; ; i++) {
                let xx = x + stepX * i;
                let yy = y + stepY * i;
                if (xx < 0 || yy < 0 || xx >= width || yy >= height || board[yy][xx].state !== squareState) {
                    break;
                }
                board[yy][xx].strike = angleIndex;
            }
            return squareState;
        }
        return 0;
    }
    
    // Horizontal "-"
    for (y = 0; y < height; y++) {
        lastNumber = 0;
        count = 0;
        for (x = 0; x < width; x++) {
            let result = check(board[y][x].state, 1, 1, 0);
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
            let result = check(board[y][x].state, 3, 0, 1);
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
            let result = check(board[y][x].state, 2, 1, 1);
            if (result > 0) {
                return result;
            }
        }
    }
    for (let startX = 0; startX <= width - requiredCount; startX++) {
        lastNumber = 0;
        count = 0;
        for (x = startX, y = 0; x < width && y < height; x++, y++) {
            let result = check(board[y][x].state, 2, 1, 1);
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
            let result = check(board[y][x].state, 4, 1, -1);
            if (result > 0) {
                return result;
            }
        }
    }
    for (let startX = 1; startX <= width - requiredCount; startX++) {
        lastNumber = 0;
        count = 0;
        for (x = startX, y = height - 1; x < width && y >= 0; x++, y--) {
            let result = check(board[y][x].state, 4, 1, -1);
            if (result > 0) {
                return result;
            }
        }
    }
    
    return 0;
}

export function countFreeSquares(board: BoardType): number {
    var count = 0;
    foreachBoard(board, (item) => {
        if (item.state === 0) {
            count++;
        }
    });
    return count;
}