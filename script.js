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
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.setAttribute('aria-hidden','false');
  closeLightbox.focus();
}

function closeLightboxFunc(){
  lightbox.setAttribute('aria-hidden','true');
  // remove src to release memory
  lightboxImg.src = '';
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
});

accusationThumb.addEventListener('click', ()=> openLightbox(accusationThumb.src, accusationThumb.alt));
accusationThumb.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(accusationThumb.src, accusationThumb.alt); } });

// additional image opens in lightbox as well
additionalImg.addEventListener('click', ()=> openLightbox(additionalImg.src, additionalImg.alt));
additionalImg.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(additionalImg.src, additionalImg.alt); } });

closeLightbox.addEventListener('click', closeLightboxFunc);
lightbox.addEventListener('click', (e)=>{
  if(e.target === lightbox) closeLightboxFunc();
});