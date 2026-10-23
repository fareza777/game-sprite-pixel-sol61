export class TouchInput {
 constructor(){this.padId=null;this.x=0;this.y=0;this.origin=null;this.radius=42;this.held=new Map();this.queued=new Set();}
 beginPad(id,x,y,radius=42){if(this.padId!==null)return false;this.origin={x,y};this.radius=radius;return this.setPad(id,0,0);}
 dragPad(id,x,y){
  if(id!==this.padId||!this.origin)return false;
  let dx=x-this.origin.x,dy=y-this.origin.y;const length=Math.hypot(dx,dy);
  // The base follows a thumb dragged beyond its radius, so reversing direction
  // never requires returning to the original touch point.
  if(length>this.radius){this.origin.x+=dx*(1-this.radius/length);this.origin.y+=dy*(1-this.radius/length);dx=x-this.origin.x;dy=y-this.origin.y;}
  return this.setPad(id,dx/this.radius,dy/this.radius);
 }
 setPad(id,x,y){if(this.padId!==null&&this.padId!==id)return false;this.padId=id;const length=Math.hypot(x,y);if(length<.22){this.x=0;this.y=0;}else{this.x=x/Math.max(1,length);this.y=y/Math.max(1,length);}return true;}
 release(id){if(id===this.padId){this.padId=null;this.x=0;this.y=0;this.origin=null;}this.held.delete(id);}
 press(id,action){this.held.set(id,action);if(action==='roll'||action==='interact')this.queued.add(action);}
 snapshot(){const held=new Set(this.held.values());return {up:this.y<-.35,down:this.y>.35,left:this.x<-.35,right:this.x>.35,attack:held.has('attack'),block:held.has('block'),roll:this.queued.has('roll'),interact:this.queued.has('interact')};}
 consume(){const input=this.snapshot();this.queued.clear();return input;}
 clear(){this.padId=null;this.x=0;this.y=0;this.origin=null;this.held.clear();this.queued.clear();}
}
export function bindTouchControls(touch,doc,onPause,canMove=()=>true){
 const pad=doc.getElementById('dpad'),surface=doc.getElementById('game');if(!pad||!surface)return;
 function capture(el,id){try{el.setPointerCapture(id);}catch{/* Synthetic test events have no browser pointer capture. */}}
 function showPad(){
  pad.hidden=touch.padId===null;pad.setAttribute('aria-hidden',String(pad.hidden));
  if(touch.origin){const r=surface.getBoundingClientRect();pad.style.left=`${touch.origin.x-r.left}px`;pad.style.top=`${touch.origin.y-r.top}px`;pad.style.setProperty('--thumb-x',`${touch.x*34}px`);pad.style.setProperty('--thumb-y',`${touch.y*34}px`);}
  const state=touch.snapshot();for(const dir of ['up','down','left','right'])pad.querySelector(`[data-direction="${dir}"]`)?.classList.toggle('held',state[dir]);
 }
 surface.addEventListener('pointerdown',e=>{if(!canMove()||e.button>0)return;e.preventDefault();if(touch.beginPad(e.pointerId,e.clientX,e.clientY)){capture(surface,e.pointerId);showPad();doc.body?.classList.add('has-moved');}});
 surface.addEventListener('pointermove',e=>{if(touch.padId===e.pointerId){e.preventDefault();touch.dragPad(e.pointerId,e.clientX,e.clientY);showPad();}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,e=>{touch.release(e.pointerId);showPad();});
 for(const el of doc.querySelectorAll('.touch-action[data-action]')){
  el.addEventListener('pointerdown',e=>{if(!canMove())return;e.preventDefault();capture(el,e.pointerId);touch.press(e.pointerId,el.dataset.action);el.classList.add('held');});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,e=>{touch.release(e.pointerId);el.classList.toggle('held',[...touch.held.values()].includes(el.dataset.action));});
  el.addEventListener('contextmenu',e=>e.preventDefault());
 }
 doc.getElementById('touch-pause').onclick=()=>{touch.clear();showPad();onPause();};
 // WebView may reroute cancellation away from the original captured element.
 // Capture-phase cleanup also covers fingers released over an overlay or another control.
 for(const event of ['pointerup','pointercancel'])doc.addEventListener(event,e=>{
  touch.release(e.pointerId);showPad();
  for(const el of doc.querySelectorAll('.touch-action[data-action]'))el.classList.toggle('held',[...touch.held.values()].includes(el.dataset.action));
 },true);
 return ()=>{touch.clear();showPad();for(const el of doc.querySelectorAll('.touch-action[data-action]'))el.classList.remove('held');};
}
