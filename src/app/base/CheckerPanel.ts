import { Pos } from './Pos';
import { Observable } from 'rxjs';
import { GameState } from './GameState';

enum Color {
    //Black,
    Aqua,
    LightBlue
}

enum Bitmap {
    Black = 'Black',
    White = 'White'
}


export class CheckerPanel {
    public onGetValidMoves: (selected: Pos) => Pos[];
    public onMovePiece: (oldPos: Pos, newPos: Pos) => void;

    private gameState: GameState;
    private isPlayEnabled: boolean;
    private selectedPiece: Pos = null;
    private validMoves: Pos[] = null;

    private canvasGame: HTMLCanvasElement
    private canvasBack: HTMLCanvasElement
    private ctxGame: CanvasRenderingContext2D;
    private ctxBack: CanvasRenderingContext2D;
    private XMAG: number;
    private YMAG: number;

    private bitmaps = {};

    private get imgWolf(): HTMLImageElement { return this.bitmaps[Bitmap.Black] }
    private get imgSheep(): HTMLImageElement { return this.bitmaps[Bitmap.White] }

    constructor(canvasBack: HTMLCanvasElement, canvasGame: HTMLCanvasElement) {
        this.canvasBack = canvasBack;
        this.canvasGame = canvasGame;

        if (!this.canvasGame.getContext)
            throw 'Browser does not support Canvas';

        this.canvasGame.onmousedown = (ev: MouseEvent) => { this.onMouseUpDown(ev, false) };
        this.canvasGame.onmouseup = (ev: MouseEvent) => { this.onMouseUpDown(ev, true) };

        this.ctxBack = this.canvasBack.getContext('2d', { alpha: false });
        this.ctxGame = this.canvasGame.getContext('2d', { alpha: true });
        this.XMAG = this.canvasGame.width / 10;
        this.YMAG = this.canvasGame.height / 10;

        console.log(`Canvas width:${this.canvasGame.width} height:${this.canvasGame.height}`);
    }

    init() {
        return new Observable(observer => {
            let count = 0;

            for (let bmp in Bitmap) {
                let img = this.bitmaps[bmp] = new Image();

                img.onload = () => {
                    if (++count === 2) {
                        this.drawChecker();
                        observer.next();
                        observer.complete();
                    }
                };

                img.src = `assets/bitmaps/${bmp}.svg`;
            }
        });
    }



    setPositions(gs: GameState, enablePlay: boolean): void {
        this.selectedPiece = null;
        this.validMoves = null;

        this.isPlayEnabled = enablePlay;
        this.gameState = gs;

        if (enablePlay && gs != null && gs.isWolf)
            this.updateSelected(gs.wolf, false);

        this.onPaint();
    }

    // showWaitLayer() {
    //     let text = 'Please wait...';
    //     let fontSize = this.canvas.height / 20;

    //     this.ctx.font = fontSize + 'px Verdana';
    //     let width = this.ctx.measureText(text).width;

    //     this.ctx.fillStyle = 'rgba(160, 160, 160, 0.7)';
    //     this.ctx.fillRect(0, this.canvas.height - 2 * fontSize, width + fontSize, fontSize * 2);

    //     this.ctx.textBaseline = 'bottom';
    //     this.ctx.fillStyle = '#FF0066';
    //     this.ctx.fillText(text, fontSize / 2, this.canvas.height - fontSize / 2);
    // }


