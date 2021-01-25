export default function LanguageSelector(props: {
    languages: string[],
    selected: string,
    onChange: (newLanguageCode: string) => void,
    className: string,
}): JSX.Element {
    return (
        <div className={props.className}>
            {props.languages.map((item) =>
                <label key={item}>
                    <input
                        type="radio"
                        name="language"
                        value={item}
                        checked={props.selected === item}
                        onChange={() => props.onChange(item)}
                    />
                    <span>{item}</span>
                </label>
            )}
        </div>
    );
}