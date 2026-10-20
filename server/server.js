import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { scryptSync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listData } from '../src/lib/dummydata.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.DATABASE_PATH || resolve(root, 'server/data/estate.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id),expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS properties(id INTEGER PRIMARY KEY,owner_id INTEGER REFERENCES users(id),data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS saved(user_id INTEGER REFERENCES users(id),property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,PRIMARY KEY(user_id,property_id));
CREATE TABLE IF NOT EXISTS enquiries(id INTEGER PRIMARY KEY,sender_id INTEGER REFERENCES users(id),recipient_id INTEGER REFERENCES users(id),property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,message TEXT NOT NULL,created TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS images(id TEXT PRIMARY KEY,mime TEXT NOT NULL,data BLOB NOT NULL);
`);
if (!db.prepare('SELECT id FROM properties LIMIT 1').get()) {
  for (const [i, p] of listData.entries()) db.prepare('INSERT INTO properties(id,data) VALUES(?,?)').run(p.id, JSON.stringify({ ...p, title:p.title.trim(), city:'London',type:i%2?'buy':'rent',property:i%3?'apartment':'house',price:i%2?p.price*200:p.price,latitude:51.5074+i*.008,longitude:-.1278+i*.012,size:80+i*10,images:[p.img.replace(/\?.*/, '?auto=compress&cs=tinysrgb&w=1000')],description:'Demonstration listing for SunnyEstate. Register to publish and manage your own properties. These sample properties are not real offers.' }));
}
const hash = t => createHash('sha256').update(t).digest('hex');
const passwordHash = p => { const salt=randomBytes(16).toString('hex'); return `${salt}:${scryptSync(p,salt,64).toString('hex')}`; };
const passwordMatches = (p,h) => { const [s,v]=h.split(':'); return timingSafeEqual(scryptSync(p,s,64), Buffer.from(v,'hex')); };
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const text=(v,min,max,label)=>{if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)fail(400,`${label} must contain ${min}–${max} characters.`);return v.trim();};
function propertyData(d) {
  const p={};
  for(const [k,min,max] of [['title',5,150],['description',20,6000],['address',5,250],['city',2,100]])p[k]=text(d[k],min,max,k);
  for(const [k,allowed] of [['type',['buy','rent']],['property',['apartment','house','condo','land']]]) {if(!allowed.includes(d[k]))fail(400,`Invalid ${k}.`);p[k]=d[k];}
  for(const [k,min,max] of [['price',1,1e9],['bedroom',0,100],['bathroom',0,100],['size',1,1e7],['latitude',-90,90],['longitude',-180,180]]){if(d[k]===null||d[k]===''||!Number.isFinite(Number(d[k]))||Number(d[k])<min||Number(d[k])>max)fail(400,`Invalid ${k}.`);p[k]=Number(d[k]);if(['bedroom','bathroom'].includes(k)&&!Number.isInteger(p[k]))fail(400,`Invalid ${k}.`);}
  if(!Array.isArray(d.images)||d.images.length<1||d.images.length>8)fail(400,'Add between 1 and 8 images.');
  p.images=d.images.map(v=>{if(typeof v!=='string'||v.length>2000||!(/^https:\/\//.test(v)||/^\/api\/images\/[a-f0-9]{32}$/.test(v)))fail(400,'Images must use HTTPS URLs or uploaded images.');return v;});p.img=p.images[0];return p;
}
const hydrate=r=>r?{...JSON.parse(r.data),id:r.id,ownerId:r.owner_id,ownerName:r.owner_id?db.prepare('SELECT name FROM users WHERE id=?').get(r.owner_id)?.name:'SunnyEstate demo',isDemo:!r.owner_id}:null;
const safeUser=u=>({id:u.id,name:u.name,email:u.email});
const attempts=new Map();
async function body(req){let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>7*1024*1024)fail(413,'Upload is too large. Maximum image size is 4 MB.');chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{fail(400,'Invalid JSON.');}}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
  const url=new URL(req.url,'http://localhost');const path=url.pathname;
  const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  try {
    if(!path.startsWith('/api/')) {
      const dist=resolve(root,'dist');const requested=resolve(dist,'.'+decodeURIComponent(path));
      if(!requested.startsWith(dist+'/')&&requested!==dist)fail(404,'Not found.');
      const file=existsSync(requested)&&statSync(requested).isFile()?requested:resolve(dist,'index.html');
      if(!existsSync(file))fail(404,'Frontend not built. Run npm run dev, or npm run build first.');
      const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
      res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});return res.end(readFileSync(file));
    }
    if(!['GET','HEAD'].includes(req.method)&&req.headers.origin){const expected=process.env.APP_ORIGIN||`http://${req.headers.host}`;if(req.headers.origin!==expected)fail(403,'Request origin is not allowed.');}
    const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('estate_session='))?.slice(15);
    const session=token?db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(hash(token),Date.now()):null;
    const auth=()=>{if(!session)fail(401,'Please sign in first.');return session;};
    if(path==='/api/health')return json(200,{ok:true});
    if(path==='/api/auth/me'&&req.method==='GET')return json(200,{user:session?safeUser(session):null});
    if(['/api/auth/register','/api/auth/login'].includes(path)&&req.method==='POST'){
      const key=req.socket.remoteAddress;const now=Date.now();if(attempts.size>10000)attempts.clear();const a=attempts.get(key);if(a&&now-a.start<600000&&a.count>=30)fail(429,'Too many attempts. Try again in 10 minutes.');attempts.set(key,a&&now-a.start<600000?{...a,count:a.count+1}:{start:now,count:1});
      const d=await body(req);const email=text(d.email,3,254,'Email').toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Enter a valid email.');const pw=text(d.password,8,128,'Password');let u;
      if(path.endsWith('register')){const name=text(d.name,2,80,'Name');if(db.prepare('SELECT id FROM users WHERE email=?').get(email))fail(409,'An account already exists with this email.');const result=db.prepare('INSERT INTO users(name,email,password) VALUES(?,?,?)').run(name,email,passwordHash(pw));u=db.prepare('SELECT * FROM users WHERE id=?').get(result.lastInsertRowid);}
      else {u=db.prepare('SELECT * FROM users WHERE email=?').get(email);if(!u||!passwordMatches(pw,u.password))fail(401,'Incorrect email or password.');}
      db.prepare('DELETE FROM sessions WHERE expires<?').run(now);const t=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(hash(t),u.id,now+604800000);
      res.setHeader('Set-Cookie',`estate_session=${t}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV==='production'?'; Secure':''}`);return json(200,{user:safeUser(u)});
    }
    if(path==='/api/auth/logout'&&req.method==='POST'){if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token));res.setHeader('Set-Cookie','estate_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');return json(200,{ok:true});}
    if(path==='/api/profile'&&req.method==='PATCH'){const u=auth();const d=await body(req);db.prepare('UPDATE users SET name=? WHERE id=?').run(text(d.name,2,80,'Name'),u.id);return json(200,{user:safeUser(db.prepare('SELECT * FROM users WHERE id=?').get(u.id))});}
    if(path==='/api/properties'&&req.method==='GET'){
      let rows=db.prepare('SELECT * FROM properties ORDER BY id DESC').all().map(hydrate);const q=url.searchParams;
      rows=rows.filter(p=>(!q.get('city')||`${p.city} ${p.address}`.toLowerCase().includes(q.get('city').toLowerCase()))&&(!q.get('type')||p.type===q.get('type'))&&(!q.get('property')||p.property===q.get('property'))&&(!q.get('minPrice')||p.price>=Number(q.get('minPrice')))&&(!q.get('maxPrice')||p.price<=Number(q.get('maxPrice')))&&(!q.get('bedroom')||p.bedroom>=Number(q.get('bedroom'))));return json(200,rows);
    }
    if(path==='/api/properties'&&req.method==='POST'){const u=auth();const p=propertyData(await body(req));const r=db.prepare('INSERT INTO properties(owner_id,data) VALUES(?,?)').run(u.id,JSON.stringify(p));return json(201,hydrate(db.prepare('SELECT * FROM properties WHERE id=?').get(r.lastInsertRowid)));}
    const match=path.match(/^\/api\/properties\/(\d+)(?:\/(save|enquiries))?$/);
    if(match){const r=db.prepare('SELECT * FROM properties WHERE id=?').get(Number(match[1]));if(!r)fail(404,'Property not found.');const p=hydrate(r);
      if(match[2]==='save'&&req.method==='POST'){const u=auth();const exists=db.prepare('SELECT * FROM saved WHERE user_id=? AND property_id=?').get(u.id,p.id);if(exists)db.prepare('DELETE FROM saved WHERE user_id=? AND property_id=?').run(u.id,p.id);else db.prepare('INSERT INTO saved VALUES(?,?)').run(u.id,p.id);return json(200,{saved:!exists});}
      if(match[2]==='enquiries'&&req.method==='POST'){const u=auth();if(!p.ownerId)fail(400,'This is a sample listing. Enquiries are available on user-published properties.');if(p.ownerId===u.id)fail(400,'You cannot enquire about your own listing.');const d=await body(req);const message=text(d.message,5,2000,'Message');db.prepare('INSERT INTO enquiries(sender_id,recipient_id,property_id,message,created) VALUES(?,?,?,?,?)').run(u.id,p.ownerId,p.id,message,new Date().toISOString());return json(201,{ok:true});}
      if(!match[2]){
        if(req.method==='GET')return json(200,{...p,saved:session?!!db.prepare('SELECT * FROM saved WHERE user_id=? AND property_id=?').get(session.id,p.id):false});
        const u=auth();if(p.ownerId!==u.id)fail(403,'You can only change your own properties.');
        if(req.method==='PUT'){const d=propertyData(await body(req));db.prepare('UPDATE properties SET data=? WHERE id=?').run(JSON.stringify(d),p.id);return json(200,{...d,id:p.id,ownerId:u.id});}
        if(req.method==='DELETE'){db.prepare('DELETE FROM properties WHERE id=?').run(p.id);return json(200,{ok:true});}
      }
    }
    if(path==='/api/dashboard'&&req.method==='GET'){const u=auth();return json(200,{mine:db.prepare('SELECT * FROM properties WHERE owner_id=? ORDER BY id DESC').all(u.id).map(hydrate),saved:db.prepare('SELECT properties.* FROM properties JOIN saved ON properties.id=saved.property_id WHERE saved.user_id=?').all(u.id).map(hydrate),enquiries:db.prepare('SELECT e.*,s.name senderName,r.name recipientName FROM enquiries e JOIN users s ON s.id=e.sender_id JOIN users r ON r.id=e.recipient_id WHERE e.sender_id=? OR e.recipient_id=? ORDER BY e.id DESC').all(u.id,u.id).map(e=>({...e,title:hydrate(db.prepare('SELECT * FROM properties WHERE id=?').get(e.property_id))?.title}))});}
    if(path==='/api/images'&&req.method==='POST'){auth();const d=await body(req);if(typeof d.data!=='string'||!['image/png','image/jpeg','image/webp'].includes(d.mime))fail(400,'Use PNG, JPEG or WebP.');const b=Buffer.from(d.data,'base64');if(b.length>4*1024*1024||b.length<12)fail(400,'Image must be under 4 MB.');const valid=d.mime==='image/png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):d.mime==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';if(!valid)fail(400,'Invalid image file.');const id=randomBytes(16).toString('hex');db.prepare('INSERT INTO images VALUES(?,?,?)').run(id,d.mime,b);return json(201,{url:`/api/images/${id}`});}
    if(/^\/api\/images\/[a-f0-9]{32}$/.test(path)&&req.method==='GET'){const img=db.prepare('SELECT * FROM images WHERE id=?').get(path.split('/').pop());if(!img)fail(404,'Image not found.');res.writeHead(200,{'Content-Type':img.mime,'Cache-Control':'public,max-age=31536000,immutable'});return res.end(img.data);}
    fail(404,'Endpoint not found.');
  }catch(e){if(!e.status)console.error(e);if(!res.headersSent)json(e.status||500,{error:e.status?e.message:'Server error. Please try again.'});else res.end();}
});
server.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>console.log(`SunnyEstate backend running on port ${process.env.PORT||3001}`));
