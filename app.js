// Cristo une las Familias — interacción. Sin dependencias.
(() => {
  "use strict";

  // ---- Datos del evento (editar aquí) ----
  const EVENT = {
    title: "Cristo une las Familias · Campaña evangelística y 15 aniversario",
    place: "Plaza de Armas de Los Molinos",
    location: "Plaza de Armas de Los Molinos",
    mapsUrl: "https://maps.app.goo.gl/GsSYnPoEyRWPYAWP9", // enlace que pasó el usuario
    start: new Date("2026-11-21T18:00:00-05:00"), // hora de Perú
    hours: 3,
    details: "Campaña evangelística y 15 aniversario de MMM Los Molinos. ¡Trae a toda tu familia!",
  };
  const SHARE_TEXT = "¡Te invito! *Cristo une las Familias* ❤️ Campaña evangelística y 15 aniversario de MMM Los Molinos. " +
    "Sáb. 21 de noviembre, 6:00 p. m., Plaza de Armas de Los Molinos.";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Enlace público de la landing (el de og:url), aunque se abra desde localhost o con ?fbclid=… en la dirección.
  const pageUrl = () => document.querySelector('meta[property="og:url"]')?.content || location.href.split(/[?#]/)[0];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Toast ----
  const toastEl = $(".js-toast");
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  };

  // ---- Cuenta regresiva ----
  const cd = { d: $(".js-d"), h: $(".js-h"), m: $(".js-m"), s: $(".js-s") };
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const now = Date.now();
    const diff = EVENT.start - now;
    const end = EVENT.start.getTime() + EVENT.hours * 3600e3;
    if (diff <= 0) {
      $(".cd").hidden = true;
      const done = $(".js-cd-done");
      done.hidden = false;
      $(".js-cd-title").textContent = now < end ? "Es hoy" : "Gracias";
      done.textContent = now < end ? "¡Estamos en la Plaza de Armas! Te esperamos." : "Gracias por celebrar con nosotros. ¡Cristo une las familias!";
      return false;
    }
    const t = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(t / 86400));
    cd.h.textContent = pad(Math.floor((t % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((t % 3600) / 60));
    cd.s.textContent = pad(t % 60);
    return true;
  };
  if (tick()) {
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
  }

  // ---- Calendario ----
  const z = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const endDate = new Date(EVENT.start.getTime() + EVENT.hours * 3600e3);
  $(".js-gcal").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(EVENT.title) +
    "&dates=" + z(EVENT.start) + "/" + z(endDate) +
    "&details=" + encodeURIComponent(EVENT.details + "\nCómo llegar: " + EVENT.mapsUrl + "\n" + pageUrl()) +
    "&location=" + encodeURIComponent(EVENT.location);
  $(".js-ics").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MMM Los Molinos//Cristo une las Familias//ES", "BEGIN:VEVENT",
      "UID:cristo-une-las-familias-2026@mmm-los-molinos",
      "DTSTAMP:" + z(new Date()), "DTSTART:" + z(EVENT.start), "DTEND:" + z(endDate),
      "SUMMARY:" + EVENT.title, "LOCATION:" + EVENT.location, "URL:" + EVENT.mapsUrl,
      "DESCRIPTION:" + (EVENT.details + " Cómo llegar: " + EVENT.mapsUrl).replace(/,/g, "\\,"),
      "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", "DESCRIPTION:Cristo une las Familias", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "cristo-une-las-familias.ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });

  // ---- Mapa ----
  $(".js-maps").href = EVENT.mapsUrl;

  // ---- Compartir ----
  $(".js-wa").href = "https://wa.me/?text=" + encodeURIComponent(SHARE_TEXT + "\n\n👉 " + pageUrl());
  $(".js-fb").href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl());
  const copy = async () => {
    try { await navigator.clipboard.writeText(pageUrl()); toast("Enlace copiado"); }
    catch { toast(pageUrl()); }
  };
  $(".js-copy").addEventListener("click", copy);
  $$(".js-share").forEach((b) => b.addEventListener("click", async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Cristo une las Familias", text: SHARE_TEXT, url: pageUrl() }); } catch { /* cancelado */ }
    } else {
      window.open($(".js-wa").href, "_blank", "noopener");
    }
  }));

  // ---- Música (coro del himno) ----
  const audio = $(".js-audio");
  const music = $(".js-music");
  const label = $(".music__label");
  const setPlaying = (on) => {
    music.setAttribute("aria-pressed", String(on));
    label.textContent = on ? "Pausar" : "Escuchar el himno";
    music.setAttribute("aria-label", on ? "Pausar el himno" : "Escuchar el himno");
  };
  music.addEventListener("click", async () => {
    if (audio.paused) {
      try { audio.volume = 0.85; await audio.play(); setPlaying(true); }
      catch { toast("No se pudo reproducir el audio"); }
    } else { audio.pause(); setPlaying(false); }
  });
  audio.addEventListener("pause", () => setPlaying(false));
  // botón compacto cuando ya se bajó del hero
  const hero = $(".stage");
  new IntersectionObserver(([e]) => music.classList.toggle("is-compact", !e.isIntersecting && audio.paused), { threshold: 0.15 })
    .observe(hero);

  // ================= ESCENAS CON SCROLL (estilo Apple) =================
  // Cada escena es un contenedor alto con un hijo sticky; su avance p (0→1) mueve las capas.
  // Solo se animan transform y opacity (GPU). El estado final (p=1) es el layout natural del CSS.
  document.documentElement.classList.replace("no-js", "js");
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const seg = (p, a, b, e = easeInOut) => e(clamp((p - a) / (b - a)));
  const lerp = (a, b, t) => a + (b - a) * t;
  const progress = (el) => {
    const r = el.getBoundingClientRect();
    const run = r.height - innerHeight;
    return run > 0 ? clamp(-r.top / run) : (r.top < innerHeight / 2 ? 1 : 0);
  };

  // ---- Escena 1: el flyer se arma ----
  const stage = $(".stage");
  const H = {
    plaza: $(".js-plaza"), shade: $(".js-shade"), lockup: $(".js-lockup"), family: $(".js-family"),
    chipsM: $(".js-chips-m"), chipsD: $(".js-chips-d"), ctaD: $(".js-cta-d"), cue: $(".js-cue"),
    leaves: $$(".leaf").map((el, i) => ({ el, depth: +el.dataset.depth, side: i === 1 ? 1 : -1, phase: i * 2.1 })),
  };
  // Apertura: el título (sello + letras) centrado y más grande. Se mide su lugar final sin transform.
  let open = { dx: 0, dy: 0, s: 1 }, sealOpen = { x: 0, y: 0, s: 1 };
  const seal = $(".seal"), title = $(".title");
  const measure = () => {
    H.lockup.style.transform = seal.style.transform = "";
    const r = H.lockup.getBoundingClientRect();
    const sr = $(".stage__sticky").getBoundingClientRect();
    const cx = sr.left + sr.width / 2, cy = sr.top + sr.height * 0.47;
    const s = clamp(Math.min(sr.width * 0.92 / r.width, sr.height * 0.62 / r.height), 1, 1.45);
    open = { dx: cx - (r.left + r.width / 2), dy: cy - (r.top + r.height / 2), s };
    // Primero el "15 Aniversario" solo, centrado y grande (en coordenadas locales del lockup).
    const q = seal.getBoundingClientRect();
    const target = Math.min(sr.width * 0.68, sr.height * 0.5 * q.width / q.height, 560);
    sealOpen = {
      x: -(q.left + q.width / 2 - (r.left + r.width / 2)),
      y: -(q.top + q.height / 2 - (r.top + r.height / 2)),
      s: target / (q.width * s),
    };
  };

  const renderHero = (p, t) => {
    // 1) el 15 aniversario solo → 2) aparece el logo debajo → 3) todo se acomoda
    const k1 = seg(p, 0.03, 0.2);
    seal.style.transform = `translate3d(${(sealOpen.x * (1 - k1)).toFixed(1)}px, ${(sealOpen.y * (1 - k1)).toFixed(1)}px, 0) scale(${lerp(sealOpen.s, 1, k1).toFixed(4)})`;
    const tt = seg(p, 0.13, 0.3, easeOut);
    title.style.opacity = tt.toFixed(3);
    title.style.transform = `translate3d(0, ${((1 - tt) * 40).toFixed(1)}px, 0) scale(${lerp(0.8, 1, tt).toFixed(4)})`;
    const k = seg(p, 0.3, 0.56);                  // el título se acomoda
    H.lockup.style.transform = `translate3d(${(open.dx * (1 - k)).toFixed(1)}px, ${(open.dy * (1 - k)).toFixed(1)}px, 0) scale(${lerp(open.s, 1, k).toFixed(4)})`;
    // la plaza se aleja (como un dron subiendo) y se levanta el velo
    const z = seg(p, 0, 0.8, easeOut);
    H.plaza.style.transform = `translateX(-50%) scale(${lerp(1.45, 1, z).toFixed(4)})`;
    H.shade.style.opacity = (0.7 * (1 - seg(p, 0.1, 0.6))).toFixed(3);
    // la familia sube desde abajo
    const f = seg(p, 0.38, 0.72, easeOut);
    H.family.style.transform = `translate3d(0, ${((1 - f) * innerHeight * 0.55).toFixed(1)}px, 0) scale(${lerp(0.92, 1, f).toFixed(4)})`;
    H.family.style.opacity = seg(p, 0.38, 0.52).toFixed(3);
    // cápsulas de fecha y lugar
    const c = seg(p, 0.7, 0.86, easeOut);
    for (const el of [H.chipsM, H.chipsD]) {
      el.style.opacity = c.toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - c) * 40).toFixed(1)}px, 0) scale(${lerp(0.94, 1, c).toFixed(4)})`;
    }
    const d = seg(p, 0.78, 0.92, easeOut);
    H.ctaD.style.opacity = d.toFixed(3);
    H.ctaD.style.transform = `translate3d(0, ${((1 - d) * 30).toFixed(1)}px, 0)`;
    H.cue.style.opacity = (1 - seg(p, 0, 0.06)).toFixed(3);
    // hojas: flotan y pasan delante de la cámara hacia los bordes
    for (const l of H.leaves) {
      const fy = reduceMotion ? 0 : Math.sin(t / 1600 + l.phase) * 10;
      const fr = reduceMotion ? 0 : Math.sin(t / 2300 + l.phase) * 6;
      const q = seg(p, 0, 0.9, (x) => x);
      const out = q * l.depth;
      l.el.style.transform = `translate3d(${(l.side * out * innerWidth * 0.12).toFixed(1)}px, ${(-out * innerHeight * 0.18 + fy).toFixed(1)}px, 0) ` +
        `scale(${(1 + out * 0.55).toFixed(3)}) rotate(${(fr + l.side * out * 12).toFixed(2)}deg)`;
    }
  };

  // ---- Texto palabra por palabra ----
  const wordBlocks = $$(".js-words").map((el) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) frag.append(w);
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = w; frag.append(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    walk(el);
    return { el, words: $$(".w", el) };
  });
  const renderWords = () => {
    for (const b of wordBlocks) {
      const r = b.el.getBoundingClientRect();
      // empieza cuando el bloque entra por abajo y termina cuando llega al 40 % de la pantalla
      const p = clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.92 - innerHeight * 0.55 + r.height * 0.2));
      const n = b.words.length;
      b.words.forEach((w, i) => w.style.setProperty("--o", (0.18 + 0.82 * clamp(p * n - i)).toFixed(3)));
    }
  };

  // ---- Escena 2: la pantalla del video crece ----
  const inv = $(".js-invite");
  const screen = $(".js-screen");
  const video = $(".js-anim");
  const renderInvite = (p) => {
    const g = seg(p, 0, 0.55, easeOut);
    screen.style.transform = `scale(${lerp(0.62, 1, g).toFixed(4)}) rotate(${lerp(-4, 0, g).toFixed(2)}deg)`;
    screen.style.opacity = lerp(0.4, 1, seg(p, 0, 0.3)).toFixed(3);
  };

  // Video: vertical en celular, horizontal en pantallas anchas; se carga al acercarse y suena (mudo) solo a la vista
  const wide = matchMedia("(min-width: 900px) and (min-aspect-ratio: 1/1)");
  let loaded = null, inView = false, near = false;
  const pickVideo = () => {
    const key = wide.matches ? "h" : "v";
    if (loaded || near) video.poster = video.dataset["p" + key];
    if (loaded && loaded !== key) { video.src = video.dataset[key]; loaded = key; if (inView) video.play().catch(() => {}); }
    return key;
  };
  // el póster y el video se piden recién cuando falta ~1.5 pantallas para llegar
  new IntersectionObserver(([e], o) => {
    if (e.isIntersecting && !loaded) {
      near = true; loaded = pickVideo();
      video.preload = "auto"; video.src = video.dataset[loaded];
      o.disconnect();
    }
  }, { rootMargin: "150% 0px 150% 0px" }).observe(video);
  wide.addEventListener?.("change", () => { pickVideo(); measure(); });
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) {
      if (!loaded) { loaded = pickVideo(); video.src = video.dataset[loaded]; }
      video.play().catch(() => {});
    } else video.pause();
  }, { threshold: 0.3, rootMargin: "200px 0px 0px 0px" }).observe(video);

  // ---- Reels de Facebook: miniatura liviana; el reproductor de Facebook se carga solo al tocar ----
  const track = $(".js-reels");
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const stopReel = (card) => {
    const f = $("iframe", card);
    if (f) { f.remove(); card.classList.remove("is-playing"); $(".reel__poster", card).hidden = false; }
  };
  const renderReels = (reels) => {
    if (!reels.length) { $(".reels").hidden = true; return; }
    track.innerHTML = "";
    for (const r of reels) {
      const card = document.createElement("article");
      card.className = "reel reveal";
      card.setAttribute("role", "listitem");
      card.innerHTML = `<div class="reel__media"><button class="reel__poster" type="button"><img loading="lazy" decoding="async" alt=""><span class="reel__btn"></span><span class="reel__dur"></span></button></div>
        <p class="reel__title"></p><a class="reel__fb" target="_blank" rel="noopener">Ver en Facebook</a>`;
      const btn = $(".reel__poster", card), media = $(".reel__media", card);
      btn.setAttribute("aria-label", "Reproducir: " + r.title);
      $("img", card).src = r.poster;
      $(".reel__dur", card).textContent = r.duration ? fmt(r.duration) : "";
      $(".reel__title", card).textContent = r.title;
      $(".reel__fb", card).href = r.url;
      btn.addEventListener("click", () => {
        if (card.classList.contains("is-playing")) return;
        $$(".reel.is-playing").forEach(stopReel);          // uno a la vez
        if (!audio.paused) audio.pause();                    // que no suene el himno encima
        const w = Math.round(btn.clientWidth), hgt = Math.round(w / (r.ratio || 0.5625));
        const f = document.createElement("iframe");
        f.src = "https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(r.url) +
          `&show_text=false&width=${w}&height=${hgt}&autoplay=true`;
        f.title = r.title;
        f.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
        f.allowFullscreen = true;
        f.setAttribute("scrolling", "no");
        btn.hidden = true;
        card.classList.add("is-playing");
        media.append(f);
      });
      track.append(card);
      io.observe(card);
    }
  };
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    fetch("reels.json", { cache: "no-cache" }).then((r) => r.json()).then(renderReels).catch(() => { $(".reels").hidden = true; });
  }, { rootMargin: "100% 0px" }).observe($(".reels"));

  // ---- Barra fija: visible después de la escena del inicio ----
  const topbar = $(".js-topbar");
  const updateTopbar = () => {
    const on = scrollY > stage.offsetHeight - innerHeight * 0.6;
    if (on !== topbar.classList.contains("is-on")) {
      topbar.classList.toggle("is-on", on);
      topbar.tabIndex = on ? 0 : -1;
    }
  };
  addEventListener("scroll", updateTopbar, { passive: true });
  updateTopbar();

  // ---- Aparición simple para el resto ----
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  // ---- Bucle ----
  if (reduceMotion) {
    renderHero(1, 0); renderInvite(1);
  } else {
    measure();
    addEventListener("resize", measure);
    const loop = (t) => {
      const sr = stage.getBoundingClientRect();
      if (sr.bottom > 0) renderHero(progress(stage), t);
      const ir = inv.getBoundingClientRect();
      if (ir.top < innerHeight && ir.bottom > 0) renderInvite(progress(inv));
      renderWords();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
