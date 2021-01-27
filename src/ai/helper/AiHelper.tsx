//
// BOARD
//
export enum BoardIteratorDirection {
    Horizontal = 0,
    Vertical = 1,
    DiagonalLeft = 2, // "\"
    DiagonalRight = 3, // "/"
}

const ITERATOR_DIRECTION_VECTOR: [number, number][] = [
    [1, 0], // -
    [0, 1], // |
    [1, 1], // \
    [1, -1], // /
];

export class BoardIterator {
    private _table: number[][];
    private _x: number;
    private _y: number;
    private _direction: BoardIteratorDirection;
    
    constructor(table: number[][], x: number, y: number, direction: BoardIteratorDirection) {
        this._table = table;
        this._x = x;
        this._y = y;
        this._direction = direction;
    }
    
    // Note: Lack of boundary check expects table to be padded, and iteration to stop at padding values.
    public get(offset: number): number {
        const x = this._x + ITERATOR_DIRECTION_VECTOR[this._direction][0] * offset;
        const y = this._y + ITERATOR_DIRECTION_VECTOR[this._direction][1] * offset;
        return this._table[y][x];
    }
};

//
// ARRAYS
//
export function getRandomItem<T>(array: T[]): T | null {
    return array.length ? array[Math.floor(Math.random() * array.length)] : null;
}