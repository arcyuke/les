const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() { menu?.setAttribute('aria-expanded','false'); nav?.classList.remove('is-open'); }
menu?.addEventListener('click', () => { const open=menu.getAttribute('aria-expanded')!=='true'; menu.setAttribute('aria-expanded',String(open)); nav.classList.toggle('is-open',open); });
document.addEventListener('keydown', event => { if(event.key==='Escape') closeMenu(); });
document.addEventListener('click', event => { if(!event.target.closest('.site-header')) closeMenu(); });
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
const filters=document.querySelectorAll('[data-filter]');
function filterPrograms(category) {
 let count=0;
 document.querySelectorAll('.catalog-grid [data-category]').forEach(p=>{p.hidden=Boolean(category&&p.dataset.category!==category);if(!p.hidden)count++;});
 filters.forEach(b=>{const active=b.dataset.filter===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 const empty=document.querySelector('.catalog-empty');if(empty)empty.hidden=count>0;
}
filters.forEach(b=>b.addEventListener('click',()=>filterPrograms(b.dataset.filter)));
const imageDialog=document.querySelector('.image-dialog');
document.querySelectorAll('[data-image-open]').forEach(b=>b.addEventListener('click',()=>{const img=imageDialog.querySelector('img');img.src=b.dataset.imageOpen;img.alt=b.dataset.imageAlt||'';imageDialog.showModal();}));
document.querySelector('[data-image-close]')?.addEventListener('click',()=>imageDialog.close());
imageDialog?.addEventListener('click',e=>{if(e.target===imageDialog)imageDialog.close();});

const requestDialog = document.querySelector('#request-dialog');
const bookingForm = document.querySelector('#booking-form');

function openRequest(program = '') {
  if (!requestDialog) return;
  closeMenu();
  if (program && bookingForm?.elements.program) bookingForm.elements.program.value = program;
  if (!requestDialog.open) requestDialog.showModal();
  history.replaceState(null, '', `${location.pathname}${location.search}#request`);
}

function closeRequest() {
  if (!requestDialog?.open) return;
  requestDialog.close();
}

document.querySelectorAll('[data-request-open]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  openRequest(link.dataset.program || '');
}));

document.querySelector('[data-request-close]')?.addEventListener('click', closeRequest);
requestDialog?.addEventListener('click', event => {
  if (event.target === requestDialog) closeRequest();
});
requestDialog?.addEventListener('close', () => {
  if (location.hash === '#request') history.replaceState(null, '', `${location.pathname}${location.search}`);
});

if (location.hash === '#request' || document.body.dataset.page === 'booking') openRequest(new URLSearchParams(location.search).get('program') || '');
window.addEventListener('hashchange', () => { if (location.hash === '#request') openRequest(); });

if (bookingForm) {
  const config = JSON.parse(document.querySelector('#booking-config').textContent);
  const base = config.apiBase.replace(/\/$/, '');
  const message = document.querySelector('#booking-status');
  const submit = bookingForm.querySelector('[type=submit]');
  const date = bookingForm.elements.date;
  date.min = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Novosibirsk', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());

  const makeKey = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let key = makeKey();
  let available = false;
  let blocked = [];

  const checkDate = () => {
    const occupied = blocked.some(item => item.date === date.value && item.venue === bookingForm.elements.venue.value);
    submit.disabled = !available || occupied;
    if (occupied) message.textContent = 'Эта площадка уже занята на выбранную дату. Выберите другой день.';
    else if (available) message.textContent = config.labels.note;
  };

  for (const name of ['date', 'venue']) bookingForm.elements[name].addEventListener('change', checkDate);

  fetch(base + '/api/status', {cache:'no-store'})
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(async status => {
      available = status.bookingsEnabled && config.privacyReady;
      if (available) {
        try {
          const response = await fetch(base + '/api/availability', {cache:'no-store'});
          blocked = (await response.json()).unavailable || [];
        } catch {}
      }
      checkDate();
    })
    .catch(() => {});

  bookingForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!available || !bookingForm.reportValidity()) return;
    submit.disabled = true;
    message.textContent = 'Отправляем заявку…';
    const payload = Object.fromEntries(new FormData(bookingForm));
    payload.people = Number(payload.people);
    payload.consent = bookingForm.elements.consent.checked;

    try {
      const response = await fetch(base + '/api/bookings', {
        method:'POST',
        headers:{'Content-Type':'application/json', 'Idempotency-Key':key},
        body:JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || config.labels.errorText);
      message.textContent = `${config.labels.successTitle} № ${result.id}. ${config.labels.successText}`;
      bookingForm.reset();
      key = makeKey();
      message.focus();
    } catch (error) {
      message.textContent = error.message || config.labels.errorText;
    } finally {
      submit.disabled = !available;
    }
  });
}
