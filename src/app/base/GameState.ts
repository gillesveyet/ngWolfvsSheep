import { HashTable } from "./Helper";
import { Model, PlayerMode } from './Model';
import { Pos } from './Pos';

export enum GameStatus {
	SheepWon = -1,
	NotFinished = 0,
	WolfWon = 1
}

export const NB_SHEEP = 5;
export const MAX_SCORE = 1000;
export const MIN_SCORE = -MAX_SCORE;


export class GameState {
	private static DictWolf: HashTable<number> = {};

	private static Ctor = (() => {
		GameState.InitDictWolf();
	})();

	private static InitDictWolf() {
		let patterns: string[] = [
			//Size: 1

			" X " + '!' +
			"O _",

			//Size: 2

			"_ X _" + '!' +
			" _ _ " + '!' +
			"O _ _",

			"_ X _" + '!' +
			" _ _ " + '!' +
			"_ O _",


			"_ X _" + '!' +
			" _ _ " + '!' +
			"O _ O",

			"_ X _" + '!' +
			" _ _ " + '!' +
			"O O _",

			"_ X _" + '!' +
			" O _ " + '!' +
			"O _ _",

			// size: 2 - shift: 1
			//" X _" + '!' +
			//"_ _ " + '!' +
			//" _ _",

			" X _" + '!' +
			"_ _ " + '!' +
			" O _",

			" X _" + '!' +
			"_ _ " + '!' +
			" _ O",

			" X _" + '!' +
			"_ O " + '!' +
			" _ O",

			//Size: 3
			//" _ X _ " + '!' +
			//"_ _ _ _" + '!' +
			//" _ _ _ " + '!' +
			//"_ _ _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ _ _ " + '!' +
			"O _ _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ _ _ " + '!' +
			"_ O _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ _ _ " + '!' +
			"O O _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ _ _ " + '!' +
			"O _ O _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ _ _ " + '!' +
			"O _ _ O",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ _ _ " + '!' +
			"_ O O _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" _ _ _ " + '!' +
			"O _ _ _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" _ _ _ " + '!' +
			"_ O _ _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" _ _ _ " + '!' +
			"_ _ O _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" _ _ _ " + '!' +
			"_ _ _ O",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ _ " + '!' +
			"O _ _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ _ " + '!' +
			"_ O _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ _ " + '!' +
			"_ _ O _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ _ " + '!' +
			"_ _ _ O",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ O _ " + '!' +
			"O _ _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ O _ " + '!' +
			"_ O _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ O _ " + '!' +
			"_ _ O _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ O _ " + '!' +
			"_ _ _ O",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" O _ _ " + '!' +
			"O _ _ _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" O _ _ " + '!' +
			"O O _ _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" O _ _ " + '!' +
			"O _ O _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" O _ _ " + '!' +
			"O _ _ O",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" _ _ _ " + '!' +
			"O O _ _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" _ _ _ " + '!' +
			"O _ O _",

			" _ X _ " + '!' +
			"_ O _ _" + '!' +
			" _ _ _ " + '!' +
			"O _ _ O",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ _ " + '!' +
			"O O _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ _ " + '!' +
			"O _ O _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ _ " + '!' +
			"O _ _ O",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ O " + '!' +
			"O _ _ O",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O _ O " + '!' +
			"O _ _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" O O _ " + '!' +
			"O _ _ _",

			" _ X _ " + '!' +
			"_ _ _ _" + '!' +
			" _ O _ " + '!' +
			"O O _ _",

			//Size: 3 - shift 1
			//"_ X _ " + '!' +
			//" _ _ _" + '!' +
			//"_ _ _ " + '!' +
			//" _ _ _",

			"_ X _ " + '!' +
			" _ _ _" + '!' +
			"_ _ _ " + '!' +
			" O _ _",

			"_ X _ " + '!' +
			" _ _ _" + '!' +
			"_ _ _ " + '!' +
			" _ O _",


			"_ X _ " + '!' +
			" _ _ _" + '!' +
			"_ _ _ " + '!' +
			" _ _ O",

			"_ X _ " + '!' +
			" _ _ _" + '!' +
			"_ _ _ " + '!' +
			" O O _",

			"_ X _ " + '!' +
			" _ _ _" + '!' +
			"_ _ _ " + '!' +
			" O _ O",

			"_ X _ " + '!' +
			" _ _ _" + '!' +
			"_ _ _ " + '!' +
			" _ O O",

			"_ X _ " + '!' +
			" O _ _" + '!' +
			"_ _ _ " + '!' +
			" O _ _",

			"_ X _ " + '!' +
			" O _ _" + '!' +
			"O _ _ " + '!' +
			" O _ _",

			"_ X _ " + '!' +
			" O _ _" + '!' +
			"_ _ _ " + '!' +
			" _ O _",

			"_ X _ " + '!' +
			" O _ _" + '!' +
			"O _ _ " + '!' +
			" _ O _",

			"_ X _ " + '!' +
			" O _ _" + '!' +
			"_ _ _ " + '!' +
			" _ _ O",

			"_ X _ " + '!' +
			" O _ _" + '!' +
			"O _ _ " + '!' +
			" _ _ O",

			"_ X _ " + '!' +
			" _ O _" + '!' +
			"_ _ _ " + '!' +
			" O _ _",

			"_ X _ " + '!' +
			" _ O _" + '!' +
			"_ _ O " + '!' +
			" O _ _",

			"_ X _ " + '!' +
			" _ O _" + '!' +
			"_ _ _ " + '!' +
			" _ O _",

			"_ X _ " + '!' +
			" _ O _" + '!' +
			"_ _ O " + '!' +
			" _ O _",

			"_ X _ " + '!' +
			" _ O _" + '!' +
			"_ _ O " + '!' +
			" _ _ O",

			"_ X _ " + '!' +
			" _ O _" + '!' +
			"_ _ O " + '!' +
			" _ O O",

			"_ X _ " + '!' +
			" _ O _" + '!' +
			"_ _ O " + '!' +
			" O _ O",

			//Size: 3 - shift 2
			//" X _ " + '!' +
			//"_ _ _" + '!' +
			//" _ _ " + '!' +
			//"_ _ _",

			" X _ " + '!' +
			"_ _ _" + '!' +
			" _ _ " + '!' +
			"O _ _",

			" X _ " + '!' +
			"_ _ _" + '!' +
			" _ _ " + '!' +
			"_ O _",

			" X _ " + '!' +
			"_ _ _" + '!' +
			" _ _ " + '!' +
			"_ _ O",

			" X _ " + '!' +
			"O _ _" + '!' +
			" _ _ " + '!' +
			"O _ _",

			" X _ " + '!' +
			"O _ _" + '!' +
			" _ _ " + '!' +
			"_ O _",

			" X _ " + '!' +
			"O _ _" + '!' +
			" _ _ " + '!' +
			"_ _ O",

			" X _ " + '!' +
			"_ _ _" + '!' +
			" _ O " + '!' +
			"_ _ O",

			" X _ " + '!' +
			"_ O _" + '!' +
			" _ O " + '!' +
			"_ _ O",

			" X _ " + '!' +
			"_ O _" + '!' +
			" _ _ " + '!' +
			"_ _ O",

			//Size: 3 - shift 3
			//"X _ " + '!' +
			//" _ _" + '!' +
			//"_ _ " + '!' +
			//" _ _",

			"X _ " + '!' +
			" _ _" + '!' +
			"_ _ " + '!' +
			" O _",

			"X _ " + '!' +
			" _ _" + '!' +
			"_ _ " + '!' +
			" _ O",

			"X _ " + '!' +
			" _ _" + '!' +
			"_ O " + '!' +
			" _ O"
		];


		for (let ip = 0; ip < patterns.length; ++ip) {
			let pattern = patterns[ip];
			let rows = pattern.split("!");
			let nbCol = rows[0].length;
			let nbRow = rows.length;
			let shift = nbRow * 2 - 1 - nbCol;
			let wx = (nbCol - shift - 1) / 2;
			let row = rows[0];
			let offset = (nbRow - shift + 1) % 2;
			let hash1 = 0;
			let hash2 = 0;

			if (nbRow < 2 || nbRow > 5 || shift < 0 || row[wx] !== "X")
				throw "Invalid pattern: " + pattern;

			for (let i = 0; i < nbCol; ++i) {
				let c = row[i];
				if (i !== wx) {
					if (i % 2 === offset) {
						if (c !== "_")
							throw "Invalid pattern: " + pattern;
					}
					else {
						if (c !== " ")
							throw "Invalid pattern: " + pattern;
					}
				}
			}

			for (let dy = 1; dy < nbRow; ++dy) {
				row = rows[dy];

				if (row.length !== nbCol)
					throw "Invalid pattern: " + pattern;

				offset = (nbRow - shift + dy + 1) % 2;

				for (let i = 0; i < nbCol; ++i) {
					let c = row[i];

					if (i % 2 === offset) {
						if (c === "O") {
							let dx = ((i - wx + dy) / 2) | 0;		// optimization : use integer
							hash1 += 1 << dx + dy * 5 - 5;
							hash2 += 1 << dy - dx + dy * 5 - 5;		// symmetry ( left <-> right)
						}
						else if (c !== "_")
							throw "Invalid pattern: " + pattern;
					}
					else {
						if (c !== " ")
							throw "Invalid pattern: " + pattern;
					}
				}
			}

			if (hash1 === 0)
				throw "Invalid pattern: " + pattern;

			let alt = hash1 !== hash2;

			if (shift !== 0) {
				hash1 += shift << 26;	// bits 26-28 : shift 
				hash2 += shift << 26;
				hash2 += 1 << 25;		// bit 25 : 0 = left side,  1 =right side
			}

			GameState.DictWolf[hash1] = nbRow;

			if (alt)
				GameState.DictWolf[hash2] = nbRow;
		}
	}


