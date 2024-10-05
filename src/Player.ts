import Card from "./Card.ts";

export type Player = {
    id: string;
    name: string;
    initialStack: number;
    stack: number;
    cards: [Card, Card];
    isDealer: boolean;
    isActive: boolean;
    position: number;
};
