/* =========================================================
   GABRIEL COXINHA — interactions
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;

  /* ---------- PRELOADER ---------- */
  const loader = $('#loader');
  const bar = $('#loaderBar');
  const pct = $('#loaderPct');
  let prog = 0;
  const tick = setInterval(() => {
    prog += Math.random() * 16 + 6;
    if (prog >= 100) prog = 100;
    if (bar) bar.style.width = prog + '%';
    if (pct) pct.textContent = Math.floor(prog) + '%';
    if (prog >= 100) clearInterval(tick);
  }, 140);

  function finishLoad() {
    prog = 100;
    if (bar) bar.style.width = '100%';
    if (pct) pct.textContent = '100%';
    clearInterval(tick);
    setTimeout(() => {
      loader && loader.classList.add('done');
      document.body.classList.add('loaded');
      kickHero();
      setTimeout(() => loader && loader.classList.add('gone'), 800);
    }, 480);
  }
  window.addEventListener('load', () => setTimeout(finishLoad, 700));
  // safety net
  setTimeout(() => { if (loader && !loader.classList.contains('done')) finishLoad(); }, 4200);

  /* ---------- HERO ENTRANCE ---------- */
  function kickHero() {
    $$('#hero .reveal, #hero .reveal-word').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 90 * i);
    });
  }

  /* ---------- CUSTOM CURSOR ---------- */
  if (finePointer && !reduced) {
    const cur = $('#cursor');
    const trail = $('#cursorTrail');
    let mx = innerWidth / 2, my = innerHeight / 2;
    let tx = mx, ty = my;
    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.transform = `translate(${mx}px,${my}px)`;
    });
    (function loop() {
      tx += (mx - tx) * 0.16; ty += (my - ty) * 0.16;
      if (trail) trail.style.transform = `translate(${tx}px,${ty}px)`;
      requestAnimationFrame(loop);
    })();
    addEventListener('mousedown', () => cur.classList.add('is-down'));
    addEventListener('mouseup', () => cur.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => { cur.style.opacity = 0; trail.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = 1; trail.style.opacity = ''; });

    const map = { link: 'is-link', cta: 'is-cta', soft: 'is-soft' };
    $$('[data-cursor]').forEach(el => {
      const cls = map[el.dataset.cursor];
      el.addEventListener('mouseenter', () => {
        // over any interactive element: coxinha morphs into Gabriel's head
        cur.classList.add('is-hover', cls);
        if (el.dataset.cursor === 'cta') trail.classList.add('is-cta');
      });
      el.addEventListener('mouseleave', () => {
        cur.classList.remove('is-hover', cls);
        trail.classList.remove('is-cta');
      });
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(btn => {
      const strength = 0.32;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * strength}px,${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- COXINHA RAIN ---------- */
  (function rain() {
    const wrap = $('#coxinhaRain');
    if (!wrap || reduced) return;
    const N = innerWidth < 700 ? 8 : 16;
    for (let i = 0; i < N; i++) {
      const img = document.createElement('img');
      img.src = 'assets/img/coxinha-outline.png';
      img.className = 'cx';
      img.alt = '';
      const size = 16 + Math.random() * 26;
      img.style.width = size + 'px';
      img.style.left = Math.random() * 100 + '%';
      img.style.animationDuration = (10 + Math.random() * 14) + 's';
      img.style.animationDelay = (-Math.random() * 20) + 's';
      img.style.opacity = (0.06 + Math.random() * 0.12).toFixed(2);
      wrap.appendChild(img);
    }
  })();

  /* ---------- SCROLL REVEALS ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal:not(#hero .reveal), .reveal-word:not(#hero .reveal-word)').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  /* ---------- COUNTERS ---------- */
  function fmt(n, suffix) {
    if (suffix === 'M') return n + 'M+';
    if (suffix === '%') return n + '%';
    if (n >= 1000) return n.toLocaleString('pt-BR');
    return String(n);
  }
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur = 1600;
      const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.floor(target * eased), suffix);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(target, suffix);
      }
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('.stat__num').forEach(el => cio.observe(el));

  /* ---------- NAV: scrolled + burger + to-top ---------- */
  const nav = $('#nav');
  const toTop = $('#toTop');
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    toTop.classList.toggle('show', y > 700);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger');
  burger && burger.addEventListener('click', () => nav.classList.toggle('open'));
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- HERO PARALLAX (portrait + glow) ---------- */
  if (finePointer && !reduced) {
    const portrait = $('#portrait');
    const hero = $('#hero');
    // tilt the whole portrait wrapper (the face keeps its CSS float animation intact)
    hero && hero.addEventListener('mousemove', e => {
      const cx = (e.clientX / innerWidth - 0.5);
      const cy = (e.clientY / innerHeight - 0.5);
      if (portrait) portrait.style.transform = `perspective(900px) rotateY(${cx * 8}deg) rotateX(${-cy * 6}deg) translateX(${cx * 14}px)`;
    });
    hero && hero.addEventListener('mouseleave', () => {
      if (portrait) portrait.style.transform = '';
    });
  }

  /* ---------- SCROLL PARALLAX for glows ---------- */
  if (!reduced) {
    const g1 = $('.bg-glow--1'), g2 = $('.bg-glow--2');
    addEventListener('scroll', () => {
      const y = scrollY;
      if (g1) g1.style.transform = `translateY(${y * 0.12}px)`;
      if (g2) g2.style.transform = `translateY(${-y * 0.08}px)`;
    }, { passive: true });
  }
})();
