import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'estate-test-'));const port=13291;const base=`http://127.0.0.1:${port}`;
let child;
async function call(path,method='GET',data,cookie){const r=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
async function start(){child=spawn(process.execPath,['server/server.js'],{env:{...process.env,PORT:String(port),DATABASE_PATH:join(dir,'test.sqlite')},stdio:['ignore','pipe','pipe']});await new Promise((ok,no)=>{child.stdout.once('data',ok);child.once('error',no);child.once('exit',()=>no(new Error('Server exited early')));});}
async function stop(){if(child.exitCode!==null)return;await new Promise(ok=>{child.once('exit',ok);child.kill();});}
test('Accounts, listings, permissions, uploads, enquiries and restart persistence',async()=>{try{await start();assert.equal((await call('/health')).status,200);assert.equal((await call('/properties','POST',{})).status,401);
const a=await call('/auth/register','POST',{name:'Owner One',email:'owner@example.test',password:'StrongPassword123'});assert.equal(a.status,200);const b=await call('/auth/register','POST',{name:'Buyer Two',email:'buyer@example.test',password:'AnotherPassword123'});assert.equal(b.status,200);assert.equal((await call('/auth/login','POST',{email:'owner@example.test',password:'wrongpassword'})).status,401);
assert.equal((await call('/images','POST',{mime:'image/png',data:Buffer.from('not an image').toString('base64')},a.cookie)).status,400);
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';const image=await call('/images','POST',{mime:'image/png',data:png},a.cookie);assert.equal(image.status,201);assert.equal((await fetch(base+image.data.url)).status,200);
const listing={title:'Test apartment in Kingston',description:'A spacious demonstration apartment with two bedrooms and a balcony.',address:'10 Test Road',city:'Kingston',type:'rent',property:'apartment',price:1600,bedroom:2,bathroom:1,size:80,latitude:51.41,longitude:-.3,images:[image.data.url]};const p=await call('/properties','POST',listing,a.cookie);assert.equal(p.status,201);const id=p.data.id;
assert.equal((await call('/properties/'+id,'PUT',listing,b.cookie)).status,403);assert.equal((await call('/properties/'+id,'DELETE',null,b.cookie)).status,403);assert.equal((await call('/properties','POST',{...listing,price:-1},a.cookie)).status,400);
const filtered=await call('/properties?city=Kingston&type=rent&maxPrice=1700');assert.equal(filtered.data.length,1);assert.equal((await call(`/properties/${id}/save`,'POST',{},b.cookie)).data.saved,true);assert.equal((await call(`/properties/${id}/enquiries`,'POST',{message:'Can I arrange a viewing next week?'},b.cookie)).status,201);assert.equal((await call('/dashboard','GET',null,a.cookie)).data.enquiries.length,1);assert.equal((await call('/dashboard','GET',null,b.cookie)).data.saved.length,1);
await stop();await start();assert.equal((await call('/properties/'+id)).data.title,listing.title);assert.equal((await call('/auth/me','GET',null,a.cookie)).data.user.name,'Owner One');assert.equal((await fetch(base+image.data.url)).status,200);
assert.equal((await call('/properties/'+id,'PUT',{...listing,title:'Updated Kingston apartment'},a.cookie)).status,200);assert.equal((await call('/properties/'+id,'DELETE',null,a.cookie)).status,200);assert.equal((await call('/dashboard','GET',null,b.cookie)).data.saved.length,0);await call('/auth/logout','POST',{},b.cookie);assert.equal((await call('/dashboard','GET',null,b.cookie)).status,401);
const origin=await fetch(base+'/api/auth/register',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:'{}'});assert.equal(origin.status,403);
}finally{if(child)await stop();rmSync(dir,{recursive:true,force:true});}});
