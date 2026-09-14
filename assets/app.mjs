import {setNotice,busy,validateForm,clearFieldError} from './ui.mjs?v=20260914a';
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

// Keep the header's space reserved so its contents never jump while scrolling.
const header=document.querySelector('.site-header');
const headerAction=document.querySelector('.header-action');
const pageActions=[...document.querySelectorAll('main [data-request-open]:not(.program-cover)')];
let headerFrame=0;
function updateHeaderAction(){
 headerFrame=0;if(!headerAction)return;
 const headerBottom=header.getBoundingClientRect().bottom;
 const visible=pageActions.some(action=>{
  const r=action.getBoundingClientRect();
  return r.width>0&&r.height>0&&r.bottom>headerBottom&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;
 });
 headerAction.classList.toggle('is-hidden',visible);
 headerAction.inert=visible;headerAction.tabIndex=visible?-1:0;headerAction.setAttribute('aria-hidden',String(visible));
}
function scheduleHeader(){if(!headerFrame)headerFrame=requestAnimationFrame(updateHeaderAction);}
window.addEventListener('scroll',scheduleHeader,{passive:true});window.addEventListener('resize',scheduleHeader);window.addEventListener('pageshow',scheduleHeader);
if('ResizeObserver'in window){const resize=new ResizeObserver(scheduleHeader);resize.observe(document.querySelector('main'));resize.observe(header);}
document.fonts?.ready.then(scheduleHeader);updateHeaderAction();

const rotator=document.querySelector('.fact-rotator');
if(rotator){
 const slides=[...rotator.querySelectorAll('.fact-slide')],dots=[...rotator.querySelectorAll('[data-fact]')],pause=rotator.querySelector('.fact-pause');
 let current=0,paused=false,timer;
 function showFact(index){current=index;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.setAttribute('aria-hidden',String(i!==index));});dots.forEach((dot,i)=>{dot.classList.toggle('is-active',i===index);dot.setAttribute('aria-pressed',String(i===index));});}
 function updatePause(){pause.setAttribute('aria-label',paused?pause.dataset.playLabel:pause.dataset.pauseLabel);pause.querySelector('span').textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));}
 function start(){clearInterval(timer);if(paused||slides.length<2)return;timer=setInterval(()=>{const r=rotator.getBoundingClientRect();if(!document.hidden&&r.bottom>0&&r.top<innerHeight)showFact((current+1)%slides.length);},4000);}
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>{showFact(i);start();}));
 pause.addEventListener('click',()=>{paused=!paused;updatePause();start();});
 if(slides.length<2)rotator.querySelector('.fact-controls').hidden=true;
 updatePause();start();
}