    private onPaint(): void {
        if (!this.gameState)
            return;

        this.ctxGame.clearRect(0, 0, this.canvasGame.width, this.canvasGame.height);

        this.drawSquare(this.imgWolf, this.gameState.wolf.x, this.gameState.wolf.y);

        let selectSheep = !this.gameState.isWolf && this.isPlayEnabled && this.selectedPiece === null;
        
        for (let ps of this.gameState.sheep) {
            this.drawSquare(this.imgSheep, ps.x, ps.y);

            if (selectSheep)
                this.drawSelected(ps, Color.LightBlue);
        }

        // To check if order of sheep position is correct
        // if (IsExpertMode)
        // {
        // 	this.ctx.textAlign = 'left';
        // 	this.ctx.textBaseline = 'top';
        // 	this.ctx.strokeStyle = Color[Color.Black];
        // 	this.ctx.lineWidth = 1;
        //
        // 	for (let i = 0; i < this.gameState.sheep.length; ++i)
        // 	{
        // 		let p = this.gameState.sheep[i];
        // 		this.ctx.strokeText((i + 1).toString(), p.x * this.XMAG + 2, p.y * this.YMAG + 2);
        // 	}
        // }

        if (this.selectedPiece !== null)
            this.drawSelected(this.selectedPiece, Color.LightBlue);

        if (this.validMoves !== null)
            for (let p of this.validMoves)
                this.drawSelected(p, Color.Aqua);
    }

    private drawChecker() {
        this.ctxBack.fillStyle = "rgb(250,222,93)";
        this.ctxBack.fillRect(0, 0, this.XMAG * 10, this.YMAG * 10);

        this.ctxBack.fillStyle = "rgb(150,52,19)";

        for (let i = 0; i < 5; ++i)
            for (let j = 0; j < 10; ++j)
                this.ctxBack.fillRect((i * 2 + (j + 1) % 2) * this.XMAG, j * this.YMAG, this.XMAG, this.YMAG);
    }

    private drawSquare(image: HTMLImageElement, x: number, y: number) {
        this.ctxGame.drawImage(image, x * this.XMAG, y * this.YMAG, this.XMAG, this.YMAG);
    }

    private drawSelected(p: Pos, color: Color): void {
        this.ctxGame.lineWidth = 2;
        this.ctxGame.strokeStyle = Color[color];
        this.ctxGame.strokeRect(p.x * this.XMAG, p.y * this.YMAG, this.XMAG, this.YMAG);
    }


    private updateSelected(selected: Pos, refresh: boolean): void {
        if (this.selectedPiece === null && selected === null)
            return;

        if (selected !== null && this.selectedPiece !== null && selected.equals(this.selectedPiece)) {
            //click on selected piece : do nothing
        }
        else
            this.selectedPiece = selected;

        if (this.selectedPiece !== null) {
            if (this.onGetValidMoves)
                this.validMoves = this.onGetValidMoves(this.selectedPiece)
        }
        else
            this.validMoves = null;

        if (refresh)
            this.onPaint();
    }

    private isSheep(selected: Pos): boolean {
        for (let p of this.gameState.sheep) {
            if (p.equals(selected))
                return true;
        }

        return false;
    }

    private isMoveValid(selected: Pos): boolean {
        //console.log(`isMoveValid  selected:${selected}  validMoves:${this.validMoves}`);

        if (this.validMoves === null)
            return false;

        for (let p of this.validMoves) {
            if (p.equals(selected))
                return true;
        }

        return false;
    }

    private onMouseUpDown(ev: MouseEvent, up: boolean) {
        const rect = this.canvasGame.getBoundingClientRect();
        console.log(`onmouse${up ? 'up' : 'down'}  x=${ev.x} y=${ev.y} clientX=${ev.clientX} clientY=${ev.clientY} BouncingRect [top:${rect.top} left:${rect.left} width:${rect.width} height:${rect.height}]`);

        //mpuse up and down are all treated as mouse click : allow drag & drop.
        this.onMouseClick((ev.clientX - rect.left) * 10 / rect.width | 0, (ev.clientY - rect.top) * 10 / rect.height | 0);
    };

    private onMouseClick(x: number, y: number) {
        console.log(`canvas_MouseClick - x=${x} y=${y} selected=${this.selectedPiece}`);

        if (!this.isPlayEnabled)
            return;

        if (!Pos.isValid(x, y))
            return;

        let p = Pos.getPos(x, y);

        if (!this.gameState.isWolf && this.isSheep(p))
            this.updateSelected(p, true);
        else if (this.selectedPiece !== null && this.isMoveValid(p) && this.onMovePiece)
            this.onMovePiece(this.selectedPiece, p);
    }
}

