(() => {
  const S = window.SITE, $ = id => document.getElementById(id);
  const vid = $("vid"), scrollEl = $("scroll");
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const fmt = h => (h % 12 || 12) + (h < 12 ? "am" : "pm");

  /* ---------- content ---------- */
  const now = () => { // current day/hour in the shop's timezone
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: S.timezone, weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { d: DAYS.findIndex(x => x === g("weekday")), h: +g("hour") % 24 + +g("minute") / 60 };
  };
  const n = now();
  $("week").innerHTML = [1,2,3,4,5,6,0].map(d => {
    const o = S.hours[d], h = o ? Math.round((o[1] - o[0]) / 12 * 100) : 4;
    return `<div class="day${d === n.d ? " today" : ""}" style="--h:${h}%"><div class="col"></div><b>${DAYS[d]}</b><small>${o ? fmt(o[0]) + "<br>" + fmt(o[1]) : "Closed"}</small></div>`;
  }).join("");
  const today = S.hours[n.d], open = today && n.h >= today[0] && n.h < today[1];
  $("status").classList.toggle("closed", !open);
  $("status").querySelector("span").textContent = open ? `Open now · until ${fmt(today[1])}` : "Closed right now";

  $("steps").innerHTML = S.steps.map((s, i) => `<li><em>${i + 1}</em><div><b>${s[0]}</b><span>${s[1]}</span></div></li>`).join("");
  $("bookBtn").href = S.bookingUrl;
  $("walk").textContent = S.walkIns ? "Walk-ins welcome too." : "";
  const max = Math.max(...S.services.map(s => s[2]));
  const ICONS = {
    scissors: '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M8 7.5 19 17M8 16.5 19 7"/></svg>',
    razor: '<svg viewBox="0 0 24 24"><path d="M6 3v12a3 3 0 0 0 6 0V3M6 7h6M4 21l5-6M9 21l5-6"/></svg>',
    beard: '<svg viewBox="0 0 24 24"><path d="M7 4h10l1 7c0 5-3.2 9-6 9-1 0-1-2-2-2s-1 2-2 2c-2.8 0-6-4-6-9z"/></svg>'
  };
  const svcIcon = n => /shave|razor/i.test(n) ? ICONS.razor : /beard/i.test(n) ? ICONS.beard : ICONS.scissors;
  $("prices").innerHTML = S.services.map((s, i) => `<li class="${s[3] ? "pop" : ""}" style="--d:${i * .08}s"><span class="sic">${svcIcon(s[0])}</span><div class="row"><b>${s[0]}</b><span class="p" data-v="${s[1]}">${S.currency}0</span></div><div class="time" style="--w:${s[2] / max * 100}%"><i></i></div><span class="mins">${s[2]} min${s[3] ? ' <i class="rb">Popular</i>' : ""}</span></li>`).join("");
  $("contact").textContent = `${S.address} · ${S.phone}`;

  /* ---------- video source (portrait -> mobile file) ---------- */
  let variant = null, dur = 10;
  const pick = () => innerWidth < 820 ? "mobile" : "desktop";  // width, not aspect: a narrow desktop window must still get the landscape video only below this breakpoint
  function load(v) {
    variant = v; const url = `${v}.mp4`;
    const E = window.EMBED; vid.poster = E ? E[v + "Poster"] : `${v}-poster.jpg`;
    const done = src => { vid.src = src; vid.load(); const fin = () => { dur = vid.duration || 10; $("bar").style.width = "100%"; $("loader").classList.add("done"); vid.play().then(() => vid.pause()).catch(() => {}); };
      vid.readyState > 1 ? fin() : vid.addEventListener("loadeddata", fin, { once: true }); };
    if (E) return fetch(E[v]).then(r => r.blob()).then(b => done(URL.createObjectURL(b))).catch(() => done(E[v]));
    fetch(url).then(async r => { // blob = instant seeking, real progress bar
      const total = +r.headers.get("content-length") || 0, rd = r.body.getReader(), parts = []; let got = 0;
      for (;;) { const { done: d, value } = await rd.read(); if (d) break; parts.push(value); got += value.length; if (total) $("bar").style.width = got / total * 100 + "%"; }
      done(URL.createObjectURL(new Blob(parts, { type: "video/mp4" })));
    }).catch(() => done(url)); // file:// fallback
  }
  load(pick());
  addEventListener("resize", () => { if (pick() !== variant && $("loader").classList.contains("done")) { $("loader").classList.remove("done"); load(pick()); } });

  /* ---------- scroll -> video time ---------- */
  const MB = window.MB = { go(p) { const y = p * (scrollEl.offsetHeight - innerHeight); window.lenis ? lenis.scrollTo(y, { duration: Math.min(2.4, .8 + Math.abs(y - scrollY) / innerHeight * .3), easing: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, onComplete: () => dispatchEvent(new Event("mb-arrive")) }) : scrollTo({ top: y, behavior: "smooth" }); } };
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = () => Math.min(1, Math.max(0, scrollY / (scrollEl.offsetHeight - innerHeight)));
  function timeAt(p) {
    const T = S.timeline[variant];
    for (let i = 1; i < T.length; i++) if (p <= T[i][0]) return lerp(T[i-1][1], T[i][1], (p - T[i-1][0]) / (T[i][0] - T[i-1][0]));
    return T[T.length - 1][1];
  }
  const els = { hours: $("hours"), book: $("book"), price: $("price") }, welcome = $("welcome");
  const ranges = S.panels, dotsEl = $("dots");
  const anchors = [["welcome", "Welcome"], ["hours", "Hours"], ["book", "Booking"], ["price", "Pricing"]];
  dotsEl.innerHTML = anchors.map(a => `<button data-k="${a[0]}" aria-label="${a[1]}"><span>${a[1]}</span></button>`).join("");
  dotsEl.onclick = e => { const k = e.target.closest("button")?.dataset.k; if (!k) return;
    const r = ranges[k], p = k === "welcome" ? 0 : (r[0] + r[1]) / 2;
    MB.go(p); };
  welcome.onclick = () => dotsEl.querySelector('[data-k="hours"]').click();

  let cur = 0, counted = false;
  function frame() {
    const p = prog(), target = timeAt(p);
    cur = lerp(cur, target, .5); // smoothing: video eases toward the scroll position
    MB.t = cur; if ((!window.THREE || MB.noGL) && !vid.seeking && vid.readyState > 1 && Math.abs(vid.currentTime - cur) > 1 / 48) vid.currentTime = Math.min(cur, dur - .01);
    // welcome bubble is "pulled" toward the couch as you scroll
    const w = Math.min(1, p / ranges.welcome[1]);
    welcome.style.transform = `translateY(${w * 18}vh) scale(${1 - w * .7})`;
    welcome.style.opacity = 1 - w; welcome.style.pointerEvents = w > .5 ? "none" : "auto";
    for (const k in els) els[k].classList.toggle("on", p >= ranges[k][0] && p <= ranges[k][1]);
    for (const b of dotsEl.children) { const r = ranges[b.dataset.k]; b.classList.toggle("on", p >= (b.dataset.k === "welcome" ? 0 : r[0]) && p <= r[1]); }
    const on = els.price.classList.contains("on");
    if (!window.gsap && on && !counted) { counted = true; document.querySelectorAll(".p").forEach(el => { const v = +el.dataset.v, t0 = performance.now();
      (function step(t) { const k = Math.min(1, (t - t0) / 900); el.textContent = S.currency + Math.round(v * k); if (k < 1) requestAnimationFrame(step); })(t0); }); }
    if (!on && p < ranges.price[0] - .05) counted = false; // replay count-up when scrolling back
  }
  window.MB.frame = frame;
})();
