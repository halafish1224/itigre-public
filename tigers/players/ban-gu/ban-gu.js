(()=>{'use strict';
const tabs=[...document.querySelectorAll('[data-season-tab]')];
const panel=document.querySelector('#season-panel');
function selectSeason(tab,focus=false){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;});document.querySelectorAll('tr[data-season]').forEach(row=>{row.hidden=row.dataset.season!==tab.dataset.seasonTab;});panel.setAttribute('aria-labelledby',tab.id);if(focus)tab.focus();}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectSeason(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectSeason(tabs[next],true);}});});
const filters=[...document.querySelectorAll('[data-gallery-filter]')];
const figures=[...document.querySelectorAll('.museum-vitrine')];
let category='all';
function filterGallery(value){category=value;let count=0;filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.galleryFilter===value)));figures.forEach(f=>{f.hidden=value!=='all'&&f.dataset.category!==value;if(!f.hidden)count++;});document.querySelector('#gallery-count').textContent=`展出 ${count} 件影像`;document.querySelector('.empty-collection').hidden=count!==0;}
filters.forEach(button=>button.addEventListener('click',()=>filterGallery(button.dataset.galleryFilter)));
document.querySelector('[data-show-all]').addEventListener('click',()=>{filterGallery('all');filters[0].focus();});
const items=JSON.parse(document.querySelector('#collection-data').textContent);
const dialog=document.querySelector('.artifact-dialog');
const image=dialog.querySelector('.dialog-image'),back=dialog.querySelector('.dialog-back'),stage=dialog.querySelector('.dialog-image-stage'),flipper=dialog.querySelector('.artifact-flipper'),flipButton=dialog.querySelector('.flip-artifact'),zoomButton=dialog.querySelector('.zoom-toggle');
let current,opener,activeItems=items;
function resetView(){stage.classList.remove('zoomed');flipper.classList.remove('flipped');zoomButton.setAttribute('aria-pressed','false');zoomButton.textContent='放大細節 ＋';flipButton.setAttribute('aria-pressed','false');flipButton.textContent='檢視卡背 ↻';}
function showItem(item){current=item;resetView();image.src=`images/${item.file}`;image.alt=item.alt;dialog.querySelector('#dialog-title').textContent=item.title;const sourceFigure=document.querySelector(`[data-item="${item.id}"]`);dialog.querySelector('.dialog-caption').replaceChildren(sourceFigure.querySelector('.caption-plate').cloneNode(true));dialog.querySelector('.dialog-source').href=item.source;dialog.querySelector('.dialog-position').textContent=`${String(activeItems.indexOf(item)+1).padStart(2,'0')} / ${String(activeItems.length).padStart(2,'0')}`;back.hidden=!item.back;flipButton.hidden=!item.back;if(item.back){back.src=`images/${item.back}`;back.alt=item.backAlt||`${item.title}（背面）`;}else back.removeAttribute('src');dialog.querySelector('.dialog-back-note').textContent=item.type==='card'&&!item.back?'目前僅收錄卡片正面，對應卡背待補。':'';}
document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{const item=items.find(i=>i.id===button.dataset.open);if(!item)return;opener=button;activeItems=items.filter(i=>category==='all'||i.type===category);if(!activeItems.includes(item))activeItems=items;showItem(item);dialog.showModal();document.body.classList.add('dialog-open');}));
function close(){dialog.close();}
dialog.querySelector('.dialog-close').addEventListener('click',close);
dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');resetView();opener?.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
function advance(direction){showItem(activeItems[(activeItems.indexOf(current)+direction+activeItems.length)%activeItems.length]);}
dialog.querySelector('.previous-artifact').addEventListener('click',()=>advance(-1));dialog.querySelector('.next-artifact').addEventListener('click',()=>advance(1));
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();advance(-1);}if(e.key==='ArrowRight'){e.preventDefault();advance(1);}});
zoomButton.addEventListener('click',()=>{const zoomed=stage.classList.toggle('zoomed');zoomButton.setAttribute('aria-pressed',String(zoomed));zoomButton.textContent=zoomed?'恢復全圖 −':'放大細節 ＋';});
flipButton.addEventListener('click',()=>{if(!current.back)return;const flipped=flipper.classList.toggle('flipped');flipButton.setAttribute('aria-pressed',String(flipped));flipButton.textContent=flipped?'返回卡片正面 ↻':'檢視卡背 ↻';});
const navLinks=[...document.querySelectorAll('.section-nav a')];
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>{if(a.hash===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-10% 0px -55% 0px',threshold:0});
document.querySelectorAll('main>section').forEach(s=>observer.observe(s));
document.querySelectorAll('.artifact-open img').forEach(img=>img.addEventListener('error',()=>{img.closest('.vitrine-stage').classList.add('image-unavailable');const note=document.createElement('span');note.textContent='影像暫時無法載入，請查看原出處';img.replaceWith(note);}));
})();
