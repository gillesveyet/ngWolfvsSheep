import { Component, Inject } from '@angular/core';
import { PlayerMode } from '../../base/Model';
import { MatChipList } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface NewGameData {
    playerMode: PlayerMode;
    cpuLevel: number;
}

export interface NewGameResult {
    playerMode: PlayerMode;
    autoplay: boolean;
    cpuLevel: number;
}

interface CpuLevelItem {
    value: number,
    text: string
}

@Component({
    selector: 'app-new-game',
    templateUrl: './new-game.component.html',
    styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent {
    PlayerMode = PlayerMode;    // to use in HTML
    title: string;

    cpuLevel = 1;

    cpuLevels: CpuLevelItem[] = [{ text: 'Low', value: 0 }, { text: 'Medium', value: 1 }, { text: 'High', value: 2 }];

    constructor(
        public dialogRef: MatDialogRef<NewGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: NewGameData) {
        console.log(`NewGameComponent`, data);
        this.title = data.playerMode ? 'Abort current game and start a new game' : 'Start a new game';
        this.cpuLevel = data.cpuLevel;
    }

    onPlayerMode(playerMode: PlayerMode) {
        this.onClose({ playerMode: playerMode, autoplay: false, cpuLevel: this.cpuLevel });
    }

    onPlayAuto() {
        this.onClose({ playerMode: PlayerMode.TwoPlayers, autoplay: true, cpuLevel: this.cpuLevel });
    }

    onCancel() {
        this.onClose(null);
    }

    onClose(result: NewGameResult) {
        console.log(`cpuLevel:${this.cpuLevel}`);
        this.dialogRef.close(result);
    }

}
