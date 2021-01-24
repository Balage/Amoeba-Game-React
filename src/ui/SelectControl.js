import React from 'react';
import { LanguageContext } from '../LanguageContext';
import { getString } from '../helpers/Utils.js';

export default function SelectControl(props) {
    const strings = React.useContext(LanguageContext);
    return (
        <label className={props.className}>
            {props.label}
            <select value={props.value} onChange={(event) => props.onChange(event.target.value)}>
                {props.options.map((item) =>
                    <option key={item.value} value={item.value}>{getString(strings, item.label)}</option>
                )}
            </select>
        </label>
    );
}