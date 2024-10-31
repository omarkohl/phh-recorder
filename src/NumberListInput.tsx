import {useCallback, useEffect, useState} from "react";
import {debounce} from "lodash";
import {Input} from "@headlessui/react";
import clsx from "clsx";

interface NumberListInputProps {
    initialNumbers: number[];
    onChange: (blinds: number[]) => void;
    placeholder?: string;
    autoFocus?: boolean;
    required?: boolean;
}

function NumberListInput({initialNumbers, onChange, placeholder, autoFocus, required}: Readonly<NumberListInputProps>) {
    const [inputValue, setInputValue] = useState(initialNumbers.join(', '));
    const [error, setError] = useState<string | null>(null);

    const handleNumberChange = useCallback(
        debounce((value: string) => {
            try {
                const parsedNumbers = value.split(',').filter(s => s.trim() !== '').map(s => {
                    const num = Number(s);
                    if (isNaN(num)) {
                        throw new Error("Invalid number");
                    }
                    return num;
                });
                setInputValue(parsedNumbers.join(', ')); // Update inputValue with canonical form
                setError(null);
                onChange(parsedNumbers);
            } catch {
                setError("Please enter a valid comma-separated list of numbers.");
            }
        }, 1000),
        [onChange]
    );

    useEffect(() => {
        setInputValue(initialNumbers.join(', '));
    }, [initialNumbers]);

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
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    handleNumberChange(e.target.value);
                }}
                onBlur={() => {
                    handleNumberChange.flush();
                    if (required && inputValue === '') {
                        setError("Please enter some numbers.");
                    }
                }}
                {...{autoFocus}}
            />
            {error && <p className="mt-2 text-sm text-red-600 text-left">{error}</p>}
        </>
    );
}

export default NumberListInput;
