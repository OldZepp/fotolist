/* PhotoList photo gallery, local assets only. */
(() => {
  'use strict';
  const layer=document.getElementById('photo-lightbox');
  const photo=layer.querySelector('#lightbox-image');
  const caption=layer.querySelector('#lightbox-caption');
  const counter=layer.querySelector('#lightbox-count');
  const closer=layer.querySelector('.lightbox-close');
  const prev=layer.querySelector('.lightbox-prev');
  const next=layer.querySelector('.lightbox-next');
  const triggers=Array.from(document.querySelectorAll('.photo-open'));
  let current=0, origin=null, startX=null;
  const items=triggers.map(btn=>({src:btn.querySelector('img').getAttribute('src'),alt:btn.querySelector('img').alt}));
  function show(i){
    current=(i+items.length)%items.length;
    photo.src=items[current].src;
    photo.alt=items[current].alt;
    caption.textContent=items[current].alt;
    counter.textContent=(current+1)+' / '+items.length;
  }
  function open(i){
    origin=document.activeElement;
    show(i);
    layer.hidden=false;
    layer.setAttribute('aria-hidden','false');
    document.body.classList.add('lightbox-locked');
    closer.focus();
  }
  function close(){
    layer.hidden=true;
    layer.setAttribute('aria-hidden','true');
    document.body.classList.remove('lightbox-locked');
    photo.removeAttribute('src');
    if(origin && origin.isConnected)origin.focus();
  }
  triggers.forEach((el,i)=>el.addEventListener('click',()=>open(i)));
  closer.addEventListener('click',close);
  prev.addEventListener('click',()=>show(current-1));
  next.addEventListener('click',()=>show(current+1));
  layer.querySelector('.lightbox-backdrop').addEventListener('click',close);
  document.addEventListener('keydown',e=>{
    if(layer.hidden)return;
    if(e.key==='Escape'){e.preventDefault();close()}
    else if(e.key==='ArrowLeft'){e.preventDefault();show(current-1)}
    else if(e.key==='ArrowRight'){e.preventDefault();show(current+1)}
    else if(e.key==='Tab'){
      const focusables=[closer,prev,next];const n=focusables.indexOf(document.activeElement);
      if(e.shiftKey && (n===0 || n===-1)){e.preventDefault();next.focus()}
      else if(!e.shiftKey && (n===2 || n===-1)){e.preventDefault();closer.focus()}
    }
  });
  layer.addEventListener('touchstart',e=>{if(e.touches.length===1)startX=e.touches[0].clientX},{passive:true});
  layer.addEventListener('touchend',e=>{
    if(startX===null||e.changedTouches.length!==1)return;
    const dx=e.changedTouches[0].clientX-startX;startX=null;
    if(Math.abs(dx)>65)show(current+(dx<0?1:-1));
  },{passive:true});
})();
