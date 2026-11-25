// ================================================================ the chapters: one climb per course unit
// Each chapter names its unit, its scenery and its music. The game reads everything else (notes, terms, rhythms) from here,
// so a new chapter is a new entry plus its scenery. Chosen with ?ch=<n>; Chapter 1 when absent.
const UNITS = /*UNITS_DATA*/[];   // per instrument: { key, name, clef, family, units: [[notes of unit 1], …[unit 12]], fing: { midi: bitmask } }

// the terms each unit adds in the course's terms game (ReadTermsProblemMakerFYB, year 1); 'Clef' is the instrument's own clef
const UNIT_TERMS = [
  ['Bar line', 'Quarter note', 'Quarter rest', 'Double bar line', 'Repeat sign', 'Clef'],
  ['Time signature', 'Sharp', 'Flat', 'Natural'],
  ['Key signature', 'Half note', 'Half rest'],
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
    rhythm: { rests: true, eighths: true },                     // course level 3: the first eighth notes, in beamed pairs
    // G minor (B-flat's relative), dusk by the sea: a pad under a squeezebox tune, with waves, gulls and a far bell buoy
    music: {
      bpm: 72, voice: 'reed', sea: true,
      chords: [['G3', 'D4', 'G4', 'Bb4'], ['Eb3', 'Bb3', 'Eb4', 'G4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['F3', 'C4', 'F4', 'A4']],
      tune: [[['D5', 2], ['Bb4', 1], ['G4', 1]], [['G4', 1], ['Bb4', 1], ['Eb5', 2]], [['D5', 1.5], ['C5', 0.5], ['Bb4', 1], ['F5', 1]], [['F5', 2], ['Eb5', 1], ['C5', 1]],
             [['D5', 2], ['G5', 1], ['F5', 1]], [['Eb5', 1], ['D5', 1], ['Bb4', 2]], [['Bb4', 1], ['C5', 1], ['D5', 1], ['F5', 1]], [['C5', 2], ['A4', 1], [null, 1]]],
    },
  },
];
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
