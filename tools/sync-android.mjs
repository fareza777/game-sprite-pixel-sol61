import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),main=path.join(root,'android','app','src','main');
fs.mkdirSync(path.join(main,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'index.html'),path.join(main,'assets','index.html'));
for(const dir of ['mipmap-xxxhdpi','drawable-nodpi'])fs.mkdirSync(path.join(main,'res',dir),{recursive:true});
fs.copyFileSync(path.join(root,'assets','vespergrave-icon-256.png'),path.join(main,'res','mipmap-xxxhdpi','ic_launcher.png'));
fs.copyFileSync(path.join(root,'assets','vespergrave-icon-foreground.png'),path.join(main,'res','drawable-nodpi','ic_launcher_foreground.png'));
console.log('Synced offline game and MCP launcher artwork to Android.');
