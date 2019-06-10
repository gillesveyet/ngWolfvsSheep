import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // for NgModel

import { MatButtonModule, MatDialogModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EndGameComponent } from './views/end-game/end-game.component';
import { NewGameComponent } from './views/new-game/new-game.component';

@NgModule({
    declarations: [
        AppComponent,
        EndGameComponent,
        NewGameComponent
    ],
    entryComponents: [
        EndGameComponent,
        NewGameComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        BrowserAnimationsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
