// ================================================================ the realm map: the title screen when no chapter is chosen
// A parchment map with the twelve landmarks along a winding road. Each one shows its chapter, its title and the best result
// saved in this browser for the chosen instrument; picking one opens that chapter (?ch=<n>). Drawn on a 2D canvas, with a real
// button over each landmark so it works by keyboard and screen reader too.
function showRealmMap(stage, instSel) {
  const W0 = 1600, H0 = 900, cv = document.createElement('canvas'); cv.width = W0; cv.height = H0;
  cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Map of the realm: twelve chapters along a winding road');
  const wrap = document.createElement('div'); wrap.className = 'realm-map'; wrap.append(cv); stage.append(wrap);
  const ctx = cv.getContext('2d');
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('be-realm-l1') || '{}') || {}; } catch (e) {}
  const inst = () => instSel.value || saved.inst || 'saxophone';
  const best = (n) => { const b = (saved.bestPct || {})[n === 1 ? inst() : `ch${n}:${inst()}`]; if (!b) return null; const v = b.filter((x) => x != null); return v.length ? Math.round(v.reduce((a, x) => a + x, 0) / v.length) : null; };
  // where each landmark sits: three rows, the road snaking left, right, left
  const P = [[0.13, 0.8], [0.34, 0.84], [0.56, 0.8], [0.78, 0.83], [0.88, 0.57], [0.66, 0.53], [0.45, 0.57], [0.24, 0.53], [0.12, 0.29], [0.34, 0.25], [0.56, 0.3], [0.79, 0.25]];
  const COL = ['#6a5ad0', '#5a9a3c', '#d06a4a', '#4a8ad8', '#3aa0b0', '#a0703a', '#7a7a9a', '#4a90d0', '#c8963a', '#4a4a6a', '#c8402a', '#3a3a8a'];
  // a small silhouette for each chapter's landmark, drawn in a box of half-size 1 round (0, 0)
  const ICON = [
    (c) => { c.fillRect(-0.7, -0.1, 1.4, 0.9); for (const x of [-0.6, 0, 0.6]) { c.fillRect(x - 0.17, -0.55, 0.34, 0.6); c.beginPath(); c.moveTo(x - 0.22, -0.55); c.lineTo(x, -0.95); c.lineTo(x + 0.22, -0.55); c.fill(); } },
    (c) => { c.fillRect(-0.12, -0.2, 0.24, 1.0); c.beginPath(); c.arc(0, -0.35, 0.62, 0, 7); c.fill(); c.beginPath(); c.arc(-0.45, -0.1, 0.38, 0, 7); c.arc(0.45, -0.1, 0.38, 0, 7); c.fill(); },
    (c) => { c.beginPath(); c.moveTo(-0.3, 0.85); c.lineTo(-0.18, -0.45); c.lineTo(0.18, -0.45); c.lineTo(0.3, 0.85); c.fill(); c.fillRect(-0.26, -0.7, 0.52, 0.25); c.beginPath(); c.moveTo(-0.28, -0.7); c.lineTo(0, -0.95); c.lineTo(0.28, -0.7); c.fill(); c.globalAlpha = 0.5; c.beginPath(); c.moveTo(0, -0.58); c.lineTo(0.95, -0.85); c.lineTo(0.95, -0.35); c.fill(); c.globalAlpha = 1; },
    (c) => { c.beginPath(); c.moveTo(0, -0.95); c.lineTo(0.3, -0.3); c.lineTo(0.25, 0.85); c.lineTo(-0.25, 0.85); c.lineTo(-0.3, -0.3); c.fill(); c.beginPath(); c.moveTo(-0.65, 0.85); c.lineTo(-0.5, 0.1); c.lineTo(-0.35, 0.85); c.moveTo(0.65, 0.85); c.lineTo(0.5, 0.2); c.lineTo(0.35, 0.85); c.fill(); },
    (c) => { c.fillRect(-0.8, -0.6, 0.7, 1.45); c.globalAlpha = 0.55; c.fillRect(-0.1, -0.55, 0.35, 1.4); c.globalAlpha = 1; c.beginPath(); c.ellipse(0.3, 0.75, 0.6, 0.15, 0, 0, 7); c.fill(); },
    (c) => { c.beginPath(); c.arc(0, 0.85, 0.9, Math.PI, 0); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(0, 0.85, 0.38, Math.PI, 0); c.fill(); c.globalCompositeOperation = 'source-over'; c.fillRect(-0.5, -0.55, 0.08, 0.6); c.fillRect(0.42, -0.55, 0.08, 0.6); c.fillRect(-0.5, -0.6, 1.0, 0.08); },
    (c) => { c.fillRect(-0.62, -0.15, 0.36, 1.0); c.fillRect(0.22, -0.75, 0.42, 1.6); c.beginPath(); c.moveTo(-0.66, -0.15); c.lineTo(-0.44, -0.5); c.lineTo(-0.22, -0.15); c.moveTo(0.18, -0.75); c.lineTo(0.43, -1.0); c.lineTo(0.68, -0.75); c.fill(); c.lineWidth = 0.08; c.beginPath(); c.moveTo(-0.3, 0.2); c.quadraticCurveTo(0, -0.1, 0.22, 0.2); c.stroke(); },
    (c) => { c.beginPath(); c.ellipse(0, -0.35, 0.85, 0.38, 0, 0, 7); c.fill(); c.fillRect(-0.4, 0.1, 0.8, 0.25); c.fillRect(-0.03, -0.05, 0.06, 0.2); c.beginPath(); c.moveTo(0.1, 0.35); c.lineTo(0.45, 0.85); c.lineTo(0.1, 0.85); c.fill(); },
    (c) => { c.fillRect(-0.45, -0.55, 0.9, 1.4); c.beginPath(); c.moveTo(-0.55, -0.55); c.lineTo(0, -1.0); c.lineTo(0.55, -0.55); c.fill(); c.fillStyle = '#f4ead4'; c.beginPath(); c.arc(0, -0.1, 0.3, 0, 7); c.fill(); c.strokeStyle = '#2a2030'; c.lineWidth = 0.07; c.beginPath(); c.moveTo(0, -0.1); c.lineTo(0, -0.33); c.moveTo(0, -0.1); c.lineTo(0.16, -0.02); c.stroke(); },
    (c) => { c.beginPath(); c.moveTo(-0.9, 0.85); c.lineTo(-0.3, -0.4); c.lineTo(-0.1, -0.1); c.lineTo(0.15, -0.8); c.lineTo(0.9, 0.85); c.fill(); c.fillStyle = '#ffe680'; c.beginPath(); c.moveTo(0.35, -0.95); c.lineTo(0.15, -0.45); c.lineTo(0.32, -0.45); c.lineTo(0.12, 0.0); c.lineTo(0.5, -0.55); c.lineTo(0.33, -0.55); c.lineTo(0.52, -0.95); c.fill(); },
    (c) => { c.beginPath(); c.moveTo(-0.95, 0.85); c.lineTo(-0.25, -0.45); c.lineTo(0.25, -0.45); c.lineTo(0.95, 0.85); c.fill(); c.fillStyle = '#ff8a3a'; c.beginPath(); c.moveTo(-0.15, -0.45); c.lineTo(0.15, -0.45); c.lineTo(0.05, 0.3); c.lineTo(-0.05, 0.3); c.fill(); c.globalAlpha = 0.45; c.fillStyle = '#6a5a5a'; c.beginPath(); c.arc(0.1, -0.8, 0.25, 0, 7); c.arc(0.35, -0.95, 0.2, 0, 7); c.fill(); c.globalAlpha = 1; },
    (c) => { c.fillRect(-0.3, -0.2, 0.6, 1.05); c.beginPath(); c.arc(0, -0.2, 0.45, Math.PI, 0); c.fill(); c.save(); c.translate(0.15, -0.5); c.rotate(-0.7); c.fillRect(-0.08, -0.45, 0.16, 0.5); c.restore(); c.fillStyle = '#fff4c8'; for (const [x, y] of [[-0.75, -0.8], [0.7, -0.6], [-0.55, -0.35], [0.85, -0.95]]) { c.beginPath(); c.arc(x, y, 0.06, 0, 7); c.fill(); } },
  ];
  const btns = CHAPTERS.map((ch, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'realm-node';
    b.setAttribute('aria-label', `Chapter ${ch.n}: ${ch.title}`);
    b.style.left = `${P[i][0] * 100}%`; b.style.top = `${P[i][1] * 100}%`;
    b.addEventListener('click', () => { const u = new URL(location.href); u.searchParams.set('ch', ch.n); location.href = u.toString(); });
    b.addEventListener('pointerenter', () => { hover = i; draw(); }); b.addEventListener('pointerleave', () => { hover = -1; draw(); });
    b.addEventListener('focus', () => { hover = i; draw(); }); b.addEventListener('blur', () => { hover = -1; draw(); });
    wrap.append(b); return b;
  });
  let hover = -1;
  const parch = (() => { const c = document.createElement('canvas'); c.width = W0; c.height = H0; const x = c.getContext('2d'); x.fillStyle = '#efe1b8'; x.fillRect(0, 0, W0, H0); let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 300; i++) { const px = r() * W0, py = r() * H0, rr = 30 + r() * 140, g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, `rgba(${r() < 0.5 ? '150,110,50' : '255,250,225'},${0.04 + r() * 0.05})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
    const e = x.createRadialGradient(W0 / 2, H0 / 2, H0 * 0.3, W0 / 2, H0 / 2, W0 * 0.62); e.addColorStop(0, 'rgba(110,70,20,0)'); e.addColorStop(1, 'rgba(110,70,20,0.45)'); x.fillStyle = e; x.fillRect(0, 0, W0, H0);
    // hills and water as faint washes
    x.globalAlpha = 0.18; x.fillStyle = '#3a7aa0'; x.beginPath(); x.ellipse(W0 * 0.95, H0 * 0.78, 220, 120, 0, 0, 7); x.fill(); x.fillStyle = '#4a8a4a'; for (let k = 0; k < 14; k++) { x.beginPath(); x.ellipse(r() * W0, r() * H0, 60 + r() * 90, 30 + r() * 40, 0, 0, 7); x.fill(); } x.globalAlpha = 1;
    return c; })();
  function draw() {
    ctx.drawImage(parch, 0, 0);
    // the road
    ctx.save(); ctx.strokeStyle = 'rgba(110,70,30,0.75)'; ctx.lineWidth = 10; ctx.setLineDash([2, 22]); ctx.lineCap = 'round'; ctx.beginPath();
    P.forEach(([x, y], i) => { const X = x * W0, Y = y * H0; if (!i) ctx.moveTo(X, Y); else { const [px, py] = P[i - 1]; ctx.quadraticCurveTo((px + x) / 2 * W0 + (i % 4 === 0 ? (x > 0.5 ? 140 : -140) : 0), ((py + y) / 2) * H0 + (i % 4 === 0 ? 0 : 40 * (i % 2 ? 1 : -1)), X, Y); } });
    ctx.stroke(); ctx.restore();
    // the title
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2070'; ctx.font = '700 64px Texturina'; ctx.fillText('Band Adventures', W0 / 2, 64);
    ctx.font = '700 28px Alegreya'; ctx.fillStyle = '#6a4a2a'; ctx.fillText('The realm of Band Essentials · choose a chapter', W0 / 2, 116);
    // the landmarks
    CHAPTERS.forEach((ch, i) => {
      const X = P[i][0] * W0, Y = P[i][1] * H0, R = hover === i ? 74 : 66, b = best(ch.n);
      ctx.save(); ctx.translate(X, Y);
      ctx.shadowColor = 'rgba(60,30,10,0.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#f8efd4'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.lineWidth = hover === i ? 8 : 5; ctx.strokeStyle = hover === i ? '#f59a23' : '#8a6a2a'; ctx.stroke();
      ctx.save(); ctx.scale(R * 0.62, R * 0.62); ctx.fillStyle = ctx.strokeStyle = COL[i]; ICON[i](ctx); ctx.restore();
      ctx.fillStyle = '#3a2070'; ctx.beginPath(); ctx.arc(-R * 0.74, -R * 0.74, 22, 0, 7); ctx.fill(); ctx.fillStyle = '#ffe2a0'; ctx.font = '700 24px Texturina'; ctx.fillText(String(ch.n), -R * 0.74, -R * 0.72);
      ctx.fillStyle = '#2a1830'; ctx.font = '700 24px Alegreya'; ctx.fillText(ch.title, 0, R + 24);
      ctx.fillStyle = b == null ? '#8a7a5a' : '#2f7a3a'; ctx.font = '700 19px Alegreya'; ctx.fillText(b == null ? `Unit ${ch.unit}` : `Unit ${ch.unit} · best ${b}%`, 0, R + 50);
      ctx.restore();
    });
  }
  instSel.addEventListener('change', () => { saved.inst = instSel.value; try { const s = JSON.parse(localStorage.getItem('be-realm-l1') || '{}') || {}; s.inst = instSel.value; localStorage.setItem('be-realm-l1', JSON.stringify(s)); } catch (e) {} draw(); });
  document.fonts && document.fonts.ready.then(draw);
  draw();
  return wrap;
}