	static GetInitialGameState() {
		let gs = new GameState(0, Pos.GetPos(5, 0), [Pos.GetPos(0, 9), Pos.GetPos(2, 9), Pos.GetPos(4, 9), Pos.GetPos(6, 9), Pos.GetPos(8, 9)]);
		return gs;
	}

	nbMoves: number;
	isWolf: boolean;
	wolf: Pos;
	sheep: Pos[];
	score: number;

	children: GameState[];	// only at depth=0

	get hasWolfPlayed(): boolean {
		return !this.isWolf;
	}

	constructor(nbMoves: number, wolf: Pos, sheep: Pos[]) {
		this.nbMoves = nbMoves;
		this.isWolf = nbMoves % 2 === 0;
		this.wolf = wolf;
		this.sheep = sheep;
	}

	get isGameOver(): boolean {
		return this.status !== GameStatus.NotFinished;
	}

	private makeNewGameStateWolf(wolf: Pos): GameState {
		return new GameState(this.nbMoves + 1, wolf, this.sheep);
	}

	private makeNewGameStateSheep(olds: Pos, news: Pos): GameState {
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
		//	throw "Missing sheep";

		return new GameState(this.nbMoves + 1, this.wolf, newSheep);
	}

	public makePlayerMove(oldp: Pos, newp: Pos): GameState {
		let gs: GameState;

		if (this.isWolf) {
			gs = this.makeNewGameStateWolf(newp);
			gs.score = gs.wolfHasWon ? MAX_SCORE : 0;
		}
		else {
			gs = this.makeNewGameStateSheep(oldp, newp);

			let states = gs.play();
			gs.score = states.length === 0 ? MAX_SCORE : 0;		// Sheep win (wolf is blocked)
		}

		console.log(`${gs.nbMoves.toString().padStart(2)}: ${gs.getPlayerId(false)} Score:${gs.trueScore.toString().padStart(5)} Wolf:${gs.wolf} Sheep:${gs.sheep}`);

		return gs;
	}

