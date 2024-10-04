import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";

interface BlindsInputProps {
    initialBlinds: number[];
    onBlindsChange: (blinds: number[]) => void;
}

function BlindsInput({ initialBlinds, onBlindsChange }: Readonly<BlindsInputProps>) {
    const [inputValue, setInputValue] = useState(initialBlinds.join(', '));
    const [error, setError] = useState<string | null>(null);

    const handleBlindsChange = useCallback(
        debounce((value: string) => {
            try {
                const parsedBlinds = value.split(',').filter(s => s.trim() !== '').map(s => {
                    const num = Number(s);
                    if (isNaN(num)) {
                        throw new Error("Invalid number");
                    }
                    return num;
                });
                setInputValue(parsedBlinds.join(', ')); // Update inputValue with canonical form
                setError(null);
                onBlindsChange(parsedBlinds);
            } catch (e) {
                setError("Please enter a valid comma-separated list of numbers.");
            }
        }, 1000),
        [onBlindsChange]
    );

    useEffect(() => {
        setInputValue(initialBlinds.join(', '));
    }, [initialBlinds]);

    return (
        <>
            <label htmlFor="blinds" className="block text-sm font-medium text-gray-700">Blinds</label>
            <input
                type="text"
                id="blinds"
                className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                placeholder="Enter blinds (e.g. 1, 2)"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    handleBlindsChange(e.target.value);
                }}
            />
            {error && <p className="mt-2 text-sm text-red-600 text-left">{error}</p>}
        </>
    );
}

export default BlindsInput;
