// ================================================================ the chapters: one climb per course unit
// Each chapter names its unit, its scenery and its music. The game reads everything else (notes, terms, rhythms) from here,
// so a new chapter is a new entry plus its scenery. Chosen with ?ch=<n>; Chapter 1 when absent.
const UNITS = /*UNITS_DATA*/[];
const SCENE_REG = {};   // each chapter's scenery file registers itself here: SCENE_REG[name] = { look, make }   // per instrument: { key, name, clef, family, units: [[notes of unit 1], …[unit 12]], fing: { midi: bitmask } }

// the terms each unit adds in the course's terms game (ReadTermsProblemMakerFYB, year 1); 'Clef' is the instrument's own clef
const UNIT_TERMS = [
  ['Bar line', 'Quarter note', 'Quarter rest', 'Double bar line', 'Repeat sign', 'Clef'],
  ['Time signature', 'Sharp', 'Flat', 'Natural'],
  ['Key signature', 'Half note', 'Half rest'],
  ['Whole note', 'Whole rest', 'Breath mark'],
  ['Fermata', 'Pick-up note'],
  ['Forte', 'Mezzo forte', 'Piano', 'Eighth note', 'Beam'],
  ['Allegro', 'Moderato', 'Andante'],
  ['Crescendo', 'Diminuendo'],
  ['Measure number', 'Tie', 'Dotted half note', 'Dotted quarter note'],
  ['Accent', 'First ending', 'Second ending'],
  ['D.C. al Fine', 'Slur'],
  ['Eighth rest'],
];

