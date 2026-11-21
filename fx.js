/* 60 features, 10 per tech. Colours are never tinted: effects only brighten/blur/distort the video's own colours.
 LENIS : 1 inertia  2 eased glides(main.js)  3 magnetic anchors  4 velocity tilt  5 direction flag  6 hold resistance  7 intro lock  8 scroll nudge  9 #hash deep-links  10 reduced-motion
 GSAP  : 1 stagger-in  2 bars/steps/count-up  3 bubble magnet  4 intro pop  5 dot squish  6 exit tweens  7 button squish  8 time-bar fill  9 status breathing  10 scrubbed master timeline
 THREE : 1 parallax  2 dust  3 adaptive res  4 gyro parallax  5 bokeh layer  6 handheld sway  7 dolly punch  8 letterbox bars  9 dust dodges pointer  10 dust swells at anchors
 WEBGL : 1 context recovery  2 idle/hidden throttle  3 quality tiers  4 texture pre-warm  5 lean buffers  6 precision fallback  7 stats overlay [F]  8 offscreen pause  9 screenshot [P]  10 visualViewport resize
 GLSL  : 1 lens  2 reflection sweeps  3 chromatic split  4 tap ripple  5 film grain  6 vignette  7 highlight bloom  8 speed blur  9 sharpen  10 intro iris
 CSS/JS: 1 frosted glass  2 progress rail  3 live countdown+arrow keys  4 a11y  5 copy+toast  6 call/directions  7 live title+favicon  8 chapters  9 rewind badge  10 end CTA+share */
