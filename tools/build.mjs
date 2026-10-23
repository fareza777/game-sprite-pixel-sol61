import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const assets={};
for(const name of ['knight','hollow','wisp','warden','reliquary-props','fire','chapter-house','portrait-chapterhouse']){
 const image='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets',name+'.png')).toString('base64');
 const json=fs.existsSync(path.join(root,'assets',name+'.json'))?JSON.parse(fs.readFileSync(path.join(root,'assets',name+'.json'),'utf8')):{};
 assets[name]={...json,image};
}
const bundledFont=path.join(root,'assets','font.json');
const font=JSON.parse(fs.readFileSync(fs.existsSync(bundledFont)?bundledFont:'C:/Isprite Asset/aseprite-ai-artist/knowledge/fonts/pixel5x7.json','utf8'));
fs.writeFileSync(path.join(root,'assets','font.json'),JSON.stringify(font));
const core=fs.readFileSync(path.join(root,'game','core.mjs'),'utf8').replace(/^export /gm,'');
const touch=fs.readFileSync(path.join(root,'game','touch.mjs'),'utf8').replace(/^export /gm,'');
const client=fs.readFileSync(path.join(root,'game','client.mjs'),'utf8');
const icons={};for(const n of ['attack','block','roll','interact','pause','heart','boot','star','flask','sound','up','down','left','right'])icons[n]='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets','ui-'+n+'.png')).toString('base64');
const appIcon='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets','app-icon.png')).toString('base64');
let html=fs.readFileSync(path.join(root,'game','index.template.html'),'utf8').replace('__ASSETS__',JSON.stringify(assets)).replace('__FONT__',JSON.stringify(font)).replace('__ICONS__',JSON.stringify(icons)).replaceAll('__APP_ICON__',appIcon).replace('__MOBILE_CSS__',fs.readFileSync(path.join(root,'game','mobile.css'),'utf8')).replace('__TOUCH__',touch).replace('__CORE__',core).replace('__CLIENT__',client);
// Top-level await runs inside an async IIFE so the self-contained file also works over file://.
html=html.replace('<script>','<script>\n(async()=>{').replace('</script>','\n})().catch(e=>{document.getElementById("loading").hidden=false;document.getElementById("loading").textContent="Unable to load: "+e.message;console.error(e);});\n</script>');
fs.writeFileSync(path.join(root,'index.html'),html);console.log('Built self-contained index.html',Math.round(Buffer.byteLength(html)/1024)+' KB');
const atelier=fs.readFileSync(path.join(root,'game','atelier.template.html'),'utf8').replace('__ASSETS__',JSON.stringify(Object.fromEntries(Object.entries(assets).filter(([n])=>['knight','hollow','wisp','warden'].includes(n)))));
fs.writeFileSync(path.join(root,'atelier.html'),atelier);console.log('Built animation atelier.');
