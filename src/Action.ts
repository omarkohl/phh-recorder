import Card from "./Card.ts";


class Action {
    public readonly id: string;
    public readonly actorId: string;
    private isStudySpot: boolean;
    private studySpotAnswer: string;

    constructor(actorId: string, isStudySpot?: boolean, studySpotAnswer?: string) {
        this.id = crypto.randomUUID();
        this.actorId = actorId;
        this.isStudySpot = isStudySpot ?? false;
        this.studySpotAnswer = studySpotAnswer ?? "";
    }

    toString() {
        return "";
    }

    toPHH(): string {
        return ""
    }

    /*
        * Set the answer for a study spot action. It also sets the isStudySpot flag to true.
        * @param {string} answer - The answer to the study spot
        * @return {void}
     */
    setAnswer(answer: string) {
        this.studySpotAnswer = answer;
        this.isStudySpot = true;
    }

    getAnswer() {
        return this.studySpotAnswer;
    }

    getIsStudySpot() {
        return this.isStudySpot;
    }

    setIsStudySpot(isStudySpot: boolean) {
        this.isStudySpot = isStudySpot;
    }
}

export class BetRaiseAction extends Action {
    public readonly amount: number;
    public readonly playerPosition: number;

    constructor(actorId: string, position: number, amount: number, isStudySpot?: boolean, studySpotAnswer?: string) {
        super(actorId, isStudySpot, studySpotAnswer);
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

    constructor(actorId: string, position: number, isStudySpot?: boolean, studySpotAnswer?: string) {
        super(actorId, isStudySpot, studySpotAnswer);
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

    constructor(actorId: string, position: number, isStudySpot?: boolean, studySpotAnswer?: string) {
        super(actorId, isStudySpot, studySpotAnswer);
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
