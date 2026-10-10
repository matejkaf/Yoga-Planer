/* Offline cache. data/published.json is fetched network-first, everything else is served from the cache and refreshed in the background. */
var V = "yoga-v3";
var CORE = ["./", "index.html", "manifest.webmanifest", "data/published.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "img/2e635244bbe989b1a4cdeddf660b7e5d.png", "img/33050b0659056343c1df75e96db790b1.png", "img/35f2c99b619f6f3d99c475ccdbd2c7f2.png", "img/66e71a7a301389817a719a7a1b69b581.png", "img/7251df41361609c665b8f793b62cf223.png", "img/8251143a188ffb73c1a4f0768888f35b.png", "img/d0c4e0d896ff91d5ad2682db65bbc6ad.png", "img/d23724797774057159cfdd8313440c07.png", "img/d8ddd404d4492eb958d355fcd10fd444.png", "img/f18411c82842bcbdfb8de8084adc7cb4.png", "img/f85877f2824096a270f5df3a70fafffc.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
function tell() { self.clients.matchAll().then(function (cs) { cs.forEach(function (c) { c.postMessage({ type: "app-updated" }); }); }); }
function put(key, res) { if (res && (res.ok || res.type === "opaque")) { var copy = res.clone(); caches.open(V).then(function (c) { c.put(key, copy); }); } return res; }
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || !/^https?:/.test(req.url)) return;
  if (/\/data\/published\.json$/.test(new URL(req.url).pathname)) {
    e.respondWith(fetch(req).then(function (res) { return put("data/published.json", res); }).catch(function () { return caches.match("data/published.json"); }));
    return;
  }
  var key = req.mode === "navigate" ? "index.html" : req;
  e.respondWith(caches.match(key, { ignoreSearch: true }).then(function (hit) {
    var netReq = key === "index.html" ? new Request("index.html", { cache: "no-cache" }) : req;
    var net = fetch(netReq).then(function (res) {
      if (key === "index.html" && hit && res && res.ok) { var x = hit.headers.get("etag"), y = res.headers.get("etag"); if (x && y && x !== y) tell(); }
      return put(key, res);
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
