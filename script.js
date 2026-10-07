/* ============================================================
   MINE 2026 — script.js v3
   • Floating hearts canvas
   • Preloader
   • Nav with proper mobile X close
   • Three distinct gallery builders (stagger / editorial / film)
   • Lightbox
   • Scroll reveal
   ============================================================ */
'use strict';

/* ──────────────────────────────────────────
   EXACT FILE LISTS (from folder screenshots)
────────────────────────────────────────────*/
const GALLERIES = {
  court: {
    folder: 'Court wedding',
    files: [
      'Court wed 1.jpeg','Court wed 2.jpeg','Court wed 3.jpeg',
      'Court wed 4.jpeg','Court wed 5.jpeg','Court wed 6.jpeg',
      'Court wed 7.jpeg','Court wed 8.jpeg','Court wed 9.jpeg',
      'Court wed 10.jpeg','Court wed 11.jpeg','Court wed 12.jpeg',
      'Court wed 13.jpeg','Court wed 14.jpeg','Court wed 15.jpeg',
    ]
  },
  intro: {
    folder: 'Introduction',
    files: [
      'Introduction 1.jpeg','Introduction 2.jpeg','Introduction 3.jpeg',
      'Introduction 4.jpeg','Introduction 5.jpeg','Introduction 6.jpeg',
    ]
  },
  pre: {
    folder: 'Pre wedding',
    files: [
      'prewed 1.jpeg','prewed 2.jpeg','prewed 3.jpeg',
      'prewed 4.jpeg','prewed 5.jpeg','prewed 6.jpeg',
      'prewed 7.jpeg','prewed 8.jpeg','prewed 9.jpeg',
      'prewed 10.jpeg','prewed 11.jpeg','prewed 12.jpeg',
      'prewed 13.jpeg','prewed 14.jpeg',
    ]
  }
};

function url(folder, file) {
  const optimizedFile = file.replace(/\.(?:jpe?g|png|webp)$/i, '.webp');
  return `optimized/${encodeURIComponent(folder)}/${encodeURIComponent(optimizedFile)}`;
}

/* ──────────────────────────────────────────
   LIGHTBOX
────────────────────────────────────────────*/
const lb       = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbInfo   = document.getElementById('lbInfo');
let lbUrls = [], lbIdx = 0;

lbImg.style.transition = 'opacity .18s, transform .18s';

function openLb(urls, idx) {
  lbUrls = urls; lbIdx = idx;
  showSlide();
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
function showSlide() {
  lbImg.style.opacity = '0'; lbImg.style.transform = 'scale(.96)';
  setTimeout(() => {
    lbImg.src = lbUrls[lbIdx] || '';
    lbInfo.textContent = lbUrls.length > 1 ? `${lbIdx + 1} / ${lbUrls.length}` : '';
    lbImg.style.opacity = '1'; lbImg.style.transform = 'scale(1)';
  }, 170);
}
function lbNav(d) { lbIdx = (lbIdx + d + lbUrls.length) % lbUrls.length; showSlide(); }

document.getElementById('lbClose').addEventListener('click', closeLb);
document.getElementById('lbPrev').addEventListener('click', () => lbNav(-1));
document.getElementById('lbNext').addEventListener('click', () => lbNav(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLb();
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});
let lbTx = 0;
lb.addEventListener('touchstart', e => { lbTx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend',   e => { if (Math.abs(e.changedTouches[0].clientX - lbTx) > 48) lbNav(e.changedTouches[0].clientX < lbTx ? 1 : -1); });

/* ──────────────────────────────────────────
   GALLERY — COURT WEDDING (stagger masonry)
────────────────────────────────────────────*/
function buildCourtGallery() {
  const container = document.getElementById('courtGallery');
  if (!container) return;
  const { folder, files } = GALLERIES.court;
  const urls = files.map(f => url(folder, f));
  container.innerHTML = '';

  urls.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'gs-item';
    div.innerHTML = `
      <img src="${src}" alt="Court Wedding ${i+1}" loading="lazy"/>
      <div class="gs-overlay"><span>${folder}</span></div>
    `;
    div.querySelector('img').onerror = () => { div.style.display = 'none'; };
    div.addEventListener('click', () => {
      const visible = [...container.querySelectorAll('.gs-item:not([style*="none"]) img')].map(im => im.src);
      const thisIdx = [...container.querySelectorAll('.gs-item:not([style*="none"])')].indexOf(div);
      openLb(visible, Math.max(0, thisIdx));
    });
    // Stagger fade-in
    div.style.cssText = `opacity:0;transition:opacity .6s ${i * 60}ms, transform .6s ${i * 60}ms;transform:translateY(20px)`;
    container.appendChild(div);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      div.style.opacity = '1'; div.style.transform = 'translateY(0)';
    }));
  });
}

