import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {VO_SCRIPT} from '../game/content.mjs';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'assets','vo');fs.mkdirSync(dir,{recursive:true});
const manifestFile=path.join(dir,'manifest.json'),previous=fs.existsSync(manifestFile)?JSON.parse(fs.readFileSync(manifestFile,'utf8')):{clips:{}};
const manifest={provider:'Deepgram Aura 2',language:'en',generated:new Date().toISOString().slice(0,10),clips:{...previous.clips}};
async function saveManifest(){for(let attempt=0;;attempt++){try{fs.writeFileSync(manifestFile+'.pending',JSON.stringify(manifest,null,2));fs.renameSync(manifestFile+'.pending',manifestFile);return;}catch(error){if(attempt===5)throw error;await new Promise(resolve=>setTimeout(resolve,200*(attempt+1)));}}}
for(const clip of VO_SCRIPT){
 const digest=crypto.createHash('sha256').update(clip.voice+'\n'+clip.text).digest('hex'),file=path.join(dir,clip.id+'.mp3');
 if(clip.text.length>2000)throw new Error('Narration exceeds Deepgram character limit');
 if(previous.clips[clip.id]?.scriptHash===digest&&fs.existsSync(file)){manifest.clips[clip.id]=previous.clips[clip.id];continue;}
 if(!process.env.DEEPGRAM_API_KEY)throw new Error('Set DEEPGRAM_API_KEY only in the build process environment.');
 const response=await fetch(`https://api.deepgram.com/v1/speak?model=${clip.voice}&encoding=mp3`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Token ${process.env.DEEPGRAM_API_KEY}`},body:JSON.stringify({text:clip.text}),signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw new Error(`Deepgram ${response.status}: ${(await response.text()).slice(0,400)}`);
 if(!response.headers.get('content-type')?.startsWith('audio/'))throw new Error('Deepgram returned non-audio content');
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<1000)throw new Error('Narration audio is unexpectedly short');fs.writeFileSync(file,bytes);
 manifest.clips[clip.id]={file:`assets/vo/${clip.id}.mp3`,voice:clip.voice,text:clip.text,scriptHash:digest,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 await saveManifest();console.log('Narrated',clip.id,bytes.length,'bytes');
}
manifest.clips=Object.fromEntries(VO_SCRIPT.map(c=>[c.id,manifest.clips[c.id]]));await saveManifest();console.log('VO ready:',Object.keys(manifest.clips).length,'offline narration clips.');
