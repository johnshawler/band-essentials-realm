// ================================================================ Chapter 2 scenery: the Great Tree
// A colossal tree on a golden morning. The islands are mossy shelf fungi on branches spiralling up the trunk; the summit is a
// treehouse under the canopy. sceneTree(X) gets the stage's helpers and returns what the chapter replaces in the castle world.
const TREE_LOOK = {
  env: { top: '#7fa6f0', horizon: '#ffd79a', bottom: '#6a5a3a', intensity: 0.7, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#ffd9a0', power: 4.8 }, { pos: [34, 10, 22], size: [14, 22], color: '#ffe6b8', power: 2.0 }, { pos: [0, 44, -12], size: [44, 12], color: '#a8c8ff', power: 2.4 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffc070', power: 2.2 }] },
  hemi: ['#cfe2ff', '#7a5a30', 0.55], sun: '#ffe2b0', sunPower: 2.8, fog: '#d8c8a8',
  sky: [[0, '#2f5fb8'], [0.24, '#5f93d8'], [0.38, '#a9c8ea'], [0.46, '#f2dcb0'], [0.49, '#ffd38e'], [0.5, '#ffe2aa'], [0.53, '#e7cf9c'], [0.62, '#b9a882'], [1, '#5e5a44']],
  skyGlow: [[0.84, 0.75, 0.22], [0.66, 0.3, 0.16]], glowRGB: '255,225,160', stars: false,
  sunDisc: { color: '#fff1c8', k: 1.5, pos: [-150, 95, -760], r: 52 }, moon2: false,
  peak: '#6f8f78', cloud: '#f3e3c6', shards: ['#b07a20', '#ffcf6a', '#3f8a3a', '#9ff07a'],
};

function sceneTree(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, turfGeo, CYL6, M, RAD, SUM } = X;
  const T = {
    bark: facet('#6b4a32'), barkDark: facet('#4a3222'), fungus: facet('#ecd3a0', 0.8), rim: facet('#c9874a', 0.8), gill: facet('#d9b27a', 0.85),
    leafA: facet('#5c9a3c'), leafB: facet('#7fae46'), leafC: facet('#c8b04a'), leafD: facet('#3f7a3a'),
    plank: facet('#946238', 0.85), plankDark: facet('#5e3c22', 0.85), thatch: facet('#6f8a3a', 0.9), cloth: std('#b8463a', 0, 0.8), rope: facet('#c8a878', 0.9),
  };
  const ICO = new THREE.IcosahedronGeometry(1, 1), DOME = new THREE.SphereGeometry(1, 14, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const H0 = -45, TOP = SUM + 7;
  const trunkR = (y) => K.lerp(17, 8.5, K.clamp((y - H0) / (TOP - H0)));

  // a leafy crown: a few faceted blobs
  const crown = (parent, x, y, z, s, seed, mats = [T.leafA, T.leafB, T.leafD]) => {
    for (let k = 0; k < 4; k++) {
      const a = K.hash(seed, k) * 6.3, d = k ? s * 0.55 : 0, m = add(parent, ICO, mats[(seed + k) % mats.length], x + Math.cos(a) * d, y + (k ? -s * 0.15 + K.hash(seed, k + 3) * s * 0.4 : 0), z + Math.sin(a) * d * 0.8);
      m.scale.set(s * (0.75 + 0.3 * K.hash(seed, k + 6)), s * (0.6 + 0.25 * K.hash(seed, k + 9)), s * (0.75 + 0.3 * K.hash(seed, k + 12))); m.rotation.y = k;
    }
  };
  // a small broadleaf tree for the islands, in place of the castle world's pines
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    add(g, CYL6, T.bark, 0, 0.22 * h, 0).scale.set(0.07 * h, 0.44 * h, 0.07 * h);
    crown(g, 0, 0.62 * h, 0, 0.26 * h, seed + 3, (seed % 5 === 2) ? [T.leafC, T.leafB, T.leafA] : [T.leafA, T.leafB, T.leafD]);
    return g;
  };
  // an island: a mossy shelf fungus, held out from the trunk on a branch (the branch is left off for islands that float free)
  const islet = (parent, r, depth, seed, branch = true) => {
    add(parent, turfGeo(r, seed), M.grass);
    const cap = add(parent, DOME, T.fungus, 0, -0.3, 0); cap.scale.set(r * 1.04, 1.25 + 0.15 * (seed % 3), r * 1.0);
    const rim = add(parent, new THREE.TorusGeometry(1, 0.06, 5, 22), T.rim, 0, -0.34, 0); rim.rotation.x = Math.PI / 2; rim.scale.set(r * 1.03, r * 0.99, 2.6);
    for (let k = 0; k < 2; k++) {
      const s = r * (0.55 - 0.15 * k), sub = add(parent, DOME, k ? T.gill : T.fungus, (K.hash(seed, k) - 0.5) * r * 0.6, -1.6 - 1.2 * k, -r * 0.35 - k * 0.5); sub.scale.set(s, 0.6 + 0.2 * k, s * 0.85);
      add(parent, turfGeo(s, seed + k + 5, 9, 0.12), k ? T.gill : T.fungus, sub.position.x, sub.position.y + 0.02, sub.position.z);
    }
    if (!branch) return;
    parent.updateMatrixWorld(true);
    const wy = parent.position.y, reach = RAD - trunkR(wy - 2.2) + 1.6, len = reach - r * 0.2;
    const b = add(parent, new THREE.CylinderGeometry(0.75, 1.7, len, 7), T.bark, 0, -2.2, -(r * 0.2 + len / 2)); b.rotation.x = Math.PI / 2 + 0.06;
    for (let k = 0; k < 2; k++) {
      const z = -(r * 0.6 + len * (0.35 + 0.3 * k)), side = k ? 1 : -1;
      const tw = add(parent, new THREE.CylinderGeometry(0.12, 0.3, 4, 5), T.barkDark, side * 1.6, -3.4, z); tw.rotation.z = side * 0.9;
      crown(parent, side * 3.1, -4.4, z, 1.6, seed * 3 + k);
    }
  };
  // floating seed-islets and plank steps in the air around the stair
  const rocklet = (a, r, y, size, seed, trees = 2) => {
    const g = group(scene, r * Math.sin(a), y, r * Math.cos(a)); g.rotation.y = seed; islet(g, size, size * 1.7, seed, false);
    for (let k = 0; k < trees; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size * (0.6 + 0.4 * K.hash(seed, k + 8)), k + seed);
    anims.push((t) => { g.position.y = y + 0.25 * Math.sin(t * 0.5 + seed); }); return g;
  };
  const step = (x, y, z, seed) => { const s = add(scene, new THREE.BoxGeometry(1.15, 0.14, 0.55), seed % 2 ? T.plank : T.plankDark, x, y, z); s.rotation.y = seed * 1.3; return s; };

  // the trunk, its roots in the morning mist, the boughs and the canopy, and the treehouse on top
  function landmark() {
    const MH = TOP - H0, tg = new THREE.CylinderGeometry(8.5, 17, MH, 30, 18, false); tg.translate(0, H0 + MH / 2, 0);
    const p = tg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr < 1e-4) continue;
      const ang = Math.atan2(z, x), col = Math.round(ang / (Math.PI * 2) * 30), row = Math.round((y - H0) / MH * 18);
      const k = 1 + 0.06 * Math.sin(col * 2.1) + 0.05 * (K.hash(col, row, 3) - 0.5) + (y < H0 + 14 ? 0.12 * Math.max(0, Math.sin(col * 1.3)) * (1 - (y - H0) / 14) : 0);
      p.setXYZ(i, x * k, y + (row > 0 && row < 18 ? (K.hash(row, col, 5) - 0.5) * 1.2 : 0), z * k);
    }
    const mesh = tg.toNonIndexed(), pp = mesh.attributes.position, cols = new Float32Array(pp.count * 3), c = new THREE.Color();
    const A = new THREE.Color('#6b4a32'), B = new THREE.Color('#4e3424'), MOSS = new THREE.Color('#6f9a44');
    for (let f = 0; f < pp.count; f += 3) {
      const x = (pp.getX(f) + pp.getX(f + 1) + pp.getX(f + 2)) / 3, z = (pp.getZ(f) + pp.getZ(f + 1) + pp.getZ(f + 2)) / 3, col = Math.round(Math.atan2(z, x) / (Math.PI * 2) * 60);
      c.copy(col % 2 ? A : B).lerp(A, 0.4 * K.hash(f, 4)); if (K.hash(f, 9) > 0.93) c.lerp(MOSS, 0.7);
      for (let v = 0; v < 3; v++) { cols[(f + v) * 3] = c.r; cols[(f + v) * 3 + 1] = c.g; cols[(f + v) * 3 + 2] = c.b; }
    }
    mesh.setAttribute('color', new THREE.BufferAttribute(cols, 3)); mesh.computeVertexNormals();
    const tm = add(scene, mesh, std('#ffffff', 0, 0.95, { vertexColors: true, flatShading: true }), 0, 0, 0, { cast: false }); tm.receiveShadow = false;
    // roots flaring into the mist
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + 0.3, rt = add(scene, ICO, k % 2 ? T.bark : T.barkDark, Math.sin(a) * 19, -22, Math.cos(a) * 19, { cast: false }); rt.scale.set(4, 6, 9); rt.rotation.y = a; }
    // boughs from the crown of the trunk, then the canopy
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * Math.PI * 2 + 0.5, bg = group(scene, 0, SUM + 2 + (k % 3) * 2, 0); bg.rotation.y = a;
      const b = add(bg, new THREE.CylinderGeometry(0.9, 2.2, 22, 7), T.bark, 0, 6, 9, { cast: false }); b.rotation.x = 1.05;
    }
    for (let k = 0; k < 30; k++) {
      const a = k * 2.399 + 0.4, r = 6 + 22 * Math.sqrt(K.hash(k, 71)), y = SUM + 12 + K.hash(k, 72) * 14 - r * 0.12, s = 6 + 5 * K.hash(k, 73);
      const m = add(scene, ICO, [T.leafA, T.leafB, T.leafD, T.leafA, T.leafC][k % 5], Math.sin(a) * r, y, Math.cos(a) * r, { cast: false }); m.scale.set(s * 1.25, s * 0.8, s * 1.15); m.rotation.y = k;
    }
    // the treehouse: a plank deck on the trunk's crown, two round huts, lanterns and a pennant
    const hg = group(scene, 0, SUM, 0);
    add(hg, new THREE.CylinderGeometry(10.8, 10.2, 0.6, 18), T.plank, 0, -0.3, 0, { cast: false });
    for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; add(hg, new THREE.CylinderGeometry(0.12, 0.12, 1.3, 5), T.plankDark, Math.sin(a) * 10.3, 0.65, Math.cos(a) * 10.3, { cast: false }); }
    const rail = add(hg, new THREE.TorusGeometry(10.3, 0.09, 4, 36), T.rope, 0, 1.25, 0, { cast: false }); rail.rotation.x = Math.PI / 2;
    const winM = lum('#6a4a20', '#ffc66a', 2.2);
    const hut = (x, z, r, h, seed) => {
      const g = group(hg, x, 0, z); g.rotation.y = seed;
      add(g, new THREE.CylinderGeometry(r * 0.95, r, h, 9), T.plank, 0, h / 2, 0, { cast: false });
      add(g, new THREE.ConeGeometry(r * 1.45, r * 1.5, 9), T.thatch, 0, h + r * 0.7, 0, { cast: false });
      for (let k = 0; k < 3; k++) { const a = k * 2.1, w = add(g, new THREE.BoxGeometry(0.55, 0.75, 0.1), winM, Math.sin(a) * r * 0.96, h * 0.55, Math.cos(a) * r * 0.96, { cast: false }); w.rotation.y = a; }
      return g;
    };
    hut(0, 0, 3.4, 5, 0.3); hut(-5.6, 3.2, 2.0, 3.4, 1.2); hut(5.2, -3.6, 1.8, 3.0, 2.2);
    const mast = add(hg, new THREE.CylinderGeometry(0.08, 0.1, 5, 5), T.plankDark, 0, 9.6, 0, { cast: false });
    const flag = add(hg, new THREE.BoxGeometry(1.8, 0.9, 0.04), T.cloth, 0.95, 11.4, 0, { cast: false });
    const lanterns = [];
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2, l = add(hg, new THREE.SphereGeometry(0.28, 8, 6), lum('#7a5a20', '#ffd27a', 2.6), Math.sin(a) * 9.6, 2.1, Math.cos(a) * 9.6, { cast: false }); lanterns.push(l); }
    anims.push((t) => { flag.rotation.y = 0.15 * Math.sin(t * 2.2); lanterns.forEach((l, k) => { l.position.y = 2.1 + 0.06 * Math.sin(t * 1.3 + k); }); });
    void mast;
    // the summit: the canopy unfolds into blossom, and the camera turns to the sea and a far lighthouse (Chapter 3)
    const bloomM = [std('#f4b0cc', 0, 0.7), std('#fff0f6', 0, 0.7), std('#ffd0e0', 0, 0.7)], blooms = [];
    for (let k = 0; k < 90; k++) { const a = k * 2.399 + 0.2, r = 4 + 24 * Math.sqrt(K.hash(k, 91)), m = add(scene, ICO, bloomM[k % 3], Math.sin(a) * r, SUM + 18 + K.hash(k, 92) * 13 - r * 0.12, Math.cos(a) * r, { cast: false }); m.scale.setScalar(0.0001); blooms.push({ m, s: 1.3 + 1.3 * K.hash(k, 93), d: K.hash(k, 94) * 2 }); }
    let bloomAt = -1;
    anims.push((t) => {
      const on = ['summit', 'finale', 'summary'].includes(X.getG().mode); if (on && bloomAt < 0) bloomAt = t; if (!on) bloomAt = -1;
      blooms.forEach((b) => { const u = bloomAt < 0 ? 0 : K.clamp((t - bloomAt - 0.8 - b.d) / 0.7); b.m.scale.setScalar(Math.max(0.0001, b.s * K.ease.out(u))); });
    });
    X.SIG.summit = { dur: 8.5, caption: 'The treehouse canopy unfolds into blossom. Far across the sea, a lighthouse stands on a rock.', cam: X.summitView({ aimY: 20, h: SUM + 48, back: 50, swing: 0.3 }) };
  }

  // far away, other great trees stand in the haze; beyond them the sea, and a lighthouse on a rock
  function distant() {
    const seaR = new THREE.RingGeometry(380, 1050, 64); seaR.rotateX(-Math.PI / 2); add(scene, seaR, std('#4a7aa0', 0.2, 0.3), 0, -45, 0, { cast: false });
    const lg = group(scene, Math.sin(X.spireA) * 560, -45, Math.cos(X.spireA) * 560); lg.scale.setScalar(1.7); const wh = std('#f2eee4', 0, 0.7), rd = std('#c0343c', 0, 0.7);
    add(lg, new THREE.CylinderGeometry(16, 24, 30, 8), T.barkDark, 0, 15, 0, { cast: false });
    add(lg, new THREE.CylinderGeometry(4.2, 6, 46, 14), wh, 0, 53, 0, { cast: false });
    for (const y of [42, 62]) add(lg, new THREE.CylinderGeometry(5.0, 5.4, 7, 14), rd, 0, y, 0, { cast: false });
    add(lg, new THREE.SphereGeometry(3.6, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff0b0').multiplyScalar(1.8), fog: false }), 0, 79, 0, { cast: false });
    add(lg, new THREE.ConeGeometry(5, 5, 14), rd, 0, 84, 0, { cast: false });
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2 + K.hash(k, 81) * 0.3, r = 470 + K.hash(k, 82) * 220, h = 110 + K.hash(k, 83) * 90;
      if (Math.abs(((a - X.spireA) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI) < 0.3) continue;
      const g = group(scene, Math.sin(a) * r, -60, Math.cos(a) * r);
      add(g, new THREE.CylinderGeometry(h * 0.05, h * 0.09, h, 7), T.barkDark, 0, h / 2, 0, { cast: false });
      for (let j = 0; j < 4; j++) { const m = add(g, ICO, j % 2 ? T.leafD : T.leafA, (K.hash(k, j) - 0.5) * h * 0.4, h * (0.85 + 0.15 * j), (K.hash(k, j + 4) - 0.5) * h * 0.4, { cast: false }); m.scale.setScalar(h * (0.22 + 0.06 * K.hash(k, j + 8))); }
    }
  }

  return { islet, tree, rocklet, step, landmark, distant, crown, T };
}
