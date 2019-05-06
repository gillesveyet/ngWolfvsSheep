import { GameState } from "./GameState";
import { Pos } from './Pos';

enum Color {
    Black,
    Aqua,
}


export class CheckerPanel {
    public onPreloadDone: () => void;
    public onGetValidMoves: (selected: Pos) => Pos[];
    public onMovePiece: (oldPos: Pos, newPos: Pos) => void;

    private gameState: GameState;
    private isPlayEnabled: boolean;
    private selectedPiece: Pos = null;
    private validMoves: Pos[] = null;

    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D;
    private XMAG: number;
    private YMAG: number;

    private imgChecker = new Image();
    private imgWolf = new Image();
    private imgSheep = new Image();

    private preloadCount = 0;
    //private PRELOAD_TOTAL = 2;
    private PRELOAD_TOTAL = 3;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        //this.canvas.onclick = this.canvas_MouseClick.bind(this);
        this.canvas.onclick = (ev: MouseEvent) => {
            //cf. http://miloq.blogspot.co.uk/2011/05/coordinates-mouse-click-canvas.html
            //console.log(Helper.StringFormat("canvas_onclick ev:{0} x={1} y={2} clientX={3} clientY={4} pageXOffset={5} pageYOffset={6} canvas.scrollLeft={7} canvas.scrollTop={8} canvas.offsetLeft={9} canvas.offsetTop={10}", ev, ev.x, ev.y, ev.clientX, ev.clientY, window.pageXOffset, window.pageYOffset, canvas.scrollLeft, canvas.scrollTop, canvas.offsetLeft, canvas.offsetTop));
            this.canvas_MouseClick((ev.clientX - canvas.offsetLeft + window.pageXOffset) / this.XMAG | 0, (ev.clientY - canvas.offsetTop + window.pageYOffset) / this.YMAG | 0);
        };

        if (!this.canvas.getContext)
            throw "Browser does not support Canvas";
    }

    private initCanvas() {
        this.ctx = this.canvas.getContext('2d');
        this.XMAG = this.canvas.width / 10;
        this.YMAG = this.canvas.height / 10;
    }

    preloadAssets(): void {
        this.loadImage(this.imgChecker, 'media/Checker.png');
        this.loadImage(this.imgWolf, 'media/Black.png');
        this.loadImage(this.imgSheep, 'media/White.png');
    }

    private loadImage(img: HTMLImageElement, src: string) {
        img.onload = this.preloadUpdate.bind(this);
        img.src = src;
    }

    private preloadUpdate() {
        ++this.preloadCount;

        if (this.preloadCount === this.PRELOAD_TOTAL) {
            this.initCanvas();

            if (this.onPreloadDone)
                this.onPreloadDone();
        }
    }

   
    SetPositions(gs: GameState, enablePlay: boolean): void {
        this.selectedPiece = null;
        this.validMoves = null;

        this.isPlayEnabled = enablePlay;
        this.gameState = gs;

        if (enablePlay && gs != null && gs.isWolf)
            this.updateSelected(gs.wolf, false);

        this.onPaint();
    }

    /*
    // old wait layer : centered
	ShowWaitLayer()
	{
		let text = "Wait...";
		let fontSize = this.canvas.height / 8;

		this.ctx.font = fontSize + "px Verdana";
		let width = this.ctx.measureText(text).width;

		let x = (this.canvas.width - width) / 2;
		let y = (this.canvas.height-fontSize) / 2;

		this.ctx.fillStyle = "rgba(160, 160, 160, 0.85)";
		this.ctx.fillRect(x - fontSize/2, y- fontSize/2.5, width + fontSize, fontSize*2);

		this.ctx.textBaseline = "top";
		this.ctx.fillStyle = "#FF0066";
		this.ctx.fillText(text, x , y);
	}
*/

    // new wait layer: bottom left
    ShowWaitLayer() {
        let text = "Please wait...";
        let fontSize = this.canvas.height / 20;

        this.ctx.font = fontSize + "px Verdana";
        let width = this.ctx.measureText(text).width;

        this.ctx.fillStyle = "rgba(160, 160, 160, 0.7)";
        this.ctx.fillRect(0, this.canvas.height - 2 * fontSize, width + fontSize, fontSize * 2);

        this.ctx.textBaseline = "bottom";
        this.ctx.fillStyle = "#FF0066";
        this.ctx.fillText(text, fontSize / 2, this.canvas.height - fontSize / 2);
    }


    private onPaint(): void {
        this.ctx.drawImage(this.imgChecker, 0, 0, this.canvas.width, this.canvas.height);
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameState)
            return;


        this.drawSquare(this.imgWolf, this.gameState.wolf.x, this.gameState.wolf.y);

        for (let ps of this.gameState.sheep)
            this.drawSquare(this.imgSheep, ps.x, ps.y);


        // To check if order of sheep position is correct
        // if (IsExpertMode)
        // {
        // 	this.ctx.textAlign = "left";
        // 	this.ctx.textBaseline = "top";
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
            this.drawSelected(this.selectedPiece, Color.Black);

        if (this.validMoves !== null)
            for (let p of this.validMoves)
                this.drawSelected(p, Color.Aqua);
    }

    private drawSquare(image: HTMLImageElement, x: number, y: number) {
        this.ctx.drawImage(image, x * this.XMAG, y * this.YMAG, this.XMAG, this.YMAG);
    }

    private drawSelected(p: Pos, color: Color): void {
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = Color[color];
        this.ctx.strokeRect(p.x * this.XMAG, p.y * this.YMAG, this.XMAG, this.YMAG);
    }


    private updateSelected(selected: Pos, refresh: boolean): void {
        if (this.selectedPiece === null && selected === null)
            return;

        if (selected !== null && this.selectedPiece !== null && selected.equals(this.selectedPiece)) {
            //click on selected piece
            //  -wolf : do nothing
            //  -sheep : unselect
            if (this.gameState.isWolf)
                return;

            this.selectedPiece = null;
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

    private canvas_MouseClick(x: number, y: number) {
        if (!this.isPlayEnabled)
            return;

        if (!Pos.isValid(x, y))
            return;

        let p = Pos.GetPos(x, y);

        //console.log("canvas_MouseClick - x=" + x + " y=" + y + " p=" + p + " this.Selected=" + this.selectedPiece); // + " - onMovePiece: " + this.onMovePiece);

        if (!this.gameState.isWolf && this.isSheep(p))
            this.updateSelected(p, true);
        else if (this.selectedPiece !== null && this.isMoveValid(p) && this.onMovePiece)
            this.onMovePiece(this.selectedPiece, p);
    }
}

