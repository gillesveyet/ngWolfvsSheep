import { Pos } from './Pos';
import { GameBase, NB_SHEEP } from './GameBase';
import { IGameState } from './GameState';

export class GameNode extends GameBase {
    public score: number;

    private static sheepBest: Pos[][];
    private static mapWolfWin = new Map<number, number>();

    private static Ctor = (() => {
        GameNode.initSheepBest();
        GameNode.initDictWolf();
    })();

    private static initSheepBest(): void {
        let best: Pos[][] = [];

        // Sheep can play 45 times but only store 30 : this consumes more cycles but should give better (quicker win for sheep).
        // Also must not store 45 otherwise Solver must handle case when sheep wins on their move (wolf has no moves left). 
        for (let n = 0; n < 30; ++n) {
            let sheep: Pos[] = [];

            let k = n % 10;
            let by = (n / 10 | 0) * 2;

            for (let i = 0; i < NB_SHEEP; ++i) {
                let x = 2 * i;
                let dy: number;

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

                sheep[i] = Pos.getPos(x, 9 - dy);
            }

            sheep.sort((a: Pos, b: Pos) => { return a.pval - b.pval; });
            best[n] = sheep;
        }

        GameNode.sheepBest = best;
        console.log('sheepBest:', best);

    }
    private static initDictWolf() {
        let patterns: string[] = [
            //Size: 1

            ' X ' + '!' +
            'O _',

            //Size: 2

            '_ X _' + '!' +
            ' _ _ ' + '!' +
            'O _ _',

            '_ X _' + '!' +
            ' _ _ ' + '!' +
            '_ O _',


            '_ X _' + '!' +
            ' _ _ ' + '!' +
            'O _ O',

            '_ X _' + '!' +
            ' _ _ ' + '!' +
            'O O _',

            '_ X _' + '!' +
            ' O _ ' + '!' +
            'O _ _',

            // size: 2 - shift: 1
            //' X _' + '!' +
            //'_ _ ' + '!' +
            //' _ _',

            ' X _' + '!' +
            '_ _ ' + '!' +
            ' O _',

            ' X _' + '!' +
            '_ _ ' + '!' +
            ' _ O',

            ' X _' + '!' +
            '_ O ' + '!' +
            ' _ O',

            //Size: 3
            //' _ X _ ' + '!' +
            //'_ _ _ _' + '!' +
            //' _ _ _ ' + '!' +
            //'_ _ _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O _ _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ _ _ ' + '!' +
            '_ O _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O O _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O _ O _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O _ _ O',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ _ _ ' + '!' +
            '_ O O _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O _ _ _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' _ _ _ ' + '!' +
            '_ O _ _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' _ _ _ ' + '!' +
            '_ _ O _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' _ _ _ ' + '!' +
            '_ _ _ O',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ _ ' + '!' +
            'O _ _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ _ ' + '!' +
            '_ O _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ _ ' + '!' +
            '_ _ O _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ _ ' + '!' +
            '_ _ _ O',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ O _ ' + '!' +
            'O _ _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ O _ ' + '!' +
            '_ O _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ O _ ' + '!' +
            '_ _ O _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ O _ ' + '!' +
            '_ _ _ O',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' O _ _ ' + '!' +
            'O _ _ _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' O _ _ ' + '!' +
            'O O _ _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' O _ _ ' + '!' +
            'O _ O _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' O _ _ ' + '!' +
            'O _ _ O',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O O _ _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O _ O _',

            ' _ X _ ' + '!' +
            '_ O _ _' + '!' +
            ' _ _ _ ' + '!' +
            'O _ _ O',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ _ ' + '!' +
            'O O _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ _ ' + '!' +
            'O _ O _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ _ ' + '!' +
            'O _ _ O',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ O ' + '!' +
            'O _ _ O',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O _ O ' + '!' +
            'O _ _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' O O _ ' + '!' +
            'O _ _ _',

            ' _ X _ ' + '!' +
            '_ _ _ _' + '!' +
            ' _ O _ ' + '!' +
            'O O _ _',

            //Size: 3 - shift 1
            //'_ X _ ' + '!' +
            //' _ _ _' + '!' +
            //'_ _ _ ' + '!' +
            //' _ _ _',

            '_ X _ ' + '!' +
            ' _ _ _' + '!' +
            '_ _ _ ' + '!' +
            ' O _ _',

            '_ X _ ' + '!' +
            ' _ _ _' + '!' +
            '_ _ _ ' + '!' +
            ' _ O _',


            '_ X _ ' + '!' +
            ' _ _ _' + '!' +
            '_ _ _ ' + '!' +
            ' _ _ O',

            '_ X _ ' + '!' +
            ' _ _ _' + '!' +
            '_ _ _ ' + '!' +
            ' O O _',

            '_ X _ ' + '!' +
            ' _ _ _' + '!' +
            '_ _ _ ' + '!' +
            ' O _ O',

            '_ X _ ' + '!' +
            ' _ _ _' + '!' +
            '_ _ _ ' + '!' +
            ' _ O O',

            '_ X _ ' + '!' +
            ' O _ _' + '!' +
            '_ _ _ ' + '!' +
            ' O _ _',

            '_ X _ ' + '!' +
            ' O _ _' + '!' +
            'O _ _ ' + '!' +
            ' O _ _',

            '_ X _ ' + '!' +
            ' O _ _' + '!' +
            '_ _ _ ' + '!' +
            ' _ O _',

            '_ X _ ' + '!' +
            ' O _ _' + '!' +
            'O _ _ ' + '!' +
            ' _ O _',

            '_ X _ ' + '!' +
            ' O _ _' + '!' +
            '_ _ _ ' + '!' +
            ' _ _ O',

            '_ X _ ' + '!' +
            ' O _ _' + '!' +
            'O _ _ ' + '!' +
            ' _ _ O',

            '_ X _ ' + '!' +
            ' _ O _' + '!' +
            '_ _ _ ' + '!' +
            ' O _ _',

            '_ X _ ' + '!' +
            ' _ O _' + '!' +
            '_ _ O ' + '!' +
            ' O _ _',

            '_ X _ ' + '!' +
            ' _ O _' + '!' +
            '_ _ _ ' + '!' +
            ' _ O _',

            '_ X _ ' + '!' +
            ' _ O _' + '!' +
            '_ _ O ' + '!' +
            ' _ O _',

            '_ X _ ' + '!' +
            ' _ O _' + '!' +
            '_ _ O ' + '!' +
            ' _ _ O',

            '_ X _ ' + '!' +
            ' _ O _' + '!' +
            '_ _ O ' + '!' +
            ' _ O O',

            '_ X _ ' + '!' +
            ' _ O _' + '!' +
            '_ _ O ' + '!' +
            ' O _ O',

            //Size: 3 - shift 2
            //' X _ ' + '!' +
            //'_ _ _' + '!' +
            //' _ _ ' + '!' +
            //'_ _ _',

            ' X _ ' + '!' +
            '_ _ _' + '!' +
            ' _ _ ' + '!' +
            'O _ _',

            ' X _ ' + '!' +
            '_ _ _' + '!' +
            ' _ _ ' + '!' +
            '_ O _',

            ' X _ ' + '!' +
            '_ _ _' + '!' +
            ' _ _ ' + '!' +
            '_ _ O',

            ' X _ ' + '!' +
            'O _ _' + '!' +
            ' _ _ ' + '!' +
            'O _ _',

            ' X _ ' + '!' +
            'O _ _' + '!' +
            ' _ _ ' + '!' +
            '_ O _',

            ' X _ ' + '!' +
            'O _ _' + '!' +
            ' _ _ ' + '!' +
            '_ _ O',

            ' X _ ' + '!' +
            '_ _ _' + '!' +
            ' _ O ' + '!' +
            '_ _ O',

            ' X _ ' + '!' +
            '_ O _' + '!' +
            ' _ O ' + '!' +
            '_ _ O',

            ' X _ ' + '!' +
            '_ O _' + '!' +
            ' _ _ ' + '!' +
            '_ _ O',

            //Size: 3 - shift 3
            //'X _ ' + '!' +
            //' _ _' + '!' +
            //'_ _ ' + '!' +
            //' _ _',

            'X _ ' + '!' +
            ' _ _' + '!' +
            '_ _ ' + '!' +
            ' O _',

            'X _ ' + '!' +
            ' _ _' + '!' +
            '_ _ ' + '!' +
            ' _ O',

            'X _ ' + '!' +
            ' _ _' + '!' +
            '_ O ' + '!' +
            ' _ O'
        ];

        let mapWolf = GameNode.mapWolfWin;

        for (let ip = 0; ip < patterns.length; ++ip) {
            let pattern = patterns[ip];
            let rows = pattern.split('!');
            let nbCol = rows[0].length;
            let nbRow = rows.length;
            let shift = nbRow * 2 - 1 - nbCol;
            let wx = (nbCol - shift - 1) / 2;
            let row = rows[0];
            let offset = (nbRow - shift + 1) % 2;
            let hash1 = 0;
            let hash2 = 0;

            if (nbRow < 2 || nbRow > 5 || shift < 0 || row[wx] !== 'X')
                throw 'Invalid pattern: ' + pattern;

            for (let i = 0; i < nbCol; ++i) {
                let c = row[i];
                if (i !== wx) {
                    if (i % 2 === offset) {
                        if (c !== '_')
                            throw 'Invalid pattern: ' + pattern;
                    }
                    else {
                        if (c !== ' ')
                            throw 'Invalid pattern: ' + pattern;
                    }
                }
            }

            for (let dy = 1; dy < nbRow; ++dy) {
                row = rows[dy];

                if (row.length !== nbCol)
                    throw 'Invalid pattern: ' + pattern;

                offset = (nbRow - shift + dy + 1) % 2;

                for (let i = 0; i < nbCol; ++i) {
                    let c = row[i];

                    if (i % 2 === offset) {
                        if (c === 'O') {
                            let dx = ((i - wx + dy) / 2) | 0;		// optimization : use integer
                            hash1 += 1 << dx + dy * 5 - 5;
                            hash2 += 1 << dy - dx + dy * 5 - 5;		// symmetry ( left <-> right)
                        }
                        else if (c !== '_')
                            throw 'Invalid pattern: ' + pattern;
                    }
                    else {
                        if (c !== ' ')
                            throw 'Invalid pattern: ' + pattern;
                    }
                }
            }

            if (hash1 === 0)
                throw 'Invalid pattern: ' + pattern;

            let alt = hash1 !== hash2;

            if (shift !== 0) {
                hash1 += shift << 26;	// bits 26-28 : shift 
                hash2 += shift << 26;
                hash2 += 1 << 25;		// bit 25 : 0 = left side,  1 =right side
            }

            mapWolf.set(hash1, nbRow);

            if (alt)
                mapWolf.set(hash2, nbRow);
        }
    }

