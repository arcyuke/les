const menu=document.querySelector('.menu-toggle');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#navigation').classList.toggle('open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu){menu.setAttribute('aria-expanded','false');document.querySelector('#navigation').classList.remove('open');}});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
 let count=0;
 document.querySelectorAll('.program-card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;if(!card.hidden)count++;});
 const empty=document.querySelector('.empty-state');if(empty)empty.hidden=count>0;
}));
const bookingForm=document.querySelector('#booking-form');
if(bookingForm){
 const config=JSON.parse(document.querySelector('#booking-config').textContent);
 const base=config.apiBase.replace(/\/$/,'');
 const message=document.querySelector('#booking-status'),submit=bookingForm.querySelector('[type=submit]');
 const date=bookingForm.elements.date;
 date.min=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Novosibirsk',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const selected=new URL(location.href).searchParams.get('program');if(selected)bookingForm.elements.program.value=selected;
 let key=crypto.randomUUID(),available=false,blocked=[];
 const checkDate=()=>{const occupied=blocked.some(x=>x.date===date.value&&x.venue===bookingForm.elements.venue.value);submit.disabled=!available||occupied;if(occupied)message.textContent='Эта площадка уже занята на выбранную дату. Выберите другой день.';else if(available)message.textContent=config.labels.note;};
 for(const name of ['date','venue'])bookingForm.elements[name].addEventListener('change',checkDate);
 fetch(base+'/api/status',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(async status=>{available=status.bookingsEnabled&&config.privacyReady;if(available){try{const r=await fetch(base+'/api/availability',{cache:'no-store'});blocked=(await r.json()).unavailable||[];}catch{}checkDate();}}).catch(()=>{});
 bookingForm.addEventListener('submit',async e=>{e.preventDefault();if(!available||!bookingForm.reportValidity())return;submit.disabled=true;message.textContent='Отправляем заявку…';const x=Object.fromEntries(new FormData(bookingForm));x.people=Number(x.people);x.consent=bookingForm.elements.consent.checked;
 try{const r=await fetch(base+'/api/bookings',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(x)});const result=await r.json();if(!r.ok)throw new Error(result.error||config.labels.errorText);message.textContent=`${config.labels.successTitle} № ${result.id}. ${config.labels.successText}`;bookingForm.reset();key=crypto.randomUUID();message.focus();}catch(error){message.textContent=error.message||config.labels.errorText;}finally{submit.disabled=!available;}
 });
}
