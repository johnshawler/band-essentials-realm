// ================================================================ Chapter 6 scenery: the Deep Mine
// A vast cavern round a pillar of rock laced with glowing ore, lit by lanterns. The climb starts deep down (fitting the low new
// notes) on scaffold platforms and works up toward a ring of daylight; the cavern grows lighter at every island, and the top
// islands rise out of it into sunrise. Forte answers boom through the cave and piano answers whisper. From the top, two towers
// stand across the valley (Chapter 7).
const MINE_LOOK = {
  env: { top: '#ffb070', horizon: '#6a4a3a', bottom: '#1a120e', intensity: 0.38, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#ffb070', power: 3.2 }, { pos: [34, 10, 22], size: [14, 22], color: '#ff9040', power: 1.6 }, { pos: [0, 44, -12], size: [44, 12], color: '#ffd8a0', power: 2.2 }, { pos: [-36, 6, -20], size: [16, 12], color: '#60d0c0', power: 1.4 }] },
  hemi: ['#ffcf9a', '#2a1c14', 0.34], sun: '#ffc890', sunPower: 1.8, fog: '#2a1e18',
  sky: [[0, '#1a2050'], [0.25, '#3a3a7a'], [0.4, '#8a5a8a'], [0.46, '#f0905a'], [0.5, '#ffd080'], [0.53, '#a8705a'], [1, '#2a1a1a']],
  skyGlow: [[0.84, 0.95, 0.24], [0.66, 0.35, 0.16]], glowRGB: '255,190,120', stars: false,
  sunDisc: { color: '#ffd090', k: 1.7, pos: [-150, 40, -760], r: 50 }, moon2: false,
  peak: '#3a2a3a', cloud: '#d89a80', shards: ['#a0400a', '#ffa040', '#1a7a7a', '#60f0d8'], cloudSea: false, peaks: false, drift: false,
};

function sceneMine(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, CYL6, SUM, SIG, NS } = X;
  const kit = sceneKit(X), { beam, column, bands, ICO, OCT, CONE, ending, glowMat } = kit;
  const T = {
    rock: facet('#5a4a44'), rock2: facet('#443834'), plank: facet('#8a6440', 0.85), plank2: facet('#6a4a30', 0.85), iron: std('#3a3a40', 0.7, 0.45, { flatShading: true }),
    ore: lum('#a0400a', '#ffa040', 1.6, { facet: true, rough: 0.3 }), ore2: lum('#1a6a6a', '#60f0d8', 1.4, { facet: true, rough: 0.3 }), lamp: lum('#7a4a10', '#ffc060', 3.0),
  };
  const H0 = -40, WALL = 112, RIM = SUM - 4, pR = (y) => K.lerp(15, 10, K.clamp((y - H0) / (SUM - H0)));
  // the cave's own light: dim at the bottom, brighter island by island
  const amb = new THREE.AmbientLight('#ffcf9a', 0.15); scene.add(amb);
  let target = 0, level = 0;
  SIG.onStop = (j) => { target = j / (NS - 1); };
  // forte booms, mezzo forte rings out, piano whispers
  SIG.onRight = (stop, info) => {
    const s = SIG.snd; if (!s || !info.term) return; const t = SIG.now();
    if (info.term === 'Forte') { s.play('impact', { gain: 0.7 }, t + 0.15); s.play('impact', { gain: 0.35 }, t + 0.55); s.play('impact', { gain: 0.15 }, t + 0.95); }
    else if (info.term === 'Mezzo forte') { s.play('thud', { gain: 0.5, f: 110 }, t + 0.15); s.play('thud', { gain: 0.25, f: 110 }, t + 0.5); }
    else if (info.term === 'Piano') { s.chime('F6', 0.03, t + 0.15); s.chime('F6', 0.015, t + 0.55); }
  };
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 3 === 0) { add(g, new THREE.CylinderGeometry(0.05, 0.06, h * 0.55, 5), T.plank2, 0, h * 0.27, 0); add(g, box3(0.4, 0.05, 0.05), T.iron, 0.18, h * 0.53, 0); const l = add(g, new THREE.SphereGeometry(0.16, 8, 6), T.lamp, 0.34, h * 0.45, 0, { cast: false }); void l; return g; }
    if (seed % 3 === 1) { kit.cluster(g, 0, 0, 0, h * 0.35, seed % 2 ? T.ore : T.ore2, seed, 4); return g; }
    const cart = group(g, 0, 0.3, 0); add(cart, box3(1.0, 0.5, 0.65), T.plank2, 0, 0.25, 0); add(cart, box3(1.04, 0.06, 0.69), T.iron, 0, 0.5, 0); for (const sx of [-0.32, 0.32]) for (const sz of [-0.33, 0.33]) { const w = add(cart, new THREE.CylinderGeometry(0.13, 0.13, 0.06, 10), T.iron, sx, 0, sz); w.rotation.x = Math.PI / 2; }
    kit.cluster(cart, 0, 0.45, 0, 0.5, T.ore, seed, 3); return g;
  };
  const box3 = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  // scaffold platforms: a rock ledge with a plank deck and timber struts back to the pillar
  const decor = (parent, r, seed) => { for (let k = 0; k < 4; k++) { const a = Math.PI * (0.6 + 0.27 * k), px = Math.sin(a) * r * 0.95, pz = Math.cos(a) * r * 0.95; add(parent, new THREE.CylinderGeometry(0.14, 0.14, 2.6, 6), T.plank2, px, -1.0, pz); } };
  const islet = (parent, r, depth, seed) => kit.islet(parent, r, depth, seed, { rock: T.rock, rock2: T.rock2, top: T.plank, under: T.plank2, landR: pR, strut: T.plank2, strut2: T.iron, decor });
  const rocklet = kit.rocklet({ rock: T.rock, rock2: T.rock2, top: T.rock2 }, (g, size, seed) => kit.cluster(g, 0, 0, 0, size * 0.8, seed % 2 ? T.ore : T.ore2, seed, 4));
  const step = kit.stepOf(T.plank, T.plank2);

  function landmark() {
    const c = new THREE.Color(), band = bands(['#5a4a44', '#4a3c38', '#665650', '#3e322e'], 2.6, H0);
    column({ y0: H0, y1: SUM, r0: 15, r1: 10, seg: 24, rows: 18, jag: 0.1, wob: 1.1, colour: (y, f) => c.copy(band(y, f)) });
    // ore veins and lanterns round the pillar, and a ladder of rails
    for (let k = 0; k < 60; k++) { const a = K.hash(k, 21) * Math.PI * 2, y = H0 + 4 + K.hash(k, 22) * (SUM - H0 - 6), r = pR(y), m = add(scene, OCT, k % 3 ? T.ore : T.ore2, Math.sin(a) * r, y, Math.cos(a) * r, { cast: false }); m.scale.set(0.6, 1.4 + K.hash(k, 23), 0.6); m.rotation.set(Math.cos(a) * 1.1, 0, -Math.sin(a) * 1.1); }
    const lamps = [];
    for (let k = 0; k < 28; k++) { const a = k * 2.399, y = H0 + 6 + (k / 28) * (SUM - H0 - 6), r = pR(y) + 0.5, l = add(scene, new THREE.SphereGeometry(0.4, 8, 6), T.lamp, Math.sin(a) * r, y, Math.cos(a) * r, { cast: false }); lamps.push(l); }
    // the cavern: an inward-facing wall, banded and studded with ore, open above to the sky; a floor far below
    const wg = new THREE.CylinderGeometry(WALL, WALL * 1.15, RIM - H0 + 10, 40, 10, true); wg.translate(0, (RIM + H0 - 10) / 2, 0);
    const p = wg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i), k = 1 + 0.1 * (K.hash(Math.round(Math.atan2(z, x) * 7), Math.round(y / 6), 3) - 0.5); p.setX(i, x * k); p.setZ(i, z * k); }
    const wm = wg.toNonIndexed(), wp = wm.attributes.position, wc = new Float32Array(wp.count * 3), wb = bands(['#3a302c', '#2e2622', '#463a34'], 5, H0);
    for (let f = 0; f < wp.count; f += 3) { const col = wb((wp.getY(f) + wp.getY(f + 1) + wp.getY(f + 2)) / 3, f); for (let v = 0; v < 3; v++) { wc[(f + v) * 3] = col.r; wc[(f + v) * 3 + 1] = col.g; wc[(f + v) * 3 + 2] = col.b; } }
    wm.setAttribute('color', new THREE.BufferAttribute(wc, 3)); wm.computeVertexNormals();
    add(scene, wm, std('#ffffff', 0, 0.95, { vertexColors: true, flatShading: true, side: THREE.BackSide }), 0, 0, 0, { cast: false });
    add(scene, new THREE.TorusGeometry(WALL, 6, 6, 40), T.rock2, 0, RIM + 1, 0, { cast: false }).rotation.x = Math.PI / 2;
    const fl = add(scene, new THREE.CircleGeometry(WALL * 1.2, 40), T.rock2, 0, H0 + 1, 0, { cast: false }); fl.rotation.x = -Math.PI / 2;
    for (let k = 0; k < 90; k++) { const a = K.hash(k, 31) * Math.PI * 2, y = H0 + 4 + K.hash(k, 32) * (RIM - H0 - 4), r = WALL - 1.5, m = add(scene, OCT, k % 4 ? T.ore : T.ore2, Math.sin(a) * r, y, Math.cos(a) * r, { cast: false }); m.scale.set(1.2, 2.6 + 2 * K.hash(k, 33), 1.2); }
    for (let k = 0; k < 40; k++) { const a = K.hash(k, 41) * Math.PI * 2, y = H0 + 6 + K.hash(k, 42) * (RIM - H0 - 10), r = WALL - 2, l = add(scene, new THREE.SphereGeometry(0.9, 8, 6), T.lamp, Math.sin(a) * r, y, Math.cos(a) * r, { cast: false }); lamps.push(l); }
    // daylight pouring through the opening: a soft shaft that grows as the climb rises
    const shaftTex = K.canvasTex(8, 256, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff0c0'); g.addColorStop(1, '#000000'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
    const shaftM = new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, opacity: 0.1 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(70, 30, RIM - H0, 24, 1, true), shaftM); shaft.position.set(-8, (RIM + H0) / 2, 6); shaft.rotation.z = 0.1; scene.add(shaft);
    // a hoist frame on top of the pillar
    const hg = group(scene, 0, SUM, 0);
    for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) beam(hg, [x, 0, z], [x * 0.3, 9, z * 0.3], 0.25, T.plank2);
    add(hg, new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16), T.iron, 0, 9.2, 0).rotation.x = Math.PI / 2;
    add(hg, X.turfGeo(10.4, 41, 18, 0.5), T.plank, 0, 0.25, 0, { cast: false });
    anims.push((t) => {
      level += (target - level) * 0.02; const L = ending() ? 1 : level;
      amb.intensity = 0.12 + 0.9 * L; shaftM.opacity = 0.05 + 0.25 * L;
      lamps.forEach((l, k) => { l.scale.setScalar(1 + 0.12 * Math.sin(t * 7 + k * 1.7) * Math.sin(t * 3.1 + k)); });
    });
  }

  // beyond the rim, across the valley: two stone towers on neighbouring crags, a low one and a high one (Chapter 7)
  function distant() {
    const g = kit.tease(520), stone = facet('#8a7e90'), roof = facet('#3a4a8a'), win = glowMat('#ffd890', 1.6);
    [[-40, 0, 70, 9], [40, 0, 130, 11]].forEach(([x, z, h, r]) => {
      const t = group(g, x, 0, z); add(t, new THREE.CylinderGeometry(r * 3, r * 4, 70, 8), T.rock2, 0, 5, 0, { cast: false });
      add(t, new THREE.CylinderGeometry(r * 0.9, r, h, 10), stone, 0, 40 + h / 2, 0, { cast: false }); add(t, new THREE.ConeGeometry(r * 1.3, r * 2.4, 10), roof, 0, 40 + h + r * 1.2, 0, { cast: false });
      for (let k = 0; k < 4; k++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(r * 0.35, r * 0.6), win); t.add(w); w.position.set(0, 46 + k * h / 4.5, 0); w.rotation.y = Math.atan2(-g.position.x - x, -g.position.z - z); w.translateZ(r * 0.98); }
    });
  }

  return { islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.mine = { look: MINE_LOOK, make: sceneMine };
