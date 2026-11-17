// Masterword service worker. Network first, so an update shows as soon as it is published; the saved copy is used when offline.
// Bump CACHE on every release.
const CACHE = 'masterword-v2';
const FILES = ['./', 'config.js', 'manifest.json', 'icon-192.png', 'icon-512.png',
  '../core/core.css', '../core/engine.js', '../core/game.js', '../core/dev.js', '../core/enable.txt', '../core/common.txt', '../core/bad.txt',
  '../art/logo-masterword.svg', '../art/bag.svg', '../art/ic-play.svg', '../art/ic-recall.svg', '../art/ic-shuffle.svg', '../art/ic-swap.svg',
  '../art/ic-pass.svg', '../art/ic-menu.svg', '../art/ic-zoomout.svg', '../art/ic-across.svg', '../art/ic-down.svg', '../art/ic-settings.svg', '../art/ic-stats.svg',
  '../themes/index.json', '../themes/classic/theme.json', '../themes/classic/tile.svg', '../themes/classic/rack.svg',
  '../themes/classic/tw.svg', '../themes/classic/dw.svg', '../themes/classic/tl.svg', '../themes/classic/dl.svg', '../themes/classic/st.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('masterword-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Every file the game asks for (including other theme packs) is saved as it is used, so the chosen theme also works offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).then(r => {
      if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
