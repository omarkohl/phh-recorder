import {useState} from 'react';
import './App.css';
import {CardInput} from "./CardInput.tsx";
import Card from "./Card.ts";

type Player = {
    id: string;
    name: string;
    initialStack: number;
    stack: number;
    cards: [Card, Card];
    isDealer: boolean;
    isActive: boolean;
    position: number;
};

function App() {

    const [players, setPlayers] = useState<Player[]>([
        {
            id: crypto.randomUUID(),
            name: 'Alice',
            initialStack: 1000,
            stack: 1000,
            cards: [new Card('A', 's'), new Card('K', 's')],
            isDealer: false,
            isActive: true,
            position: 1
        },
        {
            id: crypto.randomUUID(),
            name: 'Bob',
            initialStack: 1000,
            stack: 1000,
            cards: [new Card('Q', 'h'), new Card('J', 's')],
            isDealer: false,
            isActive: true,
            position: 2
        },
        {
            id: crypto.randomUUID(),
            name: 'Charlie',
            initialStack: 1000,
            stack: 1000,
            cards: [new Card('9', 'c'), new Card('8', 'd')],
            isDealer: true,
            isActive: true,
            position: 3
        },
    ]);

    const addPlayer = (name: string, initialStack: number, cards: [Card, Card]) => {
        const dealerIndex = players.findIndex(player => player.isDealer);
        const newPlayer: Player = {
            id: crypto.randomUUID(),
            name: name,
            initialStack: initialStack,
            stack: initialStack,
            cards: cards,
            isDealer: false,
            isActive: true,
            position: players.length + 1
        };
        const updatedPlayers = [...players, newPlayer];
        for (let position = 1; position <= updatedPlayers.length; position++) {
            let playerIndex = (dealerIndex + position) % updatedPlayers.length;
            updatedPlayers[playerIndex].position = position;
        }
        setPlayers(updatedPlayers);
    }

    const removePlayer = (id: string) => {
        // only allow removing players if there are more than 2 players
        if (players.length <= 2) {
            return;
        }

        let updatedPlayers = [...players];
        // find the dealer
        let dealerIndex = updatedPlayers.findIndex(player => player.isDealer);
        if (id === updatedPlayers[dealerIndex].id) { // remove the dealer
            // find the next player in the list in order to set them as the dealer. it might have to wrap around
            const nextDealerIndex = (dealerIndex + 1) % updatedPlayers.length;
            updatedPlayers[dealerIndex].isDealer = false;
            updatedPlayers[nextDealerIndex].isDealer = true;
            dealerIndex = nextDealerIndex;
        }
        // remove the player
        updatedPlayers = updatedPlayers.filter(player => player.id !== id);

        // re-index the players
        for (let position = 1; position <= updatedPlayers.length; position++) {
            let playerIndex = (dealerIndex + position) % updatedPlayers.length;
            updatedPlayers[playerIndex].position = position;
        }
        setPlayers(updatedPlayers);
    }


    const setDealer = (id: string) => {
        const updatedPlayers = players.map(player => ({
            ...player,
            isDealer: player.id === id
        }));
        const dealerIndex = updatedPlayers.findIndex(player => player.isDealer);
        for (let position = 1; position <= updatedPlayers.length; position++) {
            let playerIndex = (dealerIndex + position) % updatedPlayers.length;
            updatedPlayers[playerIndex].position = position;
        }
        setPlayers(updatedPlayers);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4">
                <h1 className="text-2xl font-bold">Poker Hand Recorder</h1>
            </div>

            <div className="mb-4">
                <label htmlFor="blinds" className="block text-sm font-medium text-gray-700">Blinds, Antes, and
                    Straddles</label>
                <input type="text" id="blinds"
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                       placeholder="Enter blinds, antes, and straddles (e.g., 1/2 blinds, 0.5 ante)"/>
            </div>

            <div className="text-right">
                <button
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => addPlayer('', 1000, [new Card('?', '?'), new Card('?', '?')])}>
                    Add Player
                </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player) => (
                    <tr key={player.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <input
                                type="text"
                                className="w-full px-2 py-1 border border-transparent bg-transparent cursor-pointer rounded-md focus:border-gray-300 focus:bg-white focus:cursor-text"
                                value={player.name}
                                placeholder={`p${player.position}`}
                                onChange={(e) => {
                                    const updatedPlayers = players.map(p => {
                                        if (p.id === player.id) {
                                            return {...p, name: e.target.value};
                                        }
                                        return p;
                                    });
                                    setPlayers(updatedPlayers);
                                }}
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <input
                                type="number"
                                className="w-full px-2 py-1 border border-transparent bg-transparent cursor-pointer rounded-md focus:border-gray-300 focus:bg-white focus:cursor-text"
                                value={player.initialStack}
                                onChange={(e) => {
                                    const updatedPlayers = players.map(p => {
                                        if (p.id === player.id) {
                                            return {...p, initialStack: parseInt(e.target.value)};
                                        }
                                        return p;
                                    });
                                    setPlayers(updatedPlayers);
                                }}
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <CardInput<[Card, Card]>
                                cards={player.cards}
                                onCardsUpdate={(updatedCards) => {
                                    const updatedPlayers = players.map(p => {
                                        if (p.id === player.id) {
                                            return {...p, cards: updatedCards};
                                        }
                                        return p;
                                    });
                                    setPlayers(updatedPlayers);
                                }}
                            />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <button
                                className={`w-6 h-6 text-xs flex items-center justify-center hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 ${player.isDealer ? 'bg-green-500 text-white ring-2 ring-green-600' : 'bg-gray-200 text-gray-400'} rounded-full`}
                                tabIndex={-1}
                                aria-pressed={player.isDealer}
                                aria-label={`Set ${player.name} as dealer`}
                                onClick={() => setDealer(player.id)}>
                                D
                            </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <button
                                className={`bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 ${players.length <= 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                tabIndex={-1}
                                onClick={() => removePlayer(player.id)}
                                disabled={players.length <= 2}
                            >
                                Remove
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <h3 className="text-lg font-medium mb-2">Next Action</h3>
            <div className="mb-4">
                <select id="action-type"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="deal">Deal Cards</option>
                    <option value="bet">Bet</option>
                    <option value="check">Check</option>
                    <option value="raise">Raise</option>
                    <option value="call">Call</option>
                    <option value="fold">Fold</option>
                    <option value="community-cards">Deal Community Cards</option>
                    <option value="showdown">Showdown</option>
                </select>
                <input type="text" id="action-detail"
                       className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                       placeholder="Enter details (e.g., $50 bet, Qh on board)"/>
                <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Record Action
                </button>
            </div>

            <h3 className="text-lg font-medium mb-2">Action History</h3>
            <div className="bg-gray-100 p-4 rounded-md" id="history-log">
                <p>[Pre-Flop] Alice raises to $6</p>
                <p>[Pre-Flop] Bob calls</p>
                <p>[Pre-Flop] Charlie folds</p>
                <p>[Flop] Dealing 5h, 6d, 7s</p>
            </div>
        </div>
    );
}

export default App;
