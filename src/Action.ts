import {Actor, isPlayer, Player} from "./Player.ts";
import Card from "./Card.ts";


class Action {
    public readonly id: string;
    public readonly actor: Actor;

    constructor(actor: Actor) {
        this.id = crypto.randomUUID();
        this.actor = actor;
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

    constructor(actor: Actor, amount: number) {
        if (!isPlayer(actor)) {
            throw new Error(`${actor.name} must be a player`)
        }
        super(actor);
        this.amount = amount;
    }

    toString() {
        return `bet/raise to ${this.amount}`;
    }

    toPHH(): string {
        const player = this.actor as Player;
        return `p${player.position} cbr ${this.amount}`;
    }
}

export class FoldAction extends Action {
    constructor(actor: Actor) {
        if (!isPlayer(actor)) {
            throw new Error(`${actor.name} must be a player`)
        }
        super(actor);
    }

    toString() {
        return "fold";
    }

    toPHH(): string {
        const player = this.actor as Player;
        return `p${player.position} f`;
    }
}

export class CheckCallAction extends Action {
    constructor(actor: Actor) {
        if (!isPlayer(actor)) {
            throw new Error(`${actor.name} must be a player`)
        }
        super(actor);
    }

    toString() {
        return "check/call";
    }

    toPHH(): string {
        const player = this.actor as Player;
        return `p${player.position} cc`;
    }
}

export class DealBoardAction extends Action {
    public readonly board: Card[];

    constructor(actor: Actor, board: Card[]) {
        if (isPlayer(actor)) {
            throw new Error(`${actor.name} must be the dealer`)
        }
        super(actor);
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
