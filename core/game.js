// Word games shared screen code: board, tiles, dragging, zoom, turns, settings and themes.
// Every game page loads: its own config.js, then core/engine.js, then this file. Nothing here is specific to one game.
(function () {
  const C = window.CONFIG, BASE = window.WG_BASE == null ? '../' : window.WG_BASE, E = window.WGE;
  const N = C.board.length, BUILD = C.build || 1, KEY = 'wg_' + C.id, HK = KEY + '_hist', GAP = 4, COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  C.luck = Object.assign({ pairs: 0, pairChance: 10, vmin: 3, vmax: 4, vowelPct: 44, tierW: [1, 1, 1, 1], maxHigh: 8 }, C.luck || {});
  C.tiers = C.tiers || { R: 1, S: 1, T: 1, N: 1, E: 1, A: 1, D: 2, G: 2, I: 2, L: 2, O: 2, U: 2, C: 2, M: 2, H: 2, B: 3, F: 3, P: 3, W: 3, Y: 3, K: 3, V: 3, J: 4, X: 4, Q: 4, Z: 4 };
  C.dev = Object.assign({ confirmRestart: false, noSBlank: false }, C.dev || {});
  C._orig = JSON.parse(JSON.stringify({ bag: C.bag, values: C.values, bingo: C.bingo, luck: C.luck, tiers: C.tiers, dev: C.dev }));
  try {
    const o = JSON.parse(localStorage.getItem(KEY + '_dev'));
    if (o) { C._devOn = true; ['bag', 'values', 'tiers'].forEach(k => { if (o[k]) C[k] = o[k]; }); if (o.bingo != null) C.bingo = o.bingo; if (o.luck) C.luck = Object.assign({}, C.luck, o.luck); if (o.dev) Object.assign(C.dev, o.dev); }
  } catch (e) {}
  const ART = BASE + 'art/', ic = n => '<i class="ic" style="--m:url(' + ART + 'ic-' + n + '.svg)"></i>';

  // ---------- page ----------
  document.title = C.name;
  document.body.insertAdjacentHTML('afterbegin',
    '<div id="appbg"></div><canvas id="fxb"></canvas><canvas id="fxt"></canvas><div id="app">' +
    '<div id="top"><img id="logo" alt="" src="' + ART + (C.logo || 'logo-wordgames.svg') + '"><div id="title"></div>' +
      '<div id="sbox"><div class="sc" id="sc0"><span><i class="dt"></i>You</span><b id="s0">0</b></div><div class="sc cp" id="sc1"><span><i class="dt"></i>Computer</span><b id="s1">0</b></div>' +
      '<button id="bagi" aria-label="Unseen tiles"><div class="sc"><span>Bag</span><b id="bagn">0</b></div><img id="bagimg" alt="" src="' + ART + 'bag.svg"></button></div></div>' +
    '<div id="bw"><canvas id="cv"></canvas><button id="bFit" aria-label="Show the whole board">' + ic('zoomout') + '</button></div>' +
    '<div id="status" role="status" aria-live="polite"></div>' +
    '<div class="tbox plain" id="rackBox"><div class="tray" id="rack"></div></div>' +
    '<div class="tbox" id="scrBox"><div class="sh"><b>Scratch row</b><span class="sp"></span>' +
      '<button id="bDir" aria-label="Word direction"><i class="ic" id="dA" style="--m:url(' + ART + 'ic-across.svg)"></i><i class="ic" id="dD" style="--m:url(' + ART + 'ic-down.svg)"></i></button>' +
      '<button id="scPaste">Paste</button><button id="scClr">Clear</button></div><div class="tray" id="scr"></div><div id="sfb"></div></div>' +
    '<div class="row"><button id="bPlay">' + ic('play') + '<span id="bPlayT">Play</span></button><button id="bRecall">' + ic('recall') + 'Recall</button><button id="bShuffle">' + ic('shuffle') + 'Shuffle</button>' +
      '<button id="bSwap">' + ic('swap') + 'Swap</button><button id="bPass">' + ic('pass') + 'Pass</button><button id="bMenu">' + ic('menu') + 'Menu</button></div></div>' +
    '<div class="ov" id="pick"><div class="box"><div>Blank tile: choose a letter</div><div id="letters"></div><button id="pickCancel">Cancel</button></div></div>' +
    '<div class="ov" id="swap"><div class="box"><div>Tap the tiles to swap</div><div id="swapList"></div><button id="swapGo">Swap selected</button><button id="swapCancel">Cancel</button></div></div>' +
    '<div class="ov" id="end"><div class="box"><b>Game over</b><div id="endTxt"></div><button id="endNew">New game</button><button id="endClose">Close</button></div></div>' +
    '<div class="ov" id="bagv"><div class="box"><b>Unseen tiles</b><small id="bagInfo"></small><div id="bagGrid"></div><button id="bagClose">Close</button></div></div>' +
    '<div class="ov" id="menu"><div class="box"><button id="mSet">' + ic('settings') + 'Settings</button><button id="mStats">' + ic('stats') + 'Scores and history</button>' +
      '<button id="mSimPause" class="simb">Pause simulation</button><button id="mSimStop" class="simb">Stop simulation</button>' +
      '<button id="mNew">Cancel game and restart</button><button id="mClose">Close</button><small>' + C.name + ' build ' + BUILD + '</small></div></div>' +
    '<div class="ov" id="paste"><div class="box"><div>Type or paste the letters</div><input id="pasteIn" type="text" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="15">' +
      '<button id="pasteOk">Put in the scratch row</button><button id="pasteCancel">Cancel</button></div></div>' +
    '<div class="ov" id="stats"><div class="box"><b>Scores and history</b><div id="statBody"></div><button id="statClear">Clear history</button><button id="statClose">Close</button></div></div>' +
    '<div class="ov" id="set"><div class="box">' +
      '<h4>Look</h4><label>Theme<select id="sTheme"></select></label>' +
      '<label>Light or dark<select id="sMode"><option value="system">Same as the phone</option><option value="light">Light</option><option value="dark">Dark</option></select></label>' +
      '<label>Square symbols<select id="sSym"><option value="theme">From the theme</option></select></label>' +
      '<label>Letter size on the tiles<select id="sLsz"><option value="0">Normal</option><option value="1">Large</option><option value="2">Extra large</option><option value="3">Huge</option><option value="4">Biggest</option></select></label>' +
      '<label>Points size on the tiles<select id="sPsz"><option value="0">Normal</option><option value="1">Large</option><option value="2">Extra large</option></select></label>' +
      '<h4>Sound and movement</h4><label class="ck"><input type="checkbox" id="sSfx"> Sound effects</label>' +
      '<label class="ck"><input type="checkbox" id="sMus"> Background music (when the theme has it)</label>' +
      '<label class="ck"><input type="checkbox" id="sMot"> Moving decorations (particles, centre piece, celebrations)</label>' +
      '<h4>Game</h4><label>Who plays first<select id="sFirst"><option value="random">Random</option><option value="me">Me</option><option value="computer">Computer</option><option value="alternate">Take turns each game</option></select></label>' +
      '<label>Computer level<select id="sLevel"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>' +
      '<label class="ck"><input type="checkbox" id="sRare"> Computer avoids rare and obscene words</label>' +
      '<h4>Help my luck</h4><label class="ck"><input type="checkbox" id="hBal"> Balance vowels and consonants</label>' +
      '<label class="ck"><input type="checkbox" id="hDup"> Avoid duplicate letters</label>' +
      '<label class="ck"><input type="checkbox" id="hHard"> Avoid awkward tiles (Q without U, J Q X Z V together)</label>' +
      '<label class="ck"><input type="checkbox" id="sBagOn"> Allow viewing unseen tiles (Bag button)</label>' +
      '<label class="ck" id="lScr"><input type="checkbox" id="sScr"> Show the scratch row</label>' +
      '<h4>Movement</h4><label><span>Tile height above the finger: <b id="vLift"></b></span><input type="range" id="sLift" min="0" max="90" step="2"></label>' +
      '<label><span>Word height above the finger (scratch row words): <b id="vWl"></b></span><input type="range" id="sWl" min="0" max="90" step="2"></label>' +
      '<label>Zoom in after the first tile is dropped<select id="sZoom"><option value="100">Off</option><option value="130">130%</option><option value="160">160%</option><option value="200">200%</option><option value="250">250%</option></select></label>' +
      '<label class="ck"><input type="checkbox" id="sHap"> Vibration feedback</label>' +
      '<h4>Word list</h4><label><input type="file" id="sFile" accept=".txt"></label><small id="dictInfo"></small><button id="sBuiltin">Use the built-in word list</button>' +
      '<button id="sClose">Close</button></div></div>');
  const $ = id => document.getElementById(id);
  $('title').textContent = C.name;

  // ---------- state ----------
  let S = { theme: 'classic', mode: 'system', level: 'hard', first: 'random', lastFirst: 'computer', noRare: true, hBal: true, hDup: true, hHard: true, showBag: true,
            scratch: true, lift: 48, gs: 125, zoom: 160, hap: true, dir: 'h', lsz: 0, psz: 0, wlift: 24, sym: 'theme', sfx: true, music: true, motion: !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) };
  let G = null, placed = [], sel = null, P = null, D = null, cur = null, bubs = [], hov = null, pickT = null, msg = '', busy = true, HL = null, saveT = 0, SIM = null, lastTT = { t: null, at: 0 }, pickAt = 0;
  const rack = { el: $('rack'), box: $('rackBox'), items: [], n: C.rackSize, sw: 0, off: 0, name: 'rack' };
  const scr  = { el: $('scr'),  box: $('scrBox'),  items: [], n: C.rackSize, sw: 0, off: 0, name: 'scratch row' };
  const cv = $('cv'), ctx = cv.getContext('2d');
  let W = 300, dpr = 1, fit = 20, view = { s: 20, x: 0, y: 0 }, dirty = true, tween = null, rafId = 0, lastTs = 0, zoomT = 0;

  const say = m => { $('status').textContent = m; };
  const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let lastBuzz = 0;
  const buzz = ms => { const n = performance.now(); if (!S.hap || !navigator.vibrate || n - lastBuzz < 60) return; lastBuzz = n; try { navigator.vibrate(ms); } catch (e) {} };
  const cellName = (r, c) => COLS[c] + (r + 1);
  const scrOn = () => C.scratch !== false && S.scratch;
  const locked = () => busy || !G || G.over;
  const hand = () => rack.items.concat(scr.items).filter(Boolean);
  const idb = fn => new Promise((res, rej) => {
    let q; try { q = indexedDB.open(KEY, 1); } catch (e) { rej(e); return; }
    q.onupgradeneeded = () => q.result.createObjectStore('k');
    q.onsuccess = () => { try { const r = fn(q.result.transaction('k', 'readwrite').objectStore('k')); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } };
    q.onerror = () => rej(q.error);
  });

  // ---------- saving ----------
  function save() {
    if (!G || SIM) return;
    try {
      const pk = t => t ? { ch: t.ch, as: t.as || '' } : null;
      localStorage.setItem(KEY, JSON.stringify({ S, G: Object.assign({}, G, { rack: rack.items.map(pk), scr: scr.items.map(pk), placed: placed.map(t => ({ ch: t.ch, as: t.as || '', r: t.r, c: t.c, g: t.g ? groupsOf().indexOf(t.g) : -1 })) }) }));
    } catch (e) {}
  }
  const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(save, 400); };
  function restore() {
    let d = null; try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!d) return false;
    Object.assign(S, d.S || {});
    const g = d.G; if (!g || !g.board || g.board.length !== N || !g.rack || g.rack.length !== rack.n) return false;
    G = { board: g.board, bag: g.bag, crack: g.crack, scores: g.scores, turn: g.turn, first: g.first, passes: g.passes, over: g.over, last: g.last || [], lastWho: g.lastWho == null ? -1 : g.lastWho,
          st: g.st || { bingos: [0, 0], best: [['', 0], ['', 0]] } };
    g.rack.forEach((x, i) => { if (x) intoTray(rack, makeTile(x.ch), i); });
    (g.scr || []).forEach((x, i) => { if (x) { const t = makeTile(x.ch); if (i < scr.n) intoTray(scr, t, i); else home(t); } });
    const gs = {};
    (g.placed || []).forEach(x => {
      const t = makeTile(x.ch); t.as = x.as || ''; updTile(t); t.where = 'board'; t.r = x.r; t.c = x.c; placed.push(t);
      if (x.g >= 0) { const gr = gs[x.g] || (gs[x.g] = { tiles: [] }); gr.tiles.push(t); t.g = gr; }
    });
    msg = 'Game restored.'; return true;
  }

  // ---------- tiles ----------
  const letter = t => t.ch === '?' ? (t.as || '') : t.ch;
  function makeTile(ch) {
    const t = { ch, as: '', where: null, r: 0, c: 0, el: document.createElement('div') };
    t.el.className = 'tile' + (ch === '?' ? ' blank' : ''); t.el.innerHTML = '<span class="L"></span><span class="P"></span>'; t.el.__t = t;
    updTile(t); return t;
  }
  function updTile(t) { t.el.firstChild.textContent = letter(t); t.el.lastChild.textContent = t.ch === '?' ? '' : C.values[t.ch]; }

  // ---------- trays (rack and scratch row): a tile is in exactly one place ----------
  const slotX = (tray, i) => tray.off + i * (tray.sw + GAP);
  function metrics(tray) {
    const w = tray.el.clientWidth; if (!w) return;
    tray.sw = Math.min(64, (w - GAP * (tray.n - 1)) / tray.n); tray.off = (w - (tray.n * tray.sw + GAP * (tray.n - 1))) / 2;
    tray.el.style.height = tray.sw + 'px';
    tray.el.querySelectorAll('.slot').forEach((s, i) => { s.style.width = s.style.height = tray.sw + 'px'; s.style.transform = 'translate3d(' + slotX(tray, i) + 'px,0,0)'; });
    layout(tray);
  }
  function posTile(tray, t, i) { t.el.style.setProperty('--sz', tray.sw + 'px'); t.el.style.transform = 'translate3d(' + slotX(tray, i) + 'px,0,0)'; }
  function layout(tray, arr) { (arr || tray.items).forEach((t, i) => { if (t) posTile(tray, t, i); }); }
  function buildSlots(tray) { tray.el.innerHTML = ''; tray.items = Array(tray.n).fill(null); for (let i = 0; i < tray.n; i++) { const s = document.createElement('div'); s.className = 'slot'; tray.el.appendChild(s); } }
  const firstFree = tray => tray.items.findIndex(x => !x);
  const slotAt = (tray, x) => { const r = tray.el.getBoundingClientRect(); return Math.max(0, Math.min(tray.n - 1, Math.floor((x - r.left - tray.off + GAP / 2) / (tray.sw + GAP)))); };
  function arrange(items, j) {   // open a gap at slot j; neighbours slide toward the nearest empty slot. null = tray full
    const a = items.slice(); if (!a[j]) return a;
    let e = -1, bd = 99; a.forEach((x, k) => { if (!x && Math.abs(k - j) < bd) { bd = Math.abs(k - j); e = k; } });
    if (e < 0) return null;
    if (e > j) for (let k = e; k > j; k--) a[k] = a[k - 1]; else for (let k = e; k < j; k++) a[k] = a[k + 1];
    a[j] = null; return a;
  }
  function intoTray(tray, t, j) {
    tray.items[j] = t; t.where = tray; if (t.ch === '?' && t.as) { t.as = ''; updTile(t); }
    t.el.classList.remove('ghost', 'sel'); t.el.style.transition = ''; tray.el.appendChild(t.el); posTile(tray, t, j);
  }
  function flyInto(tray, t, j, cx, cy) {   // glide from where the floating tile is into its slot
    tray.items[j] = t; t.where = tray; if (t.ch === '?' && t.as) { t.as = ''; updTile(t); }
    const el = t.el, r = tray.el.getBoundingClientRect();
    el.classList.remove('ghost', 'sel'); tray.el.appendChild(el);
    el.style.transition = 'none'; el.style.setProperty('--sz', tray.sw + 'px');
    el.style.transform = 'translate3d(' + (cx - r.left - tray.sw / 2) + 'px,' + (cy - r.top - tray.sw / 2) + 'px,0)';
    void el.offsetWidth; el.style.transition = ''; posTile(tray, t, j);
  }
  function home(t) {   // back to the hand: rack first, then scratch row
    let tray = rack, i = firstFree(rack); if (i < 0) { tray = scr; i = firstFree(scr); }
    if (i >= 0) intoTray(tray, t, i);
  }
  function scratchToRack() { scr.items.forEach((t, i) => { if (t) { scr.items[i] = null; intoTray(rack, t, firstFree(rack)); } }); }

  // ---------- game ----------
  function newGame() {
    [rack, scr].forEach(tr => { tr.items.forEach(t => t && t.el.remove()); tr.items = Array(tr.n).fill(null); });
    placed.forEach(t => t.el.remove()); placed = [];
    const bag = []; for (const ch in C.bag) for (let i = 0; i < C.bag[ch]; i++) bag.push(ch);
    let f = S.first;
    if (f === 'random') f = Math.random() < .5 ? 'me' : 'computer'; else if (f === 'alternate') f = S.lastFirst === 'me' ? 'computer' : 'me';
    S.lastFirst = f;
    G = { bag: shuf(bag), crack: [], scores: [0, 0], turn: f === 'me' ? 0 : 1, first: f, passes: 0, over: false, last: [], lastWho: -1,
          st: { bingos: [0, 0], best: [['', 0], ['', 0]] }, board: Array.from({ length: N }, () => Array(N).fill(null)) };
    const test = C.dev.noSBlank, bi = test ? G.bag.indexOf('?') : -1;
    if (bi >= 0) { G.bag.splice(bi, 1); if (f === 'me') intoTray(rack, makeTile('?'), 0); else G.crack.push({ ch: '?' }); }
    refill(test && f === 'me' ? ['S', '?'] : null);
    while (G.crack.length < C.rackSize && G.bag.length) {
      let i = G.bag.length - 1; if (test && f !== 'me') while (i > 0 && 'S?'.includes(G.bag[i])) i--;
      G.crack.push({ ch: G.bag.splice(i, 1)[0] });
    }
    sel = null; HL = null; cur = null; msg = 'New game. ' + (f === 'me' ? 'You start.' : 'Computer starts.');
  }
  function refill(ex) {   // Help my luck draws for the player
    const f = { dup: S.hDup, bal: S.hBal, hard: S.hHard };
    for (let i = 0; i < rack.n; i++) {
      const held = hand(), need = C.rackSize - held.length; if (need <= 0 || !G.bag.length) break;
      if (rack.items[i]) continue;
      const ch = E.pickTile(C, G.bag, held, need - 1, f, C.luck, ex); if (ch == null) break;
      G.bag.splice(G.bag.indexOf(ch), 1); intoTray(rack, makeTile(ch), i);
    }
  }
  const occ = (r, c) => G.board[r][c] || placed.some(t => t.r === r && t.c === c);
  const pcells = () => placed.map(t => ({ r: t.r, c: t.c, ch: letter(t), bl: t.ch === '?' }));
  function evaluate() {
    cur = null; bubs = []; hov = null; dirty = true; kick();
    $('bagn').textContent = G.bag.length; $('s0').textContent = G.scores[0]; $('s1').textContent = G.scores[1];
    $('sc0').classList.toggle('on', G.turn === 0 && !G.over); $('sc1').classList.toggle('on', G.turn === 1 && !G.over);
    if (HL && G.last.length) bubs.push({ r: G.last[0][0], c: G.last[0][1], text: '+' + HL.total, kind: 'cmp' });
    const off = () => { $('bPlay').disabled = true; $('bPlayT').textContent = 'Play'; };
    $('bSwap').disabled = $('bPass').disabled = $('bRecall').disabled = $('bShuffle').disabled = locked();
    if (busy) { off(); return; }
    if (!placed.length) { say(msg + (G.over ? '' : ' Your turn.')); off(); return; }
    if (placed.some(t => t.ch === '?' && !t.as)) { say('Choose a letter for the blank.'); off(); return; }
    const r = E.evalMove(C, G.board, pcells());
    if (r.err) { say(r.err); off(); return; }
    const bad = r.words.filter(w => !w.ok);
    if (bad.length) { lastBadAt = Date.now(); bad.forEach(w => bubs.push({ r: w.r, c: w.c, text: '✕', kind: 'bad' })); say('Not a word: ' + bad.map(w => w.w).join(', ')); off(); return; }
    bubs.push({ r: r.words[0].r, c: r.words[0].c, text: String(r.total), kind: 'ok' });
    say(r.words.map(w => w.w + ' ' + w.pts).join(', ') + (r.bingo ? ', bonus ' + r.bingo : '') + ' = ' + r.total);
    cur = r; $('bPlay').disabled = G.over || G.turn !== 0; $('bPlayT').textContent = 'Play ' + r.total;
  }
  function scFeedback() {
    if (!scrOn()) return; const fb = $('sfb'), ts = scr.items.filter(Boolean);
    if (!ts.length) { fb.className = 'mu'; fb.textContent = 'Try words here before you place them.'; return; }
    if (!E.ready) { fb.textContent = ''; return; }
    const bl = ts.filter(t => t.ch === '?').length, pts = ts.reduce((s, t) => s + (t.ch === '?' ? 0 : C.values[t.ch]), 0);
    if (bl > 1) { fb.className = 'mu'; fb.textContent = 'Two blanks: choose their letters on the board.'; return; }
    if (bl === 1) {
      const i = ts.findIndex(t => t.ch === '?'), pre = ts.slice(0, i).map(t => t.ch).join(''), post = ts.slice(i + 1).map(t => t.ch).join('');
      const fits = [...COLS].filter(X => E.W.has(pre + X + post));
      fb.className = fits.length ? 'ok' : 'no';
      fb.textContent = fits.length ? '✓ Works with the blank as ' + fits.slice(0, 8).join(', ') + (fits.length > 8 ? '...' : '') + '. Face value ' + pts + '.' : '✕ No word with any letter for the blank.';
      return;
    }
    const w = ts.map(t => t.ch).join(''), ok = E.W.has(w);
    fb.className = ok ? 'ok' : 'no'; fb.textContent = ok ? '✓ ' + w + ': face value ' + pts : '✕ ' + w + ' is not a word';
  }
  function refresh() { evaluate(); scFeedback(); save(); }
  function moved() { evaluate(); scFeedback(); saveSoon(); nextBlank(); }
  function nextBlank() { if (pickT || SIM) return; const t = placed.find(x => x.ch === '?' && !x.as); if (t) { pickT = t; pickAt = Date.now(); $('pick').classList.add('on'); } }
  function placeOnBoard(t, r, c) {
    t.where = 'board'; t.r = r; t.c = c; t.g = null; t.el.classList.remove('ghost', 'sel'); t.el.remove(); placed.push(t); buzz(12); HL = null; dropFx(r, c);
    clearTimeout(zoomT);
    if (placed.length === 1 && fit * S.zoom / 100 > view.s * 1.05) zoomT = setTimeout(() => zoomTo(r, c, fit * S.zoom / 100), 160);
    moved();
  }
  function clearSel() { if (sel) sel.el.classList.remove('sel'); sel = null; }
  const groupsOf = () => { const l = []; placed.forEach(t => { if (t.g && !l.includes(t.g)) l.push(t.g); }); return l; };
  function sendBack(tiles) {   // a word goes back to the scratch row in its order (to the rack if the row is full)
    tiles.forEach(t => { t.g = null; const i = placed.indexOf(t); if (i >= 0) placed.splice(i, 1); });
    if (!scrOn()) { tiles.forEach(home); return; }
    let start = -1;
    for (let i = 0; i + tiles.length <= scr.n && start < 0; i++) if (scr.items.slice(i, i + tiles.length).every(x => !x)) start = i;
    tiles.forEach((t, j) => { if (start >= 0) intoTray(scr, t, start + j); else { const f = firstFree(scr); if (f >= 0) intoTray(scr, t, f); else home(t); } });
  }
  function recallAll() { clearSel(); groupsOf().forEach(g => sendBack(g.tiles.filter(t => placed.includes(t)))); placed.splice(0).forEach(home); }

  // ---------- turns ----------
  function commitMove(who, cs, r) {
    cs.forEach(t => { G.board[t.r][t.c] = { ch: t.ch, bl: t.bl ? 1 : 0 }; });
    G.scores[who] += r.total; G.last = cs.map(t => [t.r, t.c]); G.lastWho = who; G.passes = 0;
    if (cs.length === C.rackSize) G.st.bingos[who]++;
    if (r.total > G.st.best[who][1]) G.st.best[who] = [r.words[0].w, r.total];
    if (who === 0) { placed = []; refill(); }
    else {
      cs.forEach(t => { G.crack.splice(G.crack.findIndex(x => x.ch === (t.bl ? '?' : t.ch)), 1); });
      while (G.crack.length < C.rackSize && G.bag.length) G.crack.push({ ch: G.bag.pop() });
    }
  }
  const hist = () => { try { return JSON.parse(localStorage.getItem(HK)) || []; } catch (e) { return []; } };
  function finish(out) {
    const lv = [hand(), G.crack].map(a => a.reduce((s, t) => s + (t.ch === '?' ? 0 : C.values[t.ch]), 0));
    G.scores[0] -= lv[0]; G.scores[1] -= lv[1]; if (out >= 0) G.scores[out] += lv[1 - out];
    G.over = true; const [a, b] = G.scores;
    msg = 'Game over.'; if (SIM) return;
    try { const h = hist(); h.push({ t: Date.now(), you: a, comp: b, first: G.first, bingos: G.st.bingos, best: G.st.best, level: S.level }); localStorage.setItem(HK, JSON.stringify(h.slice(-500))); } catch (e) {}
    endText(); $('end').classList.add('on');
    if (a > b) { playSnd('win'); burst(); } else if (a < b) playSnd('lose');
  }
  function endText() {
    const [a, b] = G.scores, bp = k => G.st.best[k][1] ? G.st.best[k][0] + ' ' + G.st.best[k][1] : '-';
    $('endTxt').innerHTML = (a > b ? 'You win: ' : a < b ? 'Computer wins: ' : 'Draw: ') + 'You ' + a + ', Computer ' + b + '.<br>Bingos: you ' + G.st.bingos[0] +
      ', computer ' + G.st.bingos[1] + '.<br>Best play: you ' + bp(0) + ', computer ' + bp(1) + '.';
  }
  function checkEnd() {
    if (G.over) return true;
    if (G.bag.length === 0) { if (!hand().length && !placed.length) { finish(0); return true; } if (!G.crack.length) { finish(1); return true; } }
    if (G.passes >= 6) { finish(-1); return true; }
    return false;
  }
  function afterHuman() { HL = null; if (checkEnd()) { refresh(); return; } G.turn = 1; computerTurn(); }
  function compMove(level) {
    const m = E.aiPick(C, G.board, G.crack, level, S.noRare);
    if (m) { commitMove(1, m.cs, m.r); msg = 'Computer played ' + m.r.words[0].w + ' for ' + m.r.total + '.'; HL = { total: m.r.total }; if (!SIM) playSnd('computer'); }
    else if (G.bag.length >= C.rackSize) { G.bag.push(...G.crack.map(t => t.ch)); shuf(G.bag); G.crack = []; for (let i = 0; i < C.rackSize; i++) G.crack.push({ ch: G.bag.pop() }); G.passes++; msg = 'Computer swapped its tiles.'; }
    else { G.passes++; msg = 'Computer passed.'; }
  }
  function computerTurn() {
    busy = true; G.turn = 1; evaluate(); say('Computer is thinking...');
    setTimeout(() => { if (SIM) return; compMove(S.level); busy = false; G.turn = 0; checkEnd(); refresh(); zoomFit(); }, 120);
  }
  // Simulation (started from the developer page): the computer plays both sides with the player's Help my luck draws.
  function startSim(o) {
    if (SIM || !E.ready || D) return; recallAll(); save();
    let snap = null; try { snap = localStorage.getItem(KEY); } catch (e) {}
    SIM = { o, snap, paused: false, timer: 0 }; document.body.classList.add('sim');
    document.querySelectorAll('.ov.on').forEach(e => e.classList.remove('on')); $('mSimPause').textContent = 'Pause simulation';
    newGame(); busy = true; view = { s: fit, x: 0, y: 0 }; evaluate(); say('Simulation started.'); SIM.timer = setTimeout(simTick, 300);
  }
  function simTick() {
    if (!SIM || SIM.paused) return; const o = SIM.o;
    if (G.turn === 0) {
      const out = t => { const tr = t.where; tr.items[tr.items.indexOf(t)] = null; t.el.remove(); return t.ch; };
      const m = E.aiPick(C, G.board, hand().map(t => ({ ch: t.ch })), o.a, S.noRare);
      if (m) { m.cs.forEach(c => out(hand().find(x => x.ch === (c.bl ? '?' : c.ch)))); commitMove(0, m.cs, m.r); msg = 'Player played ' + m.r.words[0].w + ' for ' + m.r.total + '.'; }
      else if (G.bag.length >= C.rackSize) { const back = hand().map(out); refill(); G.bag.push(...back); shuf(G.bag); G.passes++; msg = 'Player swapped tiles.'; }
      else { G.passes++; msg = 'Player passed.'; }
      G.turn = 1;
    } else { compMove(o.b); G.turn = 0; }
    HL = null; const over = checkEnd(); evaluate();
    if (over) { say('Simulation finished: Player ' + G.scores[0] + ', Computer ' + G.scores[1] + '. Bingos ' + G.st.bingos[0] + ' and ' + G.st.bingos[1] + '. Stop it from the Menu.'); return; }
    say(msg); SIM.timer = setTimeout(simTick, o.speed === 'fast' ? 0 : 2000);
  }
  function stopSim() {
    if (!SIM) return; clearTimeout(SIM.timer); const snap = SIM.snap; SIM = null; document.body.classList.remove('sim');
    [rack, scr].forEach(tr => { tr.items.forEach(t => t && t.el.remove()); tr.items = Array(tr.n).fill(null); }); placed = [];
    try { if (snap) localStorage.setItem(KEY, snap); } catch (e) {}
    if (!restore()) newGame();
    busy = false; view = { s: fit, x: 0, y: 0 }; msg = 'Simulation stopped. Your game is back.'; refresh(); if (G.turn === 1 && !G.over) computerTurn();
  }
  async function loadDict() {
    busy = true; evaluate(); say('Loading the word list...');
    let own = null; try { own = await idb(s => s.get('dict')); } catch (e) {}
    try {
      const n = await E.load(BASE + 'core/', own || null, N);
      $('dictInfo').textContent = n.toLocaleString() + ' words loaded' + (own ? ' (your own list).' : ' (built-in list).');
    } catch (e) { say('Could not load the word list. Check the connection, then reload.'); return; }
    busy = false;
    if (G.over) { endText(); $('end').classList.add('on'); }
    if (G.turn === 1 && !G.over) computerTurn(); else refresh();
  }

  // ---------- themes (contract: themes/<id>/theme.json, schema version 1 from the art handover) ----------
  const DEF = { page: '#FAF9F6', panel: '#FFFFFF', text: '#292015', muted: '#655B50', plain: '#F8F0DF', grid: '#D8CBB0', tw: '#E54C51', dw: '#F17E9C', tl: '#2675D9', dl: '#82BDEA', st: '#F17E9C',
                accent: '#F6B93F', icon: '#292015', tileInk: '#292015', premiumInk: { tw: '#fff', dw: '#59213A', tl: '#fff', dl: '#17395A', st: '#59213A' } };
  const TH = { id: '', mode: 'light', pal: DEF, fx: {}, lay: { centerScale: 1, premiumIconScale: .82 }, img: {}, tint: {}, orn: false, bmp: null, bmpKey: 0, pat: null, pad: 5 };
  const mcache = {};
  async function manifest(id) {
    if (mcache[id]) return mcache[id];
    const r = await fetch(BASE + 'themes/' + id + '/theme.json'); if (!r.ok) throw new Error('theme');
    const m = await r.json(); if (!m || !m.assets || !m.modes) throw new Error('theme');
    return mcache[id] = m;
  }
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(src)); i.src = src; });
  const curMode = () => S.mode === 'system' ? (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : S.mode;
  let themeTok = 0;
  async function setTheme(id, quiet) {   // loads everything needed first, then switches in one go; a failure keeps the current look
    const tok = ++themeTok, mode = curMode(), A = {}, cdir = BASE + 'themes/classic/';
    let pal, ink, fx, lay, name = 'Classic', base = null;
    const SND = {}, SPR = {};
    const put = (m, dir) => { Object.keys(m.sounds || {}).forEach(k => { SND[k] = dir + m.sounds[k]; }); Object.keys(m.sprites || {}).forEach(k => { SPR[k] = dir + m.sprites[k]; }); Object.keys(m.assets || {}).forEach(k => { A[k] = dir + m.assets[k]; }); const ma = (m.modes[mode] || {}).assets || {}; Object.keys(ma).forEach(k => { A[k] = dir + ma[k]; }); };
    try {
      base = await manifest('classic'); put(base, cdir);
      const bm = base.modes[mode] || base.modes.light;
      pal = Object.assign({}, DEF, bm.palette); ink = Object.assign({}, DEF.premiumInk, bm.palette.premiumInk || {});
      fx = Object.assign({}, base.effects || {}, bm.effects || {}); lay = Object.assign({ centerScale: 1, premiumIconScale: .82 }, base.layout || {});
      if (id !== 'classic') {
        const t = await manifest(id), tm = t.modes[mode] || t.modes.light || {};
        put(t, BASE + 'themes/' + id + '/'); name = t.name || id;
        Object.assign(pal, tm.palette || {}); Object.assign(ink, (tm.palette || {}).premiumInk || {}); Object.assign(fx, t.effects || {}, tm.effects || {}); Object.assign(lay, t.layout || {});
      }
    } catch (e) {
      if (TH.id) { if (!quiet) say('Could not load that theme. Keeping the current one.'); return false; }
      pal = Object.assign({}, DEF); ink = DEF.premiumInk; fx = {}; lay = { centerScale: 1, premiumIconScale: .82 }; id = 'classic';
    }
    pal.premiumInk = ink;
    if (S.sym && S.sym !== 'theme') {   // a shared symbol set replaces the theme's square symbols (the theme's big centre piece stays)
      const sd = BASE + 'art/squares/' + S.sym + '/';
      ['tw', 'dw', 'tl', 'dl'].forEach(k => { A[k] = sd + k + '.svg'; });
      if (!A.st || /\.svg$/i.test(A.st)) A.st = sd + 'st.svg';
    }
    const img = {};
    await Promise.all(['tile', 'tw', 'dw', 'tl', 'dl', 'st'].map(async k => {
      if (!A[k]) { img[k] = null; return; }
      try { img[k] = await loadImg(A[k]); }
      catch (e) { try { A[k] = cdir + base.assets[k]; img[k] = await loadImg(A[k]); if (k === 'st') lay.centerScale = 1; } catch (e2) { img[k] = null; A[k] = ''; } }
    }));
    if (tok !== themeTok) return false;
    const b = document.body, st = b.style;
    ['page', 'panel', 'text', 'muted', 'plain', 'grid', 'accent', 'icon', 'tileInk'].forEach(k => st.setProperty('--' + k, pal[k]));
    b.classList.toggle('dark', mode === 'dark'); b.classList.toggle('notile', !img.tile);
    st.setProperty('--tileimg', img.tile ? 'url("' + A.tile + '")' : 'none');
    $('rackBox').classList.toggle('plain', !A.rack); st.setProperty('--rackimg', A.rack ? 'url("' + A.rack + '")' : 'none');
    $('bw').classList.toggle('framed', !!A.frame); st.setProperty('--frameimg', A.frame ? 'url("' + A.frame + '")' : 'none');
    const wall = A.wallpaper && fx.wallpaperOpacity > 0;
    $('appbg').style.backgroundImage = wall ? 'url("' + A.wallpaper + '")' : 'none'; $('appbg').style.opacity = wall ? fx.wallpaperOpacity : 0; b.classList.toggle('wall', !!wall);
    const mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.content = pal.page;
    Object.assign(TH, { id, mode, pal, fx, lay, img, tint: {}, bmp: null, bmpKey: 0, pat: null, pad: A.frame ? 10 : 5, orn: !!img.st && (!/\.svg$/i.test(A.st) || lay.centerScale > 1) });
    relayout();
    TH.spr = {}; TH.stF = 0;
    Object.keys(SPR).forEach(k => loadImg(SPR[k]).then(i => { if (tok === themeTok) { TH.spr[k] = { img: i, n: Math.max(1, Math.round(i.width / i.height)), w: i.height }; if (k === 'particle') particles(); } }).catch(() => {}));
    if (!SPR.particle) particles();
    loadSounds(SND, tok);
    if (A.boardArt && fx.boardArtOpacity > 0) loadImg(A.boardArt).then(i => { if (tok === themeTok) { TH.img.art = i; dirty = true; kick(); } }).catch(() => {});
    if (A.surface && fx.surfaceOpacity > 0) loadImg(A.surface).then(i => { if (tok === themeTok) { TH.img.surf = i; TH.pat = null; dirty = true; kick(); } }).catch(() => {});
    if (!quiet) say('Theme: ' + name + (mode === 'dark' ? ', dark.' : ', light.'));
    return true;
  }
  function tinted(k) {   // a white or black silhouette painted in the theme's ink colour
    if (TH.tint[k]) return TH.tint[k]; const im = TH.img[k]; if (!im) return null;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.drawImage(im, 0, 0, 128, 128); x.globalCompositeOperation = 'source-in'; x.fillStyle = TH.pal.premiumInk[k] || '#fff'; x.fillRect(0, 0, 128, 128);
    return TH.tint[k] = c;
  }
  function tileBmp(px) {   // the tile picture, drawn once at the size in use
    if (!TH.img.tile) return null;
    if (TH.bmpKey !== px) { const c = TH.bmp || document.createElement('canvas'); c.width = c.height = px; const x = c.getContext('2d'); x.clearRect(0, 0, px, px); x.drawImage(TH.img.tile, 0, 0, px, px); TH.bmp = c; TH.bmpKey = px; }
    return TH.bmp;
  }

  // ---------- sound (Web Audio: decoded once per theme, plays instantly, nothing runs while silent) ----------
  let AC = null, SB = {}, music = null, lastBad = 0, lastBadAt = 0;
  function audio() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }
  async function loadSounds(map, tok) {
    stopMusic(); SB = {}; const ac = audio(); if (!ac) return;
    await Promise.all(Object.keys(map).map(async k => {
      try { const b = await (await fetch(map[k])).arrayBuffer(); const buf = await new Promise((res, rej) => ac.decodeAudioData(b, res, rej)); if (tok === themeTok) SB[k] = buf; } catch (e) {}
    }));
    if (tok === themeTok) startMusic();
  }
  function playSnd(k, vol) {
    if (!S.sfx || SIM || !SB[k] || !AC || AC.state !== 'running') return;
    try { const src = AC.createBufferSource(), g = AC.createGain(); g.gain.value = vol || .6; src.buffer = SB[k]; src.connect(g); g.connect(AC.destination); src.start(); } catch (e) {}
  }
  function startMusic() {
    stopMusic(); if (!S.music || !SB.loop || !AC || AC.state !== 'running' || document.hidden) return;
    try { const src = AC.createBufferSource(), g = AC.createGain(); g.gain.value = .22; src.buffer = SB.loop; src.loop = true; src.connect(g); g.connect(AC.destination); src.start(); music = src; } catch (e) {}
  }
  function stopMusic() { if (music) { try { music.stop(); } catch (e) {} music = null; } }
  // Phones only allow sound after a tap, so the first touch anywhere switches sound on.
  window.addEventListener('pointerdown', () => { const was = AC && AC.state === 'running'; audio(); if (!was && AC) setTimeout(() => { if (!music) startMusic(); }, 60); }, { capture: true });

  // ---------- movement: particles behind the game, bursts and sparkles in front ----------
  const fxb = $('fxb'), fxt = $('fxt'), bx = fxb.getContext('2d'), tx = fxt.getContext('2d');
  let parts = [], pRun = 0, pLast = 0, shots = [], sRun = 0;
  function sizeFx() { const d = Math.min(2, window.devicePixelRatio || 1); [fxb, fxt].forEach(c => { c.width = Math.round(innerWidth * d); c.height = Math.round(innerHeight * d); c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'; c.getContext('2d').setTransform(d, 0, 0, d, 0, 0); }); }
  function particles() {   // 14 slow particles; bubbles rise, everything else falls and sways
    cancelAnimationFrame(pRun); pRun = 0; bx.clearRect(0, 0, innerWidth, innerHeight);
    const sp = TH.spr && TH.spr.particle; parts = [];
    if (!sp || !S.motion) return;
    const up = TH.id === 'ocean';
    for (let i = 0; i < 14; i++) parts.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, z: 16 + Math.random() * 18, v: (10 + Math.random() * 18) * (up ? -1 : 1), w: Math.random() * 6.28, f: Math.random() * sp.n, a: .45 + Math.random() * .4 });
    pLast = 0; pRun = requestAnimationFrame(pTick);
  }
  function pTick(ts) {
    pRun = 0; const sp = TH.spr && TH.spr.particle; if (!sp || !S.motion || !parts.length) return;
    if (document.hidden || D) { pLast = ts; pRun = requestAnimationFrame(pTick); return; }   // paused while a tile is in the air, so dragging stays smooth
    if (pLast && ts - pLast < 30) { pRun = requestAnimationFrame(pTick); return; }   // about 30 frames a second is plenty
    const dt = Math.min(.1, (ts - (pLast || ts)) / 1000); pLast = ts;
    bx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => {
      p.y += p.v * dt; p.w += dt * .8; p.f = (p.f + dt * 6) % sp.n; const x = p.x + Math.sin(p.w) * 14;
      if (p.y > innerHeight + 40) p.y = -40; else if (p.y < -40) p.y = innerHeight + 40;
      bx.globalAlpha = p.a; bx.drawImage(sp.img, (p.f | 0) * sp.w, 0, sp.w, sp.w, x - p.z / 2, p.y - p.z / 2, p.z, p.z);
    });
    bx.globalAlpha = 1; pRun = requestAnimationFrame(pTick);
  }
  function shot(k, x, y, size, fps) { const sp = TH.spr && TH.spr[k]; if (!sp || !S.motion || SIM) return; shots.push({ sp, x, y, size, fps, t0: 0 }); if (!sRun) sRun = requestAnimationFrame(sTick); }
  function sTick(ts) {
    sRun = 0; tx.clearRect(0, 0, innerWidth, innerHeight);
    shots = shots.filter(o => { if (!o.t0) o.t0 = ts; const f = Math.floor((ts - o.t0) / 1000 * o.fps); if (f >= o.sp.n) return false; tx.drawImage(o.sp.img, f * o.sp.w, 0, o.sp.w, o.sp.w, o.x - o.size / 2, o.y - o.size / 2, o.size, o.size); return true; });
    if (shots.length) sRun = requestAnimationFrame(sTick);
  }
  function dropFx(r, c) {
    playSnd('drop');
    const b = cv.getBoundingClientRect(); shot('pop', b.left + view.x + (c + .5) * view.s, b.top + view.y + (r + .5) * view.s, Math.max(46, view.s * 2.4), 26);
    setTimeout(() => { if (lastBadAt > Date.now() - 400 && Date.now() - lastBad > 1500) { lastBad = Date.now(); playSnd('bad', .45); } }, 30);
  }
  function burst() { const b = cv.getBoundingClientRect(); shot('burst', b.left + b.width / 2, b.top + b.height / 2, b.width * .8, 14); }
  setInterval(() => {   // centre piece: a short animation about every 6 seconds while the centre square is empty
    const an = TH.spr && TH.spr.stAnim; if (!an || !S.motion || document.hidden || !G || D || occ(MID, MID)) return;
    let f = 0; const step = () => { TH.stF = ++f; dirty = true; kick(); if (f < an.n) setTimeout(step, 110); else { TH.stF = 0; dirty = true; kick(); } }; step();
  }, 6000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopMusic(); else startMusic(); });

  // ---------- board drawing: one canvas, redrawn only when something changes ----------
  const LKS = [.56, .62, .68, .74, .8], PKS = [.22, .25, .28];
  const KIND = { T: 'tw', D: 'dw', t: 'tl', d: 'dl', '*': 'st' }, FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', MID = N >> 1;
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function drawTile(x, y, s, L, P, blank, ring) {
    const bmp = tileBmp(Math.max(8, Math.ceil(s * dpr)));
    if (bmp) ctx.drawImage(bmp, x, y, s, s);
    else {
      const p = s * .04, w = s - 2 * p;
      ctx.fillStyle = '#CA935A'; rr(x + p, y + p + s * .05, w, w - s * .01, s * .14); ctx.fill();
      const g = ctx.createLinearGradient(0, y, 0, y + s); g.addColorStop(0, '#FBE2B0'); g.addColorStop(1, '#F2CB88'); ctx.fillStyle = g; rr(x + p, y + p, w, w - s * .05, s * .14); ctx.fill();
    }
    if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = Math.max(1.5, s * .07); rr(x + s * .035, y + s * .035, s * .93, s * .93, s * .12); ctx.stroke(); }
    ctx.fillStyle = blank ? '#b03a2e' : TH.pal.tileInk; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const lk = LKS[S.lsz] || .56; ctx.font = '800 ' + (s * lk) + 'px ' + FONT; ctx.fillText(L, x + s * (.466 - (lk - .56) * .35), y + s * (.47 + lk * .35));   // bigger letters move left, clear of the points
    if (P !== '') { ctx.textAlign = 'right'; ctx.font = '800 ' + (s * (PKS[S.psz] || .22)) + 'px ' + FONT; ctx.fillText(P, x + s * .9, y + s * .86); }
  }
  function drawBubble(b) {
    const s = view.s; ctx.font = '700 12px ' + FONT;
    const tw = ctx.measureText(b.text).width, pw = Math.max(20, tw + 12), ph = 19;
    let bx = view.x + b.c * s - 8, by = view.y + b.r * s - ph + 5;   // sits on the tile's top corner so the letter stays readable
    if (bx <= -pw || by <= -ph || bx >= W || by >= W) return;
    bx = Math.max(2, Math.min(W - pw - 2, bx)); by = Math.max(2, Math.min(W - ph - 2, by));   // kept inside the board picture
    ctx.fillStyle = b.kind === 'bad' ? '#d32f2f' : b.kind === 'cmp' ? '#e8590c' : b.kind === 'hov' ? '#5d6673' : b.kind === 'hbad' ? '#9a4a4a' : '#0a57c2';
    rr(bx, by, pw, ph, 9.5); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.text, bx + pw / 2, by + ph / 2 + .5);
  }
  function draw() {
    dirty = false; const s = view.s, p = TH.pal, fx = TH.fx, bs = N * s;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = p.plain; ctx.fillRect(0, 0, W, W);
    if (TH.img.surf && fx.surfaceOpacity > 0) {   // repeating texture on the plain squares
      if (!TH.pat) TH.pat = ctx.createPattern(TH.img.surf, 'repeat');
      const q = (128 / TH.img.surf.width) * (s / fit);
      ctx.save(); ctx.globalAlpha = fx.surfaceOpacity; ctx.translate(view.x, view.y); ctx.scale(q, q); ctx.fillStyle = TH.pat; ctx.fillRect(0, 0, bs / q, bs / q); ctx.restore();
    }
    if (TH.img.art && fx.boardArtOpacity > 0) { ctx.globalAlpha = fx.boardArtOpacity; ctx.drawImage(TH.img.art, view.x, view.y, bs, bs); ctx.globalAlpha = 1; }
    const c0 = Math.max(0, Math.floor(-view.x / s)), c1 = Math.min(N - 1, Math.floor((W - view.x) / s)), r0 = Math.max(0, Math.floor(-view.y / s)), r1 = Math.min(N - 1, Math.floor((W - view.y) / s));
    ctx.strokeStyle = p.grid; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = c0; i <= c1 + 1; i++) { const x = Math.round(view.x + i * s) + .5; ctx.moveTo(x, 0); ctx.lineTo(x, W); }
    for (let i = r0; i <= r1 + 1; i++) { const y = Math.round(view.y + i * s) + .5; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    const isz = s * (TH.lay.premiumIconScale || .82);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const k = KIND[C.board[r][c]]; if (!k) continue;
      const x = view.x + c * s, y = view.y + r * s, cx = x + s / 2, cy = y + s / 2;
      ctx.fillStyle = p[k]; rr(x + 1.5, y + 1.5, s - 2, s - 2, Math.min(4, s * .12)); ctx.fill();
      if (k === 'st' && TH.orn) continue;
      const im = tinted(k);
      if (im) ctx.drawImage(im, cx - isz / 2, cy - isz / 2, isz, isz);
      else {   // no icon file: simple built-in shapes
        const q = s * .16; ctx.fillStyle = p.premiumInk[k] || '#fff'; ctx.beginPath();
        if (k === 'tw' || k === 'tl') { ctx.moveTo(cx, cy - q); ctx.lineTo(cx + q, cy); ctx.lineTo(cx, cy + q); ctx.lineTo(cx - q, cy); }
        else if (k === 'st') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? s * .13 : s * .3; ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } }
        else ctx.arc(cx, cy, q * .85, 0, 7);
        ctx.fill();
      }
    }
    if (TH.orn && !occ(MID, MID)) {   // large centre piece: over the squares, under every tile, hidden once the centre is used
      const z = s * (TH.lay.centerScale || 1), x0 = view.x + (MID + .5) * s - z / 2, y0 = view.y + (MID + .5) * s - z / 2, an = TH.spr && TH.spr.stAnim;
      if (an && S.motion && TH.stF) ctx.drawImage(an.img, (TH.stF % an.n) * an.w, 0, an.w, an.w, x0, y0, z, z); else ctx.drawImage(TH.img.st, x0, y0, z, z);
    }
    const lastKey = G.lastWho === 1 ? new Set(G.last.map(q => q[0] * N + q[1])) : null;
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const f = G.board[r][c]; if (f) drawTile(view.x + c * s, view.y + r * s, s, f.ch, f.bl ? '' : C.values[f.ch], f.bl, lastKey && lastKey.has(r * N + c) ? '#ff9f1a' : null);
    }
    placed.forEach(t => drawTile(view.x + t.c * s, view.y + t.r * s, s, letter(t), t.ch === '?' ? '' : C.values[t.ch], t.ch === '?', '#2E8BFF'));
    if (D && D.tgt && D.tgt.cell) {   // the square the floating tile will land on
      const x = view.x + D.tgt.cell.c * s, y = view.y + D.tgt.cell.r * s;
      ctx.fillStyle = 'rgba(52,120,223,.3)'; ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = '#1b4fa8'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 3.5, y + 3.5, s - 7, s - 7);
    }
    if (D && D.tgt && D.tgt.cells) {   // a lifted word: its landing squares, blue when it scores, red when it does not
      const ring = !D.tgt.bad && hov && hov.kind === 'hov' ? '#2E8BFF' : '#e0453f'; ctx.globalAlpha = .85;
      D.tgt.cells.forEach((q, i) => { if (!q) return; const t = D.grp[i]; drawTile(view.x + q.c * s, view.y + q.r * s, s, letter(t), t.ch === '?' ? '' : C.values[t.ch], t.ch === '?', ring); });
      ctx.globalAlpha = 1;
    }
    if (D && hov) { bubs.forEach(b => { if (b.kind === 'cmp') drawBubble(b); }); drawBubble(hov); } else bubs.forEach(drawBubble);   // bubbles last: always on top
  }

  // ---------- view: zoom and pan ----------
  const maxS = () => Math.max(fit * 3, 60);
  function clampView(v) { v.s = Math.max(fit, Math.min(maxS(), v.s)); const bs = N * v.s; v.x = Math.min(0, Math.max(W - bs, v.x)); v.y = Math.min(0, Math.max(W - bs, v.y)); return v; }
  function animTo(to) { tween = { t0: 0, from: Object.assign({}, view), to: clampView(to) }; kick(); }
  function zoomTo(r, c, s) { s = Math.min(maxS(), s); animTo({ s, x: W / 2 - (c + .5) * s, y: W / 2 - (r + .5) * s }); }
  function zoomFit() { clearTimeout(zoomT); if (view.s > fit * 1.001) animTo({ s: fit, x: 0, y: 0 }); }
  function zoomAt(px, py, k) { const ns = Math.max(fit, Math.min(maxS(), view.s * k)); k = ns / view.s; view.x = px - (px - view.x) * k; view.y = py - (py - view.y) * k; view.s = ns; clampView(view); dirty = true; kick(); }
  function cellAt(x, y) {
    const b = cv.getBoundingClientRect(); if (x < b.left || x >= b.right || y < b.top || y >= b.bottom) return null;
    const c = Math.floor((x - b.left - view.x) / view.s), r = Math.floor((y - b.top - view.y) / view.s);
    return (r < 0 || c < 0 || r >= N || c >= N) ? null : { r, c };
  }
  function relayout() {   // the board takes the full width, or all the height that is left on a short screen
    $('scrBox').style.display = scrOn() ? '' : 'none';
    metrics(rack); if (scrOn()) metrics(scr);
    const app = $('app'), cs = getComputedStyle(app); let others = 0, n = 0;
    for (const el of app.children) { if (el.id === 'bw' || !el.offsetHeight) continue; others += el.offsetHeight; n++; }
    const pad = TH.pad * 2;
    const availH = app.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - others - (parseFloat(cs.rowGap) || 0) * n - pad;
    const availW = app.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - pad;
    const was = view.s <= fit * 1.01;
    W = Math.floor(Math.max(200, Math.min(availW, availH))); dpr = Math.min(3, window.devicePixelRatio || 1);
    cv.style.width = cv.style.height = W + 'px'; cv.width = cv.height = Math.round(W * dpr);
    fit = W / N; if (was) view.s = fit; clampView(view); dirty = true; kick();
  }

  // ---------- frame loop ----------
  function kick() { if (!rafId) rafId = requestAnimationFrame(tick); }
  function tick(ts) {
    rafId = 0; const dt = Math.min(50, ts - (lastTs || ts)); lastTs = ts;
    if (tween) {
      if (!tween.t0) tween.t0 = ts;
      const k = Math.min(1, (ts - tween.t0) / 220), e = 1 - Math.pow(1 - k, 3), f = tween.from, t = tween.to;
      view.s = f.s + (t.s - f.s) * e; view.x = f.x + (t.x - f.x) * e; view.y = f.y + (t.y - f.y) * e; dirty = true;
      if (k >= 1) tween = null;
    }
    if (D) (D.grp ? groupFrame : dragFrame)(dt || 16);
    if (dirty && G) { draw(); $('bFit').style.display = view.s > fit * 1.04 ? 'flex' : 'none'; }
    if (D || tween) kick(); else lastTs = 0;
  }

  // ---------- dragging ----------
  const inR = (x, y, r, m) => x >= r.left - m && x <= r.right + m && y >= r.top - m && y <= r.bottom + m;
  function startDrag(p, e) {
    const t = p.t, el = t.el; let cx, cy, sz, origin;
    clearSel(); clearTimeout(zoomT); HL = null;
    if (t.where === 'board') {
      placed.splice(placed.indexOf(t), 1); const b = cv.getBoundingClientRect();
      cx = b.left + view.x + (t.c + .5) * view.s; cy = b.top + view.y + (t.r + .5) * view.s; sz = view.s; origin = { board: 1 };
    } else {
      const tray = t.where, i = tray.items.indexOf(t), b = el.getBoundingClientRect();
      cx = b.left + b.width / 2; cy = b.top + b.height / 2; sz = tray.sw; tray.items[i] = null; origin = { tray, i };
    }
    t.where = null; playSnd('pick'); el.style.transition = 'none'; el.classList.add('ghost'); el.style.setProperty('--sz', '64px'); document.body.appendChild(el);
    D = { t, id: p.id, touch: p.ptype !== 'mouse', x: e.clientX, y: e.clientY, ox: cx - e.clientX, oy: cy - e.clientY, lift: 0, sz, origin, tgt: null, key: '',
          cvR: cv.getBoundingClientRect(), rackR: rack.box.getBoundingClientRect(), scrR: scrOn() ? scr.box.getBoundingClientRect() : null };
    el.style.transform = 'translate3d(' + (cx - 32) + 'px,' + (cy - 32) + 'px,0) scale(' + (sz / 64) + ')';
    evaluate(); buzz(8); kick();
  }
  function zoneOf(d) {   // trays go by the finger; the board goes by the middle of the floating tile
    if (inR(d.x, d.y, d.rackR, 6)) return 'rack';
    if (d.scrR && inR(d.x, d.y, d.scrR, 6)) return 'scr';
    if (inR(d.x + d.ox, d.y + d.oy - d.lift, d.cvR, 0)) return 'board';
    return '';
  }
  function dragFrame(dt) {
    const d = D, z = zoneOf(d), k = Math.min(1, dt / 55);
    d.ox *= .7; d.oy *= .7;
    // the tile floats higher above the finger the further the finger is above the rack, so the bottom board row stays reachable
    const u = d.rackR.top - 6 - d.y, ramp = Math.max(0, Math.min(1, u / Math.max(1, S.lift * .8)));
    const tl = !d.touch ? 0 : S.lift * (.35 + .65 * ramp);
    const tz = z === 'rack' ? rack.sw : z === 'scr' ? scr.sw : Math.max(30, Math.min(84, view.s * S.gs / 100));
    d.lift += (tl - d.lift) * k; d.sz += (tz - d.sz) * k;
    const cx = d.x + d.ox, cy = d.y + d.oy - d.lift;
    d.t.el.style.transform = 'translate3d(' + (cx - 32) + 'px,' + (cy - 32) + 'px,0) scale(' + (d.sz / 64) + ')';
    if (z === 'board') edgePan(cx, cy, dt);
    setTarget(z, cx, cy);
  }
  function setTarget(z, cx, cy) {
    const d = D; let nt = null;
    if (z === 'board') {
      const fx = (cx - d.cvR.left - view.x) / view.s, fy = (cy - d.cvR.top - view.y) / view.s;
      let q = { r: Math.floor(fy), c: Math.floor(fx) };
      const o = d.tgt && d.tgt.cell;   // stay on the current square until the tile is clearly off it
      if (o && fx > o.c - .15 && fx < o.c + 1.15 && fy > o.r - .15 && fy < o.r + 1.15) q = o;
      if (q.r >= 0 && q.c >= 0 && q.r < N && q.c < N && !occ(q.r, q.c)) nt = { cell: q };
    } else if (z) {
      const tray = z === 'rack' ? rack : scr, j = slotAt(tray, cx), a = arrange(tray.items, j);
      if (a) nt = { tray, j, a };
    }
    const key = !nt ? '' : nt.cell ? 'c' + nt.cell.r + ',' + nt.cell.c : nt.tray.name + nt.j;
    if (key === d.key) return;
    if (d.tgt && d.tgt.tray && (!nt || nt.tray !== d.tgt.tray)) layout(d.tgt.tray);
    if (nt && nt.tray) layout(nt.tray, nt.a);
    rack.box.classList.toggle('hot', !!nt && nt.tray === rack && d.origin.tray !== rack); scr.box.classList.toggle('hot', !!nt && nt.tray === scr && d.origin.tray !== scr);
    d.tgt = nt; d.key = key; hov = null; dirty = true;
    if (!nt) { say(z === 'board' ? 'That square is taken.' : 'Let go here and the tile goes back.'); return; }
    buzz(5);
    if (nt.tray) { say('Drop in the ' + nt.tray.name + ', position ' + (nt.j + 1) + '.'); return; }
    const q = nt.cell, t = d.t;
    hoverEval([{ r: q.r, c: q.c, ch: letter(t) || '?', bl: t.ch === '?' }]);
  }
  function edgePan(cx, cy, dt) {   // zoomed in: the board only moves when the tile is held at its edge
    if (view.s <= fit * 1.02) return;
    const px = cx - D.cvR.left, py = cy - D.cvR.top, m = W * .12, sp = 260 * dt / 1000; let vx = 0, vy = 0;
    if (px < m) vx = sp * (1 - px / m); else if (px > W - m) vx = -sp * (1 - (W - px) / m);
    if (py < m) vy = sp * (1 - py / m); else if (py > W - m) vy = -sp * (1 - (W - py) / m);
    if (vx || vy) { const ox = view.x, oy = view.y; view.x += vx; view.y += vy; clampView(view); if (ox !== view.x || oy !== view.y) dirty = true; }
  }
  function hoverEval(cs) {   // live check of what the floating tile or word would make on these squares
    if (cs.some(x => x.ch === '?')) { say('Blank tile: you choose its letter after you drop it.'); return; }
    if (!E.ready) return;
    const r = E.evalMove(C, G.board, pcells().concat(cs));
    if (r.err) { hov = { r: cs[0].r, c: cs[0].c, text: '\u2715', kind: 'hbad' }; say(r.err); return; }
    const bad = r.words.filter(w => !w.ok);
    if (bad.length) { hov = { r: bad[0].r, c: bad[0].c, text: '\u2715', kind: 'hbad' }; say('Not a word: ' + bad.map(w => w.w).join(', ')); }
    else { hov = { r: r.words[0].r, c: r.words[0].c, text: String(r.total), kind: 'hov' }; say(r.words.map(w => w.w + ' ' + w.pts).join(', ') + (r.bingo ? ', bonus ' + r.bingo : '') + ' = ' + r.total); }
  }
  // Hold a tile in the scratch row: the run of touching tiles lifts as one piece, held by the tile under the finger.
  // It does not have to be a word. On the board its letters skip squares that are already filled.
  function liftGroup(p, grp, gi, origin) {
    clearSel(); clearTimeout(zoomT); HL = null;
    const box = document.createElement('div'); box.className = 'wghost';
    grp.forEach(x => { x.where = null; x.el.classList.remove('sel', 'ghost'); x.el.style.transition = 'none'; box.appendChild(x.el); });
    document.body.appendChild(box);
    D = { t: grp[gi], grp, gi, box, id: p.id, touch: p.ptype !== 'mouse', x: p.x0, y: p.y0, lift: 0, g: 0, gv: null, tgt: null, key: '-', origin,
          cvR: cv.getBoundingClientRect(), rackR: rack.box.getBoundingClientRect(), scrR: scrOn() ? scr.box.getBoundingClientRect() : null };
    evaluate(); scFeedback(); buzz(18); playSnd('pick'); groupFrame(16); kick();
  }
  // Hold a tile in the scratch row: the run of touching tiles lifts as one piece, held by the tile under the finger.
  // It does not have to be a word. On the board its letters skip squares that are already filled.
  function startWord(p) {
    const t = p.t, i = scr.items.indexOf(t); if (i < 0) return;
    let lo = i, hi = i; while (lo > 0 && scr.items[lo - 1]) lo--; while (hi < scr.n - 1 && scr.items[hi + 1]) hi++;
    if (lo === hi) { startDrag(p, { clientX: p.x0, clientY: p.y0 }); return; }
    const grp = scr.items.slice(lo, hi + 1), idx = grp.map((x, k) => lo + k);
    grp.forEach((x, k) => { scr.items[lo + k] = null; });
    liftGroup(p, grp, i - lo, { tray: scr, idx });
    say('Word lifted. Drag it to the board.');
  }
  // A word dropped on the board stays one piece until Play or Recall: dragging any of its tiles moves them all.
  function startBoardGroup(p, e) {
    const g = p.t.g, grp = g.tiles.filter(x => placed.includes(x)), gi = grp.indexOf(p.t);
    const cells = grp.map(x => ({ r: x.r, c: x.c }));
    grp.forEach(x => placed.splice(placed.indexOf(x), 1));
    liftGroup({ id: p.id, ptype: p.ptype, x0: e.clientX, y0: e.clientY }, grp, gi, { board: 1, g, cells });
  }
  function groupFrame(dt) {
    const d = D, k = Math.min(1, dt / 55), v = S.dir === 'v', n = d.grp.length;
    const u = d.rackR.top - 6 - d.y, ramp = Math.max(0, Math.min(1, u / Math.max(1, S.wlift * .8 + 1)));
    d.lift += ((d.touch ? S.wlift * (.3 + .7 * ramp) : 0) - d.lift) * k;
    const g = Math.round(Math.max(22, view.s));   // the floating word is exactly square size, so it lines up with where it will land
    if (g !== d.g || v !== d.gv) {
      d.g = g; d.gv = v;
      d.grp.forEach((t, j) => { const o = (j - d.gi) * g; t.el.style.setProperty('--sz', g + 'px'); t.el.style.transform = 'translate3d(' + ((v ? 0 : o) - g / 2) + 'px,' + ((v ? o : 0) - g / 2) + 'px,0)'; });
    }
    const cx = d.x, cy = d.y - d.lift;
    d.box.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    let nt = null;
    const overTray = inR(d.x, d.y, d.rackR, 6) || (d.scrR && inR(d.x, d.y, d.scrR, 6));
    if (overTray) nt = { back: 1 };
    else if (inR(cx, cy, d.cvR, 0)) {
      edgePan(cx, cy, dt);
      const fx = (cx - d.cvR.left - view.x) / view.s, fy = (cy - d.cvR.top - view.y) / view.s;
      let q = { r: Math.floor(fy), c: Math.floor(fx) };
      const o = d.tgt && d.tgt.a;
      if (o && fx > o.c - .15 && fx < o.c + 1.15 && fy > o.r - .15 && fy < o.r + 1.15) q = o;
      q.r = Math.max(0, Math.min(N - 1, q.r)); q.c = Math.max(0, Math.min(N - 1, q.c));
      if (!occ(q.r, q.c)) {
        const cells = Array(n).fill(null), dr = v ? 1 : 0, dc = v ? 0 : 1; cells[d.gi] = q; let ok = true, r = q.r, c = q.c;
        for (let j = d.gi + 1; j < n; j++) { do { r += dr; c += dc; } while (r < N && c < N && occ(r, c)); if (r >= N || c >= N) { ok = false; break; } cells[j] = { r, c }; }
        r = q.r; c = q.c;
        for (let j = d.gi - 1; j >= 0; j--) { do { r -= dr; c -= dc; } while (r >= 0 && c >= 0 && occ(r, c)); if (r < 0 || c < 0) { ok = false; break; } cells[j] = { r, c }; }
        nt = { a: q, cells, bad: !ok };
      }
    }
    const key = !nt ? '' : nt.back ? 'back' : 'w' + nt.a.r + ',' + nt.a.c + (nt.bad ? 'x' : '');
    if (key === d.key) return;
    scr.box.classList.toggle('hot', !!nt && !!nt.back);
    d.tgt = nt; d.key = key; hov = null; dirty = true;
    if (!nt) { say(inR(cx, cy, d.cvR, 0) ? 'That square is taken.' : 'Let go here and the word goes back.'); return; }
    if (nt.back) { say('Let go to put the word back in the scratch row.'); return; }
    if (nt.bad) { say('The word does not fit here: it runs off the board.'); return; }
    buzz(5); hoverEval(d.grp.map((t, j) => ({ r: nt.cells[j].r, c: nt.cells[j].c, ch: letter(t) || '?', bl: t.ch === '?' })));
  }
  function drop(cancelled) {
    const d = D, t = d.t; D = null; hov = null;
    rack.box.classList.remove('hot'); scr.box.classList.remove('hot');
    if (d.grp) {
      const g = d.tgt, o = d.origin;
      d.grp.forEach(x => { x.el.remove(); x.el.style.transition = ''; });
      d.box.remove();
      const putAt = cells => { const gr = o.g || { tiles: [] }; gr.tiles = d.grp.slice(); d.grp.forEach((x, j) => { x.where = 'board'; x.r = cells[j].r; x.c = cells[j].c; x.g = gr; placed.push(x); }); };
      if (!cancelled && g && g.a && !g.bad) {
        const first = !placed.length; putAt(g.cells); buzz(15); HL = null; clearTimeout(zoomT); dropFx(g.a.r, g.a.c);
        if (first && fit * S.zoom / 100 > view.s * 1.05) zoomT = setTimeout(() => zoomTo(g.a.r, g.a.c, fit * S.zoom / 100), 160);
        moved();
      } else if (!cancelled && g && g.back) { sendBack(d.grp); moved(); say('The word went back to the scratch row.'); }
      else if (o.board) { putAt(o.cells); moved(); say('Missed: the word stayed where it was.'); }
      else { d.grp.forEach((x, j) => { const i = o.idx[j]; if (!scr.items[i]) intoTray(scr, x, i); else home(x); }); moved(); say('The word went back to the scratch row.'); }
      dirty = true; kick(); return;
    }
    const cx = d.x + d.ox, cy = d.y + d.oy - d.lift, g = d.tgt;
    if (!cancelled && g && g.cell) placeOnBoard(t, g.cell.r, g.cell.c);
    else if (!cancelled && g && g.tray) { g.tray.items = g.a; flyInto(g.tray, t, g.j, cx, cy); buzz(10); moved(); }
    else {
      if (g && g.tray) layout(g.tray);
      if (d.origin.board) { t.where = 'board'; t.el.classList.remove('ghost'); t.el.remove(); placed.push(t); }
      else { const tr = d.origin.tray, i = tr.items[d.origin.i] ? firstFree(tr) : d.origin.i; if (i < 0) home(t); else flyInto(tr, t, i, cx, cy); }
      moved(); say('Missed: the tile went back where it was.');
    }
    dirty = true; kick();
  }

  // ---------- pointer input ----------
  [rack, scr].forEach(tray => tray.box.addEventListener('pointerdown', e => {
    if (D || P || locked() || e.target.closest('button')) return; const el = e.target.closest('.tile');
    P = el ? { kind: 'tile', t: el.__t, id: e.pointerId, x0: e.clientX, y0: e.clientY, ptype: e.pointerType }
           : { kind: 'tray', tray, id: e.pointerId, x0: e.clientX, y0: e.clientY, ptype: e.pointerType };
    if (el && tray === scr) { const p = P; p.lp = setTimeout(() => { if (P === p && !locked()) { P = null; startWord(p); } }, 380); }
  }));
  document.addEventListener('contextmenu', e => { if (!e.target.closest('input')) e.preventDefault(); });
  const ptrs = new Map(); let GS = null, lastTap = { t: 0, x: 0, y: 0 };
  cv.addEventListener('pointerdown', e => {
    if (D || P) return;
    if (ptrs.size === 0 && !locked()) {
      const q = cellAt(e.clientX, e.clientY), t = q && placed.find(p => p.r === q.r && p.c === q.c);
      if (t) { P = { kind: 'tile', t, id: e.pointerId, x0: e.clientX, y0: e.clientY, ptype: e.pointerType }; return; }
    }
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    tween = null; clearTimeout(zoomT);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    if (ptrs.size === 1) GS = { moved: false }; else if (GS) GS.moved = true;
  });
  cv.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p || !GS) return;
    if (ptrs.size === 1) {
      if (!GS.moved && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) > 8) GS.moved = true;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (GS.moved) { view.x += dx; view.y += dy; clampView(view); dirty = true; kick(); }
    } else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], od = Math.hypot(a.x - b.x, a.y - b.y), ox = (a.x + b.x) / 2, oy = (a.y + b.y) / 2;
      p.x = e.clientX; p.y = e.clientY;
      const nd = Math.hypot(a.x - b.x, a.y - b.y), nx = (a.x + b.x) / 2, ny = (a.y + b.y) / 2, r = cv.getBoundingClientRect();
      if (od > 0) { zoomAt(ox - r.left, oy - r.top, nd / od); view.x += nx - ox; view.y += ny - oy; clampView(view); dirty = true; kick(); }
    }
  });
  function endPtr(e, cancelled) {
    if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
    if (ptrs.size === 0 && GS && !GS.moved && !cancelled) tapBoard(e);
  }
  cv.addEventListener('pointerup', e => endPtr(e, false));
  cv.addEventListener('pointercancel', e => endPtr(e, true));
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.15 : .87); }, { passive: false });
  window.addEventListener('pointermove', e => {
    if (P && e.pointerId === P.id && P.kind === 'tile' && Math.hypot(e.clientX - P.x0, e.clientY - P.y0) > 7) { const p = P; P = null; clearTimeout(p.lp); if (!locked()) { if (p.t.where === 'board' && p.t.g) startBoardGroup(p, e); else startDrag(p, e); } return; }
    if (D && e.pointerId === D.id) { D.x = e.clientX; D.y = e.clientY; kick(); }
  });
  window.addEventListener('pointerup', e => {
    if (P && e.pointerId === P.id) { const p = P; P = null; clearTimeout(p.lp); if (locked()) return; if (p.kind === 'tray') tapTray(p.tray, e.clientX); else tapTile(p.t); return; }
    if (D && e.pointerId === D.id) { D.x = e.clientX; D.y = e.clientY; (D.grp ? groupFrame : dragFrame)(16); drop(false); }
  });
  window.addEventListener('pointercancel', e => { if (P && e.pointerId === P.id) { clearTimeout(P.lp); P = null; } if (D && e.pointerId === D.id) drop(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (D) drop(true); save(); } });
  window.addEventListener('pagehide', save);

  // ---------- taps ----------
  function tapTile(t) {
    if (t.where === 'board') {   // a tile placed this turn: a tap sends it back to the hand
      if (sel) { say('That square is taken.'); return; }
      if (t.g) { sendBack(t.g.tiles.filter(x => placed.includes(x))); moved(); say('The word went back to the scratch row.'); return; }
      placed.splice(placed.indexOf(t), 1); home(t); moved(); return;
    }
    const now = Date.now();
    if (lastTT.t === t && now - lastTT.at < 340) { lastTT = { t: null, at: 0 }; clearSel(); quickPlace(t); return; }
    lastTT = { t, at: now };
    if (sel === t) { clearSel(); evaluate(); return; }
    clearSel(); sel = t; t.el.classList.add('sel'); buzz(6); say('Tile selected. Tap a square, or a place in the rack.');
  }
  function quickPlace(t) {
    if (!placed.length) { say('Place the first tile, then double-tap tiles to add them after it.'); return; }
    let v = S.dir === 'v';
    if (placed.length > 1) { if (placed.every(x => x.r === placed[0].r)) v = false; else if (placed.every(x => x.c === placed[0].c)) v = true; }
    const dr = v ? 1 : 0, dc = v ? 0 : 1; let last = placed[0];
    placed.forEach(x => { if ((v ? x.r : x.c) > (v ? last.r : last.c)) last = x; });
    let r = last.r, c = last.c; do { r += dr; c += dc; } while (r < N && c < N && occ(r, c));
    if (r >= N || c >= N) { say('No room after the tiles on the board.'); return; }
    const tr = t.where; tr.items[tr.items.indexOf(t)] = null; placeOnBoard(t, r, c);
  }
  function tapTray(tray, x) {
    if (!sel) return; const t = sel, from = t.where, i = from.items.indexOf(t), j = slotAt(tray, x);
    from.items[i] = null; const a = arrange(tray.items, j);
    if (!a) { from.items[i] = t; say('The ' + tray.name + ' is full.'); return; }
    tray.items = a; clearSel(); intoTray(tray, t, j); layout(from); layout(tray); buzz(10); moved();
  }
  function tapBoard(e) {
    const q = cellAt(e.clientX, e.clientY); if (!q) return;
    if (sel && !locked()) {
      if (occ(q.r, q.c)) { say('That square is taken.'); return; }
      const t = sel, tr = t.where; tr.items[tr.items.indexOf(t)] = null; sel = null; placeOnBoard(t, q.r, q.c); return;
    }
    const now = Date.now(), dbl = now - lastTap.t < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30;
    lastTap = dbl ? { t: 0, x: 0, y: 0 } : { t: now, x: e.clientX, y: e.clientY };
    if (dbl) { if (view.s < fit * 1.3) zoomTo(q.r, q.c, fit * 2); else zoomFit(); }
  }

  // ---------- buttons ----------
  const close = id => $(id).classList.remove('on'), open = id => $(id).classList.add('on');
  function startNew() { newGame(); ['end', 'set', 'menu'].forEach(close); busy = !E.ready; view = { s: fit, x: 0, y: 0 }; refresh(); if (E.ready && G.turn === 1) computerTurn(); }
  $('bPlay').onclick = () => {
    if (locked() || G.turn !== 0 || !cur || D) return;
    const r = cur; commitMove(0, pcells(), r); msg = 'You played ' + r.words[0].w + ' for ' + r.total + '.'; buzz(20);
    if (r.bingo) { playSnd('bingo'); burst(); } else playSnd('play');
    zoomFit(); afterHuman();
  };
  $('bRecall').onclick = () => { if (locked() || D) return; recallAll(); zoomFit(); moved(); };
  $('bShuffle').onclick = () => { if (locked() || D) return; clearSel(); const ts = shuf(rack.items.filter(Boolean)); while (ts.length < rack.n) ts.push(null); rack.items = ts; layout(rack); saveSoon(); };
  $('bPass').onclick = () => { if (locked() || D) return; recallAll(); G.passes++; msg = 'You passed.'; zoomFit(); afterHuman(); };
  $('scClr').onclick = () => { if (locked() || D) return; clearSel(); scratchToRack(); moved(); };
  $('bFit').onclick = zoomFit;
  $('bDir').onclick = () => { S.dir = S.dir === 'v' ? 'h' : 'v'; applySettings(); saveSoon(); say('Words go ' + (S.dir === 'v' ? 'down.' : 'across.')); };
  function pasteLetters(txt) {   // pulls the tiles for these letters out of the hand, in order, into the scratch row
    const want = (txt || '').toUpperCase().replace(/[^A-Z]/g, ''); if (!want) { say('Nothing to paste.'); return; }
    clearSel(); scratchToRack(); let n = 0;
    for (const ch of want) {
      if (n >= scr.n) break;
      const i = rack.items.findIndex(t => t && t.ch === ch), j = i >= 0 ? i : rack.items.findIndex(t => t && t.ch === '?');
      if (j < 0) continue; const t = rack.items[j]; rack.items[j] = null; intoTray(scr, t, n++);
    }
    moved(); say(n === want.length ? 'Pasted ' + want + '.' : 'Pasted ' + n + ' of ' + want.length + ' letters: you do not hold the rest.');
  }
  $('scPaste').onclick = () => {
    if (locked() || D) return;
    const ask = () => { $('pasteIn').value = ''; open('paste'); try { $('pasteIn').focus(); } catch (e) {} };
    try { navigator.clipboard.readText().then(t => { if (t && /[a-z]/i.test(t)) pasteLetters(t); else ask(); }).catch(ask); } catch (e) { ask(); }
  };
  $('pasteOk').onclick = () => { close('paste'); pasteLetters($('pasteIn').value); };
  $('pasteCancel').onclick = () => close('paste');
  $('mSimStop').onclick = () => { close('menu'); stopSim(); };
  $('mSimPause').onclick = () => { if (!SIM) return; SIM.paused = !SIM.paused; $('mSimPause').textContent = SIM.paused ? 'Resume simulation' : 'Pause simulation'; close('menu'); if (!SIM.paused) simTick(); else say('Simulation paused.'); };
  let swapSel = new Set(), swapTiles = [];
  $('bSwap').onclick = () => {
    if (locked() || D) return; recallAll(); zoomFit(); moved();
    if (G.bag.length < C.rackSize) { say('Not enough tiles in the bag to swap.'); return; }
    swapSel = new Set(); swapTiles = hand(); const l = $('swapList'); l.innerHTML = '';
    swapTiles.forEach((t, i) => {
      const e = document.createElement('div'); e.className = 'tile' + (t.ch === '?' ? ' blank' : ''); e.innerHTML = '<span class="L">' + (t.ch === '?' ? '' : t.ch) + '</span><span class="P">' + (t.ch === '?' ? '' : C.values[t.ch]) + '</span>';
      e.onclick = () => { swapSel.has(i) ? swapSel.delete(i) : swapSel.add(i); e.classList.toggle('sel'); }; l.appendChild(e);
    });
    open('swap');
  };
  $('swapCancel').onclick = () => close('swap');
  $('swapGo').onclick = () => {
    close('swap'); if (!swapSel.size || locked()) return;
    const back = [];
    swapSel.forEach(i => { const t = swapTiles[i], tr = t.where; tr.items[tr.items.indexOf(t)] = null; t.el.remove(); back.push(t.ch); });
    refill(); G.bag.push(...back); shuf(G.bag); G.passes++;
    msg = 'You swapped ' + back.length + (back.length === 1 ? ' tile.' : ' tiles.'); afterHuman();
  };
  for (const ch of COLS) {
    const b = document.createElement('button'); b.textContent = ch;
    b.onclick = () => { if (Date.now() - pickAt < 350) return; close('pick'); const t = pickT; pickT = null; if (!t) return; t.as = ch; updTile(t); moved(); };
    $('letters').appendChild(b);
  }
  $('pickCancel').onclick = () => { if (Date.now() - pickAt < 350) return; close('pick'); const t = pickT; pickT = null; if (t && t.where === 'board') { placed.splice(placed.indexOf(t), 1); home(t); moved(); } };
  $('bagi').onclick = () => {
    if (!S.showBag || !G) return; const c = {}; G.bag.concat(G.crack.map(t => t.ch)).forEach(ch => { c[ch] = (c[ch] || 0) + 1; });
    $('bagGrid').innerHTML = [...COLS, '?'].map(ch => { const n = c[ch] || 0; return '<div class="bc' + (n ? '' : ' z') + '"><b>' + ch + '</b>' + n + '</div>'; }).join('');
    $('bagInfo').textContent = (G.bag.length + G.crack.length) + ' unseen: ' + G.bag.length + ' in the bag and ' + G.crack.length + ' on the computer rack. ? = blank.';
    open('bagv');
  };
  $('bagClose').onclick = () => close('bagv');
  $('bMenu').onclick = () => open('menu'); $('mClose').onclick = () => close('menu');
  let newArm = 0;
  $('mNew').onclick = () => {
    if (SIM) { close('menu'); stopSim(); return; }
    if (C.dev.confirmRestart && Date.now() - newArm > 4000) { newArm = Date.now(); $('mNew').textContent = 'Tap again to cancel this game'; return; }
    newArm = 0; $('mNew').textContent = 'Cancel game and restart'; startNew();
  };
  $('endNew').onclick = startNew; $('endClose').onclick = () => close('end');
  $('mStats').onclick = () => { close('menu'); showStats(); }; $('statClose').onclick = () => close('stats');
  let clearArm = 0;
  $('statClear').onclick = () => {   // two taps instead of a browser confirm box
    if (Date.now() - clearArm < 4000) { try { localStorage.removeItem(HK); } catch (e) {} clearArm = 0; $('statClear').textContent = 'Clear history'; showStats(); }
    else { clearArm = Date.now(); $('statClear').textContent = 'Tap again to clear all history'; }
  };
  function showStats() {
    const h = hist(), b = $('statBody');
    if (!h.length) { b.innerHTML = 'No finished games yet. Cancelled games are not counted.'; open('stats'); return; }
    const n = h.length, w = h.filter(g => g.you > g.comp).length, l = h.filter(g => g.you < g.comp).length, avg = k => Math.round(h.reduce((s, g) => s + g[k], 0) / n);
    const bi = [0, 1].map(k => h.reduce((s, g) => s + g.bingos[k], 0)), dt = t => new Date(t).toLocaleDateString();
    let bp = null; h.forEach(g => { if (g.best[0][1] && (!bp || g.best[0][1] > bp.pts)) bp = { pts: g.best[0][1], w: g.best[0][0], t: g.t }; });
    let html = '<table><tr><td>Games</td><td>' + n + ' (won ' + w + ', lost ' + l + ', drawn ' + (n - w - l) + ')</td></tr>' +
      '<tr><td>Average score</td><td>You ' + avg('you') + ', Computer ' + avg('comp') + '</td></tr><tr><td>Best game</td><td>' + Math.max(...h.map(g => g.you)) + '</td></tr>' +
      '<tr><td>Highest play</td><td>' + (bp ? bp.w + ' ' + bp.pts + ' (' + dt(bp.t) + ')' : '-') + '</td></tr>' +
      '<tr><td>Bingos</td><td>You ' + bi[0] + ', Computer ' + bi[1] + '</td></tr></table><table>';
    h.slice(-10).reverse().forEach(g => { html += '<tr><td>' + dt(g.t) + '</td><td>' + g.you + ' - ' + g.comp + '</td><td>' + (g.best[0][1] ? g.best[0][0] + ' ' + g.best[0][1] : '') + '</td></tr>'; });
    b.innerHTML = html + '</table>'; open('stats');
  }

  // ---------- settings ----------
  $('mSet').onclick = () => {
    close('menu');
    $('sTheme').value = S.theme; $('sMode').value = S.mode; $('sFirst').value = S.first; $('sLevel').value = S.level; $('sZoom').value = S.zoom;
    $('sRare').checked = S.noRare; $('hBal').checked = S.hBal; $('hDup').checked = S.hDup; $('hHard').checked = S.hHard; $('sBagOn').checked = S.showBag; $('sScr').checked = S.scratch; $('sHap').checked = S.hap;
    $('sLsz').value = S.lsz; $('sPsz').value = S.psz; $('sSym').value = S.sym; $('sSfx').checked = S.sfx; $('sMus').checked = S.music; $('sMot').checked = S.motion;
    $('sWl').value = S.wlift; $('vWl').textContent = S.wlift + ' px';
    $('sLift').value = S.lift; $('vLift').textContent = S.lift + ' px'; $('lScr').style.display = C.scratch === false ? 'none' : '';
    open('set');
  };
  $('sClose').onclick = () => close('set');
  $('sTheme').onchange = async e => { const id = e.target.value; if (await setTheme(id)) { S.theme = id; save(); } else e.target.value = S.theme; };
  $('sMode').onchange = e => { S.mode = e.target.value; save(); setTheme(S.theme); };
  [['sFirst', 'first'], ['sLevel', 'level']].forEach(([id, k]) => { $(id).onchange = e => { S[k] = e.target.value; save(); }; });
  $('sZoom').onchange = e => { S.zoom = +e.target.value; save(); };
  $('sWl').oninput = e => { S.wlift = +e.target.value; $('vWl').textContent = S.wlift + ' px'; saveSoon(); };
  $('sSym').onchange = e => { S.sym = e.target.value; save(); setTheme(S.theme); };
  $('sSfx').onchange = e => { S.sfx = e.target.checked; save(); if (S.sfx) { audio(); playSnd('drop'); } };
  $('sMus').onchange = e => { S.music = e.target.checked; save(); audio(); if (S.music) setTimeout(startMusic, 60); else stopMusic(); };
  $('sMot').onchange = e => { S.motion = e.target.checked; save(); particles(); dirty = true; kick(); };
  $('sLsz').onchange = e => { S.lsz = +e.target.value; applySettings(); save(); };
  $('sPsz').onchange = e => { S.psz = +e.target.value; applySettings(); save(); };
  $('sLift').oninput = e => { S.lift = +e.target.value; $('vLift').textContent = S.lift + ' px'; saveSoon(); };
  [['sRare', 'noRare'], ['hBal', 'hBal'], ['hDup', 'hDup'], ['hHard', 'hHard'], ['sBagOn', 'showBag'], ['sHap', 'hap']].forEach(([id, k]) => { $(id).onchange = e => { S[k] = e.target.checked; applySettings(); save(); }; });
  $('sScr').onchange = e => { S.scratch = e.target.checked; if (!scrOn()) scratchToRack(); relayout(); moved(); };
  $('sFile').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    const t = await f.text();
    try { await idb(s => s.put(t, 'dict')); } catch (x) { say('This device would not store the word list.'); close('set'); return; }
    close('set'); loadDict();
  };
  $('sBuiltin').onclick = async () => { try { await idb(s => s.delete('dict')); } catch (x) {} close('set'); loadDict(); };
  function applySettings() {
    $('bagi').classList.toggle('off', !S.showBag);
    document.body.style.setProperty('--lk', LKS[S.lsz] || .56); document.body.style.setProperty('--pk', PKS[S.psz] || .22);
    $('dA').classList.toggle('on', S.dir !== 'v'); $('dD').classList.toggle('on', S.dir === 'v'); dirty = true; kick();
  }
  if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'); const f = () => { if (S.mode === 'system' && TH.id) setTheme(S.theme, true); }; if (mq.addEventListener) mq.addEventListener('change', f); }
  window.addEventListener('resize', () => { relayout(); sizeFx(); particles(); });

  // ---------- start ----------
  async function start() {
    buildSlots(rack); buildSlots(scr); sizeFx();
    if (!restore()) newGame();
    applySettings(); relayout(); view = { s: fit, x: 0, y: 0 }; evaluate();
    if (!(await setTheme(S.theme, true))) { S.theme = 'classic'; await setTheme('classic', true); }
    requestAnimationFrame(relayout);
    fetch(BASE + 'themes/index.json').then(r => r.json()).catch(() => [{ id: 'classic', name: 'Classic' }]).then(l => {
      $('sTheme').innerHTML = l.map(t => '<option value="' + t.id + '">' + t.name + '</option>').join(''); $('sTheme').value = S.theme;
    });
    fetch(BASE + 'art/squares/index.json').then(r => r.json()).catch(() => []).then(l => {
      $('sSym').innerHTML = '<option value="theme">From the theme</option>' + l.map(t => '<option value="' + t.id + '">' + t.name + ' set</option>').join(''); $('sSym').value = S.sym;
    });
    loadDict();
    try { if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && C.sw !== false) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}
  }
  window.WG = { pickTile: (bag, tiles, left, f, L) => E.pickTile(C, bag, tiles, left, f, L), luckFlags: () => ({ dup: S.hDup, bal: S.hBal, hard: S.hHard }), startSim, stopSim,
    get sim() { return SIM; }, get G() { return G; }, get S() { return S; }, get placed() { return placed; }, rack, scr, TH, setTheme, startNew, get view() { return view; }, get fit() { return fit; }, get busy() { return busy; }, get D() { return D; } };
  start();
})();
