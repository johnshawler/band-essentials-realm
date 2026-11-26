// ================================================================ Chapter 3 scenery: the Lighthouse at Cloud's End
// A white lighthouse on a tall sea stack at dusk, with waves breaking round its foot and gulls circling. The islands are rock
// ledges with wooden landings, propped against the stack on timber struts. During Read Rhythms the lamp's two beams turn half a
// circle per beat and the lamp flashes on the notes (SIG, shared with the game). At the summit the lamp blazes and its beam swings
// across the water to Chapter 4's ice spire on the horizon.
const LIGHT_LOOK = {
  // the game props' palette on this chapter's islands
  props: { shield: 'circle', shieldRims: ['#d83a3a', '#d83a3a', '#d83a3a'], shieldFace: '#f4f0e8', 'stone':  '#b8b4ac', 'stoneDark':  '#6e6874', 'stoneLight':  '#e8e4dc', 'wood':  '#7a6a5a', 'woodDark':  '#4a4038', 'gold':  '#b89a5a', 'banner':  '#1e3a6a', 'bannerDark':  '#142a4e', 'pale':  '#f0ece4', 'frost':  '#f4f0e8', 'slab':  '#e8e0d0', 'rune':  ['#2a6a7a', '#6ff0e0'], 'glass':  '#b8e0ff', 'leather':  '#2a4a6a'},
  env: { top: '#2a2c6e', horizon: '#ff9c74', bottom: '#1a2648', intensity: 0.62, blur: 0.06, panels: [
    { pos: [-22, 24, 40], size: [34, 18], color: '#ffc090', power: 4.4 }, { pos: [34, 10, 22], size: [14, 22], color: '#ff9ab8', power: 2.0 }, { pos: [0, 44, -12], size: [44, 12], color: '#8a9cff', power: 2.2 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffa060', power: 2.6 }] },
  hemi: ['#a4a8ff', '#3a3452', 0.45], sun: '#ffb486', sunPower: 2.4, fog: '#5e4f80',
  sky: [[0, '#0a0e34'], [0.2, '#18205e'], [0.34, '#36388a'], [0.43, '#7c5698'], [0.475, '#e48270'], [0.495, '#ffbc72'], [0.505, '#e8906e'], [0.53, '#3c3c70'], [1, '#0e1430']],
  skyGlow: [[0.84, 0.85, 0.22], [0.66, 0.3, 0.16]], glowRGB: '255,170,110', stars: true,
  sunDisc: { color: '#ffb070', k: 1.6, pos: [-150, 26, -760], r: 58 }, moon2: false,
  peak: '#2c2a46', cloud: '#c98aa6', shards: ['#1a6a7a', '#5ff0e0', '#a03a56', '#ff9ab8'], cloudSea: false, peaks: false,
};

function sceneLight(X) {
  const { THREE, K, scene, add, group, std, facet, lum, anims, turfGeo, rockGeo, CYL6, M, RAD, SUM, SIG, getG, spireA } = X;
  const T = {
    rock: facet('#6e6474'), rockDark: facet('#4a4258'), sand: facet('#b9a47e'), dune: facet('#7d8f52'),
    plank: facet('#8a6646', 0.85), plankDark: facet('#5a4030', 0.85), rope: facet('#c8a878', 0.9),
    white: facet('#eee8de', 0.7), red: facet('#b3313c', 0.7), iron: std('#2a2a36', 0.6, 0.45, { flatShading: true }),
    cypress: facet('#2f5848'), cypress2: facet('#3e6e52'), grass: facet('#a8a456'), sea: std('#1d2a54', 0.15, 0.3),
  };
  const ICO = new THREE.IcosahedronGeometry(1, 1), CONE = new THREE.ConeGeometry(1, 1, 7);
  const SEA_Y = -20, H0 = -26;
  const stackR = (y) => K.lerp(15, 10, K.clamp((y - H0) / (SUM - H0)));
  // a timber between two points
  const UPV = new THREE.Vector3(0, 1, 0);
  const beam = (parent, a, b, r, mat) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), m = add(parent, new THREE.CylinderGeometry(r, r, d.length(), 6), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    m.quaternion.setFromUnitVectors(UPV, d.normalize()); return m;
  };

  // a windswept cypress for the islands (every third one is a tuft of dune grass)
  const tree = (parent, x, y, z, h, seed = 0) => {
    const g = group(parent, x, y, z); g.rotation.y = seed;
    if (seed % 3 === 2) { for (let k = 0; k < 6; k++) { const b = add(g, CONE, T.grass, (K.hash(seed, k) - 0.5) * 0.5, 0.25 * h * 0.4, (K.hash(seed, k + 6) - 0.5) * 0.5); b.scale.set(0.06 * h, 0.5 * h * 0.4, 0.06 * h); b.rotation.z = (K.hash(seed, k + 2) - 0.5) * 0.7; } return g; }
    h *= 0.8;
    add(g, CYL6, T.plankDark, 0, 0.12 * h, 0).scale.set(0.05 * h, 0.24 * h, 0.05 * h);
    for (let k = 0; k < 2; k++) { const c = add(g, CONE, k ? T.cypress2 : T.cypress, 0.04 * h * k, (0.5 + 0.18 * k) * h, 0); c.scale.set((0.2 - 0.05 * k) * h, (0.75 - 0.2 * k) * h, (0.2 - 0.05 * k) * h); c.rotation.z = -0.18 - 0.08 * k; }
    return g;
  };
  // an island: a rock ledge capped with dune grass, mooring posts round its back edge, and timber struts back to the stack
  const islet = (parent, r, depth, seed, struts = true) => {
    add(parent, rockGeo(r, depth, seed), seed % 2 ? T.rock : T.rockDark, 0, -0.2, 0);
    add(parent, turfGeo(r, seed), T.dune);
    add(parent, turfGeo(r * 1.08, seed + 3, 11, 0.2), T.sand, 0, -0.3, 0);
    for (let k = 0; k < 5; k++) { const a = Math.PI * (0.62 + 0.19 * k), px = Math.sin(a) * r * 1.02, pz = Math.cos(a) * r * 1.02; add(parent, new THREE.CylinderGeometry(0.13, 0.15, 1.9, 6), T.plankDark, px, -0.55, pz); add(parent, new THREE.CylinderGeometry(0.17, 0.17, 0.07, 6), T.iron, px, 0.42, pz, { cast: false }); }
    if (!struts) return;
    parent.updateMatrixWorld(true);
    const wy = parent.position.y, reach = RAD - stackR(wy - 5) + 0.8;
    for (const sx of [-1, 1]) {
      beam(parent, [sx * 1.6, -0.6, -r * 0.55], [sx * 1.0, -1.4, -reach], 0.26, T.plank);
      beam(parent, [sx * 1.4, -depth * 0.55, -r * 0.35], [sx * 1.0, -1.4, -reach + 0.6], 0.2, T.plankDark);
    }
    beam(parent, [-1.0, -1.25, -reach + 1.2], [1.0, -1.25, -reach + 1.2], 0.16, T.plankDark);
  };
  const rocklet = (a, r, y, size, seed, trees = 2) => {
    const g = group(scene, r * Math.sin(a), y, r * Math.cos(a)); g.rotation.y = seed; islet(g, size, size * 1.7, seed, false);
    for (let k = 0; k < trees; k++) tree(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size * (0.7 + 0.4 * K.hash(seed, k + 8)), k * 3 + seed);
    anims.push((t) => { g.position.y = y + 0.25 * Math.sin(t * 0.5 + seed); }); return g;
  };
  const step = (x, y, z, seed) => { const s = add(scene, new THREE.BoxGeometry(1.15, 0.14, 0.55), seed % 2 ? T.plank : T.plankDark, x, y, z); s.rotation.y = seed * 1.3; return s; };

  function landmark() {
    // the sea, a sun path on it toward the setting sun, whitecaps, and foam round the stack's foot
    const sea = add(scene, new THREE.CircleGeometry(1050, 72), T.sea, 0, SEA_Y, 0, { cast: false }); sea.rotation.x = -Math.PI / 2;
    const pathTex = K.canvasTex(256, 1024, (ctx, w, h) => {
      const r = K.rng(5); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const y = Math.pow(r(), 0.7) * h, spread = 0.15 + 0.85 * (y / h), x = w / 2 + (r() - 0.5) * w * spread, a = 0.25 + 0.75 * r(); ctx.fillStyle = `rgba(255,${180 + Math.floor(r() * 60)},${110 + Math.floor(r() * 50)},${a})`; ctx.fillRect(x, y, 2 + r() * 10 * (1 - y / h * 0.6), 1 + r() * 2); }
      const fade = ctx.createLinearGradient(0, 0, 0, h); fade.addColorStop(0, 'rgba(0,0,0,0.6)'); fade.addColorStop(0.15, 'rgba(0,0,0,0)'); fade.addColorStop(0.9, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)'); ctx.fillStyle = fade; ctx.fillRect(0, 0, w, h);
    });
    const pathM = new THREE.MeshBasicMaterial({ map: pathTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8, fog: false });
    const sunA = Math.atan2(-150, -760), path = new THREE.Mesh(new THREE.PlaneGeometry(150, 760), pathM);
    path.rotation.set(-Math.PI / 2, 0, -sunA + Math.PI); path.position.set(Math.sin(sunA) * 400, SEA_Y + 0.05, Math.cos(sunA) * 400); scene.add(path);
    anims.push((t) => { pathTex.offset.x = 0.01 * Math.sin(t * 0.7); pathM.opacity = 0.7 + 0.1 * Math.sin(t * 1.3); });
    const CAPS = 220, caps = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std('#e8eef8', 0, 0.6), CAPS); caps.castShadow = false; scene.add(caps);
    const capAt = Array.from({ length: CAPS }, (_, i) => { const a = K.hash(i, 1) * Math.PI * 2, r = 24 + 340 * Math.pow(K.hash(i, 2), 0.8); return [Math.sin(a) * r, Math.cos(a) * r, a + Math.PI / 2, 2 + 4 * K.hash(i, 3), K.hash(i, 4) * 6]; });
    const FOAM = 46, foam = new THREE.InstancedMesh(ICO, std('#f1f4fa', 0, 0.7, { flatShading: true }), FOAM); foam.castShadow = false; scene.add(foam);
    anims.push((t) => {
      capAt.forEach(([x, z, a, l, ph], i) => { const k = Math.max(0, Math.sin(t * 0.8 + ph)); K.place(caps, i, [x, SEA_Y + 0.1, z], [0, a, 0], k < 0.05 ? 0.0001 : [l * (0.4 + 0.6 * k), 0.15, 0.35]); });
      caps.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < FOAM; i++) { const a = i / FOAM * Math.PI * 2 + 0.05 * Math.sin(t * 0.3 + i), r = stackR(SEA_Y) + 1.5 + 2.2 * K.hash(i, 9) + 0.8 * Math.sin(t * 0.9 + i * 1.7), s = 1.2 + 1.2 * K.hash(i, 8) + 0.5 * Math.sin(t * 1.4 + i); K.place(foam, i, [Math.sin(a) * r, SEA_Y + 0.2, Math.cos(a) * r], [0, a, 0], [s * 1.6, 0.25 + 0.1 * Math.sin(t * 2 + i), s]); }
      foam.instanceMatrix.needsUpdate = true;
    });

    // the sea stack: banded rock, ledged where the strata break, grass on its crown
    const MH = SUM - H0, ROWS = 16, sg = new THREE.CylinderGeometry(10, 15, MH, 28, ROWS, false); sg.translate(0, H0 + MH / 2, 0);
    const p = sg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr < 1e-4) continue;
      const ang = Math.atan2(z, x), col = Math.round(ang / (Math.PI * 2) * 28), row = Math.round((y - H0) / MH * ROWS);
      const k = 1 + 0.07 * (K.hash(col, row, 3) - 0.5) + 0.05 * Math.sin(col * 1.7 + row) + (row % 3 === 0 ? 0.05 : 0);
      p.setXYZ(i, x * k, y + (row > 0 && row < ROWS ? (K.hash(row, col, 5) - 0.5) * 1.1 : 0), z * k);
    }
    const mesh = sg.toNonIndexed(), pp = mesh.attributes.position, cols = new Float32Array(pp.count * 3), c = new THREE.Color();
    const BANDS = ['#7a6c76', '#5c5266', '#8a7a72', '#4e4658', '#6e6070'].map((h) => new THREE.Color(h)), WET = new THREE.Color('#2c2a3a'), TOPC = new THREE.Color('#6f8550');
    for (let f = 0; f < pp.count; f += 3) {
      const y = (pp.getY(f) + pp.getY(f + 1) + pp.getY(f + 2)) / 3;
      c.copy(BANDS[Math.floor((y - H0) / 3.3) % BANDS.length]).lerp(BANDS[0], 0.3 * K.hash(f, 4));
      if (y < SEA_Y + 3) c.lerp(WET, 0.7); if (y > SUM - 1.2) c.lerp(TOPC, 0.8);
      for (let v = 0; v < 3; v++) { cols[(f + v) * 3] = c.r; cols[(f + v) * 3 + 1] = c.g; cols[(f + v) * 3 + 2] = c.b; }
    }
    mesh.setAttribute('color', new THREE.BufferAttribute(cols, 3)); mesh.computeVertexNormals();
    const sm = add(scene, mesh, std('#ffffff', 0, 0.95, { vertexColors: true, flatShading: true }), 0, 0, 0, { cast: false }); sm.receiveShadow = false;
    add(scene, turfGeo(10.6, 93, 20, 0.5), T.dune, 0, SUM, 0, { cast: false });
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + 0.2, b = add(scene, ICO, k % 2 ? T.rock : T.rockDark, Math.sin(a) * 16.5, SEA_Y + 0.5, Math.cos(a) * 16.5, { cast: false }); b.scale.set(2.5 + 2 * K.hash(k, 1), 1.5 + 2 * K.hash(k, 2), 2.5 + 2 * K.hash(k, 3)); b.rotation.y = k; }

    // the lighthouse: plinth, a white tower with two red bands, the gallery, the lamp room and its roof, and the keeper's cottage
    const lh = group(scene, 0, SUM, 0), TH = 20, tr = (y) => K.lerp(4.2, 3.0, y / TH);
    add(lh, new THREE.CylinderGeometry(5.4, 5.8, 1.2, 16), T.rock, 0, 0.6, 0, { cast: false });
    add(lh, new THREE.CylinderGeometry(3.0, 4.2, TH, 24), T.white, 0, 1.2 + TH / 2, 0, { cast: false });
    for (const [y0, h] of [[5.5, 2.6], [12.5, 2.6]]) add(lh, new THREE.CylinderGeometry(tr(y0 + h) + 0.03, tr(y0) + 0.03, h, 24), T.red, 0, 1.2 + y0 + h / 2, 0, { cast: false });
    const winM = lum('#5a3a18', '#ffcf7a', 1.8);
    for (let k = 0; k < 5; k++) { const a = k * 2.2 + 0.4, y = 3 + k * 3.4, w = add(lh, new THREE.BoxGeometry(0.6, 0.95, 0.2), winM, Math.sin(a) * tr(y) * 0.98, 1.2 + y, Math.cos(a) * tr(y) * 0.98, { cast: false }); w.rotation.y = a; }
    const GY = 1.2 + TH;
    add(lh, new THREE.CylinderGeometry(4.5, 3.6, 0.45, 20), T.iron, 0, GY + 0.2, 0, { cast: false });
    const rail = add(lh, new THREE.TorusGeometry(4.3, 0.06, 4, 32), T.iron, 0, GY + 1.25, 0, { cast: false }); rail.rotation.x = Math.PI / 2;
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; add(lh, new THREE.CylinderGeometry(0.05, 0.05, 1.0, 4), T.iron, Math.sin(a) * 4.3, GY + 0.8, Math.cos(a) * 4.3, { cast: false }); }
    const glassM = lum('#7a5a2a', '#ffe0a0', 1.6);
    add(lh, new THREE.CylinderGeometry(2.5, 2.5, 3.0, 16, 1, true), glassM, 0, GY + 1.95, 0, { cast: false });
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; add(lh, new THREE.BoxGeometry(0.14, 3.0, 0.14), T.iron, Math.sin(a) * 2.53, GY + 1.95, Math.cos(a) * 2.53, { cast: false }); }
    add(lh, new THREE.CylinderGeometry(2.8, 2.8, 0.3, 16), T.iron, 0, GY + 3.55, 0, { cast: false });
    add(lh, new THREE.ConeGeometry(3.0, 2.4, 16), T.red, 0, GY + 4.9, 0, { cast: false });
    add(lh, new THREE.SphereGeometry(0.35, 10, 8), T.iron, 0, GY + 6.3, 0, { cast: false });
    const vane = add(lh, new THREE.BoxGeometry(1.2, 0.35, 0.04), T.iron, 0.4, GY + 7.0, 0, { cast: false });
    const cot = group(lh, 6.2, 0, 3.4); cot.rotation.y = 0.8;
    add(cot, new THREE.BoxGeometry(4.4, 2.6, 3.0), T.white, 0, 1.3, 0, { cast: false });
    const roof = add(cot, new THREE.CylinderGeometry(0.01, 2.6, 4.8, 4, 1), T.red, 0, 3.4, 0, { cast: false }); roof.rotation.set(0, Math.PI / 4, Math.PI / 2); roof.scale.set(1, 1, 0.75);
    for (const sx of [-1, 1]) add(cot, new THREE.BoxGeometry(0.6, 0.8, 0.12), winM, sx * 1.2, 1.4, 1.52, { cast: false });
    add(cot, new THREE.BoxGeometry(0.5, 1.6, 0.5), T.rockDark, -1.6, 4.0, -0.6, { cast: false });

    // the lamp and its two beams
    const LY = SUM + GY + 1.95, lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff0c8'), fog: false });
    const lamp = add(scene, new THREE.SphereGeometry(0.9, 16, 12), lampM, 0, LY, 0, { cast: false }); lamp.receiveShadow = false;
    const lampL = new THREE.PointLight('#ffd89a', 40, 40, 1.6); lampL.position.set(0, LY, 0); scene.add(lampL);
    const beamTex = K.canvasTex(8, 256, (ctx, w, h) => { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#8a8070'); g.addColorStop(1, '#000000'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); });
    const beamM = new THREE.MeshBasicMaterial({ map: beamTex, color: new THREE.Color('#ffe2a8'), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const beams = group(scene, 0, LY, 0);
    for (const sx of [1, -1]) { const bg = new THREE.ConeGeometry(9, 170, 24, 1, true); bg.translate(0, -85, 0); bg.rotateZ(sx * Math.PI / 2); const b = new THREE.Mesh(bg, beamM); b.castShadow = false; b.rotation.z = sx * -0.035; beams.add(b); }
    // the beams turn slowly; while a rhythm plays they turn half a circle per beat, and the lamp flashes on its notes
    let ang = 0, lastT = 0, sw = null;
    const glass0 = glassM.userData.rest, aimTo = ((spireA - Math.PI / 2) % Math.PI + Math.PI) % Math.PI;
    anims.push((t) => {
      const dt = Math.max(0, Math.min(0.1, t - lastT)); lastT = t;
      const G = getG(), lit = G.mode === 'summit' || G.mode === 'finale' || G.mode === 'summary', s = SIG.sweep;
      if (lit) { let d = (aimTo - ang) % Math.PI; if (d > Math.PI / 2) d -= Math.PI; if (d < -Math.PI / 2) d += Math.PI; ang += d * Math.min(1, dt * 1.6); }
      else if (s && t >= s.t0 && t <= s.t1) { if (sw !== s) { sw = s; s.a0 = ang - Math.PI * (t - s.t0) / s.beat; } ang = s.a0 + Math.PI * (t - s.t0) / s.beat; }
      else ang += 0.55 * dt;
      beams.rotation.y = ang;
      let f = 0; for (const tf of SIG.flashAt) { const u = (t - tf) / 0.3; if (u >= 0 && u < 1) f = Math.max(f, 1 - u); }
      const k = lit ? 2.2 : 1 + 1.6 * f;
      beamM.opacity = 0.2 * k; lampM.color.setRGB(1, 0.94, 0.78).multiplyScalar(1.2 + 1.2 * k); lampL.intensity = 30 * k;
      glassM.userData.rest = glass0 * (0.7 + 0.6 * k); vane.rotation.y = 0.3 * Math.sin(t * 0.4);
    });

    // gulls wheeling round the stack
    const gullM = std('#f2f0ea', 0, 0.7), tipM = std('#3a3a44', 0, 0.7);
    for (let k = 0; k < 10; k++) {
      const gg = group(scene), body = add(gg, new THREE.SphereGeometry(1, 8, 6), gullM, 0, 0, 0, { cast: false }); body.scale.set(0.16, 0.13, 0.42);
      const wings = [-1, 1].map((sx) => { const w = group(gg, sx * 0.08, 0.05, 0); add(w, new THREE.BoxGeometry(0.75, 0.03, 0.26), gullM, sx * 0.38, 0, 0, { cast: false }); add(w, new THREE.BoxGeometry(0.22, 0.031, 0.2), tipM, sx * 0.82, 0, -0.03, { cast: false }); return w; });
      const r = 22 + 30 * K.hash(k, 1), y0 = -6 + (SUM + 22) * K.hash(k, 2), sp = (0.1 + 0.08 * K.hash(k, 3)) * (k % 2 ? 1 : -1), ph = K.hash(k, 4) * 6.3, s = 1.3 + 0.6 * K.hash(k, 5);
      gg.scale.setScalar(s);
      anims.push((t) => {
        const a = ph + t * sp; gg.position.set(Math.sin(a) * r, y0 + 2.5 * Math.sin(t * 0.3 + ph), Math.cos(a) * r);
        gg.rotation.set(0, a + (sp > 0 ? Math.PI / 2 : -Math.PI / 2), 0); gg.rotateZ(sp > 0 ? -0.3 : 0.3);
        const fl = Math.sin(t * 5 + ph) * (Math.sin(t * 0.5 + k) > 0 ? 0.55 : 0.08); wings[0].rotation.z = fl; wings[1].rotation.z = -fl;
      });
    }
  }

  // far off: other sea stacks, and Chapter 4's ice spire glittering on the horizon where the summit's beam will point
  SIG.summit = { dur: 8, caption: 'You light the lamp! Its beam crosses the sea to a glittering spire of ice.', cam: X.summitView({ aimY: 40, h: SUM + 29, back: 30, swing: 0.3 }) };
  function distant() {
    for (let k = 0; k < 11; k++) {
      const a = k / 11 * Math.PI * 2 + K.hash(k, 81) * 0.3, r = 190 + K.hash(k, 82) * 330, h = 30 + K.hash(k, 83) * 70, w = 7 + 9 * K.hash(k, 84);
      if (Math.abs(((a - spireA) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI) < 0.25) continue;
      const m = add(scene, new THREE.CylinderGeometry(w * 0.7, w, h, 7), k % 2 ? T.rockDark : T.rock, Math.sin(a) * r, SEA_Y + h / 2 - 2, Math.cos(a) * r, { cast: false }); m.rotation.y = k;
      add(scene, new THREE.CylinderGeometry(w * 0.72, w * 0.7, 1.2, 7), T.dune, Math.sin(a) * r, SEA_Y + h - 1.4, Math.cos(a) * r, { cast: false }).rotation.y = k;
    }
    const sx = Math.sin(spireA) * 600, sz = Math.cos(spireA) * 600;
    const ice = new THREE.MeshStandardMaterial({ color: '#9fd8ff', emissive: new THREE.Color('#5fb8ff'), emissiveIntensity: 0.55, roughness: 0.2, metalness: 0.1, flatShading: true, fog: false });
    const OCT = new THREE.OctahedronGeometry(1, 0), spire = group(scene, sx, SEA_Y, sz);
    add(spire, OCT, ice, 0, 40, 0, { cast: false }).scale.set(9, 62, 9);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, d = 9 + 6 * K.hash(k, 7), m = add(spire, OCT, ice, Math.sin(a) * d, 12 + 10 * K.hash(k, 8), Math.cos(a) * d, { cast: false }); m.scale.set(3, 14 + 14 * K.hash(k, 9), 3); m.rotation.set((K.hash(k, 10) - 0.5) * 0.6, k, (K.hash(k, 11) - 0.5) * 0.6); }
    add(spire, new THREE.CylinderGeometry(40, 46, 1.2, 16), new THREE.MeshStandardMaterial({ color: '#dceefa', roughness: 0.4, fog: false }), 0, 0.3, 0, { cast: false });
    anims.push((t) => { ice.emissiveIntensity = 0.5 + 0.15 * Math.sin(t * 2.3) + (['summit', 'finale', 'summary'].includes(getG().mode) ? 0.6 : 0); });
  }

  const kit = sceneKit(X);
  // the islands' own decorations and the props' small details
  const dressing = kit.theme({'ground':  ['shell', 'rope', 'buoy', 'shell', 'pebbles'], 'top':  'buoyTop', 'hang':  'ropeLoop', 'accent':  'rope'});
  return { ...dressing, islet, tree, rocklet, step, landmark, distant, T };
}
