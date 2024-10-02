import './App.css'

function App() {
    return (
        <div className="container">
            <div className="header">
                <h1>Poker Hand Recorder</h1>
            </div>

            <div className="form-group">
                <label htmlFor="blinds">Blinds, Antes, and Straddles</label>
                <input type="text" id="blinds"
                       placeholder="Enter blinds, antes, and straddles (e.g., 1/2 blinds, 0.5 ante)"/>
            </div>

            <button>Add Player</button>

            <table id="players-table">
                <thead>
                <tr>
                    <th>Player Name</th>
                    <th>Initial Stack</th>
                    <th>Hole Cards</th>
                    <th>Dealer</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td contentEditable="true">Alice</td>
                    <td contentEditable="true">500</td>
                    <td contentEditable="true">Ah, Ks</td>
                    <td>
                        <button className="dealer-btn" tabIndex={-1}>D</button>
                    </td>
                    <td>
                        <button tabIndex={-1}>Remove</button>
                    </td>
                </tr>
                <tr>
                    <td contentEditable="true">Bob</td>
                    <td contentEditable="true">450</td>
                    <td contentEditable="true">??, ??</td>
                    <td>
                        <button className="dealer-btn" tabIndex={-1}></button>
                    </td>
                    <td>
                        <button tabIndex={-1}>Remove</button>
                    </td>
                </tr>
                </tbody>
            </table>

            <h3>Next Action</h3>
            <div className="action-input">
                <select id="action-type">
                    <option value="deal">Deal Cards</option>
                    <option value="bet">Bet</option>
                    <option value="check">Check</option>
                    <option value="raise">Raise</option>
                    <option value="call">Call</option>
                    <option value="fold">Fold</option>
                    <option value="community-cards">Deal Community Cards</option>
                    <option value="showdown">Showdown</option>
                </select>
                <input type="text" id="action-detail" placeholder="Enter details (e.g., $50 bet, Qh on board)"/>
                <button className="submit-btn">Record Action</button>
            </div>

            <h3>Action History</h3>
            <div className="history-log" id="history-log">
                <p>[Pre-Flop] Alice raises to $6</p>
                <p>[Pre-Flop] Bob calls</p>
                <p>[Pre-Flop] Charlie folds</p>
                <p>[Flop] Dealing 5h, 6d, 7s</p>
            </div>

        </div>
    )
}

export default App
