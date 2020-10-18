
# Game of Wolf & Sheep.
Also known as [Fox & Hounds](https://en.wikipedia.org/wiki/Fox_games#Fox_and_Hounds) or [Le loup et les brebis](https://loisirs.savoir.fr/le-loup-et-les-brebis/) in France.


Played on 10 x 10 checkerboard, as in [International draughts](https://en.wikipedia.org/wiki/International_draughts).

# Run the app on my web site

https://gillesveyet.yo.fr/sheep/


# Algorithm

I used this: [Negamax with alpha beta pruning and transposition tables](https://en.wikipedia.org/wiki/Negamax#Negamax_with_alpha_beta_pruning_and_transposition_tables)

See also [An Introduction to Game Tree Algorithms](http://www.hamedahmadi.com/gametree/).

# Angular

## CLI

Built with [Angular CLI](https://github.com/angular/angular-cli) version 10
PWA (service worker) support: `ng add @angular/pwa`  
Angular Material: `ng add @angular/material`  
Web worker for Solver:  `ng generate web-worker base/Solver`  


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Build for deployment

To deploy on `/sheep` path, command is: `ng build --prod --base-href /sheep/`

See also src/manifest.webmanifest (PWA support) :
```json  
"scope": "/sheep/",
"start_url": "/sheep/",
```


# Credits

Main icon from SVG Repo: https://www.svgrepo.com/svg/24608/sheep


