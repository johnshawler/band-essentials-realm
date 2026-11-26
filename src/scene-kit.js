// ================================================================ shared pieces for the chapter scenery (Chapters 4-12)
// sceneKit(X) gets the stage's helpers (as each scene does) and returns small builders the chapters share: a column landmark
// with banded vertex colours, timbers between two points, islands of rock with a top and a few decorations, floating
// islets, path steps, and helpers for the summit (is the ending playing?) and the next chapter's tease on the horizon.
function sceneKit(X) {
  const { THREE, K, scene, add, group, std, facet, anims, turfGeo, rockGeo, RAD, SUM, getG, spireA } = X;
  const UPV = new THREE.Vector3(0, 1, 0), ICO = new THREE.IcosahedronGeometry(1, 1), OCT = new THREE.OctahedronGeometry(1, 0), CONE = new THREE.ConeGeometry(1, 1, 7);
  const ending = () => { const m = getG().mode; return m === 'summit' || m === 'finale' || m === 'summary'; };
  const beam = (parent, a, b, r, mat, seg = 6) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), m = add(parent, new THREE.CylinderGeometry(r, r, d.length(), seg), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    m.quaternion.setFromUnitVectors(UPV, d.normalize()); return m;
  };
  // a column from y0 to y1, radius r0 at the foot to r1 at the head, roughened, coloured by colour(y, face index) -> THREE.Color
  function column({ y0, y1, r0, r1, seg = 24, rows = 14, jag = 0.08, wob = 1.0, colour, rough = 0.95, flat = true, metal = 0, emissive }) {
    const MH = y1 - y0, g = new THREE.CylinderGeometry(r1, r0, MH, seg, rows, false); g.translate(0, y0 + MH / 2, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr < 1e-4) continue;
      const col = Math.round(Math.atan2(z, x) / (Math.PI * 2) * seg), row = Math.round((y - y0) / MH * rows), k = 1 + jag * (K.hash(col, row, 3) - 0.5) * 2;
      p.setXYZ(i, x * k, y + (row > 0 && row < rows ? (K.hash(row, col, 5) - 0.5) * wob : 0), z * k);
    }
    const mesh = g.toNonIndexed(), pp = mesh.attributes.position, cols = new Float32Array(pp.count * 3);
    for (let f = 0; f < pp.count; f += 3) {
      const c = colour((pp.getY(f) + pp.getY(f + 1) + pp.getY(f + 2)) / 3, f);
      for (let v = 0; v < 3; v++) { cols[(f + v) * 3] = c.r; cols[(f + v) * 3 + 1] = c.g; cols[(f + v) * 3 + 2] = c.b; }
    }
    mesh.setAttribute('color', new THREE.BufferAttribute(cols, 3)); mesh.computeVertexNormals();
    const o = { vertexColors: true, flatShading: flat }; if (emissive) { o.emissive = new THREE.Color(emissive[0]); o.emissiveIntensity = emissive[1]; }
    const m = add(scene, mesh, std('#ffffff', metal, rough, o), 0, 0, 0, { cast: false }); m.receiveShadow = false; return m;
  }
  const bands = (hexes, h, y0, jitter = 0.35) => { const C = hexes.map((x) => new THREE.Color(x)), c = new THREE.Color(); return (y, f) => c.copy(C[((Math.floor((y - y0) / h) % C.length) + C.length) % C.length]).lerp(C[0], jitter * K.hash(f, 4)); };
  // an island: a rock body, a top (turf, snow, sand...), and timbers or bridges back to the landmark (radius at height y: landR(y))
  function islet(parent, r, depth, seed, { rock, rock2, top, under, landR, strut, strut2, strutR = 0.24, links = true, decor } = {}) {
    add(parent, rockGeo(r, depth, seed), seed % 2 && rock2 ? rock2 : rock, 0, -0.2, 0);
    add(parent, turfGeo(r, seed), top);
    if (under) add(parent, turfGeo(r * 1.07, seed + 3, 11, 0.2), under, 0, -0.3, 0);
    if (decor) decor(parent, r, seed);
    if (!links || !landR || !strut) return;
    parent.updateMatrixWorld(true);
    const reach = RAD - landR(parent.position.y - 3) + 0.8;
    for (const sx of [-1, 1]) beam(parent, [sx * 1.6, -0.6, -r * 0.55], [sx * 1.0, -1.6, -reach], strutR, strut);
    if (strut2) beam(parent, [-1.2, -1.45, -reach + 1.2], [1.2, -1.45, -reach + 1.2], strutR * 0.6, strut2);
  }
  // a small floating islet in the air, bobbing
  const rocklet = (opts, decorate) => (a, r, y, size, seed, n = 2) => {
    const g = group(scene, r * Math.sin(a), y, r * Math.cos(a)); g.rotation.y = seed; islet(g, size, size * 1.7, seed, Object.assign({}, opts, { links: false }));
    if (decorate) decorate(g, size, seed, n);
    anims.push((t) => { g.position.y = y + 0.25 * Math.sin(t * 0.5 + seed); }); return g;
  };
  const stepOf = (m1, m2, geo = new THREE.BoxGeometry(1.15, 0.14, 0.55)) => (x, y, z, seed) => { const s = add(scene, geo, seed % 2 ? m1 : m2, x, y, z); s.rotation.y = seed * 1.3; return s; };
  const cluster = (parent, x, y, z, s, mat, seed, n = 5) => { for (let k = 0; k < n; k++) { const m = add(parent, OCT, mat, x + (K.hash(seed, k) - 0.5) * s * 0.8, y + s * 0.3, z + (K.hash(seed, k + 5) - 0.5) * s * 0.6); const hh = s * (0.5 + 0.7 * K.hash(seed, k + 9)); m.scale.set(hh * 0.22, hh, hh * 0.22); m.rotation.set((K.hash(seed, k + 2) - 0.5) * 0.9, k, (K.hash(seed, k + 3) - 0.5) * 0.9); } };
  // the next chapter's landmark, far off where the summit camera looks past the landmark
  const tease = (r = 560) => group(scene, Math.sin(spireA) * r, 0, Math.cos(spireA) * r);
  const water = (y, color, rough = 0.3, metal = 0.15, rad = 1050) => { const w = add(scene, new THREE.CircleGeometry(rad, 72), std(color, metal, rough), 0, y, 0, { cast: false }); w.rotation.x = -Math.PI / 2; return w; };
  const glowMat = (color, k = 1, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(color).multiplyScalar(k), fog: false }, o));
  const add2 = (geo, mat, x, y, z) => add(scene, geo, mat, x, y, z, { cast: false });
  // a camera path through keys [u, pos, aim], easing between each pair
  const path = (list) => (u) => { let i = 0; while (i < list.length - 2 && u > list[i + 1][0]) i++; const [u0, p0, a0] = list[i], [u1, p1, a1] = list[i + 1], e = K.ease.inOut(K.clamp((u - u0) / (u1 - u0))); return { pos: p0.map((x, j) => K.lerp(x, p1[j], e)), aim: a0.map((x, j) => K.lerp(x, a1[j], e)) }; };
  // ---------------------------------------------------------------- themed pieces for islands and props
  // Each piece is (parent, x, y, z, s, seed) with y the ground (or the anchor) and s about half a unit at 1.
  const mats = {}, glows = {};
  const mat = (c, metal = 0, rough = 0.75) => mats[c + metal + rough] || (mats[c + metal + rough] = std(c, metal, rough, { flatShading: true }));
  const glow = (c, g, k = 2) => glows[c + g + k] || (glows[c + g + k] = X.lum(c, g, k, { facet: true, rough: 0.4 }));
  const SPH = new THREE.SphereGeometry(1, 10, 7), CYL = new THREE.CylinderGeometry(1, 1, 1, 8), BOX = new THREE.BoxGeometry(1, 1, 1), TOR = new THREE.TorusGeometry(1, 0.28, 6, 14), HALF = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), DOD = new THREE.DodecahedronGeometry(1, 0);
  const put = (parent, geo, m, x, y, z, sx, sy = sx, sz = sx) => { const o = add(parent, geo, m, x, y, z, { cast: false }); o.scale.set(sx, sy, sz); return o; };
  const spinners = []; anims.push((t) => spinners.forEach(([o, sp]) => { o.rotation.z = t * sp; }));
  const PIECE = {
    mushroom: (p, x, y, z, s, k) => { put(p, CYL, mat('#efe6d6'), x, y + 0.25 * s, z, 0.09 * s, 0.5 * s); put(p, HALF, mat(k % 2 ? '#c84a3a' : '#e0a050'), x, y + 0.48 * s, z, 0.38 * s, 0.26 * s); },
    fern: (p, x, y, z, s, k) => { for (let j = 0; j < 5; j++) { const a = j * 1.26 + k, f = put(p, CONE, mat(j % 2 ? '#3e7a3a' : '#5a9a44'), x + Math.cos(a) * 0.12 * s, y + 0.3 * s, z + Math.sin(a) * 0.12 * s, 0.07 * s, 0.7 * s, 0.18 * s); f.rotation.set(Math.sin(a) * 0.8, a, Math.cos(a) * 0.8); } },
    shell: (p, x, y, z, s, k) => { const o = put(p, HALF, mat(k % 2 ? '#f4c8b8' : '#f0e0c8'), x, y, z, 0.3 * s, 0.16 * s, 0.24 * s); o.rotation.y = k; },
    rope: (p, x, y, z, s) => { for (let j = 0; j < 3; j++) { const o = put(p, TOR, mat('#c8b088', 0, 0.9), x, y + 0.06 * s + j * 0.09 * s, z, 0.3 * s * (1 - 0.15 * j)); o.rotation.x = Math.PI / 2; } },
    buoy: (p, x, y, z, s) => { put(p, HALF, mat('#d83a3a'), x, y + 0.3 * s, z, 0.3 * s); const b = put(p, HALF, mat('#f4f0e8'), x, y + 0.3 * s, z, 0.3 * s); b.rotation.x = Math.PI; put(p, CYL, mat('#3a3a40', 0.6, 0.4), x, y + 0.7 * s, z, 0.03 * s, 0.5 * s); },
    crystal: (p, x, y, z, s, k, c = ['#6fb8ff', '#2a7ae0']) => cluster(p, x, y, z, 0.9 * s, glow(c[1], c[0], 0.9), k, 4),
    snow: (p, x, y, z, s, k) => { const o = put(p, ICO, mat('#eef4fb', 0, 0.85), x, y, z, 0.5 * s, 0.22 * s, 0.4 * s); o.rotation.y = k; },
    pebbles: (p, x, y, z, s, k) => { for (let j = 0; j < 3; j++) put(p, DOD, mat(j % 2 ? '#8a8a84' : '#6a6a66'), x + (K.hash(k, j) - 0.5) * 0.5 * s, y + 0.08 * s, z + (K.hash(k, j + 3) - 0.5) * 0.4 * s, 0.12 * s * (1 + K.hash(k, j + 6))); },
    ore: (p, x, y, z, s, k) => cluster(p, x, y, z, 0.8 * s, glow('#a0400a', '#ffa040', 1.8), k, 4),
    lantern: (p, x, y, z, s) => { put(p, CYL, mat('#3a3a40', 0.6, 0.4), x, y + 0.45 * s, z, 0.04 * s, 0.9 * s); put(p, SPH, glow('#7a4a10', '#ffc060', 2.6), x, y + 0.98 * s, z, 0.13 * s); put(p, CONE, mat('#3a3a40', 0.6, 0.4), x, y + 1.14 * s, z, 0.15 * s, 0.12 * s); },
    flowers: (p, x, y, z, s, k) => { for (let j = 0; j < 4; j++) { const dx = (K.hash(k, j) - 0.5) * 0.5 * s, dz = (K.hash(k, j + 4) - 0.5) * 0.4 * s; put(p, CYL, mat('#4a8a3a'), x + dx, y + 0.15 * s, z + dz, 0.02 * s, 0.3 * s); put(p, SPH, mat(['#e84a6a', '#f4d040', '#8a6ad8', '#f4f0f0'][(j + k) % 4]), x + dx, y + 0.32 * s, z + dz, 0.08 * s); } },
    block: (p, x, y, z, s, k) => { const o = put(p, BOX, mat('#b8b0a4'), x, y + 0.22 * s, z, 0.5 * s, 0.44 * s, 0.4 * s); o.rotation.y = k; },
    barrel: (p, x, y, z, s) => { put(p, CYL, mat('#8a5a32'), x, y + 0.35 * s, z, 0.26 * s, 0.7 * s); for (const dy of [0.12, 0.58]) { const r = put(p, TOR, mat('#3a3a40', 0.6, 0.5), x, y + dy * s, z, 0.265 * s, 0.265 * s, 0.1 * s); r.rotation.x = Math.PI / 2; } },
    crate: (p, x, y, z, s, k) => { const o = put(p, BOX, mat('#a07a4a'), x, y + 0.25 * s, z, 0.5 * s); o.rotation.y = k * 0.7; put(p, BOX, mat('#6a4a2a'), x, y + 0.25 * s, z, 0.52 * s, 0.08 * s, 0.52 * s).rotation.y = k * 0.7; },
    gear: (p, x, y, z, s, k) => { const g = group(p, x, y + 0.4 * s, z); g.rotation.y = k; const w = group(g); put(w, CYL, mat('#c8963a', 0.9, 0.35), 0, 0, 0, 0.36 * s, 0.08 * s, 0.36 * s).rotation.x = Math.PI / 2; for (let j = 0; j < 10; j++) { const a = j / 10 * Math.PI * 2; put(w, BOX, mat('#c8963a', 0.9, 0.35), Math.cos(a) * 0.4 * s, Math.sin(a) * 0.4 * s, 0, 0.1 * s, 0.1 * s, 0.08 * s).rotation.z = a; } spinners.push([w, k % 2 ? 0.5 : -0.5]); },
    lamp: (p, x, y, z, s) => { put(p, CYL, mat('#9a6a2a', 0.9, 0.4), x, y + 0.5 * s, z, 0.05 * s, s); put(p, SPH, glow('#7a5a20', '#ffd890', 2.4), x, y + 1.05 * s, z, 0.14 * s); },
    jag: (p, x, y, z, s, k) => { const o = put(p, CONE, mat('#2e2e38'), x, y + 0.45 * s, z, 0.22 * s, 0.9 * s, 0.18 * s); o.rotation.set(0.2 * (K.hash(k, 1) - 0.5), k, 0.25); },
    fulgurite: (p, x, y, z, s, k) => { const o = put(p, OCT, glow('#3a4ab0', '#c8d8ff', 1.8), x, y + 0.35 * s, z, 0.08 * s, 0.4 * s, 0.08 * s); o.rotation.z = 0.2 * (K.hash(k, 2) - 0.5); },
    ember: (p, x, y, z, s, k) => { for (let j = 0; j < 3; j++) put(p, OCT, glow('#8a2a0a', '#ff7a2a', 2.6), x + (K.hash(k, j) - 0.5) * 0.4 * s, y + 0.1 * s, z + (K.hash(k, j + 3) - 0.5) * 0.3 * s, 0.1 * s); put(p, DOD, mat('#2a2426'), x, y + 0.08 * s, z, 0.25 * s, 0.1 * s, 0.22 * s); },
    egg: (p, x, y, z, s, k) => { put(p, SPH, mat(k % 2 ? '#c8a060' : '#a0b070', 0.2, 0.4), x, y + 0.3 * s, z, 0.22 * s, 0.32 * s, 0.22 * s); put(p, TOR, mat('#5a3a22', 0, 0.9), x, y + 0.04 * s, z, 0.24 * s, 0.24 * s, 0.1 * s).rotation.x = Math.PI / 2; },
    star: (p, x, y, z, s, k) => { const o = put(p, OCT, glow('#8a7a3a', '#fff0b0', 2.4), x, y + 0.45 * s, z, 0.2 * s, 0.3 * s, 0.06 * s); o.rotation.y = k; spinners.push([o, 0.3]); put(p, CYL, mat('#c8c8d8', 0.8, 0.3), x, y + 0.12 * s, z, 0.03 * s, 0.24 * s); },
    orb: (p, x, y, z, s) => { put(p, CYL, mat('#c8a050', 0.9, 0.3), x, y + 0.1 * s, z, 0.15 * s, 0.2 * s); put(p, SPH, glow('#3a3a8a', '#9ab0ff', 1.6), x, y + 0.35 * s, z, 0.2 * s); },
    // on top of posts and pillars
    leafTuft: (p, x, y, z, s, k) => { for (let j = 0; j < 3; j++) put(p, ICO, mat(j % 2 ? '#5a9a3c' : '#7fae46'), x + (j - 1) * 0.12 * s, y + 0.12 * s, z, 0.2 * s, 0.14 * s, 0.2 * s); put(p, SPH, mat(k % 2 ? '#f4b0cc' : '#fff0f6'), x, y + 0.26 * s, z + 0.08 * s, 0.07 * s); },
    snowcap: (p, x, y, z, s) => { put(p, HALF, mat('#f4f8ff', 0, 0.85), x, y - 0.02, z, 0.22 * s, 0.14 * s, 0.22 * s); },
    mossTop: (p, x, y, z, s) => { put(p, HALF, mat('#5a8a3a'), x, y - 0.02, z, 0.2 * s, 0.1 * s, 0.2 * s); PIECE.fern(p, x, y, z, 0.35 * s, 1); },
    lanternTop: (p, x, y, z, s) => { put(p, SPH, glow('#7a4a10', '#ffc060', 2.6), x, y + 0.14 * s, z, 0.12 * s); put(p, CONE, mat('#2a2a30', 0.6, 0.4), x, y + 0.3 * s, z, 0.15 * s, 0.12 * s); },
    bell: (p, x, y, z, s) => { const b = put(p, new THREE.CylinderGeometry(0.4, 1, 1.1, 12, 1, true), mat('#b0803a', 0.9, 0.35), x, y + 0.14 * s, z, 0.14 * s); void b; put(p, SPH, mat('#b0803a', 0.9, 0.35), x, y + 0.24 * s, z, 0.06 * s); },
    pennant: (p, x, y, z, s, k) => { put(p, CYL, mat('#5a3a22'), x, y + 0.4 * s, z, 0.025 * s, 0.8 * s); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.5, -0.12, 0, 0, -0.24, 0], 3)); g.computeVertexNormals(); const f = add(p, g, std(k % 2 ? '#c83a3a' : '#f4f0e8', 0, 0.8, { side: THREE.DoubleSide }), x, y + 0.78 * s, z, { cast: false }); f.scale.setScalar(s); anims.push((t) => { f.rotation.y = 0.3 * Math.sin(t * 2.5 + k); }); },
    gearTop: (p, x, y, z, s, k) => PIECE.gear(p, x, y - 0.25 * s, z, 0.6 * s, k),
    rod: (p, x, y, z, s) => { put(p, CYL, mat('#8a8a94', 0.9, 0.3), x, y + 0.3 * s, z, 0.02 * s, 0.6 * s); put(p, SPH, glow('#3a4ab0', '#c8d8ff', 2.2), x, y + 0.62 * s, z, 0.05 * s); },
    horn: (p, x, y, z, s, k) => { const h = put(p, CONE, mat('#e8dcc0', 0, 0.5), x, y + 0.22 * s, z, 0.07 * s, 0.45 * s); h.rotation.z = (k % 2 ? 1 : -1) * 0.35; },
    starTop: (p, x, y, z, s, k) => PIECE.star(p, x, y - 0.08 * s, z, 0.6 * s, k),
    buoyTop: (p, x, y, z, s) => { put(p, SPH, mat('#d83a3a'), x, y + 0.1 * s, z, 0.11 * s); },
    // hanging below rods and lintels
    vine: (p, x, y, z, s, k) => { const L = 0.25 + 0.25 * K.hash(k, 3); put(p, CYL, mat('#3e7a3a'), x, y - L * s / 2, z, 0.012 * s, L * s); for (let j = 0; j < 3; j++) put(p, SPH, mat('#5a9a44'), x + (j % 2 ? 0.03 : -0.03) * s, y - (0.06 + 0.1 * j) * s, z + 0.01, 0.035 * s, 0.02 * s, 0.035 * s); },
    icicle: (p, x, y, z, s, k) => { for (let j = 0; j < 3; j++) { const L = (0.12 + 0.14 * K.hash(k, j)) * s; const o = put(p, CONE, glow('#9ad0f0', '#d8f0ff', 0.5), x + (j - 1) * 0.07 * s, y - L / 2, z, 0.025 * s, L); o.rotation.x = Math.PI; } },
    drip: (p, x, y, z, s, k) => { const o = put(p, SPH, glow('#2a7aa0', '#8ad8ff', 1.2), x, y - 0.08 * s, z, 0.025 * s, 0.05 * s, 0.025 * s); anims.push((t) => { const u = (t * 0.6 + K.hash(k, 1)) % 1; o.position.y = y - 0.08 * s - u * 0.6; o.visible = u < 0.85; }); },
    chain: (p, x, y, z, s) => { for (let j = 0; j < 4; j++) { const l = put(p, TOR, mat('#4a4a52', 0.8, 0.4), x, y - (0.04 + j * 0.06) * s, z, 0.03 * s); l.rotation.y = j * Math.PI / 2; } },
    ropeLoop: (p, x, y, z, s) => { const o = add(p, new THREE.TorusGeometry(0.12, 0.012, 4, 12, Math.PI), mat('#c8b088', 0, 0.9), x, y, z, { cast: false }); o.rotation.z = Math.PI; o.scale.setScalar(s); },
    flag: (p, x, y, z, s, k) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-0.07, 0, 0, 0.07, 0, 0, 0, -0.2, 0], 3)); g.computeVertexNormals(); add(p, g, std(['#c83a3a', '#2d5fa8', '#e8c060'][k % 3], 0, 0.8, { side: THREE.DoubleSide }), x, y, z, { cast: false }).scale.setScalar(s); },
    weight: (p, x, y, z, s, k) => { const g = group(p, x, y, z); put(g, CYL, mat('#9a6a2a', 0.9, 0.4), 0, -0.15 * s, 0, 0.008 * s, 0.3 * s); put(g, CYL, mat('#c8963a', 0.9, 0.35), 0, -0.32 * s, 0, 0.06 * s, 0.02 * s).rotation.x = Math.PI / 2; anims.push((t) => { g.rotation.z = 0.3 * Math.sin(t * 2 + k); }); },
    emberLamp: (p, x, y, z, s) => { put(p, CYL, mat('#2a2426'), x, y - 0.1 * s, z, 0.008 * s, 0.2 * s); put(p, OCT, glow('#8a2a0a', '#ff7a2a', 2.6), x, y - 0.24 * s, z, 0.05 * s); },
    charm: (p, x, y, z, s, k) => { put(p, CYL, mat('#c8c8d8', 0.8, 0.3), x, y - 0.08 * s, z, 0.006 * s, 0.16 * s); const o = put(p, OCT, glow('#8a7a3a', '#fff0b0', 2.2), x, y - 0.2 * s, z, 0.045 * s, 0.07 * s, 0.02 * s); o.rotation.y = k; },
  };
  // a chapter's dressing: ground pieces round each island, a piece on every top anchor and below every hang anchor, and an accent
  // that stands in for the crystal shards beside some props
  function theme({ ground = [], top, hang, accent, size = 1 }) {
    // round the island's edge, clear of the props and the count-in stones in front
    const SPOTS = [[3.85, 1.2, 0.8], [-3.95, 0.2, 0.7], [-3.6, 1.8, 0.6], [-4.05, 1.05, 0.5], [4.15, 0.1, 0.5]];
    return {
      decor: (g, i) => SPOTS.forEach(([x, z, s], k) => { const f = PIECE[ground[(i + k) % ground.length]]; if (f) f(g, (i % 2 ? -1 : 1) * x, 0, z, s * 1.6 * size, i * 7 + k); }),
      dress: (A) => { A.top.forEach(([p, x, y, z], k) => top && PIECE[top](p, x, y, z, 1, k)); A.hang.forEach(([p, x, y, z], k) => hang && PIECE[hang](p, x, y, z, 1, k)); },
      accent: accent ? (g, x, y, z, s, seed) => PIECE[accent](g, x, y, z, s * 1.4, seed) : undefined,
    };
  }
  return { theme, PIECE, path, beam, column, bands, islet, rocklet, stepOf, cluster, tease, water, glowMat, ending, add2, ICO, OCT, CONE, UPV };
}