(() => {
  const $ = id => document.getElementById(id), S = window.SITE, DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], G = window.gsap;
  const vid = $("vid"), stage = $("stage"), scrollEl = $("scroll"), body = document.body, MB = window.MB;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), maxY = () => scrollEl.offsetHeight - innerHeight;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ids = ["hours", "book", "price"], DIR = { hours: 0, book: -1, price: 1 }, U = { sweep: 1, dir: 0, intro: G ? 0 : 1, e: 0 };
  const AP = [0, ...ids.map(k => (S.panels[k][0] + S.panels[k][1]) / 2)];
  if (G) { body.classList.add("gsap"); G.ticker.lagSmoothing(0); }

  /* ---- LENIS ---- */
  const lenis = window.Lenis ? (window.lenis = new Lenis({ lerp: reduce ? 1 : .075, wheelMultiplier: .9, autoRaf: false })) : null; // L1, L10
  if (lenis) lenis.stop();                                                                                          // L7 locked until loader is done
  const inHold = p => ids.some(k => p > S.panels[k][0] + .03 && p < S.panels[k][1] - .03);
  let rest = 0, snapped = false, ready = false;
  const magnet = dt => { if (!lenis) return;                                                                         // L3
    if (lenis.isScrolling || Math.abs(lenis.velocity) > .05) { rest = 0; snapped = false; return; }
    rest += dt; if (rest < 700 || snapped) return; snapped = true;
    const p = scrollY / maxY(), a = AP.slice(1).reduce((b, x) => Math.abs(x - p) < Math.abs(b - p) ? x : b);
    if (Math.abs(a - p) < .035 && Math.abs(a - p) > .002) MB.go(a); };
  new MutationObserver(() => { if (ready || !$("loader").classList.contains("done")) return; ready = true; lenis && lenis.start();
    const k = location.hash.slice(1); if (ids.includes(k)) setTimeout(() => MB.go(AP[ids.indexOf(k) + 1]), 400);                  // L9 deep-link
    if (lenis && !reduce) setTimeout(() => { if (scrollY < 5) { lenis.scrollTo(innerHeight * .08, { duration: .9 }); setTimeout(() => scrollY < innerHeight * .2 && lenis.scrollTo(0, { duration: .9 }), 1100); } }, 6000); // L8 nudge
  }).observe($("loader"), { attributes: true });

  /* ---- GSAP ---- */
  let tl;
  if (G) {
    new MutationObserver(ms => ms.forEach(m => { const el = m.target; if (!(el.id in DIR)) return;
      const on = el.classList.contains("on"); if (on === (m.oldValue || "").includes(" on")) return;
      if (!on) { G.to(el.children, { y: -14, opacity: 0, duration: .25, stagger: .03, overwrite: true }); return; }          // G6 exit
      history.replaceState(null, "", "#" + el.id);
      G.fromTo(el.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .09, ease: "back.out(1.4)", overwrite: true }); // G1
      if (el.id === "hours") G.fromTo(".day .col", { height: 0 }, { height: i => el.querySelectorAll(".day")[i].style.getPropertyValue("--h"), duration: 1.1, stagger: .07, ease: "elastic.out(1,.6)" }); // G2
      if (el.id === "book") G.fromTo(".steps em", { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, stagger: .3, duration: .6, ease: "back.out(2)" });
      if (el.id === "price") { const bars = el.querySelectorAll(".time");
        G.fromTo(".time i", { width: 0 }, { width: i => bars[i].style.getPropertyValue("--w"), duration: 1, delay: .4, stagger: .08, ease: "power3.out" }); // G8
        el.querySelectorAll(".p").forEach((p, i) => { const o = { v: 0 }; p.textContent = S.currency + 0;
          G.to(o, { v: +p.dataset.v, duration: 1, delay: .3 + i * .08, ease: "power2.out", snap: { v: 1 }, onUpdate: () => p.textContent = S.currency + o.v }); }); }
      U.dir = DIR[el.id]; U.sweep = 0; G.to(U, { sweep: 1, duration: 1.6, ease: "power2.inOut", overwrite: true });
    })).observe(body, { attributes: true, attributeFilter: ["class"], attributeOldValue: true, subtree: true });
    const wb = document.querySelector("#welcome b"), ws = document.querySelector("#welcome small"), wl = $("welcome");
    G.to(ws, { y: 4, repeat: -1, yoyo: true, duration: 1.1, ease: "sine.inOut" });                                         // G3 float + magnet
    const qx = G.quickTo(wb, "x", { duration: .5, ease: "power3" }), qy = G.quickTo(wb, "y", { duration: .5, ease: "power3" });
    addEventListener("pointermove", e => { const r = wl.getBoundingClientRect(), c = v => clamp(v * .08, -12, 12); qx(c(e.clientX - r.left - r.width / 2)); qy(c(e.clientY - r.top - r.height / 2)); });
    G.from("#welcome b,#welcome small", { scale: 0, opacity: 0, stagger: .15, delay: .3, duration: .8, ease: "back.out(2)" }); // G4 intro pop
    document.querySelectorAll("#dots button").forEach(b => { b.addEventListener("pointerenter", () => G.to(b, { scale: 1.5, duration: .2 })); // G5
      b.addEventListener("pointerleave", () => G.to(b, { scale: 1, duration: .2 })); b.addEventListener("click", () => G.fromTo(b, { scale: 1.9 }, { scale: 1, duration: .8, ease: "elastic.out(1,.4)" })); });
    const bt = $("bookBtn"); bt.addEventListener("pointerenter", () => G.to(bt, { scale: 1.04, duration: .2 }));           // G7
    bt.addEventListener("pointerleave", () => G.to(bt, { scale: 1, duration: .2 })); bt.addEventListener("pointerdown", () => G.to(bt, { scale: .95, duration: .1 })); bt.addEventListener("pointerup", () => G.to(bt, { scale: 1.04, duration: .2 }));
    G.to("#status i", { scale: 1.5, repeat: -1, yoyo: true, duration: .8, ease: "sine.inOut" });                           // G9
    tl = G.timeline({ paused: true, defaults: { ease: "none" } }).to("#brand", { opacity: 0, y: -12, duration: .08 }, 0)    // G10 scrubbed by scroll
      .fromTo("#dots", { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: .06 }, .06);
  }

  /* ---- CSS/JS ---- */
  const fmt = h => window.H24 ? String(h).padStart(2, "0") + ":00" : (h % 12 || 12) + (h < 12 ? "am" : "pm"), hm = m => { m = Math.round(m); const h = Math.floor(m / 60); return (h ? h + "h " : "") + m % 60 + "m"; };
  const ico = document.head.querySelector("link[rel=icon]") || document.head.appendChild(Object.assign(document.createElement("link"), { rel: "icon" }));
  const live = () => { const p = new Intl.DateTimeFormat("en-GB", { timeZone: S.timezone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value, d = DAYS.indexOf(g("weekday")), h = +g("hour") % 24 + +g("minute") / 60, ds = g("year") + "-" + g("month") + "-" + g("day"), t = S.special && ds in S.special ? S.special[ds] : S.hours[d]; let s;
    if (t && h >= t[0] && h < t[1]) s = "Open now · closes in " + hm((t[1] - h) * 60);                                      // CJ3
    else if (t && h < t[0]) s = "Closed · opens in " + hm((t[0] - h) * 60);
    else { s = "Closed"; for (let i = 1; i <= 7; i++) { const n = (d + i) % 7; if (S.hours[n]) { s = "Closed · opens " + DAYS[n] + " " + fmt(S.hours[n][0]); break; } } }
    const open = s.startsWith("Open"); $("status").classList.toggle("closed", !open); $("status").querySelector("span").textContent = s;
    document.title = (open ? "🟢 Open" : "🔴 Closed") + " · " + S.name;                                                      // CJ7
    ico.href = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text y=".9em" font-size="9">${open ? "💈" : "🌙"}</text></svg>`); };
  MB.live = live; live(); setInterval(live, 30000); $("status").setAttribute("aria-live", "polite");                                       // CJ4 a11y
  const toast = t => { const e = $("toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 1800); };
  const copy = async t => { try { await navigator.clipboard.writeText(t); toast("Copied"); } catch (e) { toast("Copy not allowed here"); } };  // CJ5
  $("contact").style.cursor = "copy"; $("contact").onclick = () => copy(S.address + " · " + S.phone);
  $("cBook").href = S.bookingUrl; $("cCall").href = "tel:" + S.phone.replace(/[^+\d]/g, "");                               // CJ6
  $("cMap").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.name + " " + S.address);
  $("cCopy").onclick = () => copy(S.name + ", " + S.address + ", " + S.phone); $("cTop").onclick = () => MB.go(0);
  $("cShare").onclick = () => navigator.share ? navigator.share({ title: S.name, url: location.href.split("#")[0] }).catch(() => {}) : copy(location.href.split("#")[0]); // CJ10
  addEventListener("keydown", e => { if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; const p = scrollY / maxY();
    const i = AP.reduce((b, x, k) => Math.abs(x - p) < Math.abs(AP[b] - p) ? k : b, 0); MB.go(AP[clamp(i + (e.key === "ArrowRight" ? 1 : -1), 0, AP.length - 1)]); });
  let ch = -1; const CH = ["01  Welcome", "02  Opening hours", "03  Booking", "04  Pricing"];

  /* ---- one clock: Lenis -> scroll->video -> WebGL ---- */
  let render = () => {}, last = 0, tex, shot = false;
  const tick = ms => { const dt = ms - last; last = ms; lenis && lenis.raf(ms); MB.frame();
    const p = clamp(scrollY / maxY(), 0, 1); stage.style.setProperty("--p", p.toFixed(4));                                    // CJ2 rail
    if (lenis) { const v = lenis.velocity; stage.style.setProperty("--v", clamp(v / 40, -1, 1).toFixed(3));                  // L4 tilt
      body.dataset.dir = Math.abs(v) > .5 ? (lenis.direction > 0 ? "down" : "up") : ""; lenis.options.wheelMultiplier = (inHold(p) ? .45 : .9) * (MB.slow ? .35 : 1) * (MB.pad ? 1.25 : 1); } // L5, L6, CJ9
    body.classList.toggle("end", p > .94);
    const c = p < S.panels.hours[0] - .03 ? 0 : p < S.panels.book[0] - .02 ? 1 : p < S.panels.price[0] - .02 ? 2 : 3;      // CJ8 chapters
    if (c !== ch) { ch = c; $("chapter").textContent = CH[c]; G && G.fromTo("#chapter", { y: 8, opacity: 0 }, { y: 0, opacity: .9, duration: .4 }); }
    tl && tl.time(p); magnet(dt); render(ms, dt, p); };
  G ? G.ticker.add(t => tick(t * 1000)) : (function l(t) { tick(t); requestAnimationFrame(l); })(0);


  /* ---- THREE / WEBGL / GLSL. Water effects (lens, ripple, shimmer) REMOVED. Smoothness: two videos hold frame N and N+1, the shader blends them (sub-frame interpolation) ---- */
  if (!window.THREE) { MB.noGL = true; return; }
  const low = /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent) || (navigator.hardwareConcurrency || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData); // W3 W16
  let R; try { R = new THREE.WebGLRenderer({ antialias: false, depth: false, stencil: false, alpha: false, powerPreference: "high-performance" }); } catch (e) { MB.noGL = true; return; } // W5
  const PREC = R.capabilities.getMaxPrecision("highp"), gl = R.getContext(), dbg = gl.getExtension("WEBGL_debug_renderer_info");                                         // W6
  const GPU = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).slice(0, 38) : "gpu";                                                                            // W22
  R.toneMapping = THREE.NoToneMapping; R.outputColorSpace = THREE.LinearSRGBColorSpace; R.setClearColor(0);                                                               // T22 colours untouched
  let maxDpr = Math.min(devicePixelRatio, 2), dpr = maxDpr, lost = false, on = false, vis = true, introDone = false, dead = false, dip = false;
  const fail = () => { dead = true; MB.noGL = true; body.classList.remove("gl"); }; R.debug.onShaderError = fail;                                                        // W13
  R.domElement.id = "gl"; stage.insertBefore(R.domElement, vid.nextSibling);
  R.domElement.addEventListener("webglcontextlost", e => { e.preventDefault(); lost = true; body.classList.remove("gl"); on = false; });                                  // W1
  R.domElement.addEventListener("webglcontextrestored", () => { lost = false; tx.forEach(t => t.needsUpdate = true); });
  new IntersectionObserver(e => vis = e[0].isIntersecting).observe(stage);                                                                                                // W8
  if (G) document.addEventListener("visibilitychange", () => document.hidden ? G.ticker.sleep() : G.ticker.wake());                                                        // W25
  const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10); cam.position.z = 1;
  /* smooth engine: two decoders */
  const vid2 = Object.assign(document.createElement("video"), { muted: true, playsInline: true, preload: "auto" });
  vid2.style.cssText = "position:absolute;width:2px;height:2px;opacity:0;pointer-events:none"; stage.appendChild(vid2);
  const vids = [vid, vid2], FPS = 24; let fi = [-1, -1], NF = 240;
  const prime = () => { if (!vid.src) return; if (vid2.src !== vid.src) { vid2.src = vid.src; vid2.load(); vid2.addEventListener("loadeddata", () => vid2.play().then(() => vid2.pause()).catch(() => {}), { once: true }); }
    NF = Math.round((vid.duration || 10) * FPS); fi = [-1, -1]; };
  vid.addEventListener("loadeddata", prime); prime();
  const tx = vids.map(v => { const t = new THREE.VideoTexture(v); t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.flipY = true; t.premultiplyAlpha = false; return t; }); // W11
  vids.forEach((v, i) => v.addEventListener("seeked", () => tx[i].needsUpdate = true));                                                                                   // W24 upload only when a frame landed
  const u = { tA: { value: null }, tB: { value: null }, uF: { value: 0 }, uTx: { value: new THREE.Vector2(1 / 1280, 1 / 720) }, uT: { value: 0 }, uVel: { value: 0 }, uA: { value: 1 }, uVA: { value: 1.78 },
    uSweep: { value: 1 }, uDir: { value: 0 }, uLow: { value: low ? 1 : 0 }, uI: { value: 0 }, uFoc: { value: 0 }, uSide: { value: 0 }, uEnd: { value: 0 }, uEx: { value: 1 }, uM: { value: new THREE.Vector2(.5, .5) } };
  const frames = t => { const f = clamp(t * FPS, 0, NF - 1.001), n = Math.floor(f), m = Math.min(n + 1, NF - 1); let a = fi.indexOf(n), b = m === n ? a : fi.indexOf(m);
    if (a < 0 && b < 0) { a = 0; b = m === n ? 0 : 1; } else if (a < 0) a = 1 - b; else if (b < 0) b = 1 - a;
    if (fi[a] !== n) { fi[a] = n; vids[a].currentTime = (n + .5) / FPS; } if (fi[b] !== m) { fi[b] = m; vids[b].currentTime = (m + .5) / FPS; }
    u.tA.value = tx[a]; u.tB.value = tx[b]; u.uF.value = m === n ? 0 : f - n; };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: u, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}", fragmentShader: `
    precision ${PREC} float;varying vec2 v;uniform sampler2D tA,tB;uniform float uF,uA,uVA;
    void main(){ vec2 uv=v; if(uA>uVA) uv.y=(v.y-.5)*(uVA/uA)+.5; else uv.x=(v.x-.5)*(uA/uVA)+.5;
      gl_FragColor=vec4(mix(texture2D(tA,uv).rgb,texture2D(tB,uv).rgb,uF),1.);}` }));
  quad.scale.setScalar(1); sc.add(quad);
  const uE = { value: 0 }, pr = { value: dpr }, ud = { value: 0 }, wind = { value: 0 };
  const mkDust = (N, s0, s1, alpha, speed, depth) => { const pos = new Float32Array(N * 3), sz = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos.set([Math.random() * 2 - 1, Math.random() * 2 - 1, 0], i * 3); sz[i] = s0 + Math.random() * (s1 - s0); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aS", new THREE.BufferAttribute(sz, 1));
    const m = new THREE.Points(g, new THREE.ShaderMaterial({ transparent: true, depthTest: false, blending: THREE.AdditiveBlending,
      uniforms: { uT: u.uT, uVel: ud, uPR: pr, uM: u.uM, uE, uIn: u.uI, uW: wind, uA: { value: alpha }, uS: { value: speed } },
      vertexShader: `attribute float aS;uniform float uT,uVel,uPR,uS,uW;uniform vec2 uM;void main(){vec3 p=position;
        p.y=mod(p.y+1.+uT*uS*aS+uVel*3.*aS,2.)-1.;p.x=mod(p.x+1.+uW*aS,2.)-1.+sin(uT*.3+aS*6.)*.03;
        vec2 dd=p.xy-(uM*2.-1.);p.xy+=normalize(dd+1e-4)*(1.-smoothstep(0.,.35,length(dd)))*.1;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=aS*3.*uPR;}`,
      fragmentShader: "uniform float uA,uE,uIn;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(1.),(1.-smoothstep(0.,.5,d))*uA*(1.+uE*1.5)*uIn);}" }));
    m.frustumCulled = false; m.renderOrder = 1; m.visible = false; m.userData.d = depth; sc.add(m); return m; };
  const L = [mkDust(low ? 40 : 110, .5, 1.5, .25, .02, .05), mkDust(low ? 6 : 16, 3, 6, .07, .035, .1), mkDust(low ? 10 : 30, .3, .7, .12, .008, .02)]; // THREE2, 5, 11 layers
  const barM = new THREE.MeshBasicMaterial({ color: 0, depthTest: false });
  const bars = [1, -1].map(s => { const b = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), barM); b.renderOrder = 3; b.userData.s = s; sc.add(b); return b; });
  const tgt = new THREE.Vector2(.5, .5); let act = 0, kick = 0;
  const pt = e => { const p = e.touches ? e.touches[0] : e, x = p.clientX / innerWidth, y = 1 - p.clientY / innerHeight; kick = Math.min(1, kick + Math.hypot(x - tgt.x, y - tgt.y) * 3); tgt.set(x, y); act = performance.now(); };
  addEventListener("pointermove", pt); addEventListener("touchmove", pt, { passive: true });
  addEventListener("deviceorientation", e => { if (e.gamma == null || performance.now() - act < 3000) return; tgt.set(.5 + clamp(e.gamma / 90, -1, 1) * .3, .5 - clamp(((e.beta || 45) - 45) / 90, -1, 1) * .3); }); // THREE4
  const size = () => { maxDpr = Math.min(devicePixelRatio, 2); dpr = Math.min(dpr, maxDpr); const r = dpr * (dip ? .75 : 1);                                // W17, W20
    R.setPixelRatio(r); pr.value = r; R.setSize(stage.clientWidth, stage.clientHeight); u.uA.value = stage.clientWidth / stage.clientHeight; };
  size(); addEventListener("resize", size); window.visualViewport && visualViewport.addEventListener("resize", size);                                                      // W10
  addEventListener("keydown", e => { const k = e.key.toLowerCase(); if (k === "f") $("stats").classList.toggle("on"); if (k === "p") shot = true; if (k === "q") { u.uLow.value = 1 - u.uLow.value; toast(u.uLow.value ? "Lite mode" : "Full effects"); } }); // W7 W9 W21
  navigator.getBattery && navigator.getBattery().then(b => { if (b.level < .15 && !b.charging) u.uLow.value = 1; }).catch(() => {});                                       // W15
  addEventListener("pagehide", () => { sc.traverse(o => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); }); tx.forEach(t => t.dispose()); R.dispose(); });   // T21
  const clock = new THREE.Clock(), MU = THREE.MathUtils; let lastY = scrollY, vel = 0, fc = 0, acc = 0, n = 0, fps = 60, arr = -9e3, wnd = 0, pan = 0;
  addEventListener("mb-arrive", () => arr = performance.now());                                                                                                              // T19
  render = (ms, dt, p) => {
    if (dead || document.hidden || lost || !vis || vid.readyState < 2 || vid2.readyState < 2) return;
    if (!on) { if (Math.max(vid.videoWidth, vid.videoHeight) > R.capabilities.maxTextureSize) return fail();                                                                 // W12
      frames(MB.t || 0); R.compile(sc, cam); if (dead) return;                                                                                                               // W19 pre-warm
      on = true; body.classList.add("gl"); if (!introDone) { introDone = true; G ? G.to(U, { intro: 1, duration: 2.2, ease: "power2.out" }) : (U.intro = 1); } }
    if (ms - act > 2000 && Math.abs(vel) < .002 && (fc++ & 1)) return;                                                                                                        // W2
    const s = Math.min(dt, 50) / 1000; acc += dt; fps += (1000 / Math.max(dt, 1) - fps) * .1;
    if (++n >= 40) { const a = acc / n; if (a > 24 && dpr > 1.01) { dpr = Math.max(1, dpr - .25); size(); } else if (a < 15 && dpr < maxDpr) { dpr = Math.min(maxDpr, dpr + .1); size(); }
      if (a > 32 && dpr <= .61) u.uLow.value = 1; acc = n = 0; }                                                                                                              // T3, W14
    const fast = false; if (fast !== dip) { dip = fast; size(); }                                                                                              // W20
    frames(MB.t || 0);
    u.uVA.value = vid.videoWidth / vid.videoHeight; u.uTx.value.set(1 / vid.videoWidth, 1 / vid.videoHeight);
    vel = MU.damp(vel, (scrollY - lastY) / innerHeight, 10, s); lastY = scrollY;                                                                                               // T17
    u.uVel.value = clamp(vel, -.08, .08); u.uT.value = clock.getElapsedTime();                                                                                                 // T23
    if (ms - act > 20000) tgt.set(.5 + Math.sin(ms * .0003) * .15, .5 + Math.cos(ms * .0004) * .1);                                                                            // T20 attract mode
    const m = u.uM.value; m.x = MU.damp(m.x, tgt.x, 6, s); m.y = MU.damp(m.y, tgt.y, 6, s);                                                                                  // T16
    kick = MU.damp(kick, 0, 3, s); ud.value = u.uVel.value + kick * .05; wnd += (tgt.x - .5) * s * .05; wind.value = wnd;                                                      // T18, T25
    quad.scale.setScalar(1);                                                                                             // T13, T7
    quad.rotation.z = 0; quad.position.set(0, 0, 0);                                                                          // T15, T1
    L.forEach(l => l.position.set(-(m.x - .5) * l.userData.d, -(m.y - .5) * l.userData.d, 0));                                                                                 // T12
    if (false) cam.position.set(Math.sin(clock.elapsedTime * .6) * .004, Math.cos(clock.elapsedTime * .5) * .003, 1);                                                        // T6
    const h = 1e-4; bars.forEach(b => { b.scale.y = h; b.position.y = b.userData.s * (1 - h / 2); }); // T8, T14
    uE.value = Math.sin(Math.PI * U.sweep) + Math.max(0, 1 - (ms - arr) / 800);                                                                                                // T10
    pan = MU.damp(pan, ids.some(k => $(k).classList.contains("on")) ? 1 : 0, 4, s); u.uFoc.value = u.uSide.value = pan; u.uEnd.value = clamp((p - .93) / .07, 0, 1);
    u.uSweep.value = U.sweep; u.uDir.value = U.dir; u.uI.value = U.intro; R.render(sc, cam);
    if (shot) { shot = false; R.domElement.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "barbers.png"; a.click(); toast("Screenshot saved"); }); }
    if (n % 8 === 0) $("stats").textContent = `${fps | 0} fps · dpr ${dpr.toFixed(2)} · ${R.capabilities.isWebGL2 ? "WebGL2" : "WebGL1"} · ${PREC} · ${u.uLow.value ? "lite" : "full"}\n${GPU}\n${R.info.render.calls} draws`;
  };
})();
