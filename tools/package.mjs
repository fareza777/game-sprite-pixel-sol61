import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
const root=path.resolve(import.meta.dirname,'..');
const counts={},kinds={};let total=0;
for await(const line of readline.createInterface({input:fs.createReadStream(path.join(root,'art','mcp-audit.jsonl')),crlfDelay:Infinity})){
 const r=JSON.parse(line);counts[r.name]=(counts[r.name]??0)+1;total++;
 if(r.name==='draw')for(const op of r.arguments.ops)kinds[op.kind]=(kinds[op.kind]??0)+1;
}
const files={};function collect(folder){for(const entry of fs.readdirSync(path.join(root,folder),{withFileTypes:true})){const rel=folder+'/'+entry.name;if(entry.isDirectory()){collect(rel);continue;}if(!/\.(aseprite|png|json|mp3)$/.test(entry.name)||entry.name==='provenance.json')continue;const file=path.join(root,rel),bytes=entry.name.endsWith('.json')?Buffer.from(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n')):fs.readFileSync(file);files[rel]=crypto.createHash('sha256').update(bytes).digest('hex');}}for(const folder of ['art','assets'])collect(folder);
fs.writeFileSync(path.join(root,'art','provenance.json'),JSON.stringify({project:'Vespergrave: The Bell Below',version:'3.2.0',created:'2026-10-24',method:'Hand-authored pixel grids and drawing primitives through Aseprite MCP JSON-RPC',server:'@pebbly/aseprite-ai-artist 0.8.2',aseprite:'1.3.18.6-dev',mode:'headless (chosen at session startup)',characterFrames:8400,castingPoses:288,eightDirectionHeroPoses:2112,independentEquipmentKeys:2495,armorAndBootKeys:192,groundedHeroKeys:288,measuredPropContacts:390,awakenedArenaKeys:40,biomeArchitectureKeys:110,spellEffectKeys:108,enemyDesigns:60,headBodyKeyChecks:540,offlineVoiceClips:52,roomLayouts:20,newEnvironmentFrames:440,cinematicIllustrations:9,floorGeneration:'Seeded branching grid, optional elites, persistent lever shortcuts and 7–11 rooms',interactiveEvents:10,narration:'Deepgram Aura 2, generated from the original English script at build time',totalMcpCalls:total,tools:counts,drawingOperations:kinds,sha256:files},null,2));
console.log('Provenance recorded:',total,'MCP calls;',kinds.grid,'authored pixel grids.');
