import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Observer, of } from "rxjs";

import { GameState, GameStatus, IGameState } from './base/GameState';
import { Model, PlayerMode } from './base/Model';
import { CheckerPanel } from './base/CheckerPanel';
import { Bench } from './base/Bench';
import { Pos } from './base/Pos';
import { NewGameComponent } from './views/new-game/new-game.component';
import { EndGameComponent, EndGameDialogData } from './views/end-game/end-game.component';


const DEFAULT_DEPTH = 17;

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

    isExpertMode = false;
    showMenuPlay = true;
    showSpinner = false;
    autoplay: Autoplay = Autoplay.Off;
    autoplayDelay = 150;    // delay in ms.
    settings = { wolfDepth: DEFAULT_DEPTH, sheepDepth: DEFAULT_DEPTH };

    readonly workerSolver = new Worker('./base/Solver.worker', { type: 'module' });
    checker: CheckerPanel;
    gameHistory: IGameState[] = [];
    busy = false;

    get showMenuGame() {
        return !this.showMenuPlay && (this.autoplay === Autoplay.Off || this.autoplay === Autoplay.Paused);
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
        private route: ActivatedRoute
    ) {
        this.route.queryParams.subscribe(params => {
            //note: this is called twice on app startup
            this.isExpertMode = params['expert'] !== undefined;
            console.log(`isExpertMode:${this.isExpertMode} params:`, params);
        });
    }

    ngOnInit() {
        window['bench'] = Bench;

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
    }

    cpuPlay() {
        this.busy = true;
        //let gs = this.solver.play(this.getGS(), this.getGS().isWolf ? this.settings.wolfDepth : this.settings.sheepDepth);
        let data = { gameState: this.getGS(), maxDepth: this.getGS().isWolf ? this.settings.wolfDepth : this.settings.sheepDepth };
        this.workerSolver.postMessage(data);
    }


    onCpuPlay(gs: IGameState) {
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
                // console.log(`Space pressed`, document.activeElement);
                this.handleExpertPlay();
                evt.preventDefault();
                break;
        }
    }

    handleExpertPlay() {
        let gs = this.getGS();
        if (!(gs && !gs.isGameOver && this.isAutoplayOn))
            return;

        if (this.isAutoplayRun) {
            this.autoplay = Autoplay.Pausing;
        }
        else if (!this.busy) {
            this.makeCpuPlay();
        }
    }

    get playerMode(): PlayerMode {
        return Model.playerMode;
    }

    set playerMode(value: PlayerMode) {
        Model.playerMode = value;
    }

    get isTwoPlayerMode(): boolean {
        return this.playerMode === PlayerMode.TwoPlayers;
    }

    getGS(): IGameState {
        return this.gameHistory.length > 0 ? this.gameHistory[this.gameHistory.length - 1] : null;
    }

    get isGameOver(): boolean {
        let gs = this.getGS();
        return gs && gs.isGameOver;
    }

    addGS(gs: IGameState) {
        this.gameHistory.push(gs);
    }

    resetGame() {
        console.log('resetGame');
        this.gameHistory = [];
        this.checker.setPositions(null, false);
        this.showMenuPlay = true;
        this.autoplay = Autoplay.Off;

        this.displayInfo();
    }

    displayStatus(msg: string) {
        this.status = msg;
    }

    onPlaySheep() {
        this.startGame(PlayerMode.PlaySheep);
    }

    onPlayWolf() {
        this.startGame(PlayerMode.PlayWolf);
    }

    onPlayTwoPlayers() {
        this.startGame(PlayerMode.TwoPlayers);
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
        (this.isGameOver ? of(true) : this.confirmNewGame()).subscribe(result => {
            if (result)
                this.resetGame();
        });
    }

    confirmNewGame(): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {

            const dialogRef = this.dialog.open(NewGameComponent, { position: { top: "200px" } });

            dialogRef.afterClosed().subscribe(result => {
                console.log(`NewGame dialog result:${result}`);
                observer.next(result);
                observer.complete();
            });
        });
    }


    onBenchmark() {
        //from http://en.nisi.ro/blog/development/javascript/open-new-window-window-open-seen-chrome-popup/
        //Open the window just after onClick event so that Chrome consider that it is not a popup (which are blocked by default on Chrome)
        //Chrome Settings / Advanced Settings / Content Settings : Do not allow any site to show popups - Manage exceptions
        let wnd = window.open('', 'Benchmark');
        this.busy = true;
        Bench.run(wnd, this.settings);
        this.busy = true;
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
            if (this.showMenuPlay) {
                this.showMenuPlay = false;
                this.playerMode = PlayerMode.TwoPlayers;
                this.autoplay = Autoplay.Paused;
            }

            this.gameHistory = JSON.parse(<string>reader.result).map(gs => GameState.clone(gs));
            let gs = this.getGS();
            this.checker.setPositions(gs, !gs.isGameOver);
            this.displayInfo();
        }

        reader.readAsText(file);
        e.target.value = null;  // set to null otherwise change event is not fired when selecting same file.
    }

    startGame(mode: PlayerMode, autoplay = false): void {
        this.playerMode = mode;
        this.showMenuPlay = false;

        let gs = GameState.getInitialGameState()
        this.addGS(gs);

        this.checker.setPositions(gs, this.playerMode === PlayerMode.PlayWolf || this.isTwoPlayerMode);
        this.displayInfo();

        if (autoplay) {
            this.makeAutoplay();
        } else if (this.playerMode === PlayerMode.PlaySheep) {
            this.makeCpuPlay();
        }
    }

    displayInfo(): void {
        let gs = this.getGS();

        if (gs == null)
            this.displayStatus('Select mode');
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

    showVictory(gs: IGameState): void {
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
            this.dialog.open(EndGameComponent, { data: dialogData, position: { top: "200px" } }),
            150);
    }


}
