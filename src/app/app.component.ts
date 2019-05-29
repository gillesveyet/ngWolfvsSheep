import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { GameState, GameStatus } from './base/GameState';
import { Model, PlayerMode } from './base/Model';
import { Solver } from './base/Solver';
import { CheckerPanel } from './base/CheckerPanel';
import { Bench } from './base/Bench';
import { Pos } from './base/Pos';


const DEFAULT_DEPTH = 17;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    status: string;
    debug: string;

    isExpertMode = false;
    showMenuPlay = true;
    autoplay = false;
    autoplayPaused = false;
    settings = { wolfDepth: DEFAULT_DEPTH, sheepDepth: DEFAULT_DEPTH };

    solver = new Solver();
    checker: CheckerPanel;
    gameHistory: GameState[] = [];
    ready = false;

    get showMenuGame() {
        return !this.showMenuPlay && (!this.autoplay || this.autoplayPaused);
    }

    get isGameBackEnabled() {
        return this.gameHistory.length > 2 || this.isTwoPlayerMode && this.gameHistory.length > 1;
    }


    @ViewChild('canBoard') canvasRef: ElementRef;

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
    }

    /**
   * Listener to enter key on the document
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
        if (gs && !gs.isGameOver && this.autoplay && this.autoplayPaused && this.ready) {
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
        this.solver.reset();
        this.checker.setPositions(null, false);
        this.showMenuPlay = true;
        this.autoplay = false;
        this.ready = true;

        this.displayInfo();
    }

    displayStatus(msg: string) {
        this.status = msg;
    }

    displayDebug(msg: string) {
        this.debug = msg;
    }

    onPlaySheep() {
        this.playerMode = PlayerMode.PlaySheep;
        this.autoplay = false;
        this.startGame();
    }

    onPlayWolf() {
        this.playerMode = PlayerMode.PlayWolf;
        this.autoplay = false;
        this.startGame();
    }

    onPlayTwoPlayers() {
        this.playerMode = PlayerMode.TwoPlayers
        this.autoplay = false;
        this.startGame();
    }

    onPlayAuto() {
        this.playerMode = PlayerMode.TwoPlayers;
        this.autoplay = true;
        this.startGame();
    }

    onAutoplayPause() {
        console.log('onAutoPlayPause');
        this.autoplayPaused = true;
    }

    onAutoplayResume() {
        console.log('autoplayResume');
        this.autoplayPaused = false;
        this.playLoop();
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
        if (!this.isGameOver && !confirm('Cancel current game and start a new game?'))
            return;

        this.resetGame();
    }

    onBenchmark() {
        //from http://en.nisi.ro/blog/development/javascript/open-new-window-window-open-seen-chrome-popup/
        //Open the window just after onClick event so that Chrome consider that it is not a popup (which are blocked by default on Chrome)
        //Chrome Settings / Advanced Settings / Content Settings : Do not allow any site to show popups - Manage exceptions
        let wnd = window.open('', 'Benchmark');
        this.ready = false;
        Bench.run(wnd, this.settings);
        this.ready = true;
    }

    playLoop() {
        this.displayStatus('Auto Play...');

        setTimeout(() => {
            if (this.autoplayPaused) {
                this.pauseAutoplay();
                return;
            }

            this.cpuPlay(false);

            if (this.isGameOver) {
                this.autoplayPaused = true;
            } else if (this.autoplayPaused) {
                this.pauseAutoplay();
            } else {
                this.playLoop();
            }

        }, 200);
    }

    pauseAutoplay() {
        this.checker.setPositions(this.getGS(), true);
        this.displayInfo();
    }

    startGame(): void {
        let gameBack = true;

        this.showMenuPlay = false;

        let gs = GameState.getInitialGameState()
        this.addGS(gs);

        this.checker.setPositions(gs, this.playerMode === PlayerMode.PlayWolf || this.isTwoPlayerMode);
        this.displayInfo();

        if (this.autoplay) {
            this.autoplayPaused = false;
            this.playLoop();
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
                msg = 'Sheep win!';
            else
                msg = 'Wolf wins!';
        } else {
            if ((gs.status === GameStatus.WolfWon) === (this.playerMode === PlayerMode.PlayWolf))
                msg = 'You win!';
            else
                msg = 'You lose!';
        }

        this.displayStatus(msg);
        setTimeout(() => alert(msg), 600);
    }

    cpuPlay(enable: boolean) {
        let gs = this.solver.play(this.getGS(), this.getGS().isWolf ? this.settings.wolfDepth : this.settings.sheepDepth);
        this.addGS(gs);

        this.displayDebug(this.solver.statusString);
        this.checker.setPositions(gs, enable && !gs.isGameOver);
        this.displayInfo();
    }

    makeCpuPlay(): void {
        this.ready = false;
        this.checker.showWaitLayer();

        this.displayStatus('Computer is thinking...');
        setTimeout(() => {
            this.cpuPlay(true);
            this.ready = true;
        }, 0);
    }
}
