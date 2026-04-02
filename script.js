const entries = Array.from(document.querySelectorAll('.entry'));
const modal = document.getElementById('detail-modal');
const detailAvatar = document.getElementById('detail-avatar');
const detailName = document.getElementById('detail-name');
const accusationThumb = document.getElementById('accusation-thumb');
const additionalImg = document.getElementById('additional-img');
const epilogueImg = document.getElementById('epilogue-img');
const detailStatus = document.getElementById('detail-status');
const closeDetail = document.getElementById('close-detail');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeLightbox = document.getElementById('close-lightbox');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const openOriginal = document.getElementById('open-original');
const downloadBtn = document.getElementById('download-image');
const fitBtn = document.getElementById('fit-btn');
const actualBtn = document.getElementById('actual-btn');
const rotateLeftBtn = document.getElementById('rotate-left');
const rotateRightBtn = document.getElementById('rotate-right');
const zoomIndicator = document.getElementById('zoom-indicator');
const zoomInput = document.getElementById('zoom-input');
const lightboxImageWrap = document.querySelector('.lightbox-image-wrap');

// sync input and indicator
function clampPercent(p){
  const minP = Math.round(SCALE_MIN * 100);
  const maxP = Math.round(SCALE_MAX * 100);
  if(isNaN(p)) return Math.round(currentScale * 100);
  return Math.min(maxP, Math.max(minP, Math.round(p)));
}

function updateZoomIndicator(){
  if(!zoomIndicator) return;
  const percent = Math.round(currentScale * 100);
  zoomIndicator.textContent = `${percent}%`;
  if(zoomInput){
    const clamped = clampPercent(percent);
    if(String(zoomInput.value) !== String(clamped)) zoomInput.value = clamped;
  }
}

let currentScale = 1;
let offsetX = 0;
let offsetY = 0;
let currentRotation = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;
let lastTapTime = 0;
let fitScale = 1;
let viewerMode = 'fit'; // 'fit' | 'actual' | 'custom'

const SCALE_STEP = 0.2;
const SCALE_MIN = 0.1;
const SCALE_MAX = 20;

/* NOTE: updateZoomIndicator defined above (replaced earlier) */

