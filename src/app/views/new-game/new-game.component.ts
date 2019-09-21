import { Component, Inject } from '@angular/core';
import { PlayerMode } from '../../base/Model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface NewGameData {
    playerMode: PlayerMode;
}

export interface NewGameResult {
    playerMode: PlayerMode;
    autoplay: boolean;
}


@Component({
    selector: 'app-new-game',
    templateUrl: './new-game.component.html',
    styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent {
    PlayerMode = PlayerMode;    // to use in HTML

    title: string;

    constructor(
        public dialogRef: MatDialogRef<NewGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: NewGameData) {
        console.log(`NewGameComponent`, data);
        this.title = data.playerMode ? 'Abort current game and start a new game' : 'Start a new game';
    }


    onPlayerMode(playerMode: PlayerMode) {
        this.onClose({ playerMode: playerMode, autoplay: false });
    }

    onPlayAuto() {
        this.onClose({ playerMode: PlayerMode.TwoPlayers, autoplay: true });
    }

    onCancel() {
        this.onClose(null);
    }

    onClose(result: NewGameResult) {
        this.dialogRef.close(result);
    }

}
