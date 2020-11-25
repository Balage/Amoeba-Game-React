import React from 'react';
import BoardSquare from './BoardSquare';

export default function Board(props) {
    const boardItems = props.board.map((row, y) =>
        <div key={y} className="board-row">
            {row.map((item, x) =>
                <BoardSquare
                    key={x.toString() + '-' + y.toString()}
                    value={item}
                    onClick={() => props.onClick(x, y)}
                />
            )}
        </div>
    );
    return (
        <div className="board">
            {boardItems}
        </div>
    );
}