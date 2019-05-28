import { Solver } from './Solver';
import { GameState, GameStatus } from './GameState';
import { detect } from 'detect-browser';

export class Bench {
    static Run(win: Window, settings: { wolfDepth: number, sheepDepth: number }): void {
        win.document.write('<p>Benchmark running. Please wait.</p>');

        let browser = detect();
        let res = `${new Date().toISOString()} sheepDepth:${settings.sheepDepth} wolfDepth:${settings.wolfDepth} ${browser.name} ${browser.version}`;
        res += '<br>';

        let tsTotal = 0;
        let tsMax = 0;
        let nbTotal = 0;
        let solver = new Solver();

        let gs = GameState.getInitialGameState();

        for (; !gs.isGameOver;) {
            solver = new Solver();

            gs = solver.play(gs, gs.isWolf ? settings.wolfDepth : settings.sheepDepth);

            tsTotal += solver.elapsed;
            nbTotal += solver.nbIterations;

            if (solver.elapsed > tsMax)
                tsMax = solver.elapsed;

            res += solver.statusString + '<br>';
        }

        solver.reset();

        res += `Done in ${tsTotal} ms - Max=${tsMax} ms - NbTotal=${nbTotal} - Result:${solver.score} ${GameStatus[gs.status]} ${gs.status === GameStatus.SheepWon ? 'OK' : 'FAIL'}`;

        if (!win)
            win = window.open('', 'Benchmark');

        win.document.write(`<p style='font-family:Courier New;'>` + res + `</p>`);
    }
}