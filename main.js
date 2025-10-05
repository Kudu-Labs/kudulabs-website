function hasWebGL(){
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch(e){ return false; }
}

function vantaFallback(){
  const bg = document.getElementById('vanta-bg');
  if (!bg) return;
  // fond statique discret (remplaçable par une image/noise)
  bg.style.background = 'radial-gradient(1000px 600px at 20% 10%, rgba(255,255,255,0.05), transparent 60%)';
}

function initVantaSafe(){
  const el = document.getElementById('vanta-bg');
  if(!el){ return; }
  if(!hasWebGL()){ vantaFallback(); return; }

  // vérifie que VANTA et THREE sont chargés
  if(!window.VANTA || !VANTA.NET || !window.THREE){ 
    // réessaie un peu plus tard
    setTimeout(initVantaSafe, 150);
    return;
  }

  // détruit une éventuelle instance
  if (window.vantaEffect && vantaEffect.destroy) {
    vantaEffect.destroy();
  }

  window.vantaEffect = VANTA.NET({
    el: '#vanta-bg',
    THREE: window.THREE,
    backgroundColor: 0x0f1213,
    color: 0x555555,
    points: 20.0,
    maxDistance: 26.0,
    spacing: 12.0,
    showDots: false,
    scale: 1.0,
    scaleMobile: 1.0
  });
}

window.addEventListener('load', initVantaSafe);
window.addEventListener('resize', ()=>{ clearTimeout(window._vR); window._vR=setTimeout(initVantaSafe, 200); });
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) initVantaSafe(); });



/* IntersectionObserver: reveal + reverse */
const reveals = document.querySelectorAll('[data-reveal], .post, .card, .hero-copy, .hero-side');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const el = entry.target;
      if(entry.isIntersecting){
        el.classList.add('in-view');
        el.classList.remove('out-view');
      } else {
        el.classList.remove('in-view');
        el.classList.add('out-view');
      }
    });
  },{threshold: 0.18});

  reveals.forEach(r=>{ r.classList.add('reveal'); io.observe(r); });

  /* ✅ Active les animations UNIQUEMENT si IO est prêt */
  document.body.classList.add('io-ready');
} else {
  /* Pas d’IO: on ne fait rien — le contenu reste visible */
}


