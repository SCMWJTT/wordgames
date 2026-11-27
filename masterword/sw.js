// Masterword service worker. Network first, so an update shows as soon as it is published; the saved copy is used when offline.
// Bump CACHE on every release.
const CACHE = 'masterword-v5';
const FILES = ['./', 'config.js', 'manifest.json', 'icon-192.png', 'icon-512.png',
  '../core/core.css', '../core/engine.js', '../core/game.js', '../core/dev.js', '../core/enable.txt', '../core/common.txt', '../core/bad.txt',
  '../art/logo-masterword.svg', '../art/bag.svg', '../art/ic-play.svg', '../art/ic-recall.svg', '../art/ic-shuffle.svg', '../art/ic-swap.svg',
  '../art/ic-pass.svg', '../art/ic-menu.svg', '../art/ic-zoomout.svg', '../art/ic-across.svg', '../art/ic-down.svg', '../art/ic-settings.svg', '../art/ic-stats.svg',
  '../themes/index.json', '../themes/classic/theme.json', '../themes/classic/tile.svg', '../themes/classic/rack.svg',
  '../art/squares/index.json', '../art/squares/standard/tw.svg', '../art/squares/standard/dw.svg', '../art/squares/standard/tl.svg',
  '../art/squares/standard/dl.svg', '../art/squares/standard/st.svg',
  '../art/sounds/pick.mp3', '../art/sounds/drop.mp3', '../art/sounds/bad.mp3', '../art/sounds/play.mp3', '../art/sounds/bingo.mp3',
  '../art/sounds/computer.mp3', '../art/sounds/win.mp3', '../art/music/calm.mp3'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('masterword-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Every file the game asks for (including other theme packs) is saved as it is used, so the chosen theme also works offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.headers.has('range') || /\.mp4$/i.test(new URL(e.request.url).pathname)) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
