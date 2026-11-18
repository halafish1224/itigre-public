/**
 * Tokyo 2026 itinerary draft operations, independent of CMS and Google Sheets.
 * This module NEVER saves, publishes, or alters the original sourceCell.
 * The three-way Sheet/site/CMS transaction must be verified separately.
 */
export const DATES = Object.freeze(Array.from({length:14},(_,i)=>`2026-12-${String(i+13).padStart(2,'0')}`));
export const START_MIN = 360;
export const END_MIN = 1380;
const HMS = /^([01]\d|2[0-3]):([0-5]\d)$/;
export function minutes(value) {
  if (typeof value !== 'string') throw new TypeError('time must be HH:MM');
  const m=HMS.exec(value);
  if(!m) throw new RangeError('time must be HH:MM');
  return Number(m[1])*60+Number(m[2]);
}
export function hhmm(value) {
  if(!Number.isInteger(value)||value<0||value>=1440) throw new RangeError('invalid minute');
  return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
}
export function snapMinute(minute,interval=15) {
  if (!Number.isFinite(minute)||!Number.isInteger(interval)||interval<1||60%interval!==0) throw new RangeError('invalid time or interval');
  return Math.round(minute/interval)*interval;
}
export function assertDays(days) {
  if(!Array.isArray(days)||days.length!==14) throw new Error('14 days required');
  const ids=new Set();
  for(let i=0;i<14;i++){
    const day=days[i];
    if(day?.date!==DATES[i]||!Array.isArray(day.events)) throw new Error('invalid day order');
    for(const ev of day.events){
      if(typeof ev?.id!=='string'||!ev.id||ids.has(ev.id)) throw new Error('missing or duplicate event id');
      if(typeof ev.title!=='string') throw new Error('invalid title');
      ids.add(ev.id);
      if(ev.time)minutes(ev.time);
      if(ev.endTime)minutes(ev.endTime);
    }
  }
  return days;
}
function compareTime(a,b) {
  return (a.time?minutes(a.time):1440)-(b.time?minutes(b.time):1440);
}
export function moveEvent(days,eventId,toDate,toTime,{endTime}={}) {
  assertDays(days);
  if(!DATES.includes(toDate)) throw new RangeError('target date outside the trip');
  const source=days.find(d=>d.events.some(e=>e.id===eventId));
  if(!source) throw new Error('event not found');
  const original=source.events.find(e=>e.id===eventId);
  // Unscheduled events may move between dates without inventing a time.
  if(toTime==='' && original.time) throw new RangeError('cannot erase a scheduled start time');
  const t=toTime===''?null:minutes(toTime);
  if(t!==null && (t<START_MIN||t>END_MIN)) throw new RangeError('time outside editable day');
  const length=original.time&&original.endTime?minutes(original.endTime)-minutes(original.time):null;
  if(length!==null && length<=0) throw new RangeError('invalid existing duration');
  const end=endTime===undefined?(length===null?undefined:hhmm(t+length)):endTime;
  if(end!==undefined && end!=='') {
    if(t===null || minutes(end)<=t) throw new RangeError('end time must be later than start');
  }
  const updated={...original,time:toTime};
  if(end!==undefined)updated.endTime=end;
  // Keep source cell for audited matching; never falsely reassign to a new Sheet cell.
  const baseline = original.cmsPendingMove || {
    fromDate: source.date, fromTime: original.time || '', sourceCell: original.cell || null
  };
  if (toDate !== baseline.fromDate || toTime !== baseline.fromTime) {
    // Preserve the ORIGINAL provenance through multiple draft moves.
    updated.cmsPendingMove = baseline;
  } else {
    // A move back to the original date and time clears the pending relocation.
    delete updated.cmsPendingMove;
  }
  const copy=days.map(day=>({...day,events:day.events.filter(e=>e.id!==eventId).map(e=>({...e}))}));
  copy.find(d=>d.date===toDate).events.push(updated);
  for(const day of copy) day.events.sort(compareTime);
  assertDays(copy);
  return copy;
}
export function addEvent(days, date, event) {
  assertDays(days);
  if(!DATES.includes(date)) throw new RangeError('target date outside the trip');
  if(!event || typeof event.id!=='string' || !/^cms-[a-zA-Z0-9-]{12,80}$/.test(event.id)) throw new Error('invalid CMS event id');
  if(days.some(d=>d.events.some(e=>e.id===event.id))) throw new Error('duplicate event id');
  if(typeof event.title!=='string'||!event.title.trim()) throw new Error('event title required');
  if(event.time)minutes(event.time);
  const result=days.map(d=>({...d,events:d.events.map(e=>({...e}))}));
  const created={id:event.id,time:event.time||'',title:event.title.trim(),note:event.note||'',cell:null,venueIds:[],origin:'cms',cmsPendingAdd:true};
  result.find(d=>d.date===date).events.push(created);
  result.find(d=>d.date===date).events.sort(compareTime);
  return assertDays(result);
}
export function editEvent(days,eventId,patch) {
  assertDays(days);
  if(!patch||typeof patch!=='object'||Array.isArray(patch)) throw new TypeError('invalid patch');
  const allowed=['title','note','map','endTime','group'];
  if(Object.keys(patch).some(key=>!allowed.includes(key))) throw new Error('field not editable here');
  if('title' in patch && (typeof patch.title!=='string'||!patch.title.trim())) throw new Error('event title required');
  if('endTime' in patch && patch.endTime) minutes(patch.endTime);
  const copy=days.map(d=>({...d,events:d.events.map(e=>{
    if(e.id!==eventId)return {...e};
    const next={...e,...patch};
    if(next.endTime && (!next.time || minutes(next.endTime)<=minutes(next.time))) throw new RangeError('end time must follow start');
    return next;
  })}));
  if(!copy.some(d=>d.events.some(e=>e.id===eventId))) throw new Error('event not found');
  assertDays(copy);
  return copy;
}
export function validateTimeline(days,{minTransferMinutes=30}={}) {
  assertDays(days);
  const warnings=[];
  for(const day of days){
    const events=day.events.filter(e=>e.time).slice().sort(compareTime);
    events.forEach(e=>{
      if(e.endTime && minutes(e.endTime)<=minutes(e.time))warnings.push({date:day.date,ids:[e.id],type:'bad_end'});
    });
    // Compare all time-nearby pairs, not only adjacent rows: A/B parallel
    // entries can sit between two conflicting activities in the same group.
    for(let i=0;i<events.length;i++){
      const a=events[i];
      if(!a.endTime)continue;
      const end=minutes(a.endTime);
      for(let j=i+1;j<events.length;j++){
        const b=events[j];
        const gap=minutes(b.time)-end;
        if(gap>=minTransferMinutes)break;
        if(a.group&&b.group&&a.group!==b.group&&a.group!=='all'&&b.group!=='all')continue;
        if(gap<0)warnings.push({date:day.date,ids:[a.id,b.id],type:'overlap',minutes:-gap});
        else warnings.push({date:day.date,ids:[a.id,b.id],type:'transfer_gap',minutes:gap});
      }
    }
  }
  return warnings;
}
