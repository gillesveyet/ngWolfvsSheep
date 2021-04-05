import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { PlayerMode } from './base/Model';
import { CheckerPanel } from './base/CheckerPanel';
import { Bench } from './base/Bench';
import { Pos } from './base/Pos';
import { NewGameComponent, NewGameData, NewGameResult } from './views/new-game/new-game.component';
import { EndGameComponent, EndGameDialogData } from './views/end-game/end-game.component';
import { GameState, GameStatus } from './base/GameState';
import { SwUpdate } from '@angular/service-worker';

const { version: appVersion } = require('../../package.json')

enum Autoplay {
    Off,
    Run,
    Pausing,
    Paused
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    status: string;
    playerMode: PlayerMode = PlayerMode.None;
    cpuLevel = 2;    // 0=Low, 1=Medium, 2=High
    isExpertMode = false;
    showSpinner = false;
    autoplay: Autoplay = Autoplay.Off;
    autoplayDelay = 150;    // delay in ms.
    settings = { wolfDepth: 0, sheepDepth: 0 };

    readonly workerSolver = new Worker('./base/Solver.worker', { type: 'module' });
    checker: CheckerPanel;
    gameHistory: GameState[] = [];
    busy = false;

    get inGame() {
        return this.playerMode !== PlayerMode.None;
    }

    get showMenuGame() {
        return this.autoplay === Autoplay.Off || this.autoplay === Autoplay.Paused;
    }

    get isGameBackEnabled() {
        return this.gameHistory.length > 2 || this.isTwoPlayerMode && this.gameHistory.length > 1;
    }

    get isAutoplayOn(): boolean {
        return this.autoplay !== Autoplay.Off;
    }

    get isAutoplayRun(): boolean {
        return this.autoplay === Autoplay.Run;
    }

    get isAutoplayPausing(): boolean {
        return this.autoplay === Autoplay.Pausing;
    }

    @ViewChild('canBoard', { static: true }) canvasRef: ElementRef;
    @ViewChild('fileSaver', { static: true }) fileSaver: ElementRef;

    constructor(
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private readonly updates: SwUpdate
    ) {
        this.route.queryParams.subscribe(params => {
            //note: this is called twice on app startup
            this.isExpertMode = params['expert'] !== undefined;
            console.log(`isExpertMode:${this.isExpertMode} params:`, params);
        });

        this.updates.available.subscribe(e => {
            console.log(`Update available current:${e.current} available:${e.available}`);
        });

        console.log( `Version: ${appVersion}`);
    }

    ngOnInit() {
        window['bench'] = Bench;

        this.adjustCpuLevel();

        this.checker = new CheckerPanel(this.canvasRef.nativeElement);

        this.checker.onGetValidMoves = (selected: Pos) => {
            return this.getGS().getValidMoves(selected);
        };

        this.checker.onMovePiece = (oldPos: Pos, newPos: Pos) => {
            let gs = this.getGS().makePlayerMove(oldPos, newPos);
            this.addGS(gs);
            this.checker.setPositions(gs, this.isTwoPlayerMode && !gs.isGameOver);

            this.displayInfo();

            if (!gs.isGameOver && !this.isTwoPlayerMode)
                this.makeCpuPlay();
        }

        this.checker.init().subscribe(() => {
            this.resetGame();
        });

        this.workerSolver.onmessage = ({ data }) => {
            //console.log(`workerSolver got message:`, data);
            this.onCpuPlay(GameState.clone(data));
        };

        //already not visible (behind main view).
        (document.querySelector('.loader') as HTMLElement).style.display = 'none';
    }

    adjustCpuLevel() {
        let depth = [5, 7, 17][this.cpuLevel];
        this.settings.wolfDepth = this.settings.sheepDepth = depth;
        console.log(`CPU Level:${this.cpuLevel} => ${depth}`)
    }

    cpuPlay() {
        this.busy = true;
        //let gs = this.solver.play(this.getGS(), this.getGS().isWolf ? this.settings.wolfDepth : this.settings.sheepDepth);
        let data = { gameState: this.getGS(), maxDepth: this.getGS().isWolf ? this.settings.wolfDepth : this.settings.sheepDepth };
        this.workerSolver.postMessage(data);
    }