/* ──────────────────────────────────────────
   GALLERY — INTRODUCTION (editorial)
────────────────────────────────────────────*/
function buildIntroGallery() {
  const container = document.getElementById('introGallery');
  if (!container) return;
  const { folder, files } = GALLERIES.intro;
  const urls = files.map(f => url(folder, f));
  if (!urls.length) { container.innerHTML = '<p class="g-missing">No images found.</p>'; return; }
  container.innerHTML = '';

  // Featured — first image
  const featured = document.createElement('div');
  featured.className = 'ge-featured';
  featured.innerHTML = `
    <img src="${urls[0]}" alt="Introduction 1" loading="lazy"/>
    <div class="ge-overlay"><i class="ri-zoom-in-line"></i></div>
    <div class="ge-featured-badge">Introduction</div>
  `;
  featured.querySelector('img').onerror = () => { featured.style.display='none'; };
  featured.addEventListener('click', () => openLb(urls, 0));
  container.appendChild(featured);

  // Right side: top strip (2 images) + bottom row (rest)
  const right = document.createElement('div');
  right.style.cssText = 'display:flex;flex-direction:column;gap:10px;';

  const strip = document.createElement('div');
  strip.className = 'ge-strip';
  urls.slice(1, 3).forEach((src, i) => {
    const t = document.createElement('div');
    t.className = 'ge-thumb';
    t.innerHTML = `<img src="${src}" alt="Introduction ${i+2}" loading="lazy"/><div class="ge-overlay"><i class="ri-zoom-in-line"></i></div>`;
    t.querySelector('img').onerror = () => { t.style.display='none'; };
    t.addEventListener('click', () => openLb(urls, i + 1));
    strip.appendChild(t);
  });
  right.appendChild(strip);

  if (urls.length > 3) {
    const more = document.createElement('div');
    more.className = 'ge-more';
    urls.slice(3).forEach((src, i) => {
      const t = document.createElement('div');
      t.className = 'ge-thumb';
      t.innerHTML = `<img src="${src}" alt="Introduction ${i+4}" loading="lazy"/><div class="ge-overlay"><i class="ri-zoom-in-line"></i></div>`;
      t.querySelector('img').onerror = () => { t.style.display='none'; };
      t.addEventListener('click', () => openLb(urls, i + 3));
      more.appendChild(t);
    });
    right.appendChild(more);
  }

  container.appendChild(right);
}

/* ──────────────────────────────────────────
   GALLERY — PRE-WEDDING (film strip)
────────────────────────────────────────────*/
function buildPreGallery() {
  const container = document.getElementById('preGallery');
  if (!container) return;
  const { folder, files } = GALLERIES.pre;
  const urls = files.map(f => url(folder, f));
  container.innerHTML = '';

  urls.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'gf-item';
    div.innerHTML = `
      <img src="${src}" alt="Pre-Wedding ${i+1}" loading="lazy"/>
      <div class="gf-overlay"><span>Pre-Wedding</span></div>
      <span class="gf-num">${String(i+1).padStart(2,'0')}</span>
    `;
    div.querySelector('img').onerror = () => { div.style.display='none'; };
    div.addEventListener('click', () => {
      const visible = [...container.querySelectorAll('.gf-item:not([style*="none"]) img')].map(im => im.src);
      const thisIdx = [...container.querySelectorAll('.gf-item:not([style*="none"])')].indexOf(div);
      openLb(visible, Math.max(0, thisIdx));
    });
    container.appendChild(div);
  });
}

