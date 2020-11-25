import React from 'react';

const BOARD_STRIKE_CLASS = [
    '',
    'strike-horizontal',
    'strike-diag-left',
    'strike-vertical',
    'strike-diag-right',
];

function BoardSquareStrike(props) {
    if (props.value > 0) {
        return <div className={BOARD_STRIKE_CLASS[props.value]}></div>;
    }
    return '';
}

const BOARD_MARK_CLASS = [
    '',
    'fill-x',
    'fill-o',
];

export default function BoardSquare(props) {
    return (
        <button className={BOARD_MARK_CLASS[props.value[0]] + ' ' + (props.value[2] ? 'highlight' : '')} onMouseDown={() => props.onClick()}>
            <BoardSquareStrike value={props.value[1]} />
        </button>
    );
}