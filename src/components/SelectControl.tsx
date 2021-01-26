export default function SelectControl(props: {
    className: string,
    label: string,
    options: {value: number, label: string}[],
    value: number,
    onChange: (newValue: number) => void
}): JSX.Element {
    return (
        <label className={props.className}>
            {props.label}
            <select value={props.value} onChange={(event) => props.onChange(Number(event.target.value))}>
                {props.options.map((item) =>
                    <option key={item.value} value={item.value}>{item.label}</option>
                )}
            </select>
        </label>
    );
}