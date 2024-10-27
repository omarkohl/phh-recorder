import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import {Input} from "@headlessui/react";
import clsx from "clsx";

interface BlindsInputProps {
    initialBlinds: number[];
    onBlindsChange: (blinds: number[]) => void;
    autoFocus?: boolean;
    required?: boolean;
}

function BlindsInput({ initialBlinds, onBlindsChange, autoFocus, required }: Readonly<BlindsInputProps>) {
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
            <Input
                type="text"
                className={clsx(
                    "w-full px-3 py-2 shadow-sm sm:text-sm",
                    error ? "border-2 border-red-500" : "border border-gray-300",
                    "bg-transparent cursor-pointer rounded-md",
                    "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:cursor-text"
                )}
                placeholder="Enter blinds (e.g. 1, 2)"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    handleBlindsChange(e.target.value);
                }}
                onBlur={() => {
                    handleBlindsChange.flush();
                    if (required && inputValue === '') {
                        setError("Please enter the blinds.");
                    }
                }}
                {...{ autoFocus}}
            />
            {error && <p className="mt-2 text-sm text-red-600 text-left">{error}</p>}
        </>
    );
}

export default BlindsInput;