    onCpuPlay(gs: GameState) {
        this.addGS(gs);

        if (this.isAutoplayOn && (gs.isGameOver || this.isAutoplayPausing)) {
            this.autoplay = Autoplay.Paused;
        }

        let auto = this.autoplay === Autoplay.Run;

        this.checker.setPositions(gs, !gs.isGameOver && !auto);
        this.displayInfo();
        this.busy = false;
        this.showSpinner = false;

        if (auto)
            this.makeAutoplay();
    }


    makeAutoplay(): void {
        this.autoplay = Autoplay.Run;
        this.displayInfo();

        setTimeout(() => {
            if (this.autoplay === Autoplay.Pausing) {
                this.autoplay = Autoplay.Paused;
                let gs = this.getGS();
                this.checker.setPositions(gs, !gs.isGameOver);
                this.displayInfo();
                return;
            }

            this.cpuPlay();
        }, this.autoplayDelay);
    }

    makeCpuPlay(): void {
        this.showSpinner = true;
        this.displayStatus('Computer is thinking...');
        this.cpuPlay();
    }

    /**
    * Listener to KeyboardEvent on document.
    * @param {KeyboardEvent} evt
    */
    @HostListener('document:keydown', ['$event'])
    onKeydownHandler(evt: KeyboardEvent) {
        switch (evt.which || evt.keyCode || parseInt(evt.code, 10)) {
            case 32: //space key
                //console.log(`Space pressed`, document.activeElement);
                this.handleExpertPlay();
                evt.preventDefault();
                break;
        }
    }

    handleExpertPlay() {
        let gs = this.getGS();
        //console.log(`handleExpertPlay gs:${gs && !gs.isGameOver} isAutoplayOn:${this.isAutoplayOn} busy:${this.busy}`);

        if (!(gs && !gs.isGameOver && (this.isAutoplayOn || this.isExpertMode)))
            return;

        if (this.isAutoplayRun) {
            this.autoplay = Autoplay.Pausing;
        }
        else if (!this.busy) {
            this.makeCpuPlay();
        }
    }

    get isTwoPlayerMode(): boolean {
        return this.playerMode === PlayerMode.TwoPlayers;
    }

    getGS(): GameState {
        return this.gameHistory.length > 0 ? this.gameHistory[this.gameHistory.length - 1] : null;
    }

    get isGameOver(): boolean {
        let gs = this.getGS();
        return gs && gs.isGameOver;
    }

    addGS(gs: GameState) {
        this.gameHistory.push(gs);
    }

    resetGame() {
        console.log('resetGame');
        this.gameHistory = [];
        this.checker.setPositions(null, false);
        this.playerMode = PlayerMode.None;
        this.autoplay = Autoplay.Off;

        this.displayInfo();
    }

    displayStatus(msg: string) {
        this.status = msg;
    }

    onPlayAuto() {
        this.startGame(PlayerMode.TwoPlayers, true);
    }

    onAutoplayPause() {
        console.log('onAutoPlayPause');
        this.autoplay = Autoplay.Pausing;
    }

    onAutoplayResume() {
        console.log('autoplayResume');
        this.makeAutoplay();
    }

    onGameBack() {
        // if player won (computer did not play so playerMode does not match latest game state) => remove single mpve.
        if (this.isTwoPlayerMode || (this.playerMode === PlayerMode.PlayWolf) !== this.getGS().isWolf) {
            this.gameHistory.pop();
        }
        else {
            //Remove both player move and computer move
            this.gameHistory.pop();
            this.gameHistory.pop();
        }

        this.checker.setPositions(this.getGS(), true);
        this.displayInfo();
    }

    onGameNew() {
        let data: NewGameData = { playerMode: this.playerMode, cpuLevel: this.cpuLevel, isExpertMode: this.isExpertMode };
        const dialogRef = this.dialog.open(NewGameComponent, { data: data, autoFocus: false, position: { top: "200px" } });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`NewGame dialog result:`, result);

