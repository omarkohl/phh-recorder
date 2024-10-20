import Card from "./Card.ts";


class Action {
    public readonly id: string;
    public readonly actorId: string;

    constructor(actorId: string) {
        this.id = crypto.randomUUID();
        this.actorId = actorId;
    }

    toString() {
        return "";
    }

    toPHH(): string {
        return ""
    }
}

export class BetRaiseAction extends Action {
    public readonly amount: number;
    public readonly playerPosition: number;

    constructor(actorId: string, position: number, amount: number) {
        super(actorId);
        this.amount = amount;
        this.playerPosition = position;
    }

    toString() {
        return `bet/raise to ${this.amount}`;
    }

    toPHH(): string {
        return `p${this.playerPosition} cbr ${this.amount}`;
    }
}

export class FoldAction extends Action {
    public readonly playerPosition: number;

    constructor(actorId: string, position: number) {
        super(actorId);
        this.playerPosition = position;
    }

    toString() {
        return "fold";
    }

    toPHH(): string {
        return `p${this.playerPosition} f`;
    }
}

export class CheckCallAction extends Action {
    public readonly playerPosition: number;

    constructor(actorId: string, position: number) {
        super(actorId);
        this.playerPosition = position
    }

    toString() {
        return "check/call";
    }

    toPHH(): string {
        return `p${this.playerPosition} cc`;
    }
}

export class DealBoardAction extends Action {
    public readonly board: Card[];

    constructor(actorId: string, board: Card[]) {
        super(actorId);
        this.board = board;
    }

    toString() {
        return `deal board ${this.board}`;
    }

    toPHH(): string {
        return "d db " + this.board.map((c) => c.toString()).join('');
    }
}

export default Action;
