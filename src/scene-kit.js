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
  return { path, beam, column, bands, islet, rocklet, stepOf, cluster, tease, water, glowMat, ending, add2, ICO, OCT, CONE, UPV };
}