    static fromIGameState(gs: IGameState): GameNode {
        return new GameNode(gs.nbMoves, Pos.clone(gs.wolf), gs.sheep.map(p => Pos.clone(p)));
    }

    private makeNewGameStateWolf(wolf: Pos): GameNode {
        return new GameNode(this.nbMoves + 1, wolf, this.sheep);
    }

    private makeNewGameStateSheep(olds: Pos, news: Pos): GameNode {
        let gn = new GameNode(this.nbMoves + 1, this.wolf, this.sheep);
        gn.moveSheep(olds, news);
        return gn;
    }

    public get isSheepBest(): boolean {
        let yh = this.sheep[4].y;
        let yl = this.sheep[0].y;

        let nb = this.nbMoves / 2 | 0;

        if (nb >= GameNode.sheepBest.length)
            return false;

        let b: Pos[] = GameNode.sheepBest[nb];
        //console.log(`isSheepBest ${this.nbMoves} => ${b}`);
        return yh - yl <= 1 && this.sheep[0].equals(b[0]) && this.sheep[1].equals(b[1]) && this.sheep[2].equals(b[2]) && this.sheep[3].equals(b[3]) && this.sheep[4].equals(b[4]);
    }

    //Sheep turn but cannot prevent wolf to win.
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

            let dx = ((p.x - wx + dy) / 2) | 0;	// optimization '| 0' is only here to tell browser that dx is an integer. integer div is faster than float div and also integer allocation is faster than float.  

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

        return GameNode.mapWolfWin.get(hash) !== undefined;
    }

    public play(): GameNode[] {
        let S0 = this.sheep[0];
        let S1 = this.sheep[1];
        let S2 = this.sheep[2];
        let S3 = this.sheep[3];
        let S4 = this.sheep[4];

        let list: GameNode[] = [];
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
                    p = Pos.getPos(x - 1, y - 1);
                }
                else {
                    if (x === 9)
                        continue;

                    p = Pos.getPos(x + 1, y - 1);
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

                    p = Pos.getPos(x + 1, y - 1);
                }
                else {
                    if (x === 0)
                        continue;

                    p = Pos.getPos(x - 1, y - 1);
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
}