import './CardStyles.css';

export function CardSVG(props: Readonly<{
    suit: string,
    rank: string,
    width?: number,
    height?: number,
    className?: string
}>) {
    const suitSymbol: { [key: string]: string } = {
        h: "♥",
        s: "♠",
        d: "♦",
        c: "♣",
        "?": "?",
    };
    const width = props.width || 50;
    const height = props.height || 75;

    return (
        <div className={props.className}>
            <svg
                width={width}
                height={height}
                viewBox="0 0 50 75"
                xmlns="http://www.w3.org/2000/svg"
                className={`svg-card suit-${props.suit === "?" ? "u" : props.suit}`}
            >
                <rect width="50" height="75" rx="8" ry="8"
                      strokeWidth="1.5"/>
                <text x="25" y="30" fontSize="30" fontFamily="monospace"
                      textAnchor="middle">{props.rank}
                </text>
                <text x="25" y="65" fontSize="40"
                      fontFamily="monospace" textAnchor="middle">
                    {suitSymbol[props.suit]}
                </text>
            </svg>
        </div>
    );
}

export default CardSVG;