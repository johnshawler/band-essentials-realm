# Band Adventures

**Chapter 1: The Climb to the Castle**

A playable version of the High Fantasy *Band Essentials* motion graphic. Fifteen floating islands climb a mountain toward the citadel on its summit. Each island holds one exercise from the five Level 1 games, in turn: Read Rhythms, Fingering Trainer, Write Notes, Read Notes and Terms & Symbols, three times round. Reaching the top plays the movie's ending.

## Chapters

The site opens on a map of the realm: pick a landmark to climb its chapter, or open one directly with `?ch=<n>`. The Map button in the bar goes back to the map. Every chapter is open from the start, and the map shows your best result in each for the chosen instrument.

| Chapter | Unit | Landmark | New in this unit |
| --- | --- | --- | --- |
| 1. The Climb to the Castle | 1 | Mountain citadel | First notes; Unit 1 terms |
| 2. The Great Tree | 2 | Giant hollow tree | Two new notes per instrument; rests in the rhythms; sharp, flat, natural, time signature |
| 3. The Lighthouse at Cloud's End | 3 | Sea-stack lighthouse | One new note per instrument; beamed eighth-note pairs; key signature, half note, half rest. The lamp's beams turn in time with each rhythm and flash on its notes. |
| 4. The Crystal Spire | 4 | Crystal spire on a frozen lake | One new note per instrument (F♯ for alto sax); more eighths; whole note, whole rest, breath mark. Each right answer grows a ringing crystal on the spire. |
| 5. The Falls of Echo | 5 | Cliff beside great waterfalls | New notes per instrument (B♭ and high F for alto sax); 2/4 time; fermata, pick-up note. On the fermata question the falls stop in mid-air. |
| 6. The Deep Mine | 6 | Cavern round a pillar of ore | Low notes (D, E, F for alto sax); 3/4 time; forte, mezzo forte, piano, eighth note, beam. The cave brightens island by island; forte answers boom and piano answers whisper. |
| 7. The Twin Towers | 7 | Low tower and high tower | High F♯ for alto sax; tied notes; allegro, moderato, andante. Adds the sixth game, Key Signatures (G and C), so the climb has 18 islands. Both tower bells ring F♯ in octaves. |
| 8. The Sky Harbour | 8 | Airship mooring spire | High G for alto sax; tied notes in 3/4; crescendo, diminuendo. The sails swell on the crescendo question and fall slack on the diminuendo. |
| 9. The Clocktower | 9 | Giant clockwork tower | C♯ for alto sax; dotted halves; measure number, tie, dotted half note, dotted quarter note. Key Signatures adds D major. The gears turn and click in time with each rhythm. |
| 10. The Storm Peak | 10 | Lightning-struck mountain | Low C for alto sax; tied notes and dotted quarters in 2/4, with accents; accent, first ending, second ending. Lightning strikes on every accented note; the storm clears at the summit. |
| 11. The Dragon's Roost | 11 | Volcano with a dragon's nest | High A and B for alto sax; tied notes and dotted quarters in 3/4; D.C. al Fine, slur. Key Signatures adds F major. The dragon circles the peak in slur-shaped arcs and settles on its nest at the summit. |

From Chapter 2 on, each game's three exercises use two of the unit's new notes (or terms) and one from earlier units. Chapters are defined in `src/chapters.js`; a chapter's scenery lives in its own file (`src/scene-*.js`). Notes come from each instrument's fingering data in the staging repo: `python3 src/gen-units.py <staging repo> src/units-data.json`.

The release number shows in the top-left corner of the game (v7 and up). It is the `VERSION` constant at the top of `src/realm-game.js`; add one for every release to the public site.

Results are percentages: each game's percentage covers its three exercises, and the final result is the average of the games (five, or six from Chapter 7 when Key Signatures joins). Every note the game plays is at concert pitch for the chosen instrument, so it sits in the B-flat of the music.

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
