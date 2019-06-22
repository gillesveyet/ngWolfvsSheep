/// <reference lib="webworker" />

import { Solver } from './Solver';
import { GameState } from './GameState';

addEventListener('message', ({ data }) => {
    //console.log(`Solver.worker data:`, data);
    let solver = Solver.instance;
    const response = solver.play(data.gameState, data.maxDepth);
    //console.log(`Solver.worker response:`, response);
    postMessage(response);
});
