/* ---------------------------
   VANTA background (more presence)
   --------------------------- */
let vantaEffect = null;
function startVanta(){
  if(window.VANTA && document.getElementById('vanta-bg')){
    if(vantaEffect) vantaEffect.destroy();
    vantaEffect = VANTA.NET({
      el: "#vanta-bg",
      backgroundColor: 0x0f1213,
      color: 0x262626,
      points: 20.0,
      maxDistance: 26.0,
      spacing: 12.0,
      showDots: false,
      scale: 1.0,
      scaleMobile: 1.0
    });
  }
}
window.addEventListener('load', startVanta);

/* ---------------------------
   IntersectionObserver: reveal + reverse
   --------------------------- */
const reveals = document.querySelectorAll('[data-reveal], .post, .card, .hero-copy, .hero-side');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const el = entry.target;
    if(entry.isIntersecting){
      el.classList.add('in-view');
      el.classList.remove('out-view');
      // ensure visible
      if(el.classList.contains('reveal')) el.classList.add('in-view');
    } else {
      // remove to allow reverse animation when scrolling back up
      el.classList.remove('in-view');
      el.classList.add('out-view');
    }
  });
},{threshold: 0.18});
reveals.forEach(r=>{
  r.classList.add('reveal');
  io.observe(r);
});

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

/* scroll direction detection for header & subtle animations */
let lastY = window.scrollY;
let ticking = false;
window.addEventListener('scroll', () => {
  if(!ticking){
    window.requestAnimationFrame(()=> {
      const currentY = window.scrollY;
      const header = document.querySelector('header');
      if(currentY > lastY + 10) {
        // scrolling down
        header.classList.add('hidden');
      } else if(currentY < lastY - 10) {
        // scrolling up
        header.classList.remove('hidden');
      }
      lastY = currentY;
      ticking = false;
    });
    ticking = true;
  }
});

/* ---------------------------
   Modal helpers
   --------------------------- */
function openModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('active');
  el.style.display = 'flex';
  el.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  // focus first input:
  const input = el.querySelector('input, textarea, select, button');
  if(input) setTimeout(()=>input.focus(),120);
}
function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('active');
  el.style.display = 'none';
  el.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

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
