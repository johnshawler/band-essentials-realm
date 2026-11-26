// ================================================================ Chapter 7 scenery: the Twin Towers
// Two stone towers on neighbouring crags, a low one and a high one, stand for the octave between Chapter 4's F♯ and this unit's
// high F♯. The islands climb between them, and arched bridges shaped like ties link each island to the next. Each tower has a
// bell tuned to F♯, an octave apart; both ring whenever the player names an F♯. From the top, airships rise from a harbour in
// the clouds (Chapter 8).
const TOWERS_LOOK = {
  // the game props' palette on this chapter's islands
  props: { shield: 'bell', shieldRims: ['#b0803a', '#c8983a', '#a07030'], shieldFace: '#f4ead0', shieldMetal: 0.85, 'stone':  '#c8c0b4', 'stoneDark':  '#8a8278', 'stoneLight':  '#ece6dc', 'wood':  '#8a6a42', 'woodDark':  '#5a4428', 'gold':  '#c8983a', 'banner':  '#a02a2a', 'bannerDark':  '#7a1a1a', 'pale':  '#f4f0e8', 'frost':  '#ece8e0', 'slab':  '#b8b0a4', 'rune':  ['#7a5a2a', '#ffd890'], 'glass':  '#fff0d0', 'leather':  '#7a2a2a'},
  env: { top: '#5a8ae0', horizon: '#f0d8b0', bottom: '#4a5a6a', intensity: 0.68, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#fff0d0', power: 4.6 }, { pos: [34, 10, 22], size: [14, 22], color: '#d0e0ff', power: 2.0 }, { pos: [0, 44, -12], size: [44, 12], color: '#a8c0ff', power: 2.4 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffd8a0', power: 2.0 }] },
  hemi: ['#d0e0ff', '#5a5a48', 0.55], sun: '#fff0d8', sunPower: 2.8, fog: '#a8b8d0',
  sky: [[0, '#2858b0'], [0.25, '#4a80d0'], [0.4, '#88b0e0'], [0.47, '#d0e0ee'], [0.5, '#f0e4d0'], [0.53, '#b0b8c0'], [1, '#5a6070']],
  skyGlow: [[0.84, 0.55, 0.22], [0.66, 0.25, 0.16]], glowRGB: '255,240,210', stars: false,
  sunDisc: { color: '#fff4dc', k: 1.6, pos: [-260, 360, -700], r: 42 }, moon2: false,
  peak: '#7a8090', cloud: '#f4f2ee', shards: ['#4a5ab0', '#a0b8ff', '#b07a2a', '#ffd88a'],
};

function sceneTowers(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, CYL6, SUM, SIG, A0, DA, STEP, NS, RAD } = X;
  const kit = sceneKit(X), { beam, column, bands, ICO, CONE, ending, glowMat } = kit;
  const T = {
    rock: facet('#7a7468'), rock2: facet('#5e5a52'), grass: facet('#6a9a4a'), grass2: facet('#4f7e3c'), stone: facet('#b8b0a4'), stone2: facet('#9a9286'),
    roof: facet('#3a4a8a'), roof2: facet('#6a3a3a'), bronze: std('#b0803a', 0.9, 0.35, { flatShading: true }), wood: facet('#7a5a3a'), leaf: facet('#3f7a3c'), leaf2: facet('#5a9a44'),
  };
  const LOW = { x: -15, z: -6, top: SUM - 10 }, HIGH = { x: 14, z: 5, top: SUM + 14 };
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    add(g, CYL6, T.wood, 0, 0.15 * h, 0).scale.set(0.06 * h, 0.3 * h, 0.06 * h);
    if (seed % 2) { for (let k = 0; k < 3; k++) add(g, CONE, k % 2 ? T.leaf : T.leaf2, 0, (0.4 + k * 0.2) * h, 0).scale.set((0.28 - 0.06 * k) * h, 0.36 * h, (0.28 - 0.06 * k) * h); }
    else { const m = add(g, ICO, T.leaf2, 0, 0.6 * h, 0); m.scale.set(0.26 * h, 0.3 * h, 0.26 * h); }
    return g;
  };
  const decor = (parent, r, seed) => { for (let k = 0; k < 2; k++) { const a = Math.PI * (0.7 + 0.5 * k), m = add(parent, new THREE.BoxGeometry(0.8, 1.2 + k * 0.5, 0.8), T.stone2, Math.sin(a) * r * 0.85, 0.5, Math.cos(a) * r * 0.85); m.rotation.y = a; } };
  const islet = (parent, r, depth, seed) => kit.islet(parent, r, depth, seed, { rock: T.rock, rock2: T.rock2, top: T.grass, under: T.grass2, decor });
  const rocklet = kit.rocklet({ rock: T.rock, rock2: T.rock2, top: T.grass }, (g, size, seed, n) => { for (let k = 0; k < n; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size * 0.9, k + seed); });
  const step = kit.stepOf(T.stone, T.stone2);

  // a tower on its crag, with a bell under an open belfry on top; returns the bell's group
  function tower({ x, z, top }, r, seed) {
    const c = new THREE.Color(), band = bands(['#7a7468', '#6a645a', '#847c70'], 3, -40);
    const crag = column({ y0: -40, y1: top - 26, r0: r * 2.2, r1: r * 1.3, seg: 16, rows: 10, jag: 0.12, wob: 1.2, colour: (y, f) => c.copy(band(y, f)) }); crag.position.set(x, 0, z);
    const g = group(scene, x, top - 26, z);
    add(g, X.turfGeo(r * 1.35, seed, 14, 0.5), T.grass, 0, 0.1, 0, { cast: false });
    add(g, new THREE.CylinderGeometry(r * 0.9, r, 22, 12), T.stone, 0, 11, 0, { cast: false });
    for (let k = 0; k < 3; k++) add(g, new THREE.CylinderGeometry(r * 0.93 + 0.12, r * 0.95 + 0.12, 0.5, 12), T.stone2, 0, 4 + k * 6.5, 0, { cast: false });
    const winM = glowMat('#ffd890', 1.3);
    for (let k = 0; k < 6; k++) { const a = k * 2.1 + seed, w = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.1), winM); g.add(w); w.position.set(Math.sin(a) * r * 0.93, 3 + k * 3, Math.cos(a) * r * 0.93); w.rotation.y = a; }
    add(g, new THREE.CylinderGeometry(r * 1.05, r * 1.05, 0.6, 12), T.stone2, 0, 22.3, 0, { cast: false });
    for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4; add(g, new THREE.BoxGeometry(0.7, 4, 0.7), T.stone, Math.sin(a) * r * 0.75, 24.6, Math.cos(a) * r * 0.75, { cast: false }); }
    add(g, new THREE.CylinderGeometry(r * 1.1, r * 1.1, 0.6, 12), T.stone2, 0, 26.8, 0, { cast: false });
    add(g, new THREE.ConeGeometry(r * 1.2, r * 1.8, 12), seed % 2 ? T.roof : T.roof2, 0, 27.1 + r * 0.9, 0, { cast: false });
    const bell = group(g, 0, 26.3, 0), body = group(bell, 0, -1.4, 0);
    add(body, new THREE.CylinderGeometry(0.6, 1.25, 1.8, 16, 1, true), T.bronze, 0, 0, 0, { cast: false }); add(body, new THREE.SphereGeometry(0.6, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), T.bronze, 0, 0.88, 0, { cast: false });
    add(body, new THREE.SphereGeometry(0.22, 8, 6), T.bronze, 0, -0.95, 0, { cast: false });
    bell.userData = { at: -9, body };
    return bell;
  }

  let tNow = 0;
  function landmark() {
    const bLow = tower(LOW, 4.2, 1), bHigh = tower(HIGH, 5, 2);
    // the two bells ring F♯ in octaves when the player names an F♯
    SIG.onRight = (stop, info) => {
      if (!info.written || !/^F#/.test(info.written) || !SIG.snd) return;
      const n = info.note, lo = n.replace(/(-?\d)$/, (d) => String(Math.max(3, Math.min(4, +d)))), hi = lo.replace(/(-?\d)$/, (d) => String(+d + 1)), t = SIG.now() + 0.3;
      SIG.snd.chime(lo, 0.16, t); SIG.snd.chime(hi, 0.14, t + 0.02); SIG.snd.chime(lo, 0.08, t + 0.9); SIG.snd.chime(hi, 0.07, t + 0.92);
      bLow.userData.at = tNow + 0.3; bHigh.userData.at = tNow + 0.32;
    };
    // arched bridges, shaped like ties, from each island to the next
    const tieM = T.stone;
    for (let i = 0; i < NS - 1; i++) {
      const a = A0 + i * DA, b = A0 + (i + 1) * DA, p0 = new THREE.Vector3(Math.sin(a + 0.05) * (RAD - 3.5), i * STEP - 0.3, Math.cos(a + 0.05) * (RAD - 3.5)), p1 = new THREE.Vector3(Math.sin(b - 0.05) * (RAD - 3.5), (i + 1) * STEP - 0.3, Math.cos(b - 0.05) * (RAD - 3.5));
      const mid = p0.clone().add(p1).multiplyScalar(0.5); mid.y += 1.8;
      const m2 = new THREE.Vector3(mid.x * 0.94, mid.y, mid.z * 0.94);
      const curve = new THREE.QuadraticBezierCurve3(p0, m2, p1), pts = curve.getPoints(20);
      const tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.22, 6); add(scene, tg, tieM, 0, 0, 0, { cast: false });
      for (const u of [0.25, 0.5, 0.75]) { const q = curve.getPoint(u); beam(scene, [q.x, q.y, q.z], [q.x * 0.97, q.y - 3, q.z * 0.97], 0.08, T.stone2); }
    }
    anims.push((t) => {
      tNow = t;
      for (const b of [bLow, bHigh]) { const u = (t - b.userData.at); const sw = u >= 0 && u < 3 ? Math.sin(u * 7) * Math.exp(-u * 1.2) * 0.5 : 0; b.rotation.z = sw + (ending() ? 0.3 * Math.sin(t * 3 + (b === bLow ? 0 : 1.5)) : 0); }
    });
    // ring both at the summit
    let rang = false; anims.push(() => { if (ending() && !rang && SIG.snd) { rang = true; SIG.snd.chime('F#4', 0.15, SIG.now() + 0.2); SIG.snd.chime('F#5', 0.13, SIG.now() + 0.22); SIG.snd.chime('F#4', 0.1, SIG.now() + 1.4); SIG.snd.chime('F#5', 0.09, SIG.now() + 1.42); } if (!ending()) rang = false; });
  }

  SIG.summit = { dur: 8.5, caption: 'Both bells ring F♯, an octave apart, and airships rise from a harbour in the clouds.', cam: X.summitView({ aimY: 55, h: SUM + 12, back: 36, swing: 0.35 }) };
  // far off: airships rising from a harbour in the clouds (Chapter 8)
  function distant() {
    const g = kit.tease(480), hull = facet('#7a5a3a'), env = facet('#e8dcc4'), sail = facet('#c84a3a');
    add(g, new THREE.CylinderGeometry(6, 9, 120, 8), T.stone2, 0, -10, 0, { cast: false });
    for (let k = 0; k < 4; k++) {
      const s = group(g, (k - 1.5) * 34, 30 + 18 * k, (k % 2) * 20 - 10), b = add(s, new THREE.SphereGeometry(1, 14, 10), env, 0, 6, 0, { cast: false }); b.scale.set(14, 5, 5);
      add(s, new THREE.BoxGeometry(10, 2.4, 3.4), hull, 0, 0, 0, { cast: false }); add(s, new THREE.BoxGeometry(0.3, 5, 6), sail, -9, 6, 0, { cast: false });
      s.rotation.y = Math.atan2(-g.position.x, -g.position.z) + Math.PI / 2 + (k - 1.5) * 0.3;
      anims.push((t) => { s.position.y = 30 + 18 * k + 3 * Math.sin(t * 0.4 + k) + (ending() ? 6 : 0); });
    }
  }

  // the islands' own decorations and the props' small details
  const dressing = kit.theme({'ground':  ['flowers', 'block', 'flowers', 'pebbles', 'block'], 'top':  'bell', 'hang':  'flag', 'accent':  'block'});
  return { ...dressing, islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.towers = { look: TOWERS_LOOK, make: sceneTowers };
