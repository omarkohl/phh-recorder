import { useState } from 'react';
import Card from './Card';

export function CardInput<T extends Card[]>(props: Readonly<{
    cards: T,
    onCardsUpdate: (cards: T) => void
}>) {
    const [inputValue, setInputValue] = useState(props.cards.map(card => card.toString()).join(''));
    const [error, setError] = useState<string | null>(null);

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
            <input
                type="text"
                className={`w-full px-2 py-1 border ${error ? 'border-red-500' : 'border-transparent'} bg-transparent cursor-pointer rounded-md focus:border-gray-300 focus:bg-white focus:cursor-text font-mono`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
            />
            {error && <p className="text-red-500 text-sm mt-1 text-left">{error}</p>}
        </div>
    );
}
