// ================================================================ Chapter 5 scenery: the Falls of Echo
// A sheer cliff in the afternoon sun with great waterfalls pouring down its sides into a misty pool, rainbows in the spray.
// The islands are grassy ledges tied back to the cliff with rope bridges. On the Fermata question every waterfall stops in
// mid-air until the player answers. From the top, far off and low, a mine entrance glows (Chapter 6).
const FALLS_LOOK = {
  // the game props' palette on this chapter's islands
  props: { shield: 'stone', shieldRims: ['#7a8478', '#6a7468', '#8a9488'], shieldFace: '#dfe6de', 'stone':  '#7a8478', 'stoneDark':  '#4e5850', 'stoneLight':  '#b8c4b8', 'wood':  '#6a5a3e', 'woodDark':  '#4a3e2a', 'gold':  '#8a7a4a', 'banner':  '#1e6a6a', 'bannerDark':  '#124a4a', 'pale':  '#e4ece4', 'frost':  '#d8e4e0', 'slab':  '#3e4a4e', 'rune':  ['#2a6a7a', '#7ff0e8'], 'glass':  '#a8f0f0', 'leather':  '#2a5a4a'},
  env: { top: '#6a9ae0', horizon: '#ffe0b0', bottom: '#4a6a5a', intensity: 0.7, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#fff0c8', power: 4.8 }, { pos: [34, 10, 22], size: [14, 22], color: '#c8f0ff', power: 2.0 }, { pos: [0, 44, -12], size: [44, 12], color: '#a8c8ff', power: 2.4 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffd090', power: 2.0 }] },
  hemi: ['#d0e4ff', '#4a6a40', 0.55], sun: '#fff0d0', sunPower: 2.9, fog: '#b8d0d8',
  sky: [[0, '#2a64c0'], [0.25, '#4a88d8'], [0.4, '#8ab8e8'], [0.47, '#d8e8f0'], [0.5, '#f4ead0'], [0.53, '#a8b8a0'], [1, '#4a5a48']],
  skyGlow: [[0.84, 0.6, 0.22], [0.66, 0.25, 0.16]], glowRGB: '255,240,200', stars: false,
  sunDisc: { color: '#fff6dc', k: 1.6, pos: [-260, 330, -700], r: 44 }, moon2: false,
  peak: '#6a8a7a', cloud: '#f4f0e8', shards: ['#2a8a9a', '#7ff0e8', '#3a8a4a', '#b0f08a'], cloudSea: false,
};

function sceneFalls(X) {
  const { THREE, K, scene, add, group, std, facet, anims, CYL6, SUM, SIG } = X;
  const kit = sceneKit(X), { beam, column, bands, ICO, CONE, ending } = kit;
  const T = {
    rock: facet('#7a6e62'), rock2: facet('#5e544c'), grass: facet('#5f9a44'), moss: facet('#4a7a3a'), plank: facet('#8a6a46', 0.85), rope: facet('#c8b088', 0.9),
    leaf: facet('#4f8a3a'), leaf2: facet('#6aa448'), bark: facet('#5a4632'), fern: facet('#3e7a3a'),
  };
  const H0 = -26, POOL = -20, cR = (y) => K.lerp(16, 11, K.clamp((y - H0) / (SUM - H0)));
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 3 === 2) { for (let k = 0; k < 5; k++) { const f = add(g, CONE, T.fern, Math.cos(k * 1.26) * 0.25 * h * 0.3, 0.12 * h, Math.sin(k * 1.26) * 0.25 * h * 0.3); f.scale.set(0.05 * h, 0.45 * h, 0.14 * h); f.rotation.set(Math.sin(k * 1.26) * 0.9, k * 1.26, Math.cos(k * 1.26) * 0.9); } return g; }
    add(g, CYL6, T.bark, 0, 0.22 * h, 0).scale.set(0.06 * h, 0.44 * h, 0.06 * h);
    for (let k = 0; k < 3; k++) { const a = K.hash(seed, k) * 6.3, m = add(g, ICO, k % 2 ? T.leaf : T.leaf2, Math.cos(a) * 0.12 * h * (k ? 1 : 0), 0.62 * h + k * 0.05 * h, Math.sin(a) * 0.12 * h * (k ? 1 : 0)); m.scale.set(0.24 * h, 0.2 * h, 0.24 * h); }
    return g;
  };
  // ledges hang off the cliff on rope bridges: two ropes and a run of planks back to the rock
  const decor = (parent, r, seed) => { for (let k = 0; k < 3; k++) { const a = Math.PI * (0.75 + 0.25 * k), m = add(parent, ICO, T.moss, Math.sin(a) * r * 0.95, -0.25, Math.cos(a) * r * 0.95); m.scale.set(0.9, 0.35, 0.9); } };
  const islet = (parent, r, depth, seed) => {
    kit.islet(parent, r, depth, seed, { rock: T.rock, rock2: T.rock2, top: T.grass, under: T.moss, decor });
    parent.updateMatrixWorld(true);
    const reach = X.RAD - cR(parent.position.y - 1) + 0.6, n = Math.floor(reach / 0.7);
    for (let k = 0; k < n; k++) { const z = -r * 0.85 - k * 0.7, sag = -0.25 - 1.4 * Math.sin(Math.PI * k / n); add(parent, new THREE.BoxGeometry(1.5, 0.08, 0.5), T.plank, 0, sag, z); }
    for (const sx of [-1, 1]) { const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push(new THREE.Vector3(sx * 0.75, 0.55 - 1.4 * Math.sin(Math.PI * u), -r * 0.85 - u * (reach - r * 0.85))); } add(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.04, 4), T.rope); }
  };
  const rocklet = kit.rocklet({ rock: T.rock, rock2: T.rock2, top: T.grass }, (g, size, seed, n) => { for (let k = 0; k < n; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size * 0.9, k * 3); });
  const step = kit.stepOf(T.plank, T.rock);

  // the falls: curtains of water on the cliff's flanks (they stop in mid-air on the Fermata question)
  const falls = [];
  let frozen = false;
  SIG.onTerm = (term) => { frozen = term === 'Fermata'; };
  SIG.onLeave = () => { frozen = false; };
  function landmark() {
    const c = new THREE.Color(), MOSS = new THREE.Color('#5a7a44'), WET = new THREE.Color('#3a3634'), band = bands(['#8a7c6c', '#76695c', '#9a8a76', '#6a5e52'], 3.1, H0);
    column({ y0: H0, y1: SUM + 1, r0: 16, r1: 11, seg: 26, rows: 16, jag: 0.09, wob: 1.2, colour: (y, f) => { c.copy(band(y, f)); if (K.hash(f, 12) > 0.86) c.lerp(MOSS, 0.6); if (y < POOL + 4) c.lerp(WET, 0.6); return c; } });
    add(scene, X.turfGeo(11.4, 77, 20, 0.6), T.grass, 0, SUM + 1, 0, { cast: false });
    // the spring on top that feeds them
    const springM = std('#4ab0d8', 0.2, 0.1, { emissive: new THREE.Color('#2a7aa0'), emissiveIntensity: 0.3 });
    add(scene, new THREE.CylinderGeometry(6, 6, 0.2, 24), springM, 0, SUM + 1.25, 0, { cast: false });
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, b = add(scene, ICO, T.rock, Math.sin(a) * 6.6, SUM + 1.4, Math.cos(a) * 6.6, { cast: false }); b.scale.set(1.2, 0.8, 1.2); }
    for (let k = 0; k < 6; k++) tree(scene, Math.sin(k + 0.5) * 9.4, SUM + 1, Math.cos(k + 0.5) * 9.4, 4 + K.hash(k, 3) * 2, k * 3);
    const tex = K.canvasTex(128, 512, (ctx, w, h) => { const r = K.rng(4); ctx.fillStyle = '#7ac8e8'; ctx.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { ctx.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.6})`; ctx.fillRect(r() * w, r() * h, 1 + r() * 4, 10 + r() * 50); } });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 3);
    const fallM = std('#ffffff', 0, 0.25, { map: tex, transparent: true, opacity: 0.92, emissive: new THREE.Color('#2a6a8a'), emissiveIntensity: 0.35, side: THREE.DoubleSide });
    [[-1.25, 0.34], [-0.3, 0.42], [0.65, 0.36], [1.55, 0.34], [Math.PI, 0.6]].forEach(([a, w]) => {
      const g = new THREE.CylinderGeometry(11 + 0.9, 16 + 1.4, SUM + 1 - POOL, 14, 1, true, a - w / 2, w); g.translate(0, (SUM + 1 + POOL) / 2, 0);
      const m = add(scene, g, fallM, 0, 0, 0, { cast: false }); falls.push(m);
    });
    // the pool, mist and foam at the foot, and rainbows in the spray
    kit.water(POOL, '#2a7a8a', 0.25, 0.1);
    const mistTex = K.canvasTex(128, 128, (ctx, w) => { const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, w); });
    const mists = [];
    for (let k = 0; k < 26; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, transparent: true, opacity: 0.45, depthWrite: false })); const a = K.hash(k, 1) * Math.PI * 2, r = 17 + 8 * K.hash(k, 2); sp.position.set(Math.sin(a) * r, POOL + 2 + 5 * K.hash(k, 3), Math.cos(a) * r); sp.scale.setScalar(12 + 10 * K.hash(k, 4)); scene.add(sp); mists.push(sp); }
    const rbTex = K.canvasTex(8, 256, (ctx, w, h) => { const cols = ['#000000', '#ff3030', '#ff9a20', '#fff040', '#40e060', '#40a0ff', '#7040ff', '#000000']; const g = ctx.createLinearGradient(0, 0, 0, h); cols.forEach((cc, i) => g.addColorStop(i / (cols.length - 1), cc)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
    const rbM = new THREE.MeshBasicMaterial({ map: rbTex, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    [[-0.3, 24], [1.55, 28]].forEach(([a, R]) => { const rg = new THREE.RingGeometry(R - 2.4, R, 48, 1, 0, Math.PI), pa = rg.attributes.position, ua = rg.attributes.uv; for (let i = 0; i < pa.count; i++) ua.setXY(i, 0.5, (Math.hypot(pa.getX(i), pa.getY(i)) - (R - 2.4)) / 2.4); const rb = new THREE.Mesh(rg, rbM); const d = 24; rb.position.set(Math.sin(a) * d, POOL, Math.cos(a) * d); rb.rotation.y = a; scene.add(rb); });
    let off = 0, last = 0;
    anims.push((t) => {
      const dt = Math.min(0.1, Math.max(0, t - last)); last = t; if (!frozen) off += dt * 0.9; tex.offset.y = off;
      fallM.emissiveIntensity = frozen ? 0.9 + 0.2 * Math.sin(t * 4) : 0.35;
      mists.forEach((m, k) => { m.material.opacity = frozen ? 0.2 : 0.35 + 0.12 * Math.sin(t * 0.8 + k); m.position.y += frozen ? 0 : 0.004 * Math.sin(t + k); });
      rbM.opacity = 0.3 + 0.08 * Math.sin(t * 0.6) + (ending() ? 0.25 : 0);
    });
  }

  // the summit: first the spring that feeds the falls, then far below, the glowing mouth of a mine
  SIG.summit = { dur: 9, caption: 'At the top is the spring that feeds the falls. Far below, the mouth of a mine glows.', cam: (u) => {
    const v = X.summitView({ aimY: -14, h: SUM + 20, back: 30, swing: 0.25, r: 520 })(u), e = K.ease.inOut(K.seg(u, 0.3, 0.7)), spring = [0, SUM + 1, 0];
    return { pos: v.pos, aim: spring.map((x, i) => K.lerp(x, v.aim[i], e)) };
  } };
  // far off and low: other cliffs, and the glowing mouth of a mine (Chapter 6)
  function distant() {
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + K.hash(k, 81) * 0.3, r = 240 + K.hash(k, 82) * 300, h = 40 + K.hash(k, 83) * 70, w = 20 + 20 * K.hash(k, 84); if (Math.abs(((a - X.spireA) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI) < 0.25) continue; add(scene, new THREE.CylinderGeometry(w * 0.7, w, h, 7), k % 2 ? T.rock : T.rock2, Math.sin(a) * r, POOL + h / 2, Math.cos(a) * r, { cast: false }).rotation.y = k; add(scene, X.turfGeo(w * 0.72, k, 9, 1.2), T.grass, Math.sin(a) * r, POOL + h, Math.cos(a) * r, { cast: false }); }
    const g = kit.tease(520);
    add(g, new THREE.SphereGeometry(60, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), T.rock2, 0, -12, 0, { cast: false }).scale.y = 0.7;
    const glow = kit.glowMat('#ffa040', 1.8), mouth = new THREE.Mesh(new THREE.CircleGeometry(9, 20, 0, Math.PI), glow); g.add(mouth); mouth.position.set(0, -12, 0); mouth.rotation.y = Math.atan2(-g.position.x, -g.position.z); mouth.translateZ(60.5);
    for (let k = 0; k < 5; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), kit.glowMat('#ffd080', 2)); g.add(l); l.position.copy(mouth.position); l.rotation.copy(mouth.rotation); l.translateX((k - 2) * 7); l.translateY(-4 + Math.abs(k - 2) * 2); l.translateZ(4); }
    anims.push((t) => { glow.color.setRGB(1, 0.63, 0.25).multiplyScalar(1.6 + 0.3 * Math.sin(t * 2.3) + (ending() ? 0.8 : 0)); });
  }

  // the islands' own decorations and the props' small details
  const dressing = kit.theme({'ground':  ['fern', 'pebbles', 'fern', 'flowers', 'pebbles'], 'top':  'mossTop', 'hang':  'drip', 'accent':  'fern'});
  return { ...dressing, islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.falls = { look: FALLS_LOOK, make: sceneFalls };
