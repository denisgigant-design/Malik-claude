/* +15 each: LENIS 11-25, GSAP 11-25, CSS/JS 11-25 */
(() => {
  const $ = id => document.getElementById(id), S = window.SITE, G = window.gsap, MB = window.MB, L = window.lenis, body = document.body;
  const ids = ["hours", "book", "price"], AP = [0, ...ids.map(k => (S.panels[k][0] + S.panels[k][1]) / 2)], maxY = () => $("scroll").offsetHeight - innerHeight;
  const cur = () => { const p = scrollY / maxY(); return AP.reduce((b, x, k) => Math.abs(x - p) < Math.abs(AP[b] - p) ? k : b, 0); };
  const go = i => MB.go(AP[Math.max(0, Math.min(AP.length - 1, i))]);
  const low = /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent) || (navigator.hardwareConcurrency || 8) <= 4;
  const toast = t => { const e = $("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 1800); };
  const copy = async t => { try { await navigator.clipboard.writeText(t); toast("Copied"); } catch (e) { toast("Copy not allowed here"); } };
  const tag = (el, a) => document.head.append(Object.assign(document.createElement(el), a));

  /* ---------- LENIS 11-25 ---------- */
  if (L) {
    L.options.lerp = low ? .1 : .075; L.options.touchMultiplier = 1.4;                                                      // L18, L22
    tag("style", { textContent: "html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis-stopped{overflow:hidden}" }); // L14
    let tour = 0; const stop = () => { tour = 0; };                                                                           // L13 auto-tour, L21 cancel on touch/wheel
    const run = async () => { if (tour) { tour = 0; return toast("Tour stopped"); } tour = 1; toast("Auto-tour (T to stop)"); for (let i = 1; i < AP.length && tour; i++) { go(i); await new Promise(r => setTimeout(r, 4200)); } tour = 0; };
    addEventListener("wheel", e => { stop(); MB.pad = Math.abs(e.deltaY) < 50; }, { passive: true }); addEventListener("touchstart", stop, { passive: true });          // L19 trackpad detect
    addEventListener("keydown", e => { if (e.target.tagName === "BUTTON" || e.metaKey || e.ctrlKey) return; const k = e.key;
      if (k === " " || k === "PageDown") { e.preventDefault(); go(cur() + 1); } else if (k === "PageUp") { e.preventDefault(); go(cur() - 1); }                       // L11
      else if (k === "Home") go(0); else if (k === "End") go(AP.length - 1); else if (k === "t" || k === "T") run();
      else if (k === "Escape") { stop(); $("help").hidden = true; }                                                                                                     // L25
      else if (/^[1-4]$/.test(k)) go(+k - 1);                                                                                                                           // CJ25
      if (k === "Shift") MB.slow = true; });                                                                                                                            // L17 slow-mo
    addEventListener("keyup", e => { if (e.key === "Shift") MB.slow = false; });
    addEventListener("dblclick", e => { if (!e.target.closest("button,a,.panel")) go(cur() + 1); });                                                                    // L12
    $("brand").style.cursor = "pointer"; $("brand").onclick = () => go(0);                                                                                              // L16
    addEventListener("scroll", () => { sessionStorage.mbY = scrollY; });                                                                                                // L15 resume position
    new MutationObserver(() => { const y = +sessionStorage.mbY; if ($("loader").classList.contains("done") && y > 50) setTimeout(() => L.scrollTo(y, { immediate: true }), 300); }).observe($("loader"), { attributes: true });
    window.visualViewport && visualViewport.addEventListener("resize", () => L.resize());                                                                                // L23
    $("help").setAttribute("data-lenis-prevent", "");                                                                                                                   // L24
  }                                                                                                                                                                      // L20 'mb-arrive' event fires from MB.go in main.js

  /* ---------- GSAP 11-25 ---------- */
  if (G) {
    const tl2 = G.timeline({ paused: true, defaults: { ease: "none" } }).to("#brand", { letterSpacing: ".45em", duration: .08 }, 0);                                    // G22
    G.ticker.add(() => tl2.time(Math.min(1, scrollY / maxY())));
    new MutationObserver(ms => ms.forEach(m => { const el = m.target; if (!ids.includes(el.id) || !el.classList.contains("on") || (m.oldValue || "").includes(" on")) return;
      const h = el.querySelector("h2");
      if (h) { if (!h.dataset.s) { h.dataset.s = 1; h.innerHTML = [...h.textContent].map(c => `<span style="display:inline-block">${c === " " ? "&nbsp;" : c}</span>`).join(""); }
        G.fromTo(h.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: .03, duration: .5, delay: .1 }); }                                                      // G11
      if (el.id === "hours") { G.from(".day b", { y: 10, opacity: 0, stagger: .06, delay: .3 }); G.fromTo("#status", { scale: .6 }, { scale: 1, duration: .6, ease: "back.out(2.5)", delay: .2 }); } // G12 G13
      if (el.id === "book") { G.from(".steps b,.steps span", { x: -16, opacity: 0, stagger: .1, delay: .35 }); G.fromTo("#bookBtn", { y: 30 }, { y: 0, ease: "bounce.out", duration: .9, delay: .9 }); } // G14 G15
      if (el.id === "price") { G.from("#contact", { y: 12, opacity: 0, delay: 1.2 }); G.to(".pop", { rotate: 6, repeat: 5, yoyo: true, duration: .12, delay: 1.3 }); }          // G18 G17
    })).observe(body, { attributes: true, attributeFilter: ["class"], attributeOldValue: true, subtree: true });
    document.querySelectorAll(".prices li .row").forEach(r => { r.addEventListener("pointerenter", () => G.to(r, { x: 6, duration: .2 })); r.addEventListener("pointerleave", () => G.to(r, { x: 0, duration: .2 })); }); // G16
    G.to("#welcome b", { scale: 1.06, repeat: -1, yoyo: true, duration: 1.2, ease: "sine.inOut", delay: 1.8 });                                                           // G19
    $("welcome").addEventListener("click", () => { const s = document.createElement("span"); s.className = "ring"; s.style.animation = "none"; $("welcome").appendChild(s);   // G20
      G.fromTo(s, { scale: 1, opacity: .9 }, { scale: 3, opacity: 0, duration: .8, onComplete: () => s.remove() }); });
    addEventListener("mb-arrive", () => G.fromTo("#rail", { boxShadow: "0 0 0 0 rgba(255,59,78,.9)" }, { boxShadow: "0 0 14px 4px rgba(255,59,78,0)", duration: .9 })); // G21
    setTimeout(() => document.querySelectorAll("#dots span").forEach((s, i) => G.fromTo(s, { opacity: 0 }, { opacity: 1, delay: i * .12, duration: .3, yoyo: true, repeat: 1, repeatDelay: .8, clearProps: "opacity" })), 2500); // G23
    new MutationObserver(() => { if (body.classList.contains("end")) G.fromTo("#cta > *", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .4, clearProps: "all" }); }).observe(body, { attributes: true, attributeFilter: ["class"] }); // G24
    new MutationObserver(() => { if ($("toast").classList.contains("on")) G.fromTo("#toast", { y: 14 }, { y: 0, duration: .3 }); }).observe($("toast"), { attributes: true, attributeFilter: ["class"] }); // G25
  }

  /* ---------- CSS/JS 11-25 ---------- */
  const D = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], DS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], ORD = [1, 2, 3, 4, 5, 6, 0];
  const f = h => window.H24 ? String(h).padStart(2, "0") + ":00" : (h % 12 || 12) + (h < 12 ? "am" : "pm");
  tag("script", { type: "application/ld+json", textContent: JSON.stringify({ "@context": "https://schema.org", "@type": "BarberShop", name: S.name, telephone: S.phone, address: S.address,   // CJ11 SEO
    openingHoursSpecification: Object.entries(S.hours).filter(([, v]) => v).map(([d, v]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: D[d], opens: String(v[0]).padStart(2, "0") + ":00", closes: String(v[1]).padStart(2, "0") + ":00" })) }) });
  [["name", "description", `${S.name}: opening hours, booking and prices.`], ["name", "theme-color", "#0b0b0c"], ["name", "apple-mobile-web-app-capable", "yes"], ["name", "apple-mobile-web-app-title", S.name],
   ["property", "og:title", S.name], ["property", "og:description", `${S.name}: opening hours, booking and prices.`], ["property", "og:type", "website"]].forEach(([k, n, c]) => { const m = document.createElement("meta"); m.setAttribute(k, n); m.content = c; document.head.append(m); }); // CJ12
  $("fmt").onclick = () => { window.H24 = !window.H24; $("fmt").textContent = window.H24 ? "12h" : "24h"; MB.live && MB.live();                                                        // CJ15
    document.querySelectorAll(".day").forEach((d, i) => { const o = S.hours[ORD[i]]; d.querySelector("small").innerHTML = o ? f(o[0]) + "<br>" + f(o[1]) : "Closed"; }); };
  $("cpH").onclick = () => copy(S.name + " hours\n" + ORD.map((d, i) => { const o = S.hours[d]; return DS[i] + " " + (o ? f(o[0]) + "-" + f(o[1]) : "Closed"); }).join("\n"));                     // CJ24
  if (S.whatsapp) { const a = $("cWa"); a.href = "https://wa.me/" + String(S.whatsapp).replace(/\D/g, ""); a.target = "_blank"; a.hidden = false; }                                       // CJ16
  (S.socials || []).forEach(([n, u]) => $("cta").append(Object.assign(document.createElement("a"), { textContent: n, href: u, target: "_blank", rel: "noopener" })));                        // CJ23
  addEventListener("scroll", () => body.classList.toggle("moved", scrollY > 20), { passive: true });                                                                                       // CJ17 hint
  new MutationObserver(() => { $("pct").textContent = Math.round(parseFloat($("bar").style.width) || 0) + "%"; }).observe($("bar"), { attributes: true, attributeFilter: ["style"] });       // CJ18
  addEventListener("keydown", e => { if (e.key === "?") $("help").hidden = !$("help").hidden; });                                                                                         // CJ19
  addEventListener("online", () => toast("Back online")); addEventListener("offline", () => toast("You're offline"));                                                                      // CJ21
  document.addEventListener("click", e => { if (e.target.closest("#cta,#dots,#bookBtn") && navigator.vibrate) navigator.vibrate(10); }); addEventListener("mb-arrive", () => navigator.vibrate && navigator.vibrate(8)); // CJ22
})();                                                                                                                                                                                   // CJ13 noscript + CJ20 print CSS live in index.html / style.css