/* small parallax by mouse for title */
const title = document.querySelector('.main');
const heroInner = document.querySelector('.hero-inner');
if(title && heroInner){
  window.addEventListener('mousemove', (ev)=>{
    const x = (ev.clientX - window.innerWidth/2)/90;
    const y = (ev.clientY - window.innerHeight/2)/140;
    title.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}


/* ---------------------------
   Modal helpers (GLOBAL, safe)
   --------------------------- */
(function () {
  let previouslyFocused = null;

  function resolveId(key) {
    if (!key) return null;
    return key.endsWith('-modal') ? key : `${key}-modal`;
  }

  function trapFocus(modal) {
    const focusables = modal.querySelectorAll(
      'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    function onKey(e) {
      if (e.key !== 'Tab') return;
      if (focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    modal._trapHandler = onKey;
    modal.addEventListener('keydown', onKey);
  }

  function untrapFocus(modal) {
    if (modal._trapHandler) {
      modal.removeEventListener('keydown', modal._trapHandler);
      modal._trapHandler = null;
    }
  }

window.openModal = function (key) {
  const id = (key && key.endsWith('-modal')) ? key : `${key}-modal`;
  const el = document.getElementById(id);
  if (!el) return;

  previouslyFocused = document.activeElement;

  // 1) montrer la modale, mais NE PAS encore activer l’animation
  el.style.display = 'flex';
  el.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';

  // 2) forcer un reflow, puis ajouter .active (déclenche la transition)
  void el.offsetWidth;               // <— TRUC clé
  el.classList.add('active');        // .modal et .modal-panel vont animer

  trapFocus(el);

  const firstFocusable = el.querySelector(
    'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
  );
  if (firstFocusable) firstFocusable.focus();
};

window.closeModal = function (key) {
  const id = (key && key.endsWith('-modal')) ? key : `${key}-modal`;
  const el = document.getElementById(id);
  if (!el) return;

  untrapFocus(el);

  // 1) retirer .active (lance l’animation de sortie)
  el.classList.remove('active');
  el.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';

  // 2) cacher APRÈS la transition
  const hide = () => { el.style.display = 'none'; };
  el.addEventListener('transitionend', hide, { once: true });
  // filet de sécurité (si aucun event ne remonte)
  setTimeout(hide, 360);

  if (previouslyFocused && document.contains(previouslyFocused)) {
    previouslyFocused.focus();
  }
};


  // Click outside panel to close
  document.addEventListener('click', (e) => {
    const open = document.querySelector('.modal.active');
    if (!open) return;
    if (e.target === open) {
      window.closeModal(open.id);
    }
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal.active');
      if (open) window.closeModal(open.id);
    }
  });
})();


/* close modals when clicking outside panel */
document.addEventListener('click', (e)=>{
  ['waitlist-modal','contact-modal','join-modal'].forEach(id=>{
    const modal = document.getElementById(id);
    if(modal && modal.classList.contains('active') && e.target === modal) closeModal(id);
  });
});

/* ---------------------------
   Blog category filter
   --------------------------- */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.getAttribute('data-filter');
    const posts = document.querySelectorAll('#posts .post');
    posts.forEach(p=>{
      if(filter === 'all' || p.getAttribute('data-category') === filter) p.style.display = '';
      else p.style.display = 'none';
    });
  });
});

/* cleanup Vanta on unload */
window.addEventListener('beforeunload', ()=>{ if(vantaEffect) vantaEffect.destroy(); });


// Menu fullscreen : ouverture/fermeture simple (burger + X + fond + Esc)
(function(){
  const overlay = document.getElementById('nav-overlay');
  const header  = document.getElementById('site-header');
  const toggle  = header?.querySelector('.nav-toggle');
  const closeBtn= overlay?.querySelector('.overlay-close');
  if(!overlay || !toggle) return;

  const open  = () => {
    document.body.classList.add('menu-open');
    overlay.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => {
    document.body.classList.remove('menu-open');
    overlay.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    document.body.classList.contains('menu-open') ? close() : open();
  });
  closeBtn && closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') close(); });
})();

// --- Typewriter pour le H1 .main (safe, no-conflict) ---
(function(){
  const title = document.querySelector('h1.main');
  if(!title) return;

  // Respecte la préférence "réduire les animations"
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // on laisse le texte tel quel

  // Empêche un double-lancement (navigations PJAX éventuelles, etc.)
  if (title.dataset.typed === '1') return;
  title.dataset.typed = '1';

  const fullText = (title.textContent || '').trim();
  if (!fullText) return;

  // Accessibilité: on garde le texte complet en aria-label
  title.setAttribute('aria-label', fullText);

  // Prépare l'effet
  title.classList.add('typing');
  title.textContent = ''; // commence vide

  const baseDelay = 28; // vitesse de base en ms/char
  let i = 0;

  function nextTick(){
    // petites pauses après ponctuation pour un rythme naturel
    const ch = fullText[i - 1] || '';
    let delay = baseDelay;
    if (/[.,;:!?]/.test(ch)) delay = 120;
    if (ch === ' ') delay = 40;

    setTimeout(type, delay);
  }

  function type(){
    // si le titre n'est plus dans le DOM (changement de page), on stoppe
    if (!document.contains(title)) return;

    title.textContent = fullText.slice(0, i++);
    if (i <= fullText.length) {
      nextTick();
    } else {
      // terminé: retire le curseur après une petite pause
      setTimeout(()=> title.classList.remove('typing'), 250);
    }
  }

  // lance
  nextTick();
})();
