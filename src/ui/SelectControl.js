import React from 'react';
import { LanguageContext } from '../LanguageContext';
import { getString } from '../helpers/Utils.js';

export default class SelectControl extends React.Component {
    static contextType = LanguageContext;
    
    render() {
        let strings = this.context;
        return (
            <label className={this.props.className}>
                {this.props.label}
                <select value={this.props.value} onChange={(event) => this.props.onChange(event.target.value)}>
                    {this.props.options.map((item) =>
                        <option key={item.value} value={item.value}>{getString(strings, item.label)}</option>
                    )}
                </select>
            </label>
        );
    }
}