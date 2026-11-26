// ================================================================ Chapter 9 scenery: the Clocktower
// A giant clockwork tower of stone and brass at sunset, with clock faces, a swinging pendulum and great gears on its walls. The
// islands are stone landings on brass gears that jut from the tower and turn slowly. During Read Rhythms every gear turns in
// time with the tempo, clicking once per beat. At the summit the clock strikes, and beyond it storm clouds gather round a
// jagged peak (Chapter 10).
const CLOCK_LOOK = {
  // the game props' palette on this chapter's islands
  props: {'stone':  '#b8a894', 'stoneDark':  '#8a7a68', 'stoneLight':  '#e0d4c0', 'wood':  '#5a3a28', 'woodDark':  '#3a2418', 'gold':  '#c8963a', 'banner':  '#4a2a6a', 'bannerDark':  '#321a4a', 'pale':  '#f4ead4', 'frost':  '#e8dcc4', 'slab':  '#9a6a2a', 'rune':  ['#7a5a20', '#ffd27a'], 'glass':  '#ffe8c0', 'leather':  '#4a2a1a'},
  env: { top: '#3a4a8a', horizon: '#ffa070', bottom: '#3a2a3a', intensity: 0.62, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#ffb080', power: 4.4 }, { pos: [34, 10, 22], size: [14, 22], color: '#ff90a0', power: 1.8 }, { pos: [0, 44, -12], size: [44, 12], color: '#9a90ff', power: 2.0 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffc070', power: 2.4 }] },
  hemi: ['#ffc8a8', '#3a3040', 0.48], sun: '#ffb880', sunPower: 2.5, fog: '#8a6a7a',
  sky: [[0, '#1a1e50'], [0.24, '#3a3478'], [0.38, '#8a4a80'], [0.45, '#e87a6a'], [0.49, '#ffb070'], [0.5, '#ffd090'], [0.53, '#a8606a'], [1, '#2a1a2a']],
  skyGlow: [[0.84, 0.9, 0.22], [0.66, 0.35, 0.16]], glowRGB: '255,170,110', stars: false,
  sunDisc: { color: '#ffc080', k: 1.6, pos: [-150, 50, -760], r: 56 }, moon2: false,
  peak: '#4a3a5a', cloud: '#e8a8a0', shards: ['#a0702a', '#ffd070', '#4a6ab0', '#9ad0ff'],
};

function sceneClock(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, CYL6, SUM, SIG, getG, A0, DA, STEP, NS, RAD } = X;
  const kit = sceneKit(X), { beam, column, bands, ICO, CONE, ending, glowMat } = kit;
  const T = {
    stone: facet('#a89a8c'), stone2: facet('#8a7c70'), slate: facet('#4a4458'), brass: std('#c8963a', 0.9, 0.35, { flatShading: true }), brass2: std('#9a6a2a', 0.9, 0.4, { flatShading: true }),
    iron: std('#3a3a44', 0.7, 0.45, { flatShading: true }), face: std('#f4ead4', 0, 0.6), ink: std('#2a2030', 0, 0.5), copper: std('#4a9a8a', 0.6, 0.45, { flatShading: true }),
  };
  const tR = (y) => K.lerp(13, 9, K.clamp((y + 30) / (SUM + 30)));
  // a gear: toothed disc with spokes, depth d, lying in the XY plane
  const gearCache = {};
  function gearGeo(r, n, d) {
    const key = `${r}:${n}:${d}`; if (gearCache[key]) return gearCache[key];
    const s = new THREE.Shape(), ti = r * 0.86;
    for (let k = 0; k < n; k++) { const a0 = k / n * Math.PI * 2, a1 = (k + 0.25) / n * Math.PI * 2, a2 = (k + 0.5) / n * Math.PI * 2, a3 = (k + 0.75) / n * Math.PI * 2;
      const P = [[ti, a0], [r, a1], [r, a2], [ti, a3]]; P.forEach(([rr, a], j) => (k === 0 && j === 0 ? s.moveTo : s.lineTo).call(s, Math.cos(a) * rr, Math.sin(a) * rr)); }
    s.closePath();
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + 0.3, h = new THREE.Path(), rr = r * 0.48, w = 0.5; h.absarc(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.2, 0, Math.PI * 2, true); void w; s.holes.push(h); }
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 6 }); g.translate(0, 0, -d / 2);
    return (gearCache[key] = g);
  }
  const gears = [];   // { m, teeth, dir, slow }
  const addGear = (parent, r, n, d, mat, x, y, z, rot, dir, slow = 0.1) => { const m = add(parent, gearGeo(r, n, d), mat, x, y, z, { cast: false }); m.rotation.set(rot[0], rot[1], rot[2]); m.rotation.order = 'YXZ'; gears.push({ m, teeth: n, dir, slow, base: rot[2] }); return m; };
  // during a rhythm, the gears step one tooth per beat; otherwise they creep round
  let tick = null;
  SIG.onRhythm = (r) => { tick = r; if (!SIG.snd) return; const off = SIG.now() - getG().t; for (let b = 0; b < r.cin + r.total; b++) SIG.snd.play('tick', { gain: 0.22, f: b < r.cin ? 5200 : 3600 }, r.t0 + b * r.beat + off); };
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 2) { add(g, new THREE.CylinderGeometry(0.06, 0.08, h * 0.6, 6), T.iron, 0, h * 0.3, 0); const l = add(g, new THREE.SphereGeometry(0.2, 8, 6), lum('#7a5a20', '#ffd27a', 2.4), 0, h * 0.62, 0, { cast: false }); void l; }
    else addGear(g, h * 0.18, 10, 0.12, T.brass2, 0, h * 0.2, 0, [0, 0, 0], seed % 4 ? 1 : -1, 0.4);
    return g;
  };
  // an island: a stone landing on a turning brass gear, held to the tower by an iron arm
  function islet(parent, r, depth, seed) {
    const top = add(parent, X.turfGeo(r * 0.92, seed, 11, 0.4), T.stone, 0, 0, 0);
    add(parent, X.turfGeo(r * 0.98, seed + 1, 11, 0.35), T.stone2, 0, -0.38, 0); void top;
    addGear(parent, r * 1.08, 24, 0.7, T.brass, 0, -0.95, 0, [Math.PI / 2, 0, 0], seed % 2 ? 1 : -1, 0.05);
    addGear(parent, r * 0.55, 14, 0.5, T.brass2, r * 0.5, -2.3, -r * 0.3, [Math.PI / 2, 0, 0], seed % 2 ? -1 : 1, 0.09);
    add(parent, new THREE.CylinderGeometry(0.5, 0.5, 2.8, 10), T.iron, 0, -2.0, 0);
    parent.updateMatrixWorld(true); const reach = RAD - tR(parent.position.y - 2) + 0.6;
    beam(parent, [0, -1.6, 0], [0, -1.8, -reach], 0.45, T.iron); beam(parent, [0, -3.0, 0], [0, -1.8, -reach + 2], 0.3, T.iron);
  }
  const rocklet = (a, r, y, size, seed) => { const g = group(scene, r * Math.sin(a), y, r * Math.cos(a)); addGear(g, size * 1.1, 16, 0.4, seed % 2 ? T.brass : T.copper, 0, 0, 0, [K.hash(seed, 1) * 1.2, a, 0], seed % 2 ? 1 : -1, 0.12); anims.push((t) => { g.position.y = y + 0.25 * Math.sin(t * 0.5 + seed); }); return g; };
  const step = kit.stepOf(T.brass2, T.stone2, new THREE.CylinderGeometry(0.55, 0.55, 0.16, 12));

  function landmark() {
    const c = new THREE.Color(), band = bands(['#a89a8c', '#9a8c80', '#b4a698'], 4, -30), BR = new THREE.Color('#b8883a');
    column({ y0: -30, y1: SUM + 2, r0: 13, r1: 9, seg: 8, rows: 12, jag: 0.02, wob: 0.3, colour: (y, f) => { c.copy(band(y, f)); if (((y + 30) % 9) < 0.9) c.lerp(BR, 0.8); return c; } });
    // big gears set into the walls, all round
    for (let k = 0; k < 16; k++) { const a = k * 2.399 + 0.3, y = -20 + (k / 16) * (SUM + 10), r = tR(y) + 0.3, rr = 3 + 3 * K.hash(k, 4); addGear(scene, rr, 12 + 4 * Math.round(rr), 0.6, k % 3 ? T.brass : T.copper, Math.sin(a) * r, y, Math.cos(a) * r, [0, a, 0], k % 2 ? 1 : -1, 0.08); }
    // the clock: four faces near the top, hands, a bell cupola above, and a pendulum low on the front
    const top = group(scene, 0, SUM + 2, 0);
    add(top, new THREE.BoxGeometry(20, 16, 20), T.stone, 0, 8, 0, { cast: false });
    const hands = [], toCam = X.spireA + Math.PI, kOpen = Math.round((((toCam % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 2)) % 4;
    let hinge = null, inner = null;
    for (let k = 0; k < 4; k++) {
      const f0 = group(top, 0, 8, 0); f0.rotation.y = k * Math.PI / 2; f0.translateZ(10.05);
      let f = f0;
      if (k === kOpen) {
        // behind this face, glowing clockwork: it shows when the face swings open at the summit
        hinge = group(f0, -7, 0, 0); f = group(hinge, 7, 0, 0);
        add(f0, new THREE.CircleGeometry(6.6, 36), glowMat('#ffb050', 1.4), 0, 0, -0.04, { cast: false });
        inner = addGear(f0, 5.2, 22, 0.3, T.brass2, 0, 0, 0.12, [0, 0, 0], 1, 0.6); addGear(f0, 2.4, 12, 0.3, T.copper, 3.3, -3.0, 0.3, [0, 0, 0], -1, 1.2);
      }
      add(f, new THREE.CylinderGeometry(7, 7, 0.5, 36), T.brass, 0, 0, 0, { cast: false }).rotation.x = Math.PI / 2;
      add(f, new THREE.CircleGeometry(6.3, 36), T.face, 0, 0, 0.27, { cast: false });
      for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2; add(f, new THREE.BoxGeometry(0.3, 1.0, 0.1), T.ink, Math.sin(a) * 5.4, Math.cos(a) * 5.4, 0.3, { cast: false }).rotation.z = -a; }
      const h = new THREE.BoxGeometry(0.45, 3.4, 0.12); h.translate(0, 1.5, 0); const m = new THREE.BoxGeometry(0.3, 5, 0.12); m.translate(0, 2.3, 0);
      hands.push([add(f, h, T.ink, 0, 0, 0.36, { cast: false }), add(f, m, T.ink, 0, 0, 0.42, { cast: false })]);
    }
    add(top, new THREE.CylinderGeometry(0.01, 15, 9, 4), T.slate, 0, 20.5, 0, { cast: false }).rotation.y = Math.PI / 4;
    const bell = group(top, 0, 18.4, 0); add(bell, new THREE.CylinderGeometry(1, 2.1, 2.6, 14, 1, true), T.brass, 0, 0, 0, { cast: false });
    const pend = group(scene, 0, 4, 0); pend.rotation.y = A0 + (NS / 2) * DA; const pa = group(pend, 0, 0, tR(4) + 1.6);
    add(pa, new THREE.CylinderGeometry(0.15, 0.15, 14, 6), T.brass2, 0, -7, 0, { cast: false }); add(pa, new THREE.CylinderGeometry(2.2, 2.2, 0.5, 20), T.brass, 0, -14, 0, { cast: false }).rotation.x = Math.PI / 2;
    let struck = false, openAt = -1;
    anims.push((t) => {
      const r = tick, on = r && t >= r.t0 && t <= r.ts + r.total * r.beat + 0.3;
      gears.forEach((g) => {
        let a;
        if (on) { const b = (t - r.t0) / r.beat, step = Math.floor(b) + K.ease.out(K.clamp((b % 1) / 0.18)); a = g.dir * step * (Math.PI * 2 / g.teeth); g.hold = a - g.dir * t * g.slow; }
        else a = g.dir * t * g.slow + (g.hold || 0);
        g.m.rotation.z = g.base + a;
      });
      hands.forEach(([h, m]) => { m.rotation.z = -t * 0.3; h.rotation.z = -t * 0.025 - 1.2; });
      pa.rotation.z = 0.35 * Math.sin(t * 1.6);
      if (ending() && !struck && SIG.snd) { struck = true; const n0 = SIG.now(); ['D4', 'D4', 'D4', 'D4', 'A3', 'D4'].forEach((n, k) => { SIG.snd.chime(n, 0.18, n0 + 0.4 + k * 0.9); SIG.snd.play('thud', { gain: 0.25, f: 90 }, n0 + 0.4 + k * 0.9); }); }
      if (!ending()) struck = false;
      bell.rotation.z = ending() ? 0.25 * Math.sin(t * 3.5) : 0;
      if (ending() && openAt < 0) openAt = t; if (!ending()) openAt = -1;
      if (hinge) hinge.rotation.y = -1.9 * K.ease.inOut(openAt < 0 ? 0 : K.clamp((t - openAt - 1.8) / 1.6)); void inner;
    });
  }

  const T0 = X.towards;
  SIG.summit = { dur: 10, caption: 'The clock strikes, and its face swings open. Beyond it, storm clouds gather round a jagged peak.', cam: kit.path([
    [0, T0(X.spireA + Math.PI, 40, SUM + 11), [0, SUM + 10, 0]], [0.5, T0(X.spireA + Math.PI, 31, SUM + 10), [0, SUM + 10, 0]],
    [0.78, [0, SUM + 38, 0], T0(X.spireA, 300, SUM + 20)], [1, T0(X.spireA, 14, SUM + 34), T0(X.spireA, 560, 90)]]) };
  // far off: a jagged black peak wrapped in storm clouds, lightning flickering inside (Chapter 10)
  function distant() {
    const g = kit.tease(560), dark = facet('#2a2a36'), cloudM = facet('#4a4a5e');
    const pk = add(g, new THREE.ConeGeometry(70, 200, 7), dark, 0, 60, 0, { cast: false }); pk.rotation.y = 0.4;
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, m = add(g, ICO, cloudM, Math.sin(a) * 50, 110 + 30 * K.hash(k, 2), Math.cos(a) * 50, { cast: false }); m.scale.set(40, 16, 34); }
    const flash = new THREE.PointLight('#b8c8ff', 0, 400, 1); flash.position.set(0, 120, 60); g.add(flash);
    const fm = kit.glowMat('#cfd8ff', 0); const bolt = add(g, new THREE.BoxGeometry(2, 80, 2), fm, 10, 70, 30, { cast: false }); bolt.rotation.z = 0.2;
    anims.push((t) => { const p = Math.max(0, Math.sin(t * 0.9) * Math.sin(t * 7.3) - 0.85) * 6.6; flash.intensity = p * 4000; fm.color.setRGB(0.8, 0.85, 1).multiplyScalar(p * 3); bolt.visible = p > 0.05; });
  }

  // the islands' own decorations and the props' small details
  const dressing = kit.theme({'ground':  ['gear', 'lamp', 'gear', 'crate', 'gear'], 'top':  'gearTop', 'hang':  'weight', 'accent':  'gear'});
  return { ...dressing, islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.clock = { look: CLOCK_LOOK, make: sceneClock };
