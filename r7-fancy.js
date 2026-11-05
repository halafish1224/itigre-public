(()=>{'use strict';
const root=document.getElementById('canon-r7-guide');if(!root)return;
const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
const scenes={
 street:{mode:'c1',name:'白天街拍／走動人物',settings:'Tv · 1/250–1/500s · Auto ISO · Servo AF · 手持 IS ON',tip:'先保住步伐與表情；確認快門、焦點與臉部曝光，再微調 ISO 上限。'},
 panning:{mode:'c1',name:'慢速追焦／搖攝',settings:'Tv · 1/15–1/60s 起試 · Auto ISO · Servo AF',tip:'可從 1/30s 起試，以腰部平穩跟隨主體。主體速度、距離與焦距都會影響成功率；長焦時提高快門再比較。'},
 stage:{mode:'c2',name:'舞台歌手／動態表演',settings:'M + Auto ISO · 1/500s 起試 · 可用最大光圈 · Servo AF',tip:'先確認臉部高光。短暫遮擋可試追蹤靈敏度 −1／−2；LED 條紋另以機械快門、防閃爍與快門速度試拍。'},
 'night-hand':{mode:'c3',name:'城市夜景／手持',settings:'M／Av · 廣角靜物 1/60s 起試 · Auto ISO · IS ON',tip:'這是廣角靜物起點，不保證每個焦距都清晰；長焦先提高快門。從腳架登錄值切過來時，要重新開啟 IS、改 ISO 與驅動模式。'},
 'night-tripod':{mode:'c3',name:'東京鐵塔／腳架夜景',settings:'M · 數秒曝光試拍 · f/8 起試 · ISO 100 · 2 秒自拍',tip:'依塔身高光調快門。此 SIGMA 16–300mm 固定腳架時停用 OS；其他鏡頭依各自手冊。風與腳架晃動仍需處理。'},
 'light-trail':{mode:'c3',name:'城市車軌／腳架長曝',settings:'M／Bulb · 數秒至數十秒試拍 · ISO 100 · 2 秒自拍／遙控',tip:'先觀察車流與環境亮度，再調快門與光圈。此 SIGMA 的固定腳架／Bulb 場景停用 OS；試拍檢查高光與震動。'}
};
const modes={c1:'動態優先',c2:'舞台優先',c3:'靜態優先'};
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const activate=mode=>{all('.nav-btn').forEach(a=>{if(a.hash==='#mode-'+mode)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});all('article[id^="mode-"]').forEach(a=>a.classList.toggle('r7-active',a.id==='mode-'+mode));};
function render(){const s=scenes[q('#r7-scene').value]||scenes.street;q('.r7-result').dataset.mode=s.mode;q('#r7-result-mode').textContent=s.mode.toUpperCase()+' · '+modes[s.mode];q('#r7-result-title').textContent=s.name;q('#r7-result-settings').textContent=s.settings;q('#r7-result-tip').textContent=s.tip;q('#r7-result-link').href='#mode-'+s.mode;q('#r7-result-link').textContent='查看 '+s.mode.toUpperCase()+' 詳細設定';q('#r7-copy-fallback').hidden=true;q('#r7-fallback-label').hidden=true;q('#r7-status').textContent='';activate(s.mode);}
q('#r7-scene').addEventListener('change',render);
q('#r7-reset').addEventListener('click',()=>{q('#r7-scene').value='street';render();q('#r7-scene').focus();q('#r7-status').textContent='已回到白天街拍情境。';});
q('#r7-copy').addEventListener('click',async()=>{const s=scenes[q('#r7-scene').value];const text='Canon EOS R7｜'+s.name+'\n'+s.mode.toUpperCase()+' · '+modes[s.mode]+'\n'+s.settings+'\n'+s.tip+'\n數字為試拍起點，請自行在相機設定。';try{if(!navigator.clipboard?.writeText)throw new Error('manual');await navigator.clipboard.writeText(text);q('#r7-status').textContent='已複製情境參數與提醒。';}catch{const t=q('#r7-copy-fallback');t.value=text;t.hidden=false;q('#r7-fallback-label').hidden=false;t.focus();t.select();q('#r7-status').textContent='請複製下方已選取的參數文字。';}});
all('a[href^="#mode-"]').forEach(a=>a.addEventListener('click',event=>{const target=q(a.getAttribute('href'));if(!target)return;event.preventDefault();try{if(window.location.hash!==a.hash)window.history.pushState(null,'',a.hash);}catch{}activate(target.id.slice(5));target.focus({preventScroll:true});target.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'});}));
if('IntersectionObserver'in window){const observer=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){if(!reduced())e.target.classList.add('r7-enter');observer.unobserve(e.target);}});},{threshold:.08});all('.card').forEach(el=>observer.observe(el));}
render();root.dataset.enhanced='true';
})();
