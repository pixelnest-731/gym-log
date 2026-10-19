// MUSCULARS: 電波がなくても開けるようにするためのキャッシュ
const CACHE = "musculars-2026-10-19b";
const CORE = ["./", "index.html", "manifest.json", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com\/firebasejs)\//;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = req.url;
  if (req.method !== "GET") return;
  const same = url.startsWith(self.location.origin);
  if (!same && !CDN.test(url)) return; // ログインやデータ同期の通信はそのまま通す
  if (same) {
    // アプリ本体はいつも最新を取りに行き、電波がない時だけ保存しておいた版を使う
    e.respondWith(fetch(req, { cache: "no-cache" }).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(req.mode === "navigate" ? "index.html" : req, c)); }
      return r;
    }).catch(() => caches.match(req.mode === "navigate" ? "index.html" : req).then(h => h || caches.match("index.html"))));
    return;
  }
  // フォントやライブラリは保存した版を使う
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(k => k.put(req, c)); } return r; })));
});