const CHAPTERS = [
  {
    n: 1, unit: 1, title: 'The Climb to the Castle', scene: 'castle',
    rhythm: { rests: false },
    // concert B-flat: the movie's pad
    music: { bpm: 60, chords: [['Bb3', 'F4', 'Bb4', 'D5'], ['Eb3', 'G3', 'Bb3', 'F4'], ['G3', 'Bb3', 'D4', 'F4'], ['F3', 'A3', 'C4', 'Eb4']] },
  },
  {
    n: 2, unit: 2, title: 'The Great Tree', scene: 'tree',
    rhythm: { rests: true },                                    // course level 2: whole, half and quarter rests join in
    // concert B-flat, a morning in the woods: a pad under a slow wooden-flute tune, with birdsong
    music: {
      bpm: 66, birds: true,
      chords: [['Bb3', 'F4', 'C5', 'D5'], ['G3', 'D4', 'F4', 'Bb4'], ['Eb3', 'Bb3', 'D4', 'G4'], ['F3', 'C4', 'F4', 'A4']],
      tune: [[['F5', 2], ['D5', 1], ['Bb4', 1]], [['D5', 2], ['G5', 1], ['F5', 1]], [['Eb5', 1], ['F5', 1], ['G5', 2]], [['F5', 1], ['Eb5', 1], ['C5', 2]],
             [['D5', 1.5], ['C5', 0.5], ['Bb4', 2]], [['Bb4', 1], ['D5', 1], ['G5', 2]], [['G5', 1], ['F5', 1], ['Eb5', 1], ['D5', 1]], [['C5', 3], [null, 1]]],
    },
  },
  {
    n: 3, unit: 3, title: "The Lighthouse at Cloud's End", scene: 'light',
    rhythm: { rests: true, eighths: true, need: ['pair'] },     // course level 3: the first eighth notes, in beamed pairs
    // G minor (B-flat's relative), dusk by the sea: a pad under a squeezebox tune, with waves, gulls and a far bell buoy
    music: {
      bpm: 72, voice: 'reed', sea: true,
      chords: [['G3', 'D4', 'G4', 'Bb4'], ['Eb3', 'Bb3', 'Eb4', 'G4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['F3', 'C4', 'F4', 'A4']],
      tune: [[['D5', 2], ['Bb4', 1], ['G4', 1]], [['G4', 1], ['Bb4', 1], ['Eb5', 2]], [['D5', 1.5], ['C5', 0.5], ['Bb4', 1], ['F5', 1]], [['F5', 2], ['Eb5', 1], ['C5', 1]],
             [['D5', 2], ['G5', 1], ['F5', 1]], [['Eb5', 1], ['D5', 1], ['Bb4', 2]], [['Bb4', 1], ['C5', 1], ['D5', 1], ['F5', 1]], [['C5', 2], ['A4', 1], [null, 1]]],
    },
  },
  {
    n: 4, unit: 4, title: 'The Crystal Spire', scene: 'ice',
    rhythm: { rests: true, eighths: true, pairW: 7, need: ['pair'] },   // course level 4: more eighths
    // E-flat major (B-flat's subdominant), a still night on the ice: a pad under a celesta tune, wind and starry sparkles
    music: {
      bpm: 63, voice: 'glass', wind: true, sparkle: true,
      chords: [['Eb3', 'Bb3', 'Eb4', 'G4'], ['C3', 'G3', 'C4', 'Eb4'], ['Ab2', 'Eb3', 'Ab3', 'C4'], ['Bb2', 'F3', 'Bb3', 'D4']],
      tune: [[['G5', 1], ['Bb5', 1], ['Eb6', 2]], [['D6', 1], ['C6', 1], ['G5', 2]], [['Ab5', 1], ['C6', 1], ['Eb6', 1], ['C6', 1]], [['Bb5', 3], [null, 1]],
             [['G5', 1], ['F5', 1], ['Eb5', 1], ['G5', 1]], [['C6', 2], ['Bb5', 1], ['G5', 1]], [['Ab5', 1.5], ['G5', 0.5], ['F5', 1], ['Ab5', 1]], [['G5', 3], [null, 1]]],
    },
  },
  {
    n: 5, unit: 5, title: 'The Falls of Echo', scene: 'falls',
    rhythm: { rests: true, eighths: true, meter: 2, need: ['pair'] },  // course level 5: 2/4 with quarters and eighths
    // F major (B-flat's dominant), a bright afternoon by the water: a pad under a harp tune, the falls' roar
    music: {
      bpm: 76, voice: 'harp', water: true, birds: true,
      chords: [['F3', 'C4', 'F4', 'A4'], ['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['C3', 'G3', 'C4', 'E4']],
      tune: [[['C5', 1], ['F5', 1], ['A5', 2]], [['G5', 1], ['F5', 1], ['D5', 2]], [['Bb4', 1], ['D5', 1], ['F5', 1], ['D5', 1]], [['E5', 3], [null, 1]],
             [['A5', 1.5], ['G5', 0.5], ['F5', 1], ['C5', 1]], [['D5', 1], ['F5', 1], ['A5', 2]], [['Bb5', 1], ['A5', 1], ['G5', 1], ['F5', 1]], [['G5', 2], ['C5', 1], [null, 1]]],
    },
  },
  {
    n: 6, unit: 6, title: 'The Deep Mine', scene: 'mine',
    rhythm: { rests: true, eighths: true, meter: 3, need: ['pair'] },  // course level 6: 3/4 with halves, quarters and eighths
    // D minor, deep underground: a low pad under a marimba tune, dripping water and the mine's rumble
    music: {
      bpm: 69, voice: 'marimba', drips: true, rumble: true,
      chords: [['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['G2', 'D3', 'G3', 'Bb3'], ['A2', 'E3', 'A3', 'C#4']],
      tune: [[['D5', 1], ['F5', 1], ['A5', 1], ['F5', 1]], [['Bb4', 1], ['D5', 1], ['F5', 2]], [['G5', 1], ['F5', 1], ['D5', 1], ['Bb4', 1]], [['A4', 1], ['C#5', 1], ['E5', 2]],
             [['F5', 1], ['E5', 1], ['D5', 1], ['A4', 1]], [['Bb4', 1], ['F5', 1], ['D5', 2]], [['G4', 1], ['Bb4', 1], ['D5', 1], ['G5', 1]], [['E5', 2], ['A4', 1], [null, 1]]],
    },
  },
  {
    n: 7, unit: 7, title: 'The Twin Towers', scene: 'towers', keys: ['G', 'C'],
    rhythm: { rests: true, eighths: true, ties: true, need: ['tie'] },   // course level 7: tied notes in 4/4
    // G major, a bright march between the towers: a pad under a brass tune, with wind
    music: {
      bpm: 84, voice: 'brass', wind: true, birds: true,
      chords: [['G3', 'D4', 'G4', 'B4'], ['E3', 'B3', 'E4', 'G4'], ['C3', 'G3', 'C4', 'E4'], ['D3', 'A3', 'D4', 'F#4']],
      tune: [[['D5', 1], ['G5', 1], ['B5', 2]], [['A5', 1], ['G5', 1], ['E5', 2]], [['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1]], [['F#5', 3], [null, 1]],
             [['G5', 1.5], ['F#5', 0.5], ['E5', 1], ['D5', 1]], [['B4', 1], ['E5', 1], ['G5', 2]], [['E5', 1], ['G5', 1], ['C6', 1], ['B5', 1]], [['A5', 2], ['D5', 1], [null, 1]]],
    },
  },
  {
    n: 8, unit: 8, title: 'The Sky Harbour', scene: 'harbour', keys: ['G', 'C'],
    rhythm: { rests: true, eighths: true, ties: true, meter: 3, need: ['tie'] },   // course level 8: tied notes in 3/4
    // C major, a windy waltz among the airships: a pad under a flute tune, with wind
    music: {
      bpm: 88, voice: 'flute', wind: true,
      chords: [['C3', 'G3', 'C4', 'E4'], ['A2', 'E3', 'A3', 'C4'], ['F2', 'C3', 'F3', 'A3'], ['G2', 'D3', 'G3', 'B3']],
      tune: [[['E5', 1], ['G5', 1], ['C6', 2]], [['B5', 1], ['A5', 1], ['E5', 2]], [['F5', 1], ['A5', 1], ['C6', 1], ['A5', 1]], [['G5', 3], [null, 1]],
             [['C6', 1.5], ['B5', 0.5], ['A5', 1], ['G5', 1]], [['E5', 1], ['A5', 1], ['C6', 2]], [['A5', 1], ['G5', 1], ['F5', 1], ['D5', 1]], [['G5', 2], ['B4', 1], [null, 1]]],
    },
  },
  {
    n: 9, unit: 9, title: 'The Clocktower', scene: 'clock', keys: ['G', 'C', 'D'],
    rhythm: { rests: true, eighths: true, ties: true, dots: true, need: ['dh'] },   // course level 9: dotted halves in 4/4
    // D major at sunset among the gears: a pad under a bell tune, with the clock's ticking
    music: {
      bpm: 80, voice: 'bellv', ticks: true,
      chords: [['D3', 'A3', 'D4', 'F#4'], ['B2', 'F#3', 'B3', 'D4'], ['G2', 'D3', 'G3', 'B3'], ['A2', 'E3', 'A3', 'C#4']],
      tune: [[['F#5', 1], ['A5', 1], ['D6', 2]], [['C#6', 1], ['B5', 1], ['F#5', 2]], [['G5', 1], ['B5', 1], ['D6', 1], ['B5', 1]], [['A5', 3], [null, 1]],
             [['D6', 1], ['C#6', 1], ['B5', 1], ['A5', 1]], [['F#5', 1], ['B5', 1], ['D6', 2]], [['B5', 1], ['A5', 1], ['G5', 1], ['E5', 1]], [['A5', 2], ['C#5', 1], [null, 1]]],
    },
  },
  {
    n: 10, unit: 10, title: 'The Storm Peak', scene: 'storm', keys: ['G', 'C', 'D'],
    rhythm: { rests: true, eighths: true, ties: true, dottedQ: true, accents: true, meter: 2, need: ['dq'] },   // course level 10: tied notes and dotted quarters in 2/4
    // E minor in the storm: a pad under a low brass tune, with thunder
    music: {
      bpm: 92, voice: 'brass', thunder: true, wind: true,
      chords: [['E3', 'B3', 'E4', 'G4'], ['C3', 'G3', 'C4', 'E4'], ['G2', 'D3', 'G3', 'B3'], ['D3', 'A3', 'D4', 'F#4']],
      tune: [[['E5', 1.5], ['F#5', 0.5], ['G5', 2]], [['E5', 1], ['G5', 1], ['C6', 2]], [['B5', 1.5], ['A5', 0.5], ['G5', 1], ['D5', 1]], [['F#5', 3], [null, 1]],
             [['G5', 1], ['F#5', 1], ['E5', 1], ['B4', 1]], [['C5', 1], ['E5', 1], ['G5', 2]], [['B4', 1], ['D5', 1], ['G5', 1], ['B5', 1]], [['A5', 2], ['F#5', 1], [null, 1]]],
    },
  },
  {
    n: 11, unit: 11, title: "The Dragon's Roost", scene: 'dragon', keys: ['G', 'C', 'D', 'F'],
    rhythm: { rests: true, eighths: true, ties: true, dottedQ: true, meter: 3, need: ['dq'] },   // course level 11: tied notes and dotted quarters in 3/4
    // C minor on the volcano: a dark pad under a brass tune, with the mountain's rumble
    music: {
      bpm: 76, voice: 'brass', rumble: true,
      chords: [['C3', 'G3', 'C4', 'Eb4'], ['Ab2', 'Eb3', 'Ab3', 'C4'], ['Eb3', 'Bb3', 'Eb4', 'G4'], ['G2', 'D3', 'G3', 'B3']],
      tune: [[['C5', 1.5], ['D5', 0.5], ['Eb5', 2]], [['C5', 1], ['Eb5', 1], ['Ab5', 2]], [['G5', 1.5], ['F5', 0.5], ['Eb5', 1], ['Bb4', 1]], [['D5', 3], [null, 1]],
             [['Eb5', 1], ['D5', 1], ['C5', 1], ['G4', 1]], [['Ab4', 1], ['C5', 1], ['Eb5', 2]], [['G5', 1], ['Eb5', 1], ['Bb5', 1], ['G5', 1]], [['B4', 2], ['D5', 1], [null, 1]]],
    },
  },
  {
    n: 12, unit: 12, title: 'The Star Observatory', scene: 'stars', keys: ['G', 'C', 'D', 'F'],
    rhythm: { rests: true, eighths: true, ties: true, dottedQ: true, eighthRest: true, need: ['er'] },   // course level 12: tied notes, dotted quarters and the eighth rest in 4/4
    // home to B-flat for the finale, under the stars: a pad under a celesta tune, with sparkles
    music: {
      bpm: 72, voice: 'glass', sparkle: true,
      chords: [['Bb2', 'F3', 'Bb3', 'D4'], ['G2', 'D3', 'G3', 'Bb3'], ['Eb3', 'Bb3', 'Eb4', 'G4'], ['F3', 'C4', 'F4', 'A4']],
      tune: [[['D6', 1], ['F6', 1], ['Bb6', 2]], [['A6', 1], ['G6', 1], ['D6', 2]], [['Eb6', 1], ['G6', 1], ['Bb6', 1], ['G6', 1]], [['F6', 3], [null, 1]],
             [['Bb6', 1.5], ['A6', 0.5], ['G6', 1], ['F6', 1]], [['D6', 1], ['G6', 1], ['Bb6', 2]], [['G6', 1], ['F6', 1], ['Eb6', 1], ['C6', 1]], [['Bb5', 3], [null, 1]]],
    },
  },
];
const RELEASED = 7;   // chapters up to this one are on the public site (a chapter in progress sits above it until it ships)
CHAPTERS.splice(CHAPTERS.findIndex((c) => c.n > RELEASED) >>> 0);
const CH = CHAPTERS.find((c) => c.n === +params.get('ch')) || CHAPTERS[0];

// every instrument, set up for this chapter: the unit's new notes, and the earlier units' notes for review
const INST = UNITS.map((u) => {
  const fresh = u.units[CH.unit - 1], review = [].concat(...u.units.slice(0, CH.unit - 1));
  return { key: u.key, name: u.name, clef: u.clef, family: u.family, fing: u.fing, fresh, review, notes: review.concat(fresh) };
});
// the chapter's terms: [new, review], with 'Clef' read as the instrument's clef
const chapterTerms = (clef) => {
  const own = (t) => (t === 'Clef' ? (clef === 'bass' ? 'Bass clef' : 'Treble clef') : t);
  return { fresh: UNIT_TERMS[CH.unit - 1].map(own), review: [].concat(...UNIT_TERMS.slice(0, CH.unit - 1)).map(own) };
};
