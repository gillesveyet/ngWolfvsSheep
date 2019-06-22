import { Solver } from './Solver';
import { GameState, GameStatus } from './GameState';
import { detect } from 'detect-browser';

export class Bench {
    static run(win: Window, settings: { wolfDepth: number, sheepDepth: number }): void {
        win.document.write('<p>Benchmark running. Please wait.</p>');

        let browser = detect();
        let res = `${new Date().toISOString()} sheepDepth:${settings.sheepDepth} wolfDepth:${settings.wolfDepth} ${browser.name} ${browser.version}`;
        res += '<br>';

        let tsTotal = 0;
        let tsMax = 0;
        let nbTotal = 0;
        let nbPlay = 0;
        let nbGen = 0;
        let nbFound = 0;
        let solver = new Solver();

        let gs = GameState.getInitialGameState();

        for (; !gs.isGameOver;) {
            gs = solver.play(gs, gs.isWolf ? settings.wolfDepth : settings.sheepDepth);

            tsTotal += solver.elapsed;
            nbTotal += solver.nbIterations;
            nbPlay += solver.nbPlay;
            nbFound += solver.nbFound;

            if (solver.elapsed > tsMax)
                tsMax = solver.elapsed;

            res += solver.statusString + '<br>';
        }

        solver.reset();

        res += `Done in ${tsTotal} ms - Max=${tsMax} ms - nbTotal=${nbTotal} - nbPlay=${nbPlay} - nbFound=${nbFound} - Result:${solver.score} ${GameStatus[gs.status]} ${gs.status === GameStatus.SheepWon ? 'OK' : 'FAIL'}`;

        if (!win)
            win = window.open('', 'Benchmark');

        win.document.write(`<p style='font-family:Courier New;'>` + res + `</p>`);
    }

    static perf1() {
        let dict = {}
        let start = performance.now();

        //Store
        for (let i = 0; i < 50; ++i) {
            //console.log(`test1 i:${i}`);

            for (let j = i + 1; j < 50; ++j)
                for (let k = j + 1; k < 50; ++k)
                    for (let l = k + 1; l < 50; ++l)
                        for (let m = l + 1; m < 50; ++m) {
                            let key = i | j << 6 | k << 12 | l << 18 | m << 24;
                            dict[key] = `${i} ${j} ${k} ${l} ${m}`;
                        }
        }

        //Get
        for (let i = 0; i < 50; ++i) {
            //console.log(`test1 i:${i}`);

            for (let j = i + 1; j < 50; ++j)
                for (let k = j + 1; k < 50; ++k)
                    for (let l = k + 1; l < 50; ++l)
                        for (let m = l + 1; m < 50; ++m) {
                            let key = i | j << 6 | k << 12 | l << 18 | m << 24;
                            let found = dict[key];

                            if (found !== `${i} ${j} ${k} ${l} ${m}`)
                                console.error(`Fail ${i} ${j} ${k} ${l} ${m} : ${found}`);
                        }
        }



        let elapsed = Math.round(performance.now() - start);
        console.log(`done in ${elapsed} ms`);
    }

    static perf2() {
        let map = new Map<number, string>();
        let start = performance.now();

        //Store
        for (let i = 0; i < 50; ++i) {
            //console.log(`test1 i:${i}`);

            for (let j = i + 1; j < 50; ++j)
                for (let k = j + 1; k < 50; ++k)
                    for (let l = k + 1; l < 50; ++l)
                        for (let m = l + 1; m < 50; ++m) {
                            let key = i | j << 6 | k << 12 | l << 18 | m << 24;
                            map.set(key, `${i} ${j} ${k} ${l} ${m}`);

                        }
        }

        //Get
        for (let i = 0; i < 50; ++i) {
            //console.log(`test1 i:${i}`);

            for (let j = i + 1; j < 50; ++j)
                for (let k = j + 1; k < 50; ++k)
                    for (let l = k + 1; l < 50; ++l)
                        for (let m = l + 1; m < 50; ++m) {
                            let key = i | j << 6 | k << 12 | l << 18 | m << 24;
                            let found = map.get(key);

                            if (found !== `${i} ${j} ${k} ${l} ${m}`)
                                console.error(`Fail ${i} ${j} ${k} ${l} ${m} : ${found}`);
                        }
        }

        let elapsed = Math.round(performance.now() - start);
        console.log(`done in ${elapsed} ms`);
    }

}