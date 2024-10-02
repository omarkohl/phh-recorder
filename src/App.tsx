import './App.css'

function App() {
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

            <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Player</button>

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
                <tr>
                    <td contentEditable="true" className="px-6 py-4 whitespace-nowrap">Alice</td>
                    <td contentEditable="true" className="px-6 py-4 whitespace-nowrap">500</td>
                    <td contentEditable="true" className="px-6 py-4 whitespace-nowrap">Ah, Ks</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded-full" tabIndex={-1}>D</button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="bg-red-500 text-white px-2 py-1 rounded-md" tabIndex={-1}>Remove</button>
                    </td>
                </tr>
                <tr>
                    <td contentEditable="true" className="px-6 py-4 whitespace-nowrap">Bob</td>
                    <td contentEditable="true" className="px-6 py-4 whitespace-nowrap">450</td>
                    <td contentEditable="true" className="px-6 py-4 whitespace-nowrap">??, ??</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded-full" tabIndex={-1}></button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button className="bg-red-500 text-white px-2 py-1 rounded-md" tabIndex={-1}>Remove</button>
                    </td>
                </tr>
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
    )
}

export default App
