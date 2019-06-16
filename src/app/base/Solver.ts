import { GameState, MIN_SCORE, MAX_SCORE } from './GameState';

//Reference: An Introduction to Game Tree Algorithms : http://www.hamedahmadi.com/gametree/
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

export class Solver {
    private maxDepth: number;
    private readonly pruneDepth = 10;
    private mapGameState: Map<number, GameState>[];

    public score: number;
    public elapsed: number;
    public nbIterations: number;
    public nbPlay: number;
    public nbGen: number;
    public nbFound: number;
    public statusString: string;

    static instance: Solver = new Solver();

    // reset is currently done at start of play() so it is not needed in constructor.
    // constructor() {
    //     this.reset();
    // }

    public reset() {
        this.mapGameState = [];

        for (let i = 0; i < 50; ++i)
            this.mapGameState[i] = new Map<number, GameState>();
    }

    public play(gsParent: GameState, maxDepth: number): GameState {
        this.maxDepth = maxDepth - 1;
        this.nbFound = this.nbGen = this.nbPlay = this.nbIterations = 0;

        this.reset();
        let start = performance.now();

        // if (gsParent.children && gsParent.children.length === 0) {
        //     console.log('bug1', gsParent);
        // }

        this.negaMax(gsParent, 0, MIN_SCORE, MAX_SCORE);

        let gs: GameState = null;
        let x = MIN_SCORE - 1;

        // if (!gsParent.children || gsParent.children.length === 0) {
        //     console.log('bug2', gsParent);
        // }

        for (let gsChild of gsParent.children) {
            if (gsChild.score > x) {
                x = gsChild.score;
                gs = gsChild;
            }
        }

        if (gs.children && gs.children.length === 0 || gsParent.isWolf && gs.wolfHasWon) {
            gs.score = MAX_SCORE;
            gs.children = null;
        }

        this.score = gs.trueScore;
        this.elapsed = Math.round(performance.now() - start);
        this.statusString = `${gs.nbMoves.toString().padStart(2)}: ${gs.getPlayerId(true)} score:${gs.trueScore.toString().padStart(5)} wolf:${gs.wolf} sheep:${gs.sheep} nb:${this.nbIterations} nbPlay:${this.nbGen} nbFound:${this.nbGen} nbFound:${this.nbFound} time:${this.elapsed}`;

        console.log(this.statusString, gs);

        gsParent.children = null;

        //much slower if next line commented out, very strange!
        gs.children = null;     // keep nothing for next play at the moment. See also reset() above in this method.

        return gs;
    }


    private negaMax(gsParent: GameState, depth: number, alpha: number, beta: number): number {
        ++this.nbIterations;

        let states = gsParent.children;

        if (!states) {
            ++this.nbPlay;

            states = gsParent.children = gsParent.play().map(gs => {
                ++this.nbGen;

                let hash = gs.getHashSheep();
                let w = gs.wolf.pval;
                let found = this.mapGameState[w].get(hash);

                if (found) {
                    gs = found;
                    ++this.nbFound;
                } else {
                    this.mapGameState[w].set(hash, gs);
                }

                return gs;
            });
        }

        if (states.length === 0) {
            let score = -MAX_SCORE + gsParent.nbMoves;
            return score;
        }

        let wolfTurn = gsParent.isWolf;	// true if wolf plays this turn

        for (let gsChild of states) {
            let x = gsChild.score;

            if (!gsChild.final) {       // opposite of (gsChild.final || x >= beta).  'x' may be undefined. 
                x = 0;

                if (gsChild.wolfHasWon)			                                // wolf play and win
                    x = MAX_SCORE - gsChild.nbMoves;
                else if (gsChild.children && gsChild.children.length === 0)     // sheep won.
                    x = -MAX_SCORE + gsChild.nbMoves;
                else if (gsChild.isSheepBest)	                                // sheep : perfect move
                    x = -800 - gsChild.nbMoves;
                else if (gsChild.wolfWillWin)
                    x = MAX_SCORE - gsChild.nbMoves; - gsChild.deltaWolfToLowestSheep * 2;

                if (!wolfTurn) {
                    x = -x;
                }

                if (x) {
                    gsChild.score = x;
                    gsChild.final = true;
                }
            }

            if (x >= 800) {
                gsParent.final = true;
                gsParent.children = [gsChild];  // keep only best move
                return x;
            }

        }

        let max = MIN_SCORE;
        let final = true;

        for (let gsChild of states) {
            let x = gsChild.score;

            if (gsChild.final) {
                // Use x OK
            }
            else if (depth === this.maxDepth) {
                x = 0;
                final = false;
            }
            else {
                x = -this.negaMax(gsChild, depth + 1, -beta, -alpha);
                final = final && gsChild.final;
            }

            gsChild.score = x;

            if (x > alpha) {
                alpha = x;

                if (alpha >= beta) {
                    gsParent.final = false;
                    return alpha;
                }
            }

            if (x > max)
                max = x;
        }

        gsParent.final = final;
        return max;
    }
} 
