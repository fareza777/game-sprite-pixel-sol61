import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),dest=path.join(root,'delivery','Cinder Vow 2.1.0');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8',windowsHide:true}).split('\0').filter(Boolean);
if(!files.length)throw new Error('Stage the release files before preparing a delivery archive.');
fs.mkdirSync(dest,{recursive:true});const hashes={};
for(const name of files){
 const target=path.resolve(dest,name);if(!target.startsWith(dest+path.sep))throw new Error('Invalid archive path');
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,name),target);
 hashes[name]=crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
}
fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify({project:'Cinder Vow',version:'2.1.0',date:'2026-10-23',characterFrames:528,asepriteSources:files.filter(x=>x.startsWith('art/')&&x.endsWith('.aseprite')).length,androidApk:'releases/CinderVow-2.1.0.apk',sha256:hashes},null,2));
console.log('Prepared',files.length+1,'files at',dest);
