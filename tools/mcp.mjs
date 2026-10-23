import fs from 'node:fs';
export const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
export async function call(name, args={}) {
  const response = await fetch('http://127.0.0.1:3837', {method:'POST',body:JSON.stringify({name,arguments:args})});
  const r = await response.json();
  if(!response.ok || r.isError || r.error) throw new Error(`${name}: ${JSON.stringify(r).slice(0,2500)}`);
  return r;
}
export function data(r) { return r.structuredContent ?? JSON.parse(r.content.find(x=>x.type==='text').text); }
export function saveImages(r, filename) {
  let n=0;
  for(const c of r.content??[]) if(c.type==='image') fs.writeFileSync(filename.replace(/\.png$/, n++ ? `-${n}.png` : '.png'), Buffer.from(c.data,'base64'));
}
