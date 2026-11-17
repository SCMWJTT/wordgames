// Word games shared engine: dictionary, scoring, computer player, Help my luck draw. No screen code in this file.
// Used by every game (MiniWord, Masterword, Bigword). C = the game's CONFIG, board = grid of null or { ch, bl }.
(function () {
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', VOW = 'AEIOU';
  const E = { W: new Set(), COMMON: new Set(), BAD: new Set(), root: {}, ready: false, count: 0, own: false };

  function buildTrie(words) {
    const r = {};
    for (const w of words) { let n = r; for (let i = 0; i < w.length; i++) n = n[w[i]] || (n[w[i]] = {}); n.$ = 1; }
    return r;
  }
  // base = folder that holds enable.txt, common.txt and bad.txt. ownText = the player's own word list, or null.
  E.load = async function (base, ownText, maxLen) {
    E.ready = false; E.own = !!ownText;
    const [a, b, c] = await Promise.all([
      ownText ? ownText : fetch(base + 'enable.txt').then(r => { if (!r.ok) throw new Error('word list'); return r.text(); }),
      fetch(base + 'common.txt').then(r => r.ok ? r.text() : '').catch(() => ''),
      fetch(base + 'bad.txt').then(r => r.ok ? r.text() : '').catch(() => '')]);
    await new Promise(r => setTimeout(r, 30));
    const re = new RegExp('^[A-Z]{2,' + (maxLen || 15) + '}$');
    const words = a.split(/\s+/).map(w => w.toUpperCase()).filter(w => re.test(w));
    if (!words.length) throw new Error('empty word list');
    E.W = new Set(words); E.root = buildTrie(words); E.count = words.length;
    E.COMMON = new Set(b.toUpperCase().split(/\s+/)); E.BAD = new Set(c.toUpperCase().split(/\s+/));
    E.ready = true; return E.count;
  };

  // Scores the tiles in cs = [{ r, c, ch, bl }] placed on the board. Returns { err } or { words, total, bingo }.
  E.evalMove = function (C, board, cs) {
    const N = C.board.length, MID = N >> 1;
    const set = new Map(); cs.forEach(t => set.set(t.r * N + t.c, t));
    const rows = new Set(cs.map(t => t.r)), cols = new Set(cs.map(t => t.c));
    if (rows.size > 1 && cols.size > 1) return { err: 'Tiles must be in one line.' };
    const at = (r, c) => (r < 0 || c < 0 || r >= N || c >= N) ? null : (set.get(r * N + c) || board[r][c]);
    const line = (r, c, dr, dc) => {
      while (at(r - dr, c - dc)) { r -= dr; c -= dc; }
      const l = []; while (at(r, c)) { l.push([r, c]); r += dr; c += dc; } return l;
    };
    const lines = [];
    if (cs.length > 1) {
      const d = rows.size === 1 ? [0, 1] : [1, 0], main = line(cs[0].r, cs[0].c, d[0], d[1]);
      if (main.filter(p => set.has(p[0] * N + p[1])).length !== cs.length) return { err: 'No gaps allowed between tiles.' };
      lines.push(main);
      cs.forEach(t => { const x = line(t.r, t.c, d[1], d[0]); if (x.length > 1) lines.push(x); });
    } else {
      const h = line(cs[0].r, cs[0].c, 0, 1), v = line(cs[0].r, cs[0].c, 1, 0);
      if (h.length > 1) lines.push(h); if (v.length > 1) lines.push(v);
    }
    if (board.every(row => row.every(x => !x))) {
      if (!set.has(MID * N + MID)) return { err: 'The first word must cover the centre square.' };
      if (!lines.length) return { err: 'The first word needs two letters.' };
    } else if (!lines.some(l => l.some(p => !set.has(p[0] * N + p[1])))) return { err: 'The word must connect to the tiles on the board.' };
    let total = 0;
    const words = lines.map(l => {
      let pts = 0, wm = 1, w = '';
      l.forEach(([r, c]) => {
        const t = at(r, c); w += t.ch || '?'; let v = t.bl ? 0 : (C.values[t.ch] || 0);
        if (set.has(r * N + c)) {
          const k = C.board[r][c];
          if (k === 't') v *= 3; else if (k === 'd') v *= 2; else if (k === 'T') wm *= 3; else if (k === 'D' || k === '*') wm *= 2;
        }
        pts += v;
      });
      pts *= wm; total += pts;
      return { w, pts, ok: E.W.has(w), r: l[0][0], c: l[0][1] };
    });
    const bingo = cs.length === C.rackSize ? C.bingo : 0;
    return { words, total: total + bingo, bingo };
  };

  // Every legal placement for rack = [{ ch }] ('?' = blank). Returns a list of moves, each a list of { r, c, ch, bl }.
  E.genMoves = function (C, board, rack) {
    const N = C.board.length, MID = N >> 1, W = E.W, root = E.root;
    const cnt = {}; let blanks = 0;
    rack.forEach(t => { if (t.ch === '?') blanks++; else cnt[t.ch] = (cnt[t.ch] || 0) + 1; });
    const empty = board.every(row => row.every(x => !x)), out = [], lim0 = rack.length - 1;
    for (let o = 0; o < 2; o++) {
      const g = [];
      for (let r = 0; r < N; r++) { g[r] = []; for (let c = 0; c < N; c++) { const x = o ? board[c][r] : board[r][c]; g[r][c] = x ? x.ch : ''; } }
      const cache = {};
      const cc = (r, c) => {
        const k = r * N + c; if (k in cache) return cache[k];
        let u = '', d = '';
        for (let i = r - 1; i >= 0 && g[i][c]; i--) u = g[i][c] + u;
        for (let i = r + 1; i < N && g[i][c]; i++) d += g[i][c];
        let res = null; if (u || d) { res = {}; for (const X of ABC) if (W.has(u + X + d)) res[X] = 1; }
        return cache[k] = res;
      };
      const isA = (r, c) => !g[r][c] && (empty ? (r === MID && c === MID) :
        ((r > 0 && g[r - 1][c]) || (r < N - 1 && g[r + 1][c]) || (c > 0 && g[r][c - 1]) || (c < N - 1 && g[r][c + 1])));
      let pl = 0;
      const ext = (r, a, c, n, lt, rt) => {
        if (c >= N || !g[r][c]) {
          if (n.$ && c > a && pl + lt.length + rt.length >= 2) {
            const m = [];
            lt.forEach((t, i) => m.push(o ? { r: a - lt.length + i, c: r, ch: t.ch, bl: t.bl } : { r, c: a - lt.length + i, ch: t.ch, bl: t.bl }));
            rt.forEach(t => m.push(o ? { r: t.c, c: r, ch: t.ch, bl: t.bl } : { r, c: t.c, ch: t.ch, bl: t.bl }));
            out.push(m);
          }
          if (c >= N) return;
          const allow = cc(r, c);
          for (const ch in n) {
            if (ch === '$' || (allow && !allow[ch])) continue;
            if (cnt[ch] > 0) { cnt[ch]--; rt.push({ c, ch, bl: 0 }); ext(r, a, c + 1, n[ch], lt, rt); rt.pop(); cnt[ch]++; }
            if (blanks > 0) { blanks--; rt.push({ c, ch, bl: 1 }); ext(r, a, c + 1, n[ch], lt, rt); rt.pop(); blanks++; }
          }
        } else if (n[g[r][c]]) ext(r, a, c + 1, n[g[r][c]], lt, rt);
      };
      const left = (r, a, n, lt, lim) => {
        ext(r, a, a, n, lt, []);
        if (lim <= 0) return;
        for (const ch in n) {
          if (ch === '$') continue;
          if (cnt[ch] > 0) { cnt[ch]--; lt.push({ ch, bl: 0 }); left(r, a, n[ch], lt, lim - 1); lt.pop(); cnt[ch]++; }
          if (blanks > 0) { blanks--; lt.push({ ch, bl: 1 }); left(r, a, n[ch], lt, lim - 1); lt.pop(); blanks++; }
        }
      };
      for (let r = 0; r < N; r++) for (let a = 0; a < N; a++) {
        if (!isA(r, a)) continue;
        let prefix = '', p = a - 1; while (p >= 0 && g[r][p]) { prefix = g[r][p] + prefix; p--; }
        pl = prefix.length;
        if (prefix) { let n = root; for (const ch of prefix) n = n && n[ch]; if (n) ext(r, a, a, n, [], []); }
        else { let lim = 0; for (let c = a - 1; c >= 0 && !g[r][c] && !isA(r, c) && lim < lim0; c--) lim++; left(r, a, root, [], lim); }
      }
    }
    return out;
  };

  // Best-first list of legal moves; the level decides which one is taken. Returns { cs, r, n } or null.
  E.aiPick = function (C, board, rack, level, noRare) {
    let ms = E.genMoves(C, board, rack).map(m => ({ cs: m, r: E.evalMove(C, board, m) })).filter(x => !x.r.err && x.r.words.every(w => w.ok));
    if (noRare && E.COMMON.size > 1) ms = ms.filter(x => x.r.words.every(w => E.COMMON.has(w.w) && !E.BAD.has(w.w)));
    ms.sort((a, b) => b.r.total - a.r.total);
    if (!ms.length) return null;
    let k = 0;
    if (level === 'medium') k = Math.random() * Math.min(8, ms.length) | 0;
    else if (level === 'easy') k = (ms.length * .4 | 0) + (Math.random() * Math.ceil(ms.length * .6) | 0);
    const m = ms[Math.min(k, ms.length - 1)]; m.n = ms.length; return m;
  };

  // Help my luck: picks one tile for the player's rack. tiles = tiles already held, left = slots still to fill after this one,
  // f = { dup, bal, hard } switches, L = luck settings. Rules are relaxed in steps only if nothing fits.
  E.pickTile = function (C, bag, tiles, left, f, L, ex) {
    const T = C.tiers || {}, tier = ch => T[ch] || 2, isV = ch => VOW.includes(ch);
    const cnt = {}; bag.forEach(ch => { cnt[ch] = (cnt[ch] || 0) + 1; });
    let v = 0, b = 0, hard = 0, hasU = 0, high = 0; const have = {};
    tiles.forEach(t => {
      if (t.ch === '?') { b++; hasU = 1; return; }
      have[t.ch] = (have[t.ch] || 0) + 1;
      if (isV(t.ch)) v++;
      if ('JQXZV'.includes(t.ch)) hard++;
      if (t.ch === 'U') hasU = 1;
      if (tier(t.ch) >= 3) high++;
    });
    const on = f.dup || f.bal || f.hard;
    const pairs = Object.values(have).filter(x => x === 2).length;
    const extra = Math.random() * 100 < (L.pairChance || 0) ? 1 : 0;
    const ok = (ch, lv) => {
      if (ex && ex.includes(ch)) return false;
      if (lv >= 3 || ch === '?') return true;
      const h = have[ch] || 0;
      if (f.dup) { if (h >= 2) return false; if (h === 1 && pairs >= L.pairs + extra + (lv >= 2 ? 1 : 0)) return false; }
      if (f.hard && lv < 1) {
        if ('JQXZV'.includes(ch) && hard >= 1) return false;
        if (ch === 'Q' && !hasU) return false;
        if (tier(ch) >= 3 && high >= (L.maxHigh || 8)) return false;
      }
      if (f.bal && lv < 2) { const nv = v + (isV(ch) ? 1 : 0); if (nv > L.vmax || nv + b + left < L.vmin) return false; }
      return true;
    };
    for (let lv = 0; lv < 4; lv++) {
      const c = Object.keys(cnt).filter(ch => ok(ch, lv));
      if (!c.length) continue;
      let pool = c;
      if (f.bal && L.vowelPct > 0) {
        const need = L.vowelPct / 100 * C.rackSize - (v + .5 * b), p = Math.min(.95, Math.max(.05, need / (left + 1)));
        pool = Math.random() < p ? c.filter(isV) : c.filter(ch => !isV(ch));
        if (!pool.length) pool = c;
      }
      const w = ch => cnt[ch] * (on && ch !== '?' ? ((L.tierW || [])[tier(ch) - 1] ?? 1) : 1);
      const pw = pool.filter(ch => w(ch) > 0); if (pw.length) pool = pw;
      let x = Math.random() * pool.reduce((s, ch) => s + w(ch), 0);
      for (const ch of pool) { x -= w(ch); if (x < 0) return ch; }
      return pool[pool.length - 1];
    }
    return bag.find(ch => !(ex && ex.includes(ch))) ?? null;
  };

  window.WGE = E;
})();
