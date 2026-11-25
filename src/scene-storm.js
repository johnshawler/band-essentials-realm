// ================================================================ Chapter 10 scenery: the Storm Peak
// A jagged black mountain wrapped in a thunderstorm, rain sweeping past and lightning flashing. The islands are wind-carved
// rock shelves climbing through the cloud layer. During Read Rhythms lightning strikes on every accented note. The storm thins
// near the top, and at the summit the player breaks through into calm sky; to the south a volcano smokes (Chapter 11).
const STORM_LOOK = {
  env: { top: '#3a4466', horizon: '#6a7088', bottom: '#1a1c26', intensity: 0.5, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#c8d0ff', power: 3.0 }, { pos: [34, 10, 22], size: [14, 22], color: '#a0a8c8', power: 1.6 }, { pos: [0, 44, -12], size: [44, 12], color: '#8a90c0', power: 2.0 }, { pos: [-36, 6, -20], size: [16, 12], color: '#b8c0e0', power: 1.6 }] },
  hemi: ['#a8b0d8', '#24242e', 0.48], sun: '#d8e0ff', sunPower: 1.7, fog: '#3a3e52',
  sky: [[0, '#4a6aa8'], [0.18, '#3a4a78'], [0.3, '#2a3050'], [0.42, '#22263a'], [0.5, '#3a3e52'], [0.53, '#1e2030'], [1, '#12141c']],
  skyGlow: [[0.84, 0.2, 0.2], [0.3, 0.15, 0.2]], glowRGB: '180,190,255', stars: false,
  sunDisc: { color: '#e8ecff', k: 1.2, pos: [-200, 420, -650], r: 34 }, moon2: false,
  peak: '#2a2c38', cloud: '#5a5e74', shards: ['#3a4ab0', '#a0b8ff', '#6a3ab0', '#d0a8ff'],
};

function sceneStorm(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, CYL6, SUM, SIG, getG, NS } = X;
  const kit = sceneKit(X), { beam, column, bands, ICO, OCT, CONE, ending, glowMat } = kit;
  const T = { rock: facet('#3a3a44'), rock2: facet('#2a2a34'), grass: facet('#4a6a4a'), grass2: facet('#3a5a40'), bark: facet('#3a302c'), cloud: facet('#4a4e62', 1), cloud2: facet('#5e6278', 1) };
  const H0 = -40, mR = (y) => K.lerp(22, 9, K.clamp((y - H0) / (SUM - H0)));
  // a bent, windswept tree, or a jag of rock
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 2) { const r = add(g, CONE, T.rock2, 0, 0.3 * h, 0); r.scale.set(0.25 * h, 0.6 * h, 0.2 * h); r.rotation.z = 0.25; return g; }
    const t = add(g, CYL6, T.bark, 0.1 * h, 0.25 * h, 0); t.scale.set(0.05 * h, 0.5 * h, 0.05 * h); t.rotation.z = -0.35;
    for (let k = 0; k < 2; k++) { const c = add(g, ICO, T.grass2, 0.3 * h + 0.15 * h * k, 0.52 * h - 0.05 * h * k, 0); c.scale.set(0.22 * h, 0.1 * h, 0.18 * h); }
    return g;
  };
  const islet = (parent, r, depth, seed) => kit.islet(parent, r, depth, seed, { rock: T.rock, rock2: T.rock2, top: T.grass, under: T.rock2, landR: mR, strut: T.rock, strutR: 0.9 });
  const rocklet = kit.rocklet({ rock: T.rock, rock2: T.rock2, top: T.grass2 }, (g, size, seed, n) => { for (let k = 0; k < n; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size, k + seed); });
  const step = kit.stepOf(T.rock, T.rock2, new THREE.DodecahedronGeometry(0.45, 0));

  // the storm's strength: 1 down in it, easing off over the top islands, gone at the summit
  let stormTo = 1, storm = 1;
  SIG.onStop = (j) => { stormTo = j >= NS - 3 ? 0.35 - 0.1 * (j - (NS - 3)) : 1; };
  const strikes = [];   // scene times of lightning
  SIG.onRhythm = (r) => { r.accents.forEach((t) => strikes.push(t)); if (!SIG.snd) return; const off = SIG.now() - getG().t; r.accents.forEach((t) => SIG.snd.thunder(t + off + 0.25, 0.8)); };

  function landmark() {
    const c = new THREE.Color(), band = bands(['#34343e', '#2a2a32', '#3e3e48'], 3.4, H0);
    column({ y0: H0, y1: SUM + 2, r0: 22, r1: 9, seg: 14, rows: 16, jag: 0.22, wob: 2.4, colour: (y, f) => c.copy(band(y, f)) });
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2 + K.hash(k, 1), y = H0 + 10 + K.hash(k, 2) * (SUM - H0 - 10), r = mR(y), m = add(scene, CONE, T.rock2, Math.sin(a) * r, y, Math.cos(a) * r, { cast: false }); m.scale.set(3, 10 + 8 * K.hash(k, 3), 3); m.rotation.set(Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); }
    const crown = add(scene, CONE, T.rock, 0, SUM + 9, 0, { cast: false }); crown.scale.set(9, 16, 9);
    add(scene, X.turfGeo(9.2, 51, 14, 0.6), T.grass, 0, SUM + 2, 0, { cast: false });
    // storm clouds wrapped round the mountain below the summit
    const CL = 70, clouds = new THREE.InstancedMesh(ICO, T.cloud, CL); clouds.castShadow = false; scene.add(clouds);
    // clouds hug the mountain inside the ring of islands, and a far ring lies well beyond the camera's path
    const cl = Array.from({ length: CL }, (_, i) => { const near = i < 40, y = -10 + (SUM - 12) * K.hash(i, 3); return { a: K.hash(i, 1) * Math.PI * 2, r: near ? mR(y) + 3 + 4 * K.hash(i, 2) : 150 + 90 * K.hash(i, 2), y: near ? y : -15 + 40 * K.hash(i, 3), s: near ? 3.5 + 3 * K.hash(i, 4) : 16 + 14 * K.hash(i, 4), sp: (near ? 0.03 : 0.01) + 0.02 * K.hash(i, 5) }; });
    // rain: streaks falling all round the climb
    const RN = 700, rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 1.4, 0.03), std('#b8c4e0', 0, 0.4, { transparent: true, opacity: 0.45 }), RN); rain.castShadow = false; rain.frustumCulled = false; scene.add(rain);
    const rn = Array.from({ length: RN }, (_, i) => ({ a: K.hash(i, 11) * Math.PI * 2, r: 22 + 40 * K.hash(i, 12), y0: K.hash(i, 13), sp: 30 + 15 * K.hash(i, 14) }));
    // lightning: bolts round the peak, a flash light, and the sky lighting up
    const flash = new THREE.PointLight('#c8d4ff', 0, 300, 1.2); flash.position.set(0, SUM + 20, 40); scene.add(flash);
    const boltM = glowMat('#e0e8ff', 0), bolts = [];
    for (let k = 0; k < 4; k++) {
      const pts = [], a = k * 1.7 + 0.5, r = 30 + 12 * k; let x = Math.sin(a) * r, z = Math.cos(a) * r;
      for (let j = 0; j <= 8; j++) { pts.push(new THREE.Vector3(x, SUM + 30 - j * (SUM + 40) / 8, z)); x += (K.hash(k, j) - 0.5) * 8; z += (K.hash(k, j + 9) - 0.5) * 8; }
      const b = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), 40, 0.35, 4), boltM); b.visible = false; scene.add(b); bolts.push(b);
    }
    const amb = new THREE.AmbientLight('#c8d4ff', 0); scene.add(amb);
    let nextRandom = 4, last = 0, which = 0;
    anims.push((t) => {
      const dt = Math.min(0.1, Math.max(0, t - last)); last = t;
      storm += ((ending() ? 0 : stormTo) - storm) * 0.02;
      cl.forEach((q, i) => { const a = q.a + t * q.sp; K.place(clouds, i, [Math.sin(a) * q.r, q.y + 1.5 * Math.sin(t * 0.2 + i), Math.cos(a) * q.r], [0, a, 0], [q.s * 1.5, q.s * 0.55, q.s]); });
      clouds.instanceMatrix.needsUpdate = true;
      rn.forEach((q, i) => { const y = SUM + 25 - ((q.y0 * (SUM + 60) + t * q.sp) % (SUM + 60)); K.place(rain, i, [Math.sin(q.a + 0.2 * y / 30) * q.r, y, Math.cos(q.a + 0.2 * y / 30) * q.r], [0.25, q.a, 0], storm > 0.05 ? 1 : 0.0001); });
      rain.instanceMatrix.needsUpdate = true; rain.material.opacity = 0.45 * storm;
      // a random strike now and then while the storm is up
      if (t > nextRandom && storm > 0.3) { strikes.push(t); nextRandom = t + 5 + 7 * Math.random(); if (SIG.snd) SIG.snd.thunder(SIG.now() + 0.6 + Math.random(), 0.6 * storm); }
      let f = 0; for (const s of strikes) { const u = t - s; if (u >= 0 && u < 0.45) { f = Math.max(f, (u < 0.08 ? 1 : 0.5 * (1 - u / 0.45)) * (u > 0.12 && u < 0.18 ? 0.3 : 1)); if (u < dt + 0.01) which = (which + 1) % bolts.length; } }
      flash.intensity = f * 9000; amb.intensity = f * 2.2; boltM.color.setRGB(0.9, 0.93, 1).multiplyScalar(f * 3);
      bolts.forEach((b, k) => { b.visible = f > 0.15 && k === which; });
      while (strikes.length && t - strikes[0] > 2) strikes.shift();
    });
  }

  // far to the south: a volcano with a glowing crater and a column of smoke (Chapter 11)
  function distant() {
    const g = kit.tease(560), vm = facet('#3a2a2a');
    add(g, new THREE.CylinderGeometry(18, 110, 150, 12), vm, 0, -5, 0, { cast: false });
    const crater = add(g, new THREE.CylinderGeometry(16, 16, 2, 16), glowMat('#ff6a20', 1.8), 0, 70, 0, { cast: false }); void crater;
    const smoke = [];
    for (let k = 0; k < 10; k++) { const m = add(g, ICO, facet('#4a4446', 1), 0, 80 + k * 14, 0, { cast: false }); m.scale.setScalar(12 + k * 3); smoke.push(m); }
    anims.push((t) => smoke.forEach((m, k) => { const u = ((t * 0.05 + k / 10) % 1); m.position.set(u * 60, 75 + u * 150, u * 10); m.scale.setScalar(10 + u * 40); }));
  }

  return { islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.storm = { look: STORM_LOOK, make: sceneStorm };
