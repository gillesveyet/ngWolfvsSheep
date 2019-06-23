/// <reference lib="webworker" />

import { Solver } from './Solver';

addEventListener('message', ({ data }) => {
    //console.log(`Solver.worker data:`, data);
    let solver =  new  Solver();
    const response = solver.play(data.gameState, data.maxDepth);
    //console.log(`Solver.worker response:`, response);
    postMessage(response);
});
