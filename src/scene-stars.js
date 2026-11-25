// ================================================================ Chapter 12 scenery: the Star Observatory
// The last and tallest climb: an observatory tower rising through the clouds into the night. The islands are floating platforms
// of stone and starlight, and constellations take the shapes of notes and rests. Each right answer lights stars in the sky; by
// the summit they form a five-line staff. At the summit the telescope turns over the realm and the earlier chapters' landmarks
// light up round the horizon one by one.
const STARS_LOOK = {
  env: { top: '#10163a', horizon: '#3a3a7a', bottom: '#141a36', intensity: 0.5, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#c8d0ff', power: 3.2 }, { pos: [34, 10, 22], size: [14, 22], color: '#ffd8a0', power: 1.6 }, { pos: [0, 44, -12], size: [44, 12], color: '#a090ff', power: 2.0 }, { pos: [-36, 6, -20], size: [16, 12], color: '#a8c8ff', power: 1.8 }] },
  hemi: ['#b0b8ff', '#1e2240', 0.5], sun: '#d0d8ff', sunPower: 1.8, fog: '#1e2448',
  sky: [[0, '#02030e'], [0.25, '#060a24'], [0.4, '#121a48'], [0.47, '#2a2a6a'], [0.5, '#4a3a7a'], [0.53, '#1a1a40'], [1, '#0a0c1e']],
  skyGlow: [[0.84, 0.25, 0.22], [0.5, 0.2, 0.2]], glowRGB: '170,150,255', stars: true, moon2: true,
  peak: '#2a2c4a', cloud: '#3a3e6a', shards: ['#3a4ab0', '#a8c0ff', '#a08a3a', '#ffe8a0'], peaks: false,
};

function sceneStars(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, CYL6, SUM, SIG, getG, NS, RAD } = X;
  const kit = sceneKit(X), { beam, column, bands, ICO, OCT, CONE, ending, glowMat } = kit;
  const T = {
    stone: facet('#8a8aa8'), stone2: facet('#6a6a8a'), white: facet('#e8e8f4'), brass: std('#c8a050', 0.9, 0.3, { flatShading: true }),
    star: lum('#6a6aa0', '#fff4c8', 2.2, { facet: true, rough: 0.3 }), glass: lum('#3a3a8a', '#9ab0ff', 1.4, { facet: true, rough: 0.2 }),
  };
  const tR = (y) => K.lerp(11, 7, K.clamp((y + 30) / (SUM + 30)));
  const starGeo = new THREE.OctahedronGeometry(1, 0);
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 2) { add(g, new THREE.CylinderGeometry(0.06, 0.08, h * 0.6, 6), T.brass, 0, h * 0.3, 0); add(g, new THREE.SphereGeometry(0.22, 10, 8), T.glass, 0, h * 0.64, 0, { cast: false }); }
    else kit.cluster(g, 0, 0, 0, h * 0.35, T.glass, seed, 3);
    return g;
  };
  // floating platforms of stone, rimmed with starlight
  const decor = (parent, r, seed) => { add(parent, new THREE.TorusGeometry(r * 1.0, 0.06, 4, 28), T.star, 0, -0.32, 0).rotation.x = Math.PI / 2; for (let k = 0; k < 5; k++) { const a = K.hash(seed, k) * 6.3, s = add(parent, starGeo, T.star, Math.cos(a) * r * 0.6, -2.5 - 2 * K.hash(seed, k + 5), Math.sin(a) * r * 0.6, { cast: false }); s.scale.setScalar(0.18); } };
  const islet = (parent, r, depth, seed) => kit.islet(parent, r, depth, seed, { rock: T.stone2, rock2: T.stone, top: T.white, under: T.stone, decor });
  const rocklet = kit.rocklet({ rock: T.stone2, rock2: T.stone, top: T.white }, (g, size, seed, n) => { for (let k = 0; k < n; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size, k + seed); });
  const step = kit.stepOf(T.glass, T.stone, new THREE.OctahedronGeometry(0.4, 0));

  // the sky staff: five lines of stars on a great arc behind the tower, lit three at a time by right answers
  const STAFF = [], PER = 22;
  const skyStar = (x, y, z, s) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff2c8'), fog: false, transparent: true, opacity: 0.12 }); const o = new THREE.Mesh(starGeo, m); o.position.set(x, y, z); o.scale.setScalar(s); scene.add(o); return { o, m, at: -9 }; };
  // the arc runs all the way round behind the tower, so some of it is in view from every island
  for (let line = 0; line < 5; line++) for (let k = 0; k < PER; k++) { const a = 0.8 + 4.7 * k / (PER - 1), r = 430; STAFF.push(skyStar(Math.sin(a) * r, 62 + line * 11, Math.cos(a) * r, 2.2)); }
  const order = STAFF.map((_, i) => i).sort((a, b) => (a % PER) - (b % PER) || a - b);   // round the arc, a column at a time
  let lit = 0, tNow = 0;
  const light = (n) => { for (let k = 0; k < n && lit < order.length; k++) STAFF[order[lit++]].at = tNow + k * 0.12; };
  SIG.onRight = (stop, info) => { light(4); if (SIG.snd) SIG.snd.chime(info.note ? info.note.replace(/(-?\d)$/, (d) => String(Math.max(5, Math.min(6, +d)))) : 'F6', 0.08, SIG.now() + 0.3); };

  function landmark() {
    // the tower: pale stone with brass bands, rising through the clouds; a domed observatory on top with a turning telescope
    const c = new THREE.Color(), band = bands(['#9a9ab8', '#8a8aa8', '#a8a8c4'], 4, -30), BR = new THREE.Color('#b89a50');
    column({ y0: -30, y1: SUM + 2, r0: 11, r1: 7, seg: 16, rows: 14, jag: 0.02, wob: 0.3, colour: (y, f) => { c.copy(band(y, f)); if (((y + 30) % 10) < 0.8) c.lerp(BR, 0.8); return c; } });
    const winM = glowMat('#ffd890', 1.4);
    for (let k = 0; k < 30; k++) { const a = k * 2.399, y = -20 + k * (SUM + 20) / 30, r = tR(y) + 0.05, w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.4), winM); w.position.set(Math.sin(a) * r, y, Math.cos(a) * r); w.rotation.y = a; scene.add(w); }
    const top = group(scene, 0, SUM + 2, 0);
    add(top, new THREE.CylinderGeometry(9.5, 9, 6, 24), T.white, 0, 3, 0, { cast: false });
    add(top, new THREE.SphereGeometry(9.2, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), std('#eef0ff', 0.5, 0.25), 0, 6, 0, { cast: false });
    const scope = group(top, 0, 10, 0), tube = add(scope, new THREE.CylinderGeometry(1.2, 1.8, 14, 14), T.brass, 0, 5, 0, { cast: false }); tube.position.set(0, 4, 3); tube.rotation.x = 0.8;
    // constellations shaped like a quarter note, a pair of eighths and a quarter rest
    const cons = [
      { at: [Math.PI + 0.9, 125], pts: [[0, 0], [1.2, 0.5], [2.2, 0.2], [1.6, -0.6], [0.3, -0.5], [2.4, 0.5], [2.6, 3], [2.7, 5.5], [2.8, 8]] },
      { at: [Math.PI - 0.8, 128], pts: [[0, 0], [1, 0.5], [1.6, 0], [5, 0], [6, 0.5], [6.6, 0], [1.6, 3], [1.6, 6], [6.6, 3], [6.6, 6], [3, 6.3], [5, 6.3]] },
      { at: [Math.PI + 1.9, 120], pts: [[0, 6], [1.2, 4.6], [0.2, 3.3], [1.3, 2], [0.4, 1], [1, 0]] },
    ];
    cons.forEach(({ at: [a, y], pts }) => { const r = 380, cx = Math.sin(a) * r, cz = Math.cos(a) * r, rx = Math.cos(a), rz = -Math.sin(a); pts.forEach(([u, v]) => skyStar(cx + rx * u * 5, y + v * 5, cz + rz * u * 5, 1.6).m.opacity = 0.9); });
    // the earlier landmarks on the horizon
    const marks = [];
    const shapes = [
      [[new THREE.ConeGeometry(14, 30, 6), 0, 15, 0], [new THREE.CylinderGeometry(2, 2, 14, 8), 0, 37, 0]],
      [[new THREE.CylinderGeometry(3, 6, 34, 8), 0, 17, 0], [new THREE.IcosahedronGeometry(12, 0), 0, 40, 0]],
      [[new THREE.CylinderGeometry(6, 8, 18, 8), 0, 9, 0], [new THREE.CylinderGeometry(2, 3, 18, 10), 0, 27, 0]],
      [[new THREE.ConeGeometry(5, 46, 6), 0, 23, 0]],
      [[new THREE.BoxGeometry(30, 30, 10), 0, 15, 0]],
      [[new THREE.CylinderGeometry(8, 12, 22, 8), 0, 11, 0]],
      [[new THREE.CylinderGeometry(2.5, 3, 20, 8), -8, 10, 0], [new THREE.CylinderGeometry(3, 3.5, 34, 8), 8, 17, 0]],
      [[new THREE.CylinderGeometry(2, 4, 36, 8), 0, 18, 0], [new THREE.SphereGeometry(4, 10, 8), 10, 26, 0]],
      [[new THREE.BoxGeometry(10, 34, 10), 0, 17, 0], [new THREE.CylinderGeometry(5, 5, 1, 20), 0, 26, 5.5]],
      [[new THREE.ConeGeometry(12, 40, 5), 0, 20, 0]],
      [[new THREE.CylinderGeometry(4, 16, 26, 10), 0, 13, 0]],
    ];
    shapes.forEach((parts, k) => {
      const a = X.spireA - 1.0 + 2.0 * k / (shapes.length - 1), r = 560, g = group(scene, Math.sin(a) * r, 10, Math.cos(a) * r);
      const m = new THREE.MeshStandardMaterial({ color: '#2a2c4a', emissive: new THREE.Color('#ffd890'), emissiveIntensity: 0, flatShading: true, fog: false });
      parts.forEach(([geo, x, y, z]) => add(g, geo, m, x, y, z, { cast: false })); g.scale.setScalar(1.6); marks.push(m);
    });
    // a spiral of drifting star motes round the tower
    const MO = 160, motes = new THREE.InstancedMesh(starGeo, glowMat('#fff0c0', 1.6), MO); motes.castShadow = false; motes.frustumCulled = false; scene.add(motes);
    let endAt = -1;
    anims.push((t) => {
      tNow = t;
      for (let i = 0; i < MO; i++) { const u = (i / MO + t * 0.004) % 1, a = u * Math.PI * 14 + i, r = tR(u * SUM) + 3 + 2 * Math.sin(t + i); K.place(motes, i, [Math.sin(a) * r, -20 + u * (SUM + 30), Math.cos(a) * r], [t, i, 0], 0.12 + 0.06 * Math.sin(t * 3 + i)); }
      motes.instanceMatrix.needsUpdate = true;
      if (ending()) { if (endAt < 0) { endAt = t; light(order.length); } } else endAt = -1;
      STAFF.forEach((s) => { const u = s.at < 0 ? 0 : K.clamp((t - s.at) / 0.5); s.m.opacity = 0.12 + 0.88 * u; s.o.scale.setScalar(2.2 * (1 + 0.6 * (s.at < 0 ? 0 : Math.max(0, 1 - (t - s.at) / 0.6)))); s.o.rotation.y = t * 0.5; });
      marks.forEach((m, k) => { m.emissiveIntensity = endAt < 0 ? 0 : 1.6 * K.clamp((t - endAt - 0.4 - k * 0.35) / 0.5); });
      scope.rotation.y = endAt < 0 ? 0.15 * Math.sin(t * 0.1) : 0.15 * Math.sin(t * 0.1) + K.clamp((t - endAt) / 4) * Math.PI * 1.2;
    });
  }
  function distant() {}

  return { islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.stars = { look: STARS_LOOK, make: sceneStars };
