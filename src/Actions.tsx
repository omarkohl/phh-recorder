import {useState} from 'react';
import {Player} from './Player';

enum Street {
    PreFlop = "Pre-Flop",
    Flop = "Flop",
    Turn = "Turn",
    River = "River"
}

type Dealer = "Dealer";

type Actor = Player | Dealer;

function Actions(props: Readonly<{ players: Player[], updatePlayer: (id: string, updates: Partial<Player>) => void }>) {
    const [street, setStreet] = useState(Street.PreFlop);
    // initial actor is the small blind
    const [currentActor, setCurrentActor] = useState<Actor>(props.players.find(p => p.position === 1) || "Dealer");

    const handleFold = (playerId: string) => {
        props.updatePlayer(playerId, {isActive: false});
        const currentPlayer = props.players.find(p => p.id === playerId);
        if (!currentPlayer) {
            throw new Error(`Player with ID ${playerId} not found`);
        }
        const currentPlayerIndex = props.players.indexOf(currentPlayer);
        const nextPlayerIndex = (currentPlayerIndex + 1) % props.players.length;
        setCurrentActor(props.players[nextPlayerIndex]);
    };

    return (
        <>
            <h3 className="text-lg font-medium mb-2 text-left">Next Action</h3>
            <div className="bg-gray-100 p-4 rounded-md text-left">
                <p>Street: {street}</p>
                <p>Actor: {currentActor === "Dealer" ? "Dealer" : `${currentActor.name} (${currentActor.stack})`}</p>
            </div>
            {(currentActor !== "Dealer") && (
                <div className="flex space-x-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Check / Call (C)
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Bet / Raise (B)
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleFold(currentActor.id)}
                    >
                        Fold (F)
                    </button>
                </div>
            )}

            <h3 className="text-lg font-medium mb-2">Action History</h3>
            <div className="bg-gray-100 p-4 rounded-md" id="history-log">
                <p>[Pre-Flop] Alice raises to $6</p>
                <p>[Pre-Flop] Bob calls</p>
                <p>[Pre-Flop] Charlie folds</p>
                <p>[Flop] Dealing 5h, 6d, 7s</p>
            </div>
        </>
    );
}

export default Actions;
