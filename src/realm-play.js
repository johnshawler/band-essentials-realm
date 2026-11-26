// ================================================================ the game: rules, sound, input and the painted HUD
function createGame(E) {
  const { G, T, NS, GAMES, TERMS, isl, props, placeProps, launchTiles, resetTiles, R1, R2, R3, R4, R5, R6, tiles, S, K, THREE, set, tintTo, glowing, inkLit, note, writeNote, putClef, staff, arcOn, hairpin, gly, text, clear, pickable, picks, add, group, box, cylZ, M, C, U, PY, CINZEL, CINZEL_B, wispTo, restOf, WS, bump } = E;
  const LET = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }, SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const parseNote = (n) => { const m = /^([A-G])(#|b)?(-?\d)$/.exec(n), acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, oct = +m[3];
    return { name: n, letter: m[1], acc, oct, step: LET[m[1]] + 7 * oct, midi: 12 * (oct + 1) + SEMI[m[1]] + acc }; };
  const fromStep = (step, acc = 0) => { const L = 'CDEFGAB'[((step % 7) + 7) % 7], oct = Math.floor(step / 7); return parseNote(L + (acc < 0 ? 'b' : acc > 0 ? '#' : '') + oct); };
  const pretty = (n) => n.letter + (n.acc < 0 ? '♭' : n.acc > 0 ? '♯' : '');
  const sci = (n) => pretty(n) + n.oct;
  const BOTTOM = { treble: 30, bass: 18 };
  const pOf = (n, clef) => (n.step - BOTTOM[clef]) / 2;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const hold = (i) => T.arrive[i] + 0.25 * (T.leave[i] - T.arrive[i]);
  const world = (obj, x = 0, y = 0, z = 0) => { obj.updateWorldMatrix(true, false); return obj.localToWorld(new THREE.Vector3(x, y, z)); };

  // ---------------------------------------------------------------- saved progress (this browser only)
  const KEY = 'be-realm-l1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

  // ---------------------------------------------------------------- state
  const st = {
    inst: INST.find((i) => i.key === (saved.inst || 'saxophone')) || INST[0],
    tallies: [], stopRes: [], skipped: [], stop: 0, q: 0, res: [], msg: '', msgKind: '', btns: [], hover: -1,
    captionAt: -9, events: [], fly: null, sub: null, bpm: saved.bpm || 80, flash: 0,
  };
  const pool = () => st.inst.notes.map(parseNote);                  // every note this chapter uses
  const freshPool = () => st.inst.fresh.map(parseNote), reviewPool = () => st.inst.review.map(parseNote);
  // written-to-sounding shift in semitones (B-flat, E-flat and F instruments; bass sounds an octave down, bells two up)
  const TRANSPOSE = { saxophone: -9, tenorsaxophone: -14, clarinet: -2, trumpet: -2, euphonium: -14, fhorn: -7, bbhorn: -7, dhorn: -7, electricbass: -12, bells: 24 };
  const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const concert = (n) => { let m = n.midi + (TRANSPOSE[st.inst.key] || 0); while (m < 43) m += 12; while (m > 96) m -= 12; return NAMES[m % 12] + (Math.floor(m / 12) - 1); };
  const TONIC = () => (st.inst.clef === 'bass' ? 'Bb3' : 'Bb4');            // the rhythm's sounding note: the key note of the music
  G.summaryFade = 0;

  // ---------------------------------------------------------------- sound: the movie's kit, played live
  let AC = null, kit = null, base = 0, outGain = null, soundOn = saved.sound !== false, ambUntil = 0;
  function audio() {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      outGain = AC.createGain(); outGain.gain.value = soundOn ? 1 : 0; outGain.connect(AC.destination);
      kit = SOUND.kit(AC, { start: 0, delay: 0, dest: outGain }); base = AC.currentTime;
    }
    if (AC.state === 'suspended') AC.resume();
    return kit;
  }
  const now = () => (AC ? AC.currentTime - base + 0.015 : 0);
  const toAmb = (audioT) => G.t + (audioT - now());               // an audio-clock time, as scene time
  const snd = {
    play: (name, o = {}, t = now()) => kit && kit.play(name, t, o),
    pluck: (n, dur = 0.8, gain = 0.2, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, type: 'triangle', dur: dur + 0.4, gain, a: 0.003, verb: 0.4, filter: 'lowpass', f2: 3200 }); kit.tone(t, { f: f * 2, type: 'sine', dur: dur * 0.5 + 0.15, gain: gain * 0.3, a: 0.002, verb: 0.35 }); kit.noise(t, { dur: 0.012, filter: 'highpass', f: 3500, gain: gain * 0.25 }); },
    chime: (n, gain = 0.14, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, dur: 0.9, gain, a: 0.002, verb: 0.45 }); kit.tone(t, { f: f * 2.01, dur: 0.5, gain: gain * 0.4, a: 0.002, verb: 0.45 }); kit.tone(t, { f: f * 3.02, dur: 0.25, gain: gain * 0.2, a: 0.001 }); },
    horn: (n, t = now()) => { if (!kit) return; kit.tone(t, { f: n, type: 'sawtooth', dur: 0.85, gain: 0.11, a: 0.05, hold: 0.45, filter: 'lowpass', f2: 1300, verb: 0.4 }); kit.tone(t, { f: n, type: 'sine', dur: 0.85, gain: 0.1, a: 0.05, hold: 0.45, verb: 0.4 }); },
    gliss: (notes, step = 0.07, gain = 0.09, t = now()) => notes.forEach((n, i) => snd.pluck(n, 0.5, gain * (0.7 + 0.3 * i / notes.length), t + i * step)),
    gust: (dur, gain, t = now()) => kit && kit.noise(t, { dur, color: 'pink', filter: 'bandpass', f: [[0, 300], [dur * 0.5, 900], [dur, 350]], q: 1.4, gain, a: dur * 0.45, verb: 0.3 }),
    // a soft wooden flute for the chapter tunes, and a songbird's call (two or three quick chirps)
    flute: (n, dur, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, type: 'sine', dur: dur + 0.25, gain: 0.05, a: 0.06, hold: Math.max(0.05, dur - 0.1), bus: 'music', verb: 0.45 }); kit.tone(t, { f: f * 2, type: 'sine', dur: dur * 0.8, gain: 0.008, a: 0.08, bus: 'music', verb: 0.4 }); kit.noise(t, { dur: 0.05, filter: 'bandpass', f: f * 2, q: 3, gain: 0.006, bus: 'music' }); },
    bird: (t = now()) => { if (!kit) return; const f0 = 2600 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 2); for (let k = 0; k < n; k++) kit.tone(t + k * 0.13, { f: [[0, f0], [0.05, f0 * 1.35], [0.1, f0 * 1.1]], type: 'sine', dur: 0.12, gain: 0.018, a: 0.005, pan: 0.5 - Math.random(), verb: 0.35 }); },
    reed: (n, dur, t = now()) => { if (!kit) return; const f = kit.hz(n); for (const dt of [1, 1.004]) kit.tone(t, { f: f * dt, type: 'sawtooth', dur: dur + 0.15, gain: 0.018, a: 0.05, hold: Math.max(0.05, dur - 0.08), filter: 'lowpass', f2: 1500, bus: 'music', verb: 0.4 }); kit.tone(t, { f: f / 2, type: 'triangle', dur: dur + 0.1, gain: 0.012, a: 0.06, hold: Math.max(0.05, dur - 0.1), bus: 'music', verb: 0.35 }); },
    // more chapter voices: glass (celesta), harp, brass, marimba, bell
    glass: (n, dur, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, type: 'sine', dur: dur + 0.9, gain: 0.05, a: 0.003, bus: 'music', verb: 0.55 }); kit.tone(t, { f: f * 4, type: 'sine', dur: 0.35, gain: 0.012, a: 0.002, bus: 'music', verb: 0.5 }); },
    harp: (n, dur, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, type: 'triangle', dur: dur + 1.0, gain: 0.05, a: 0.004, bus: 'music', verb: 0.5, filter: 'lowpass', f2: 2600 }); kit.tone(t, { f: f * 2, type: 'sine', dur: 0.5, gain: 0.012, a: 0.003, bus: 'music', verb: 0.45 }); },
    brass: (n, dur, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, type: 'sawtooth', dur: dur + 0.2, gain: 0.02, a: 0.07, hold: Math.max(0.05, dur - 0.1), filter: 'lowpass', f2: 1100, bus: 'music', verb: 0.45 }); kit.tone(t, { f, type: 'sine', dur: dur + 0.2, gain: 0.02, a: 0.06, hold: Math.max(0.05, dur - 0.1), bus: 'music', verb: 0.4 }); },
    marimba: (n, dur, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, type: 'sine', dur: 0.6, gain: 0.06, a: 0.002, bus: 'music', verb: 0.35 }); kit.tone(t, { f: f * 3.9, type: 'sine', dur: 0.12, gain: 0.012, a: 0.001, bus: 'music', verb: 0.3 }); },
    bellv: (n, dur, t = now()) => { if (!kit) return; const f = kit.hz(n); kit.tone(t, { f, type: 'sine', dur: dur + 1.6, gain: 0.04, a: 0.002, bus: 'music', verb: 0.6 }); kit.tone(t, { f: f * 2.76, type: 'sine', dur: 0.9, gain: 0.01, a: 0.002, bus: 'music', verb: 0.6 }); kit.tone(t, { f: f * 5.4, type: 'sine', dur: 0.4, gain: 0.005, a: 0.001, bus: 'music', verb: 0.6 }); },
    drip: (t = now()) => { if (!kit) return; const f0 = 700 + Math.random() * 600; kit.tone(t, { f: [[0, f0], [0.06, f0 * 2.2]], type: 'sine', dur: 0.09, gain: 0.03, a: 0.002, verb: 0.75, pan: 0.7 - Math.random() * 1.4 }); },
    thunder: (t = now(), g = 1) => { if (!kit) return; kit.noise(t, { dur: 3.2, color: 'brown', filter: 'lowpass', f: [[0, 900], [3.2, 120]], gain: 0.16 * g, a: 0.02, verb: 0.5, pan: 0.6 - Math.random() * 1.2 }); kit.noise(t, { dur: 0.25, color: 'pink', filter: 'highpass', f: 1500, gain: 0.08 * g, a: 0.002 }); },
    wave: (t = now()) => { if (!kit) return; const d = 3.2 + Math.random() * 1.5; kit.noise(t, { dur: d, color: 'pink', filter: 'lowpass', f: [[0, 250], [d * 0.45, 900], [d, 220]], q: 0.6, gain: 0.05, a: d * 0.45, pan: 0.6 - Math.random() * 1.2, verb: 0.3 }); },
    gull: (t = now()) => { if (!kit) return; const f0 = 1500 + Math.random() * 500, n = 1 + Math.floor(Math.random() * 3), pan = 0.8 - Math.random() * 1.6; for (let k = 0; k < n; k++) kit.tone(t + k * 0.32, { f: [[0, f0], [0.06, f0 * 1.12], [0.26, f0 * 0.72]], type: 'triangle', dur: 0.3, gain: 0.014, a: 0.01, filter: 'bandpass', f2: 1700, q: 1.4, pan, verb: 0.5 }); },
    right: () => { const u = st.sub; sig('onRight', st.stop, { note: u && u.n ? concert(u.n) : null, written: u && u.n ? u.n.name : null, term: u && u.kind === 'terms' ? TERMS[u.ti] : null, kind: u && u.kind }); snd.play('ding', { gain: 0.32, f: 'Bb5' }); snd.play('ding', { gain: 0.22, f: 'F6' }, now() + 0.08); },
    wrong: () => { snd.play('thud', { gain: 0.4, f: 120 }); kit && kit.tone(now(), { f: 'D3', type: 'triangle', dur: 0.4, gain: 0.08, filter: 'lowpass', f2: 900 }); },
  };
  if (R1.sig) Object.assign(R1.sig, { snd, now, toAmb: (t) => toAmb(t) });   // the scenery may make sounds of its own
  const MUS = CH.music, BAR = 240 / MUS.bpm;
  let ambWin = 0;
  function ambient() {
    if (!kit) return;
    const n = now(), quiet = st.sub && st.sub.kind === 'rhythm' && st.sub.phase !== 'ready' && st.sub.phase !== 'result';
    if (n > ambUntil - 5) {
      // four bars at a time: the chapter's chords as a pad, and its tune (if it has one) on every other pass
      const t0 = Math.max(n + 0.05, ambUntil), len = 4 * BAR, w = ambWin++;
      kit.music('pad', t0, t0 + len, { bpm: MUS.bpm, gain: quiet ? 0.25 : 0.5, chords: MUS.chords }); kit.bed('room', t0, t0 + len, { gain: 0.5 });
      snd.gust(2.4, 0.035, t0 + 3); snd.gust(2.4, 0.03, t0 + len * 0.62);
      if (MUS.tune && w % 2 === 1 && !quiet) { const voice = snd[MUS.voice || 'flute']; let tb = t0; MUS.tune.slice(4 * ((w >> 1) % 2), 4 * ((w >> 1) % 2) + 4).forEach((bar) => bar.forEach(([nt, beats]) => { if (nt) voice(nt, beats * BAR / 4, tb); tb += beats * BAR / 4; })); }
      // each chapter's surroundings: falling water, cave drips, thunder, a volcano's rumble, a clock's ticks, wind, night sparkles
      if (MUS.water) kit.noise(t0, { dur: len + 0.6, color: 'pink', filter: 'lowpass', f: 700, q: 0.5, gain: 0.05, a: 0.4, hold: len - 0.3, verb: 0.25 });
      if (MUS.drips) for (let k = 0; k < 5; k++) snd.drip(t0 + Math.random() * len);
      if (MUS.thunder && Math.random() < 0.7) snd.thunder(t0 + Math.random() * len * 0.8, quiet ? 0.4 : 1);
      if (MUS.rumble) kit.noise(t0, { dur: len + 0.6, color: 'brown', filter: 'lowpass', f: 160, gain: 0.07, a: 0.5, hold: len - 0.5 });
      if (MUS.ticks && !quiet) for (let k = 0; k < 4 * 4; k++) snd.play('tick', { gain: 0.05, f: k % 4 ? 3800 : 5200 }, t0 + k * BAR / 4);
      if (MUS.wind) { snd.gust(3, 0.06, t0 + 1); snd.gust(3.4, 0.05, t0 + len * 0.55); }
      if (MUS.sparkle && !quiet) for (let k = 0; k < 2; k++) snd.play('sparkle', { gain: 0.06 }, t0 + len * (0.25 + 0.4 * k));
      if (MUS.sea) { for (let k = 0; k < 3; k++) snd.wave(t0 + len * k / 3 + Math.random()); if (!quiet) for (let k = 0; k < 2; k++) if (Math.random() < 0.7) snd.gull(t0 + len * (0.2 + 0.45 * k) + Math.random() * 1.5); if (w % 2 === 0 && !quiet) snd.chime('D5', 0.035, t0 + len * 0.55); }
      if (MUS.birds) for (let k = 0; k < 3; k++) snd.bird(t0 + len * (0.15 + 0.3 * k) + Math.random() * 1.2);
      ambUntil = t0 + len - 0.4;
    }
  }
  function setSound(on) { soundOn = on; saved.sound = on; persist(); if (outGain) outGain.gain.value = on ? 1 : 0; }

  // ---------------------------------------------------------------- flow: title, flights, islands, the ending
  const at = (dt, fn) => st.events.push({ t: G.t + dt, fn });
  const atAudio = (audioT, fn) => st.events.push({ t: toAmb(audioT), fn });
  function say(msg, kind = '') { st.msg = msg; st.msgKind = kind; }
  // a flight is a list of [seconds, story time] keys; story time moves straight between them, the camera path does the easing
  function flyTo(from, to, dur, then) { flyPath([[0, from], [dur, to]], then); }
  function flyPath(keys, then) { G.mode = 'fly'; st.fly = { keys, t0: G.t, then }; }
  const NG = GAMES.length, gameOf = (j) => j % NG, lapOf = (j) => Math.floor(j / NG);
  // the chapter's scenery listens to the game through these hooks (see SIG in realm-game.js)
  const sig = (name, ...a) => R1.sig && typeof R1.sig[name] === 'function' && R1.sig[name](...a);
  // the chapter's terms as indices into TERMS: the ones this unit adds, and earlier units' for review
  const termIds = (names) => names.map((nm) => TERMS.indexOf(nm)).filter((j) => j >= 0);
  const termPool = () => { const t = chapterTerms(st.inst.clef); return { fresh: termIds(t.fresh), review: termIds(t.review) }; };
  function termSeq() { const t = termPool(); if (!t.review.length) return shuffle(t.fresh).slice(0, 3); const f = shuffle(t.fresh).slice(0, 2); return shuffle(f.concat(shuffle(t.review).slice(0, 3 - f.length))); }
  function resetJourney() {
    st.events = []; st.fly = null; st.sub = null; say('');
    st.tallies = GAMES.map(() => ({ c: 0, n: 0 })); st.skipped = GAMES.map(() => false); st.stopRes = new Array(NS).fill(null); st.stop = 0;
    st.seqs = { finger: noteSeq(3), write: noteSeq(3), read: noteSeq(3), terms: termSeq(), keys: keySeq() }; st.rhythmPrev = '';
    G.doneAt = new Array(NS).fill(-1); G.endTau = -1; G.summaryFade = 0;
    resetTiles(); GAMES.forEach((_, g) => placeProps(g, g));
    WS.free = false; WS.pos.copy(restOf(0));
  }
  function begin() {
    audio(); snd.gliss(['Bb3', 'D4', 'F4', 'Bb4', 'C5', 'D5', 'F5', 'Bb5'], 0.2, 0.08); snd.play('sparkle', { gain: 0.25 }, now() + 1.6); snd.gust(2.6, 0.1);
    resetJourney();
    flyTo(0.3, hold(0), 2.9, () => startStop(0));
  }
  // clear a game's last result off its props before they appear on the next island
  function tidy(g) {
    if (g === 0) { R1.notes.forEach((n) => { tintTo(n.g.userData.mat, C.lit); set(n.g.userData.mat, 0); }); R1.stoneAt = [-9, -9, -9, -9]; }
    if (g === 1) { R2.gems.forEach((o) => { o.on = false; tintTo(o.pearl, C.lit); set(o.pearl, 0); }); clear(R2.noteG); }
    if (g === 2) { clear(R3.noteG); clear(R3.accG); clear(R3.askG); R3.seals.forEach((sg) => set(sg.userData.mat, 0)); R3.qPath = null; R3.ring = null; R3.inkAt = -1; R3.stampAt = -1; R3.crisp = R3.dots = null; }
    if (g === 3) { clear(R4.noteG); R4.shields.forEach((q) => { tintTo(q.userData.mat, '#e05200'); set(q.userData.mat, 0); }); }
    if (g === 5) { clear(R6.dyn); R6.keys.forEach((kg) => { const u = kg.userData; u.turnAt = -9; tintTo(u.tagMat, C.lit); set(u.tagMat, 0); }); set(R6.panelM, 0); }
    if (g === 4) { clear(R5.dyn); R5.hlMats = []; tiles.forEach((tb) => { tintTo(tb.userData.mat, C.lit); set(tb.userData.mat, 0); }); }
  }
  function startStop(j) {
    const g = gameOf(j);
    G.mode = 'play'; G.island = j; G.tau = hold(j); st.stop = j; st.q = lapOf(j); st.captionAt = G.t; say('');
    // the game two islands back is out of sight now: carry its props up to its next island
    if (j >= 2 && j - 2 + NG < NS) { tidy(gameOf(j - 2)); placeProps(gameOf(j - 2), j - 2 + NG); }
    wispTo(restOf(j), 0.6, 0.2); sig('onStop', j);
    [setupRhythm, setupFinger, setupWrite, setupRead, setupTerms, setupKeys][g]();
  }
  // percentage correct: questions answered right, or for rhythms, notes tapped in time (extra taps count as misses)
  // best results, per instrument and chapter (Chapter 1 keeps the key it has always used)
  const bestKey = () => (CH.n === 1 ? st.inst.key : `ch${CH.n}:${st.inst.key}`);
  const pctOf = (t) => (t.n ? Math.round(100 * t.c / t.n) : 0);
  const mark = (c, n = 1) => { const t = st.tallies[gameOf(st.stop)]; t.c += c; t.n += n; };
  const finalPct = () => { const r = st.tallies.filter((t) => t.n); return r.length ? Math.round(r.reduce((a, t) => a + 100 * t.c / t.n, 0) / r.length) : 0; };
  // one exercise is done: light the island's crystal, then swoop on up the stair
  function saveBest() {
    const best = ((saved.bestPct = saved.bestPct || {})[bestKey()] = saved.bestPct[bestKey()] || []);
    st.tallies.forEach((tl, i) => { if (tl.n) best[i] = Math.max(best[i] == null ? 0 : best[i], pctOf(tl)); }); persist();
  }
  function finishStop() {
    const j = st.stop; if (st.sub && st.sub.kind === 'done') return;
    G.doneAt[j] = G.t; snd.play('sparkle', { gain: 0.42 }); snd.play('bell', { gain: 0.24, f: ['Bb5', 'C6', 'D6', 'Eb6', 'F6', 'G6'][gameOf(j)] });
    st.sub = { kind: 'done' };
    at(1.4, () => leaveStop(j));
  }
  function skipStop(why) { st.skipped[gameOf(st.stop)] = true; st.sub = { kind: 'done' }; say(why); const j = st.stop; at(st.q ? 1.6 : 2.8, () => leaveStop(j)); }
  function leaveStop(j) {
    if (st.stop !== j) return;
    st.sub = null; say(''); sig('onLeave', j);
    if (j < NS - 1) {
      const runs = [['F4', 'G4', 'Bb4', 'C5', 'D5', 'F5', 'G5'], ['G4', 'Bb4', 'C5', 'D5', 'F5', 'G5', 'Bb5'], ['Bb4', 'C5', 'D5', 'F5', 'G5', 'Bb5', 'C6'], ['C5', 'D5', 'F5', 'G5', 'Bb5', 'C6', 'D6']];
      snd.gust(1.1, 0.12); snd.gliss(runs[j % 4], 0.085, 0.07, now() + 0.5);
      flyPath([[0, G.tau], [0.6, T.leave[j]], [2.8, T.arrive[j + 1]], [3.4, hold(j + 1)]], () => startStop(j + 1));
      at(0.5, () => wispTo(restOf(j + 1), 2.6, 2.2));
    } else if (R1.sig && R1.sig.summit) summit(); else finale();
  }
  // the chapter's own summit moment, before the logo sequence (Enter, Space or a click skips it)
  function summit() {
    const S = R1.sig.summit; G.mode = 'summit'; G.summitAt = G.t; st.summitDone = false; st.captionAt = G.t;
    snd.play('riser', { gain: 0.22, dur: 2.2 }); snd.gliss(['Bb3', 'D4', 'F4', 'Bb4', 'D5', 'F5', 'Bb5'], 0.18, 0.07, now() + 0.6);
    if (S.start) S.start();
    at(S.dur, endSummit);
  }
  function endSummit() { if (G.mode !== 'summit' || st.summitDone) return; st.summitDone = true; G.mode = 'fly'; finale(); }
  function finale() {
    // the eight cards carry the names of the last question's answers, as the movie's did
    flyPath([[0, G.tau], [0.7, T.lift - 0.01], [1.2, T.lift]], () => {
      G.mode = 'finale'; G.endTau = T.lift; st.endStart = G.t; launchTiles();
      snd.play('riser', { gain: 0.28, dur: 1.2 }); snd.gust(1.6, 0.1, now() + 0.2);
      tiles.forEach((_, j) => { const tl = tileStart(j) + T.flight - T.lift; snd.play('swish', { gain: 0.32, dur: 0.3 }, now() + tileStart(j) - T.lift); snd.play('stamp', { gain: 0.34 + 0.03 * j }, now() + tl - 0.04); snd.pluck(['Bb3', 'D4', 'F4', 'Bb4', 'D5', 'F5', 'Bb5', 'D6'][j], 0.8, 0.09, now() + tl - 0.04); });
      snd.play('ding', { gain: 0.5, f: 'Bb5' }, now() + T.exact0 + 0.1 - T.lift); snd.play('ding', { gain: 0.35, f: 'F6' }, now() + T.exact0 + 0.1 - T.lift);
      T.text.forEach((tt, i) => { snd.play('pop', { gain: 0.3, f: 520 + i * 90 }, now() + tt - T.lift); snd.pluck(['Bb4', 'D5', 'F5'][i], i === 2 ? 1.5 : 0.6, 0.11, now() + tt - T.lift); });
    });
  }
  const tileStart = (j) => T.lift + j * T.gap;
  function toTitle() {
    resetJourney(); G.mode = 'title'; G.tau = 0.3;
  }

  // ---------------------------------------------------------------- 1. Read Rhythms
  function genBar() {
    for (;;) {
      const out = []; let b = 0;
      while (b < 4) {
        // a whole, a half, a quarter, or (from Chapter 3) a beamed pair of eighths: at most two pairs a bar, so they fit the scroll
        const opts = []; if (b === 0) opts.push([4, 1]); if (b % 2 === 0) opts.push([2, 4]); opts.push([1, 5]);
        if (CH.rhythm.eighths && out.filter((n) => n.pair).length < 2) opts.push(['pair', 5]);
        let r = Math.random() * opts.reduce((s, o) => s + o[1], 0), d = 1;
        for (const [dd, w] of opts) { if ((r -= w) < 0) { d = dd; break; } }
        if (d === 'pair') { out.push({ beat: b, d: 1, pair: true, rest: false }); b += 1; continue; }
        out.push({ beat: b, d, rest: CH.rhythm.rests && Math.random() < (d === 4 ? 0.3 : d === 2 ? 0.3 : 0.22) }); b += d;
      }
      if (out.length > 1 || Math.random() < 0.3) return out;
    }
  }
  function setupRhythm() { st.sub = { kind: 'rhythm', phase: 'ready', prev: st.rhythmPrev }; RH.eighths ? newRhythmG() : newRhythm(); }
  function newRhythm() {
    const s = st.sub, clef = st.inst.clef; let r;
    const sounded = (rr) => rr[0].concat(rr[1]).filter((n) => !n.rest).length, pairs = (rr) => rr[0].concat(rr[1]).filter((n) => n.pair).length;
    do { r = [genBar(), genBar()]; } while (JSON.stringify(r) === s.prev || (r[0].length === 1 && r[1].length === 1) || sounded(r) < 3 || r[0][0].rest || (CH.rhythm.eighths && pairs(r) < 1));
    s.prev = st.rhythmPrev = JSON.stringify(r); s.r = r; s.phase = 'ready'; s.taps = [];
    clear(R1.dyn); R1.notes = []; R1.tapAt = []; R1.stoneAt = [-9, -9, -9, -9];
    putClef(R1.sf, clef, R1.dyn);
    const mid = fromStep(BOTTOM[clef] + 4);
    s.mid = mid; s.onsets = [];
    {
    R1.sf.put('barline', 13.0, 0, M.ink, R1.dyn); R1.sf.put('barline', 20.75, 0, M.ink, R1.dyn); R1.sf.put('thick', 21.25, 0, M.ink, R1.dyn);
    r.forEach((bar, bi) => bar.forEach((n) => {
      const x0 = bi ? 13.0 : 5.0, su = n.d === 4 ? x0 + 1.6 : x0 + 0.95 + n.beat * 1.72;
      if (n.rest) { R1.sf.put(n.d === 4 ? 'wholeRest' : n.d === 2 ? 'halfRest' : 'rest', (n.d === 4 ? x0 + 3.95 : su + 0.15), 0, M.ink, R1.dyn); return; }
      const nn = writeNote(R1.dyn, R1.sf, clef, mid, su, n.d === 4 ? 'w' : n.d === 2 ? 'h' : 'q', inkLit(), -1);
      R1.notes.push({ g: nn, su, d: n.d }); s.onsets.push(bi * 4 + n.beat);
    })); }
    say(`${CH.rhythm.eighths ? 'Two beamed eighth notes share one beat: tap both. ' : ''}${CH.rhythm.rests ? 'Rests are silent: no tap. ' : ''}Press Listen (or touch the scroll) to hear it. Press Tap it (or the Count in sign) for four count-in beats, then tap the drum or press Space on every note.`);
  }

  // ---------------------------------------------------------------- rhythms from Chapter 3 on: 2/4, 3/4 or 4/4, eighths, ties, dots, eighth rests
  // A bar is a list of symbols { at, dur, kind: 'w'|'h'|'q'|'e', rest, dot, beam (1 or 2 for a beamed pair), flag, tie (to the next), accent }.
  const RH = CH.rhythm;
  function genBarG(m) {
    for (;;) {
      const out = []; let b = 0;
      while (b < m - 1e-6) {
        const left = m - b, c = [];
        if (b === 0 && m === 4) c.push(['w', 4, 1]);
        if (RH.dots && left >= 3 && (m === 3 ? b === 0 : b <= 1)) c.push(['dh', 3, 3]);
        if (left >= 2 && (m === 4 ? b % 2 === 0 : b <= 1)) c.push(['h', 2, 3]);
        c.push(['q', 1, 5]);
        if (out.filter((x) => x.beam === 1).length < (m === 2 ? 1 : 2)) c.push(['pair', 1, RH.pairW || 5]);
        if (RH.dottedQ && left >= 2 && b % 1 === 0) c.push(['dq', 2, 4]);
        if (RH.eighthRest) c.push(['er', 1, 3]);
        let r = Math.random() * c.reduce((a, x) => a + x[2], 0), pick = c[c.length - 1];
        for (const x of c) if ((r -= x[2]) < 0) { pick = x; break; }
        const rest = (p) => !!RH.rests && Math.random() < p, nm = pick[0];
        if (nm === 'w') out.push({ at: b, dur: 4, kind: 'w', rest: rest(0.3) });
        else if (nm === 'dh') out.push({ at: b, dur: 3, kind: 'h', dot: true });
        else if (nm === 'h') out.push({ at: b, dur: 2, kind: 'h', rest: rest(0.25) });
        else if (nm === 'q') out.push({ at: b, dur: 1, kind: 'q', rest: rest(0.2) });
        else if (nm === 'pair') out.push({ at: b, dur: 0.5, kind: 'e', beam: 1 }, { at: b + 0.5, dur: 0.5, kind: 'e', beam: 2 });
        else if (nm === 'dq') out.push({ at: b, dur: 1.5, kind: 'q', dot: true }, { at: b + 1.5, dur: 0.5, kind: 'e', flag: true });
        else out.push({ at: b, dur: 0.5, kind: 'e', rest: true }, { at: b + 0.5, dur: 0.5, kind: 'e', flag: true });
        b += pick[1];
      }
      if (out.length > 1 || Math.random() < 0.25) return out;
    }
  }
  // how much room each symbol wants, in staff spaces
  const WID = (x) => (x.kind === 'w' ? 3.2 : x.beam ? 1.65 : x.kind === 'e' ? 1.75 : x.dot ? (x.kind === 'h' ? 3.0 : 2.45) : x.kind === 'h' ? 2.6 : 1.85);
  const METER = () => RH.meter || 4, BARS = (m) => (m === 3 ? 3 : 8 / m);
  function newRhythmG() {
    const s = st.sub, clef = st.inst.clef, m = METER(), nb = BARS(m), need = RH.need || [];
    const has = (rr, f) => rr.flat().some(f);
    let r, tries = 0;
    for (;;) {
      r = Array.from({ length: nb }, () => genBarG(m));
      if (RH.ties) for (let i = 0; i < nb - 1; i++) { const a = r[i][r[i].length - 1], b = r[i + 1][0]; if (!a.rest && !b.rest && a.kind !== 'e' && b.kind !== 'e' && !a.dot && Math.random() < 0.55) a.tie = true; }
      if (RH.accents) shuffle(r.flat().filter((x) => !x.rest)).slice(0, 2).forEach((x) => { x.accent = true; });
      const flat = r.flat(), nat = r.reduce((a, bar) => a + 1.3 + bar.reduce((q, x) => q + WID(x), 0), 0);
      if (++tries > 500) break;
      if (JSON.stringify(r) === s.prev || flat[0].rest || flat.filter((x) => !x.rest).length < 3 || nat > 31 || r.every((bar) => bar.length === 1)) continue;
      if (need.includes('pair') && !has(r, (x) => x.beam)) continue;
      if (need.includes('tie') && !has(r, (x) => x.tie)) continue;
      if (need.includes('dh') && !has(r, (x) => x.dot && x.kind === 'h')) continue;
      if (need.includes('dq') && !has(r, (x) => x.dot && x.kind === 'q')) continue;
      if (need.includes('er') && !has(r, (x) => x.rest && x.kind === 'e')) continue;
      break;
    }
    s.prev = st.rhythmPrev = JSON.stringify(r); s.r = r; s.phase = 'ready'; s.taps = []; s.cin = m === 3 ? 3 : 4; s.total = nb * m;
    // the staff is drawn afresh each time, as large as the two (or three, or four) bars allow
    const nat = r.map((bar) => 1.3 + bar.reduce((q, x) => q + WID(x), 0)), sumNat = nat.reduce((a, b) => a + b, 0);
    const RS = Math.min(0.92, 4.3 / (U * (5.75 + sumNat))), total = 4.3 / (U * RS), free = total - 5.75 - sumNat;
    clear(R1.dynRoot); const st0 = new THREE.Group(); st0.scale.setScalar(RS); R1.dynRoot.add(st0);
    const sf = R1.sf = staff(st0, -2.15 / RS, total * U, -0.05 / RS - 2 * U); R1.dyn = new THREE.Group(); st0.add(R1.dyn);
    R1.notes = []; R1.tapAt = []; R1.stoneAt = [-9, -9, -9, -9];
    putClef(sf, clef, R1.dyn); sf.put(m === 4 ? 'four' : m === 3 ? 'three' : 'two', 3.8, 2, M.ink, R1.dyn); sf.put('four', 3.8, 0, M.ink, R1.dyn);
    const mid = fromStep(BOTTOM[clef] + 4); s.mid = mid; s.onsets = []; s.accents = [];
    let x = 5.0, prev = null;
    r.forEach((bar, bi) => {
      const bw = nat[bi] + free / nb, x0 = x, extra = bw - nat[bi];
      let cx = x0 + 0.9; bar.forEach((n) => { n.su = cx; cx += WID(n) + extra * n.dur / m; });
      x = x0 + bw; sf.put('barline', x, 0, M.ink, R1.dyn);
      bar.forEach((n, k) => {
        if (n.rest) { sf.put(n.kind === 'w' ? 'wholeRest' : n.kind === 'h' ? 'halfRest' : n.kind === 'e' ? 'eighthRest' : 'rest', n.kind === 'w' ? x0 + bw / 2 : n.su + (n.kind === 'q' ? 0.15 : 0.3), 0, M.ink, R1.dyn); prev = n; return; }
        const tied = prev && prev.tie && !prev.rest, mat = tied ? prev.mat : inkLit();
        const nn = writeNote(R1.dyn, sf, clef, mid, n.su, n.kind === 'e' ? 'q' : n.kind, mat, -1); n.g = nn; n.mat = mat;
        if (n.dot) add(nn, gly('dot')[0], mat, 1.15, 0.5, 0, { cast: false });
        if (n.flag) add(nn, gly('flagDown')[0], mat, 0, 0, 0, { cast: false });
        if (n.beam === 2) { const pn = bar[k - 1], len = n.su - pn.su + 0.13; add(pn.g, box(len, 0.5, 0.12), pn.mat, -0.57 - 0.065 + len / 2, -3.15, 0, { cast: false }); }
        if (n.accent) { sf.put('accent', n.su, 4.8, mat, R1.dyn); s.accents.push(bi * m + n.at); }
        if (tied) arcOn(sf, prev.su + 0.6, n.su - 0.6, 2.8, 1, mat, R1.dyn);
        else { R1.notes.push({ g: nn, su: n.su, d: n.dur + (n.tie ? (bi + 1 < nb ? r[bi + 1][0].dur : 0) : 0) }); s.onsets.push(bi * m + n.at); }
        prev = n;
      });
    });
    sf.put('thick', x + 0.5, 0, M.ink, R1.dyn);
    const tips = [];
    if (has(r, (x) => x.beam)) tips.push('Two beamed eighth notes share one beat: tap both.');
    if (has(r, (x) => x.tie)) tips.push('A tie joins two notes into one: tap only the first.');
    if (has(r, (x) => x.dot)) tips.push('A dot adds half the note\'s length.');
    if (RH.rests && has(r, (x) => x.rest)) tips.push('Rests are silent: no tap.');
    say(`${tips.join(' ')} Press Listen (or touch the scroll) to hear it. Press Tap it (or the Count in sign) for ${s.cin} count-in beats, then tap the drum or press Space on every note.`);
  }
  function runRhythm(tapping) {
    const s = st.sub; if (!s || s.phase !== 'ready' && s.phase !== 'result') return;
    if (s.phase === 'result') return;
    audio();
    const beat = 60 / st.bpm, t0 = now() + 0.4, cin = s.cin || 4, total = s.total || 8, ts = t0 + cin * beat;
    s.phase = tapping ? 'count' : 'listen'; s.t0 = t0; s.ts = ts; s.beat = beat; s.taps = []; s.tapping = tapping; s.hit = s.onsets.map(() => false); s.extra = 0;
    R1.notes.forEach((n) => { tintTo(n.g.userData.mat, C.lit); set(n.g.userData.mat, 0); });
    say(tapping ? `Count in: ${[1, 2, 3, 4].slice(0, cin).join(', ')}…` : 'Listen…');
    if (R1.sig) { R1.sig.flashAt = []; R1.sig.sweep = { t0: toAmb(t0), t1: toAmb(ts + total * beat), beat }; if (!tapping) s.onsets.forEach((o) => R1.sig.flashAt.push(toAmb(ts + o * beat))); }
    sig('onRhythm', { t0: toAmb(t0), ts: toAmb(ts), beat, cin, total, tapping, onsets: s.onsets.map((o) => toAmb(ts + o * beat)), accents: (s.accents || []).map((o) => toAmb(ts + o * beat)) });
    for (let b = 0; b < cin; b++) { snd.play('tock', { gain: 0.55, f: b === 0 ? 1250 : 940 }, t0 + b * beat); snd.chime(b === 0 ? 'Bb5' : 'F5', 0.06, t0 + b * beat); R1.stoneAt[b] = toAmb(t0 + b * beat); const sp = R1.stones[b]; atAudio(t0 + b * beat - 0.12, () => wispTo(world(sp, 0, 0.75, 0.1), 0.12, 0.05)); }
    for (let b = 0; b < total; b++) snd.play('tock', { gain: 0.14, f: 700 }, ts + b * beat);
    atAudio(ts - beat * 0.5, () => { if (tapping) { s.phase = 'tap'; say('Tap the drum (or Space) on every note!'); } });
    s.onsets.forEach((o, j) => {
      const tn = ts + o * beat, n = R1.notes[j];
      atAudio(tn - 0.1, () => wispTo(world(R1.dyn, R1.sf.X(n.su), R1.sf.Y(2) + 0.5, 0.3), 0.12, 0.08));
      // a note nobody tapped turns red once its eighth-note window has passed
      if (tapping) atAudio(tn + beat / 2 + 0.02, () => { if (s.phase === 'tap' && !s.hit[j]) { tintTo(n.g.userData.mat, C.bad); set(n.g.userData.mat, 1); } });
      if (!tapping) { snd.play('thud', { gain: 0.5, f: 170 }, tn); snd.play('slap', { gain: 0.16 }, tn); snd.pluck(TONIC(), n.d * beat + 0.2, 0.2, tn); atAudio(tn, () => { set(n.g.userData.mat, 1); R1.tapAt.push(G.t); }); atAudio(tn + n.d * beat - 0.05, () => set(n.g.userData.mat, 0)); }
    });
    atAudio(ts + total * beat + 0.35, () => { if (tapping) gradeRhythm(); else { s.phase = 'ready'; say('Your turn: choose Tap it, then tap the drum on every note.'); wispTo(restOf(st.stop), 0.5); } });
  }
  // every touch of the drum sounds and moves the sticks; only taps after the count-in are judged
  function drumHit() { R1.tapAt.push(G.t); snd.play('thud', { gain: 0.45, f: 170 }); snd.play('slap', { gain: 0.14 }); }
  function rhythmTap() {
    const s = st.sub; if (!s || s.kind !== 'rhythm') return false;
    audio(); drumHit();
    if (s.phase !== 'tap' && s.phase !== 'count') return false;
    const tt = now() - (AC.outputLatency || 0);
    if (tt < s.ts - s.beat * 0.5) return true;                       // still counting in
    const win = s.beat / 2;                                          // an eighth note early or late
    let bj = -1, be = 1e9;
    s.onsets.forEach((o, j) => { const e = tt - (s.ts + o * s.beat); if (!s.hit[j] && Math.abs(e) <= win + 1e-6 && Math.abs(e) < Math.abs(be)) { be = e; bj = j; } });
    s.taps.push(tt);
    if (bj >= 0) { if (R1.sig) R1.sig.flashAt.push(G.t); s.hit[bj] = true; const m = R1.notes[bj].g.userData.mat; tintTo(m, C.good); set(m, 1); snd.pluck(TONIC(), 0.3, 0.12); }
    else { s.extra++; say(`Extra tap (${s.extra}). Tap only where a note starts.`, 'bad'); }
    return true;
  }
  function gradeRhythm() {
    const s = st.sub, N = s.onsets.length, hits = s.hit.filter(Boolean).length, extra = s.extra;
    s.onsets.forEach((o, j) => { const m = R1.notes[j].g.userData.mat; tintTo(m, s.hit[j] ? C.good : C.bad); set(m, 1); });
    const ok = hits === N && extra === 0;
    mark(hits, N + extra); st.stopRes[st.stop] = ok; ok ? snd.right() : snd.wrong();
    s.phase = 'result';
    const wait = 1.8;
    at(wait, () => { if (st.sub === s && s.phase === 'result') finishStop(); });
    say(ok ? `In time! All ${N} notes.` : `${hits} of ${N} notes in time${extra ? `, ${extra} extra tap${extra > 1 ? 's' : ''}` : ''}.${hits < N ? ' Red notes were missed.' : ''}`, ok ? 'good' : 'bad');
    wispTo(restOf(st.stop), 0.5);
  }
  function nextRhythm() { const s = st.sub; if (!s || s.kind !== 'rhythm' || s.phase !== 'result') return; finishStop(); }

  // ---------------------------------------------------------------- 2. Fingering Trainer
  const KX = 1.38, COL = [0.7, 0.42, 0.14, -0.22, -0.5, -0.78];
  const LAYOUTS = {
    sax: () => ({ multi: true, plate: [0.46, 1.84], gems: [...[21, 20, 19, 18, 17, 16].map((b, k) => ({ bit: b, x: 0, y: COL[k], label: ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'][k] })), { bit: 3, x: -0.46, y: 0.78, label: 'Octave', small: true, lx: -0.46, ly: 0.55 }, { bit: 12, x: 0.5, y: -0.84, label: 'Low C', small: true, lx: 0.84, ly: -0.84 }] }),
    clarinet: () => ({ multi: true, plate: [0.46, 1.84], gems: [...[4, 6, 7, 13, 17, 18].map((b, k) => ({ bit: b, x: 0, y: COL[k], label: ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'][k] })),
      { bit: 3, x: -0.46, y: 0.78, label: 'Reg', small: true, lx: -0.46, ly: 0.58 }, { bit: 5, x: -0.46, y: 0.3, label: 'Thumb', small: true, lx: -0.46, ly: 0.1 },
      { bit: 1, x: 0.5, y: 0.86, label: 'A', small: true, lx: 0.72, ly: 0.86 }, { bit: 2, x: 0.5, y: 0.6, label: 'G♯', small: true, lx: 0.74, ly: 0.6 },
      { bit: 15, x: -0.46, y: -0.2, label: 'L pinky', small: true, lx: -0.5, ly: -0.42 }, { bit: 22, x: 0.5, y: -0.84, label: 'R pinky', small: true, lx: 0.86, ly: -0.84 }] }),
    flute: () => ({ multi: true, plate: [0.46, 1.84], gems: [...[12, 11, 10, 9, 8, 7].map((b, k) => ({ bit: b, x: 0, y: COL[k], label: ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'][k] })),
      { bit: 13, x: -0.46, y: 0.56, label: 'Thumb', small: true, lx: -0.46, ly: 0.34 }, { bit: 1, x: 0.5, y: 0.0, label: 'G♯', small: true, lx: 0.74, ly: 0.0 }, { bit: 6, x: 0.5, y: -0.8, label: 'E♭', small: true, lx: 0.74, ly: -0.8 }] }),
    valves: () => ({ multi: true, plate: [1.5, 1.2], gems: [...(st.inst.key === 'dhorn' ? [{ bit: 4, x: -0.55, y: 0.38, label: 'Trigger', lx: -0.12, ly: 0.38 }] : []),
      ...[1, 2, 3].map((b, k) => ({ bit: b, x: (k - 1) * 0.45, y: -0.12, big: true, label: String(k + 1), lx: (k - 1) * 0.45, ly: -0.46 }))], note: 'No gems lit means open.' }),
    slide: () => ({ multi: false, plate: [0.46, 1.84], gems: [1, 2, 3, 4, 5, 6, 7].map((p) => ({ val: 1 << p, x: 0, y: 0.78 - (p - 1) * 0.26, label: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'][p - 1], small: true, lx: 0.44, ly: 0.78 - (p - 1) * 0.26 })) }),
    bass: () => ({ multi: false, plate: [1.5, 1.84], heads: [['E', -0.5], ['A', -0.17], ['D', 0.16], ['G', 0.49]], gems: [].concat(...[1, 2, 3, 4].map((s) => [0, 1, 2, 3, 4].map((f) => ({ val: s + 4 * f, x: -0.5 + (s - 1) * 0.33, y: 0.56 - f * 0.32, small: true, label: s === 1 ? (f ? String(f) : 'Open') : '', lx: -0.86, ly: 0.56 - f * 0.32 })))) }),
    bells: () => {
      const ms = pool().map((n) => n.midi), lo = Math.min(...ms) - 2, hi = Math.max(...ms) + 3, names = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'], gems = []; let x = 0;
      for (let m = lo; m <= hi; m++) { const sharp = [1, 3, 6, 8, 10].includes(m % 12); if (!sharp) x++; gems.push({ val: m, x: sharp ? x - 0.5 : x, y: sharp ? 0.3 : -0.25, small: true, label: sharp ? '' : names[m % 12], lx: null, ly: -0.52 }); }
      const w = x + 1; gems.forEach((g) => { g.x = (g.x - w / 2) * 0.27; if (g.label) g.lx = g.x; });
      return { multi: false, plate: [w * 0.27 + 0.2, 1.4], gems };
    },
  };
  function buildKeys() {
    clear(R2.keysG); clear(R2.plText); R2.gems = [];
    text(R2.plText, st.inst.name, 0, 0, 0.065, { height: 0.27, face: CINZEL, maxW: 1.9 });
    const L = LAYOUTS[st.inst.family](); R2.layout = L;
    const kg = group(R2.keysG, KX, 0, 0);
    add(kg, K.roundedBox(L.plate[0], L.plate[1], 0.03, 0.05, 2), M.stoneDark, 0, 0, 0.012, { cast: false });
    (L.heads || []).forEach(([s, x]) => text(kg, s, x, 0.8, 0.03, { height: 0.13, face: CINZEL, color: '#ffe2a0' }));
    const GEM = (r) => { const s = new THREE.CylinderGeometry(r * 0.48, r * 0.8, 0.06, 8); s.rotateX(Math.PI / 2); return s; };
    L.gems.forEach((gd, idx) => {
      const r = gd.big ? 0.2 : gd.small ? 0.11 : 0.155;
      const k = group(kg, gd.x, gd.y, 0.05);
      add(k, cylZ(r, 0.03, 10), M.gold, 0, 0, -0.01, { cast: false });
      const pearl = glowing(C.pearl, 0.25, { rough: 0.2, tint: 0.92, facet: true }); add(k, GEM(r), pearl, 0, 0, 0.03, { cast: false });
      pickable(add(k, cylZ(r * 1.25, 0.1, 8), M.hit, 0, 0, 0.05, { cast: false }), { kind: 'gem', idx });
      if (gd.label) { const lx = gd.lx != null ? gd.lx - gd.x : r + 0.17, ly = gd.ly != null ? gd.ly - gd.y : 0, onPlate = Math.abs(gd.x + lx) < L.plate[0] / 2 - 0.04 && Math.abs(gd.y + ly) < L.plate[1] / 2 - 0.04;
        text(k, gd.label, lx, ly, 0.0, { height: gd.small || gd.big ? 0.12 : 0.13, face: CINZEL, color: onPlate ? '#ffe2a0' : C.ink }); }
      R2.gems.push({ gd, k, pearl, on: false });
    });
  }
  function setupFinger() {
    if (!st.inst.family) { clear(R2.keysG); clear(R2.noteG); clear(R2.clefG); clear(R2.plText); text(R2.plText, st.inst.name, 0, 0, 0.065, { height: 0.27, face: CINZEL, maxW: 1.9 }); skipStop(`The course data has no fingering chart for ${st.inst.name} yet, so this island is skipped.`); return; }
    buildKeys(); clear(R2.clefG); putClef(R2.sf, st.inst.clef, R2.clefG);
    st.sub = { kind: 'finger', seq: st.seqs.finger }; newFinger();
  }
  // a game's three exercises: in Chapter 1 any of the unit's notes; later, two new notes and one from earlier units
  function noteSeq(n) {
    if (!st.inst.review.length) return anySeq(n, pool());
    const f = anySeq(n - 1, freshPool()), r = shuffle(reviewPool())[0], out = shuffle(f.concat([r]));
    for (let k = 1; k < out.length; k++) if (out[k].name === out[k - 1].name) { const j = (k + 1) % out.length; [out[k], out[j]] = [out[j], out[k]]; }
    return out;
  }
  function anySeq(n, p) { let out = []; while (out.length < n) out = out.concat(shuffle(p)); out = out.slice(0, n); for (let k = 1; k < out.length; k++) if (out[k].name === out[k - 1].name) { const j = (k + 1) % out.length; [out[k], out[j]] = [out[j], out[k]]; } return out; }
  function newFinger() {
    const s = st.sub, n = s.seq[st.q]; s.n = n; s.locked = false;
    clear(R2.noteG); s.nm = writeNote(R2.noteG, R2.sf, st.inst.clef, n, 8.2, 'w');
    R2.gems.forEach((g) => { g.on = false; tintTo(g.pearl, C.lit); set(g.pearl, 0); });
    say(`Show the fingering for ${sci(n)}: touch each gem you would press${R2.layout.note ? '. ' + R2.layout.note : ''}`);
  }
  function touchGem(idx) {
    const s = st.sub; if (!s || s.kind !== 'finger' || s.locked) return;
    const L = R2.layout, g = R2.gems[idx];
    if (L.multi) g.on = !g.on; else R2.gems.forEach((o) => { o.on = o === g ? !o.on : false; });
    R2.gems.forEach((o) => set(o.pearl, o.on ? 1 : 0));
    wispTo(world(g.k, 0.16, -0.02, 0.18), 0.22, 0.08);
    snd.chime(['D6', 'F6', 'G6', 'Bb6', 'C6', 'Eb6', 'A5'][idx % 7], 0.1);
  }
  function wantSet(target) {
    const L = R2.layout, f = st.inst.family;
    if (L.multi) return R2.gems.map((g) => !!(target & (1 << g.gd.bit)));
    if (f === 'slide') return R2.gems.map((g) => g.gd.val === target);
    if (f === 'bass') { const d = target <= 0x14 ? (target - 1) % 4 + 1 + 4 * Math.floor((target - 1) / 4) : 4 + 4 * (target - 16); return R2.gems.map((g) => g.gd.val === d); }
    if (f === 'bells') { let m = null; for (let b = 0; b < 32; b++) if ((target >>> b) & 1) { m = b === 31 ? 53 : 54 + b; break; } return R2.gems.map((g) => g.gd.val === m); }
    return R2.gems.map(() => false);
  }
  function checkFinger() {
    const s = st.sub; if (!s || s.kind !== 'finger' || s.locked) return;
    s.locked = true; audio();
    const want = wantSet(st.inst.fing[s.n.midi]), ok = R2.gems.every((g, i) => g.on === want[i]);
    st.stopRes[st.stop] = ok; mark(ok ? 1 : 0);
    R2.gems.forEach((g, i) => { if (want[i]) { tintTo(g.pearl, C.good); set(g.pearl, 1); } else if (g.on) { tintTo(g.pearl, C.bad); set(g.pearl, 1); } });
    tintTo(s.nm.userData.mat, ok ? C.lit : C.bad); set(s.nm.userData.mat, ok ? 1 : 0);
    snd.horn(concert(s.n)); ok ? snd.right() : snd.wrong();
    say(ok ? 'Correct fingering!' : 'Not quite. The green gems show the fingering.', ok ? 'good' : 'bad');
    s.waitNext = true; at(ok ? 1.3 : 2.6, () => { if (st.sub === s && s.waitNext) nextFinger(); });
  }
  function nextFinger() { const s = st.sub; if (!s || !s.waitNext) return; s.waitNext = false; finishStop(); }

  // ---------------------------------------------------------------- 3. Write Notes
  const GOAL_SU = 7.4;
  // when the chapter's notes hold this name in more than one octave, say which: "low A♭", "middle E", "high A♭"
  const which = (n) => { const same = pool().filter((m) => pretty(m) === pretty(n)).map((m) => m.midi).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b); if (same.length < 2) return ''; const i = same.indexOf(n.midi); return (i === 0 ? 'low' : i === same.length - 1 ? 'high' : 'middle') + ' '; };
  function setupWrite() { clear(R3.clefG); putClef(R3.sf, st.inst.clef, R3.clefG); st.sub = { kind: 'write', seq: st.seqs.write }; newWrite(); }
  function newWrite() {
    const s = st.sub, n = s.seq[st.q]; s.n = n; s.p = null; s.acc = 0; s.tries = 0; s.locked = false; s.drag = null;
    const w = which(n); clear(R3.askG); text(R3.askG, w + pretty(n), -1.245, 0.18, 0.004, { height: w ? 0.4 : 0.56, face: CINZEL_B, color: C.ember, maxW: 2.0 });
    R3.seals.forEach((sg) => { tintTo(sg.userData.mat, '#ffd27a'); set(sg.userData.mat, 0); }); R3.qPath = null; R3.ring = null; R3.inkAt = -1; R3.stampAt = -1;
    drawWritten(); say(`Write ${sci(n)}: drag the whole note from its tray onto the staff, and the quill writes it. Use a signet ring to stamp a flat or sharp.`);
  }
  function drawWritten(colour) {
    const s = st.sub, sf = R3.sf; clear(R3.noteG); clear(R3.accG);
    const mat = inkLit(); if (colour) { tintTo(mat, colour); set(mat, 1); }
    R3.crisp = R3.dots = null;
    if (s.drag && s.drag.free) note(R3.noteG, 'w', 0, s.drag.x, s.drag.y, mat);              // carried in the hand
    else if (s.p == null) note(R3.noteG, 'w', 0, R3.home.x, R3.home.y, mat);                  // waiting in its tray
    else if (s.drag) {                                                                          // over the staff: a faint guide where the quill will write
      const gm = inkLit(); gm.transparent = true; gm.opacity = 0.3; gm.depthWrite = false;
      for (let l = -1; l >= s.p - 0.01; l--) sf.put('ledger', GOAL_SU, l, gm, R3.noteG);
      for (let l = 5; l <= s.p + 0.01; l++) sf.put('ledger', GOAL_SU, l, gm, R3.noteG);
      note(R3.noteG, 'w', 0, sf.X(GOAL_SU), sf.Y(s.p), gm);
    } else {
      // written: the finished note, and the ink dots the quill lays down along the way (realm-game shows one or the other)
      const crisp = group(R3.noteG), dots = group(R3.noteG);
      for (let l = -1; l >= s.p - 0.01; l--) { sf.put('ledger', GOAL_SU, l, mat, crisp); sf.put('ledger', GOAL_SU, l, mat, dots); }
      for (let l = 5; l <= s.p + 0.01; l++) { sf.put('ledger', GOAL_SU, l, mat, crisp); sf.put('ledger', GOAL_SU, l, mat, dots); }
      dots.children.forEach((c) => { c.userData.u = 0; });
      note(crisp, 'w', 0, sf.X(GOAL_SU), sf.Y(s.p), mat);
      const x = sf.X(GOAL_SU), y = sf.Y(s.p), N = 34;
      for (let k = 0; k < N; k++) { const a = Math.PI + (k / N) * Math.PI * 2, r = U * (0.11 + 0.09 * Math.abs(Math.cos(a - 0.4))), d = add(dots, DOT, mat, x + Math.cos(a) * 0.62 * U, y + Math.sin(a) * 0.34 * U, 0.014, { cast: false }); d.scale.set(r, r, r * 0.4); d.userData.u = (k + 1) / N; }
      R3.crisp = crisp; R3.dots = dots;
    }
    if (s.acc) { const p = s.p == null ? null : s.p; if (p != null && !(s.drag && s.drag.free)) sf.put(s.acc < 0 ? 'flat' : 'sharp', GOAL_SU - 1.45, p, mat, R3.accG); }
  }
  const DOT = new THREE.SphereGeometry(1, 8, 6);
  // the quill writes a placed note: out of the inkwell, over to the staff, a trace round the note's oval, and back to the well
  const WRITE_IN = 0.4, WRITE_DUR = 0.8;
  function quillWrite() {
    const s = st.sub, sf = R3.sf, x = sf.X(GOAL_SU), y = sf.Y(s.p), t0 = G.t, rx = 0.62 * U, ry = 0.34 * U;
    const keys = [[t0, R3.rest.toArray()], [t0 + WRITE_IN, [x - rx, y + 0.02, 0.06], 'out']];
    for (let k = 1; k <= 16; k++) { const a = Math.PI + (k / 16) * Math.PI * 2; keys.push([t0 + WRITE_IN + WRITE_DUR * k / 16, [x + Math.cos(a) * rx, y + Math.sin(a) * ry, 0.02], 'linear']); }
    keys.push([t0 + WRITE_IN + WRITE_DUR + 0.18, [x + 0.25, y + 0.3, 0.3], 'out'], [t0 + WRITE_IN + WRITE_DUR + 0.7, R3.rest.toArray(), 'inOut']);
    R3.qPath = keys; R3.inkAt = t0 + WRITE_IN; R3.inkDur = WRITE_DUR;
    if (kit) for (let j = 0; j < 7; j++) kit.noise(now() + WRITE_IN + j * WRITE_DUR / 7, { dur: 0.08, filter: 'bandpass', f: 2400 + (j % 3) * 400, q: 2.5, gain: 0.045 });
    // a flat or sharp already chosen is stamped once the note is written
    if (s.acc) { const acc = s.acc; R3.stampAt = 1e9; at(WRITE_IN + WRITE_DUR + 0.25, () => { if (st.sub === s && s.acc === acc && s.p != null) ringStamp(acc); }); }
  }
  // a signet ring stamps its sign beside the note
  function ringStamp(acc) {
    const s = st.sub, sg = R3.seals.find((g) => g.userData.acc === acc); if (!sg || s.p == null) return;
    R3.ring = { sg, t0: G.t, to: [R3.sf.X(GOAL_SU - 1.45), R3.sf.Y(s.p)] }; R3.stampAt = G.t + 0.55;
    snd.play('swish', { gain: 0.2, dur: 0.25 }); snd.play('stamp', { gain: 0.32 }, now() + 0.55);
  }
  const facePoint = (ray) => {
    const f = R3.face; f.updateWorldMatrix(true, false);
    const nrm = new THREE.Vector3(0, 0, 1).transformDirection(f.matrixWorld), o = new THREE.Vector3().setFromMatrixPosition(f.matrixWorld);
    const pl = new THREE.Plane().setFromNormalAndCoplanarPoint(nrm, o), hit = new THREE.Vector3();
    return ray.intersectPlane(pl, hit) ? f.worldToLocal(hit) : null;
  };
  const snapP = (y) => K.clamp(Math.round((y - R3.sf.y0) / U * 2) / 2, -3, 7);
  function writeAt(lp, drop) {
    const s = st.sub; if (!lp) return;
    if (lp.x > 0.15 && lp.x < 2.45 && lp.y > -1.1 && lp.y < 1.1) { const p = snapP(lp.y); if (s.drag) s.drag.free = false; if (p !== s.p) { s.p = p; snd.play('tick', { gain: 0.15, f: 2600 }); } }
    else if (s.drag && !drop) { s.drag.free = true; s.drag.x = lp.x; s.drag.y = lp.y; }
    else if (drop) { s.p = null; }
    if (drop && !s.drag && s.p != null) quillWrite();
    drawWritten();
  }
  function setSeal(acc) {
    const s = st.sub; if (!s || s.kind !== 'write' || s.locked) return;
    s.acc = s.acc === acc ? 0 : acc;
    R3.seals.forEach((sg) => set(sg.userData.mat, sg.userData.acc === s.acc ? 1 : 0));
    if (s.acc && s.p != null) {
      const left = R3.inkAt >= 0 ? R3.inkAt + R3.inkDur - G.t : 0, acc = s.acc;
      if (left <= 0) ringStamp(acc); else { R3.stampAt = 1e9; at(left + 0.25, () => { if (st.sub === s && s.acc === acc && s.p != null) ringStamp(acc); }); }   // the quill is still writing
    }
    if (!s.acc) R3.stampAt = -1;
    drawWritten();
  }
  function checkWrite() {
    const s = st.sub; if (!s || s.kind !== 'write' || s.locked) return;
    if (s.p == null) { say('First drag the note onto the staff.'); return; }
    audio();
    const n = s.n, ok = s.p === pOf(n, st.inst.clef) && s.acc === n.acc;
    if (ok) {
      s.locked = true; st.stopRes[st.stop] = !s.tries; mark(s.tries ? 0 : 1); snd.pluck(concert(n), 0.6, 0.2); snd.right(); drawWritten(C.good);
      say(s.tries ? 'That is it, on the second try.' : 'Correct!', 'good'); at(1.3, nextWrite);
    } else if (!s.tries) {
      s.tries = 1; snd.wrong();
      const wrongSpot = s.p !== pOf(n, st.inst.clef), here = fromStep(Math.round(s.p * 2) + BOTTOM[st.inst.clef]);
      say(wrongSpot ? (here.letter === n.letter ? `Right letter, but that is a different ${n.letter}: write the ${which(n) || 'asked '}one. Try once more.` : `Not quite: that spot is ${here.letter}. Try once more.`) : `Right spot. ${pretty(n)} needs ${n.acc ? (n.acc < 0 ? 'a flat' : 'a sharp') : 'no flat or sharp'}.`, 'bad');
    } else {
      s.locked = true; st.stopRes[st.stop] = false; mark(0); snd.wrong(); snd.pluck(concert(n), 0.6, 0.16, now() + 0.45); s.p = pOf(n, st.inst.clef); s.acc = n.acc; quillWrite(); drawWritten(C.good);
      R3.seals.forEach((sg) => set(sg.userData.mat, sg.userData.acc === s.acc ? 1 : 0));
      say(`Here is ${sci(n)}.`, 'bad'); at(n.acc ? 3.0 : 2.2, nextWrite);
    }
  }
  function nextWrite() { finishStop(); }

  // ---------------------------------------------------------------- 4. Read Notes
  function setupRead() {
    clear(R4.clefG); putClef(R4.sf, st.inst.clef, R4.clefG, R4.gilt);
    st.sub = { kind: 'read', seq: st.seqs.read, choices: [] }; newRead();
  }
  function newRead() {
    const s = st.sub, n = s.seq[st.q]; s.n = n; s.locked = false; s.t0 = G.t;
    // two other choices, each with a different name from the answer and from each other (the shields show names, not octaves)
    const others = []; for (const m of shuffle(pool())) { if (others.length === 2) break; if (pretty(m) !== pretty(n) && !others.some((o) => pretty(o) === pretty(m))) others.push(m); }
    const ch = [n].concat(others).sort((a, b) => a.midi - b.midi); s.choices = ch;
    R4.shields.forEach((q, k) => { clear(q.userData.labelG); q.visible = k < ch.length; if (ch[k]) text(q.userData.labelG, pretty(ch[k]), 0, 0.02, 0.012, { height: 0.42, face: CINZEL_B, maxW: 0.5 }); });
    clear(R4.noteG);
    s.nm = writeNote(R4.noteG, R4.sf, st.inst.clef, n, 7.6, 'q', glowing('#8a6a2a', 2.4, { rough: 0.4, rest: 1.25, restGlow: '#ffd88a', glow: C.lit, to: C.lit, tint: 1 }));
    R4.shields.forEach((q) => { tintTo(q.userData.mat, '#e05200'); set(q.userData.mat, 0); });
    say(R4.shieldWord ? `Which note is it? Strike its ${R4.shieldWord} (or press 1, 2 or 3).` : 'Which note is it? Click its name (or press 1, 2 or 3).');
  }
  function strike(k) {
    const s = st.sub; if (!s || s.kind !== 'read' || s.locked || !s.choices[k]) return;
    s.locked = true; audio();
    const q = R4.shields[k], ok = s.choices[k].name === s.n.name, ci = s.choices.findIndex((c) => c.name === s.n.name);
    wispTo(world(q, 0, 0.1, 0.15), 0.25, 0.25); q.userData.hitAt = G.t + 0.22;
    at(0.22, () => {
      snd.play('thud', { gain: 0.6, f: 140 }); kit && kit.tone(now(), { f: 1180, dur: 0.5, gain: 0.07, a: 0.001, verb: 0.4 }); snd.pluck(concert(s.n), 0.6, 0.2);
      if (ok) { tintTo(q.userData.mat, C.good); set(q.userData.mat, 1); set(s.nm.userData.mat, 1); }
      else { tintTo(q.userData.mat, C.bad); set(q.userData.mat, 1); const cq = R4.shields[ci]; tintTo(cq.userData.mat, C.good); set(cq.userData.mat, 1); }
      st.stopRes[st.stop] = ok; mark(ok ? 1 : 0); ok ? snd.right() : snd.wrong();
      say(ok ? `Yes, ${sci(s.n)}.` : `That note is ${sci(s.n)}.`, ok ? 'good' : 'bad');
      at(ok ? 1.0 : 1.8, () => { wispTo(restOf(st.stop), 0.4); finishStop(); });
    });
  }

  // ---------------------------------------------------------------- 5. Terms & Symbols
  function termScene(term) {
    const dyn = R5.dyn, sf = R5.sf, ink = M.ink; clear(dyn);
    const hl = inkLit(); R5.hlMats = [hl];
    const N = (n) => parseNote(n);
    const clefOf = term === 'Bass clef' ? 'bass' : 'treble';
    if (term !== 'Treble clef' && term !== 'Bass clef') putClef(sf, 'treble', dyn, ink);
    const LIT = (o) => Object.assign({ color: '#d9560a', glow: 0.9 }, o);
    const ctxNotes = (list) => list.forEach(([n, su, kind]) => writeNote(dyn, sf, 'treble', N(n), su, kind, ink));
    switch (term) {
      case 'Treble clef': putClef(sf, 'treble', dyn, hl); ctxNotes([['G4', 9, 'q'], ['B4', 12.5, 'h'], ['D5', 16, 'h']]); break;
      case 'Bass clef': putClef(sf, 'bass', dyn, hl); [['D3', 9, 'q'], ['F3', 12.5, 'h'], ['A3', 16, 'h']].forEach(([n, su, k]) => writeNote(dyn, sf, 'bass', N(n), su, k, ink)); break;
      case 'Staff': for (let k = 0; k < 5; k++) add(dyn, box(4.3, 0.035, 0.012, 2.15, 0, 0.008), hl, sf.x0, sf.y0 + k * U, 0, { cast: false }); break;
      case 'Bar line': ctxNotes([['G4', 7, 'h'], ['B4', 10.2, 'h'], ['A4', 16, 'w']]); sf.put('barline', 13, 0, hl, dyn); break;
      case 'Double bar line': ctxNotes([['G4', 8, 'h'], ['B4', 12, 'h'], ['G4', 16, 'h']]); sf.put('barline', 19.9, 0, hl, dyn); sf.put('thick', 20.6, 0, hl, dyn); break;
      case 'Measure': { sf.put('barline', 6.5, 0, ink, dyn); sf.put('barline', 16.5, 0, ink, dyn); ctxNotes([['G4', 9.2, 'h'], ['B4', 13.6, 'h']]);
        const m = glowing(C.lit, 0.6, { rest: 0.2, glow: C.lit, to: C.lit, tint: 1 }); m.transparent = true; m.opacity = 0.35; m.depthWrite = false; R5.hlMats.push(m); add(dyn, box(10 * U, 4 * U + 0.14, 0.004), m, sf.X(11.5), sf.Y(2), 0.001, { cast: false }); R5.hlMats.shift(); break; }
      case 'Repeat sign': ctxNotes([['G4', 8, 'h'], ['B4', 12, 'h'], ['D5', 15.5, 'q']]); sf.put('dots', 18.9, 0, hl, dyn); sf.put('barline', 19.7, 0, hl, dyn); sf.put('thick', 20.4, 0, hl, dyn); break;
      case 'Time signature': sf.put('four', 3.8, 2, hl, dyn); sf.put('four', 3.8, 0, hl, dyn); ctxNotes([['G4', 9, 'h'], ['B4', 13, 'h']]); sf.put('barline', 17, 0, ink, dyn); break;
      case 'Whole note': writeNote(dyn, sf, 'treble', N('G4'), 11.5, 'w', hl); break;
      case 'Half note': writeNote(dyn, sf, 'treble', N('G4'), 11.5, 'h', hl); break;
      case 'Quarter note': writeNote(dyn, sf, 'treble', N('G4'), 11.5, 'q', hl); break;
      case 'Whole rest': sf.put('wholeRest', 11.5, 0, hl, dyn); break;
      case 'Half rest': sf.put('halfRest', 11.5, 0, hl, dyn); break;
      case 'Quarter rest': ctxNotes([['G4', 7.5, 'q'], ['A4', 15.5, 'q']]); sf.put('rest', 11.5, 0, hl, dyn); break;
      case 'Sharp': writeNote(dyn, sf, 'treble', N('F4'), 12.5, 'w', ink); sf.put('sharp', 11.05, pOf(N('F4'), 'treble'), hl, dyn); break;
      case 'Flat': writeNote(dyn, sf, 'treble', N('B4'), 12.5, 'w', ink); sf.put('flat', 11.05, pOf(N('B4'), 'treble'), hl, dyn); break;
      case 'Natural': writeNote(dyn, sf, 'treble', N('A4'), 12.5, 'w', ink); sf.put('natural', 11.05, pOf(N('A4'), 'treble'), hl, dyn); break;
      case 'Breath mark': ctxNotes([['G4', 8, 'h'], ['B4', 13.5, 'h']]); sf.put('breath', 10.9, 5.5, hl, dyn); break;
      case 'Fermata': ctxNotes([['G4', 7.5, 'q'], ['A4', 9.6, 'q']]); writeNote(dyn, sf, 'treble', N('B4'), 13, 'w', ink); sf.put('fermata', 13, 5.6, hl, dyn); sf.put('thick', 17.2, 0, ink, dyn); sf.put('barline', 16.6, 0, ink, dyn); break;
      case 'Pick-up note': sf.put('four', 4.4, 2, ink, dyn); sf.put('four', 4.4, 0, ink, dyn); writeNote(dyn, sf, 'treble', N('D5'), 7.2, 'q', hl); sf.put('barline', 9.2, 0, ink, dyn); ctxNotes([['G4', 11.2, 'h'], ['B4', 15, 'h']]); sf.put('barline', 18.6, 0, ink, dyn); break;
      case 'Forte': case 'Mezzo forte': case 'Piano': ctxNotes([['G4', 8, 'h'], ['B4', 12, 'h'], ['D5', 16, 'h']]); text(dyn, { Forte: 'f', 'Mezzo forte': 'mf', Piano: 'p' }[term], sf.X(7.6), sf.Y(-1.1), 0.004, LIT({ height: 0.3, face: 'italic 700 {px}px "Alegreya"' })); break;
      case 'Eighth note': { ctxNotes([['G4', 7.5, 'q'], ['A4', 15.5, 'q']]); const e = writeNote(dyn, sf, 'treble', N('C5'), 11.5, 'q', hl); add(e, gly('flagDown')[0], hl, 0, 0, 0, { cast: false }); break; }
      case 'Beam': { ctxNotes([['G4', 7.5, 'q']]); const a = writeNote(dyn, sf, 'treble', N('B4'), 10.5, 'q', ink), b = writeNote(dyn, sf, 'treble', N('B4'), 12.3, 'q', ink); void b; add(a, box(1.93, 0.5, 0.12), hl, -0.57 - 0.065 + 0.965, -3.15, 0, { cast: false }); ctxNotes([['A4', 15.5, 'h']]); break; }
      case 'Allegro': case 'Moderato': case 'Andante': ctxNotes([['G4', 8.5, 'q'], ['B4', 11, 'q'], ['D5', 13.5, 'q'], ['B4', 16, 'q']]); text(dyn, term, sf.X(9.5), sf.Y(6.6), 0.004, LIT({ height: 0.24, face: '700 {px}px "Alegreya"' })); break;
      case 'Crescendo': case 'Diminuendo': ctxNotes([['G4', 8, 'q'], ['A4', 10.6, 'q'], ['B4', 13.2, 'q'], ['C5', 15.8, 'q']]); hairpin(sf, 7.6, 16.4, -1.3, term === 'Crescendo', hl, dyn); break;
      case 'Measure number': sf.put('barline', 10, 0, ink, dyn); ctxNotes([['G4', 7.8, 'q'], ['B4', 12.2, 'h'], ['D5', 15.8, 'h']]); sf.put('barline', 18.4, 0, ink, dyn); text(dyn, '5', sf.X(10.4), sf.Y(5.6), 0.004, LIT({ height: 0.2, face: '700 {px}px "Alegreya"' })); break;
      case 'Tie': ctxNotes([['G4', 9, 'h'], ['G4', 14.5, 'h']]); sf.put('barline', 11.8, 0, ink, dyn); arcOn(sf, 9.6, 13.9, 0.15, -1, hl, dyn); break;
      case 'Slur': ctxNotes([['G4', 8, 'q'], ['B4', 10.6, 'q'], ['D5', 13.2, 'q']]); arcOn(sf, 7.8, 13.4, 5.2, 1, hl, dyn); ctxNotes([['B4', 16, 'q']]); break;
      case 'Dotted half note': { ctxNotes([['B4', 15.8, 'q']]); const e = writeNote(dyn, sf, 'treble', N('G4'), 10.5, 'h', hl); add(e, gly('dot')[0], hl, 1.15, 0.5, 0, { cast: false }); break; }
      case 'Dotted quarter note': { const e = writeNote(dyn, sf, 'treble', N('A4'), 10.5, 'q', hl); add(e, gly('dot')[0], hl, 1.15, 0.0, 0, { cast: false }); const f = writeNote(dyn, sf, 'treble', N('B4'), 13.2, 'q', ink); add(f, gly('flagDown')[0], ink, 0, 0, 0, { cast: false }); ctxNotes([['G4', 16, 'q']]); break; }
      case 'Accent': ctxNotes([['G4', 8, 'q'], ['D5', 15.5, 'q']]); writeNote(dyn, sf, 'treble', N('B4'), 11.8, 'q', ink); sf.put('accent', 11.8, 5.0, hl, dyn); break;
      case 'First ending': case 'Second ending': {
        sf.put('barline', 6.2, 0, ink, dyn); ctxNotes([['G4', 8.4, 'h'], ['B4', 14.6, 'h']]); sf.put('dots', 11.4, 0, ink, dyn); sf.put('barline', 12.1, 0, ink, dyn); sf.put('thick', 12.7, 0, ink, dyn); sf.put('thick', 19.6, 0, ink, dyn); sf.put('barline', 19.0, 0, ink, dyn);
        [[6.4, 12.4, '1.'], [13.0, 18.6, '2.']].forEach(([a, b, l], k) => { const m = (k === 0) === (term === 'First ending') ? hl : ink; add(dyn, box((b - a) * U, 0.025, 0.01), m, sf.X((a + b) / 2), sf.Y(6.6), 0.004, { cast: false }); add(dyn, box(0.025, 1.2 * U, 0.01), m, sf.X(a), sf.Y(6.0), 0.004, { cast: false }); text(dyn, l, sf.X(a + 0.9), sf.Y(5.95), 0.004, m === hl ? LIT({ height: 0.18 }) : { height: 0.18 }); });
        break; }
      case 'D.C. al Fine': ctxNotes([['G4', 6.5, 'h'], ['B4', 12.5, 'h']]); sf.put('barline', 9.8, 0, ink, dyn); text(dyn, 'Fine', sf.X(9.4), sf.Y(-1.15), 0.004, { height: 0.17, face: 'italic 700 {px}px "Alegreya"' }); sf.put('barline', 16.4, 0, ink, dyn); sf.put('thick', 17.0, 0, ink, dyn); text(dyn, 'D.C. al Fine', sf.X(15.2), sf.Y(-1.15), 0.004, LIT({ height: 0.2, face: 'italic 700 {px}px "Alegreya"' })); break;
      case 'Eighth rest': ctxNotes([['G4', 7.5, 'q'], ['A4', 15.5, 'q']]); sf.put('eighthRest', 11.5, 0, hl, dyn); break;
      case 'Key signature': sf.put('flat', 4.7, 2, hl, dyn); sf.put('flat', 5.8, 3.5, hl, dyn); sf.put('four', 7.9, 2, ink, dyn); sf.put('four', 7.9, 0, ink, dyn); ctxNotes([['G4', 10.5, 'h'], ['D5', 14, 'h']]); sf.put('barline', 17.5, 0, ink, dyn); break;
      case 'Ledger line': note(dyn, 'w', 0, sf.X(11.5), sf.Y(-1), ink); sf.put('ledger', 11.5, -1, hl, dyn); break;
    }
  }
  // what the course's cards say each term means
  const MEANING = { Fermata: 'pause', 'Breath mark': 'take a breath', Forte: 'loud and strong', 'Mezzo forte': 'moderately loud', Piano: 'soft and quiet', Allegro: 'fast and bright', Moderato: 'moderate speed', Andante: 'moderately slow',
    Crescendo: 'gradually louder', Diminuendo: 'gradually softer', 'D.C. al Fine': 'repeat from the beginning until Fine', Accent: 'play the note stronger', Slur: 'play the notes smoothly', Tie: 'hold for both notes' };
  // a card's words: one line, or two when the term is long (so "Dotted quarter note" stays readable)
  function setLabel(tb, str) {
    const old = tb.userData.label; tb.remove(old); old.traverse((o) => { if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); o.geometry.dispose(); } });
    const g = new THREE.Group(), maxW = tb.userData.w - 0.12; tb.add(g); tb.userData.label = g;
    if (str.length > 16 && str.includes(' ')) {
      const sp = [...str].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i > 0).sort((a, b) => Math.abs(a - str.length / 2) - Math.abs(b - str.length / 2))[0];
      text(g, str.slice(0, sp), 0, 0.058, 0.026, { height: 0.13, maxW }); text(g, str.slice(sp + 1), 0, -0.068, 0.026, { height: 0.13, maxW });
    } else text(g, str, 0, -0.005, 0.026, { height: 0.172, maxW });
  }
  function setupTerms() { st.sub = { kind: 'terms', order: st.seqs.terms }; newTerm(); }
  function newTerm() {
    const s = st.sub, ti = s.order[st.q]; s.ti = ti; s.locked = false; s.t0 = G.t;
    termScene(TERMS[ti]); sig('onTerm', TERMS[ti]);
    const tp = termPool(), all = tp.fresh.concat(tp.review);
    s.opts = shuffle([ti, ...shuffle(all.filter((j) => j !== ti)).slice(0, tiles.length - 1)]);
    // fewer terms than cards: the spare cards stay hidden (they come back for the ending)
    tiles.forEach((tb, k) => { tb.visible = k < s.opts.length; setLabel(tb, k < s.opts.length ? TERMS[s.opts[k]] : ''); tintTo(tb.userData.mat, C.lit); set(tb.userData.mat, 0); });
    say(`Name the glowing symbol (keys 1 to ${s.opts.length}).`);
  }
  function pickCard(k) {
    const s = st.sub; if (!s || s.kind !== 'terms' || s.locked || k >= s.opts.length) return;
    s.locked = true; audio();
    const ok = s.opts[k] === s.ti;
    { const tb = tiles[k]; tb.userData.hitAt = G.t; wispTo(world(tb, 0.42, 0.05, 0.12), 0.25, 0.15); tintTo(tb.userData.mat, ok ? C.good : C.bad); set(tb.userData.mat, 1); snd.play('tock', { gain: 0.5, f: 760 }); }
    const ck = s.opts.indexOf(s.ti); if (!ok) { tintTo(tiles[ck].userData.mat, C.good); set(tiles[ck].userData.mat, 1); }
    st.stopRes[st.stop] = ok; mark(ok ? 1 : 0); ok ? (snd.chime('F6', 0.13), snd.right()) : snd.wrong();
    const mean = MEANING[TERMS[s.ti]] ? ` (${MEANING[TERMS[s.ti]]})` : '';
    say(ok ? `Correct: ${TERMS[s.ti]}${mean}.` : `The answer is ${TERMS[s.ti]}${mean}.`, ok ? 'good' : 'bad');
    at(ok ? 1.1 : 2.0, () => { if (st.stop === NS - 1) R5.hlMats = []; finishStop(); });
  }

  // ---------------------------------------------------------------- 6. Key Signatures (Units 7-12): name the key the signature shows
  const KEYSIGS = { C: [], G: [['F', 1]], D: [['F', 1], ['C', 1]], F: [['B', -1]] };
  const KEYPOS = { treble: { F: 4, C: 2.5, B: 2 }, bass: { F: 3, C: 1.5, B: 1 } };
  const KEYWHY = { C: 'No sharps or flats is C major.', G: 'One sharp, F♯, is G major.', D: 'Two sharps, F♯ and C♯, is D major.', F: 'One flat, B♭, is F major.' };
  const TONICW = { treble: { C: 'C5', G: 'G4', D: 'D5', F: 'F4' }, bass: { C: 'C3', G: 'G2', D: 'D3', F: 'F2' } };
  // three keys, never the same one twice in a row
  function keySeq() { if (!CH.keys) return []; const out = []; while (out.length < 3) { const c = CH.keys.filter((x) => x !== out[out.length - 1]); out.push(c[Math.floor(Math.random() * c.length)]); } return out; }
  function setupKeys() { st.sub = { kind: 'keys', seq: st.seqs.keys }; newKey(); }
  function newKey() {
    const s = st.sub, key = s.seq[st.q], clef = st.inst.clef; s.key = key; s.locked = false; s.opts = CH.keys.slice();
    clear(R6.dyn); putClef(R6.sf, clef, R6.dyn); set(R6.panelM, 0);
    const hl = inkLit(); KEYSIGS[key].forEach(([L, a], i) => R6.sf.put(a < 0 ? 'flat' : 'sharp', 4.5 + i * 1.1, KEYPOS[clef][L], hl, R6.dyn));
    R6.sf.put('four', 7.6, 2, M.ink, R6.dyn); R6.sf.put('four', 7.6, 0, M.ink, R6.dyn); R6.sf.put('barline', 21.2, 0, M.ink, R6.dyn);
    const n = s.opts.length;
    R6.keys.forEach((kg, k) => { const u = kg.userData; kg.visible = k < n; kg.position.x = (k - (n - 1) / 2) * 1.18; clear(u.labelG); u.turnAt = -9; tintTo(u.tagMat, C.lit); set(u.tagMat, 0); if (k < n) text(u.labelG, `${s.opts[k]} major`, 0, 0, 0.0, { height: 0.15, face: CINZEL, maxW: 0.86 }); });
    say(`Which key does this signature show? Click its key (or press 1 to ${n}).`);
  }
  function pickKey(k) {
    const s = st.sub; if (!s || s.kind !== 'keys' || s.locked || k >= s.opts.length) return;
    s.locked = true; audio();
    const ok = s.opts[k] === s.key, u = R6.keys[k].userData; u.hitAt = G.t; wispTo(world(R6.keys[k], 0, -0.7, 0.25), 0.25, 0.15);
    snd.play('tock', { gain: 0.5, f: 520 }); tintTo(u.tagMat, ok ? C.good : C.bad); set(u.tagMat, 1);
    if (ok) {
      u.turnAt = G.t + 0.15; tintTo(R6.panelM, C.good); snd.play('click', { gain: 0.6 }, now() + 0.4);
      at(0.6, () => { set(R6.panelM, 0.6); const t = parseNote(TONICW[st.inst.clef][s.key]); [0, 2, 4].forEach((d, i) => snd.chime(concert({ midi: t.midi + d }), 0.15, now() + i * 0.24)); });
    } else { const cu = R6.keys[s.opts.indexOf(s.key)].userData; tintTo(cu.tagMat, C.good); set(cu.tagMat, 1); }
    st.stopRes[st.stop] = ok; mark(ok ? 1 : 0); ok ? snd.right() : snd.wrong();
    say(ok ? `Yes! ${KEYWHY[s.key]}` : `That signature is ${s.key} major. ${KEYWHY[s.key]}`, ok ? 'good' : 'bad');
    at(ok ? 1.8 : 2.6, () => finishStop());
  }

  // ---------------------------------------------------------------- per frame
  function frame(t) {
    G.t = t; ambient();
    for (let i = 0; i < st.events.length; i++) { const e = st.events[i]; if (t >= e.t) { st.events.splice(i--, 1); e.fn(); } }
    if (st.fly) {
      const f = st.fly, k = f.keys, e = t - f.t0; let j = 1; while (j < k.length - 1 && e > k[j][0]) j++;
      G.tau = K.lerp(k[j - 1][1], k[j][1], K.clamp((e - k[j - 1][0]) / (k[j][0] - k[j - 1][0])));
      if (e >= k[k.length - 1][0]) { st.fly = null; f.then && f.then(); }
    }
    if (G.mode === 'finale') { G.endTau = Math.min(T.end, T.lift + (t - st.endStart)); if (G.endTau >= T.end - 1.2) { G.mode = 'summary'; st.sumAt = t; saveBest(); } }
    if (G.mode === 'summary') { G.endTau = T.end; G.summaryFade = K.seg(t, st.sumAt, st.sumAt + 0.8); }
    const s = st.sub;
    // the wisp drifts back to its resting place when nothing has happened for a while
    if (G.mode === 'play' && WS.free && t > WS.t0 + WS.dur + 2.5 && !(s && s.kind === 'rhythm' && s.phase !== 'ready' && s.phase !== 'result')) wispTo(restOf(st.stop), 0.6, 0.15);
  }

  // ---------------------------------------------------------------- input
  const ray = new THREE.Raycaster();
  function pickAt(ndc) { ray.setFromCamera(ndc, S.camera); const hit = ray.intersectObjects(picks, false).find((h) => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return true; }); return hit ? hit.object.userData.pick : null; }
  function hitBtn(px, py) { for (let i = st.btns.length - 1; i >= 0; i--) { const b = st.btns[i]; if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return i; } return -1; }
  function pointer(type, px, py, ndc) {
    const s = st.sub;
    if (type === 'move') {
      if (s && s.kind === 'write' && s.drag) { ray.setFromCamera(ndc, S.camera); writeAt(facePoint(ray.ray), false); return true; }
      st.hover = hitBtn(px, py); if (st.hover >= 0) return true;
      return G.mode === 'play' && !!pickAt(ndc);
    }
    if (type === 'up') {
      if (s && s.kind === 'write' && s.drag) { ray.setFromCamera(ndc, S.camera); writeAt(facePoint(ray.ray), true); s.drag = null; if (s.p != null) quillWrite(); drawWritten(); }
      return;
    }
    // down
    audio();
    const bi = hitBtn(px, py); if (bi >= 0) { const b = st.btns[bi]; if (!b.off) { snd.play('click', { gain: 0.5, f: 1397 }); b.fn(); } return; }
    if (G.mode === 'summit') { keydown({ key: 'Enter', preventDefault() {} }); return; }
    if (G.mode !== 'play' || !s) return;
    if (s.kind === 'rhythm' && (s.phase === 'tap' || s.phase === 'count')) { rhythmTap(); return; }  // anywhere counts as the drum
    const p = pickAt(ndc); if (!p) return;
    if (p.kind === 'drum' && s.kind === 'rhythm') { rhythmTap(); if (s.phase === 'ready') say('That is the drum. Press Tap it (or the Count in sign) to start, then tap on every note.'); }
    else if (p.kind === 'countin' && s.kind === 'rhythm') { if (s.phase === 'ready') runRhythm(true); }
    else if (p.kind === 'scroll' && s.kind === 'rhythm') { if (s.phase === 'ready') runRhythm(false); }
    else if (p.kind === 'gem') touchGem(p.idx);
    else if (p.kind === 'tray' && s.kind === 'write' && !s.locked) { s.drag = { free: true, x: R3.home.x, y: R3.home.y }; s.p = null; drawWritten(); snd.play('paper', { gain: 0.6, dur: 0.2 }); }
    else if (p.kind === 'page' && s.kind === 'write' && !s.locked) { ray.setFromCamera(ndc, S.camera); writeAt(facePoint(ray.ray), true); }
    else if (p.kind === 'seal') setSeal(p.acc);
    else if (p.kind === 'shield') strike(p.k);
    else if (p.kind === 'card') pickCard(p.k);
    else if (p.kind === 'key') pickKey(p.k);
  }
  function keydown(e) {
    const s = st.sub, k = e.key;
    if (G.mode === 'title' && (k === 'Enter' || k === ' ')) { e.preventDefault(); begin(); return; }
    if (G.mode === 'summit' && (k === 'Enter' || k === ' ' || k === 'Escape')) { e.preventDefault(); G.summitAt = Math.min(G.summitAt, G.t - R1.sig.summit.dur * 0.88); st.events = st.events.filter((ev) => ev.fn !== endSummit); at(R1.sig.summit.dur * 0.12 + 0.05, endSummit); return; }
    if (G.mode !== 'play' || !s) return;
    if (s.kind === 'rhythm') {
      if (k === ' ' || e.code === 'Space') { e.preventDefault(); if (s.phase === 'ready') runRhythm(true); else rhythmTap(); }
      else if (k === 'Enter' && s.phase === 'result') { e.preventDefault(); nextRhythm(); }
      else if (k === 'l' || k === 'L') runRhythm(false);
    } else if (s.kind === 'finger') { if (k === 'Enter') { e.preventDefault(); s.waitNext ? nextFinger() : checkFinger(); } else if (/^[1-9]$/.test(k) && R2.gems[+k - 1]) touchGem(+k - 1); }
    else if (s.kind === 'write') {
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); if (s.locked) return; s.p = s.p == null ? 2 : K.clamp(s.p + (k === 'ArrowUp' ? 0.5 : -0.5), -3, 7); quillWrite(); drawWritten(); }
      else if (k === 'Enter') { e.preventDefault(); checkWrite(); } else if (k === 'b') setSeal(-1); else if (k === '#' || k === 's') setSeal(1);
    }
    else if (s.kind === 'read' && /^[1-3]$/.test(k)) strike(+k - 1);
    else if (s.kind === 'terms' && /^[1-8]$/.test(k)) pickCard(+k - 1);
    else if (s.kind === 'keys' && /^[1-4]$/.test(k)) pickKey(+k - 1);
  }

  // ---------------------------------------------------------------- the painted HUD (on the stage's overlay layer)
  function drawHud(ctx, t, W, H, { TITLE, OPEN_LINE, VERSION }) {
    st.btns = [];
    // the release number, small in the top-left corner on every screen
    ctx.font = `700 ${H * 0.025}px "Alegreya"`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = H * 0.005; ctx.strokeStyle = 'rgba(30,16,60,0.7)'; ctx.strokeText('v' + VERSION, H * 0.024, H * 0.019);
    ctx.fillStyle = 'rgba(255,233,188,0.85)'; ctx.fillText('v' + VERSION, H * 0.024, H * 0.019);
    const scroll = (x, y, w, h, fill, edge) => {
      const n = h * 0.3, path = (i) => { ctx.beginPath(); ctx.moveTo(x - n + i, y + i); ctx.lineTo(x + w + n - i, y + i); ctx.lineTo(x + w - i * 0.4, y + h / 2); ctx.lineTo(x + w + n - i, y + h - i); ctx.lineTo(x - n + i, y + h - i); ctx.lineTo(x + i * 0.4, y + h / 2); ctx.closePath(); };
      path(0); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = Math.max(2, H * 0.0028); ctx.stroke();
      const i = Math.max(4, H * 0.006); ctx.beginPath(); ctx.moveTo(x + i, y + i); ctx.lineTo(x + w - i, y + i); ctx.moveTo(x + i, y + h - i); ctx.lineTo(x + w - i, y + h - i); ctx.lineWidth = Math.max(1, H * 0.0012); ctx.stroke();
    };
    const wrap = (text, max) => {
      const words = text.split(' '), lines = []; let line = '';
      for (const w of words) { const tryL = line ? line + ' ' + w : w; if (ctx.measureText(tryL).width > max && line) { lines.push(line); line = w; } else line = tryL; }
      if (line) lines.push(line); return lines;
    };
    const ribbon = (text, cy, px, maxW, kind) => {
      ctx.font = `700 ${px}px "Alegreya"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lines = wrap(text, maxW), lh = px * 1.22, w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + px * 1.5, h = px * 1.5 + lh * (lines.length - 1);
      scroll(W / 2 - w / 2, cy - h / 2, w, h, kind === 'good' ? '#e3f1d2' : kind === 'bad' ? '#f6d9cf' : C.parch, kind === 'good' ? '#3a7a3a' : kind === 'bad' ? '#9a3a2a' : '#8a6a2a');
      ctx.fillStyle = C.ink; lines.forEach((l, i) => ctx.fillText(l, W / 2, cy - h / 2 + px * 0.79 + lh * i));
      return h;
    };
    // buttons: small purple banners with gold lettering, laid out in a row centred on cx
    const row = (list, cy, cx = W / 2, scale = 1) => {
      const px = H * 0.034 * scale; ctx.font = `700 ${px}px "Texturina"`;
      const ws = list.map((b) => ctx.measureText(b.label).width + px * 1.4), gap = px * 1.1, total = ws.reduce((a, b) => a + b, 0) + gap * (list.length - 1);
      let x = cx - total / 2;
      list.forEach((b, i) => {
        const w = ws[i], h = px * 1.55, y = cy - h / 2, idx = st.btns.length, hov = st.hover === idx && !b.off;
        ctx.globalAlpha = b.off ? 0.45 : 1;
        scroll(x, y, w, h, b.active ? '#c9502a' : hov ? '#5a32a0' : '#3a2070', '#e8c060');
        ctx.fillStyle = '#ffe2a0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.label, x + w / 2, y + h * 0.53);
        ctx.globalAlpha = 1;
        st.btns.push({ x: x - h * 0.3, y, w: w + h * 0.6, h, fn: b.fn, off: b.off });
        x += w + gap;
      });
    };
    const strip = (text, big, alpha) => {
      if (alpha <= 0) return;
      ctx.globalAlpha = alpha;
      const px = H * 0.042, y = H * 0.925;
      ctx.font = `700 ${px}px "Alegreya"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(text).width + px * 1.5;
      scroll(W / 2 - w / 2, y - px * 0.92, w, px * 1.84, C.parch, '#8a6a2a'); ctx.fillStyle = C.ink; ctx.fillText(text, W / 2, y + px * 0.04);
      if (big) { const bp = H * 0.082, top = y - px * 0.92 - bp * 1.72; ctx.font = `700 ${bp}px "Texturina"`; const bw = ctx.measureText(big).width + bp * 1.1; scroll(W / 2 - bw / 2, top, bw, bp * 1.5, '#3a2070', '#e8c060'); ctx.fillStyle = '#ffe2a0'; ctx.fillText(big, W / 2, top + bp * 0.79); }
      ctx.globalAlpha = 1;
    };

    if (G.mode === 'title') {
      strip(OPEN_LINE, TITLE, 1);
      ctx.font = `700 ${H * 0.026}px "Alegreya"`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9bc';
      ctx.fillText(`Unit ${CH.unit} · ${st.inst.name} · ${st.inst.review.length ? 'new notes' : 'notes'} ${freshPool().map(pretty).join(', ')}`, W / 2, H * 0.62);
      row([{ label: 'Begin', fn: begin }], H * 0.53, W / 2, 1.5);
      const best = (saved.bestPct || {})[bestKey()];
      if (best && best.some((b) => b != null)) { ctx.font = `700 ${H * 0.022}px "Alegreya"`; ctx.fillStyle = '#d8cfdf'; ctx.fillText('Best: ' + GAMES.map((g, i) => `${g.name} ${best[i] == null ? '–' : best[i] + '%'}`).join(' · '), W / 2, H * 0.665); }
      return;
    }
    if (G.mode === 'summit') {
      const S = R1.sig.summit, a = Math.min(K.seg(t, st.captionAt + 0.6, st.captionAt + 1.2), 1 - K.seg(t, G.summitAt + S.dur - 0.9, G.summitAt + S.dur - 0.4));
      if (a > 0) { ctx.globalAlpha = a; ribbon(S.caption, H * 0.9, H * 0.034, W * 0.72); ctx.font = `700 ${H * 0.02}px "Alegreya"`; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,233,188,0.75)'; ctx.fillText('Enter to skip', W - H * 0.03, H * 0.97); ctx.globalAlpha = 1; }
      return;
    }
    if (G.mode === 'play' || G.mode === 'fly') {
      // score and progress, top left
      ctx.font = `700 ${H * 0.03}px "Texturina"`; const sw = ctx.measureText('Correct 100%').width + H * 0.05;
      scroll(H * 0.04, H * 0.03, sw, H * 0.06, '#3a2070', '#e8c060'); ctx.fillStyle = '#ffe2a0'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Correct ' + (st.tallies.some((t) => t.n) ? finalPct() + '%' : '–'), H * 0.06, H * 0.062);
      {
        const n = NS; for (let k = 0; k < n; k++) { const r = k === st.stop && st.sub && st.sub.kind !== 'done' ? null : st.stopRes[k]; ctx.beginPath(); ctx.arc(H * 0.07 + k * H * 0.03, H * 0.125, H * 0.01, 0, 7); ctx.fillStyle = r === true ? C.good : r === false ? C.bad : k === st.stop ? '#ffe2a0' : k < st.stop ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)'; ctx.fill(); }
        // island caption on arrival, then the game's own words at the bottom
        const ca = Math.min(K.seg(t, st.captionAt, st.captionAt + 0.3), 1 - K.seg(t, st.captionAt + 2.4, st.captionAt + 2.7));
        strip(`${GAMES[gameOf(G.island)].line} · ${lapOf(G.island) + 1} of 3`, null, ca);
        if (ca <= 0 && st.msg) ribbon(st.msg, H * 0.93, H * 0.03, W * 0.7, st.msgKind);
        const s = st.sub, col = (list) => list.forEach((b, k) => row([b], H * (0.07 + k * 0.08), W * 0.895));
        if (s && s.kind === 'rhythm') {
          const busy = s.phase !== 'ready' && s.phase !== 'result';
          if (s.phase === 'result') col([{ label: 'Next island', fn: nextRhythm }]);
          else col([{ label: 'Listen', fn: () => runRhythm(false), off: busy }, { label: 'Tap it', fn: () => runRhythm(true), off: busy },
            { label: 'Tempo ' + st.bpm, off: busy, fn: () => { st.bpm = st.bpm === 50 ? 80 : st.bpm === 80 ? 120 : 50; saved.bpm = st.bpm; persist(); } }]);
          if (s.phase === 'tap' || s.phase === 'count' || s.phase === 'listen') { const b = Math.floor((now() - s.t0) / s.beat); if (b >= 0 && b < (s.cin || 4) + (s.total || 8)) { ctx.font = `700 ${H * 0.11}px "Texturina"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe2a0'; ctx.strokeStyle = '#3a2070'; ctx.lineWidth = H * 0.008; const txt = b < (s.cin || 4) ? String(b + 1) : s.phase === 'listen' ? '♪' : 'Tap!'; ctx.strokeText(txt, W * 0.895, H * 0.4); ctx.fillText(txt, W * 0.895, H * 0.4); } }
        } else if (s && s.kind === 'finger') {
          col(s.waitNext ? [{ label: 'Next', fn: nextFinger }, { label: 'Hear it', fn: () => snd.horn(concert(s.n)) }] : [{ label: 'Check', fn: checkFinger }, { label: 'Hear it', fn: () => { audio(); snd.horn(concert(s.n)); } }]);
        } else if (s && s.kind === 'write') {
          col([{ label: 'Check', fn: checkWrite, off: s.locked }]);
        }
      }
      return;
    }
    if (G.mode === 'summary') {
      const a = G.summaryFade; ctx.globalAlpha = a;
      const y0 = H * 0.635; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `700 ${H * 0.05}px "Texturina"`; ctx.fillStyle = '#ffe2a0'; ctx.fillText(`Chapter ${CH.n} complete · ${finalPct()}% correct`, W / 2, y0);
      ctx.font = `700 ${H * 0.026}px "Alegreya"`;
      GAMES.forEach((g, i) => { const tl = st.tallies[i], x = W / 2 + (i - (GAMES.length - 1) / 2) * W * (GAMES.length > 5 ? 0.148 : 0.17); ctx.fillStyle = '#d8cfdf'; ctx.fillText(g.name, x, y0 + H * 0.075); ctx.fillStyle = '#F8B73C'; ctx.fillText(tl && tl.n ? pctOf(tl) + '%' : st.skipped[i] ? 'no chart yet' : 'not played', x, y0 + H * 0.115); });
      ctx.globalAlpha = 1;
      if (a > 0.9) {
        row([{ label: 'Climb again', fn: begin }], H * 0.86);
      }
    }
  }

  return {
    frame, pointer, keydown, drawHud, begin, toTitle, clock: now, startStop, showTerm: termScene,
    // for checking a chapter's ending without climbing: jump to the top island and play the summit
    toSummit() { audio(); resetJourney(); st.stop = NS - 1; G.island = NS - 1; G.tau = hold(NS - 1); G.mode = 'play'; leaveStop(NS - 1); },
    setInstrument(k) { st.inst = INST.find((i) => i.key === k) || st.inst; saved.inst = st.inst.key; persist(); toTitle(); },
    get inst() { return st.inst; }, setSound, get sound() { return soundOn; }, st,
  };
}