            //set focus on canvas to remove focus from "New Game" button (would appear greyed otherwise).
            //note that canvas is not focusable by default, I needed to add "tabindex=0"
            this.canvasRef.nativeElement.focus();

            if (result) {
                let r: NewGameResult = result;
                this.cpuLevel = r.cpuLevel;

                if (!this.isExpertMode) {
                    this.adjustCpuLevel();
                }

                this.startGame(r.playerMode, r.autoplay);
            }
        });
    }

    onBenchmark() {
        //from http://en.nisi.ro/blog/development/javascript/open-new-window-window-open-seen-chrome-popup/
        //Open the window just after onClick event so that Chrome consider that it is not a popup (which are blocked by default on Chrome)
        //Chrome Settings / Advanced Settings / Content Settings : Do not allow any site to show popups - Manage exceptions
        let wnd = window.open('', 'Benchmark');
        this.busy = true;
        Bench.run(wnd, this.settings);
        this.busy = false;
    }


    onSave() {
        let fs: HTMLInputElement = this.fileSaver.nativeElement;

        let url = window.URL.createObjectURL(new Blob([JSON.stringify(this.gameHistory)], { type: "application/json;charset=utf-8" }));
        fs.setAttribute('href', url);
        fs.setAttribute('download', 'game.json');
        fs.click();

        window.URL.revokeObjectURL(url);
    }


    onFileLoader(e: any) {
        if (!e.target.files || !e.target.files[0])
            return;

        let file = e.target.files[0];
        let reader = new FileReader();

        reader.onload = () => {
            this.gameHistory = JSON.parse(<string>reader.result).map(gs => GameState.clone(gs));
            let gs = this.getGS();

            if (this.playerMode === PlayerMode.None) {
                this.playerMode = PlayerMode.TwoPlayers;
                //this.autoplay = Autoplay.Paused;
            } else if (this.playerMode === PlayerMode.PlayWolf && !gs.isWolf || this.playerMode === PlayerMode.PlaySheep && gs.isWolf) {
                // Current player mode does not match save game so remove last move.
                this.gameHistory.pop();
                gs = this.getGS();
            }

            this.checker.setPositions(gs, !gs.isGameOver);
            this.displayInfo();
        }

        reader.readAsText(file);
        e.target.value = null;  // set to null otherwise change event is not fired when selecting same file.
    }

    startGame(mode: PlayerMode, autoplay = false): void {
        this.playerMode = mode;

        this.gameHistory = [];

        let gs = GameState.getInitialGameState()
        this.addGS(gs);

        this.checker.setPositions(gs, this.playerMode === PlayerMode.PlayWolf || this.isTwoPlayerMode);
        this.displayInfo();

        if (autoplay) {
            this.makeAutoplay();
        } else {
            this.autoplay = Autoplay.Off;

            if (this.playerMode === PlayerMode.PlaySheep) {
                this.makeCpuPlay();
            }
        }
    }

    displayInfo(): void {
        let gs = this.getGS();

        if (gs == null)
            this.displayStatus('Click on New Game button to start');
        else if (gs.isGameOver)
            this.showVictory(gs);
        else if (this.isAutoplayRun)
            this.displayStatus('Auto play...');
        else {
            if (gs.isWolf)
                this.displayStatus('Wolf turn: move wolf.');
            else
                this.displayStatus('Sheep turn: select a sheep (white) to play.');
        }
    }

    showVictory(gs: GameState): void {
        let msg: string;

        if (this.isTwoPlayerMode) {
            if (gs.status === GameStatus.SheepWon)
                msg = 'Sheep won!';
            else
                msg = 'Wolf won!';
        } else {
            if ((gs.status === GameStatus.WolfWon) === (this.playerMode === PlayerMode.PlayWolf))
                msg = 'You won!';
            else
                msg = 'You lost!';
        }

        this.displayStatus(msg);

        let dialogData: EndGameDialogData = { message: msg };

        setTimeout(() =>
            this.dialog.open(EndGameComponent, { data: dialogData, autoFocus: false, position: { top: "200px" } }),
            150);
    }


}
