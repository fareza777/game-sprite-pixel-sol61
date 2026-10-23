export class TouchInput {
 constructor(){this.padId=null;this.x=0;this.y=0;this.held=new Map();this.queued=new Set();}
 setPad(id,x,y){if(this.padId!==null&&this.padId!==id)return false;this.padId=id;const length=Math.hypot(x,y);if(length<.22){this.x=0;this.y=0;}else{this.x=x/Math.max(1,length);this.y=y/Math.max(1,length);}return true;}
 release(id){if(id===this.padId){this.padId=null;this.x=0;this.y=0;}this.held.delete(id);}
 press(id,action){this.held.set(id,action);if(action==='roll'||action==='interact')this.queued.add(action);}
 snapshot(){const held=new Set(this.held.values());return {up:this.y<-.35,down:this.y>.35,left:this.x<-.35,right:this.x>.35,attack:held.has('attack'),block:held.has('block'),roll:this.queued.has('roll'),interact:this.queued.has('interact')};}
 consume(){const input=this.snapshot();this.queued.clear();return input;}
 clear(){this.padId=null;this.x=0;this.y=0;this.held.clear();this.queued.clear();}
}
export function bindTouchControls(touch,doc,onPause){
 const pad=doc.getElementById('dpad');if(!pad)return;
 function capture(el,id){try{el.setPointerCapture(id);}catch{/* Synthetic test events have no browser pointer capture. */}}
 function showPad(){const state=touch.snapshot();for(const dir of ['up','down','left','right'])pad.querySelector(`[data-direction="${dir}"]`)?.classList.toggle('held',state[dir]);}
 function move(e){const r=pad.getBoundingClientRect();if(touch.setPad(e.pointerId,(e.clientX-r.left-r.width/2)/(r.width*.43),(e.clientY-r.top-r.height/2)/(r.height*.43)))showPad();}
 pad.addEventListener('pointerdown',e=>{e.preventDefault();capture(pad,e.pointerId);move(e);});
 pad.addEventListener('pointermove',e=>{if(touch.padId===e.pointerId){e.preventDefault();move(e);}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,e=>{touch.release(e.pointerId);showPad();});
 for(const el of doc.querySelectorAll('.touch-action[data-action]')){
  el.addEventListener('pointerdown',e=>{e.preventDefault();capture(el,e.pointerId);touch.press(e.pointerId,el.dataset.action);el.classList.add('held');});
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
