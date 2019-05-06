import { HashTable } from "./Helper";
import {Pos} from "./Pos";

import {GameState, NB_SHEEP,  MIN_SCORE, MAX_SCORE} from "./GameState";

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
	// Static Init
	private static dictSheep: HashTable<boolean> = {};

	private static Ctor = (() => {
		Solver.InitDictSheep();
	})();

	private static InitDictSheep(): void {
		for (let n = 0; n < 30; ++n) {
			let sheep: Pos[] = [];

			let k = n % 10;
			let by = (n / 10 | 0) * 2;

			for (let i = 0; i < NB_SHEEP; ++i) {
				let x = 2 * i;
				let dy;

				if (k <= 5) {
					dy = by;

					if (i < k) {
						++dy;
						++x;
					}
				}
				else {
					dy = by + 1;

					if (i >= 10 - k)
						++dy;
					else
						++x;
				}

				sheep[i] = Pos.GetPos(x, 9 - dy);
			}

			sheep.sort((a: Pos, b: Pos) => { return a.pval - b.pval; });

			let gs = new GameState(n * 2, new Pos(5, 0), sheep);	// wolf position is not important
			this.dictSheep[gs.getHashSheep()] = true;
		}
	}
	// End Static Init

	private maxDepth: number;
	private readonly pruneDepth = 10;
	private dictTmp: HashTable<number>;

	public score: number;
	public elapsed: number;
	public nbIterations: number;
	public statusString: string;

	public play(gsParent: GameState, maxDepth: number): GameState {
		this.maxDepth = maxDepth - 1;
		this.nbIterations = 0;
		this.dictTmp = {};

		let startDate = new Date();

		this.negaMax(gsParent, 0, MIN_SCORE, MAX_SCORE);

		let gs = null;

		for (let gsChild of gsParent.children) {
			let val = gsChild.score;

			if (val !== undefined && (!gs || val > gs.score)) {
				gs = gsChild;
			}
		}

		this.score = gs.trueScore;
		this.elapsed = new Date().getTime() - startDate.getTime();
		this.statusString = `${gs.nbMoves.toString().padStart(2)}: ${gs.getPlayerId(true)} Score:${gs.trueScore.toString().padStart(5)} Wolf:${gs.wolf} Sheep:${gs.sheep} Nb:${this.nbIterations} Time:${this.elapsed}`;

		this.dictTmp = {};

		return gs;
	}


	private negaMax(gsParent: GameState, depth: number, alpha: number, beta: number): number {
		++this.nbIterations;

		let states = gsParent.play();

		if (depth === 0)
			gsParent.children = states;

		if (states.length === 0)
			return -MAX_SCORE + depth - 1;	// substract -1 because sheep has won on previous move (wold is blocked).

		let wolfTurn = gsParent.isWolf;	// true if wolf plays this turn

		for (let gsChild of states) {
			let score = undefined;

			if (wolfTurn) {
				if (gsChild.wolfHasWon)			// wolf play and win
					score = MAX_SCORE - depth;		// 		=> if depth = 0 : perfect score
				else if (gsChild.wolfWillWin)
					score = MAX_SCORE - depth - gsChild.deltaWolfToLowestSheep;
			}
			else if (Solver.dictSheep[gsChild.getHashSheep()])	// sheep : perfect move
				score = 800 + depth;

			if (score !== undefined) {
				this.dictTmp[gsParent.getHash()] = -score;	//negate the score before store so it is not necessary to do this after retrieving from dictionary
				return gsChild.score = score;
			}
		}

		let max = MIN_SCORE;
		let smax = MAX_SCORE - depth;
		let okPrune = depth < this.pruneDepth;
		let okDict = depth >= this.pruneDepth;


		for (let gsChild of states) {
			let x: number;
			if (!wolfTurn && gsChild.wolfHasWon)
				x = -MAX_SCORE + depth + 1;									// sheep bad move, wolf win on next turn.
			else if (!wolfTurn && gsChild.wolfWillWin)
				x = -MAX_SCORE + depth + gsChild.deltaWolfToLowestSheep;	//sheep has played but wolf will win soon.
			else if (depth === this.maxDepth)
				x = 0;
			else if (smax <= alpha)
				x = smax;
			else if ((x = this.dictTmp[gsChild.getHash()]) !== undefined) {
				//use x from dictionary
			} else
				x = -this.negaMax(gsChild, depth + 1, -beta, -alpha);

			gsChild.score = x;

			if (x > alpha) {
				alpha = x;

				if (okPrune && alpha >= beta)
					return alpha;
			}

			if (x > max)
				max = x;
		}

		if (okDict)
			this.dictTmp[gsParent.getHash()] = -max;	//negate the score before store so it is not necessary to do this after retrieving from dictionary

		return max;
	}
} 