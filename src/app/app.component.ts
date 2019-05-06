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

    isExpertMode: false;
    showMenuPlay = true;
    showMenuAutoPlay = false;
    showMenuGame = false;
    showButtonBack = false;
    autoPlayPaused = false;
    settings = { wolfDepth: 12, sheepDepth: 12 };

    checker: CheckerPanel;
    gameHistory: GameState[] = [];
    ready = false;

    @ViewChild('canBoard') canvasRef: ElementRef;

    ngOnInit() {
        this.checker = new CheckerPanel(this.canvasRef.nativeElement);

        this.checker.onGetValidMoves = (selected: Pos) => {
            return this.getGS().getValidMoves(selected);
        };

        this.checker.onPreloadDone = () => {
            this.resetGame();
        };

        this.checker.onMovePiece = (oldPos: Pos, newPos: Pos) => {
            let gs = this.getGS().makePlayerMove(oldPos, newPos);
            this.addGS(gs);
            this.checker.SetPositions(gs, this.isTwoPlayerMode && !gs.isGameOver);

            this.updateContext();
            this.displayInfo();

            if (!gs.isGameOver && !this.isTwoPlayerMode)
                this.makeCpuPlay();
        }

        this.checker.preloadAssets();
    }

    /**
   * Listener to enter key on the document
   * @param {KeyboardEvent} evt
   */
    @HostListener('document:keydown', ['$event'])
    onKeydownHandler(evt: KeyboardEvent) {
        switch (evt.which || evt.keyCode || parseInt(evt.code, 10)) {
            case 32: //space key
                console.log(`Space pressed class:'${document.activeElement.className}'`, document.activeElement);
                this.handleExpertPlay
                break;
        }
    }


    handleExpertPlay() {
        let gs = this.getGS();
        if (this.ready && this.isExpertMode && gs && !gs.isGameOver) {

            this.ready = false;
            this.displayStatus("Thinking...");

            setTimeout(() => {
                this.cpuPlay(this.isTwoPlayerMode);

                if (!this.isTwoPlayerMode && !this.isGameOver) {
                    this.cpuPlay(true);
                }

                this.ready = true;
            }, 200);
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

    get isAutoplayMode(): boolean {
        return this.playerMode === PlayerMode.Autoplay;
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
        this.gameHistory = [];
        this.checker.SetPositions(null, false);
        this.ready = true;


        this.showMenuAutoPlay = true;
        this.showMenuGame = false;
        this.showMenuAutoPlay = false;

        this.updateContext();
        this.displayInfo();
    }

    displayStatus(msg: string) {
        this.status = msg;
    }

    displayDebug(msg: string) {
        this.debug = msg;
        console.log(msg);
    }



    onPlaySheep() {
        this.playerMode = PlayerMode.PlaySheep;
        this.startGame();
    }

    onPlayWolf() {
        this.playerMode = PlayerMode.PlayWolf;
        this.startGame();
    }

    onPlayTwoPlayers() {
        this.playerMode = PlayerMode.TwoPlayers
        this.startGame();
    }

    onPlayAuto() {
        this.playerMode = PlayerMode.Autoplay;
        this.startGame();
    }

    onAutoPlayPause() {
        this.autoplayStop();
    }

    onAutoPlayResume() {
        this.autoplayResume();
    }

    onGameBack() {
        if (this.isTwoPlayerMode) {
            this.gameHistory.pop();
        }
        else {
            //Remove both player move and computer move
            this.gameHistory.pop();
            this.gameHistory.pop();
        }

        this.checker.SetPositions(this.getGS(), true);

        this.updateContext();
        this.displayInfo();
    }

    onGameNew() {
        if (!this.isGameOver && !confirm("Cancel current game and start a new game?"))
            return;

        this.resetGame();
    }

    onBenchmark() {
        //from http://en.nisi.ro/blog/development/javascript/open-new-window-window-open-seen-chrome-popup/
        //Open the window just after onClick event so that Chrome consider that it is not a popup (which are blocked by default on Chrome)
        //Chrome Settings / Advanced Settings / Content Settings : Do not allow any site to show popups - Manage exceptions
        let wnd = window.open("", "Benchmark");
        this.ready = false;
        Bench.Run(this.settings.wolfDepth, this.settings.sheepDepth, wnd);
        this.ready = true;
    }

    autoplay() {
        if (this.checkAutoplayStop())
            return;

        this.ready = false;
        this.displayStatus("Auto Play...");

        setTimeout(() => {
            if (this.checkAutoplayStop())
                return;

            this.cpuPlay(this.isGameOver);

            if (!this.isGameOver) {
                this.autoplay();
            } else {
                this.ready = true;
                this.playerMode = PlayerMode.TwoPlayers;
                this.showMenuAutoPlay = false;
                this.showMenuGame = true;
                this.updateContext();
            }

        }, 200);
    }

    checkAutoplayStop(): boolean {
        if (!this.isAutoplayMode) {
            console.log('checkAutoplayStop: true');
            this.showMenuGame = true;
            this.autoPlayPaused = true;
           
            this.ready = true;
            this.updateContext();
            return true;
        }
        else
            return false;
    }


    autoplayStop() {
        console.log('autoplayStop');
        this.playerMode = PlayerMode.TwoPlayers;
    }


    autoplayResume() {
        console.log('autoplayResume');
        this.playerMode = PlayerMode.Autoplay;

        this.showMenuGame = false;
        this.autoPlayPaused = false;

        this.updateContext();
        this.autoplay();
    }


    startGame(): void {
        let gameBack = true;

        if (this.isAutoplayMode) {
            this.showMenuGame = false;
            this.showMenuAutoPlay = true;
            this.autoPlayPaused = false;
            this.showButtonBack = this.isExpertMode;
        }
        else {
            this.showButtonBack = true;
            this.showMenuGame = true;
        }

        this.showMenuPlay = false;

        let gs = GameState.GetInitialGameState()
        this.addGS(gs);

        this.checker.SetPositions(gs, this.playerMode === PlayerMode.PlayWolf || this.isTwoPlayerMode);
        this.updateContext();
        this.displayInfo();

        switch (this.playerMode) {
            case PlayerMode.PlaySheep:
                this.makeCpuPlay();
                break;
            case PlayerMode.Autoplay:
                this.autoplay();
                break;
        }
    }

    updateContext(): void {
        let allow = this.gameHistory.length > 2 || this.isTwoPlayerMode && this.gameHistory.length > 1;
        (<HTMLInputElement>document.getElementById("game_back")).disabled = !allow;
    }

    displayInfo(): void {
        let gs = this.getGS();

        if (gs == null)
            this.displayStatus("Select mode");
        else if (gs.isGameOver)
            this.showVictory(gs);
        else {
            if (gs.isWolf)
                this.displayStatus("Wolf turn: move wolf.");
            else
                this.displayStatus("Sheep turn: select a sheep (white) to play.");
        }
    }


    showVictory(gs: GameState): void {
        let msg: string;

        if (this.isTwoPlayerMode || this.isAutoplayMode) {
            if (gs.status === GameStatus.SheepWon)
                msg = "Sheep win!";
            else
                msg = "Wolf wins!";
        } else {
            if ((gs.status === GameStatus.WolfWon) === (this.playerMode === PlayerMode.PlayWolf))
                msg = "You win!";
            else
                msg = "You lose!";
        }

        this.displayStatus(msg);
        setTimeout(() => alert(msg), 600);
    }

    cpuPlay(enable: boolean) {
        let solver = new Solver();
        let gs = solver.play(this.getGS(), this.getGS().isWolf ? this.settings.wolfDepth : this.settings.sheepDepth);
        this.addGS(gs);

        this.displayDebug(solver.statusString);
        this.checker.SetPositions(gs, enable && !gs.isGameOver);

        this.updateContext();
        this.displayInfo();
    }


    makeCpuPlay(): void {
        this.ready = false;
        this.checker.ShowWaitLayer();

        this.displayStatus("Computer is thinking...");
        setTimeout(() => {
            this.cpuPlay(true);
            this.ready = true;
        }, 200);
    }
}
