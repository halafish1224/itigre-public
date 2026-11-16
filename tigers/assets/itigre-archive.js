
(()=>{'use strict';
const cards=[...document.querySelectorAll('.archive-card')];
const pos=document.querySelector('#filter-pos'),era=document.querySelector('#filter-era'),search=document.querySelector('#filter-search');
const normalize=s=>s.normalize('NFKC').toLocaleLowerCase().trim();
function filter(){if(!pos||!era||!search)return;const words=normalize(search.value).split(/\s+/).filter(Boolean);let count=0;cards.forEach(card=>{const show=(!pos.value||card.dataset.pos===pos.value)&&(!era.value||card.dataset.era.split(' ').includes(era.value))&&words.every(w=>normalize(card.dataset.search).includes(w));card.hidden=!show;if(show)count++;});document.querySelector('#filter-count').textContent=`顯示 ${count} / ${cards.length} 份人物檔案`;document.querySelector('#filter-empty').hidden=count!==0;}
[pos,era,search].filter(Boolean).forEach(n=>n.addEventListener('input',filter));
document.querySelector('#filter-reset')?.addEventListener('click',()=>{pos.value=era.value=search.value='';filter();});filter();
cards.forEach(card=>card.querySelectorAll('.flip-toggle').forEach(button=>button.addEventListener('click',()=>{const flipped=card.classList.toggle('is-flipped'),front=card.querySelector('.card-front'),back=card.querySelector('.card-back');front.inert=flipped;back.inert=!flipped;card.querySelectorAll('.flip-toggle').forEach(b=>b.setAttribute('aria-expanded',String(flipped)));(flipped?back:front).querySelector('.flip-toggle').focus();})));
let dialog,opener;
function close(){dialog.close();opener?.focus();}
document.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{opener=button;if(!dialog){dialog=document.createElement('dialog');dialog.className='archive-lightbox';dialog.setAttribute('aria-label','館藏影像檢視');const closeButton=document.createElement('button');closeButton.type='button';closeButton.textContent='關閉 ×';closeButton.addEventListener('click',close);dialog.append(closeButton,document.createElement('img'),document.createElement('p'));document.body.append(dialog);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});dialog.addEventListener('close',()=>opener?.focus());}const img=dialog.querySelector('img');img.src=button.dataset.lightbox;img.alt=button.querySelector('img')?.alt||'館藏影像';dialog.querySelector('p').textContent=button.closest('figure')?.querySelector('figcaption')?.textContent||img.alt;dialog.showModal();}));
document.querySelectorAll('.gallery img').forEach(img=>img.addEventListener('error',()=>{const label=document.createElement('p');label.className='pending';label.textContent='影像史料待補';img.closest('button').replaceWith(label);}));
})();