const filters=document.querySelectorAll('[data-filter]');
function filterPrograms(category){
 let count=0;document.querySelectorAll('.catalog-grid [data-category]').forEach(p=>{p.hidden=Boolean(category&&p.dataset.category!==category);if(!p.hidden)count++;});
 filters.forEach(b=>{const active=b.dataset.filter===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 const empty=document.querySelector('.catalog-empty');if(empty)empty.hidden=count>0;scheduleHeader();
}
filters.forEach(b=>b.addEventListener('click',()=>filterPrograms(b.dataset.filter)));

// Photo/video surfaces are wired now and only render when the editor has media.
const imageDialog=document.querySelector('.image-dialog');
let imageRequest=0;
document.querySelectorAll('[data-image-open]').forEach(button=>button.addEventListener('click',()=>{
 const image=imageDialog.querySelector('img'),id=++imageRequest;
 imageDialog.querySelector('.site-notice')?.remove();image.hidden=false;busy(imageDialog);imageDialog.showModal();
 image.onload=()=>{if(id===imageRequest)busy(imageDialog,false);};
 image.onerror=()=>{if(id!==imageRequest)return;busy(imageDialog,false);image.hidden=true;const message=document.createElement('p');setNotice(message,'Не удалось загрузить фотографию. Попробуйте открыть её ещё раз.','error');imageDialog.append(message);};
 image.alt=button.dataset.imageAlt||'';image.src=button.dataset.imageOpen;
 if(image.complete&&image.naturalWidth)busy(imageDialog,false);
}));
document.querySelector('[data-image-close]')?.addEventListener('click',()=>imageDialog.close());
imageDialog?.addEventListener('click',event=>{if(event.target===imageDialog){const r=imageDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)imageDialog.close();}});
imageDialog?.addEventListener('close',()=>{imageRequest++;busy(imageDialog,false);});
document.querySelectorAll('.video-grid video').forEach(video=>{
 const frame=document.createElement('div');frame.className='media-loading';video.replaceWith(frame);frame.append(video);
 for(const name of ['waiting','loadstart'])video.addEventListener(name,()=>{if(!video.paused)busy(frame);});
 for(const name of ['playing','canplay','pause','ended'])video.addEventListener(name,()=>busy(frame,false));
 video.addEventListener('error',()=>{busy(frame,false);if(!frame.querySelector('.site-notice')){const message=document.createElement('p');setNotice(message,'Не удалось загрузить видео. Попробуйте обновить страницу.','error');frame.append(message);}});
});

const requestDialog=document.querySelector('#request-dialog');
const bookingForm=document.querySelector('#booking-form');
let initializeBooking=()=>{};
function openRequest(program=''){
 if(!requestDialog)return;closeMenu();
 if(program&&bookingForm?.elements.program)bookingForm.elements.program.value=program;
 if(!requestDialog.open)requestDialog.showModal();
 history.replaceState(null,'',`${location.pathname}${location.search}#request`);
 initializeBooking();
}
function closeRequest(){if(requestDialog?.open)requestDialog.close();}
document.querySelectorAll('[data-request-open]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openRequest(link.dataset.program||'');}));
document.querySelector('[data-request-close]')?.addEventListener('click',closeRequest);
requestDialog?.addEventListener('click',event=>{if(event.target===requestDialog){const r=requestDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeRequest();}});
requestDialog?.addEventListener('close',()=>{if(location.hash==='#request')history.replaceState(null,'',`${location.pathname}${location.search}`);scheduleHeader();});

if(bookingForm){
 const config=JSON.parse(document.querySelector('#booking-config').textContent),labels=config.labels;
 const base=config.apiBase.replace(/\/$/,'');
 const message=document.querySelector('#booking-status'),submit=bookingForm.querySelector('[type=submit]'),date=bookingForm.elements.date;
 date.min=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Novosibirsk',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const makeKey=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
 let key=makeKey(),available=false,blocked=[],initialized=false,sending=false;
 setNotice(message,labels.offlineText,'info');
 const occupied=()=>blocked.some(item=>item.date===date.value&&item.venue===bookingForm.elements.venue.value);
 const checkDate=()=>{submit.disabled=!available||sending||occupied();if(occupied())setNotice(message,labels.occupiedText,'error');else if(available&&!sending)setNotice(message,labels.note,'info');};
 for(const name of ['date','venue'])bookingForm.elements[name].addEventListener('change',checkDate);
 bookingForm.addEventListener('input',clearFieldError);bookingForm.addEventListener('change',clearFieldError);
 initializeBooking=async()=>{
  if(initialized)return;initialized=true;
  if(!base&&location.hostname.endsWith('.github.io'))return;
  setNotice(message,labels.checkingText,'loading');
  try{
   const response=await fetch(base+'/api/status',{cache:'no-store',signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error();const status=await response.json();available=Boolean(status.bookingsEnabled&&config.privacyReady);
   if(available){try{const r=await fetch(base+'/api/availability',{cache:'no-store',signal:AbortSignal.timeout(12000)});if(r.ok)blocked=(await r.json()).unavailable||[];}catch{}}
   if(available)checkDate();else setNotice(message,labels.offlineText,'info');
  }catch{setNotice(message,labels.offlineText,'info');}
 };
 bookingForm.addEventListener('submit',async event=>{
  event.preventDefault();if(!available||sending)return;
  if(!validateForm(bookingForm)){setNotice(message,labels.validationText,'error');return;}
  if(occupied()){checkDate();return;}
  sending=true;submit.disabled=true;busy(submit);setNotice(message,labels.sendingText,'loading');
  const payload=Object.fromEntries(new FormData(bookingForm));payload.people=Number(payload.people);payload.consent=bookingForm.elements.consent.checked;
  try{
   const response=await fetch(base+'/api/bookings',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)});
   let result;try{result=await response.json();}catch{throw Error(labels.errorText);}
   if(!response.ok)throw Error(result.error||labels.errorText);
   setNotice(message,`${labels.successTitle} № ${result.id}. ${labels.successText}`,'success');bookingForm.reset();key=makeKey();message.focus();
  }catch(error){setNotice(message,error.name==='TimeoutError'?labels.errorText:(error.message||labels.errorText),'error');message.focus();}
  finally{sending=false;busy(submit,false);submit.disabled=!available||occupied();}
 });
}
if(location.hash==='#request'||document.body.dataset.page==='booking')openRequest(new URLSearchParams(location.search).get('program')||'');
window.addEventListener('hashchange',()=>{if(location.hash==='#request')openRequest();});
