// ================================================================ player: one continuous loop; the picture follows the game
const K = window.K, style = window.STYLES[window.STYLES.length - 1];
const $ = (id) => document.getElementById(id), canvas = $('view'), noteEl = $('note'), sel = $('inst'), bSnd = $('snd'), bRestart = $('restart'), bFs = $('fs'), page = document.querySelector('.page');
const size = (params.get('size') || '1280x720').split('x').map(Number);
try {
  const S = await K.run(canvas, style, { samples: 2, width: size[0], height: size[1] });
  const GAME = window.GAME;
  INST.forEach((i) => { const o = document.createElement('option'); o.value = i.key; o.textContent = i.name; sel.append(o); });
  sel.value = GAME.inst.key;
  sel.addEventListener('change', () => { GAME.setInstrument(sel.value); canvas.focus(); });
  const syncSnd = () => { bSnd.setAttribute('aria-pressed', String(GAME.sound)); bSnd.textContent = GAME.sound ? 'Sound on' : 'Sound off'; };
  bSnd.addEventListener('click', () => { GAME.setSound(!GAME.sound); syncSnd(); }); syncSnd();
  bRestart.addEventListener('click', () => { GAME.toTitle(); canvas.focus(); });

  // full screen: the whole page (stage and bar), so the controls and the way out stay on screen
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
    bFs.hidden = false;
    const syncFs = () => {
      const on = !!fsEl(), lab = on ? 'Exit full screen' : 'Full screen';
      bFs.setAttribute('aria-label', lab); bFs.title = lab;
      bFs.querySelector('.enter').style.display = on ? 'none' : '';
      bFs.querySelector('.exit').style.display = on ? '' : 'none';
    };
    bFs.addEventListener('click', async () => {
      try {
        if (fsEl()) await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        else await (page.requestFullscreen || page.webkitRequestFullscreen).call(page);
      } catch (err) {}
      canvas.focus();
    });
    document.addEventListener('fullscreenchange', syncFs); document.addEventListener('webkitfullscreenchange', syncFs);
  }

  let live = +(params.get('live') || 2), slow = 0;
  const t0 = performance.now();
  const loop = () => {
    const t = (performance.now() - t0) / 1000;
    GAME.frame(t);
    const a = performance.now(); S.seek(t, live);
    // a machine that cannot keep up gets fewer sub-renders per frame
    if (performance.now() - a > 40) { if (++slow > 10 && live > 1) { live--; slow = 0; } } else slow = Math.max(0, slow - 1);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const at = (e) => { const r = canvas.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height; return [u * S.W, v * S.H, new THREE.Vector2(u * 2 - 1, -(v * 2 - 1))]; };
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); canvas.focus(); try { canvas.setPointerCapture(e.pointerId); } catch (err) {} GAME.pointer('down', ...at(e)); });
  canvas.addEventListener('pointermove', (e) => { canvas.style.cursor = GAME.pointer('move', ...at(e)) ? 'pointer' : 'default'; });
  canvas.addEventListener('pointerup', (e) => GAME.pointer('up', ...at(e)));
  canvas.addEventListener('pointercancel', (e) => GAME.pointer('up', ...at(e)));
  addEventListener('keydown', (e) => { if (e.target === sel || e.target.tagName === 'BUTTON') return; GAME.keydown(e); });
  noteEl.hidden = true; canvas.focus();
  window.READY = true;
} catch (err) {
  noteEl.textContent = 'This game needs WebGL 2, which did not start in this browser.';
  window.READY = { error: String(err && err.stack || err) };
  console.error(err);
}
</script>
