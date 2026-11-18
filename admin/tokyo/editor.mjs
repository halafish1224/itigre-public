import {DATES,START_MIN,END_MIN,minutes,hhmm,snapMinute,moveEvent,addEvent,editEvent,validateTimeline,assertDays} from './model.mjs';

/**
 * Self-contained timeline view for a future Sveltia field control.
 * No auth, storage, API writes or side effects outside the supplied container.
 * Changes are emitted to the owning CMS draft via onChange(), never published here.
 */
export function mountTokyoTimeline(container, initialDays, onChange) {
  assertDays(initialDays);
  if (!(container instanceof HTMLElement) || typeof onChange!=='function') throw new TypeError('container and onChange required');
  let days=initialDays;
  let selectedDate=DATES[0];
  let selectedId=null;
  let undoStack=[];
  const PX_PER_HOUR=70, LABEL_WIDTH=54, TOTAL=END_MIN-START_MIN;
  const el=(tag,cls,text)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(text!==undefined)node.textContent=text;
    return node;
  };
  const css=el('style');
  css.textContent=`
    .tokyo-editor{color:#162e29;font:15px/1.5 system-ui,sans-serif;background:#fffdf8;border:1px solid #ccd8d4;border-radius:12px;padding:12px;max-width:100%;min-width:0}
    .tokyo-editor *{box-sizing:border-box}
    .tokyo-editor button,.tokyo-editor select,.tokyo-editor input,.tokyo-editor textarea{font:inherit}
    .tokyo-editor button,.tokyo-editor select,.tokyo-editor input{min-height:44px}
    .tokyo-editor button{border:1px solid #789187;border-radius:7px;background:white;color:#163c32;padding:6px 11px;cursor:pointer}
    .tokyo-editor button:focus-visible,.tokyo-editor :is(input,select,textarea):focus-visible{outline:3px solid #bc742e;outline-offset:2px}
    .tokyo-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}
    .tokyo-toolbar select{flex:1;min-width:185px;border:1px solid #789187;border-radius:7px;background:white;color:#15362b;padding:8px}
    .tokyo-dates{display:flex;gap:6px;max-width:100%;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x proximity}
    .tokyo-dates button{scroll-snap-align:center;flex:0 0 74px;min-height:44px}
    .tokyo-dates button[aria-current="date"]{background:#163c32;color:white}
    .tokyo-hint{color:#36554c;font-size:13px;margin:6px 0 12px}
    .tokyo-status{font-size:13px;color:#8f3f23;font-weight:bold;min-height:20px}
    .tokyo-unplanned{padding:12px;background:#f4f3e9;border-top:1px solid #b9d0c3;display:grid;gap:8px}
    .tokyo-unplanned button{text-align:left;min-height:44px}
    .tokyo-viewport{max-height:590px;overflow-y:auto;border:1px solid #d6e1dc;border-radius:8px;background:repeating-linear-gradient(to bottom,#fff,#fff 69px,#d9e2dd 69px,#d9e2dd 70px)}
    .tokyo-day{position:relative;min-width:0;margin-left:${LABEL_WIDTH}px;height:${TOTAL/60*PX_PER_HOUR}px}
    .tokyo-tick{position:absolute;left:-${LABEL_WIDTH}px;transform:translateY(-7px);font-size:12px;color:#455e55;padding-left:5px}
    .tokyo-card{position:absolute;left:6px;right:6px;border:2px solid #49705c;border-radius:8px;background:#ebf7e7;box-shadow:0 1px 4px #0002;padding:4px 8px;overflow:hidden;display:flex;gap:6px;align-items:center;min-height:34px}
    .tokyo-card[data-active="true"]{background:#ffedce;border-color:#ad6427;z-index:2}
    .tokyo-card .tokyo-handle{flex:0 0 42px;touch-action:none;cursor:grab;padding:2px;border:1px dashed #47705c;border-radius:6px;background:#fff;font-size:13px;min-height:38px}
    .tokyo-card .tokyo-copy{flex:1;min-width:0;border:none;background:none;text-align:left;padding:0;min-height:36px}
    .tokyo-card .tokyo-copy strong{display:block;font-size:13px}
    .tokyo-card .tokyo-copy small{display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    .tokyo-editor .tokyo-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
    .tokyo-fields label{display:flex;flex-direction:column;gap:4px;font-size:13px}
    .tokyo-fields input,.tokyo-fields select,.tokyo-fields textarea{border:1px solid #7f938c;border-radius:6px;padding:8px;background:#fff;color:#172a24;width:100%}
    .tokyo-fields .tokyo-span{grid-column:1/-1}
    .tokyo-fields textarea{min-height:85px}
    @media(max-width:490px){.tokyo-editor{padding:8px}.tokyo-card .tokyo-handle{flex-basis:38px}.tokyo-card .tokyo-copy small{font-size:12px}.tokyo-toolbar select{width:100%}}
  `;
  container.append(css);
  const root=el('section','tokyo-editor');
  root.setAttribute('aria-label','東京行程拖曳時間編輯');
  container.append(root);
  const commit=(next)=>{
    undoStack.push(days);
    if(undoStack.length>30)undoStack.shift();
    days=next;
    onChange(days);
    draw();
  };
  const msg=(text)=>{status.textContent=text;};
  const toolbar=el('div','tokyo-toolbar'), dateSelect=el('select'), prev=el('button','', '前一天'),next=el('button','','後一天'),undo=el('button','','復原'),add=el('button','','新增一站');
  for(const d of DATES){const op=el('option','',d);op.value=d;dateSelect.append(op);}
  prev.type=next.type=undo.type=add.type='button';
  toolbar.append(prev,dateSelect,next,undo,add);
  const dateStrip=el('div','tokyo-dates');dateStrip.setAttribute('aria-label','可拖曳移動到的日期');
  const help=el('p','tokyo-hint','手機可按住「移動」拖曳，放到上方日期可跨日搬動；鍵盤 ↑↓ 每次移動 15 分鐘、←→ 跨日。也可直接輸入日期／時間，所有變更先存 CMS 草稿。');
  const status=el('div','tokyo-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const view=el('div','tokyo-viewport'),fields=el('section','tokyo-fields');
  view.setAttribute('aria-label','當日行程時間軸');
  root.append(toolbar,dateStrip,help,status,view,fields);
  dateSelect.addEventListener('change',()=>{selectedDate=dateSelect.value;selectedId=null;draw()});
  prev.addEventListener('click',()=>setDate(Math.max(0,DATES.indexOf(selectedDate)-1)));
  next.addEventListener('click',()=>setDate(Math.min(13,DATES.indexOf(selectedDate)+1)));
  undo.addEventListener('click',()=>{if(!undoStack.length)return;days=undoStack.pop();onChange(days);selectedId=null;draw();msg('已還原上一個草稿調整')});
  const setDate=i=>{selectedDate=DATES[i];selectedId=null;draw()};
  add.addEventListener('click',()=>{
    try {
      const id='cms-'+crypto.randomUUID();
      selectedId=id;
      commit(addEvent(days,selectedDate,{id,title:'待安排景點'}));
      msg('已新增未排時間的草稿站點，請填寫名稱及開始時間');
    } catch(error) {msg(error.message)}
  });
  function field(label,tag,value,listener,extra={}){
    const wrap=el('label','',label),inp=el(tag);inp.value=value??'';
    Object.entries(extra).forEach(([k,v])=>inp[k]=v);
    inp.addEventListener('change',()=>listener(inp.value));
    wrap.append(inp);return wrap;
  }
  function draw(){
    dateSelect.value=selectedDate;
    prev.disabled=selectedDate===DATES[0];
    next.disabled=selectedDate===DATES.at(-1);
    undo.disabled=!undoStack.length;
    dateStrip.replaceChildren();
    for (const d of DATES) {
      const btn=el('button','',d.slice(5));
      btn.type='button';btn.dataset.tokyoDropDate=d;
      if(d===selectedDate)btn.setAttribute('aria-current','date');
      btn.addEventListener('click',()=>{selectedDate=d;selectedId=null;draw()});
      dateStrip.append(btn);
    }
    view.replaceChildren();
    const day=el('div','tokyo-day');
    for(let m=START_MIN;m<=END_MIN;m+=60){
      const t=el('span','tokyo-tick',hhmm(m));
      t.style.top=`${(m-START_MIN)/60*PX_PER_HOUR}px`;day.append(t);
    }
    const current=days.find(d=>d.date===selectedDate);
    for(const event of current.events){
      if(!event.time)continue;
      let m;try{m=minutes(event.time)}catch{continue}
      if(m<START_MIN||m>END_MIN)continue;
      const duration=event.endTime?Math.max(30,minutes(event.endTime)-m):45;
      const card=el('div','tokyo-card');
      card.style.top=`${(m-START_MIN)/60*PX_PER_HOUR}px`;
      card.style.height=`${Math.max(46,Math.min(duration,100)/60*PX_PER_HOUR)}px`;
      card.dataset.active=String(event.id===selectedId);
      const handle=el('button','tokyo-handle','移動');
      handle.type='button';
      handle.setAttribute('aria-label',`拖曳調整 ${event.title} 的時間與日期`);
      handle.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown ArrowLeft ArrowRight');
      handle.addEventListener('keydown',e=>{
        const delta={ArrowUp:-15,ArrowDown:15}[e.key];
        const offset={ArrowLeft:-1,ArrowRight:1}[e.key];
        if(delta===undefined && offset===undefined)return;
        e.preventDefault();
        const targetDate=offset===undefined?selectedDate:DATES[Math.min(13,Math.max(0,DATES.indexOf(selectedDate)+offset))];
        const targetMinute=delta===undefined?m:Math.min(END_MIN,Math.max(START_MIN,m+delta));
        if(targetDate===selectedDate&&targetMinute===m)return;
        try {
          const next=moveEvent(days,event.id,targetDate,hhmm(targetMinute));
          selectedId=event.id;selectedDate=targetDate;
          commit(next);
          msg(`已移至 ${targetDate} ${hhmm(targetMinute)}（草稿）`);
        } catch(err){msg(err.message)}
      });
      const copy=el('button','tokyo-copy'),title=el('small','',event.title);
      copy.type='button';
      copy.append(el('strong','',event.time),title);
      copy.addEventListener('click',()=>{selectedId=event.id;draw();view.scrollTop=Math.max(0,(m-START_MIN)/60*PX_PER_HOUR-100)});
      handle.addEventListener('pointerdown',e=>{
        if(e.button!==0)return;
        const startY=e.clientY;
        const startScroll=view.scrollTop;
        handle.setPointerCapture(e.pointerId);
        card.style.opacity='0.65';
        handle.onpointermove=move=>{
          if(!handle.hasPointerCapture(move.pointerId))return;
          const bounds=view.getBoundingClientRect();
          if(move.clientY>bounds.top && move.clientY<bounds.bottom){
            if(move.clientY>bounds.bottom-36)view.scrollTop+=24;
            else if(move.clientY<bounds.top+36)view.scrollTop-=24;
          }
          card.style.transform=`translateY(${move.clientY-startY}px)`;
        };
        handle.onpointerup=up=>{
          handle.onpointermove=handle.onpointerup=null;
          card.style.transform='';
          card.style.opacity='';
          if(!handle.hasPointerCapture(up.pointerId))return;
          handle.releasePointerCapture(up.pointerId);
          const movement=up.clientY-startY+(view.scrollTop-startScroll);
          if(Math.abs(movement)<8){selectedId=event.id;draw();return}
          const drop=document.elementFromPoint(up.clientX,up.clientY)?.closest('[data-tokyo-drop-date]');
          const targetDate=drop && DATES.includes(drop.dataset.tokyoDropDate)?drop.dataset.tokyoDropDate:selectedDate;
          const target=targetDate===selectedDate?snapMinute(Math.min(END_MIN,Math.max(START_MIN,m+(movement/PX_PER_HOUR)*60))):m;
          try{commit(moveEvent(days,event.id,targetDate,hhmm(target)));selectedId=event.id;selectedDate=targetDate;draw();msg(`已將「${event.title}」調整至 ${hhmm(target)}（草稿）`)}
          catch(ex){draw();msg(ex.message)}
        };
        handle.onpointercancel=()=>{handle.onpointermove=handle.onpointerup=null;draw()};
      });
      card.append(handle,copy);day.append(card);
    }
    view.append(day);
    const unplanned=current.events.filter(e=>!e.time);
    if(unplanned.length){
      const pane=el('div','tokyo-unplanned');
      pane.append(el('strong','',`未排時間（${unplanned.length}）`));
      for(const e of unplanned){
        const b=el('button','',e.title||e.id);
        b.type='button';
        b.addEventListener('click',()=>{selectedId=e.id;draw();});
        pane.append(b);
      }
      view.append(pane);
    }
    fields.replaceChildren();
    const chosen=days.flatMap(d=>d.events.map(e=>({date:d.date,event:e}))).find(x=>x.event.id===selectedId);
    if(chosen){
      const e=chosen.event;
      const edit=(patch)=>{try{commit(editEvent(days,e.id,patch));msg('欄位已更新到 CMS 草稿')}catch(err){msg(err.message)}};
      fields.append(
        field('景點／行程','input',e.title,v=>edit({title:v})),
        field('日期','select',chosen.date,v=>{try{commit(moveEvent(days,e.id,v,e.time));selectedDate=v;msg('已跨日期移動（草稿）')}catch(err){msg(err.message)}},{})
      );
      // Populate the date select after it is created.
      const target=fields.lastElementChild.querySelector('select');
      for(const d of DATES){const op=el('option','',d);op.value=d;target.append(op)}
      target.value=chosen.date;
      const groupField=field('同行分流','select',e.group||'all',v=>edit({group:v}));
      const groupSelect=groupField.querySelector('select');
      const groups=[['all','全員'],['A','A 組'],['B','B 組']];
      if(e.group&&!groups.some(x=>x[0]===e.group))groups.push([e.group,e.group]);
      for(const [value,label] of groups){
        const option=el('option','',label);option.value=value;groupSelect.append(option);
      }
      groupSelect.value=e.group||'all';
      fields.append(
        field('開始時間','input',e.time,v=>{try{commit(moveEvent(days,e.id,selectedDate,v));msg('開始時間已更新（草稿）')}catch(err){msg(err.message)}},{type:'time',step:900}),
        field('結束時間','input',e.endTime||'',v=>edit({endTime:v}),{type:'time',step:900}),
        groupField,
        field('地圖連結','input',e.map||'',v=>edit({map:v}),{type:'url'}),
        field('備註','textarea',e.note||'',v=>edit({note:v}),{})
      );
      fields.lastElementChild.classList.add('tokyo-span');
    }
    const warn=validateTimeline(days).filter(w=>w.date===selectedDate);
    if(warn.length){status.textContent=`當日有 ${warn.length} 項時間重疊／轉乘緩衝提示，請在發布前檢查`;}
  }
  draw();
  return {getDays:()=>days,destroy:()=>container.replaceChildren()};
}
