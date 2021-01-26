import React from 'react';
import { StringTable } from '../localization/StringTableTypes';
import { StringsContext } from '../localization/StringsContext';

function GetVictoryText(strings: StringTable, winner: number): string {
    switch (winner) {
        case 1: return strings.result.won;
        case 2: return strings.result.lose;
        default: return strings.result.draw;
    }
}

export default function GameHeader(props: {
    winner: number,
    onResetClick: () => void
}): JSX.Element
{
    const strings = React.useContext(StringsContext);
    
    if (props.winner === 0) {
        return (
            <div className="header-normal">
                <div className="header-title">{strings.title}</div>
                <button className="restart-button" onClick={props.onResetClick}></button>
            </div>
        );
    } else {
        return (
            <div className="header-winner">
                {GetVictoryText(strings, props.winner)} <button className="link-button" onClick={() => props.onResetClick()}>{strings.result.newGame}</button>
            </div>
        );
    }
}