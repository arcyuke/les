import http from 'node:http';
import {readFile,writeFile,rename,mkdir,stat} from 'node:fs/promises';
import {randomBytes,randomUUID} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const fail=(status,message)=>Object.assign(new Error(message),{status});
export async function createApp(options={}){
 const dataDir=path.resolve(options.dataDir||process.env.DATA_DIR||path.join(root,'.runtime'));
 const fetcher=options.fetcher||fetch;
 const repo=process.env.GITHUB_REPOSITORY||'arcyuke/les';
 const bot=options.botToken??process.env.TELEGRAM_BOT_TOKEN;
 const enabled=options.enabled??(process.env.BOOKINGS_ENABLED==='true');
 const origins=(options.origins||process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
 await mkdir(dataDir,{recursive:true,mode:0o700});
 const statePath=path.join(dataDir,'state.json');
 let state;
 try{state=JSON.parse(await readFile(statePath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;state={bookings:[],recipients:[],invites:[],offset:0,jobs:[]};}
 let queue=Promise.resolve();
 const mutate=fn=>{const job=queue.then(async()=>{const draft=structuredClone(state);const result=await fn(draft);const temp=statePath+'.tmp';await writeFile(temp,JSON.stringify(draft),{mode:0o600});await rename(temp,statePath);state=draft;return result;});queue=job.catch(()=>{});return job;};
 const content=()=>options.content?Promise.resolve(options.content):readFile(path.join(root,'dist/data/content.json'),'utf8').then(JSON.parse);
 const ready=c=>enabled&&c.privacy.ready&&!!c.privacy.operator.trim();
 const limits=new Map();
 const limit=(key,max,window=60000)=>{const now=Date.now();for(const[k,v]of limits)if(v.until<now)limits.delete(k);let v=limits.get(key);if(!v){v={count:0,until:now+window};limits.set(key,v);}if(++v.count>max)throw fail(429,'Слишком много запросов. Попробуйте позже.');};
 const telegram=async(method,args)=>{if(!bot)throw fail(503,'Telegram-бот ещё не подключён на сервере.');const r=await fetcher(`https://api.telegram.org/bot${bot}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(12000)});const j=await r.json();if(!r.ok||!j.ok)throw fail(502,'Telegram временно не отвечает.');return j.result;};
 async function admin(req){if(options.authorize)return options.authorize(req);const token=(req.headers.authorization||'').replace(/^Bearer /,'');if(!token||token.length>300)throw fail(401,'Нужен GitHub-токен с доступом к репозиторию les.');const r=await fetcher(`https://api.github.com/repos/${repo}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','User-Agent':'les-bookings'},signal:AbortSignal.timeout(10000)});if(!r.ok)throw fail(403,'GitHub не подтвердил доступ.');const j=await r.json();if(!j.permissions?.push)throw fail(403,'Токен должен иметь право записи в репозиторий les.');}
 async function body(req){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>16000)throw fail(413,'Слишком большой запрос.');chunks.push(chunk);}try{return JSON.parse(Buffer.concat(chunks).toString());}catch{throw fail(400,'Некорректный формат запроса.');}}
 const short=(v,max)=>typeof v==='string'&&v.trim().length<=max?v.trim():'';
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Novosibirsk',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 async function notify(){for(const job of state.jobs.filter(j=>!j.sent&&j.next<=Date.now()).slice(0,3)){const b=state.bookings.find(b=>b.id===job.bookingId);const recipient=state.recipients.find(r=>r.id===job.recipientId&&r.enabled);if(!b||!recipient){await mutate(s=>{s.jobs=s.jobs.filter(j=>j.id!==job.id);});continue;}try{await telegram('sendMessage',{chat_id:recipient.chatId,text:`Новая заявка ЛЕС · ${b.id}\n${b.programTitle}\n${b.venueTitle}\n${b.date}, ${b.time}\nУчастников: ${b.people}\n${b.name}\n${b.phone}\n${b.comment||''}\n\nСтатус: ожидает подтверждения`});await mutate(s=>{const j=s.jobs.find(x=>x.id===job.id);if(j)j.sent=true;});}catch{await mutate(s=>{const j=s.jobs.find(x=>x.id===job.id);if(j){j.attempts++;j.next=Date.now()+Math.min(3600000,30000*2**Math.min(j.attempts,7));}});}}}
 async function syncTelegram(){if(!bot)return;const updates=await telegram('getUpdates',{offset:state.offset,timeout:0,allowed_updates:['message']});await mutate(s=>{for(const update of updates){s.offset=Math.max(s.offset,update.update_id+1);const m=update.message;const match=m?.text?.match(/^\/start ([a-f0-9]{48})$/);if(!match||m.chat?.type!=='private')continue;const invite=s.invites.find(i=>i.code===match[1]&&i.expires>Date.now());if(!invite)continue;const chatId=String(m.chat.id);if(!s.recipients.some(r=>r.chatId===chatId))s.recipients.push({id:randomUUID(),chatId,name:[m.from?.first_name,m.from?.last_name].filter(Boolean).join(' ').slice(0,100),username:m.from?.username||'',enabled:false});s.invites=s.invites.filter(i=>i!==invite);}s.invites=s.invites.filter(i=>i.expires>Date.now());});}
 let ticking=false;
 async function tick(){if(ticking||!bot)return;ticking=true;try{await syncTelegram();await notify();}catch{}finally{ticking=false;}}
 const server=http.createServer(async(req,res)=>{
  const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','SAMEORIGIN');
  try{
   const url=new URL(req.url,'http://localhost');const route=url.pathname;
   if(route.startsWith('/api/')){
    const origin=req.headers.origin;if(origin&&origins.length&&!origins.includes(origin))throw fail(403,'Этот адрес сайта не разрешён.');if(origin&&origins.includes(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
    if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization, Idempotency-Key');return send(204,{});}
    const ip=req.socket.remoteAddress||'unknown';limit(ip+':api',180);
    if(route==='/api/status'&&req.method==='GET'){const c=await content();return send(200,{bookingsEnabled:ready(c)});}
    if(route==='/api/availability'&&req.method==='GET')return send(200,{unavailable:state.bookings.filter(b=>b.status==='confirmed').map(b=>({date:b.date,venue:b.venue}))});
    if(route==='/api/bookings'&&req.method==='POST'){
     limit(ip+':booking',8,600000);const c=await content();if(!ready(c))throw fail(503,'Онлайн-заявки ещё не подключены. Позвоните организатору.');const x=await body(req);
     if(x.website)throw fail(400,'Не удалось принять заявку.');if(x.consent!==true)throw fail(400,'Нужно согласие на обработку данных.');
     const p=c.programs.find(p=>p.id===x.program&&p.visible!==false),v=c.venues.find(v=>v.id===x.venue&&v.visible!==false);
     if(!p||!v)throw fail(400,'Выберите действующую программу и площадку.');
     const name=short(x.name,100),phone=short(x.phone,25),date=short(x.date,10),time=short(x.time,5),comment=short(x.comment||'',1500),people=Number(x.people);
     if(name.length<2||!/^[+\d ()-]+$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15)throw fail(400,'Проверьте имя и телефон.');
     if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date<today()||date>String(Number(today().slice(0,4))+2)+today().slice(4)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!Number.isInteger(people)||people<1||people>200)throw fail(400,'Проверьте дату, время и число участников.');
     const key=String(req.headers['idempotency-key']||'');if(!/^[\w-]{16,80}$/.test(key))throw fail(400,'Обновите страницу и попробуйте снова.');
     const result=await mutate(s=>{const previous=s.bookings.find(b=>b.key===key);if(previous)return {id:previous.id,status:previous.status};if(s.bookings.some(b=>b.venue===v.id&&b.date===date&&b.status==='confirmed'))throw fail(409,'Эта площадка уже забронирована на выбранную дату.');const b={id:randomBytes(6).toString('hex').toUpperCase(),key,status:'pending',createdAt:new Date().toISOString(),name,phone,date,time,people,comment,program:p.id,programTitle:p.title,venue:v.id,venueTitle:v.name,consent:true,consentAt:new Date().toISOString()};s.bookings.push(b);for(const r of s.recipients.filter(r=>r.enabled))s.jobs.push({id:randomUUID(),bookingId:b.id,recipientId:r.id,sent:false,attempts:0,next:Date.now()});return {id:b.id,status:b.status};});return send(201,result);
    }
    if(route.startsWith('/api/admin/')){
     limit(ip+':admin',90);await admin(req);
     if(route==='/api/admin/bookings'&&req.method==='GET')return send(200,{bookings:state.bookings.map(({key,...b})=>b).reverse(),notifications:state.jobs.filter(j=>!j.sent).length});
     if(route==='/api/admin/bookings'&&req.method==='PATCH'){const x=await body(req);if(!['pending','confirmed','cancelled'].includes(x.status))throw fail(400,'Неизвестный статус.');await mutate(s=>{const b=s.bookings.find(b=>b.id===x.id);if(!b)throw fail(404,'Заявка не найдена.');if(x.status==='confirmed'&&s.bookings.some(o=>o.id!==b.id&&o.venue===b.venue&&o.date===b.date&&o.status==='confirmed'))throw fail(409,'На эту площадку и дату уже есть подтверждённая бронь.');b.status=x.status;});return send(200,{ok:true});}
     if(route==='/api/admin/telegram'&&req.method==='GET')return send(200,{configured:!!bot,recipients:state.recipients});
     if(route==='/api/admin/telegram'&&req.method==='PATCH'){const x=await body(req);await mutate(s=>{const r=s.recipients.find(r=>r.id===x.id);if(!r)throw fail(404,'Получатель не найден.');r.enabled=x.enabled===true;});return send(200,{ok:true});}
     if(route==='/api/admin/telegram'&&req.method==='DELETE'){const x=await body(req);await mutate(s=>{s.recipients=s.recipients.filter(r=>r.id!==x.id);});return send(200,{ok:true});}
     if(route==='/api/admin/invite'&&req.method==='POST'){const me=await telegram('getMe',{});const code=randomBytes(24).toString('hex');await mutate(s=>{s.invites=s.invites.filter(i=>i.expires>Date.now());s.invites.push({code,expires:Date.now()+86400000});});return send(200,{url:`https://t.me/${me.username}?start=${code}`});}
     if(route==='/api/admin/telegram/sync'&&req.method==='POST'){await syncTelegram();return send(200,{ok:true});}
    }
    throw fail(404,'Метод не найден.');
   }
   if(!['GET','HEAD'].includes(req.method))throw fail(405,'Метод не поддерживается.');
   const decoded=decodeURIComponent(route);const rel=decoded==='/'?'index.html':decoded.replace(/^\/+/, '');
   if(rel.split('/').some(x=>x.startsWith('.'))||rel.includes('\\'))throw fail(404,'Страница не найдена.');
   const file=path.resolve(root,'dist',rel);if(!file.startsWith(path.join(root,'dist')+path.sep))throw fail(404,'Страница не найдена.');
   const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.otf':'font/otf','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4'};
   const meta=await stat(file);if(!meta.isFile())throw fail(404,'Страница не найдена.');
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https:; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"});
   res.end(req.method==='HEAD'?undefined:await readFile(file));
  }catch(e){if(!res.headersSent)send(e.status||(e.code==='ENOENT'?404:500),{error:e.status?e.message:e.code==='ENOENT'?'Страница не найдена.':'Ошибка сервера. Попробуйте позже.'});else res.end();}
 });
 return {server,tick,state:()=>structuredClone(state)};
}
