import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface EndGameDialogData {
    message: string;
}

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss']
})
export class EndGameComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<EndGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EndGameDialogData) { }

    ngOnInit() {
    }
}
