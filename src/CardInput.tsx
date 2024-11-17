import {useEffect, useState} from 'react';
import Card from './Card';
import {Input} from "@headlessui/react";
import clsx from "clsx";
import CardSVG from "./CardSVG.tsx";

export function CardInput<T extends Card[]>(props: Readonly<{
    cards: T,
    onCardsUpdate: (cards: T) => void,
    className?: string,
}>) {
    const [inputValue, setInputValue] = useState(props.cards.map(card => card.toString()).join(''));
    const [error, setError] = useState<string | null>(null);
    const [currentCards, setCurrentCards] = useState(props.cards);

    useEffect(() => {
        setInputValue(props.cards.map(card => card.toString()).join(''));
        setCurrentCards(props.cards);
    }, [props.cards]);

    const handleBlur = () => {
        const expectedNumCards = props.cards.length;
        let content = inputValue.replace(/\s/g, '');
        if (content.length === 0) {
            // set all to unknown as a convenience to the user
            content = '??'.repeat(expectedNumCards);
        }
        const cardStrings = content.match(/.{1,2}/g) || [];
        if (cardStrings.length !== expectedNumCards) {
            setError(`Please enter exactly ${expectedNumCards} cards.`);
            return;
        }

        try {
            const cards = cardStrings.map(cardStr => new Card(cardStr[0], cardStr[1])) as T;
            setError(null); // Clear error if validation passes
            setInputValue(cards.map(card => card.toString()).join(''));
            setCurrentCards(cards);
            props.onCardsUpdate(cards);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className={props.className}>
            <div className="flex">
                {currentCards.map((card, i) => (
                    <CardSVG
                        key={i}
                        suit={card.suit}
                        rank={card.rank}
                        width={25}
                        height={37}
                        className={clsx({"ml-1": i !== 0})}
                    />
                ))}
                <Input
                    type="text"
                    className={clsx(
                        "w-full ml-1 px-1 py-1 font-mono",
                        error ? "border-2 border-red-500" : "border border-transparent",
                        "bg-transparent cursor-pointer rounded-md",
                        "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:cursor-text",
                        "text-sm",
                        "text-gray-400 focus:text-black",
                    )}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1 text-left">{error}</p>}
        </div>
    );
}
