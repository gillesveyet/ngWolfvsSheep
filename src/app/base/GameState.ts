import { Pos } from './Pos';
import { GameBase, MAX_SCORE } from './GameBase';

export enum GameStatus {
    SheepWon = -1,
    NotFinished = 0,
    WolfWon = 1
}

export interface IGameState {
    readonly nbMoves: number;
    readonly wolf: Pos;
    readonly sheep: Pos[];
    readonly status: GameStatus;
}

export class GameState extends GameBase implements IGameState {
    public status: GameStatus;

    static computeStatus(gs) : GameStatus{
        if (gs.wolfHasWon) {
            return  GameStatus.WolfWon;
        } else if (gs.isWolf &&  gs.getValidWolfMoves().length === 0) {
            return GameStatus.SheepWon;
        }
        else {
            return GameStatus.NotFinished;
        }
    }

    static clone(g: IGameState): GameState {
        let gs = new GameState(g.nbMoves, Pos.clone(g.wolf), g.sheep.map(p => Pos.clone(p)));
        gs.status = g.status;
        return gs;
    }

    static fromGameBase(gb: GameBase): GameState {
        let gs = new GameState(gb.nbMoves, gb.wolf, gb.sheep);
        gs.status = GameState.computeStatus(gs);
        return gs;
    }

    get isGameOver(): boolean {
        return this.status === GameStatus.SheepWon || this.status === GameStatus.WolfWon;
    }

    public makePlayerMove(oldp: Pos, newp: Pos): GameState {
        let gs = this.isWolf ?  this.makeNewGameStateWolf(newp) : this.makeNewGameStateSheep(oldp, newp);
        gs.status = GameState.computeStatus(gs);

        console.log(`${gs.nbMoves.toString().padStart(2)}: ${gs.playerId} status:${GameStatus[gs.status].padEnd(10)} Wolf:${gs.wolf} Sheep:${gs.sheep}`);
        return gs;
    }

    private makeNewGameStateWolf(wolf: Pos): GameState {
        return new GameState(this.nbMoves + 1, wolf, this.sheep);
    }

    private makeNewGameStateSheep(olds: Pos, news: Pos): GameState {
        let gs = new GameState(this.nbMoves + 1, this.wolf, this.sheep);
        gs.moveSheep(olds, news);
        return gs;
    }

    static getInitialGameState() {
        let gs = new GameState(0, Pos.getPos(5, 0), [Pos.getPos(0, 9), Pos.getPos(2, 9), Pos.getPos(4, 9), Pos.getPos(6, 9), Pos.getPos(8, 9)]);
        gs.status = GameStatus.NotFinished;
        return gs;
    }

    public getValidMoves(selected: Pos): Pos[] {
        if (this.isWolf)
            return this.getValidWolfMoves();
        else
            return this.getValidSheepMoves(selected);
    }

    private getValidWolfMoves(): Pos[] {
        let list: Pos[] = [];
        let moves = this.wolf.getWolfMoves();

        for (let p of moves) {
            let ok = true;

            for (let j = 0; j < this.sheep.length; ++j) {
                let s = this.sheep[j];

                if (p === s) {
                    ok = false;
                    break;
                }
            }

            if (ok)
                list.push(p);
        }

        return list;
    }

    private getValidSheepMoves(selected: Pos): Pos[] {
        let list: Pos[] = [];
        let moves = selected.getSheepMoves();

        for (let p of moves) {
            if (p === this.wolf)
                continue;

            let ok = true;

            for (let j = 0; j < this.sheep.length; ++j) {
                let s = this.sheep[j];

                if (p === s) {
                    ok = false;
                    break;
                }
            }

            if (ok)
                list.push(p);

        }

        return list;
    }

}