function applyTransform(){
  currentScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, currentScale));
  const transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentScale}) rotate(${currentRotation}deg)`;
  lightboxImg.style.transform = transform;
  updateZoomIndicator();
}

function resetTransform(){
  currentScale = 1;
  offsetX = 0;
  offsetY = 0;
  currentRotation = 0;
  fitScale = 1;
  viewerMode = 'fit';
  lightboxImg.style.transform = '';
  updateZoomIndicator();
}

function computeFitScale(){
  if(!lightboxImg.naturalWidth || !lightboxImg.naturalHeight || !lightboxImageWrap) return 1;
  const wrapRect = lightboxImageWrap.getBoundingClientRect();
  const iw = lightboxImg.naturalWidth;
  const ih = lightboxImg.naturalHeight;
  if(iw === 0 || ih === 0) return 1;
  const scaleX = wrapRect.width / iw;
  const scaleY = wrapRect.height / ih;
  // Never upscale beyond 1x when fitting
  return Math.min(scaleX, scaleY, 1);
}

function fitToScreen(){
  fitScale = computeFitScale();
  currentScale = fitScale;
  offsetX = 0;
  offsetY = 0;
  currentRotation = 0;
  viewerMode = 'fit';
  applyTransform();
}

function setActualSize(){
  currentScale = 1;
  offsetX = 0;
  offsetY = 0;
  currentRotation = 0;
  viewerMode = 'actual';
  applyTransform();
}

function rotate(delta){
  currentRotation = (currentRotation + delta + 360) % 360;
  applyTransform();
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

  // 尾声 image (bjws.png)
  const ep = el.dataset.epilogueImg;
  if(ep){
    epilogueImg.src = ep;
    epilogueImg.alt = name + ' 尾声';
    epilogueImg.style.display = '';
  } else {
    epilogueImg.src = '';
    epilogueImg.alt = '';
    epilogueImg.style.display = 'none';
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
  resetTransform();
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  if(openOriginal){
    openOriginal.href = src;
  }
  // focus the close button for keyboard users
  closeLightbox.focus();
}

function closeLightboxFunc(){
  lightbox.setAttribute('aria-hidden','true');
  // remove src to release memory and restore scrolling
  lightboxImg.src = '';
  resetTransform();
  document.body.style.overflow = '';
}

// zoom controls
function zoomIn(){
  currentScale = +(currentScale + SCALE_STEP).toFixed(2);
  applyTransform();
}
function zoomOut(){
  currentScale = +(currentScale - SCALE_STEP).toFixed(2);
  applyTransform();
}

// handle numeric percent input events to set zoom
if(zoomInput){
  // when typing or pasting, allow live feedback on Enter/blur
  function applyZoomFromInput(){
    const val = Number(zoomInput.value);
    if(isNaN(val)) return;
    const clamped = clampPercent(val);
    zoomInput.value = clamped;
    currentScale = +(clamped / 100);
    applyTransform();
  }

  zoomInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      applyZoomFromInput();
    } else if(e.key === 'Escape'){
      // revert to current scale readout
      const cur = Math.round(currentScale * 100);
      zoomInput.value = cur;
      zoomInput.blur();
    }
  });

  zoomInput.addEventListener('blur', applyZoomFromInput);
  // optional live change as user types (keeps indicator synced)
  zoomInput.addEventListener('input', ()=>{
    const val = Number(zoomInput.value);
    if(!isNaN(val)){
      const clamped = clampPercent(val);
      // show immediate indicator but don't apply heavy transforms until blur/enter
      zoomIndicator.textContent = `${clamped}%`;
    }
  });
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

// epilogue image opens in lightbox as well
epilogueImg?.addEventListener('click', ()=> openLightbox(epilogueImg.src, epilogueImg.alt));
epilogueImg?.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(epilogueImg.src, epilogueImg.alt); } });

closeLightbox.addEventListener('click', closeLightboxFunc);
lightbox.addEventListener('click', (e)=>{
  // clicking outside inner area should close
  if(e.target === lightbox) closeLightboxFunc();
});

// zoom buttons
zoomInBtn?.addEventListener('click', zoomIn);
zoomOutBtn?.addEventListener('click', zoomOut);

// drag-to-pan for zoomed image
lightboxImg.addEventListener('pointerdown', (e)=>{
  if(currentScale <= 1) return;
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOriginX = offsetX;
  dragOriginY = offsetY;
  lightboxImg.setPointerCapture(e.pointerId);
});

lightboxImg.addEventListener('pointermove', (e)=>{
  if(!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  offsetX = dragOriginX + dx;
  offsetY = dragOriginY + dy;
  applyTransform();
});

function endDrag(e){
  if(!isDragging) return;
  isDragging = false;
  try{
    lightboxImg.releasePointerCapture(e.pointerId);
  }catch(_){}
}

lightboxImg.addEventListener('pointerup', endDrag);
lightboxImg.addEventListener('pointercancel', endDrag);

 // wheel scroll to pan image
lightbox.addEventListener('wheel', (e)=>{
  if(lightbox.getAttribute('aria-hidden') === 'true') return;
  e.preventDefault();
  // Scroll-like panning: wheel up/down moves image up/down, shift or trackpad horizontal scroll moves left/right
  const PAN_FACTOR = 1;
  offsetY += -e.deltaY * PAN_FACTOR;
  offsetX += -e.deltaX * PAN_FACTOR;
  applyTransform();
}, { passive:false });

// clicking image when not zoomed closes, when zoomed resets position
lightboxImg.addEventListener('click', ()=> {
  if(Math.abs(currentScale - 1) < 0.01) {
    closeLightboxFunc();
  } else {
    resetTransform();
    applyTransform();
  }
});