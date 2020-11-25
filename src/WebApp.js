import React from 'react';
import Game from './Game';

export default class WebApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: this.getUserLanguage([ 'en', 'hu' ])
        };
    }
    
    getUserLanguage(supported) {
        if (typeof navigator !== 'undefined') {
            if (typeof navigator.language !== 'undefined') {
                let userLanguage = ('' + navigator.language).split('-')[0].toLowerCase();
                if (supported.includes(userLanguage)) {
                    return userLanguage;
                }
            }
        }
        return supported[0];
    }
    
    render() {
        return <Game language={this.state.language} />
    }
}