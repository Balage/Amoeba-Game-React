import React from 'react';

export default function AiSelector(props) {
    return (
        <select value={props.value} onChange={(event) => props.onChange(event.target.value)}>
            {props.options.map((item) =>
                <option key={item.value} value={item.value}>{item.label}</option>
            )}
        </select>
    );
}