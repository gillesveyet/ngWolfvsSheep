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


  settings = { wolfDepth : 12, sheepDepth : 12};

}
