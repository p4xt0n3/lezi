const entries = Array.from(document.querySelectorAll('.entry'));
const modal = document.getElementById('detail-modal');
const detailAvatar = document.getElementById('detail-avatar');
const detailName = document.getElementById('detail-name');
const accusationThumb = document.getElementById('accusation-thumb');
const additionalImg = document.getElementById('additional-img');
const detailStatus = document.getElementById('detail-status');
const closeDetail = document.getElementById('close-detail');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.getElementById('close-lightbox');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

let currentScale = 1;
const SCALE_STEP = 0.2;
const SCALE_MIN = 0.5;
const SCALE_MAX = 3;

function applyScale(){
  // apply transform with clamping
  currentScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, currentScale));
  lightboxImg.style.transform = `scale(${currentScale})`;
}

function resetScale(){
  currentScale = 1;
  lightboxImg.style.transform = '';
}

function openDetail(el){
  const name = el.dataset.name;
  const img = el.dataset.img;
  const accusation = el.dataset.accusationImg;
  const tq = el.dataset.tqImg;

  detailAvatar.src = img;
  detailAvatar.alt = name + ' 头像';
  detailName.textContent = name;
  // set status text
  detailStatus.textContent = '现状态：已被被默纳罗斯制裁退群';
  // accusation thumb
  accusationThumb.src = accusation;
  accusationThumb.alt = '罪名 预览';
  // additional image (bjtq.jpg)
  if(tq){
    additionalImg.src = tq;
    additionalImg.alt = name + ' 补充图';
    additionalImg.style.display = '';
  } else {
    additionalImg.src = '';
    additionalImg.alt = '';
    additionalImg.style.display = 'none';
  }

  modal.setAttribute('aria-hidden', 'false');
  // focus management
  closeDetail.focus();
}

function closeDetailModal(){
  modal.setAttribute('aria-hidden','true');
  // restore focus to first entry
  entries[0]?.focus();
}

function openLightbox(src, alt){
  // set image and show lightbox, lock page scroll for cleaner experience
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  resetScale();
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  // focus the close button for keyboard users
  closeLightbox.focus();
}

function closeLightboxFunc(){
  lightbox.setAttribute('aria-hidden','true');
  // remove src to release memory and restore scrolling
  lightboxImg.src = '';
  resetScale();
  document.body.style.overflow = '';
}

// zoom controls
function zoomIn(){
  currentScale = +(currentScale + SCALE_STEP).toFixed(2);
  applyScale();
}
function zoomOut(){
  currentScale = +(currentScale - SCALE_STEP).toFixed(2);
  applyScale();
}

entries.forEach(el=>{
  el.addEventListener('click', ()=> openDetail(el));
  el.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(el); }
  });
});

closeDetail.addEventListener('click', closeDetailModal);
modal.addEventListener('click', (e)=>{
  if(e.target === modal) closeDetailModal();
});
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    if(modal.getAttribute('aria-hidden') === 'false') closeDetailModal();
    if(lightbox.getAttribute('aria-hidden') === 'false') closeLightboxFunc();
  }
  // allow +/- keys to control zoom when lightbox is open
  if(lightbox.getAttribute('aria-hidden') === 'false'){
    if(e.key === '+' || e.key === '=' ) { // '=' is often shift-less '+'
      e.preventDefault(); zoomIn();
    } else if(e.key === '-' ) {
      e.preventDefault(); zoomOut();
    }
  }
});

accusationThumb.addEventListener('click', ()=> openLightbox(accusationThumb.src, accusationThumb.alt));
accusationThumb.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(accusationThumb.src, accusationThumb.alt); } });

// additional image opens in lightbox as well
additionalImg.addEventListener('click', ()=> openLightbox(additionalImg.src, additionalImg.alt));
additionalImg.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(additionalImg.src, additionalImg.alt); } });

closeLightbox.addEventListener('click', closeLightboxFunc);
lightbox.addEventListener('click', (e)=>{
  // clicking outside inner area should close
  if(e.target === lightbox) closeLightboxFunc();
});

// zoom buttons
zoomInBtn?.addEventListener('click', zoomIn);
zoomOutBtn?.addEventListener('click', zoomOut);

// make image itself toggle close on click, but preserve zoom when clicked
lightboxImg.addEventListener('click', ()=> {
  // if scale is nearly 1, treat click as close; otherwise toggle back to 1
  if(Math.abs(currentScale - 1) < 0.01) {
    closeLightboxFunc();
  } else {
    currentScale = 1;
    applyScale();
  }
});