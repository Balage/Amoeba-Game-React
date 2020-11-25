import React from 'react';

export default class GameHeader extends React.Component {
    getVictoryText(winner) {
        switch (winner) {
            case 1: return 'You won!';
            case 2: return 'You lose!';
            default: return 'Draw!';
        }
    }
    
    render() {
        if (this.props.winner === 0) {
            return (
                <div className="header-normal">
                    <div className="header-title">Amoeba</div>
                    <button className="link-button" onClick={() => this.props.onResetClick()}>restart game</button>
                </div>
            );
        } else {
            return (
                <div className="header-winner">
                    {this.getVictoryText(this.props.winner)} <button className="link-button" onClick={() => this.props.onResetClick()}>New game?</button>
                </div>
            );
        }
    }
}