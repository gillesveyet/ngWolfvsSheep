import { Solver } from "./Solver";
import { GameState, GameStatus } from './GameState';

export class Bench
{
	private static getBrowserName() : string
	{
		let agt = navigator.userAgent;

		if (agt.indexOf("Trident") > 0)
			return "Internet Explorer";

		return agt.substring(agt.lastIndexOf(" "));
	}

	static Run(sheepDepth: number, wolfDepth: number, win: Window): void
	{
		win.document.write("<p>Benchmark running. Please wait.</p>");

		let res = `${new Date().toISOString()} sheepDepth:$sheepDepth1} wolfDepth:${wolfDepth} ${this.getBrowserName()}`;
		res += "<br>";

		let tsTotal = 0;
		let tsMax = 0;
		let nbTotal = 0;
		let solver: Solver;

		let gs = GameState.getInitialGameState();

		for (; !gs.isGameOver ;)
		{
			solver = new Solver();

			if (gs.isWolf)
				gs = solver.play(gs, wolfDepth);
			else
				gs = solver.play(gs, sheepDepth);

			tsTotal += solver.elapsed;
			nbTotal += solver.nbIterations;

			if (solver.elapsed > tsMax)
				tsMax = solver.elapsed;

			res += solver.statusString + "<br>";
		}

		res += `Done in ${tsTotal} ms - Max=${tsMax} ms - NbTotal=${nbTotal} - Result:${solver.score} ${GameStatus[gs.status]} ${gs.status === GameStatus.SheepWon ? 'OK' : 'FAIL'}`;

		if( !win)
			win = window.open("", "Benchmark");

		win.document.write(`<p style="font-family:Courier New;">` + res + `</p>`);
	}
}