// ================================================================ Chapter 4 scenery: the Crystal Spire
// A spire of blue crystal rising from a frozen lake, at night under an aurora. The islands are snowy crystal outcrops joined to
// the spire by ice bridges. Every right answer grows a new crystal on the spire beside the island, ringing the answer's note.
// At the summit the aurora brightens into a curtain, and through it a waterfall pours off a far cliff (Chapter 5).
const ICE_LOOK = {
  env: { top: '#14204a', horizon: '#4a6a9a', bottom: '#20304a', intensity: 0.55, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#a8c8ff', power: 3.6 }, { pos: [34, 10, 22], size: [14, 22], color: '#8affc8', power: 1.6 }, { pos: [0, 44, -12], size: [44, 12], color: '#9a8aff', power: 2.0 }, { pos: [-36, 6, -20], size: [16, 12], color: '#c8e0ff', power: 2.0 }] },
  hemi: ['#a8c0ff', '#2a3450', 0.5], sun: '#cfe0ff', sunPower: 1.9, fog: '#2c3a62',
  sky: [[0, '#04061c'], [0.25, '#0a1238'], [0.4, '#16245a'], [0.47, '#2e4a7a'], [0.5, '#4c6a92'], [0.53, '#1c2a48'], [1, '#0a1020']],
  skyGlow: [[0.3, 0.25, 0.22], [0.7, 0.2, 0.18]], glowRGB: '120,255,190', stars: true, moon2: false,
  peak: '#c8d8ee', cloud: '#7a8ab8', shards: ['#2a5ab0', '#6fd0ff', '#5a3ab0', '#c8a8ff'], cloudSea: false,
};

function sceneIce(X) {
  const { THREE, K, scene, add, group, std, facet, anims, CYL6, SUM, SIG, A0, DA, STEP } = X;
  const kit = sceneKit(X), { beam, column, cluster, OCT, CONE, ending } = kit;
  const T = {
    rock: facet('#5c6a8c'), rock2: facet('#46506e'), snow: facet('#eef4fb', 0.8), snow2: facet('#d6e4f4', 0.85),
    ice: std('#a8d8ff', 0.1, 0.15, { flatShading: true, transparent: true, opacity: 0.75, emissive: new THREE.Color('#2a6ab0'), emissiveIntensity: 0.25 }),
    crystal: std('#6fb8ff', 0.15, 0.12, { flatShading: true, emissive: new THREE.Color('#2a7ae0'), emissiveIntensity: 0.55 }),
    crystal2: std('#a890ff', 0.15, 0.12, { flatShading: true, emissive: new THREE.Color('#6a4ae0'), emissiveIntensity: 0.45 }),
    pine: facet('#244a48'), pine2: facet('#2e5a56'), bark: facet('#4a3a3a'),
  };
  const H0 = -24, LAKE = -20, spR = (y) => K.lerp(12, 6.5, K.clamp((y - H0) / (SUM - H0)));
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 3 === 1) { cluster(g, 0, 0, 0, h * 0.45, seed % 2 ? T.crystal : T.crystal2, seed, 4); return g; }
    add(g, CYL6, T.bark, 0, 0.1 * h, 0).scale.set(0.06 * h, 0.2 * h, 0.06 * h);
    for (let k = 0; k < 3; k++) { add(g, CONE, k % 2 ? T.pine2 : T.pine, 0, (0.38 + k * 0.2) * h, 0).scale.set((0.3 - 0.07 * k) * h, 0.36 * h, (0.3 - 0.07 * k) * h); add(g, CONE, T.snow, 0, (0.46 + k * 0.2) * h, 0).scale.set((0.16 - 0.04 * k) * h, 0.16 * h, (0.16 - 0.04 * k) * h); }
    return g;
  };
  const decor = (parent, r, seed) => { cluster(parent, -r * 0.75, 0, -r * 0.45, 1.2, T.crystal, seed * 7, 5); cluster(parent, r * 0.8, 0, -r * 0.35, 0.9, T.crystal2, seed * 7 + 3, 4); for (let k = 0; k < 3; k++) { const a = K.hash(seed, k) * 6.3, c = add(parent, OCT, T.crystal, Math.cos(a) * r * 0.55, -3 - 1.4 * k, Math.sin(a) * r * 0.55); c.scale.set(0.35, 1.6, 0.35); c.rotation.x = Math.PI; } };
  const islet = (parent, r, depth, seed) => kit.islet(parent, r, depth, seed, { rock: T.rock, rock2: T.rock2, top: T.snow, under: T.snow2, landR: spR, strut: T.ice, strutR: 0.32, decor });
  const rocklet = kit.rocklet({ rock: T.rock, rock2: T.rock2, top: T.snow, decor: (p, r, s) => cluster(p, 0, 0, 0, r * 0.7, T.crystal, s, 4) }, (g, size, seed, n) => { for (let k = 0; k < n; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size * 0.9, k * 3); });
  const step = kit.stepOf(T.ice, T.snow2, new THREE.BoxGeometry(1.0, 0.3, 0.7));

  // aurora curtains across the sky behind the spire; they brighten into a full curtain at the summit
  const curtains = [];
  function aurora() {
    const tex = K.canvasTex(512, 256, (ctx, w, h) => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#000000'); g.addColorStop(0.35, '#5a2a90'); g.addColorStop(0.75, '#30e890'); g.addColorStop(1, '#000000');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 2) { ctx.fillStyle = `rgba(0,0,0,${0.65 * (1 - Math.abs(Math.sin(x * 0.07) * Math.sin(x * 0.019)))})`; ctx.fillRect(x, 0, 2, h); }
    });
    for (let k = 0; k < 4; k++) {
      const SEG = 48, geo = new THREE.PlaneGeometry(1, 1, SEG, 1), m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, opacity: 0.5 });
      const mesh = new THREE.Mesh(geo, m); mesh.frustumCulled = false; scene.add(mesh);
      const R = 380 + 70 * k, a0 = Math.PI - 1.5 + 0.3 * k, a1 = Math.PI + 1.3 + 0.25 * k, y0 = 40 + 18 * k, hgt = 90 + 25 * K.hash(k, 3);
      const p = geo.attributes.position;
      curtains.push({ m, update: (t, lift) => {
        for (let i = 0; i <= SEG; i++) {
          const u = i / SEG, a = K.lerp(a0, a1, u) + 0.05 * Math.sin(t * 0.25 + u * 9 + k), r = R + 25 * Math.sin(u * 7 + t * 0.3 + k * 2);
          for (const row of [0, 1]) { const idx = row * (SEG + 1) + i; p.setXYZ(idx, Math.sin(a) * r, y0 + (row ? 0 : hgt * (1 + lift * 0.6)) + 8 * Math.sin(u * 11 + t * 0.4), Math.cos(a) * r); }
        }
        p.needsUpdate = true;
      } });
    }
  }

  function landmark() {
    // the frozen lake, with a pale rim of snow and cracks
    const lakeTex = K.canvasTex(1024, 1024, (ctx, w) => { ctx.fillStyle = '#9ab8d8'; ctx.fillRect(0, 0, w, w); const r = K.rng(9); ctx.strokeStyle = 'rgba(230,245,255,0.55)'; for (let i = 0; i < 90; i++) { ctx.lineWidth = 0.5 + r() * 2; ctx.beginPath(); let x = r() * w, y = r() * w; ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 140; y += (r() - 0.5) * 140; ctx.lineTo(x, y); } ctx.stroke(); } for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.25})`; ctx.beginPath(); ctx.ellipse(r() * w, r() * w, 20 + r() * 90, 8 + r() * 30, r() * 3, 0, 7); ctx.fill(); } });
    lakeTex.wrapS = lakeTex.wrapT = THREE.RepeatWrapping; lakeTex.repeat.set(14, 14);
    const lake = add(scene, new THREE.CircleGeometry(1050, 72), std('#ffffff', 0.25, 0.12, { map: lakeTex }), 0, LAKE, 0, { cast: false }); lake.rotation.x = -Math.PI / 2;
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, d = add(scene, kit.ICO, T.snow, Math.sin(a) * 15, LAKE, Math.cos(a) * 15, { cast: false }); d.scale.set(5 + 3 * K.hash(k, 1), 1.6 + K.hash(k, 2), 5 + 3 * K.hash(k, 3)); }
    // the spire: a six-sided crystal column, deeper blue below, and a great point on top
    const DEEP = new THREE.Color('#1c3a8a'), MID = new THREE.Color('#3a78d8'), PALE = new THREE.Color('#9ad4ff'), c = new THREE.Color();
    column({ y0: H0, y1: SUM, r0: 12, r1: 6.5, seg: 6, rows: 10, jag: 0.03, wob: 0.4, rough: 0.15, metal: 0.15, emissive: ['#1a4aa0', 0.35], colour: (y, f) => c.copy(DEEP).lerp(MID, K.clamp((y - H0) / (SUM - H0))).lerp(PALE, 0.35 * K.hash(f, 7)) });
    add(scene, new THREE.CylinderGeometry(7.2, 6.4, 1.2, 6), T.snow, 0, SUM, 0, { cast: false });
    const topM = std('#bfe6ff', 0.1, 0.1, { flatShading: true, emissive: new THREE.Color('#5ab0ff'), emissiveIntensity: 0.8 });
    const top = add(scene, new THREE.ConeGeometry(5.6, 26, 6), topM, 0, SUM + 13.5, 0, { cast: false });
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, m = add(scene, OCT, k % 2 ? T.crystal : T.crystal2, Math.sin(a) * 6.2, SUM + 3, Math.cos(a) * 6.2, { cast: false }); m.scale.set(1.1, 4 + 2 * K.hash(k, 1), 1.1); m.rotation.set(Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4); }
    for (let k = 0; k < 40; k++) { const a = K.hash(k, 11) * Math.PI * 2, y = H0 + 6 + K.hash(k, 12) * (SUM - H0 - 8), r = spR(y), m = add(scene, OCT, k % 3 ? T.crystal : T.crystal2, Math.sin(a) * r, y, Math.cos(a) * r, { cast: false }); m.scale.set(0.7, 2 + 2 * K.hash(k, 13), 0.7); m.rotation.set(Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9); }
    aurora();
    // the crystals that right answers grow, beside each island in turn (they stay for the rest of the climb)
    const grown = [];
    SIG.onRight = (stop, info) => {
      const side = grown.filter((g) => g.stop === stop).length, a = A0 + stop * DA + (side % 2 ? 0.2 : -0.2), y = stop * STEP + 3.5 + 1.6 * side, r = spR(y) - 0.4;
      const g = group(scene, Math.sin(a) * r, y, Math.cos(a) * r); g.rotation.set(0, a, 0);
      const m = std('#8ae0ff', 0.1, 0.1, { flatShading: true, emissive: new THREE.Color('#6ad8ff'), emissiveIntensity: 2 }), cr = add(g, OCT, m, 0, 0, 0, { cast: false }); cr.rotation.x = 0.75;
      grown.push({ g, cr, m, t0: getT(), stop });
      const n = info.note ? info.note.replace(/(-?\d)$/, (d) => String(Math.max(5, Math.min(6, +d)))) : ['Bb5', 'D6', 'F6', 'C6', 'G5', 'Eb6'][stop % 6];
      if (SIG.snd) SIG.snd.chime(n, 0.12, SIG.now() + 0.35);
    };
    let tNow = 0; const getT = () => tNow;
    anims.push((t) => {
      tNow = t; const lift = ending() ? Math.min(1, (lift0 += 0.01)) : (lift0 = Math.max(0, lift0 - 0.01));
      curtains.forEach((cu, k) => { cu.update(t, lift); cu.m.opacity = 0.32 + 0.12 * Math.sin(t * 0.5 + k) + 0.6 * lift; });
      grown.forEach((g) => { const u = K.clamp((t - g.t0 - 0.3) / 0.6), e = K.ease.out(u); g.cr.scale.set(0.9 * e, 3.2 * e, 0.9 * e); g.m.emissiveIntensity = 0.6 + 1.6 * Math.max(0, 1 - (t - g.t0) / 1.5); });
      topM.emissiveIntensity = 0.7 + 0.2 * Math.sin(t * 1.3) + lift; top.rotation.y = t * 0.05;
    });
  }
  let lift0 = 0;

  // far off: snowy mountains (the castle world's peaks, recoloured), and Chapter 5's waterfall pouring off a cliff
  function distant() {
    const g = kit.tease(560), cliffM = facet('#5a6478'), rock = add(g, new THREE.BoxGeometry(150, 150, 60), cliffM, 0, 55, -20, { cast: false }); rock.rotation.y = Math.PI / 2 + 0.2;
    add(g, new THREE.BoxGeometry(160, 6, 70), T.snow, 0, 131, -20, { cast: false }).rotation.y = Math.PI / 2 + 0.2;
    const fallTex = K.canvasTex(64, 512, (ctx, w, h) => { const r = K.rng(4); ctx.fillStyle = '#9ad0f0'; ctx.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.6})`; ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 8 + r() * 40); } });
    fallTex.wrapT = THREE.RepeatWrapping;
    const fallM = new THREE.MeshBasicMaterial({ map: fallTex, fog: false, color: new THREE.Color('#cfe8ff') });
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(26, 145), fallM); g.add(fall); fall.position.set(0, 58, 0); fall.rotation.y = Math.atan2(-g.position.x, -g.position.z);
    add(g, kit.ICO, T.snow, 0, -18, 0, { cast: false }).scale.set(30, 8, 20);
    anims.push((t) => { fallTex.offset.y = -t * 0.6; });
  }

  return { islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.ice = { look: ICE_LOOK, make: sceneIce };
