import fs from 'node:fs';
import zlib from 'node:zlib';
// Decoder only: all pixels being inspected were drawn and exported by Aseprite MCP.
export function readPNG(filename){
 const b=fs.readFileSync(filename);let at=8,w,h,depth,type,palette,trans,compressed=[];
 while(at<b.length){const n=b.readUInt32BE(at),name=b.toString('ascii',at+4,at+8),data=b.subarray(at+8,at+8+n);at+=12+n;if(name==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);depth=data[8];type=data[9];}if(name==='IDAT')compressed.push(data);if(name==='PLTE')palette=data;if(name==='tRNS')trans=data;}
 if(depth!==8)throw new Error('Expected Aseprite 8-bit PNG');const channels={0:1,2:3,3:1,4:2,6:4}[type],stride=w*channels,raw=zlib.inflateSync(Buffer.concat(compressed)),pixels=Buffer.alloc(stride*h);let src=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<h;y++){const filter=raw[src++];for(let x=0;x<stride;x++){const left=x>=channels?pixels[y*stride+x-channels]:0,up=y>0?pixels[(y-1)*stride+x]:0,ul=y>0&&x>=channels?pixels[(y-1)*stride+x-channels]:0;pixels[y*stride+x]=(raw[src++]+[0,left,up,Math.floor((left+up)/2),paeth(left,up,ul)][filter])&255;}}
 const alpha=(x,y)=>{if(x<0||y<0||x>=w||y>=h)return 0;const i=(y*w+x)*channels;if(type===6)return pixels[i+3];if(type===4)return pixels[i+1];if(type===3)return trans?.[pixels[i]]??255;return 255;};
 return {width:w,height:h,alpha};
}
export function components(png,frame){
 const {x:ox,y:oy,w,h}=frame,seen=new Uint8Array(w*h),out=[];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const start=y*w+x;if(seen[start]||!png.alpha(ox+x,oy+y))continue;const queue=[[x,y]],pixels=[];seen[start]=1;let minX=x,maxX=x,minY=y,maxY=y;
  for(let q=0;q<queue.length;q++){
   const [px,py]=queue[q];pixels.push([px,py]);minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);
   for(const [dx,dy]of [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]){const nx=px+dx,ny=py+dy,i=ny*w+nx;if(nx>=0&&ny>=0&&nx<w&&ny<h&&!seen[i]&&png.alpha(ox+nx,oy+ny)){seen[i]=1;queue.push([nx,ny]);}}
  }
  out.push({area:pixels.length,minX,maxX,minY,maxY,pixels});
 }
 return out.sort((a,b)=>b.area-a.area);
}
