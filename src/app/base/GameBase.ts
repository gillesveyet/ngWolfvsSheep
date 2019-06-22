import { Pos } from './Pos';

export const NB_SHEEP = 5;
export const MAX_SCORE = 1000;
export const MIN_SCORE = -MAX_SCORE;


export class GameBase{
    nbMoves: number;
    isWolf: boolean;
    wolf: Pos;
    sheep: Pos[];

    constructor(nbMoves: number, wolf: Pos, sheep: Pos[]) {
        this.nbMoves = nbMoves;
        this.isWolf = nbMoves % 2 === 0;
        this.wolf = wolf;
        this.sheep = sheep;
    }

    public get playerId() {
        return `${this.hasWolfPlayed ? 'W' : 'S'}`;
    }

    public get hasWolfPlayed(): boolean {
        return !this.isWolf;
    }

    public get wolfHasWon(): boolean {
        return this.deltaWolfToLowestSheep <= 0;
    }

    public get deltaWolfToLowestSheep(): number {
        return this.sheep[0].y - this.wolf.y;
    }

    public moveSheep(olds: Pos, news: Pos): void {
        let newSheep: Pos[] = [];
        let shift = false;
        let newspval = news.pval;
        let z = 0;

        for (let p of this.sheep) {
            if (p === olds) {
                shift = true;
                continue;
            }

            if (shift && newspval < p.pval) {
                //newSheep.push(news);
                newSheep[z++] = news;
                shift = false;
            }

            //newSheep.push(p);
            newSheep[z++] = p;
        }

        if (shift)
            //newSheep.push(news);
            newSheep[z++] = news;

        //if (newSheep.length < 5)
        //	throw 'Missing sheep';

        this.sheep = newSheep;
    }

    
    makeTrueScore(score:number): number {
        return this.hasWolfPlayed ? score : -score;
    }
  
}