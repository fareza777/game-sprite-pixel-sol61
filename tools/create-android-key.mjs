import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const folder=path.join(os.homedir(),'.android','cinder-vow'),props=path.join(folder,'signing.properties');
if(fs.existsSync(props)){console.log('Using the existing private Android signing key.');process.exit(0);}
fs.mkdirSync(folder,{recursive:true});
const password=crypto.randomBytes(24).toString('hex'),passwordFile=path.join(folder,'keytool-password.tmp'),keyFile=path.join(folder,'release.jks');
fs.writeFileSync(passwordFile,password,{mode:0o600});
const keytool=path.join(process.env.JAVA_HOME??'C:/Program Files/Eclipse Adoptium/jdk-17.0.20.101-hotspot','bin','keytool.exe');
const result=spawnSync(keytool,['-genkeypair','-keystore',keyFile,'-storetype','JKS','-alias','cindervow','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Cinder Vow, O=Fareza777','-storepass:file',passwordFile,'-keypass:file',passwordFile],{encoding:'utf8',windowsHide:true});
if(result.status!==0)throw new Error('Keytool could not create the Android signing key: '+result.stderr);
fs.writeFileSync(props,`storeFile=${keyFile.replaceAll('\\','/')}\nstorePassword=${password}\nkeyAlias=cindervow\nkeyPassword=${password}\n`,{mode:0o600});
fs.unlinkSync(passwordFile);
console.log('Created an Android release signing key outside the repository.');
