import { Client } from 'file:///C:/Isprite%20Asset/aseprite-ai-artist/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from 'file:///C:/Isprite%20Asset/aseprite-ai-artist/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
fs.mkdirSync(path.join(root, 'art'), { recursive: true });
fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.mkdirSync(path.join(root, 'previews'), { recursive: true });
const client = new Client({ name: 'cinder-vow-art-director', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['C:/Isprite Asset/aseprite-ai-artist/dist/cli.js', 'serve', '--headless', '--aseprite', 'C:/Isprite Asset/tools/aseprite-build/bin/aseprite.exe', '--plugin-port', '9971', '--control-port', '9972'],
  stderr: 'pipe',
});
await client.connect(transport);
const list = await client.listTools();
fs.writeFileSync(path.join(root, 'tools', 'mcp-tools.json'), JSON.stringify(list.tools, null, 2));
const preflight = await client.callTool({ name: 'preflight', arguments: {mode: 'headless'} });
console.log(JSON.stringify(preflight));
let tail = Promise.resolve();
http.createServer((req, res) => {
  if(req.url === '/tools') { res.end(JSON.stringify(list)); return; }
  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    tail = tail.then(async () => {
      try {
        const input = JSON.parse(body);
        const result = await client.callTool(input, undefined, {timeout: 180000});
        const record = {time:new Date().toISOString(), name:input.name, arguments:input.arguments, result};
        fs.appendFileSync(path.join(root,'art','mcp-audit.jsonl'), JSON.stringify(record)+'\n');
        res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(result));
      } catch(e) { res.statusCode = 500; res.end(JSON.stringify({error:String(e)})); }
    });
  });
}).listen(3837, '127.0.0.1', () => console.log('Aseprite MCP ready on 3837'));
process.on('SIGINT', async () => {await client.close();process.exit();});