	getPlayerId(cpu: boolean) {
		return `${cpu ? "CPU" : this.playerNumber}:${this.hasWolfPlayed ? "W" : "S"}`.padEnd(5);
	}

	get playerNumber() {
		return  Model.playerMode === PlayerMode.TwoPlayers ? "P" + (this.nbMoves % 2 ? 1 : 2) : "P";
	}

	get trueScore(): number {
		return this.hasWolfPlayed ? this.score : -this.score;
	}

	get scoreForCompare(): number {
		return this.score === undefined ? MIN_SCORE : this.score;
	}


	get status(): GameStatus {
		if (this.score === MAX_SCORE)
			return this.hasWolfPlayed ? GameStatus.WolfWon : GameStatus.SheepWon;
		else
			return GameStatus.NotFinished;
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

	public get wolfHasWon(): boolean {
		return this.deltaWolfToLowestSheep <= 0;
	}

	public get deltaWolfToLowestSheep(): number {
		return this.sheep[0].y - this.wolf.y;
	}

	public get wolfWillWin(): boolean {
		let wy = this.wolf.y;

		if (this.sheep[0].y - wy > 4)	// if lowest sheep is more than 4 row below wolf : skip test
			return false;

		let wx = this.wolf.x;

		let hash = 0;
		let dyMax = 0;

		for (let p of this.sheep) {
			let dy = p.y - wy;

			if (dy <= 0)
				break;		// sheep is same row or above wolf : break is OK because remaining sheep are same or above.

			let dx = ((p.x - wx + dy) / 2) | 0;	// optimization "| 0" is only here to tell browser that dx is an integer. integer div is faster than float div and also integer allocation is faster than float.  

			if (dx < 0 || dx > dy)
				continue;

			if (dy > dyMax)
				dyMax = dy;

			hash += 1 << dx + dy * 5 - 5;
		}

		if (hash === 0)
			return true;

		if (dyMax > wx)
			hash += dyMax - wx << 26;	// shift << 26
		else if (wx + dyMax > 9)
			hash += (1 << 25) + (wx + dyMax - 9 << 26);		// 1 << 25 + shift << 26

		return GameState.DictWolf[hash] !== undefined;
	}

	public play(): GameState[] {
		let S0 = this.sheep[0];
		let S1 = this.sheep[1];
		let S2 = this.sheep[2];
		let S3 = this.sheep[3];
		let S4 = this.sheep[4];

		let list: GameState[] = [];
		let z = 0;

		if (this.isWolf) {
			let moves = this.wolf.getWolfMoves();

			for (let p of moves) {
				if (p !== S0 && p !== S1 && p !== S2 && p !== S3 && p !== S4) {
					//list.push(this.makeNewGameStateWolf(p));
					list[z++] = this.makeNewGameStateWolf(p);	// faster than push, see https://jsperf.com/push-method-vs-setting-via-key
				}
			}
		}
		else {
			let wx = this.wolf.x;

			for (let olds of this.sheep) {
				let x = olds.x;
				let y = olds.y;

				if (y === 0)
					continue;

				let p: Pos;

				if (x > wx) {
					p = Pos.GetPos(x - 1, y - 1);
				}
				else {
					if (x === 9)
						continue;

					p = Pos.GetPos(x + 1, y - 1);
				}

				if (p === this.wolf || p === S0 || p === S1 || p === S2 || p === S3 || p === S4)
					continue;

				//list.push(this.makeNewGameStateSheep(olds, p));
				list[z++] = this.makeNewGameStateSheep(olds, p);
			}


			for (let olds of this.sheep) {
				let x = olds.x;
				let y = olds.y;

				if (y === 0)
					continue;

				let p: Pos;

				if (x > wx) {
					if (x === 9)
						continue;

					p = Pos.GetPos(x + 1, y - 1);
				}
				else {
					if (x === 0)
						continue;

					p = Pos.GetPos(x - 1, y - 1);
				}

				if (p === this.wolf || p === S0 || p === S1 || p === S2 || p === S3 || p === S4)
					continue;

				//list.push(this.makeNewGameStateSheep(olds, p));
				list[z++] = this.makeNewGameStateSheep(olds, p);
			}
		}

		return list;
	}

	public getHashSheep(): number {
		return this.sheep[0].pval | this.sheep[1].pval << 6 | this.sheep[2].pval << 12 | this.sheep[3].pval << 18 | this.sheep[4].pval << 24;
	}

	public getHash(): number {
		//hash is greater than 2^32 but should be ok as numbers are accurate up to 15 digits (IEEE 754 mantissa is 52 bits).
		return (this.sheep[0].pval + 50) * (this.sheep[1].pval + 50) * (this.sheep[2].pval + 50) * (this.sheep[3].pval + 50) * (this.sheep[4].pval + 50) * 50 + this.wolf.pval;
	}


	// // Compute hash as bit field, seems to be a little faster than original getHash
	// //  
	// //   6 : Wolf position  (0 .. 49)
	// //   6 : Sheep Lowest   (0 .. 49) 
	// //
	// // For each remaining sheep (x 4)
	// //   5 : offset to previous sheep - 1 (offset cannot be 0 so we can substract 1)
	// public getHash2(): number {
	// 	let W = this.wolf.pval;
	// 	let S0 = this.sheep[0].pval;
	// 	let S1 = this.sheep[1].pval;
	// 	let S2 = this.sheep[2].pval;
	// 	let S3 = this.sheep[3].pval;
	// 	let S4 = this.sheep[4].pval;

	// 	let d0 = S1 - S0 - 1;
	// 	let d1 = S2 - S1 - 1;
	// 	let d2 = S3 - S2 - 1;
	// 	let d3 = S4 - S3 - 1;

	// 	if( d0 > 32 || d1 > 32 || d2 > 32 || d3 > 32)
	// 		return 0;	// overflow, hash no unique, do not use.

	// 	return W << 26 | S0 << 20 | d0 << 15 | d1 << 10 | d2 << 5 | d3;
	// }
}