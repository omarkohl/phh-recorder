import {useState} from 'react';
import {Actor, DEALER, getDisplayName, isPlayer, Player} from './Player';
import Action from "./Action.ts";

import {Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react';
import clsx from "clsx";
import {CheckIcon, ChevronDownIcon} from "@heroicons/react/20/solid";

function Actions(
    props: Readonly<{
        players: Player[],
        updatePlayer: (id: string, updates: Partial<Player>) => void,
        actions: Action[],
        appendAction: (action: Action) => void
    }>
) {
    const [currentActor, setCurrentActor] = useState<Actor>(props.players[0]);

    const [query, setQuery] = useState('')

    const filteredPlayers: Actor[] =
        query === ''
            ? (props.players.filter((p) => p.isActive) as Actor[]).concat(DEALER)
            : (props.players.filter((p) => p.isActive) as Actor[]).concat(DEALER).filter((actor) => {
                const queryLower = query.toLowerCase();
                return actor.name.toLowerCase().includes(queryLower) ||
                    (isPlayer(actor) && `p${actor.position}`.includes(queryLower))
            })


    const handleFold = (playerId: string) => {
        props.updatePlayer(playerId, {isActive: false});
        const player = props.players.find(p => p.id === playerId);
        if (!player) {
            return;
        }
        props.appendAction(new Action(player, "folds"));

        // Set the next actor
        const currentIndex = filteredPlayers.findIndex(p => p.id === playerId);
        let nextPlayer: Actor | null = null;
        for (let i = 0; i < filteredPlayers.length; i++) {
            const candidate = filteredPlayers[(currentIndex + i + 1) % filteredPlayers.length];
            if (candidate.id !== playerId && candidate !== DEALER) {
                nextPlayer = candidate;
                break;
            }
        }
        setCurrentActor(nextPlayer || DEALER);
    };

    return (
        <>
            <h3 className="text-lg font-medium mb-2 text-left">Next Action</h3>
            <div className="flex space-x-4">
                <Combobox<Actor>
                    immediate
                    onChange={
                        (actor) => {
                            actor && setCurrentActor(actor);
                        }}
                    value={currentActor}
                    onClose={() => setQuery('')}
                >
                    <div className="relative">
                        <ComboboxInput
                            placeholder="Choose an actor"
                            displayValue={getDisplayName}
                            className={clsx(
                                'w-full rounded-lg border-none bg-gray-100 py-1.5 pr-8 pl-3 text-sm/6 text-black',
                                'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                            )}
                            onChange={(event) => setQuery(event.target.value)}
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
                        {filteredPlayers.map(player => (
                            <ComboboxOption
                                key={player.id}
                                value={player}
                                className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-gray-200"
                            >
                                <CheckIcon className="invisible size-4 fill-gray-600 group-data-[selected]:visible"/>
                                <div className="text-sm/6 text-black">{getDisplayName(player)}</div>
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                </Combobox>
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={() => {
                        if (currentActor === null) {
                            return;
                        }
                        if (isPlayer(currentActor)) {
                            handleFold(currentActor.id);
                        }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                    Fold
                </button>
            </div>

            <h3 className="text-lg font-medium mb-2 text-left">Action History</h3>
            <div className="bg-gray-100 p-4 rounded-md text-left" id="history-log">
                {props.actions.map((action) => (
                    <div key={action.id}>
                        <p>
                            <span className="font-bold">
                                {getDisplayName(action.actor)}
                            </span>
                            <span className="ml-1">{action.action}</span>
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Actions;
