# Band Essentials Realm

A playable version of the High Fantasy *Band Essentials* motion graphic. The five Level 1 games sit on the floating islands: Read Rhythms, Fingering Trainer, Write Notes, Read Notes and Terms & Symbols. Finishing the fifth island plays the movie's ending.

Play it at https://johnshawler.github.io/band-essentials-realm/

## How it is built

- `index.html` is the whole game: one page, three.js from jsDelivr, fonts from Google Fonts, sound synthesized in the browser.
- `src/` holds the parts `index.html` is assembled from:
  - `realm-head.html`: page markup and styles
  - `kits.js`: the stage (rendering) and sound kits from the original animation
  - `realm-game.js`: the world, islands, wisp, camera and ending
  - `realm-play.js`: the game rules, input and painted HUD
  - `realm-tail.js`: the render loop and controls
  - `level1-data.json`: each instrument's Level 1 notes and fingerings
- After editing anything in `src/`, run `python3 build.py` to rebuild `index.html`.

URL options: `?size=1920x1080` renders at a higher resolution (default 1280x720); `?shadow=4096` uses a sharper shadow map.
