import { GameNode } from './GameNode';
import { MIN_SCORE, MAX_SCORE } from './GameBase';
import { GameState, IGameState } from './GameState';

//References: 
// Negamax with alpha beta pruning and transposition tables : https://en.wikipedia.org/wiki/Negamax#Negamax_with_alpha_beta_pruning_and_transposition_tables
// An Introduction to Game Tree Algorithms : http://www.hamedahmadi.com/gametree/
//
//Game over & score :
// 	PlayerA : Wolf   WIN <=> score=1000
// 	PlayerB : Sheep  WIN <=> score=-1000
//
//  1) gsChild.isWolf = true (gsParent.isWolf = false - sheep turn)
//     - Wolf has won : NA
//     - wolf has lost: negamax_score > 0
//
//  2) gsChild.isWolf = false (gsParent.isWolf = true - wolf turn)
//     - Wolf has won : negamax_score > 0
//     - wolf has lost: NA
//  
// 3) no move possible :  score <  0  SHOULD NOT BE POSSIBLE.

enum TranspositionFlag {
    Exact,
    LowerBound,
    UpperBound,
}

class Transposition {
    constructor(public value: number, public flag: TranspositionFlag) { };
}

export class Solver {
    private maxDepth: number;
    private mapTranspositions: Map<number, Transposition>[];
    private bestGame: GameNode;

    public elapsed: number;
    public nbIterations: number;
    public nbPlay: number;
    public nbFound: number;
    public statusString: string;

    static instance: Solver = new Solver();

    public reset() {
        this.mapTranspositions = [];

        for (let i = 0; i < 50; ++i)
            this.mapTranspositions[i] = new Map<number, Transposition>();
    }

    public play(gsParent: IGameState, maxDepth: number): GameState {
        this.maxDepth = maxDepth - 1;
        this.nbFound = this.nbPlay = this.nbIterations = 0;
        let start = performance.now();

        this.reset();
        this.bestGame = null;

        let score = this.negaMax(GameNode.fromIGameState(gsParent), 0, MIN_SCORE, MAX_SCORE);

        let gs: GameNode = this.bestGame;
        score = gs.makeTrueScore(score);

        this.elapsed = Math.round(performance.now() - start);
        this.statusString = `${gs.nbMoves.toString().padStart(2)}: ${gs.playerId} score:${score.toString().padStart(5)} wolf:${gs.wolf} sheep:${gs.sheep} nb:${this.nbIterations} nbPlay:${this.nbPlay} nbFound:${this.nbFound} time:${this.elapsed}`;

        console.log(this.statusString, gs);
        return GameState.fromGameBase(gs);
    }


    private negaMax(gsParent: GameNode, depth: number, alpha: number, beta: number): number {
        ++this.nbIterations;

        let alphaOrig = alpha;

        // Transposition Table Lookup
        let lookupHash = gsParent.getHashSheep();
        let lookupIndex = gsParent.wolf.pval;

        let lookup = this.mapTranspositions[lookupIndex].get(lookupHash);

        if (lookup) {
            ++this.nbFound;
            let value = lookup.value;

            switch (lookup.flag) {
                case TranspositionFlag.Exact:
                    return value;
                case TranspositionFlag.LowerBound:
                    if (value > alpha)
                        alpha = value;
                    break
                default:    // UpperBound
                    if (value < beta)
                        beta = value;
            }

            if (alpha >= beta)
                return value;
        }

        ++this.nbPlay;
        let states = gsParent.play();

        if (states.length === 0) {
            let score = -MAX_SCORE + depth;
            //not stored in wikipedia algo so I am not sure if it would be OK. Unnoticeable effect on performance anyway.
            //this.mapTranspositions[lookupIndex].set(lookupHash, new Transposition(score, TranspositionFlag.Exact));
            return score;
        }

        let wolfTurn = gsParent.isWolf;	// true if wolf plays this turn
        let adjustScore = depth + 1;

        for (let gsChild of states) {
            let x = 0;

            if (gsChild.wolfHasWon) {                       // wolf play and win
                x = MAX_SCORE - adjustScore;
            } else if (gsChild.isSheepBest) {	            // sheep : perfect move
                x = -900 + adjustScore;
            } else if (gsChild.wolfWillWin) {
                x = MAX_SCORE - adjustScore - gsChild.deltaWolfToLowestSheep * 2;
            }

            if (!wolfTurn) {
                x = -x;
            }

            gsChild.score = x;

            if (x >= 800) {
                if (depth === 0) {
                    this.bestGame = gsChild;
                }

                //not sure if it would be OK. Unnoticeable effect on performance anyway.
                //this.mapTranspositions[lookupIndex].set(lookupHash, new Transposition(x, TranspositionFlag.Exact));
                return x;
            }
        }

        let value = MIN_SCORE;

        for (let gsChild of states) {
            let x = gsChild.score;

            if (x) {
                // Use x from previous step
            }
            else if (depth === this.maxDepth) {
                x = 0;
            }
            else {
                x = -this.negaMax(gsChild, depth + 1, -beta, -alpha);
            }

            if (depth === 0 && wolfTurn)
                console.log(`wolf:${gsChild.wolf} score:${x}`);


            if (x > value) {
                value = x;

                if (depth === 0) {
                    this.bestGame = gsChild;
                }

                if (value > alpha) {
                    alpha = value;

                    if (alpha >= beta)
                        break;
                }
            }
        }

        let flag = TranspositionFlag.Exact;

        if (value <= alphaOrig)
            flag = TranspositionFlag.UpperBound;
        else if (value >= beta)
            flag = TranspositionFlag.LowerBound

        this.mapTranspositions[lookupIndex].set(lookupHash, new Transposition(value, flag));
        return value;
    }
} 
