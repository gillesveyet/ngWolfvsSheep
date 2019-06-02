/// <reference lib="webworker" />

import { Solver } from "./Solver";
import { GameState } from './GameState';

addEventListener('message', ({ data }) => {
    //console.log(`Solver.worker data:`, data);
    let solver = new Solver();
    let gs: GameState = data.gameState;

    const response = solver.play(GameState.clone(gs), data.maxDepth);
    //console.log(`Solver.worker response:`, response);
    postMessage(response);
});
