/* Offline cache. index.html and data/published.json are fetched network-first (cache fallback), everything else is served from the cache and refreshed in the background. */
var V = "yoga-3c4797e407";
var CORE = ["./", "index.html", "manifest.webmanifest", "data/published.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "img/11d7934849e0bcc2c52c399759375f22.png", "img/1828ca8543f38f3f8dcfc046673d2e8f.png", "img/1add940426c195fd3701f7ffd7da9f74.png", "img/1d12f657296e9411d2d5daac28166f12.png", "img/223647ff325049532c2e466e79a74b67.png", "img/22ebb354efba2bce6ca6bbfb5af3a7f4.png", "img/231c6374fdd62f4daa98e3298912892d.png", "img/274089b06385094de17baf7784219a73.png", "img/2a56ec1dcf13cc1b0b37e9996a113b5c.png", "img/2e635244bbe989b1a4cdeddf660b7e5d.png", "img/33050b0659056343c1df75e96db790b1.png", "img/346416a1b76d107ae845a6e6972445cd.png", "img/34c8bead0c3603758201931e4e356130.png", "img/35f2c99b619f6f3d99c475ccdbd2c7f2.png", "img/462bc8eb960c42fecedb6db041ed44c4.png", "img/57a08de13148ba6a122af897c51e9fbf.png", "img/59c4b26dde59671e8fb3eeaa807e2c85.png", "img/6111fb0de6374fc0d65181387efc9242.png", "img/62ceb0fb20244d2c3e6e9099b887b80b.png", "img/653d86734bcfdc3fe957249d5d3dcf4e.png", "img/661109b0a7564f3de4aef02df9e57b73.png", "img/66e71a7a301389817a719a7a1b69b581.png", "img/69cae2c803619632c3e5475c09fe554b.png", "img/6a17ec9f7e9b0218f37ec19579d4e725.png", "img/6a90edb1a7fa275380f1ce7a9397547e.png", "img/7251df41361609c665b8f793b62cf223.png", "img/7299fde9fbe4cc102ad56fe87d1b266b.png", "img/72afb0a5fb63da9bc60f3c85a0e8bc34.png", "img/8251143a188ffb73c1a4f0768888f35b.png", "img/8fa56388c51d0c61c408054f7b2c0b13.png", "img/9013b6e043e7f5377ca52ee9e03956b8.png", "img/97712605e691c9440d376cd771e1e807.png", "img/9a44993691ce0e848cc8a1ac14515a7d.png", "img/a002d55c4d53b5514fd4de298a6db909.png", "img/a04a1de64333cb6b74569f5de196e8f3.png", "img/a75d15dffef77cb6e76378dc81e050d8.png", "img/a7af98808edcacf48575570b700e5f93.png", "img/a9128b28328bda9139feffd7c2436106.png", "img/aba4c8b1a67a39b654eb611b3d63af58.png", "img/ac90db694c79a548eb80e8c7ff40cf53.png", "img/adf9a209057a8ee1f844853abdc5ea2a.png", "img/c6b1048299b278afb3f018863860d493.png", "img/cb1d06eb4e8b329e446b366a21e55324.png", "img/cc5c53e1166c61239982cd5eaef1a57f.png", "img/cdb9e8d1108f5f309cc30c27b37a3df3.png", "img/cf8128270d7a628b6e353dd4bc40783b.png", "img/d0c4e0d896ff91d5ad2682db65bbc6ad.png", "img/d495d2574d4a8c091542ed935c7980af.png", "img/d8af76b2032dccf2eead2dc8d1153cb1.png", "img/d8ddd404d4492eb958d355fcd10fd444.png", "img/d9fbc856322747380ff6b90e7119d36e.png", "img/e2b8d08d151311620100a6a57a9f07e9.png", "img/e401462db829434b3afbdd30a377584c.png", "img/e4cb4e76f859f070124011a368d5a98a.png", "img/ec901cd51dc6ebff3b32d307a0059dbe.png", "img/eedf88e5960324c7bac039bb28ebcd8f.png", "img/f0a1ae2d320bfd59ecaf13f2bfb26a96.png", "img/f18411c82842bcbdfb8de8084adc7cb4.png", "img/f4d81a7406427f9fea551f5ad4d42733.png", "img/f59f1e2960b124bae97cc1724923fae8.png", "img/f85877f2824096a270f5df3a70fafffc.png", "img/fd14099728a919c334290b61d77bf3ae.png", "img/fd912fdda6cbe77ddd5f9693c78917ae.png", "img/ff6d22fd72fb62fb9ca4a0de11d0fba0.png"];
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
  if (key === "index.html" || /\/index\.html$/.test(new URL(req.url).pathname)) {
    var netFirst = new Promise(function (ok, no) {
      var t = setTimeout(no, 4000);
      fetch(new Request("index.html", { cache: "no-cache" })).then(function (res) { clearTimeout(t); if (res && res.ok) ok(put("index.html", res)); else no(); }, function () { clearTimeout(t); no(); });
    });
    e.respondWith(netFirst.catch(function () { return caches.match("index.html"); }));
    return;
  }
  e.respondWith(caches.match(key, { ignoreSearch: true }).then(function (hit) {
    var netReq = key === "index.html" ? new Request("index.html", { cache: "no-cache" }) : req;
    var net = fetch(netReq).then(function (res) {
      if (key === "index.html" && hit && res && res.ok) { var x = hit.headers.get("etag"), y = res.headers.get("etag"); if (x && y && x !== y) tell(); }
      return put(key, res);
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
