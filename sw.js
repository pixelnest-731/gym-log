// MUSCULARS: 電波がなくても開けるようにするためのキャッシュ
const CACHE = "musculars-v1";
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
  if (req.mode === "navigate") {
    // ページ本体はまず最新を取りに行き、電波がなければ保存しておいた版を使う
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put("index.html", r.clone())); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // それ以外は保存した版をすぐ返しつつ、裏で新しい版に更新する
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
