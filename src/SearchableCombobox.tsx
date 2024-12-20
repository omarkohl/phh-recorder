import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/react';

import {useState} from 'react';
import {CheckIcon, ChevronDownIcon} from "@heroicons/react/20/solid";
import clsx from "clsx";

type Option = {
    key: string;
    value: string;
};

function SearchableCombobox(
    props: Readonly<{
        options: Option[],
        selectedOptionKey: string | null,
        onOptionSelect: (key: string) => void
        error?: string
    }>
) {
    const [query, setQuery] = useState('');
    const [selectedOptionKey, setSelectedOptionKey] = useState(props.selectedOptionKey);

    // Ensure the selected option is updated when it is changed externally
    const [prevSelectedOptionKey, setPrevSelectedOptionKey] = useState<string | null>(null);
    if (props.selectedOptionKey !== prevSelectedOptionKey) {
        setSelectedOptionKey(props.selectedOptionKey);
        setPrevSelectedOptionKey(props.selectedOptionKey);
    }

    const filteredOptions = props.options.filter(option =>
        option.value.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <Combobox<string>
                onChange={(optionKey) => {
                    if (optionKey) {
                        setSelectedOptionKey(optionKey);
                        props.onOptionSelect(optionKey);
                    }
                }}
                value={selectedOptionKey ?? ''}
                onClose={() => setQuery('')}
            >
                <div className={clsx("relative", {"border-red-500": props.error})}>
                    <ComboboxInput
                        placeholder="Choose an option"
                        className={clsx(
                            'w-full rounded-lg bg-gray-100 py-1.5 pr-8 pl-3 text-sm/6 text-black',
                            'focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-indigo-500',
                            {
                                "border-red-500 border-2": props.error,
                                "border-transparent border-2": !props.error
                            },
                        )}
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={(optionKey: string) => {
                            const option = props.options.find(option => option.key === optionKey);
                            return option ? option.value : '';
                        }}
                    />
                    <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                        <ChevronDownIcon className="size-4 fill-gray-600 group-data-[hover]:fill-black"/>
                    </ComboboxButton>
                </div>
                <ComboboxOptions
                    anchor="bottom"
                    transition
                    className={clsx(
                        'w-[var(--input-width)] rounded-xl border border-gray-300 bg-gray-100 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
                        'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                    )}
                >
                    {filteredOptions.map(option => (
                        <ComboboxOption
                            key={option.key}
                            value={option.key}
                            className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-gray-200"

                        >
                            <CheckIcon className="invisible size-4 fill-gray-600 group-data-[selected]:visible"/>
                            <div className="text-sm/6 text-black">{option.value}</div>
                        </ComboboxOption>
                    ))}
                </ComboboxOptions>
            </Combobox>
            {props.error && <p className="mt-2 text-sm text-red-600 text-left">{props.error}</p>}
        </>
    );
}

export default SearchableCombobox;
