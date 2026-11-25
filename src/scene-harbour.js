// ================================================================ Chapter 8 scenery: the Sky Harbour
// A tall mooring spire above the clouds, hung with docks, with airships tied up all round it in a windy blue sky. The islands
// are docks and crow's nests on timber arms. The wind follows the hairpins: on the Crescendo question every sail swells, on the
// Diminuendo question they fall slack. From the top, a giant clock face stands in the distance (Chapter 9).
const HARBOUR_LOOK = {
  env: { top: '#4a88e8', horizon: '#e8f0ff', bottom: '#8aa0c0', intensity: 0.72, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#fffaf0', power: 4.8 }, { pos: [34, 10, 22], size: [14, 22], color: '#d8e8ff', power: 2.2 }, { pos: [0, 44, -12], size: [44, 12], color: '#a8c8ff', power: 2.4 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffe8c0', power: 2.0 }] },
  hemi: ['#e0ecff', '#8a90a0', 0.6], sun: '#fffaf0', sunPower: 3.0, fog: '#c8d8ee',
  sky: [[0, '#1e5ac8'], [0.25, '#3a7ce0'], [0.4, '#7ab0f0'], [0.47, '#cfe2f8'], [0.5, '#f0f6ff'], [0.53, '#c8d4e4'], [1, '#8a98b0']],
  skyGlow: [[0.84, 0.5, 0.22], [0.66, 0.25, 0.16]], glowRGB: '255,250,235', stars: false,
  sunDisc: { color: '#fffbe8', k: 1.7, pos: [-260, 380, -700], r: 40 }, moon2: false,
  peak: '#8a96b0', cloud: '#ffffff', shards: ['#2a6ab0', '#8ad0ff', '#b08a2a', '#ffe08a'], peaks: false,
};

function sceneHarbour(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, CYL6, SUM, SIG, A0, DA, STEP, NS, RAD } = X;
  const kit = sceneKit(X), { beam, column, bands, ICO, CONE, ending, glowMat } = kit;
  const T = {
    rock: facet('#8a8478'), rock2: facet('#6e685e'), plank: facet('#9a7046', 0.85), plank2: facet('#6e4c30', 0.85), rope: facet('#d8c098', 0.9),
    brass: std('#c8983a', 0.9, 0.35, { flatShading: true }), canvas: std('#f4ecdc', 0, 0.8, { side: THREE.DoubleSide }), canvas2: std('#d84a3a', 0, 0.8, { side: THREE.DoubleSide }),
    env: facet('#ece0c8', 0.7), env2: facet('#c8b48a', 0.7), hull: facet('#7a5232'), stone: facet('#b8b4ac'),
  };
  const sR = (y) => K.lerp(9, 5, K.clamp((y + 30) / (SUM + 30)));
  // the wind: 1 normally, swelling on crescendo, slack on diminuendo
  let windTo = 1, wind = 1;
  SIG.onTerm = (term) => { windTo = term === 'Crescendo' ? 1.9 : term === 'Diminuendo' ? 0.15 : 1; };
  SIG.onLeave = () => { windTo = 1; };
  const sails = [];
  // a sail: a curved sheet whose belly follows the wind
  function sail(parent, w, h, x, y, z, mat, ry = 0) {
    const g = new THREE.PlaneGeometry(w, h, 8, 6), p = g.attributes.position, base = Float32Array.from(p.array);
    const m = add(parent, g, mat, x, y, z, { cast: false }); m.rotation.y = ry; sails.push({ m, p, base, w, h }); return m;
  }
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 2) { add(g, new THREE.CylinderGeometry(0.05, 0.07, h * 0.8, 5), T.plank2, 0, h * 0.4, 0); const f = add(g, new THREE.ConeGeometry(0.18, 0.9, 8, 1, true), T.canvas2, 0.45, h * 0.75, 0); f.rotation.z = Math.PI / 2; anims.push((t) => { f.rotation.y = 0.3 * Math.sin(t * 2 + seed) * wind; }); }
    else { for (let k = 0; k < 2; k++) add(g, new THREE.BoxGeometry(0.6, 0.6, 0.6), T.plank, 0.1 * k, 0.3 + 0.6 * k, 0.15 * k).rotation.y = k; }
    return g;
  };
  const decor = (parent, r, seed) => { for (let k = 0; k < 6; k++) { const a = Math.PI * (0.55 + 0.18 * k), px = Math.sin(a) * r, pz = Math.cos(a) * r; add(parent, new THREE.CylinderGeometry(0.06, 0.06, 0.9, 5), T.plank2, px, 0.45, pz); } const mast = add(parent, new THREE.CylinderGeometry(0.1, 0.13, 6, 6), T.plank2, -r * 0.7, 3, -r * 0.4); void mast; sail(parent, 1.8, 2.4, -r * 0.7 + 0.1, 3.6, -r * 0.4 + 0.1, seed % 2 ? T.canvas : T.canvas2, 0.5); };
  const islet = (parent, r, depth, seed) => kit.islet(parent, r, depth, seed, { rock: T.rock, rock2: T.rock2, top: T.plank, under: T.plank2, landR: sR, strut: T.plank2, strut2: T.rope, decor });
  const rocklet = kit.rocklet({ rock: T.rock, rock2: T.rock2, top: T.plank }, (g, size, seed, n) => { for (let k = 0; k < n; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size, k + seed); });
  const step = kit.stepOf(T.plank, T.plank2);

  function airship(x, y, z, s, ry, seed) {
    const g = group(scene, x, y, z); g.rotation.y = ry; g.scale.setScalar(s);
    const b = add(g, new THREE.SphereGeometry(1, 16, 10), seed % 2 ? T.env : T.env2, 0, 3.4, 0, { cast: false }); b.scale.set(6, 2.2, 2.2);
    for (const sz of [-1, 1]) add(g, new THREE.CylinderGeometry(0.03, 0.03, 2.6, 4), T.rope, sz * 2.5, 1.4, 0, { cast: false });
    add(g, new THREE.BoxGeometry(5.4, 0.9, 1.6), T.hull, 0, 0.2, 0, { cast: false }); add(g, new THREE.BoxGeometry(1.2, 0.8, 1.2), T.plank, -1.6, 0.9, 0, { cast: false });
    add(g, new THREE.CylinderGeometry(0.06, 0.08, 3.2, 5), T.plank2, 1.4, 1.8, 0, { cast: false });
    sail(g, 1.8, 2.2, 1.45, 2.0, 0.08, seed % 3 ? T.canvas : T.canvas2, Math.PI / 2);
    const fin = add(g, new THREE.BoxGeometry(0.06, 1.4, 1.2), T.canvas2, 6, 3.4, 0, { cast: false }); void fin;
    anims.push((t) => { g.position.y = y + 0.4 * Math.sin(t * 0.6 + seed); g.rotation.z = 0.04 * Math.sin(t * 0.5 + seed) * wind; });
    return g;
  }

  function landmark() {
    // the spire: grey stone below, timber cladding higher up, a ring of docks near the top, a beacon on the peak
    const c = new THREE.Color(), band = bands(['#a8a49c', '#94908a', '#b8b2a8'], 3.2, -30), WOOD = new THREE.Color('#8a6644');
    column({ y0: -30, y1: SUM + 6, r0: 9, r1: 5, seg: 12, rows: 14, jag: 0.05, wob: 0.6, colour: (y, f) => { c.copy(band(y, f)); if (y > SUM * 0.45 && K.hash(f, 3) > 0.35) c.lerp(WOOD, 0.75); return c; } });
    for (let k = 0; k < 4; k++) { const y = 6 + k * (SUM - 6) / 3.4; add(scene, new THREE.CylinderGeometry(sR(y) + 2.6, sR(y) + 2.6, 0.5, 16), T.plank, 0, y, 0, { cast: false }); add(scene, new THREE.TorusGeometry(sR(y) + 2.6, 0.06, 4, 24), T.rope, 0, y + 0.8, 0, { cast: false }).rotation.x = Math.PI / 2; }
    const hg = group(scene, 0, SUM + 6, 0);
    add(hg, new THREE.CylinderGeometry(6.5, 6, 0.6, 16), T.plank, 0, 0, 0, { cast: false });
    add(hg, new THREE.CylinderGeometry(0.4, 0.5, 14, 8), T.plank2, 0, 7, 0, { cast: false });
    const beacon = add(hg, new THREE.SphereGeometry(1, 12, 8), glowMat('#ffd890', 1.8), 0, 14.5, 0, { cast: false }); void beacon;
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; beam(hg, [0, 13.5, 0], [Math.sin(a) * 6.3, 0.3, Math.cos(a) * 6.3], 0.035, T.rope); }
    const flag = add(hg, new THREE.PlaneGeometry(3, 1.4, 6, 1), T.canvas2, 1.6, 12.6, 0, { cast: false }); flag.material = T.canvas2;
    // airships moored round the spire, high and low
    const ships = [];
    for (let k = 0; k < 7; k++) { const a = Math.PI + (k - 3) * 0.75, y = -6 + k * (SUM / 6.5), r = sR(y) + 13 + 4 * K.hash(k, 2); ships.push(airship(Math.sin(a) * r, y, Math.cos(a) * r, 1.3 + 0.4 * K.hash(k, 3), a + Math.PI / 2, k)); beam(scene, [Math.sin(a) * (sR(y) + 0.5), y + 3, Math.cos(a) * (sR(y) + 0.5)], [Math.sin(a) * (r - 5), y + 3.5, Math.cos(a) * (r - 5)], 0.05, T.rope); }
    for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.9, y = 4 + k * (SUM / 5), r = RAD + 26 + 10 * K.hash(k, 5); airship(Math.sin(a) * r, y, Math.cos(a) * r, 1.0, a + 0.4, k + 10); }
    anims.push((t) => {
      wind += (windTo - wind) * 0.04;
      sails.forEach((sl, i) => { const { p, base, w, h } = sl, b = 0.55 * wind * (1 + 0.08 * Math.sin(t * 2.4 + i)); for (let v = 0; v < p.count; v++) { const x = base[v * 3], y = base[v * 3 + 1], u = 1 - (2 * x / w) ** 2, q = 1 - (2 * y / h) ** 2; p.setZ(v, b * Math.max(0, u) * (0.6 + 0.4 * Math.max(0, q)) + 0.06 * Math.sin(t * 6 + x * 3 + i) * (2 - wind) * 0.3); } p.needsUpdate = true; sl.m.geometry.computeVertexNormals(); });
      const fp = flag.geometry.attributes.position; for (let v = 0; v < fp.count; v++) { const x = fp.getX(v); fp.setZ(v, (x + 1.5) * 0.25 * Math.sin(t * 5 * Math.max(0.3, wind) - x * 2)); } fp.needsUpdate = true;
    });
  }

  // far off: a giant clock face on a brass-and-stone tower (Chapter 9)
  function distant() {
    const g = kit.tease(540), face = Math.atan2(-g.position.x, -g.position.z);
    add(g, new THREE.CylinderGeometry(24, 34, 150, 8), T.stone, 0, -20, 0, { cast: false });
    const dial = group(g, 0, 70, 0); dial.rotation.y = face; dial.translateZ(25);
    add(dial, new THREE.CylinderGeometry(22, 22, 2, 36), T.brass, 0, 0, 0, { cast: false }).rotation.x = Math.PI / 2;
    add(dial, new THREE.CircleGeometry(19.5, 36), std('#f4ecd8', 0, 0.7), 0, 0, 1.05, { cast: false });
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; add(dial, new THREE.BoxGeometry(1, 3, 0.4), T.hull, Math.sin(a) * 16.5, Math.cos(a) * 16.5, 1.2, { cast: false }).rotation.z = -a; }
    const hrs = add(dial, new THREE.BoxGeometry(1.4, 10, 0.4), T.hull, 0, 0, 1.4, { cast: false }), mins = add(dial, new THREE.BoxGeometry(0.9, 15, 0.4), T.hull, 0, 0, 1.6, { cast: false });
    hrs.geometry.translate(0, 4.5, 0); mins.geometry.translate(0, 7, 0);
    anims.push((t) => { mins.rotation.z = -t * 0.2; hrs.rotation.z = -t * 0.2 / 12 - 1; });
  }

  return { islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.harbour = { look: HARBOUR_LOOK, make: sceneHarbour };
