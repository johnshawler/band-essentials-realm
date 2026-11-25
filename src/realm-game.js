// ================================================================ Band Adventures: the High Fantasy movie made playable, one chapter per course unit
// The world, camera path, wisp, lettering and sound are the movie's. Where the movie played each game by itself on a
// schedule, the player now plays it: the same props on each island take clicks, drags and taps.
{
  const VERSION = 18; // shown top left; add one for every release to the public site
  window.GAME_VERSION = VERSION;
  const TITLE = 'Band Adventures';
  const OPEN_LINE = `Chapter ${CH.n}: ${CH.title}`;
  const GAMES = [
    { name: 'Read Rhythms', line: 'Tap and count rhythms in time', rounds: 3 },
    { name: 'Fingering Trainer', line: 'Interactive fingering chart exercises for all instruments', rounds: 5 },
    { name: 'Write Notes', line: 'Drag notes to the correct spot on the staff', rounds: 5 },
    { name: 'Read Notes', line: 'Instantly identify written notes', rounds: 6 },
    { name: 'Terms & Symbols', line: 'Master musical vocabulary and symbols', rounds: 6 },
    // from Unit 7 a sixth game joins, so those climbs have 18 islands
    ...(CH.keys ? [{ name: 'Key Signatures', line: 'Open the gate with the key that matches the signature', rounds: 3 }] : []),
  ];
  const TERMS = ['Treble clef', 'Bass clef', 'Staff', 'Bar line', 'Double bar line', 'Measure', 'Repeat sign', 'Time signature', 'Whole note', 'Half note',
    'Quarter note', 'Whole rest', 'Half rest', 'Quarter rest', 'Sharp', 'Flat', 'Natural', 'Ledger line', 'Key signature',
    'Breath mark', 'Fermata', 'Pick-up note', 'Forte', 'Mezzo forte', 'Piano', 'Eighth note', 'Beam', 'Allegro', 'Moderato', 'Andante', 'Crescendo', 'Diminuendo',
    'Measure number', 'Tie', 'Dotted half note', 'Dotted quarter note', 'Accent', 'First ending', 'Second ending', 'D.C. al Fine', 'Slur', 'Eighth rest'];
  const END = [
    { x: 96, y: 90, w: 838, h: 122, c: '#F8B73C' }, { x: 96, y: 316, w: 182, h: 379, c: '#5C66DE' }, { x: 376, y: 310, w: 276, h: 75, c: '#EA5900' },
    { x: 382, y: 473, w: 265, h: 63, c: '#FFFFFF' }, { x: 382, y: 633, w: 264, h: 61, c: '#B0B804' }, { x: 750, y: 316, w: 183, h: 379, c: '#FFFFFF' },
    { x: 95, y: 785, w: 552, h: 149, c: '#FFFFFF' }, { x: 751, y: 787, w: 181, h: 146, c: '#AB1BAB' },
  ];
  const LAYOUT = (W, H) => (H > W
    ? { size: 0.34, cy: 0.315, lines: [[0.53, 0.0406], [0.573, 0.027], [0.618, 0.0437]] }
    : { size: 0.52, cy: 0.315, lines: [[0.69, 0.088], [0.797, 0.056], [0.897, 0.084]] });
  const END_TEXT = ['Theta Music Band Adventures', 'try it free at', 'bandessentials.com'];
  const TILE_TO_RECT = [1, 0, 3, 5, 6, 4, 2, 7];

  // Story time for the camera: each of the NS islands has a stretch (the camera drifts across it while it is played),
  // with a flight between stretches; after the last island comes the movie's ending, on the same relative timings.
  const NG = GAMES.length, NS = 3 * NG;
  const T = { arrive: [], leave: [], flight: 1.2, gap: 0.07 };
  for (let i = 0; i < NS; i++) { T.arrive.push(3 + 4 * i); T.leave.push(6 + 4 * i); }
  T.lift = T.leave[NS - 1]; T.dark0 = T.lift + 0.2; T.dark1 = T.lift + 1.6; T.camEnd = T.lift + 1.4; T.exact0 = T.lift + 2.2; T.exact1 = T.lift + 2.7;
  T.text = [T.lift + 2.85, T.lift + 3.3, T.lift + 3.75]; T.end = T.lift + 6.5;
  const tileStart = (j) => T.lift + j * T.gap;

  const C = {
    rock: '#6d5c8c', rockDark: '#463a66', grass: '#3f9a70', grass2: '#2f7a62', stone: '#9a8fb0', stoneLight: '#d8cfdf', stoneDark: '#5a4f74',
    wood: '#7c4b2a', woodDark: '#4c2c1a', leaf: '#235f5c', leaf2: '#2c8068', trunk: '#5a3a2a',
    parch: '#efe1b8', parchDark: '#c9b27c', ink: '#2a1830', gold: '#d9a441', gilt: '#ffe2a0', banner: '#4a2a80', bannerDark: '#33195e',
    lit: '#e85a00', ember: '#c9502a', wisp: '#8ff2ff', crystal: '#7a54e8', crystalOn: '#8ffcff', pearl: '#efe6f4',
    roofA: '#2d5fa8', roofB: '#6a3aa0', wall: '#d9cde2', skin: '#ead9b4', glass: '#141038', ice: '#bfe4f0', frost: '#eef3f1', leather: '#5a1f3c',
    fog: '#6f5596', good: '#2fbf71', bad: '#d8344c',
  };

  // ---------------------------------------------------------------- notes, as the course data names them
  const LET = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 }, SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const parseNote = (n) => { const m = /^([A-G])(#|b)?(-?\d)$/.exec(n), acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, oct = +m[3];
    return { name: n, letter: m[1], acc, oct, step: LET[m[1]] + 7 * oct, midi: 12 * (oct + 1) + SEMI[m[1]] + acc }; };
  const pretty = (n) => n.letter + (n.acc < 0 ? '♭' : n.acc > 0 ? '♯' : '');
  const BOTTOM = { treble: 30, bass: 18 };                       // E4 / G2 on the bottom line
  const pOf = (n, clef) => (n.step - BOTTOM[clef]) / 2;          // staff position: 0 = bottom line, 0.5 = first space
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------------------------------------------------------------- music notation as geometry (units: 1 = the gap between two staff lines)
  const U = 0.2, DEPTH = 0.12;
  const fromTris = (pos) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g; };
  function ribbon(P, n = 60) {
    const curve = new THREE.CatmullRomCurve3(P.map((p) => new THREE.Vector3(p[0], p[1], 0)), false, 'catmullrom', 0.5), L = [], R = [], pos = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, p = curve.getPoint(u), tg = curve.getTangent(u), k = u * (P.length - 1), i0 = Math.min(P.length - 2, Math.floor(k)), w = K.lerp(P[i0][2], P[i0 + 1][2], k - i0) / 2;
      L.push([p.x - tg.y * w, p.y + tg.x * w]); R.push([p.x + tg.y * w, p.y - tg.x * w]);
    }
    const quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d), at = (q, z) => [q[0], q[1], z];
    for (let i = 0; i < n; i++) {
      quad(at(L[i], DEPTH), at(R[i], DEPTH), at(R[i + 1], DEPTH), at(L[i + 1], DEPTH));
      quad(at(R[i], DEPTH), at(R[i], 0), at(R[i + 1], 0), at(R[i + 1], DEPTH));
      quad(at(L[i], 0), at(L[i], DEPTH), at(L[i + 1], DEPTH), at(L[i + 1], 0));
    }
    return fromTris(pos);
  }
  const extrude = (pts, holes = [], depth = DEPTH) => {
    const s = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    for (const h of holes) s.holes.push(new THREE.Path(h.map((p) => new THREE.Vector2(p[0], p[1]))));
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 });
  };
  const box = (w, h, d, x = 0, y = 0, z = 0) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; };
  const disc = (r, x, y) => { const g = new THREE.CylinderGeometry(r, r, DEPTH, 16); g.rotateX(Math.PI / 2); g.translate(x, y, DEPTH / 2); return g; };
  const slab = (w, h, x, y, rot) => { const g = new THREE.BoxGeometry(w, h, DEPTH); g.rotateZ(rot); g.translate(x, y, DEPTH / 2); return g; };
  const GLY = {
    clef: () => [ribbon([[-0.02, 0.62, 0.1], [-0.46, 0.92, 0.17], [-0.34, 1.62, 0.2], [0.22, 1.96, 0.24], [0.84, 1.5, 0.3], [0.96, 0.78, 0.36], [0.5, 0.1, 0.34], [-0.25, -0.02, 0.32], [-0.95, 0.5, 0.34], [-1.12, 1.4, 0.37],
      [-0.78, 2.4, 0.33], [-0.12, 3.3, 0.27], [0.48, 4.2, 0.21], [0.62, 5.0, 0.16], [0.3, 5.62, 0.14], [-0.06, 5.1, 0.16], [-0.04, 4.0, 0.2], [0.1, 2.0, 0.2], [0.25, 0.0, 0.2], [0.33, -1.2, 0.2], [0.12, -1.82, 0.2], [-0.34, -1.95, 0.2], [-0.6, -1.6, 0.2]], 130),
      (() => { const g = new THREE.CylinderGeometry(0.27, 0.27, DEPTH, 20); g.rotateX(Math.PI / 2); g.translate(-0.56, -1.52, DEPTH / 2); return g; })()],
    // bass (F) clef: x = 0 at its head, y = 0 on the bottom line; the head and the two dots sit round the F line (y = 3)
    bassClef: () => [ribbon([[0.12, 3.05, 0.14], [0.3, 3.6, 0.22], [0.85, 3.98, 0.28], [1.45, 3.75, 0.36], [1.72, 3.05, 0.42], [1.55, 2.15, 0.4], [1.05, 1.25, 0.3], [0.45, 0.7, 0.2], [-0.05, 0.4, 0.1]], 70),
      disc(0.34, 0.22, 3.0), disc(0.16, 2.2, 3.5), disc(0.16, 2.2, 2.5)],
    four: () => { const g = extrude([[0.8, 0], [1.15, 0], [1.15, 0.5], [1.4, 0.5], [1.4, 0.8], [1.15, 0.8], [1.15, 2], [0.74, 2], [0, 0.82], [0, 0.5], [0.8, 0.5]], [[[0.8, 0.8], [0.8, 1.42], [0.4, 0.8]]]); g.translate(-0.7, 0, 0); return [g]; },
    headQ: () => { const g = new THREE.SphereGeometry(0.5, 24, 14); g.scale(1.42, 1.0, 0.3); g.rotateZ(0.36); return [g]; },
    headH: () => { const g = new THREE.TorusGeometry(0.37, 0.15, 10, 28); g.scale(1.22, 0.84, 0.6); g.rotateZ(0.36); return [g]; },
    headW: () => { const g = new THREE.TorusGeometry(0.37, 0.15, 10, 28); g.scale(1.72, 0.95, 0.6); return [g]; },
    stem: () => [box(0.13, 3.3, 0.12)],
    flat: () => [box(0.13, 2.3, DEPTH, -0.3, 0.6, DEPTH / 2), ribbon([[-0.3, 0.42, 0.1], [0.08, 0.7, 0.22], [0.4, 0.42, 0.3], [0.2, -0.12, 0.24], [-0.3, -0.56, 0.1]], 22)],
    sharp: () => [box(0.12, 2.5, DEPTH, -0.2, 0.08, DEPTH / 2), box(0.12, 2.5, DEPTH, 0.2, -0.08, DEPTH / 2), slab(0.95, 0.22, 0, 0.42, 0.32), slab(0.95, 0.22, 0, -0.42, 0.32)],
    natural: () => [box(0.12, 2.0, DEPTH, -0.24, 0.4, DEPTH / 2), box(0.12, 2.0, DEPTH, 0.24, -0.4, DEPTH / 2), slab(0.56, 0.2, 0, 0.36, 0.3), slab(0.56, 0.2, 0, -0.36, 0.3)],
    rest: () => [extrude([[-0.28, 3.5], [0.42, 2.6], [0.0, 1.98], [0.46, 1.3], [0.1, 1.38], [-0.14, 1.24], [-0.24, 1.0], [-0.16, 0.76], [0.1, 0.5], [-0.3, 0.6], [-0.56, 0.84], [-0.64, 1.14], [-0.5, 1.46], [-0.2, 1.62], [-0.04, 1.66], [-0.5, 2.24], [-0.02, 2.84], [-0.42, 3.4]])],
    wholeRest: () => [box(1.15, 0.5, DEPTH, 0, 2.75, DEPTH / 2)],
    halfRest: () => [box(1.15, 0.5, DEPTH, 0, 2.25, DEPTH / 2)],
    barline: () => [box(0.12, 4, DEPTH, 0, 2, DEPTH / 2)],
    thick: () => [box(0.45, 4, DEPTH, 0, 2, DEPTH / 2)],
    dots: () => [disc(0.2, 0, 1.5), disc(0.2, 0, 2.5)],
    ledger: () => [box(1.9, 0.1, DEPTH * 0.8, 0, 0, DEPTH * 0.4)],
    // time-signature digits (as 'four': two spaces tall, centred on x = 0)
    two: () => [ribbon([[-0.6, 1.4, 0.3], [-0.3, 1.9, 0.3], [0.3, 1.9, 0.32], [0.55, 1.45, 0.34], [0.3, 0.95, 0.34], [-0.55, 0.15, 0.34]], 40), box(1.25, 0.3, DEPTH, 0.02, 0.15, DEPTH / 2)],
    three: () => [ribbon([[-0.55, 1.7, 0.28], [-0.15, 1.95, 0.3], [0.35, 1.75, 0.32], [0.35, 1.25, 0.32], [-0.15, 1.05, 0.3]], 30), ribbon([[-0.15, 1.05, 0.3], [0.45, 0.8, 0.34], [0.4, 0.25, 0.34], [-0.15, 0.02, 0.3], [-0.6, 0.3, 0.28]], 30)],
    // note parts, in a note's own frame (head at 0, 0)
    flagDown: () => [ribbon([[-0.57, -3.4, 0.36], [-0.1, -2.75, 0.3], [0.45, -2.25, 0.22], [0.5, -1.5, 0.12]], 24)],
    flagUp: () => [ribbon([[0.57, 3.4, 0.36], [1.05, 2.75, 0.3], [1.55, 2.2, 0.22], [1.45, 1.45, 0.12]], 24)],
    dot: () => [disc(0.2, 0, 0)],
    // marks placed on the staff
    eighthRest: () => [disc(0.27, -0.3, 2.62), ribbon([[-0.3, 2.45, 0.16], [0.0, 2.45, 0.14], [0.3, 2.78, 0.12]], 10), slab(0.15, 1.75, 0.06, 1.95, -0.24)],
    breath: () => [disc(0.3, 0, 0.35), ribbon([[0.27, 0.4, 0.22], [0.22, -0.2, 0.16], [-0.05, -0.62, 0.06]], 12)],
    fermata: () => [ribbon([[-1.05, 0, 0.12], [-0.75, 0.75, 0.2], [0, 1.08, 0.24], [0.75, 0.75, 0.2], [1.05, 0, 0.12]], 30), disc(0.2, 0, 0.25)],
    accent: () => [slab(1.12, 0.16, 0, 0.25, -0.4636), slab(1.12, 0.16, 0, -0.25, 0.4636)],
    wholeBar: () => [box(1.15, 0.5, DEPTH, 0, 2.75, DEPTH / 2)],

  };
  const _gly = {};
  const gly = (name) => _gly[name] || (_gly[name] = GLY[name]());

  // ---------------------------------------------------------------- words in the world ("♭" and "♯" drawn by hand)
  function drawText(ctx, text, x, cy, px) {
    for (const part of text.split(/([♭♯])/)) {
      if (!part) continue;
      if (part === '♭') {
        ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = px * 0.085;
        const sx = x + px * 0.1; ctx.beginPath(); ctx.moveTo(sx, cy - px * 0.52); ctx.lineTo(sx, cy + px * 0.33); ctx.stroke();
        ctx.lineWidth = px * 0.1; ctx.beginPath(); ctx.moveTo(sx, cy - px * 0.02); ctx.bezierCurveTo(sx + px * 0.2, cy - px * 0.22, sx + px * 0.42, cy - px * 0.02, sx, cy + px * 0.33); ctx.stroke(); ctx.restore();
        x += px * 0.44;
      } else if (part === '♯') {
        ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineCap = 'butt'; ctx.lineWidth = px * 0.06;
        for (const dx of [0.15, 0.31]) { ctx.beginPath(); ctx.moveTo(x + px * dx, cy - px * 0.4); ctx.lineTo(x + px * dx, cy + px * 0.4); ctx.stroke(); }
        ctx.lineWidth = px * 0.11; for (const dy of [-0.13, 0.13]) { ctx.beginPath(); ctx.moveTo(x + px * 0.04, cy + px * (dy + 0.05)); ctx.lineTo(x + px * 0.42, cy + px * (dy - 0.05)); ctx.stroke(); }
        ctx.restore(); x += px * 0.46;
      } else { ctx.fillText(part, x, cy); x += ctx.measureText(part).width; }
    }
    return x;
  }
  const textWidth = (ctx, text, px) => text.split(/([♭♯])/).reduce((s, p) => s + (p === '♭' ? px * 0.44 : p === '♯' ? px * 0.46 : ctx.measureText(p).width), 0);
  function label(text, { height = 0.2, color = C.ink, face = '700 {px}px "Alegreya"', spacing = 0, maxW = 0, glow = 0 } = {}) {
    const px = 128, font = face.replace('{px}', px), m = document.createElement('canvas').getContext('2d'); m.font = font; if (spacing) m.letterSpacing = spacing + 'px';
    const pad = 24, w = Math.ceil(textWidth(m, text, px)) + pad * 2, h = Math.ceil(px * 1.5);
    const tex = K.canvasTex(w, h, (ctx) => { ctx.font = font; if (spacing) ctx.letterSpacing = spacing + 'px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = color; drawText(ctx, text, pad, h / 2 + px * 0.04, px); });
    let unit = height / px; if (maxW && (w - pad * 2) * unit > maxW) unit = maxW / (w - pad * 2);
    const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.02, roughness: 0.8, metalness: 0 });
    if (glow) { mat.emissive = new THREE.Color('#ffffff'); mat.emissiveMap = tex; mat.emissiveIntensity = glow; mat.userData.glow = glow; }
    const me = new THREE.Mesh(new THREE.PlaneGeometry(w * unit, h * unit), mat); me.userData.w = (w - pad * 2) * unit; me.userData.isLabel = true;
    return me;
  }
  const CINZEL = '700 {px}px "Texturina"', CINZEL_B = '700 {px}px "Texturina"';

  function tmNeutral(c) {
    const x = Math.min(c[0], c[1], c[2]), off = x < 0.08 ? x - 6.25 * x * x : 0.04; let o = c.map((v) => v - off);
    const peak = Math.max(o[0], o[1], o[2]); if (peak < 0.76) return o;
    const d = 0.24, np = 1 - d * d / (peak + d - 0.76); o = o.map((v) => v * np / peak);
    const g = 1 - 1 / (0.15 * (peak - np) + 1); return o.map((v) => v + (np - v) * g);
  }
  function lightFor(hex) {
    const c = new THREE.Color(hex), target = [c.r, c.g, c.b];
    let v = target.slice();
    for (let k = 0; k < 400; k++) { const o = tmNeutral(v); v = v.map((x, i) => K.clamp(x + (target[i] - o[i]), 0, 24)); }
    return new THREE.Color(v[0], v[1], v[2]);
  }

  registerStyle({
    id: 'high-fantasy-band-essentials-playable',
    name: 'High Fantasy (playable)',
    duration: 1e9,
    fonts: ['700 150px "Oswald"', '500 128px "Oswald"', '700 128px "Texturina"', '700 128px "Alegreya"', '500 128px "Alegreya"'],
    render: { samples: 64, shutter: 0.4, tone: 'neutral', exposure: 1.0, bloom: 0.45, bloomThreshold: 1.15, bloomRadius: 1.2, vignette: 0.32, grain: 0.02, ca: 0.002, fov: 30, background: '#000000', far: 1400 },

    build(S) {
      const { THREE, K, scene, camera } = S;
      const Q = { sun: +(params.get('shadow') || 2048), sky: 1024 };
      const TALL = S.H > S.W, FOV = TALL ? 40 : 30, tanV = Math.tan(FOV * Math.PI / 360), tanH = tanV * S.W / S.H, LOGO = LAYOUT(S.W, S.H);
      const anims = [];
      // the chapter's look: the castle world is the default; a chapter with its own scenery overrides parts of it
      const SC = Object.assign({ tree: { look: TREE_LOOK, make: sceneTree }, light: { look: LIGHT_LOOK, make: sceneLight } }, SCENE_REG)[CH.scene], LOOK = SC ? SC.look : null, LIGHT = CH.scene === 'light';
      // Chapter 3: the lighthouse lamp and the scroll's lantern flash on the rhythm's notes (filled in by the game)
      // a chapter's scenery reacts to the game through SIG: the game calls its hooks (onRhythm, onRight, onTerm, onStop) and gives it sounds
      const SIG = SC ? { flashAt: [], sweep: null } : null;
      const bump = (t, t0, len = 0.28) => { const u = (t - t0) / len; return u <= 0 || u >= 1 ? 0 : Math.sin(u * Math.PI) * (1 - u); };

      // ------------------------------------------------------------ materials
      const std = (color, metal, rough, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, metalness: metal, roughness: rough }, o));
      const facet = (color, rough = 0.9, o = {}) => std(color, 0, rough, Object.assign({ flatShading: true }, o));
      const rnd = K.rng(11);
      const parchTex = K.canvasTex(1024, 512, (ctx, w, h) => {
        ctx.fillStyle = C.parch; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 260; i++) { const x = rnd() * w, y = rnd() * h, r = 20 + rnd() * 90, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rnd() < 0.5 ? '150,110,50' : '255,250,225'},${0.03 + rnd() * 0.05})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
        const e = ctx.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(120,80,30,0.28)'); e.addColorStop(0.05, 'rgba(120,80,30,0)'); e.addColorStop(0.95, 'rgba(120,80,30,0)'); e.addColorStop(1, 'rgba(120,80,30,0.28)'); ctx.fillStyle = e; ctx.fillRect(0, 0, w, h);
        const e2 = ctx.createLinearGradient(0, 0, 0, h); e2.addColorStop(0, 'rgba(120,80,30,0.22)'); e2.addColorStop(0.1, 'rgba(120,80,30,0)'); e2.addColorStop(0.9, 'rgba(120,80,30,0)'); e2.addColorStop(1, 'rgba(120,80,30,0.22)'); ctx.fillStyle = e2; ctx.fillRect(0, 0, w, h);
      });
      const M = {
        rock: facet(C.rock), rockDark: facet(C.rockDark), grass: facet(C.grass), grass2: facet(C.grass2), stone: facet(C.stone, 0.85), stoneLight: facet(C.stoneLight, 0.8), stoneDark: facet(C.stoneDark, 0.85),
        wood: facet(C.wood, 0.85), woodDark: facet(C.woodDark, 0.85), leaf: facet(C.leaf), leaf2: facet(C.leaf2), trunk: facet(C.trunk),
        parch: std('#ffffff', 0, 0.85, { map: parchTex }), parchDark: std(C.parchDark, 0, 0.85), ink: std(C.ink, 0, 0.55), gold: std(C.gold, 1, 0.34, { flatShading: true }), goldSmooth: std(C.gold, 1, 0.3),
        banner: std(C.banner, 0, 0.8), bannerDark: std(C.bannerDark, 0, 0.8), skin: std(C.skin, 0, 0.7), wall: facet(C.wall, 0.85), roofA: facet(C.roofA, 0.7), roofB: facet(C.roofB, 0.7),
        leather: std(C.leather, 0, 0.6), frost: std(C.frost, 0, 0.5), pale: std('#e9dfcf', 0, 0.6), cloud: facet('#cfa9d2', 1), peak: facet('#3b2f70', 1),
        hit: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
      };
      const glows = [];
      const glowing = (color, base, o = {}) => {
        const m = std(color, o.metal || 0, o.rough == null ? 0.45 : o.rough, { emissive: new THREE.Color(o.restGlow || o.glow || C.lit), emissiveIntensity: 0, flatShading: !!o.facet });
        m.userData = { base, rest: o.rest || 0, g: 0, c0: new THREE.Color(color), c1: new THREE.Color(o.to || C.lit), tint: o.tint == null ? 0.85 : o.tint, e0: new THREE.Color(o.restGlow || o.glow || C.lit), e1: new THREE.Color(o.glow || C.lit), glowMat: true };
        glows.push(m); return m;
      };
      const set = (m, g) => { const u = m.userData; u.g = g; m.color.copy(u.c0).lerp(u.c1, g * u.tint); m.emissive.copy(u.e0).lerp(u.e1, g); };
      // a second colour for a glowing thing: used to show right (green) and wrong (red) answers
      const tintTo = (m, hex) => { const u = m.userData; u.c1.set(hex); u.e1.set(hex); };
      const lum = (color, glow, k, o = {}) => glowing(color, k, Object.assign({ rest: k, glow, restGlow: glow, tint: 0 }, o));
      const basics = [];
      const basic = (color, k = 1, o = {}) => { const m = new THREE.MeshBasicMaterial(Object.assign({ color: new THREE.Color(color).multiplyScalar(k) }, o)); m.userData = { c0: m.color.clone(), o0: m.opacity }; basics.push(m); return m; };
      const add = (parent, geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = true; parent.add(m); return m; };
      const cylZ = (r, h, seg = 28) => { const g = new THREE.CylinderGeometry(r, r, h, seg); g.rotateX(Math.PI / 2); return g; };
      const cylX = (r, h, seg = 20) => { const g = new THREE.CylinderGeometry(r, r, h, seg); g.rotateZ(Math.PI / 2); return g; };
      const group = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
      const OCTA = new THREE.OctahedronGeometry(1, 0);
      // things the player can touch
      const picks = [];
      const pickable = (mesh, info) => { mesh.userData.pick = info; picks.push(mesh); return mesh; };
      // remove a group of things made for one question, and free what was made for it alone (shared shapes are kept)
      function clear(g) {
        g.traverse((o) => {
          const i = picks.indexOf(o); if (i >= 0) picks.splice(i, 1);
          if (o.material) { const m = o.material, gi = glows.indexOf(m); if (gi >= 0) glows.splice(gi, 1); if (o.userData.isLabel) { m.map && m.map.dispose(); m.dispose(); o.geometry.dispose(); } }
        });
        while (g.children.length) g.remove(g.children[0]);
      }

      // ------------------------------------------------------------ light
      K.env(S, LOOK ? LOOK.env : { top: '#1c2266', horizon: '#d07a90', bottom: '#3b2b62', intensity: 0.6, blur: 0.06, panels: [
        { pos: [-22, 24, 40], size: [34, 18], color: '#ffc88c', power: 4.5 }, { pos: [34, 10, 22], size: [14, 22], color: '#ff9cc4', power: 2.2 }, { pos: [0, 44, -12], size: [44, 12], color: '#8ea2ff', power: 2.2 }, { pos: [-36, 6, -20], size: [16, 12], color: '#ffb070', power: 2.5 }] });
      const RAD = 36, DA = 0.27, STEP = 2.6, A0 = -(NS - 1) * DA / 2;
      const SUN_OFF = new THREE.Vector3(-20, 46, 43), sun = K.sun(S, { pos: [-20, 50, RAD + 40], target: [0, 4, RAD - 3], color: LOOK ? LOOK.sun : '#ffd0a0', power: LOOK ? LOOK.sunPower : 2.5, size: 28, soft: 1.0, mapSize: Q.sun, far: 220 });
      const hemi = LOOK ? new THREE.HemisphereLight(...LOOK.hemi) : new THREE.HemisphereLight('#9a92ff', '#6a3c58', 0.42); scene.add(hemi);
      const key = new THREE.SpotLight('#ffe6c8', 110, 60, 0.42, 0.9, 1.6); key.castShadow = false; scene.add(key, key.target);
      const FOG = new THREE.Color(LOOK ? LOOK.fog : C.fog); scene.fog = new THREE.Fog(FOG.clone(), 60, 900);

      // ------------------------------------------------------------ the sky
      const skyTex = K.canvasTex(2048, 1024, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        (LOOK ? LOOK.sky : [[0, '#070a2c'], [0.22, '#141550'], [0.36, '#2f2278'], [0.44, '#6a3a90'], [0.485, '#d06a88'], [0.5, '#f4a070'], [0.515, '#a8588a'], [0.58, '#3f2c70'], [1, '#141038']]).forEach(([s, c]) => g.addColorStop(s, c));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const [u, a, r] of (LOOK ? LOOK.skyGlow : [[0.84, 0.6, 0.2], [0.68, 0.28, 0.16]])) { ctx.save(); ctx.translate(u * w, h * 0.5); ctx.scale(1, 0.3); const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, w * r); sg.addColorStop(0, `rgba(${LOOK ? LOOK.glowRGB : '255,205,140'},${a})`); sg.addColorStop(1, 'rgba(255,160,120,0)'); ctx.fillStyle = sg; ctx.fillRect(-w * r, -w * r, w * r * 2, w * r * 2); ctx.restore(); }
        if (!LOOK || LOOK.stars) for (let i = 0; i < 1500; i++) { const y = Math.pow(rnd(), 1.5) * h * 0.43, a = (1 - y / (h * 0.45)) * (0.3 + rnd() * 0.7), r = rnd() < 0.04 ? 2.2 : 0.7 + rnd() * 0.9; ctx.fillStyle = `rgba(${rnd() < 0.3 ? '190,215,255' : '255,240,220'},${a})`; ctx.beginPath(); ctx.arc(rnd() * w, y, r, 0, 7); ctx.fill(); }
        ctx.globalCompositeOperation = 'source-over';
      });
      const skyMat = basic('#ffffff', 1, { map: skyTex, side: THREE.BackSide, fog: false, depthWrite: false });
      const sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), skyMat); sky.castShadow = false; scene.add(sky);
      const moonTex = K.canvasTex(512, 512, (ctx, w) => {
        ctx.fillStyle = '#fff3dc'; ctx.fillRect(0, 0, w, w);
        for (let i = 0; i < 26; i++) { const x = rnd() * w, y = rnd() * w, r = 8 + rnd() * 44; ctx.fillStyle = `rgba(200,170,190,${0.12 + rnd() * 0.2})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      });
      const moon = new THREE.Mesh(new THREE.SphereGeometry(64, 32, 20), basic('#ffffff', 1.25, { map: moonTex, fog: false })); moon.position.set(-150, 170, -760); scene.add(moon);
      if (LOOK && LOOK.sunDisc) { const d = LOOK.sunDisc; moon.material = basic(d.color, d.k, { fog: false }); moon.position.set(...d.pos); moon.scale.setScalar(d.r / 64); }
      const moon2 = new THREE.Mesh(new THREE.SphereGeometry(20, 24, 16), basic('#9fe6e0', 1.1, { fog: false })); moon2.position.set(330, 150, -640); if (!LOOK || LOOK.moon2 !== false) scene.add(moon2);
      if (LOOK) { M.peak.color.set(LOOK.peak); M.cloud.color.set(LOOK.cloud); }
      {
        const peaks = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 5), M.peak, 46); peaks.castShadow = false; scene.add(peaks); peaks.visible = !LOOK || LOOK.peaks !== false;
        for (let i = 0; i < 46; i++) { const a = i / 46 * Math.PI * 2 + K.hash(i, 1) * 0.1, r = 330 + K.hash(i, 2) * 130, hgt = 70 + K.hash(i, 3) * 90; K.place(peaks, i, [Math.sin(a) * r, -60 + hgt / 2, Math.cos(a) * r], [0, K.hash(i, 4) * 6, 0], [45 + K.hash(i, 5) * 55, hgt, 45 + K.hash(i, 6) * 55]); }
        if (!LOOK || LOOK.cloudSea !== false) { const sea = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.cloud, 170); sea.castShadow = false; sea.receiveShadow = false; scene.add(sea);
        for (let i = 0; i < 170; i++) { const a = K.hash(i, 7) * Math.PI * 2, r = 14 + 300 * Math.sqrt(K.hash(i, 8)), s = 9 + K.hash(i, 9) * 16; K.place(sea, i, [Math.sin(a) * r, -21 - K.hash(i, 10) * 6, Math.cos(a) * r], [0, K.hash(i, 11) * 6, 0], [s, 3 + K.hash(i, 12) * 3, s * (0.6 + 0.5 * K.hash(i, 13))]); } }
      }
      const drift = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.cloud, 48); drift.castShadow = false; drift.receiveShadow = false; scene.add(drift); drift.visible = !LOOK || LOOK.drift !== false;
      const driftAt = (t) => {
        for (let c = 0; c < 12; c++) { const a = Math.PI + (K.hash(c, 21) - 0.5) * 2.6, r = 70 + K.hash(c, 22) * 150, y = -4 + K.hash(c, 23) * 46, cx = Math.sin(a) * r + (t % 400) * (0.25 + 0.3 * K.hash(c, 24)), cz = Math.cos(a) * r;
          for (let j = 0; j < 4; j++) { const s = (5 + K.hash(c, j + 25) * 6) * (j === 0 ? 1.3 : 1); K.place(drift, c * 4 + j, [cx + (j - 1.5) * 6.5, y + (j % 2) * 1.6 - 1, cz + (K.hash(c, j + 30) - 0.5) * 5], null, [s * 1.3, s * 0.55, s]); } }
        drift.instanceMatrix.needsUpdate = true;
      };

      // ------------------------------------------------------------ floating land
      const radJ = (ang, seed, amp = 0.14) => 1 + amp * (2 * K.hash(Math.round(ang / (Math.PI * 2) * 44), seed) - 1);
      function rockGeo(r, depth, seed, seg = 11, rows = 4) {
        const g = new THREE.CylinderGeometry(r, r * 0.1, depth, seg, rows, false); g.translate(0, -depth / 2, 0);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr < 1e-4) continue;
          const u = -y / depth, ang = Math.atan2(z, x), row = Math.round(u * rows), nr = r * (Math.pow(Math.max(0, 1 - u), 0.8) + 0.03) * (row === 0 ? radJ(ang, seed) : radJ(ang, seed + row * 7, 0.3));
          p.setXYZ(i, x / rr * nr, y + (row > 0 && row < rows ? (K.hash(Math.round(ang * 7), seed + row) - 0.5) * depth * 0.16 : 0), z / rr * nr);
        }
        return g;
      }
      function turfGeo(r, seed, seg = 11, th = 0.34) {
        const g = new THREE.CylinderGeometry(r * 1.05, r * 0.97, th, seg, 1, false); g.translate(0, -th / 2, 0);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr < 1e-4) continue; const k = radJ(Math.atan2(z, x), seed); p.setX(i, x * k); p.setZ(i, z * k); }
        return g;
      }
      const islet = (parent, r, depth, seed) => { add(parent, rockGeo(r, depth, seed), seed % 2 ? M.rock : M.rockDark, 0, -0.2, 0); add(parent, turfGeo(r, seed), M.grass); for (let k = 0; k < 3; k++) { const a = K.hash(seed, k) * 6.3, m = add(parent, OCTA, M.rockDark, Math.cos(a) * r * 0.7, -depth * (0.55 + 0.2 * k), Math.sin(a) * r * 0.7); m.scale.set(0.3 + 0.3 * K.hash(seed, k + 3), 0.5 + 0.5 * K.hash(seed, k + 6), 0.3); m.rotation.set(k, k * 2, 0.3); } };
      const CONE7 = new THREE.ConeGeometry(1, 1, 7), CYL6 = new THREE.CylinderGeometry(0.8, 1, 1, 6);
      const pine = (parent, x, y, z, h, seed = 0) => {
        const g = group(parent, x, y, z); g.rotation.y = seed;
        add(g, CYL6, M.trunk, 0, 0.16 * h, 0).scale.set(0.08 * h, 0.32 * h, 0.08 * h);
        for (let k = 0; k < 3; k++) add(g, CONE7, k % 2 ? M.leaf2 : M.leaf, 0, (0.46 + k * 0.23) * h, 0).scale.set((0.33 - 0.07 * k) * h, 0.42 * h, (0.33 - 0.07 * k) * h);
        return g;
      };
      const shards = (parent, x, y, z, s, mat, seed = 0, n = 4) => { for (let k = 0; k < n; k++) { const m = add(parent, OCTA, mat, x + (K.hash(seed, k) - 0.5) * s * 0.9, y + s * 0.3, z + (K.hash(seed, k + 5) - 0.5) * s * 0.6); const hh = s * (0.45 + 0.6 * K.hash(seed, k + 9)); m.scale.set(hh * 0.3, hh, hh * 0.3); m.rotation.set((K.hash(seed, k + 2) - 0.5) * 0.7, k, (K.hash(seed, k + 3) - 0.5) * 0.7); } };
      const SH = LOOK ? LOOK.shards : ['#5a3ad0', '#7a54ff', '#2a8aa0', '#5fe8ff'];
      const M_VIOLET = lum(SH[0], SH[1], 0.9, { facet: true, rough: 0.25 }), M_CYAN = lum(SH[2], SH[3], 1.1, { facet: true, rough: 0.25 }), M_CAP = lum('#2a7a90', '#6ff0ff', 1.5, { facet: true }), M_WARM = lum('#6a4a20', '#ffc070', 2.2);
      const CAP = new THREE.SphereGeometry(1, 7, 3, 0, Math.PI * 2, 0, Math.PI / 2);
      const shroom = (parent, x, y, z, s) => { add(parent, CYL6, M.pale, x, y + s * 0.3, z).scale.set(s * 0.12, s * 0.6, s * 0.12); add(parent, CAP, M_CAP, x, y + s * 0.55, z, { cast: false }).scale.set(s * 0.42, s * 0.3, s * 0.42); };

      // ------------------------------------------------------------ the islands
      const SUM = (NS - 1) * STEP + 4;
      const LAND = SC ? SC.make({ THREE, K, scene, add, group, std, facet, lum, anims, turfGeo, rockGeo, CYL6, M, RAD, SUM, SIG, getG: () => G, spireA: A0 + (NS - 1) * DA + Math.PI - 0.35, A0, DA, STEP, NS, CH }) : null;
      const ISLET = LAND ? LAND.islet : islet, PINE = LAND ? LAND.tree : pine;
      const PY = 2.55, PW = 4.7, PH = 1.9, DAIS = 0.55;
      const gameOf = (i) => i % NG;
      const isl = Array.from({ length: NS }, (_, i) => {
        const a = A0 + i * DA, g = group(scene, RAD * Math.sin(a), i * STEP, RAD * Math.cos(a)); g.rotation.y = a;
        ISLET(g, 4.7, 7 + (i % 2), i + 1);
        if (gameOf(i) < 4) { const d = add(g, new THREE.CylinderGeometry(1, 1.06, DAIS, 9), M.stone, 0, DAIS / 2, 0.55); d.scale.set(3.25, 1, 1.15); }
        [[-3.5, -1.5, 3.4], [3.3, -2.0, 3.9], [-2.1, -3.1, 4.6], [1.5, -3.3, 4.2], [-0.2, -2.6, 3.2], [3.9, -0.4, 2.3]].forEach(([x, z, h], k) => { if ((k + i) % 6 !== 5) PINE(g, x + (K.hash(i, k) - 0.5) * 0.5, 0, z, h * (0.85 + 0.3 * K.hash(i, k + 7)), k + i); });
        shards(g, (i % 2 ? -1 : 1) * 3.75, 0, 1.3, 0.75, i % 2 ? M_CYAN : M_VIOLET, i * 3 + 1); shards(g, (i % 2 ? 1 : -1) * 3.9, 0, 0.2, 0.5, i % 2 ? M_VIOLET : M_CYAN, i * 3 + 2, 3);
        shroom(g, (i % 2 ? 1 : -1) * 3.55, 0, 1.75, 0.5); shroom(g, (i % 2 ? 1 : -1) * 3.85, 0, 1.45, 0.34); shroom(g, (i % 2 ? -1 : 1) * 3.2, 0, 2.1, 0.3);
        return { i, g, a, game: gameOf(i) };
      });
      // five sets of game props; each sits on the island where its game is played next, and moves up the stair as the player climbs
      const props = GAMES.map(() => new THREE.Group()), restLocal = [];
      const placeProps = (game, stop) => { isl[stop].g.add(props[game]); props[game].updateMatrixWorld(true); };
      props.forEach((_, k) => placeProps(k, k));
      // game state that the scene reads (filled in by the game further down)
      const G = { t: 0, tau: 0.3, mode: 'title', endTau: -1, doneAt: new Array(NS).fill(-1), island: 0 };
      const sparks = [];
      isl.forEach((b, i) => {
        const name = label(GAMES[b.game].name, { height: 0.3, face: CINZEL, color: C.gilt, maxW: 3.3 }), w = name.userData.w, x0 = 0.18, bh = 0.6, n = 0.2, xl = x0 - w / 2 - 0.55, xr = x0 + w / 2 + 0.48;
        const bg = group(b.g, 0, 4.22, 0);
        add(bg, extrude([[xl, -bh / 2], [xr, -bh / 2], [xr - n, 0], [xr, bh / 2], [xl, bh / 2]], [], 0.05), M.banner, 0, 0, -0.03);
        for (const sy of [-1, 1]) add(bg, box(xr - xl - 0.3, 0.03, 0.012), M.goldSmooth, (xl + xr) / 2 - 0.08, sy * (bh / 2 - 0.075), 0.026, { cast: false });
        name.position.set(x0, 0, 0.03); bg.add(name);
        const mx = xl + 0.02; add(bg, cylZ(0.38, 0.1, 10), M.gold, mx, 0, 0.02); add(bg, cylZ(0.29, 0.11, 24), M.parch, mx, 0, 0.022);
        const num = label(String(i + 1), { height: 0.36, face: CINZEL_B, color: C.ember }); num.position.set(mx, 0.0, 0.085); bg.add(num);
        const cm = glowing(C.crystal, 3.2, { glow: C.crystalOn, restGlow: '#6a48ff', rest: 0.35, to: C.crystalOn, tint: 0.6, facet: true, rough: 0.2 }), cr = add(bg, OCTA, cm, xr + 0.3, 0, 0, { cast: false });
        b.g.updateMatrixWorld(true); sparks.push(cr.getWorldPosition(new THREE.Vector3()));
        anims.push((t) => { bg.position.y = 4.22 + 0.03 * Math.sin(t * 1.3 + i * 1.7); const d0 = G.doneAt[i], d = d0 < 0 ? 0 : K.seg(t, d0, d0 + 0.12), pop = 1 + 0.5 * (d0 < 0 ? 0 : bump(t, d0, 0.5)); set(cm, d * (0.85 + 0.15 * Math.sin(t * 9))); cr.scale.set(0.15 * pop, 0.3 * pop, 0.15 * pop); cr.rotation.y = t * 0.9 + i; });
      });

      // staff(): five ruled lines on `face`. X(spaces from the left end), Y(0 = bottom line). put() places a glyph on `parent`.
      function staff(face, x0, len, y0, mat = M.ink) {
        for (let k = 0; k < 5; k++) add(face, box(len, 0.017, 0.006, len / 2, 0, 0.003), mat, x0, y0 + k * U, 0, { cast: false });
        const X = (su) => x0 + su * U, Y = (p) => y0 + p * U;
        const put = (name, su, p, m2, parent = face) => { const g = group(parent, X(su), Y(p), 0.002); g.scale.setScalar(U); for (const geo of gly(name)) add(g, geo, m2 || mat, 0, 0, 0, { cast: false }); return g; };
        return { X, Y, put, x0, len, y0 };
      }
      const inkLit = (o) => glowing(C.ink, 0.14, Object.assign({ rough: 0.5, tint: 1, to: C.lit, glow: C.lit }, o));
      function note(parent, kind, stem, x, y, mat = inkLit()) {
        const g = group(parent, x, y, 0.012); g.scale.setScalar(U); g.userData.mat = mat;
        add(g, gly(kind === 'q' ? 'headQ' : kind === 'h' ? 'headH' : 'headW')[0], mat, 0, 0, 0, { cast: false });
        if (stem) add(g, gly('stem')[0], mat, stem > 0 ? 0.57 : -0.57, stem * 1.75, 0, { cast: false });
        return g;
      }
      // a written note with its ledger lines and accidental, on staff `sf`, into `parent`
      function writeNote(parent, sf, clef, n, su, kind, mat = inkLit(), stemDir) {
        const p = pOf(n, clef), stem = kind === 'w' ? 0 : (stemDir || (p < 2 ? 1 : -1));
        for (let l = -1; l >= p - 0.01; l--) sf.put('ledger', su, l, mat, parent);
        for (let l = 5; l <= p + 0.01; l++) sf.put('ledger', su, l, mat, parent);
        const nn = note(parent, kind, stem, sf.X(su), sf.Y(p), mat);
        if (n.acc) sf.put(n.acc < 0 ? 'flat' : 'sharp', su - (kind === 'w' ? 1.45 : 1.35), p, mat, parent);
        return nn;
      }
      // a curve on a staff from su1 to su2 at height p, bulging up (dir 1) or down (-1): ties and slurs
      function arcOn(sf, su1, su2, p, dir, mat, parent) {
        const L = su2 - su1, g = group(parent, sf.X(su1), sf.Y(p), 0.012); g.scale.setScalar(U);
        add(g, ribbon([[0, 0, 0.06], [L * 0.2, dir * 0.45, 0.2], [L * 0.5, dir * 0.62, 0.26], [L * 0.8, dir * 0.45, 0.2], [L, 0, 0.06]], 30), mat, 0, 0, 0, { cast: false }); return g;
      }
      // a hairpin: open at the end for a crescendo (grow true), at the start for a diminuendo
      function hairpin(sf, su1, su2, p, grow, mat, parent) {
        const L = su2 - su1, g = group(parent, sf.X(su1), sf.Y(p), 0.012); g.scale.setScalar(U); const w = 0.75, a = Math.atan2(w, L), len = Math.hypot(L, w);
        for (const sy of [-1, 1]) { const m = add(g, box(len, 0.15, DEPTH), mat, L / 2, sy * w / 2, DEPTH / 2, { cast: false }); m.rotation.z = (grow ? 1 : -1) * sy * a; }
        return g;
      }
      const putClef = (sf, clef, parent, mat) => clef === 'bass' ? sf.put('bassClef', 0.7, 0, mat, parent) : sf.put('clef', 1.7, 0, mat, parent);
      const text = (parent, str, x, y, z, o) => { const l = label(str, o); l.position.set(x, y, z); parent.add(l); if (l.material.userData.glow) lumText.push(l.material); return l; };
      const lumText = [];
      const sign = (parent, str, x, y, z, h = 0.2) => { const g = group(parent, x, y, z), l = label(str, { height: h, face: CINZEL, color: C.gilt }), w = l.userData.w + 0.26; add(g, new THREE.CylinderGeometry(0.035, 0.045, 0.5, 5), M.woodDark, 0, 0.2, -0.05); const plank = add(g, K.roundedBox(w, h * 1.7, 0.07, 0.02, 2), M.woodDark, 0, 0.42, 0); l.position.set(0, 0.42, 0.04); g.add(l); g.rotation.x = -0.12; g.userData.plank = plank; g.userData.label = l; return g; };

      // the wisp's flights between islands, as in the movie

      // ---- 1. Read Rhythms: a scroll between two posts, four rune stones to count in, a hand drum to tap
      const R1 = {};
      {
        const g = props[0];
        for (const sx of [-1, 1]) add(g, new THREE.CylinderGeometry(0.1, 0.13, 3.3, 7), M.wood, sx * (PW / 2 + 0.34), DAIS + 1.65, -0.14);
        pickable(add(g, K.roundedBox(PW, PH + 0.24, 0.04, 0.015, 2), M.parch, 0, PY, 0), { kind: 'scroll' });
        for (const sy of [-1, 1]) { add(g, cylX(0.09, PW + 0.12, 10), M.parchDark, 0, PY + sy * (PH / 2 + 0.14), 0); for (const sx of [-1, 1]) add(g, cylX(0.13, 0.16, 8), M.woodDark, sx * (PW / 2 + 0.14), PY + sy * (PH / 2 + 0.14), 0); }
        // with eighth notes the staff is drawn smaller, so two bars of beamed pairs fit the scroll
        const RS = CH.rhythm.eighths ? 0.75 : 1, face = group(g, 0, PY, 0.022); face.scale.setScalar(RS);
        const sf = staff(face, -2.15 / RS, 4.3 / RS, -0.05 / RS - 2 * U);
        sf.put('four', 3.8, 2); sf.put('four', 3.8, 0);
        const dyn = group(face);
        const drum = group(g, -1.8, DAIS + 0.36, 0.72); drum.rotation.x = 0.55;
        add(drum, new THREE.CylinderGeometry(0.44, 0.37, 0.5, 12), M.wood); add(drum, new THREE.CylinderGeometry(0.455, 0.455, 0.07, 12), M.gold, 0, 0.21, 0); const skin = add(drum, new THREE.CylinderGeometry(0.415, 0.415, 0.03, 12), M.skin, 0, 0.255, 0); add(drum, new THREE.CylinderGeometry(0.39, 0.39, 0.05, 12), M.gold, 0, -0.2, 0);
        pickable(add(drum, new THREE.CylinderGeometry(0.6, 0.6, 0.9, 10), M.hit, 0, 0.1, 0, { cast: false }), { kind: 'drum' });
        const sticks = [-1, 1].map((sx) => { const s = group(drum, sx * 0.56, 0.52, 0.02); add(s, cylX(0.02, 0.5, 6), M.woodDark, -sx * 0.25, 0, 0); add(s, new THREE.SphereGeometry(0.05, 8, 6), M.pale, -sx * 0.5, 0, 0); return s; });
        const sTap = sign(g, 'Tap', -0.98, DAIS, 0.78), sCount = sign(g, 'Count in', 0.02, DAIS, 0.78);
        pickable(sTap.userData.plank, { kind: 'drum' }); pickable(sCount.userData.plank, { kind: 'countin' });
        const SX = [0.98, 1.44, 1.9, 2.36], STONE = (() => { const s = new THREE.CylinderGeometry(0.23, 0.28, 0.52, 4); s.rotateY(Math.PI / 4); return s; })();
        const stones = SX.map((x, k) => { const s = group(g, x, DAIS + 0.26, 0.82); const body = add(s, STONE, M.stoneLight); pickable(body, { kind: 'countin' }); text(s, String(k + 1), 0, 0.0, 0.195, { height: 0.26, face: CINZEL_B }); const m = glowing('#5a2a1c', 0.6, { rough: 0.3, tint: 0.95, facet: true }); add(s, OCTA, m, 0, 0.4, 0, { cast: false }).scale.set(0.085, 0.12, 0.085); s.userData.mat = m; return s; });
        Object.assign(R1, { face, sf, dyn, drum, skin, sticks, stones, notes: [], stoneAt: [-9, -9, -9, -9], tapAt: [] });
        anims.push((t) => {
          stones.forEach((s, k) => { const tc = R1.stoneAt[k]; set(s.userData.mat, tc > -9 ? (t >= tc ? Math.max(0, 1 - (t - tc) * 0.35) : 0) : 0); s.position.y = DAIS + 0.26 + 0.07 * bump(t, tc, 0.3); });
          sticks.forEach((s, j) => { let hit = 0; R1.tapAt.forEach((tp, k) => { if (k % 2 === j) hit = Math.max(hit, bump(t, tp - 0.02, 0.22)); }); s.rotation.z = (j ? 1 : -1) * (0.1 + 0.36 * Math.min(1, hit * 1.7)); });
        });
        restLocal[0] = [2.6, PY + 1.25, 1.0];
        R1.sig = SIG;
        if (CH.rhythm.eighths) { face.visible = false; R1.dynRoot = group(g, 0, PY, 0.022); }   // these chapters draw their staff for each rhythm, sized to fit
        // Chapter 3: a ship's lantern hangs from the right-hand post and flashes with the lighthouse
        if (LIGHT) {
          const px = PW / 2 + 0.34, top = PY + 0.75, iron = std('#2a2a36', 0.6, 0.45, { flatShading: true });
          add(g, box(0.55, 0.05, 0.05), iron, px + 0.24, top, -0.14);
          const lan = group(g, px + 0.44, top - 0.52, -0.14);
          add(lan, new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), iron, 0, 0.36, 0, { cast: false });
          add(lan, new THREE.ConeGeometry(0.17, 0.16, 6), iron, 0, 0.17, 0); add(lan, new THREE.CylinderGeometry(0.15, 0.15, 0.04, 6), iron, 0, -0.18, 0);
          const lm = glowing('#7a5a2a', 4.5, { rest: 0.5, glow: '#ffd890', restGlow: '#ffb860', to: '#fff0c0', tint: 0.8 });
          add(lan, new THREE.CylinderGeometry(0.12, 0.12, 0.3, 6), lm, 0, 0, 0, { cast: false });
          for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; add(lan, box(0.02, 0.3, 0.02), iron, Math.sin(a) * 0.125, 0, Math.cos(a) * 0.125, { cast: false }); }
          const ll = new THREE.PointLight('#ffcf80', 0, 5, 1.6); lan.add(ll);
          anims.push((t) => { let f = 0; for (const tf of SIG.flashAt) { const u = (t - tf) / 0.3; if (u >= 0 && u < 1) f = Math.max(f, 1 - u); } set(lm, f); ll.intensity = 0.6 + 5 * f; lan.rotation.z = 0.04 * Math.sin(t * 1.4); });
        }
      }

      // ---- 2. Fingering Trainer: a standing stone; the note is cut into its face beside the instrument's keys, set as gems
      const R2 = {};
      {
        const g = props[1];
        const slabG = extrude([[-2.75, -1.95], [2.8, -1.95], [2.92, 0.5], [2.62, 1.14], [1.5, 1.36], [0.1, 1.5], [-1.6, 1.36], [-2.6, 1.1], [-2.93, 0.3]], [], 0.8); slabG.translate(0, 0, -0.8);
        add(g, slabG, M.stone, 0, PY, -0.02);
        add(g, K.roundedBox(PW, PH, 0.06, 0.04, 2), M.pale, 0, PY, 0.0);
        const face = group(g, 0, PY, 0.032), sf = staff(face, -2.15, 2.85, -0.45);
        const runeM = lum('#3a6a8a', '#6fe6ff', 1.2);
        for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) { const r = group(g, sx * 2.62, PY + 0.75 - k * 0.42, 0.0); add(r, box(0.035, 0.22, 0.02), runeM, 0, 0, 0, { cast: false }); const d = add(r, box(0.035, 0.13, 0.02), runeM, 0.05 * ((k % 2) * 2 - 1), 0.03 * (k % 3 - 1), 0, { cast: false }); d.rotation.z = (k % 2 ? 1 : -1) * (0.7 + 0.2 * k); }
        const pl = group(g, -1.25, DAIS + 0.3, 0.75); pl.rotation.x = -0.45; add(pl, K.roundedBox(2.05, 0.5, 0.12, 0.03, 2), M.stoneLight);
        const plText = group(pl);
        const flames = [0.75, 1.95].map((x) => { add(g, new THREE.CylinderGeometry(0.2, 0.09, 0.3, 7), M.gold, x, DAIS + 0.3, 0.8); add(g, new THREE.CylinderGeometry(0.05, 0.11, 0.18, 6), M.stoneDark, x, DAIS + 0.09, 0.8); return add(g, CONE7, M_WARM, x, DAIS + 0.62, 0.8, { cast: false }); });
        anims.push((t) => flames.forEach((f, k) => { const fl = 1 + 0.12 * Math.sin(t * 17 + k * 2) * Math.sin(t * 7.1 + k); f.scale.set(0.13 * fl, 0.36 * (2 - fl), 0.13 * fl); f.rotation.y = t * 3 + k; }));
        Object.assign(R2, { face, sf, clefG: group(face), noteG: group(face), keysG: group(face), plText, gems: [] });
        restLocal[1] = [-2.0, PY + 1.35, 1.0];
      }

      // ---- 3. Write Notes: a spellbook on a lectern. The note waits in its tray; drag it to the staff, then add a flat or sharp
      const R3 = {};
      {
        const g = props[2];
        add(g, new THREE.CylinderGeometry(0.42, 0.66, 1.5, 6), M.stoneDark, 0, DAIS + 0.75, -0.95); add(g, new THREE.CylinderGeometry(0.6, 0.45, 0.25, 6), M.stone, 0, DAIS + 1.55, -0.95);
        const bk = group(g, 0, PY, 0); bk.rotation.x = -0.3;
        add(bk, K.roundedBox(5.6, 2.6, 0.16, 0.04, 2), M.woodDark, 0, -0.02, -0.28);
        add(bk, box(5.6, 0.14, 0.34), M.woodDark, 0, -1.25, -0.05);
        add(bk, K.roundedBox(5.22, 2.34, 0.1, 0.04, 2), M.leather, 0, 0, -0.14);
        for (const sx of [-1, 1]) { add(bk, K.roundedBox(2.44, 2.12, 0.1, 0.02, 2), M.parch, sx * 1.245, 0, -0.045); add(bk, box(2.4, 2.08, 0.05), M.parchDark, sx * 1.245, 0, -0.085); }
        add(bk, box(0.05, 2.12, 0.04), M.parchDark, 0, 0, -0.04, { cast: false });
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(bk, box(0.3, 0.3, 0.03), std('#a87a2a', 1, 0.55), sx * 2.47, sy * 1.03, -0.085).rotation.z = Math.PI / 4;
        add(bk, box(0.12, 0.7, 0.012), std('#b0282e', 0, 0.7), 0.3, -1.36, -0.07);
        const face = group(bk, 0, 0, 0.007);
        const LX = -1.245;
        text(face, 'Write this note:', LX, 0.7, 0.004, { height: 0.2 });
        for (const sy of [-1, 1]) add(face, box(1.9, 0.012, 0.004), M.goldSmooth, LX, 0.18 + sy * 0.36, 0.003, { cast: false });
        const home = new THREE.Vector3(LX, -0.6, 0.014);
        add(face, K.roundedBox(0.86, 0.5, 0.012, 0.05, 2), M.goldSmooth, LX, -0.6, 0.004, { cast: false }); add(face, K.roundedBox(0.76, 0.4, 0.014, 0.04, 2), M.pale, LX, -0.6, 0.005, { cast: false });
        pickable(add(face, box(0.9, 0.56, 0.04), M.hit, LX, -0.6, 0.02, { cast: false }), { kind: 'tray' });
        const sf = staff(face, 0.2, 2.2, -0.42);
        pickable(add(face, box(2.3, 2.05, 0.01), M.hit, 1.245, 0, 0.02, { cast: false }), { kind: 'page' });
        // two wax seals on the left page: flat and sharp
        const seals = [['♭', -1, -2.12], ['♯', 1, -0.38]].map(([s, acc, x]) => {
          const sg = group(face, x, -0.6, 0.01), m = glowing('#8a1c2c', 0.5, { rough: 0.5, tint: 0.9, to: C.lit });
          const body = add(sg, cylZ(0.2, 0.04, 14), m, 0, 0, 0.02, { cast: false }); pickable(body, { kind: 'seal', acc });
          text(sg, s, -0.02, 0.0, 0.045, { height: 0.3, face: CINZEL_B, color: '#ffe2a0' });
          sg.userData = { mat: m, acc }; return sg;
        });
        const well = new THREE.Vector3(2.0, DAIS + 0.24, 0.8);
        add(g, new THREE.CylinderGeometry(0.15, 0.2, 0.24, 8), std('#1a1436', 0.2, 0.25, { flatShading: true }), well.x, DAIS + 0.12, well.z); add(g, new THREE.CylinderGeometry(0.16, 0.16, 0.04, 8), M.gold, well.x, DAIS + 0.25, well.z);
        shards(g, -2.3, DAIS, 0.8, 0.5, M_CYAN, 31, 3);
        g.updateMatrixWorld(true);
        const rest = face.worldToLocal(g.localToWorld(well.clone()));
        const quill = group(face); quill.rotation.z = -0.5;
        add(quill, extrude([[0, 0.16], [0.11, 0.42], [0.1, 0.8], [0, 1.05], [-0.1, 0.8], [-0.11, 0.42]], [], 0.012), std('#f4f1ff', 0, 0.6), 0, 0, -0.006); add(quill, new THREE.CylinderGeometry(0.012, 0.004, 1.0, 5), M.parchDark, 0, 0.5, 0);
        quill.position.copy(rest);
        Object.assign(R3, { bk, face, sf, home, seals, quill, rest, clefG: group(face), askG: group(face), noteG: group(face), accG: group(face), quillAt: -9, quillTo: new THREE.Vector3() });
        anims.push((t) => {
          const q0 = R3.quillAt, fp = R3.quillTo;
          const qp = K.track([[q0, rest.toArray()], [q0 + 0.46, [fp.x, fp.y + 0.36, 0.03]], [q0 + 0.8, [fp.x + 0.04, fp.y - 0.22, 0.03], 'linear'], [q0 + 1.0, [fp.x + 1.25, fp.y - 0.5, 0.35], 'in'], [q0 + 1.5, rest.toArray(), 'out']])(t);
          quill.position.set(qp[0], qp[1], qp[2]); quill.rotation.z = -0.5 + 0.12 * Math.sin((t - q0) * 30) * K.seg(t, q0 + 0.42, q0 + 0.46) * (1 - K.seg(t, q0 + 0.8, q0 + 0.84));
        });
        restLocal[2] = [2.9, PY + 1.4, 0.9];
      }

      // ---- 4. Read Notes: a magic mirror, and three shields to strike
      const R4 = {};
      {
        const g = props[3];
        const arch = (w, h, top) => { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2 - top); s.quadraticCurveTo(0, h / 2 + top, -w / 2, h / 2 - top); s.closePath(); return s; };
        const outer = arch(PW + 0.56, PH + 0.62, 0.34), inner = arch(PW + 0.08, PH + 0.16, 0.3); outer.holes.push(inner);
        add(g, new THREE.ExtrudeGeometry(outer, { depth: 0.26, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1, curveSegments: 10 }), M.gold, 0, PY, -0.2);
        const glassTex = K.canvasTex(1024, 512, (ctx, w, h) => {
          const gr = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6); gr.addColorStop(0, '#2b1f6a'); gr.addColorStop(1, '#0e0a2c'); ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 140; i++) { ctx.fillStyle = `rgba(200,210,255,${0.1 + rnd() * 0.35})`; ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, 0.6 + rnd() * 1.3, 0, 7); ctx.fill(); }
        });
        const gg = new THREE.ShapeGeometry(arch(PW + 0.12, PH + 0.2, 0.3), 10); { const p = gg.attributes.position, uv = gg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (PW + 0.12) + 0.5, p.getY(i) / (PH + 0.8) + 0.5); }
        add(g, gg, std('#ffffff', 0.5, 0.16, { map: glassTex }), 0, PY, -0.02, { cast: false });
        for (const sx of [-1, 1]) { add(g, new THREE.CylinderGeometry(0.12, 0.2, 1.0, 6), M.gold, sx * 2.2, DAIS + 0.5, -0.1); const jm = add(g, OCTA, M_CYAN, sx * (PW / 2 + 0.28), PY + 1.02, 0.1, { cast: false }); jm.scale.set(0.1, 0.16, 0.1); }
        const face = group(g, 0, PY, -0.012);
        const gilt = lum('#8a6a2a', '#ffd88a', 1.25, { rough: 0.4 }), sf = staff(face, -2.15, 4.3, -0.6, gilt);
        sf.put('four', 3.8, 2); sf.put('four', 3.8, 0);
        text(face, 'Which note is displayed on the staff?', 0.15, 0.66, 0.004, { height: 0.185, color: '#ffe9bc', glow: 0.9 });
        const heater = (s) => { const sh = new THREE.Shape(); sh.moveTo(-0.42 * s, 0.44 * s); sh.lineTo(0.42 * s, 0.44 * s); sh.lineTo(0.42 * s, 0.02); sh.quadraticCurveTo(0.4 * s, -0.36 * s, 0, -0.56 * s); sh.quadraticCurveTo(-0.4 * s, -0.36 * s, -0.42 * s, 0.02); sh.closePath(); return sh; };
        const rims = ['#b02a3a', '#2d5fb8', '#2a8a5a'];
        const shields = [0, 1, 2].map((k) => {
          const q = group(g, (k - 1) * 1.3, DAIS + 0.56, 0.86); q.rotation.x = -0.3;
          add(q, new THREE.ExtrudeGeometry(heater(1), { depth: 0.07, bevelEnabled: false, curveSegments: 6 }), std(rims[k], 0.3, 0.45), 0, 0, -0.07);
          const fm = glowing('#f1e6c8', 0.1, { rough: 0.5, tint: 0.95, to: '#e05200' }); pickable(add(q, new THREE.ShapeGeometry(heater(0.82), 6), fm, 0, 0.005, 0.004, { cast: false }), { kind: 'shield', k });
          add(g, new THREE.CylinderGeometry(0.04, 0.05, 0.5, 5), M.woodDark, (k - 1) * 1.3, DAIS + 0.3, 0.62).rotation.x = 0.5;
          q.userData = { mat: fm, labelG: group(q), hitAt: -9 }; return q;
        });
        Object.assign(R4, { face, sf, gilt, shields, clefG: group(face), noteG: group(face) });
        anims.push((t) => shields.forEach((q) => { const h = bump(t, q.userData.hitAt, 0.4); q.rotation.x = -0.3 - 0.3 * h; }));
        restLocal[3] = [2.75, DAIS + 1.6, 1.3];
      }

      // ---- 5. Terms & Symbols: an ice slab over an altar, eight answer cards
      const tiles = [];
      const R5 = {};
      {
        const g = props[4];
        const slabG = extrude([[-2.8, -1.6], [2.76, -1.6], [2.96, 0.2], [2.52, 1.1], [0.9, 1.3], [-1.3, 1.2], [-2.62, 1.08], [-2.96, 0.1]], [], 0.6); slabG.translate(0, 0, -0.6);
        add(g, slabG, facet(C.ice, 0.3, { emissive: '#2a6a8a', emissiveIntensity: 0.0 }), 0, PY, -0.02);
        add(g, K.roundedBox(PW, PH, 0.05, 0.04, 2), M.frost, 0, PY, 0.0);
        shards(g, -2.9, 1.0, -0.3, 1.1, M_CYAN, 51, 4); shards(g, 2.95, 1.0, -0.3, 0.9, M_VIOLET, 52, 4);
        const face = group(g, 0, PY, 0.027), sf = staff(face, -2.15, 4.3, -0.55);
        add(g, K.roundedBox(5.3, 0.5, 1.5, 0.05, 2), M.stone, 0, 0.25, 0.3); add(g, box(5.5, 0.12, 1.7), M.stoneDark, 0, 0.06, 0.3); add(g, box(5.0, 0.9, 0.5), M.stone, 0, 0.75, -0.05);
        const deck = group(g, 0, 1.02, 0.55); deck.rotation.x = -0.5;
        add(deck, K.roundedBox(5.0, 1.0, 0.14, 0.04, 2), M.stoneDark, 0, 0, -0.04); add(deck, K.roundedRect(4.84, 0.84, 0.04), std('#3d2a66', 0, 0.8), 0, 0, 0.034, { cast: false });
        for (let k = 0; k < 8; k++) {
          const w = 1.08, h = 0.31, tb = new THREE.Group(), mat = glowing(C.parch, 0.22, { rough: 0.7, tint: 0.92 });
          const plate = add(tb, K.roundedBox(w + 0.06, h + 0.06, 0.03, 0.02, 2), M.goldSmooth, 0, 0, -0.012), body = add(tb, K.roundedBox(w, h, 0.045, 0.02, 2), mat);
          pickable(body, { kind: 'card', k });
          const l = text(tb, '', 0, -0.005, 0.026, { height: 0.172, maxW: w - 0.12 });
          tb.userData = { mat, body, label: l, plate, w, h };
          tb.position.set(((k % 4) - 1.5) * 1.17, k < 4 ? 0.19 : -0.19, 0.075); deck.add(tb); tiles.push(tb);
        }
        Object.assign(R5, { face, sf, deck, dyn: group(face), hlMats: [] });
        anims.push((t) => R5.hlMats.forEach((m) => set(m, 0.75 + 0.25 * Math.sin(t * 7))));
        restLocal[4] = [2.9, PY + 1.35, 1.1];
      }

      // ---- 6. Key Signatures (Units 7-12): a stone gate holds a staff with the signature; four golden keys hang below it
      const R6 = {};
      if (CH.keys) {
        const g = props[5];
        for (const sx of [-1, 1]) { add(g, box(0.62, 4.3, 0.7), M.stone, sx * (PW / 2 + 0.42), 2.15, -0.2); add(g, box(0.8, 0.3, 0.86), M.stoneDark, sx * (PW / 2 + 0.42), 4.38, -0.2); }
        add(g, box(PW + 1.7, 0.5, 0.8), M.stoneDark, 0, 4.15, -0.2);
        const arch = add(g, new THREE.TorusGeometry(PW / 2 + 0.1, 0.16, 6, 20, Math.PI), M.gold, 0, 3.6, -0.15); arch.scale.y = 0.25;
        add(g, K.roundedBox(PW + 0.2, PH + 0.3, 0.12, 0.04, 2), M.stoneDark, 0, PY + 0.3, -0.12);
        const panelM = glowing(C.parch, 0.0, { rough: 0.8, tint: 0.5 }); add(g, K.roundedBox(PW, PH + 0.1, 0.05, 0.04, 2), panelM, 0, PY + 0.3, 0);
        const face = group(g, 0, PY + 0.3, 0.03), sf = staff(face, -2.15, 4.3, -0.35);
        const lock = group(g, 0, 0.7, 0.05); add(lock, K.roundedBox(0.9, 0.7, 0.12, 0.05, 2), M.gold); add(lock, cylZ(0.09, 0.14, 10), M.ink, 0, 0.08, 0.04); add(lock, box(0.08, 0.2, 0.14), M.ink, 0, -0.08, 0.04);
        add(g, box(5.0, 0.07, 0.07), M.woodDark, 0, 2.12, 0.75);
        const keys = [0, 1, 2, 3].map((k) => {
          const kg = group(g, (k - 1.5) * 1.18, 2.1, 0.75), body = group(kg);
          const km = glowing('#c9a040', 0.25, { metal: 0.9, rough: 0.35, tint: 0.85 });
          add(body, new THREE.TorusGeometry(0.11, 0.035, 6, 14), km, 0, -0.12, 0); add(body, new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), km, 0, -0.42, 0);
          add(body, box(0.14, 0.07, 0.04), km, 0.07, -0.6, 0); add(body, box(0.1, 0.06, 0.04), km, 0.05, -0.5, 0);
          const tm = glowing(C.parch, 0.2, { rough: 0.7, tint: 0.92 }), tag = add(body, K.roundedBox(0.98, 0.3, 0.03, 0.03, 2), tm, 0, -0.86, 0.02);
          pickable(add(kg, box(1.05, 1.1, 0.3), M.hit, 0, -0.5, 0.05, { cast: false }), { kind: 'key', k });
          kg.userData = { body, mat: km, tagMat: tm, labelG: group(body, 0, -0.86, 0.04), turnAt: -9, hitAt: -9 }; return kg;
        });
        Object.assign(R6, { face, sf, dyn: group(face), keys, panelM, lock });
        anims.push((t) => keys.forEach((kg, k) => { const u = kg.userData, sw = 0.06 * Math.sin(t * 1.3 + k), h = bump(t, u.hitAt, 0.4); kg.rotation.z = sw + 0.25 * h; u.body.rotation.y = u.turnAt < 0 ? 0 : K.seg(t, u.turnAt, u.turnAt + 0.5) * Math.PI / 2; }));
        restLocal[5] = [2.9, PY + 1.5, 1.1];
      }

      // ------------------------------------------------------------ between and around the islands
      for (let i = 0; i < NS - 1; i++) for (let k = 1; k <= 3; k++) {
        const a = A0 + (i + k / 4) * DA, r = RAD + 0.4 + 0.8 * Math.sin(k * 2.1 + i), y = (i + k / 4) * STEP - 0.25 + 0.2 * Math.sin(k * 1.3 + i * 2);
        const s = LAND ? LAND.step(r * Math.sin(a), y, r * Math.cos(a), i * 3 + k) : add(scene, new THREE.CylinderGeometry(0.55, 0.3, 0.3, 6), k % 2 ? M.stone : M.rock, r * Math.sin(a), y, r * Math.cos(a)); if (!LAND) s.rotation.y = k + i; s.scale.setScalar(0.8 + 0.4 * K.hash(i, k));
        anims.push((t) => { s.position.y = y + 0.07 * Math.sin(t * 1.1 + k * 1.9 + i); });
      }
      const rocklet = LAND ? LAND.rocklet : (a, r, y, size, seed, trees = 2) => { const g = group(scene, r * Math.sin(a), y, r * Math.cos(a)); g.rotation.y = seed; islet(g, size, size * 1.7, seed); for (let k = 0; k < trees; k++) pine(g, (K.hash(seed, k) - 0.5) * size, 0, (K.hash(seed, k + 4) - 0.5) * size, size * (0.5 + 0.4 * K.hash(seed, k + 8)), k); if (seed % 2) shards(g, size * 0.4, 0, size * 0.3, size * 0.4, seed % 4 === 1 ? M_CYAN : M_VIOLET, seed); anims.push((t) => { g.position.y = y + 0.25 * Math.sin(t * 0.5 + seed); }); return g; };
      for (let i = 0; i < NS - 1; i += 2) rocklet(A0 + (i + 0.5) * DA, RAD + (TALL ? 8.5 : 6.5), (i + 0.5) * STEP - 2.6, 0.95, 60 + i, 1);
      [[Math.PI - 0.5, 46, 16, 6], [Math.PI + 0.5, 60, 2, 8], [Math.PI + 0.1, 80, 26, 7], [Math.PI - 0.95, 70, 30, 5], [Math.PI + 1.0, 52, 22, 5], [2.4, 66, 8, 6], [-2.4, 66, 18, 7], [2.9, 90, 44, 6], [-2.9, 84, 50, 5]].forEach(([a, r, y, s], k) => rocklet(a, r, y, s, 70 + k, 3));
      if (LAND) { LAND.landmark(); LAND.distant(); } else {
      {
        // the mountain: a jagged low-poly peak, violet rock below, pale stone higher, snow on the shoulders; flat-topped for the citadel
        const H0 = -45, MH = SUM - H0, mg = new THREE.CylinderGeometry(13.5, 31, MH, 26, 14, false); mg.translate(0, H0 + MH / 2, 0);
        const p = mg.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = p.getZ(i), rr = Math.hypot(x, z); if (rr < 1e-4 || y > SUM - 0.01) continue;
          const ang = Math.atan2(z, x), row = Math.round((y - H0) / MH * 14), k = 1 + 0.16 * (K.hash(Math.round(ang / (Math.PI * 2) * 26), row, 5) * 2 - 1);
          p.setXYZ(i, x * k, y + (K.hash(row, Math.round(ang * 9), 7) - 0.5) * 3, z * k);
        }
        const mesh = mg.toNonIndexed(), pp = mesh.attributes.position, cols = new Float32Array(pp.count * 3), c = new THREE.Color();
        const ROCK = new THREE.Color(C.rockDark), MID = new THREE.Color(C.stone), SNOW = new THREE.Color('#eef0fb');
        for (let f = 0; f < pp.count; f += 3) {
          const y = (pp.getY(f) + pp.getY(f + 1) + pp.getY(f + 2)) / 3, u = (y - H0) / MH, jit = K.hash(f, 3) * 0.12;
          if (u + jit > 0.8) c.copy(SNOW); else if (u + jit > 0.42) c.copy(MID).lerp(ROCK, 0.25 * K.hash(f, 4)); else c.copy(ROCK).lerp(MID, 0.3 * K.hash(f, 5));
          for (let v = 0; v < 3; v++) { cols[(f + v) * 3] = c.r; cols[(f + v) * 3 + 1] = c.g; cols[(f + v) * 3 + 2] = c.b; }
        }
        mesh.setAttribute('color', new THREE.BufferAttribute(cols, 3)); mesh.computeVertexNormals();
        const mm = add(scene, mesh, std('#ffffff', 0, 0.95, { vertexColors: true, flatShading: true }), 0, 0, 0, { cast: false }); mm.receiveShadow = false;
        // crags and pines on the slopes
        for (let k = 0; k < 40; k++) { const a = K.hash(k, 61) * Math.PI * 2, y = H0 + 20 + K.hash(k, 62) * (MH - 34), r = 13.5 + (31 - 13.5) * (1 - (y - H0) / MH) - 0.5; if (y < SUM - 8) pine(scene, Math.sin(a) * r, y, Math.cos(a) * r, 2.5 + 2 * K.hash(k, 63), k); }
      }
      {
        const cg = group(scene, 0, SUM, 0); add(cg, turfGeo(13.6, 91), M.grass);
        const winM = lum('#6a4a20', '#ffc66a', 2.4), WIN = box(0.3, 0.55, 0.08);
        const tower = (x, z, r, h, roof, seed) => {
          const tg = group(cg, x, 0, z); tg.rotation.y = seed;
          add(tg, new THREE.CylinderGeometry(r * 0.9, r, h, 8), M.wall, 0, h / 2, 0, { cast: false }); add(tg, new THREE.CylinderGeometry(r * 1.12, r * 0.95, r * 0.5, 8), M.wall, 0, h + r * 0.1, 0, { cast: false });
          add(tg, new THREE.ConeGeometry(r * 1.25, r * 2.6, 8), roof, 0, h + r * 1.6, 0, { cast: false });
          for (let k = 0; k < Math.floor(h / 2.2); k++) { const a = k * 2.4 + seed, w = add(tg, WIN, winM, Math.sin(a) * r * 0.93, 1.6 + k * 2.2, Math.cos(a) * r * 0.93, { cast: false }); w.rotation.y = a; }
        };
        tower(0, 0, 3.3, 27, M.roofA, 0.4); tower(-8.2, 2.5, 1.9, 15, M.roofB, 1.1); tower(8.4, -0.5, 2.1, 19, M.roofA, 2.3); tower(-4.6, -6.5, 1.7, 21, M.roofA, 0.2); tower(5.2, 6.4, 1.6, 11, M.roofB, 1.7); tower(-1.5, 9.2, 1.3, 8.5, M.roofA, 2.9);
        add(cg, new THREE.CylinderGeometry(11, 11.4, 3.2, 14, 1, true), facet(C.wall, 0.85, { side: THREE.DoubleSide }), 0, 1.6, 0, { cast: false });
        [[-7, 9, 3.5], [7.5, 8, 4.2], [-10.5, -3, 5], [10, -5.5, 4.6]].forEach(([x, z, h], k) => pine(cg, x, 0, z, h, k));
        const big = add(cg, OCTA, lum('#3a8ab0', '#7ff0ff', 2.6, { facet: true, rough: 0.2 }), 0, 41, 0, { cast: false }); big.scale.set(1.5, 3.2, 1.5);
        anims.push((t) => { big.rotation.y = t * 0.5; big.position.y = 41 + 0.5 * Math.sin(t * 0.8); });
      }
      }

      // ------------------------------------------------------------ the wisp: on the flights it keeps the movie's path; on an island it goes where the player acts
      const WS = { pos: new THREE.Vector3(), from: new THREE.Vector3(), to: new THREE.Vector3(), t0: -9, dur: 0.3, lift: 0.25, free: false, hist: [] };
      const wispTo = (v, dur = 0.32, lift = 0.25) => { WS.from.copy(WS.pos); WS.to.copy(v); WS.t0 = G.t; WS.dur = dur; WS.lift = lift; WS.free = true; };
      const restOf = (i) => isl[i].g.localToWorld(new THREE.Vector3(...restLocal[isl[i].game]));
      const haloTex = K.canvasTex(128, 128, (ctx, w) => { const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(170,245,255,0.75)'); g.addColorStop(0.5, 'rgba(90,200,255,0.2)'); g.addColorStop(1, 'rgba(60,140,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, w); });
      const wisp = group(scene), wCore = add(wisp, new THREE.SphereGeometry(0.055, 12, 8), basic('#eaffff', 2.2), 0, 0, 0, { cast: false }); wCore.receiveShadow = false;
      const haloM = new THREE.SpriteMaterial({ map: haloTex, color: new THREE.Color('#9ff4ff').multiplyScalar(0.55), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }); haloM.userData = { c0: haloM.color.clone(), o0: 1 }; basics.push(haloM);
      const halo = new THREE.Sprite(haloM); halo.scale.setScalar(0.42); wisp.add(halo);
      const wLight = new THREE.PointLight('#a8f4ff', 0, 5, 1.6); wisp.add(wLight);
      const TRAIL = 44, trail = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), basic('#aef6ff', 2.6), TRAIL); trail.frustumCulled = false; trail.castShadow = false; scene.add(trail);
      const BURST = 14, burst = new THREE.InstancedMesh(OCTA, basic('#fff0b0', 3), 5 * BURST); burst.frustumCulled = false; burst.castShadow = false; scene.add(burst);
      const MOTES = 110, motes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), basic('#ffe8b0', 2.4), MOTES); motes.frustumCulled = false; motes.castShadow = false; scene.add(motes);
      scene.updateMatrixWorld(true); WS.pos.copy(restOf(0));
      const moteHome = Array.from({ length: MOTES }, (_, k) => isl[k % NS].g.localToWorld(new THREE.Vector3((K.hash(k, 41) - 0.5) * 11, 0.4 + K.hash(k, 42) * 5.2, -3 + K.hash(k, 43) * 5.4)));
      let lastHist = -1;
      const air = (t) => {
        if (WS.free) {
          const e = K.seg(t, WS.t0, WS.t0 + WS.dur, K.ease.inOut);
          WS.pos.copy(WS.from).lerp(WS.to, e); WS.pos.y += WS.lift * Math.sin(e * Math.PI);
        }
        const w = wisp.position.copy(WS.pos); w.x += 0.025 * Math.sin(t * 5.3); w.y += 0.03 * Math.sin(t * 4.1 + 1);
        if (t !== lastHist) { WS.hist.unshift(w.clone()); if (WS.hist.length > TRAIL) WS.hist.length = TRAIL; lastHist = t; }
        for (let j = 0; j < TRAIL; j++) { const p = WS.hist[Math.min(WS.hist.length - 1, j)] || w, s = 0.036 * (1 - j / TRAIL); K.place(trail, j, [p.x + 0.02 * Math.sin(j * 2.1 + t * 9), p.y + 0.02 * Math.cos(j * 1.7 + t * 8), p.z], null, s); }
        trail.instanceMatrix.needsUpdate = true;
        sparks.forEach((c, i) => { for (let j = 0; j < BURST; j++) {
          const d0 = G.doneAt[i], u = d0 < 0 ? 0 : K.clamp((t - d0) / (0.75 + 0.3 * K.hash(i, j))), e = K.ease.out(u), a = j / BURST * Math.PI * 2 + i, el = (K.hash(j, i + 3) - 0.3) * 1.6, d = 0.5 + 0.7 * K.hash(j, i + 5);
          K.place(burst, i * BURST + j, [c.x + Math.cos(a) * Math.cos(el) * d * e, c.y + Math.sin(el) * d * e - 0.5 * u * u, c.z + Math.sin(a) * Math.cos(el) * d * e * 0.6 + 0.2 * e], [u * 5, u * 7 + j, 0], u <= 0 || u >= 1 ? 0.0001 : 0.05 * Math.sin(u * Math.PI));
        } });
        burst.instanceMatrix.needsUpdate = true;
        moteHome.forEach((h, k) => K.place(motes, k, [h.x + 0.5 * Math.sin(t * 0.4 + k), h.y + 0.35 * Math.sin(t * 0.55 + k * 2.3), h.z + 0.5 * Math.cos(t * 0.33 + k * 1.3)], null, 0.022 * (0.6 + 0.4 * Math.sin(t * 2.2 + k * 4.1))));
        motes.instanceMatrix.needsUpdate = true;
      };

      // ------------------------------------------------------------ camera: the movie's path, driven by story time
      const cyl = (v) => ({ a: Math.atan2(v.x, v.z), y: v.y, r: Math.hypot(v.x, v.z) }), uncyl = (c) => [c.r * Math.sin(c.a), c.y, c.r * Math.cos(c.a)];
      const L2W = (i, v) => new THREE.Vector3(v[0], v[1], v[2]).applyMatrix4(isl[i].g.matrixWorld);
      const shotL = (i, k) => {
        if (TALL) { const d = (5.3 + 0.5) / (2 * tanH) + 0.5 - 0.6 * k, side = -0.15 + 0.3 * k, ay = 0.95; return { pos: [side * 3, ay + 2.3 - 0.2 * k, d], aim: [0, ay, 0] }; }
        const d = 9.6 - 0.5 * k, side = -0.9 + 1.8 * k;
        return { pos: [side, 2.6 - 0.1 * k, d], aim: [0, 2.2, 0] };
      };
      const shot = (i, k) => { const s = shotL(i, k); return { pos: cyl(L2W(i, s.pos)), aim: cyl(L2W(i, s.aim)) }; };
      // the opening: far out in the air, the whole stair rising round the mountain to the citadel
      const OPEN = { pos: { a: 0.12, y: 16, r: RAD + 92 }, aim: { a: 0.0, y: 30, r: 0.5 } };
      const mixc = (p, q, e, w, back, lift) => ({ a: K.lerp(p.a, q.a, e), y: K.lerp(p.y, q.y, e) + lift * w, r: K.lerp(p.r, q.r, e) + back * w });
      const mix = (A, B, e, back = 0, lift = 0) => { const w = Math.sin(e * Math.PI); return { pos: mixc(A.pos, B.pos, e, w, back, lift), aim: mixc(A.aim, B.aim, e, w, 0, 0) }; };
      const endL = (() => { const a = shotL(NS - 1, 1); return { pos: [a.pos[0], a.pos[1] + 0.5, a.pos[2] + 2.4], aim: a.aim }; })();
      const endShot = { pos: cyl(L2W(NS - 1, endL.pos)), aim: cyl(L2W(NS - 1, endL.aim)) };
      const camAt = (t) => {
        if (t <= T.arrive[0]) return mix(OPEN, shot(0, 0), K.seg(t, 0.3, T.arrive[0], K.ease.inOut));
        for (let i = 0; i < NS; i++) {
          if (t <= T.leave[i]) return shot(i, K.smooth(T.arrive[i], T.leave[i], t));
          if (i < NS - 1 && t <= T.arrive[i + 1]) return mix(shot(i, 1), shot(i + 1, 0), K.seg(t, T.leave[i], T.arrive[i + 1], K.ease.inOut), 1.5, 0.3);
        }
        return mix(shot(NS - 1, 1), endShot, K.seg(t, T.lift, T.camEnd, K.ease.inOut));
      };

      // ------------------------------------------------------------ the ending: the eight cards rise and become the picture
      const endPos = uncyl(endShot.pos), endAim = uncyl(endShot.aim);
      const DIST = 6.4, endCam = new THREE.PerspectiveCamera(); K.look(endCam, endPos, endAim); endCam.updateMatrixWorld();
      const cr = new THREE.Vector3().setFromMatrixColumn(endCam.matrixWorld, 0), cu = new THREE.Vector3().setFromMatrixColumn(endCam.matrixWorld, 1), cz = new THREE.Vector3().setFromMatrixColumn(endCam.matrixWorld, 2);
      const frameH = 2 * DIST * tanV, unit = frameH * LOGO.size / 1024, rise = (0.5 - LOGO.cy) * frameH, THIN = 0.03;
      const qFlip = new THREE.Quaternion(), X_AXIS = new THREE.Vector3(1, 0, 0), blockMats = [];
      const tileLocal = tiles.map((tb) => ({ p: tb.position.clone(), q: tb.quaternion.clone() }));
      tiles.forEach((tb, j) => {
        const r = END[TILE_TO_RECT[j]];
        const bm = std(r.c, 0, 0.9, { emissive: lightFor(r.c), emissiveIntensity: 0, fog: false }); blockMats.push(bm);
        tb.userData.block = add(tb, new THREE.BoxGeometry(1, 1, 1), bm); tb.userData.block.visible = false; tb.userData.fly = () => {};
      });
      function launchTiles() {
        tiles.forEach((tb, j) => {
          const r = END[TILE_TO_RECT[j]], block = tb.userData.block;
          tb.visible = true; scene.attach(tb);
          const home = { p: tb.position.clone(), q: tb.quaternion.clone() };
          const goal = { p: new THREE.Vector3().fromArray(endPos).addScaledVector(cz, -DIST - THIN / 2).addScaledVector(cr, (r.x + r.w / 2 - 512) * unit).addScaledVector(cu, (512 - r.y - r.h / 2) * unit + rise), q: endCam.quaternion.clone() };
          const n = new THREE.Vector3(0, 0, 1).applyQuaternion(home.q);
          tb.userData.fly = (t) => {
            const t0 = tileStart(j), e = t < 0 ? 0 : K.seg(t, t0, t0 + T.flight, K.ease.inOut), w = Math.sin(e * Math.PI);
            tb.position.copy(home.p).lerp(goal.p, e).addScaledVector(n, 0.5 * w).addScaledVector(cu, 0.35 * w);
            tb.quaternion.copy(home.q).slerp(goal.q, e).multiply(qFlip.setFromAxisAngle(X_AXIS, e * Math.PI * 2));
            const turned = e > 0.25, land = 1 + 0.07 * (t < 0 ? 0 : bump(t, t0 + T.flight - 0.04, 0.3));
            tb.userData.body.visible = tb.userData.label.visible = tb.userData.plate.visible = !turned; block.visible = turned;
            const k = t < 0 ? 0 : K.seg(t, t0 + T.flight * 0.25, t0 + T.flight, K.ease.inOut);
            block.scale.set(K.lerp(tb.userData.w, r.w * unit, k) * land, K.lerp(tb.userData.h, r.h * unit, k) * land, K.lerp(0.045, THIN, k));
          };
        });
      }
      function resetTiles() {
        tiles.forEach((tb, j) => { tb.visible = true; R5.deck.add(tb); tb.position.copy(tileLocal[j].p); tb.quaternion.copy(tileLocal[j].q); tb.userData.fly = () => {}; tb.userData.block.visible = false; tb.userData.body.visible = tb.userData.label.visible = tb.userData.plate.visible = true; });
      }

      // ================================================================ the game
      const R = S.R, BASE = { vignette: R.vignette, grain: R.grain, bloom: R.bloom, ca: R.ca, sun: sun.intensity, key: key.intensity, hemi: hemi.intensity, env: scene.environmentIntensity };
      const GAME = createGame({ G, T, NS, GAMES, TERMS, isl, props, placeProps, launchTiles, resetTiles, R1, R2, R3, R4, R5, R6, tiles, S, K, THREE, set, tintTo, glowing, inkLit, note, writeNote, putClef, staff, arcOn, hairpin, text, label, clear, pickable, picks, add, group, box, cylZ, gly, M, C, U, PY, DAIS, CINZEL, CINZEL_B, wispTo, restOf, WS, bump, LET });
      window.GAME = GAME;
      const _s = new THREE.Vector3(), Y_AXIS = new THREE.Vector3(0, 1, 0);
      let endPic = null;
      return {
        update(t) {
          G.t = t;
          for (const f of anims) f(t);
          const et = G.endTau;
          for (const tb of tiles) tb.userData.fly(et);
          driftAt(t); air(t);
          const day = et < 0 ? 1 : 1 - K.seg(et, T.dark0, T.dark1, K.ease.inOut), dark = 1 - day;
          for (const m of glows) { const u = m.userData; m.emissiveIntensity = K.lerp(u.rest, u.base, u.g) * day; }
          for (const m of lumText) m.emissiveIntensity = m.userData.glow * day;
          for (const m of basics) { m.color.copy(m.userData.c0).multiplyScalar(day); if (m.transparent && m.blending === THREE.NormalBlending) m.opacity = m.userData.o0 * day; }
          for (const m of blockMats) m.emissiveIntensity = dark;
          sun.intensity = BASE.sun * day; hemi.intensity = BASE.hemi * day; scene.environmentIntensity = BASE.env * day; scene.fog.color.copy(FOG).multiplyScalar(day);
          wLight.intensity = 1.2 * day; wisp.visible = day > 0.02;
          R.vignette = BASE.vignette * day; R.grain = BASE.grain * day; R.bloom = BASE.bloom * day; R.ca = BASE.ca * day;
          const tau = et >= 0 ? et : G.tau;
          const c = camAt(tau), pos = uncyl(c.pos), aim = uncyl(c.aim);
          K.look(camera, pos, aim, FOV);
          const still = K.seg(tau, T.lift, T.camEnd), wide = 1 - K.seg(tau, 0.6, T.arrive[0] - 0.3, K.ease.inOut);
          const fa = { a: c.aim.a, y: c.aim.y + (TALL ? 1.45 : 0), r: c.aim.r + 0.15 }, fp = uncyl(fa);
          K.focus(camera, K.lerp(_s.set(fp[0], fp[1], fp[2]).distanceTo(camera.position), DIST, still), 0.06 * (TALL ? 1.8 : 1) * (1 - still) * (1 - 0.8 * wide));
          key.intensity = BASE.key * day * (1 - 0.6 * wide);
          sun.target.position.set(fp[0], fp[1] - 2, fp[2]); sun.position.copy(SUN_OFF).applyAxisAngle(Y_AXIS, c.aim.a).add(sun.target.position);
          key.target.position.set(fp[0], fp[1], fp[2]); const kp = uncyl({ a: c.aim.a - 0.1, y: c.aim.y + 6, r: c.aim.r + 13 }); key.position.set(kp[0], kp[1], kp[2]);
        },
        overlay(ctx, t, W, H) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'; ctx.fillRect(0, 0, 2, 2);
          const L = LAYOUT(W, H), et = G.endTau;
          const a = et < 0 ? 0 : K.seg(et, T.exact0, T.exact1, K.ease.inOut);
          if (a > 0) {
            if (!endPic || endPic.width !== W || endPic.height !== H) {
              endPic = document.createElement('canvas'); endPic.width = W; endPic.height = H;
              const c2 = endPic.getContext('2d'), s = H * L.size / 1024, x0 = W / 2 - 512 * s, y0 = H * L.cy - 512 * s;
              c2.fillStyle = '#000000'; c2.fillRect(0, 0, W, H);
              for (const r of END) { c2.fillStyle = r.c; c2.fillRect(x0 + r.x * s, y0 + r.y * s, r.w * s, r.h * s); }
            }
            ctx.globalAlpha = a; ctx.drawImage(endPic, 0, 0);
            [[700, '#FFFFFF'], [500, '#FFFFFF'], [700, '#F8B73C']].forEach(([weight, colour], i) => {
              const [y, size] = L.lines[i], e = K.seg(et, T.text[i], T.text[i] + 0.4, K.ease.out); if (e <= 0) return;
              ctx.globalAlpha = e * (1 - G.summaryFade); ctx.font = `${weight} ${H * size}px "Oswald"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colour;
              ctx.fillText(END_TEXT[i], W / 2, H * (y + 0.02 * (1 - e)));
            });
            ctx.globalAlpha = 1;
          }
          GAME.drawHud(ctx, t, W, H, { TITLE, OPEN_LINE, VERSION });
        },
      };
    },
  });
}
