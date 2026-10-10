/* Offline cache. Everything is cached on first load; later loads work without network. Updates arrive on the second open after a change. */
var V = "yoga-v1";
var CORE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "img/66e71a7a301389817a719a7a1b69b581.png", "img/33050b0659056343c1df75e96db790b1.png", "img/d23724797774057159cfdd8313440c07.png", "img/7251df41361609c665b8f793b62cf223.png", "img/2e635244bbe989b1a4cdeddf660b7e5d.png", "img/d0c4e0d896ff91d5ad2682db65bbc6ad.png", "img/35f2c99b619f6f3d99c475ccdbd2c7f2.png", "img/d8ddd404d4492eb958d355fcd10fd444.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || !/^https?:/.test(req.url)) return;
  var key = req.mode === "navigate" ? "index.html" : req;
  e.respondWith(caches.match(key, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && (res.ok || res.type === "opaque")) { var copy = res.clone(); caches.open(V).then(function (c) { c.put(key, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
