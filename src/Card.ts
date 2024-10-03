const validRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A', '?'];
const validSuits = ['c', 'd', 'h', 's', '?'];

class Card {
    public readonly rank: string;
    public readonly suit: string;

    constructor(rank: string, suit: string) {
        if (!validRanks.includes(rank.toUpperCase())) {
            throw new Error(`Invalid rank: ${rank}`);
        }
        if (!validSuits.includes(suit.toLowerCase())) {
            throw new Error(`Invalid suit: ${suit}`);
        }
        this.rank = rank.toUpperCase();
        this.suit = suit.toLowerCase();
    }

    toString(): string {
        return `${this.rank}${this.suit}`;
    }
}

export default Card;
