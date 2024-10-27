import {stringify} from "smol-toml";

import {useCallback, useEffect, useState} from 'react';
import './App.css';
import {CardInput} from "./CardInput.tsx";
import Card from "./Card.ts";
import BlindsInput from "./BlindsInput.tsx";
import Actions from "./Actions.tsx";
import {getDisplayName, Player} from "./Player.ts";
import Action from "./Action.ts";
import SearchableCombobox from "./SearchableCombobox.tsx";
import {Button, Checkbox, Input, Textarea} from "@headlessui/react";
import {CheckIcon, TrashIcon, PlusIcon, MinusIcon} from "@heroicons/react/20/solid";
import clsx from "clsx";

const DEFAULT_FILE_NAME = 'game.phh';

function App() {
    const [players, setPlayers] = useState<Player[]>([
        {
            id: crypto.randomUUID(),
            name: 'Daniel',
            initialStack: 100,
            stack: 100,
            cards: [new Card('A', 's'), new Card('K', 's')],
            isButton: false,
            isActive: true,
            position: 1
        },
        {
            id: crypto.randomUUID(),
            name: 'Maria',
            initialStack: 100,
            stack: 100,
            cards: [new Card('Q', 'h'), new Card('J', 's')],
            isButton: false,
            isActive: true,
            position: 2
        },
        {
            id: crypto.randomUUID(),
            name: 'Liv',
            initialStack: 100,
            stack: 100,
            cards: [new Card('9', 'c'), new Card('8', 'd')],
            isButton: true,
            isActive: true,
            position: 3
        },
    ]);

    const [blinds, setBlinds] = useState<number[]>([]);
    const [playersModified, setPlayersModified] = useState(false);
    const [heroPlayerId, setHeroPlayerId] = useState<string>(players[0].id);
    const [context, setContext] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [source, setSource] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');

    // Set initial stack sizes based on the big blind.
    // This effect runs only once when blinds are set and players have not
    // been modified i.e. it only affects the three initial default players.
    useEffect(() => {
        if (!playersModified && blinds.length > 0) {
            const bigBlind = blinds[blinds.length - 1];
            setPlayers(players =>
                players.map(player => ({
                    ...player,
                    initialStack: 100 * bigBlind,
                    stack: 100 * bigBlind
                }))
            );
        }
    }, [blinds, playersModified]);

    const addPlayer = (name: string, initialStack: number, cards: [Card, Card]) => {
        setPlayersModified(true);
        const buttonIndex = players.findIndex(player => player.isButton);
        const newPlayer: Player = {
            id: crypto.randomUUID(),
            name: name,
            initialStack: initialStack,
            stack: initialStack,
            cards: cards,
            isButton: false,
            isActive: true,
            position: players.length + 1
        };
        const updatedPlayers = [...players, newPlayer];
        for (let position = 1; position <= updatedPlayers.length; position++) {
            const playerIndex = (buttonIndex + position) % updatedPlayers.length;
            updatedPlayers[playerIndex].position = position;
        }
        setPlayers(updatedPlayers);
    };

    const updatePlayer = (id: string, updatedPlayer: Partial<Player>) => {
        setPlayersModified(true);
        setPlayers((players) =>
            players.map(p =>
                p.id === id ? {...p, ...updatedPlayer} : p
            )
        );
    };

    const removePlayer = (id: string) => {
        setPlayersModified(true);
        if (players.length <= 2) {
            return;
        }

        let updatedPlayers = [...players];
        let buttonIndex = updatedPlayers.findIndex(player => player.isButton);
        if (id === updatedPlayers[buttonIndex].id) {
            const nextButtonIndex = (buttonIndex + 1) % updatedPlayers.length;
            updatedPlayers[buttonIndex].isButton = false;
            updatedPlayers[nextButtonIndex].isButton = true;
            buttonIndex = nextButtonIndex;
        }

        let heroPlayerIndex = updatedPlayers.findIndex(player => player.id === heroPlayerId);
        if (id === heroPlayerId) {
            heroPlayerIndex = (heroPlayerIndex + 1) % updatedPlayers.length;
            setHeroPlayerId(updatedPlayers[heroPlayerIndex].id);
        }

        updatedPlayers = updatedPlayers.filter(player => player.id !== id);

        for (let position = 1; position <= updatedPlayers.length; position++) {
            const playerIndex = (buttonIndex + position) % updatedPlayers.length;
            updatedPlayers[playerIndex].position = position;
        }
        setPlayers(updatedPlayers);
    };

    const setButton = (id: string) => {
        setPlayersModified(true);
        setPlayers((players) => {
            const updatedPlayers = players.map(player => ({
                ...player,
                isButton: player.id === id
            }));
            const buttonIndex = updatedPlayers.findIndex(player => player.isButton);
            for (let position = 1; position <= updatedPlayers.length; position++) {
                const playerIndex = (buttonIndex + position) % updatedPlayers.length;
                updatedPlayers[playerIndex].position = position;
            }
            return updatedPlayers;
        });
    };

    const [actions, setActions] = useState<Action[]>([]);

    function download() {
        const buttonIndex = players.findIndex(player => player.isButton);
        const nextPlayerIndex = (buttonIndex + 1) % players.length;

        // players must be sorted so that the small blind is first
        const sortedPlayers = players.slice(nextPlayerIndex).concat(players.slice(0, nextPlayerIndex));

        const phhActions = sortedPlayers.map(player => `d dh p${player.position} ` + player.cards.map(card => card.toString()).join(''));
        phhActions.push(...actions.map((a) => a.toPHH()))

        // Convert game state to TOML
        const gameData = {
            variant: 'NT',
            ante_trimming_status: true,
            antes: sortedPlayers.map(() => 0),
            blinds_or_straddles: sortedPlayers.map((_, index) => blinds[index] || 0),
            min_bet: blinds[blinds.length - 1],
            starting_stacks: sortedPlayers.map(player => player.initialStack),
            actions: phhActions,
            players: sortedPlayers.map(player => player.name),
            _apm_hero: findPlayerById(heroPlayerId).position,
            _apm_context: context,
            _apm_notes: notes,
            _apm_source: source,
            _apm_answers: actions.filter(a => a.getIsStudySpot()).map(a => a.getAnswer()),
        };
        const tomlString = stringify(gameData) + '\n';

        // Create a blob and download the file
        const blob = new Blob([tomlString], {type: 'application/toml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || DEFAULT_FILE_NAME;
        if (!a.download.endsWith('.phh')) {
            a.download += '.phh';
        }
        a.click();
        URL.revokeObjectURL(url);
    }

    const findPlayerById = useCallback((id: string): Player => {
        const player = players.find(player => player.id === id);
        if (!player) {
            throw new Error(`Player with id ${id} not found`);
        }
        return player;
    }, [players]);

    const heroSelectorError =
        findPlayerById(heroPlayerId)?.cards.some(card => card.rank === '?' || card.suit === '?')
            ? "The hole cards of the hero need to be known."
            : undefined;

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Poker Hand Recorder</h1>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 text-left">Blinds</h3>
                <BlindsInput initialBlinds={blinds} onBlindsChange={setBlinds} autoFocus required/>
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 text-left">Ante</h3>
                <Input type="text" id="ante"
                       className={clsx(
                           "w-full px-3 py-2 shadow-sm sm:text-sm",
                           "border border-gray-300",
                           "bg-transparent cursor-pointer rounded-md",
                           "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:cursor-text"
                       )}
                       placeholder="Enter ante (e.g. 0.5)"/>

                <div className="mt-2 flex items-center">
                    <Checkbox
                        checked={false}
                        className={clsx(
                            "group size-6 rounded-md bg-gray-300/10 p-1 ring-1 ring-gray-400 shadow-sm ring-inset data-[checked]:bg-white",
                            "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        )}
                    >
                        <CheckIcon className="hidden size-4 fill-black group-data-[checked]:block"/>
                    </Checkbox>
                    <label htmlFor="ante-per-round" className="ml-2 block text-sm text-gray-900">Ante collected once per
                        round</label>
                </div>
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 text-left">Straddles</h3>
                <Input type="text" id="straddles"
                       className={clsx(
                           "w-full px-3 py-2 shadow-sm sm:text-sm",
                           "border border-gray-300",
                           "bg-transparent cursor-pointer rounded-md",
                           "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:cursor-text"
                       )}
                       placeholder="Enter straddles (e.g. 4, 8)"/>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 text-left">Context</h3>
                <Textarea
                    className={clsx(
                        'mt-3 block w-full rounded-lg border border-gray-300 bg-white py-1.5 px-3 text-sm/6 text-black sm:text-sm',
                        'focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-1 data-[focus]:outline-indigo-500 data-[focus]:cursor-text'
                    )}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 text-left">Notes</h3>
                <Textarea
                    className={clsx(
                        'mt-3 block w-full rounded-lg border border-gray-300 bg-white py-1.5 px-3 text-sm/6 text-black sm:text-sm',
                        'focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-1 data-[focus]:outline-indigo-500 data-[focus]:cursor-text'
                    )}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
            <div className="mb-8">
                <h3 className="text-lg font-medium mb-2 text-left">Source</h3>
                <Textarea
                    className={clsx(
                        'mt-3 block w-full rounded-lg border border-gray-300 bg-white py-1.5 px-3 text-sm/6 text-black sm:text-sm',
                        'focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-1 data-[focus]:outline-indigo-500 data-[focus]:cursor-text'
                    )}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                />
            </div>

            <div className="text-left">
                <Button
                    className={clsx(
                        "mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500"
                    )}
                    onClick={() => {
                        let initialStack: number;
                        if (blinds.length === 0) {
                            initialStack = 100;
                        } else {
                            initialStack = 100 * blinds[blinds.length - 1];
                        }
                        addPlayer('', initialStack, [new Card('?', '?'), new Card('?', '?')]);
                    }}
                >
                    Add Player
                </Button>
                <span className="ml-2 text-gray-400">({players.length} players)</span>
            </div>

            <table id="players-table" className="min-w-full divide-y divide-gray-200 mb-4">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player
                        Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial
                        Stack
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hole
                        Cards
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player) => (
                    <tr
                        key={player.id}
                        className={heroPlayerId === player.id ? 'bg-yellow-100' : ''}
                    >
                        <td className="px-6 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                                <Input
                                    type="text"
                                    className={clsx(
                                        "w-full px-3 py-2 sm:text-sm border border-transparent",
                                        "bg-transparent cursor-pointer rounded-md",
                                        "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:cursor-text"
                                    )}
                                    value={player.name}
                                    placeholder={`p${player.position}`}
                                    onChange={(e) => updatePlayer(player.id, {name: e.target.value})}
                                />
                                {player.isButton && (
                                    <svg
                                        className="ml-2 w-7 h-6"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
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
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap flex items-center">
                            <Input
                                className={clsx(
                                    "w-full px-3 py-2 sm:text-sm border border-transparent",
                                    "bg-transparent cursor-pointer rounded-md",
                                    "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white focus:cursor-text",
                                    ""
                                )}
                                value={player.initialStack}
                                onChange={(e) => updatePlayer(player.id, {initialStack: Number(e.target.value)})}
                            />
                            <Button
                                className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                                onClick={() => {
                                    const bigBlind = blinds[blinds.length - 1];
                                    updatePlayer(player.id, {initialStack: player.initialStack - 10 * bigBlind});
                                }}
                                disabled={blinds.length === 0}
                                tabIndex={-1}
                            >
                                <MinusIcon className="h-5 w-5"/>
                            </Button>
                            <Button
                                className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                onClick={() => {
                                    const bigBlind = blinds[blinds.length - 1];
                                    updatePlayer(player.id, {initialStack: player.initialStack + 10 * bigBlind});
                                }}
                                disabled={blinds.length === 0}
                                tabIndex={-1}
                            >
                                <PlusIcon className="h-5 w-5"/>
                            </Button>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                            <CardInput<[Card, Card]>
                                cards={player.cards}
                                onCardsUpdate={(updatedCards) => updatePlayer(player.id, {cards: updatedCards})}
                            />
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                            <Button
                                className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-200 disabled:cursor-not-allowed"
                                tabIndex={-1}
                                onClick={() => removePlayer(player.id)}
                                disabled={players.length <= 2}
                            >
                                <TrashIcon className="h-5 w-5"/>
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="mb-8">
                <h3 className="text-lg font-medium mb-2 text-left">Hero Player</h3>
                <div className="flex space-x-4">
                    <SearchableCombobox
                        options={players.map(player => ({
                            key: player.id,
                            value: getDisplayName(player),
                        }))}
                        selectedOptionKey={heroPlayerId}
                        onOptionSelect={setHeroPlayerId}
                        error={heroSelectorError}
                    />
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-medium mb-2 text-left">Button</h3>
                <div className="flex space-x-4">
                    <SearchableCombobox
                        options={players.map(player => ({
                            key: player.id,
                            value: getDisplayName(player),
                        }))}
                        selectedOptionKey={players.find(player => player.isButton)?.id || null}
                        onOptionSelect={(id) => setButton(id)}
                    />
                </div>
            </div>

            <Actions
                players={players}
                updatePlayer={
                    (id: string, updates) => updatePlayer(id, updates)
                }
                actions={actions}
                appendAction={
                    (action: Action) => setActions([...actions, action])
                }
                updateActionAnswer={
                    (id: string, answer: string) => setActions(
                        actions.map(
                            action => {
                                if (action.id === id) {
                                    action.setAnswer(answer);
                                }
                                return action;
                            }
                        )
                    )
                }
                removeAction={
                    (id: string) => setActions(
                        actions.filter(action => action.id !== id)
                    )
                }
                heroId={heroPlayerId}
            />

            <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 text-left">Download</h3>
                <Input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={`Enter file name (default: ${DEFAULT_FILE_NAME})`}
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                />
            </div>

            <div className="text-left">
                <Button
                    className={clsx(
                        "mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-200 disabled:text-gray-400 disabled:cursor-not-allowed",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500"
                    )}
                    onClick={() => {
                        download();
                        // move button
                        const currentButtonIndex = players.findIndex(player => player.isButton);
                        const nextButtonIndex = (currentButtonIndex + 1) % players.length;
                        setButton(players[nextButtonIndex].id);

                        setPlayersModified(true);
                        setPlayers((players) => (players.map(player => ({
                            ...player,
                            cards: [new Card('?', '?'), new Card('?', '?')],
                            isActive: true,
                        }))));
                        setActions([]);
                    }}
                    disabled={players.length <= 2 || blinds.length === 0}
                >
                    Download & Continue Game
                </Button>
                <Button
                    className={clsx(
                        "mt-4 ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500"
                    )}
                    onClick={download}
                    disabled={players.length <= 2 || blinds.length === 0}
                >
                    Download Only
                </Button>
                <Button
                    className={clsx(
                        "mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500"
                    )}
                    onClick={() => {
                        setPlayers((players) => (players.map(player => ({
                            ...player,
                            isActive: true,
                        }))));
                        setActions([]);
                    }}
                >
                    Clear Actions
                </Button>
                <Button
                    className={clsx(
                        "mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500"
                    )}
                    onClick={() => {
                        setPlayers((players) => (players.map(player => ({
                            ...player,
                            cards: [new Card('?', '?'), new Card('?', '?')],
                        }))));
                    }}
                >
                    Clear Hole Cards
                </Button>
                <Button
                    className={clsx(
                        "mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-200 disabled:text-gray-400 disabled:cursor-not-allowed",
                        "focus:outline-none data-[focus]:outline-1 data-[focus]:outline-indigo-500",
                    )}
                    onClick={() => {
                        const bigBlind = blinds[blinds.length - 1];
                        setPlayers((players) => (players.map(player => ({
                            ...player,
                            initialStack: 100 * bigBlind,
                        }))));
                    }}
                    disabled={blinds.length === 0}
                >
                    Reset Stacks
                </Button>
            </div>
        </div>
    );
}

export default App;
