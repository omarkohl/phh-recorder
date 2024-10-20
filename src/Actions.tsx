import {useCallback, useEffect, useRef, useState} from 'react';
import {Actor, DEALER, getDisplayName, isPlayer, Player} from './Player';
import Action, {BetRaiseAction, CheckCallAction, DealBoardAction, FoldAction} from "./Action.ts";

import {
    Button,
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    Input
} from '@headlessui/react';
import clsx from "clsx";
import {CheckIcon, ChevronDownIcon} from "@heroicons/react/20/solid";
import {CardInput} from "./CardInput.tsx";
import Card from "./Card.ts";

const playerActions = ['fold', 'check/call', 'bet/raise to', 'muck cards', 'show cards'];
const dealerActions = ['deal board'];

enum Street {
    PREFLOP,
    FLOP,
    TURN,
    RIVER
}

function Actions(
    props: Readonly<{
        players: Player[],
        updatePlayer: (id: string, updates: Partial<Player>) => void,
        actions: Action[],
        appendAction: (action: Action) => void
    }>
) {
//    const [currentActor, setCurrentActor] = useState<Actor>(props.players[0]);
    const [currentActorId, setCurrentActorId] = useState<string>(props.players[0].id);
    const [currentAction, setCurrentAction] = useState<string>(playerActions[0]);
    const [currentBetAmount, setCurrentBetAmount] = useState<number>(0);
    const [currentBoard, setCurrentBoard] = useState<Card[]>([new Card('?', '?'), new Card('?', '?'), new Card('?', '?')]);
    const [actorQuery, setActorQuery] = useState('')
    const [actionQuery, setActionQuery] = useState('')
    const [focusNextAction, setFocusNextAction] = useState(false);
    const [, setCurrentStreet] = useState<Street>(Street.PREFLOP);

    const nextActorInputRef = useRef<HTMLInputElement | null>(null);

    const filteredPlayers: Actor[] =
        actorQuery === ''
            ? (props.players.filter((p) => p.isActive) as Actor[]).concat(DEALER)
            : (props.players.filter((p) => p.isActive) as Actor[]).concat(DEALER).filter((actor) => {
                const queryLower = actorQuery.toLowerCase();
                return actor.name.toLowerCase().includes(queryLower) ||
                    (isPlayer(actor) && `p${actor.position}`.includes(queryLower))
            })

    function filterActions(actions: string[], query: string): string[] {
        return query === '' ? actions : actions.filter((action) => action.toLowerCase().includes(query.toLowerCase()));
    }

    const findActorById = useCallback((id: string): Actor => {
        if (id === DEALER.id) {
            return DEALER;
        }
        return props.players.find(player => player.id === id) as Actor;
    }, [props.players]);

    const filteredActions: string[] =
        isPlayer(findActorById(currentActorId))
            ? filterActions(playerActions, actionQuery)
            : filterActions(dealerActions, actionQuery);

    // update currentAction when currentActor changes
    useEffect(() => {
        if (isPlayer(findActorById(currentActorId))) {
            setCurrentAction(playerActions[0]);
        } else {
            setCurrentAction(dealerActions[0]);
        }
    }, [currentActorId, findActorById]);

    useEffect(() => {
        if (focusNextAction && nextActorInputRef.current) {
            nextActorInputRef.current.focus();
            nextActorInputRef.current.select();
            setFocusNextAction(false); // Reset the focus flag
        }
    }, [focusNextAction]);

    const handlePlayerAction = (action: Action) => {
        const playerId = action.actor.id;
        if (action instanceof FoldAction) {
            props.updatePlayer(playerId, {isActive: false});
        }
        props.appendAction(action);

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
        setCurrentActorId(nextPlayer?.id ?? DEALER.id);
    };

    const handleDealerAction = (action: Action) => {
        if (action instanceof DealBoardAction) {
            // This is only called when the dealer deals the board i.e. when
            // the street has already ended, therefore the below code might
            // be a little confusing.
            setCurrentStreet((lastStreet) => {
                // Prepare the board for the next street that will be dealt
                // after all the actions to come and return the street that
                // we are now on.

                if (lastStreet === Street.PREFLOP) {
                    // Prepare board for the turn
                    setCurrentBoard([new Card('?', '?')]);
                    return Street.FLOP;
                } else if (lastStreet === Street.FLOP) {
                    // Prepare board for the river
                    setCurrentBoard([new Card('?', '?')]);
                    return Street.TURN;
                } else if (lastStreet === Street.TURN) {
                    // Prepare the board for the next hand (preflop)
                    setCurrentBoard([new Card('?', '?'), new Card('?', '?'), new Card('?', '?')]);
                    return Street.PREFLOP;
                } else {
                    // We never deal the board after the river
                    throw new Error(`invalid street ${lastStreet}`);
                }
            })
        }

        props.appendAction(action);
        setCurrentActorId(filteredPlayers[0].id ?? DEALER.id);
    };

    return (
        <>
            <h3 className="text-lg font-medium mb-2 text-left">Actions</h3>
            <div className="bg-gray-100 p-4 rounded-md text-left" id="history-log">
                {props.actions.map((action) => (
                    <div key={action.id}>
                        <p>
                            <span className="font-bold">
                                {getDisplayName(action.actor)}
                            </span>
                            <span className="ml-1">{action.toString()}</span>
                        </p>
                    </div>
                ))}
            </div>
            <h3 className="text-lg font-medium mb-2 text-left">Next Action</h3>
            <div className="flex space-x-4">
                <Combobox<string>
                    immediate
                    onChange={v => v && setCurrentActorId(v)}
                    value={currentActorId}
                    onClose={() => setActorQuery('')}
                >
                    <div className="relative">
                        <ComboboxInput
                            placeholder="Choose an actor"
                            displayValue={(actorId: string) => findActorById(actorId) && getDisplayName(findActorById(actorId))}
                            className={clsx(
                                'w-full rounded-lg border-none bg-gray-100 py-1.5 pr-8 pl-3 text-sm/6 text-black',
                                'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                            )}
                            onChange={(event) => setActorQuery(event.target.value)}
                            ref={nextActorInputRef}
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
                                value={player.id}
                                className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-gray-200"
                            >
                                <CheckIcon className="invisible size-4 fill-gray-600 group-data-[selected]:visible"/>
                                <div className="text-sm/6 text-black">{getDisplayName(player)}</div>
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                </Combobox>
                <Combobox<string>
                    immediate
                    onChange={(action) => action && setCurrentAction(action)}
                    value={currentAction}
                    onClose={() => setActionQuery('')}
                >
                    <div className="relative">
                        <ComboboxInput
                            placeholder="Choose an action"
                            className={clsx(
                                'w-full rounded-lg border-none bg-gray-100 py-1.5 pr-8 pl-3 text-sm/6 text-black',
                                'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
                            )}
                            onChange={(event) => setActionQuery(event.target.value)}
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
                        {filteredActions.map(action => (
                            <ComboboxOption
                                key={action}
                                value={action}
                                className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-gray-200"
                            >
                                <CheckIcon className="invisible size-4 fill-gray-600 group-data-[selected]:visible"/>
                                <div className="text-sm/6 text-black">{action}</div>
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                </Combobox>
                {(currentAction == 'bet/raise to') && (
                    <Input
                        type="number"
                        min={0}
                        className="w-30 rounded-lg border-none bg-gray-100 py-1.5 pr-3 pl-3 text-sm/6 text-black"
                        placeholder="Amount"
                        onBlur={(event) => setCurrentBetAmount(Number(event.target.value))}
                    />
                )}
                {(currentAction == 'deal board') && (
                    <CardInput
                        cards={currentBoard}
                        onCardsUpdate={(cards) => setCurrentBoard(cards)}
                    />
                )}

                {/* Put the actions above the input boxes so they wander downwards as we add new actions
			add new actions automatically once exiting the last input that is required
			place an undo button next to the previous action and support Ctrl+Z (later maybe redo) -> should set previous currentActor and undo any effects
			add a study button next to the previous and all other actions that can be studied -> user could use shift-tab to access that button
			possibly rename that button to 'Edit Answer' -> within add a delete answer (don't study this spot).
  */}
            </div>
            <div className="flex space-x-4 mt-3">
                <Button
                    onClick={() => {
                        const currentActor = findActorById(currentActorId);
                        if (currentActor === null) {
                            return;
                        }
                        if (isPlayer(currentActor)) {
                            let action: Action;
                            switch (currentAction) {
                                case 'bet/raise to':
                                    action = new BetRaiseAction(currentActor, currentBetAmount);
                                    break;
                                case 'fold':
                                    action = new FoldAction(currentActor);
                                    break;
                                case 'check/call':
                                    action = new CheckCallAction(currentActor);
                                    break;
                                default:
                                    throw new Error(`invalid currentAction ${currentAction}`)
                            }
                            handlePlayerAction(action);
                        } else {
                            let action: Action;
                            if (currentAction === 'deal board') {
                                action = new DealBoardAction(DEALER, [...currentBoard]);
                            } else {
                                throw new Error(`invalid currentAction ${currentAction}`)
                            }
                            handleDealerAction(action);
                        }
                        setFocusNextAction(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    Submit
                </Button>
                <Button
                    disabled={true}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Study
                </Button>
            </div>
        </>
    );
}

export default Actions;
