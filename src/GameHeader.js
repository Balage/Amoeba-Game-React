import React from 'react';
import { LanguageContext } from './LanguageContext'

export default class GameHeader extends React.Component {
    static contextType = LanguageContext;
    
    getVictoryText(winner) {
        let strings = this.context;
        switch (winner) {
            case 1: return strings.result.won;
            case 2: return strings.result.lose;
            default: return strings.result.won.draw;
        }
    }
    
    render() {
        let strings = this.context;
        if (this.props.winner === 0) {
            return (
                <div className="header-normal">
                    <div className="header-title">{strings.title}</div>
                    <button className="restart-button" onClick={() => this.props.onResetClick()}></button>
                </div>
            );
        } else {
            return (
                <div className="header-winner">
                    {this.getVictoryText(this.props.winner)} <button className="link-button" onClick={() => this.props.onResetClick()}>{strings.result.newGame}</button>
                </div>
            );
        }
    }
}