/* ──────────────────────────────────────────
   IV CARD
────────────────────────────────────────────*/
function initIV() {
  const card = document.getElementById('ivCard');
  if (card) card.addEventListener('click', () => openLb(['optimized/Wedding%20IV.webp'], 0));
}

/* ──────────────────────────────────────────
   HEARTS CANVAS
────────────────────────────────────────────*/
function initHearts() {
  const canvas = document.getElementById('heartsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLS = ['rgba(107,26,43,','rgba(200,160,64,','rgba(212,130,106,','rgba(91,140,122,','rgba(92,53,32,'];

  class H {
    reset(init) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 20;
      this.s = 7 + Math.random() * 16;
      this.sp= .3 + Math.random() * .5;
      this.dr= (Math.random()-.5) * .35;
      this.a = .07 + Math.random() * .2;
      this.c = COLS[Math.floor(Math.random() * COLS.length)];
      this.rot= (Math.random()-.5)*.035;
      this.an= Math.random() * Math.PI * 2;
    }
    constructor() { this.reset(true); }
    draw() {
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.an);
      ctx.fillStyle = this.c + this.a + ')'; ctx.beginPath();
      const s = this.s;
      ctx.moveTo(0, s*.3);
      ctx.bezierCurveTo(-s*.6,-s*.1,-s,-s*.5,0,-s*.8);
      ctx.bezierCurveTo(s,-s*.5,s*.6,-s*.1,0,s*.3);
      ctx.fill(); ctx.restore();
    }
    update() {
      this.y -= this.sp; this.x += this.dr; this.an += this.rot;
      if (this.y < -30) this.reset(false);
    }
  }

  const hearts = Array.from({ length: 32 }, () => new H());
  (function loop() { ctx.clearRect(0,0,canvas.width,canvas.height); hearts.forEach(h => { h.update(); h.draw(); }); requestAnimationFrame(loop); })();
}

/* ──────────────────────────────────────────
   PRELOADER
────────────────────────────────────────────*/
function initPreloader() {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  document.body.style.overflow = 'hidden';
  const done = () => { pl.classList.add('gone'); document.body.style.overflow = ''; initReveal(); };
  if (document.readyState === 'complete') { setTimeout(done, 900); }
  else { window.addEventListener('load', () => setTimeout(done, 1400)); }
}

/* ──────────────────────────────────────────
   NAV
────────────────────────────────────────────*/
function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const closeB = document.getElementById('navClose');
  const links  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

  const open  = () => { links.classList.add('open');    document.body.style.overflow = 'hidden'; };
  const close = () => { links.classList.remove('open'); document.body.style.overflow = ''; };

  burger.addEventListener('click', open);
  closeB.addEventListener('click', close);
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Active link
  document.querySelectorAll('section[id], footer[id]').forEach(sec => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.querySelectorAll('a').forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--coral-lt)' : '';
        });
      });
    }, { threshold: .38 }).observe(sec);
  });
}

/* ──────────────────────────────────────────
   SCROLL REVEAL
────────────────────────────────────────────*/
function initReveal() {
  const sel = '.sh, .s-sub, .order-wrap, .key-roles, .honour-row, .roll-section, ' +
              '.ministers-list, .vendors-wrap, .iv-scene, .hero-strip, .hero-palette, ' +
              '.hero-rsvp, .gallery-stagger, .gallery-editorial, .gallery-film';

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('revealed');
      io.unobserve(e.target);
    });
  }, { threshold: .08 });

  document.querySelectorAll(sel).forEach(el => {
    el.classList.add('will-reveal');
    io.observe(el);
  });
}

/* ──────────────────────────────────────────
   BOOT
────────────────────────────────────────────*/
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(error => {
    console.error('Image cache registration failed:', error);
  });
}

initHearts();
initPreloader();

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initIV();
  buildCourtGallery();
  buildIntroGallery();
  buildPreGallery();
});