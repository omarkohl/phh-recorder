import {useCallback, useEffect, useRef, useState} from 'react';
import {Actor, DEALER, getDisplayName, isPlayer, Player} from './Player';
import Action, {
    BetRaiseAction,
    CheckCallAction,
    DealBoardAction,
    FoldAction,
    MuckAction,
    ShowAction
} from "./Action.ts";

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
import StudyModal from "./StudyModal.tsx";
import CardSVG from "./CardSVG.tsx";

enum PlayerAction {
    Fold = 'fold',
    CheckCall = 'check/call',
    BetRaise = 'bet/raise to',
    MuckCards = 'muck cards',
    ShowCards = 'show cards'
}

enum DealerAction {
    DealBoard = 'deal board'
}

const playerActions = [
    PlayerAction.Fold,
    PlayerAction.CheckCall,
    PlayerAction.BetRaise,
    PlayerAction.MuckCards,
    PlayerAction.ShowCards
];

const dealerActions = [
    DealerAction.DealBoard
];

function Actions(
    props: Readonly<{
        players: Player[],
        updatePlayer: (id: string, updates: Partial<Player>) => void,
        actions: Action[],
        appendAction: (action: Action) => void,
        updateActionAnswer: (id: string, answer: string) => void,
        removeAction: (id: string) => void,
        heroId: string,
    }>
) {
//    const [currentActor, setCurrentActor] = useState<Actor>(props.players[0]);
    const [currentActorId, setCurrentActorId] = useState<string>(props.players[0].id);
    const [currentAction, setCurrentAction] = useState<string>(playerActions[0]);
    const [currentBetAmount, setCurrentBetAmount] = useState<number>(0);
    const [currentBoard, setCurrentBoard] = useState<Card[]>([new Card('?', '?'), new Card('?', '?'), new Card('?', '?')]);
    const [currentShowdownCards, setCurrentShowdownCards] = useState<Card[]>([new Card('?', '?'), new Card('?', '?')]);
    const [actorQuery, setActorQuery] = useState('')
    const [actionQuery, setActionQuery] = useState('')
    const [focusNextAction, setFocusNextAction] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studyModalActionId, setStudyModalActionId] = useState<string | null>(null);

    const nextActorInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setCurrentBoard(
            props.actions.filter(action => action instanceof DealBoardAction).length === 0
                ? [new Card('?', '?'), new Card('?', '?'), new Card('?', '?')]
                : [new Card('?', '?')]
        );
    }, [props.actions]);

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
        const playerId = action.actorId;
        if (action instanceof FoldAction || action instanceof MuckAction) {
            props.updatePlayer(playerId, {isActive: false});
        } else if (action instanceof ShowAction) {
            setCurrentShowdownCards([new Card('?', '?'), new Card('?', '?')]);
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
        props.appendAction(action);
        setCurrentActorId(filteredPlayers[0].id ?? DEALER.id);
    };

    const handleAction = (studySpot: boolean, studySpotAnswer: string) => {
        const currentActor = findActorById(currentActorId);
        if (currentActor === null) {
            return;
        }
        if (isPlayer(currentActor)) {
            let action: Action;
            switch (currentAction) {
                case PlayerAction.BetRaise:
                    action = new BetRaiseAction(
                        currentActor.id,
                        currentActor.position,
                        currentBetAmount,
                        studySpot,
                        studySpotAnswer,
                    );
                    break;
                case PlayerAction.Fold:
                    action = new FoldAction(
                        currentActor.id,
                        currentActor.position,
                        studySpot,
                        studySpotAnswer,
                    );
                    break;
                case PlayerAction.CheckCall:
                    action = new CheckCallAction(
                        currentActor.id,
                        currentActor.position,
                        studySpot,
                        studySpotAnswer,
                    );
                    break;
                case PlayerAction.MuckCards:
                    action = new MuckAction(
                        currentActor.id,
                        currentActor.position,
                    );
                    break;
                case PlayerAction.ShowCards:
                    action = new ShowAction(
                        currentActor.id,
                        currentActor.position,
                        currentShowdownCards,
                    );
                    break;
                default:
                    throw new Error(`invalid currentAction ${currentAction}`)
            }
            handlePlayerAction(action);
        } else {
            let action: Action;
            if (currentAction === DealerAction.DealBoard) {
                action = new DealBoardAction(DEALER.id, [...currentBoard]);
            } else {
                throw new Error(`invalid currentAction ${currentAction}`)
            }
            handleDealerAction(action);
        }
        setFocusNextAction(true);
    }

    const handleStudyModalSubmit = (answer: string) => {
        setIsModalOpen(false);
        if (studyModalActionId === null) {
            // new study spot
            handleAction(true, answer);
            return
        }
        // edit existing study spot
        const action = props.actions.find(action => action.id === studyModalActionId);
        if (action) {
            props.updateActionAnswer(action.id, answer);
        }
    };

    return (
        <>
            <StudyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleStudyModalSubmit}
                answer={props.actions.find(action => action.id === studyModalActionId)?.getAnswer() ?? ''}
            />
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 text-left">Next Action</h3>
                <div className="flex space-x-4">
                    <Combobox<string>
                        onChange={v => v && setCurrentActorId(v)}
                        value={currentActorId}
                        key={currentActorId}
                        onClose={() => setActorQuery('')}
                    >
                        <div className="relative h-10">
                            <ComboboxInput
                                placeholder="Choose an actor"
                                displayValue={(actorId: string) => findActorById(actorId) && getDisplayName(findActorById(actorId))}
                                className={clsx(
                                    'w-full rounded-lg border-none bg-gray-100 py-1.5 pr-8 pl-3 text-sm/6 text-black',
                                    'focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-indigo-500',
                                    {'bg-yellow-100': currentActorId === props.heroId},
                                    'h-10',
                                )}
                                onChange={(event) => setActorQuery(event.target.value)}
                                ref={nextActorInputRef}
                            />
                            <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
                                <ChevronDownIcon className="size-4 fill-gray-600 group-data-[hover]:fill-black"/>
                            </ComboboxButton>
                            {isPlayer(findActorById(currentActorId)) && (findActorById(currentActorId) as Player).isButton && (
                                <svg className="absolute top-1/2 right-10 transform -translate-y-1/2 w-6 h-6"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                                    <text
                                        x="50%"
                                        y="50%"
                                        textAnchor="middle"
                                        dy=".35em"
                                        dx=".04em"
                                        fontSize="10"
                                        fill="white"
                                        fontFamily="Arial, sans-serif"
                                    >
                                        D
                                    </text>
                                </svg>
                            )}
                        </div>
                        <ComboboxOptions
                            anchor="bottom"
                            transition
                            className={clsx(
                                'w-[var(--input-width)] rounded-xl border border-gray-300 bg-gray-100 p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
                                'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0',
                            )}
                        >
                            {filteredPlayers.map(player => (
                                <ComboboxOption
                                    key={player.id}
                                    value={player.id}
                                    className={clsx(
                                        "group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-gray-200",
                                        {'bg-yellow-100': player.id === props.heroId},
                                    )}
                                >
                                    <CheckIcon
                                        className="invisible size-4 fill-gray-600 group-data-[selected]:visible"
                                    />
                                    <div className="text-sm/6 text-black flex items-center">
                                        {getDisplayName(player)}
                                    </div>
                                    <div className="ml-auto">
                                        {isPlayer(player) && player.isButton && (
                                            <svg className="ml-2 w-6 h-6" viewBox="0 0 24 24"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="#16a34a"
                                                        strokeWidth="2"/>
                                                <text
                                                    x="50%"
                                                    y="50%"
                                                    textAnchor="middle"
                                                    dy=".35em"
                                                    dx=".04em"
                                                    fontSize="10"
                                                    fill="white"
                                                    fontFamily="Arial, sans-serif"
                                                >
                                                    D
                                                </text>
                                            </svg>
                                        )}
                                    </div>
                                </ComboboxOption>
                            ))}
                        </ComboboxOptions>
                    </Combobox>
                    <Combobox<string>
                        onChange={(action) => action && setCurrentAction(action)}
                        value={currentAction}
                        key={currentAction}
                        onClose={() => setActionQuery('')}
                    >
                        <div className="relative h-10">
                            <ComboboxInput
                                placeholder="Choose an action"
                                className={clsx(
                                    'w-full rounded-lg border-none bg-gray-100 py-1.5 pr-8 pl-3 text-sm/6 text-black',
                                    'focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-indigo-500',
                                    'h-10',
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
                                    <CheckIcon
                                        className="invisible size-4 fill-gray-600 group-data-[selected]:visible"/>
                                    <div className="text-sm/6 text-black">{action}</div>
                                </ComboboxOption>
                            ))}
                        </ComboboxOptions>
                    </Combobox>
                    {(currentAction == 'bet/raise to') && (
                        <Input
                            type="number"
                            min={0}
                            className={clsx(
                                "w-30 rounded-lg border border-transparent bg-gray-100 py-1.5 pr-3 pl-3 text-sm/6 text-black",
                                "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:cursor-text"
                            )}
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
                    {(currentAction == 'show cards') && (
                        <CardInput
                            cards={isPlayer(findActorById(currentActorId)) ? (findActorById(currentActorId) as Player).cards : currentShowdownCards}
                            onCardsUpdate={(cards) => setCurrentShowdownCards(cards)}
                        />
                    )}
                </div>
            </div>
            <div className="flex space-x-4 mt-3 mb-8">
                <Button
                    onClick={() => handleAction(false, '')}
                    className={clsx(
                        "bg-blue-500 text-white px-4 py-2 rounded-md",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500",
                    )}
                >
                    Submit
                </Button>
                <Button
                    disabled={
                        currentActorId !== props.heroId ||
                        ![PlayerAction.CheckCall, PlayerAction.BetRaise, PlayerAction.Fold].includes(currentAction as PlayerAction)
                    }
                    onClick={() => {
                        setIsModalOpen(true)
                        setStudyModalActionId(null)
                    }}
                    className={clsx(
                        "bg-yellow-500 text-white px-4 py-2 rounded-md disabled:bg-yellow-200 disabled:text-gray-400 disabled:cursor-not-allowed",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500",
                    )}
                >
                    Study
                </Button>
                <Button
                    onClick={() => {
                        const lastAction = props.actions[props.actions.length - 1];
                        if (lastAction) {
                            props.removeAction(lastAction.id);
                            if (lastAction instanceof FoldAction || lastAction instanceof MuckAction) {
                                props.updatePlayer(lastAction.actorId, {isActive: true});
                            }
                            setCurrentActorId(lastAction.actorId);
                        }
                    }}
                    className={clsx(
                        "bg-red-500 text-white px-4 py-2 rounded-md disabled:bg-red-200 disabled:text-gray-400 disabled:cursor-not-allowed",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500",
                    )}
                    disabled={props.actions.length === 0}
                >
                    Undo Last Action
                </Button>
            </div>
            <div>
                <h3 className="text-lg font-medium mb-2 text-left">Action History</h3>
                <div className="bg-gray-100 p-4 rounded-md text-left" id="history-log">
                    {props.actions.map((action) => (
                        <div key={action.id} className="flex justify-between mt-1 items-center">
                            <div className="font-bold w-1/5">
                                {getDisplayName(findActorById(action.actorId))}
                            </div>
                            {action instanceof DealBoardAction ? (
                                <>
                                    <div className="pl-1 w-1/5">deals</div>
                                    <div className="flex pl-1 w-1/5">
                                        {action.board.map((card, i) => (
                                            <CardSVG key={i} suit={card.suit} rank={card.rank} width={25}
                                                     height={37} className="ml-1"/>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="pl-1 w-1/5">
                                        {action.toString()}
                                    </div>
                                    <div className="pl-1 w-1/5">
                                    </div>
                                </>
                            )}
                            <div className="pl-4 text-gray-500 w-1/5">
                                {action.getIsStudySpot() && action.getAnswer() && (
                                    action.getAnswer().length > 20
                                        ? `${action.getAnswer().substring(0, 20)}...`
                                        : action.getAnswer()
                                )}
                            </div>
                            <div className="pl-4 w-1/5">
                                {!action.getIsStudySpot() &&
                                    action.actorId === props.heroId &&
                                    (
                                        action instanceof BetRaiseAction ||
                                        action instanceof CheckCallAction ||
                                        action instanceof FoldAction
                                    ) &&
                                    (
                                        <Button
                                            className={clsx(
                                                "px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm",
                                                "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500",
                                            )}
                                            onClick={() => {
                                                setStudyModalActionId(action.id);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Study
                                        </Button>
                                    )
                                }
                                {action.getIsStudySpot() && (
                                    <Button
                                        className={clsx(
                                            "px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm",
                                            "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500",
                                        )}
                                        onClick={() => {
                                            setStudyModalActionId(action.id);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Edit Answer
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Actions;
