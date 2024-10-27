import {useEffect, useState} from 'react';
import Card from './Card';
import {Input} from "@headlessui/react";
import clsx from "clsx";

export function CardInput<T extends Card[]>(props: Readonly<{
    cards: T,
    onCardsUpdate: (cards: T) => void
}>) {
    const [inputValue, setInputValue] = useState(props.cards.map(card => card.toString()).join(''));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setInputValue(props.cards.map(card => card.toString()).join(''));
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
            props.onCardsUpdate(cards);
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div>
            <Input
                type="text"
                className={clsx(
                    "w-full px-2 py-1 font-mono",
                    error ? "border-2 border-red-500" : "border border-transparent",
                    "bg-transparent cursor-pointer rounded-md",
                    "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:cursor-text"
                )}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
            />
            {error && <p className="text-red-500 text-sm mt-1 text-left">{error}</p>}
        </div>
    );
}
