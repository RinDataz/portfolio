/* =========================================================
   Rinad Almjishai — Portfolio interactions
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- intro ---------- */
  requestAnimationFrame(() => document.body.classList.add('loaded'));
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- nav: scrolled state, progress bar, active link ---------- */
  const nav = $('#nav');
  const progress = $('#progress');
  const links = $$('.nav-links a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    let current = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) current = s; });
    links.forEach(a => a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id));

    updateTimeline();
  };

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#nav-links');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  links.forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .job').forEach(el => {
    // stagger siblings
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal') || c.classList.contains('job'));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
    io.observe(el);
  });

  /* ---------- count-up numbers ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
      if (reduceMotion) { el.textContent = fmt(target); countIO.unobserve(el); return; }
      const dur = 1600, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: .5 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- rotating word in hero ---------- */
  const rot = $('#rotator');
  const words = ['ship.', 'scale.', 'comply.', 'work.'];
  let wi = 0;
  if (rot && !reduceMotion) {
    setInterval(() => {
      rot.classList.add('out');
      setTimeout(() => { wi = (wi + 1) % words.length; rot.textContent = words[wi]; rot.classList.remove('out'); }, 300);
    }, 2600);
  }

  /* ---------- experience filters ---------- */
  const jobs = $$('.job');
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    jobs.forEach(j => {
      const show = f === 'all' || j.dataset.cat.split(' ').includes(f);
      j.classList.toggle('hide', !show);
      if (show) { j.classList.remove('in'); requestAnimationFrame(() => requestAnimationFrame(() => j.classList.add('in'))); }
    });
    updateTimeline();
  }));

  /* ---------- timeline progress line ---------- */
  const tl = $('#timeline');
  const fill = $('#timeline-fill');
  function updateTimeline() {
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const mark = innerHeight * .6;
    const h = Math.max(0, Math.min(r.height, mark - r.top));
    fill.style.height = h + 'px';
    jobs.forEach(j => j.classList.toggle('lit', j.getBoundingClientRect().top + 52 < mark));
  }

  /* ---------- spotlight on the "now" card ---------- */
  const card = $('.now-card');
  if (card) card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  /* ---------- custom cursor ---------- */
  const cursor = $('#cursor');
  if (cursor && matchMedia('(hover: hover)').matches && !reduceMotion) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cursor.classList.add('on'); });
    document.addEventListener('pointerleave', () => cursor.classList.remove('on'));
    const loop = () => {
      cx += (tx - cx) * .2; cy += (ty - cy) * .2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    $$('a, button, summary').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('big'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('big'));
    });
  }

  /* ---------- magnetic email button ---------- */
  $$('[data-magnetic]').forEach(el => {
    if (reduceMotion || !matchMedia('(hover: hover)').matches) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .15;
      const y = (e.clientY - r.top - r.height / 2) * .3;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ---------- copy email ---------- */
  const copyBtn = $('#copy-email');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('rinadh.almjishai@gmail.com');
      copyBtn.textContent = 'Copied ✓';
    } catch { copyBtn.textContent = 'rinadh.almjishai@gmail.com'; }
    setTimeout(() => { copyBtn.textContent = 'Copy email'; }, 2200);
  });

  /* ---------- local clock (Jeddah) ---------- */
  const clock = $('#clock');
  const setClock = () => {
    if (clock) clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Riyadh' });
  };
  setClock(); setInterval(setClock, 30000);

  /* ---------- hero field: interactive dot grid ---------- */
  const canvas = $('#field');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, dots = [], mouse = { x: -9999, y: -9999 }, t = 0, visible = true;
    const GAP = 28;

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP / 2; y < h; y += GAP)
        for (let x = GAP / 2; x < w; x += GAP) dots.push({ x, y });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += .012;
      for (const d of dots) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = Math.max(0, 1 - dist / 220);
        const wave = (Math.sin(d.x * .012 + t) + Math.cos(d.y * .014 + t * .8)) * .5;
        const push = near * 14;
        const px = d.x + (dist ? dx / dist : 0) * push;
        const py = d.y + (dist ? dy / dist : 0) * push + wave * 3;
        const a = .12 + near * .75 + Math.max(0, wave) * .08;
        const r = .9 + near * 1.6;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      }
      if (visible && !reduceMotion) requestAnimationFrame(draw);
    };

    resize();
    addEventListener('resize', resize);
    canvas.parentElement.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([e]) => {
      const was = visible; visible = e.isIntersecting;
      if (visible && !was) draw();
    }).observe(canvas);
    draw();
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
