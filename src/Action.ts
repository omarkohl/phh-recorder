import {Actor} from "./Player.ts";
import Card from "./Card.ts";


class Action {
    public readonly id: string;
    public readonly actor: Actor;
    public readonly action: string;

    constructor(actor: Actor, action: string) {
        this.id = crypto.randomUUID();
        this.actor = actor;
        this.action = action;
    }

    toString() {
        return `${this.action}`;
    }
}

export class BetRaiseAction extends Action {
    public readonly amount: number;

    constructor(actor: Actor, amount: number) {
        super(actor, "bet/raise to");
        this.amount = amount;
    }

    toString() {
        return `${this.action} ${this.amount}`;
    }
}

export class DealBoardAction extends Action {
    public readonly board: Card[];

    constructor(actor: Actor, board: Card[]) {
        super(actor, "deal board");
        this.board = board;
    }

    toString() {
        return `${this.action} ${this.board}`;
    }
}

export default Action;
