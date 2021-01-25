import React from 'react';
import { BoardSquareType } from './BoardHelper';

const BOARD_STRIKE_CLASS = [
    '',
    'strike-horizontal',
    'strike-diag-left',
    'strike-vertical',
    'strike-diag-right',
];

function BoardSquareStrike(props: {value: number}): JSX.Element | null {
    if (props.value > 0) {
        return <div className={BOARD_STRIKE_CLASS[props.value]}></div>;
    }
    return null;
}

const BOARD_MARK_CLASS = [
    '',
    'fill-x',
    'fill-o',
];

export default function Board(props: {
    board: BoardSquareType[][],
    onClick: (x: number, y: number) => void
}): JSX.Element {
    return (
        <div className="board">
            {props.board.map((row, y) =>
                <div key={y} className="board-row">
                    {row.map((item, x) =>
                        <button
                            key={`${x.toString()}-${y.toString()}`}
                            className={`${BOARD_MARK_CLASS[item.state]} ${item.highlight ? 'highlight' : ''}`}
                            onMouseDown={() => props.onClick(x, y)}
                        >
                            <BoardSquareStrike value={item.strike} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}