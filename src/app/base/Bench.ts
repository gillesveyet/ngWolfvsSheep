import { Solver } from './Solver';
import { GameState, GameStatus } from './GameState';
import { detect } from 'detect-browser';

export class Bench {
    static Run(sheepDepth: number, wolfDepth: number, win: Window): void {
        win.document.write('<p>Benchmark running. Please wait.</p>');

        let browser = detect();
        let res = `${new Date().toISOString()} sheepDepth:${sheepDepth} wolfDepth:${wolfDepth} ${browser.name} ${browser.version}`;
        res += '<br>';

        let tsTotal = 0;
        let tsMax = 0;
        let nbTotal = 0;
        let solver = new Solver();

        let gs = GameState.getInitialGameState();

        for (; !gs.isGameOver;) {

            if (gs.isWolf)
                gs = solver.play(gs, wolfDepth);
            else
                gs = solver.play(gs, sheepDepth);

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