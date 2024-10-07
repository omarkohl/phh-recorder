import {Actor} from "./Player.ts";


class Action {
    public readonly id: string;
    public readonly actor: Actor;
    public readonly action: string;

    constructor(actor: Actor, action: string) {
        this.id = crypto.randomUUID();
        this.actor = actor;
        this.action = action;
    }
}

export default Action;
