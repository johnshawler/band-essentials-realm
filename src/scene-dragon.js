// ================================================================ Chapter 11 scenery: the Dragon's Roost
// A smouldering volcano with lava rivers, crowned by a dragon's nest. The islands are basalt columns and cooled lava shelves.
// The dragon circles the peak between islands in a chain of rising and falling arcs, like slurs. At the summit it settles on
// its nest, and far above the clouds a domed observatory floats among the stars (Chapter 12).
const DRAGON_LOOK = {
  // the game props' palette on this chapter's islands
  props: { shield: 'scale', shieldRims: ['#a83a3a', '#d8a840', '#7a2a3a'], shieldFace: '#f0dcc0', 'stone':  '#3a3436', 'stoneDark':  '#241e20', 'stoneLight':  '#c0b0a4', 'wood':  '#2e2422', 'woodDark':  '#1a1414', 'gold':  '#d8a840', 'banner':  '#8a1a1a', 'bannerDark':  '#5a1010', 'pale':  '#d8c8b8', 'frost':  '#c8b0a0', 'slab':  '#1e1a1c', 'rune':  ['#8a2a0a', '#ff6a1a'], 'flame':  ['#8a2a0a', '#ff7a2a'], 'glass':  '#ffb090', 'leather':  '#5a1a1a'},
  env: { top: '#4a2a3a', horizon: '#ff7a3a', bottom: '#2a1410', intensity: 0.55, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#ffa070', power: 3.8 }, { pos: [34, 10, 22], size: [14, 22], color: '#ff6a3a', power: 2.0 }, { pos: [0, 44, -12], size: [44, 12], color: '#c88aa0', power: 1.8 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffb060', power: 2.4 }] },
  hemi: ['#ffb090', '#4a1a10', 0.5], sun: '#ffb080', sunPower: 2.3, fog: '#6a3a34',
  sky: [[0, '#1a1022'], [0.22, '#3a1a30'], [0.36, '#7a2a30'], [0.45, '#d85a30'], [0.5, '#ff9a50'], [0.53, '#8a3020'], [1, '#2a0a08']],
  skyGlow: [[0.3, 0.6, 0.25], [0.7, 0.4, 0.2]], glowRGB: '255,120,60', stars: true,
  sunDisc: { color: '#ffb070', k: 1.4, pos: [-150, 60, -760], r: 50 }, moon2: false,
  peak: '#3a2224', cloud: '#7a4a48', shards: ['#a02a0a', '#ff7a2a', '#a07a2a', '#ffd070'], cloudSea: false,
};

function sceneDragon(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, CYL6, SUM, SIG, getG, NS, RAD } = X;
  const kit = sceneKit(X), { beam, column, ICO, OCT, CONE, ending, glowMat } = kit;
  const T = {
    basalt: facet('#3a3436'), basalt2: facet('#2c2628'), ash: facet('#5a4e4c'), crust: facet('#4a3a36'),
    lava: lum('#8a2a0a', '#ff6a1a', 2.2, { facet: true, rough: 0.6 }), ember: lum('#6a2a0a', '#ffa040', 2.6),
    scale: facet('#7a2a3a'), scale2: facet('#a83a3a'), belly: facet('#e8b86a'), wing: std('#5a1a2a', 0, 0.7, { side: THREE.DoubleSide, flatShading: true }), horn: facet('#e8e0c8'),
    twig: facet('#6a4a2a'), gold: std('#d8a840', 1, 0.3, { flatShading: true }),
  };
  const H0 = -40, vR = (y) => K.lerp(30, 9, K.clamp((y - H0) / (SUM - H0)));
  const HEX = new THREE.CylinderGeometry(1, 1, 1, 6);
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 2) { for (let k = 0; k < 3; k++) { const c = add(g, HEX, T.basalt2, (k - 1) * 0.35 * h * 0.4, 0.2 * h * (1 + 0.4 * k), (k % 2) * 0.2); c.scale.set(0.16 * h, 0.4 * h * (1 + 0.4 * k), 0.16 * h); } }
    else { add(g, CYL6, T.twig, 0, 0.2 * h, 0).scale.set(0.04 * h, 0.4 * h, 0.04 * h); add(g, OCT, T.ember, 0, 0.45 * h, 0, { cast: false }).scale.setScalar(0.08 * h); }
    return g;
  };
  // basalt-column islands: a cluster of hex columns under a cooled-lava crust, with a glowing seam
  const decor = (parent, r, seed) => { for (let k = 0; k < 9; k++) { const a = K.hash(seed, k) * Math.PI * 2, d = r * (0.2 + 0.7 * K.hash(seed, k + 9)), h = 2 + 4 * K.hash(seed, k + 18); const c = add(parent, HEX, k % 2 ? T.basalt : T.basalt2, Math.cos(a) * d, -h / 2 - 0.3, Math.sin(a) * d); c.scale.set(0.9, h, 0.9); } add(parent, new THREE.TorusGeometry(r * 0.98, 0.07, 4, 22), T.lava, 0, -0.32, 0).rotation.x = Math.PI / 2; };
  const islet = (parent, r, depth, seed) => kit.islet(parent, r, depth, seed, { rock: T.basalt, rock2: T.basalt2, top: T.crust, under: T.ash, landR: vR, strut: T.basalt2, strutR: 0.8, decor });
  const rocklet = kit.rocklet({ rock: T.basalt, rock2: T.basalt2, top: T.crust }, (g, size, seed, n) => { for (let k = 0; k < n; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size, k + seed); });
  const step = kit.stepOf(T.basalt, T.basalt2, new THREE.CylinderGeometry(0.45, 0.45, 0.2, 6));

  function dragon() {
    const d = group(scene), body = group(d);
    const torso = add(body, ICO, T.scale, 0, 0, 0, { cast: false }); torso.scale.set(1.2, 1.1, 3.2);
    add(body, ICO, T.belly, 0, -0.45, 0.2, { cast: false }).scale.set(0.9, 0.6, 2.6);
    const neck = add(body, CONE, T.scale, 0, 0.9, 3.4, { cast: false }); neck.scale.set(0.7, 2.6, 0.7); neck.rotation.x = 1.0;
    const head = group(body, 0, 1.9, 4.8); add(head, ICO, T.scale2, 0, 0, 0, { cast: false }).scale.set(0.7, 0.6, 1.3); add(head, CONE, T.horn, 0.35, 0.5, -0.4, { cast: false }).scale.set(0.12, 0.7, 0.12); add(head, CONE, T.horn, -0.35, 0.5, -0.4, { cast: false }).scale.set(0.12, 0.7, 0.12);
    for (const sx of [-0.3, 0.3]) add(head, new THREE.SphereGeometry(0.1, 6, 4), glowMat('#ffd040', 2), sx, 0.15, 0.9);
    const tail = add(body, CONE, T.scale, 0, 0, -5.2, { cast: false }); tail.scale.set(0.8, 5, 0.8); tail.rotation.x = -Math.PI / 2;
    const wings = [-1, 1].map((sx) => { const w = group(body, sx * 0.9, 0.6, 0.6); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 1.4, sx * 7, 0.5, -0.5, 0, 0, -2.2, sx * 7, 0.5, -0.5, sx * 4.5, 0, -3.2, 0, 0, -2.2], 3)); g.computeVertexNormals(); add(w, g, T.wing, 0, 0, 0, { cast: false }); return w; });
    d.scale.setScalar(1.4);
    return { d, body, wings, head };
  }

  function landmark() {
    // the volcano: dark rock streaked with lava rivers, a glowing crater and the dragon's nest on its lip
    const c = new THREE.Color(), DARK = new THREE.Color('#2e2628'), ASH = new THREE.Color('#4a3e3c');
    column({ y0: H0, y1: SUM, r0: 30, r1: 9, seg: 30, rows: 16, jag: 0.12, wob: 1.6, colour: (y, f) => c.copy(K.hash(f, 3) > 0.5 ? DARK : ASH) });
    for (let k = 0; k < 7; k++) {
      const a0 = k / 7 * Math.PI * 2 + 0.3, pts = [];
      for (let j = 0; j <= 14; j++) { const y = SUM - j * (SUM - H0 - 15) / 14, a = a0 + 0.15 * Math.sin(j * 0.8 + k); pts.push(new THREE.Vector3(Math.sin(a) * (vR(y) + 0.3), y, Math.cos(a) * (vR(y) + 0.3))); }
      add(scene, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.9, 5), T.lava, 0, 0, 0, { cast: false });
    }
    const crater = add(scene, new THREE.CylinderGeometry(7, 7, 0.6, 20), glowMat('#ff7a2a', 1.8), 0, SUM - 0.2, 0, { cast: false }); void crater;
    add(scene, new THREE.TorusGeometry(8.2, 1.6, 6, 24), T.basalt, 0, SUM + 0.3, 0, { cast: false }).rotation.x = Math.PI / 2;
    const nest = group(scene, 0, SUM + 1.6, 0);
    for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, tw = add(nest, new THREE.CylinderGeometry(0.15, 0.15, 5, 4), T.twig, Math.sin(a) * 5.2, 0.4 + 0.5 * (k % 3), Math.cos(a) * 5.2, { cast: false }); tw.rotation.set(1.2, a + 0.6, 0.2); }
    for (let k = 0; k < 3; k++) add(nest, new THREE.SphereGeometry(1, 10, 8), T.gold, (k - 1) * 1.6, 0.6, 0.4 * k, { cast: false }).scale.set(0.9, 1.2, 0.9);
    // the lava sea below and embers rising
    const sea = kit.water(H0 + 18, '#3a1a10', 0.6, 0); sea.material.emissive = new THREE.Color('#ff4a10'); sea.material.emissiveIntensity = 0.35;
    const EM = 120, emb = new THREE.InstancedMesh(OCT, T.ember, EM); emb.castShadow = false; emb.frustumCulled = false; scene.add(emb);
    // the dragon: circling the peak in arcs (slurs), settling on its nest at the summit
    const D = dragon(); dragonRef = D; let land = 0;
    anims.push((t) => {
      for (let i = 0; i < EM; i++) { const a = K.hash(i, 1) * Math.PI * 2, r = 20 + 40 * K.hash(i, 2), u = (t * (0.03 + 0.03 * K.hash(i, 3)) + K.hash(i, 4)) % 1; K.place(emb, i, [Math.sin(a + u) * r, H0 + 18 + u * (SUM + 30), Math.cos(a + u) * r], [t, i, 0], 0.15 * (1 - u)); }
      emb.instanceMatrix.needsUpdate = true;
      land += ((ending() ? 1 : 0) - land) * 0.02;
      const w = t * 0.16, R = 52 - 8 * Math.sin(t * 0.07), arc = Math.abs(Math.sin(t * 0.9)), y = SUM * 0.55 + 10 * Math.sin(t * 0.11) + 7 * arc;
      const fly = new THREE.Vector3(Math.sin(w) * R, y, Math.cos(w) * R), perch = new THREE.Vector3(0, SUM + 4.5, 0);
      D.d.position.copy(fly).lerp(perch, land);
      D.d.rotation.set(-0.35 * Math.cos(t * 0.9) * Math.sign(Math.sin(t * 0.9)) * (1 - land), w + Math.PI / 2 + land * 1.2, -0.35 * (1 - land));
      const flap = Math.sin(t * (land > 0.5 ? 2 : 4.2)) * (0.6 - 0.35 * land); D.wings[0].rotation.z = flap; D.wings[1].rotation.z = -flap;
      D.head.rotation.x = 0.15 * Math.sin(t * 1.3);
    });
  }

  let dragonRef = null, carry = false;
  const T0 = X.towards, back = X.spireA + Math.PI, FINE = T0(back, 9.5, SUM + 1.5);
  const stair = (i, dy) => X.islandAt(i, RAD + 18, dy + 3), look = (i) => X.islandAt(i, RAD - 4, 2);
  const keys = [[0, T0(back, 30, SUM + 16), [0, SUM, 0]], [0.18, stair(0, 5), look(0)]];
  for (let k = 1; k <= 4; k++) { const i = Math.round(k * (NS - 1) / 4); keys.push([0.18 + 0.1 * k, stair(i, 5), look(i)]); }
  keys.push([0.68, T0(back, 21, SUM + 5), [FINE[0], FINE[1] + 2.5, FINE[2]]], [1, T0(back, 8, SUM + 52), T0(X.spireA, 560, 150)]);
  SIG.summit = { dur: 12, caption: 'Da capo: back to the first island, up to Fine at the top, and the dragon carries you above the clouds toward an observatory among the stars.', cam: kit.path(keys),
    start: () => { carry = false; },
    update: (u, pos, t) => {
      if (!dragonRef || u < 0.7) return; carry = true;
      const a = X.spireA, f = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)), side = new THREE.Vector3(f.z, 0, -f.x), d = dragonRef.d;
      d.position.set(pos[0], pos[1], pos[2]).addScaledVector(f, 13).addScaledVector(side, 4); d.position.y -= 3.5 - 0.6 * Math.sin(t * 2);
      d.rotation.set(0, a, 0); const flap = Math.sin(t * 4) * 0.6; dragonRef.wings[0].rotation.z = flap; dragonRef.wings[1].rotation.z = -flap;
    } };
  // the Fine banner on the crater's lip, facing the way the camera comes up
  function fine() { const g = group(scene, FINE[0], FINE[1], FINE[2]); g.rotation.y = back; add(g, new THREE.CylinderGeometry(0.15, 0.15, 4.4, 6), T.twig, -1.8, 2.2, 0); add(g, new THREE.CylinderGeometry(0.15, 0.15, 4.4, 6), T.twig, 1.8, 2.2, 0); add(g, new THREE.BoxGeometry(4, 1.5, 0.12), std('#e8d8b0', 0, 0.8), 0, 3.4, 0.1); X.textL(g, 'Fine', 0, 3.4, 0.2, { height: 1.0, color: '#7a1a1a', face: 'italic 700 {px}px "Alegreya"' }); }
  // high above the clouds: a domed observatory floating among the stars (Chapter 12)
  function distant() {
    fine();
    const g = kit.tease(560); g.position.y = 140;
    add(g, new THREE.ConeGeometry(30, 40, 9), facet('#4a4a6a'), 0, -20, 0, { cast: false }).rotation.x = Math.PI;
    add(g, X.turfGeo(30, 3, 12, 2), facet('#6a6a8a'), 0, 0, 0, { cast: false });
    add(g, new THREE.CylinderGeometry(12, 13, 10, 20), facet('#d8d8e8'), 0, 5, 0, { cast: false });
    add(g, new THREE.SphereGeometry(12, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std('#eef0ff', 0.4, 0.3), 0, 10, 0, { cast: false });
    const tel = add(g, new THREE.CylinderGeometry(1.6, 2.4, 16, 12), T.gold, 0, 22, 0, { cast: false }); tel.rotation.z = 0.7;
    for (let k = 0; k < 30; k++) { const s = add(g, OCT, glowMat('#fff4d0', 2), (K.hash(k, 1) - 0.5) * 160, 10 + K.hash(k, 2) * 90, (K.hash(k, 3) - 0.5) * 60, { cast: false }); s.scale.setScalar(0.8 + K.hash(k, 4) * 1.4); }
  }

  // the islands' own decorations and the props' small details
  const dressing = kit.theme({'ground':  ['ember', 'egg', 'ember', 'jag', 'egg'], 'top':  'horn', 'hang':  'emberLamp', 'accent':  'ember'});
  return { ...dressing, islet, tree, rocklet, step, landmark, distant, T };
}
SCENE_REG.dragon = { look: DRAGON_LOOK, make: sceneDragon };
