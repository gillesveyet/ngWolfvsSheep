import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'ngWolfvsSheep';
    status = 'status line';
    debug = 'debug line';


    showMenuPlay = true;
    showMenuAutoPlay = false;
    showMenuGame = false;
    settings = { wolfDepth: 12, sheepDepth: 12 };


    onPlaySheep() {
    }

    onPlayWolf() {
    }

    onPlayTwoPlayers() {
    }

    onPlayAuto() {
    }

    onAutoPlayPause() {
    }

    onAutoPlayResume() {
    }

    onGameBack() {
    }

    onGameNew() {
    }

    onBenchmark() {
    }


}
