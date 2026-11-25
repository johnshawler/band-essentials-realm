# Band Adventures

**Chapter 1: The Climb to the Castle**

A playable version of the High Fantasy *Band Essentials* motion graphic. Fifteen floating islands climb a mountain toward the citadel on its summit. Each island holds one exercise from the five Level 1 games, in turn: Read Rhythms, Fingering Trainer, Write Notes, Read Notes and Terms & Symbols, three times round. Reaching the top plays the movie's ending.

The release number shows in the top-left corner of the game (v7 and up). It is the `VERSION` constant at the top of `src/realm-game.js`; add one for every release to the public site.

Results are percentages: each game's percentage covers its three exercises, and the final result is the average of the five games. Every note the game plays is at concert pitch for the chosen instrument, so it sits in the B-flat of the music.

Play it at https://johnshawler.github.io/band-essentials-realm/

## How it is built

- `index.html` is the whole game: one page, three.js from jsDelivr, fonts from Google Fonts, sound synthesized in the browser.
- `src/` holds the parts `index.html` is assembled from:
  - `realm-head.html`: page markup and styles
  - `kits.js`: the stage (rendering) and sound kits from the original animation
  - `realm-game.js`: the world (the island stair, the mountain), the game props, wisp, camera and ending
  - `realm-play.js`: the game rules, input and painted HUD
  - `realm-tail.js`: the render loop and controls
  - `level1-data.json`: each instrument's Level 1 notes and fingerings
- After editing anything in `src/`, run `python3 build.py` to rebuild `index.html`.

URL options: `?size=1920x1080` renders at a higher resolution (default 1280x720); `?shadow=4096` uses a sharper shadow map.
