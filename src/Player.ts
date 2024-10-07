import Card from "./Card.ts";

export type Player = {
    id: string;
    name: string;
    initialStack: number;
    stack: number;
    cards: [Card, Card];
    isButton: boolean;
    isActive: boolean;
    position: number;
};

export type Dealer = {
    id: string,
    name: string,
};

export const DEALER: Dealer = {
    id: "DEALER",
    name: "Dealer",
};

export type Actor = Player | Dealer;

export function isPlayer(actor: Actor): actor is Player {
    return actor !== DEALER;
}

export function getDisplayName(actor: Actor): string {
    if (isPlayer(actor)) {
        return actor.name && `${actor.name} (p${actor.position})` || `p${actor.position}`;
    } else {
        return actor.name;
    }
}
