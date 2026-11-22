/* ── AppNest · Cloudflare Pages fix (Oct 2026) ──
   Cloudflare redirects *.html to clean URLs (/index.html -> /). Chrome refuses a
   "redirected" response that a Service Worker hands to a page load (ERR_FAILED).
   This strips the redirect flag from every response the SW fetches or reads from cache. */
(function(){
  var NB={101:1,204:1,205:1,304:1};
  function clean(r){
    if(!r||!r.redirected||NB[r.status])return r;
    return r.blob().then(function(b){return new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers});});
  }
  var _fetch=self.fetch.bind(self);
  self.fetch=function(input,init){
    if(input&&typeof input==='object'&&input.mode==='navigate')input=input.url;
    return _fetch(input,init).then(clean);
  };
  var cm=Cache.prototype.match;
  Cache.prototype.match=function(){return cm.apply(this,arguments).then(clean);};
  var sm=CacheStorage.prototype.match;
  CacheStorage.prototype.match=function(){return sm.apply(this,arguments).then(clean);};
})();

/* Sam the Smuggler — AppNest service worker (network-first shell) */
const VERSION = "samtrader-v11";
const CORE = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png",
  "./art/bm_bag.webp",
  "./art/bm_prices.webp",
  "./art/bm_route.webp",
  "./art/char_cop.webp",
  "./art/char_customs.webp",
  "./art/char_dealer.webp",
  "./art/char_gang.webp",
  "./art/char_hacker.webp",
  "./art/char_sam.webp",
  "./art/char_shark.webp",
  "./art/city_amsterdam.webp",
  "./art/city_bangkok.webp",
  "./art/city_bogota.webp",
  "./art/city_dubai.webp",
  "./art/city_kingston.webp",
  "./art/city_marrakech.webp",
  "./art/city_miami.webp",
  "./art/city_moscow.webp",
  "./art/city_telaviv.webp",
  "./art/city_tijuana.webp",
  "./art/end_broke.webp",
  "./art/end_win.webp",
  "./art/ev_customs.webp",
  "./art/ev_escape.webp",
  "./art/ev_fight_win.webp",
  "./art/ev_gang.webp",
  "./art/ev_lucky_cash.webp",
  "./art/ev_lucky_crate.webp",
  "./art/ev_police.webp",
  "./art/ev_quiet.webp",
  "./art/ev_storm.webp",
  "./art/good_candy.webp",
  "./art/good_diamond.webp",
  "./art/good_dust.webp",
  "./art/good_grass.webp",
  "./art/good_pills.webp",
  "./art/good_shrooms.webp",
  "./art/home_hero.webp",
  "./art/map_world.webp",
  "./art/prot_bribe.webp",
  "./art/prot_car.webp",
  "./art/prot_docs.webp",
  "./art/prot_guard.webp",
  "./art/rank_1.webp",
  "./art/rank_2.webp",
  "./art/rank_3.webp",
  "./art/rank_4.webp",
  "./art/rank_5.webp",
  "./art/veh_car.webp",
  "./art/veh_plane.webp",
  "./art/veh_ship.webp"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== VERSION).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // only handle same-origin app shell; everything else passes through untouched
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || (req.mode === "navigate" ? caches.match("./") : undefined)))
  );
});
