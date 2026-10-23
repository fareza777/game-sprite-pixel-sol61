import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const counts={},kinds={};let total=0;
for(const line of fs.readFileSync(path.join(root,'art','mcp-audit.jsonl'),'utf8').trim().split('\n')){
 const r=JSON.parse(line);counts[r.name]=(counts[r.name]??0)+1;total++;
 if(r.name==='draw')for(const op of r.arguments.ops)kinds[op.kind]=(kinds[op.kind]??0)+1;
}
const files={};for(const folder of ['art','assets'])for(const name of fs.readdirSync(path.join(root,folder))){if(!/\.(aseprite|png|json)$/.test(name)||name==='provenance.json')continue;files[`${folder}/${name}`]=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,folder,name))).digest('hex');}
fs.writeFileSync(path.join(root,'art','provenance.json'),JSON.stringify({project:'Cinder Vow',created:'2026-10-23',method:'Hand-authored pixel grids and drawing primitives through Aseprite MCP JSON-RPC',server:'@pebbly/aseprite-ai-artist 0.8.2',aseprite:'1.3.18.6-dev',mode:'headless (chosen at session startup)',totalMcpCalls:total,tools:counts,drawingOperations:kinds,sha256:files},null,2));
console.log('Provenance recorded:',total,'MCP calls;',kinds.grid,'authored pixel grids.');
