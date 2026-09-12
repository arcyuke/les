document.documentElement.classList.add('js');

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, {threshold:.1, rootMargin:'0px 0px -32px'});
  reveals.forEach(element => observer.observe(element));
} else {
  reveals.forEach(element => element.classList.add('is-visible'));
}

const heroArt = document.querySelector('.hero-art');
if (heroArt && matchMedia('(pointer:fine)').matches && !reducedMotion) {
  heroArt.addEventListener('pointermove', event => {
    const box = heroArt.getBoundingClientRect();
    heroArt.style.setProperty('--mx', ((event.clientX - box.left) / box.width - .5).toFixed(2));
    heroArt.style.setProperty('--my', ((event.clientY - box.top) / box.height - .5).toFixed(2));
  });
  heroArt.addEventListener('pointerleave', () => {
    heroArt.style.setProperty('--mx', 0);
    heroArt.style.setProperty('--my', 0);
  });
}

const requestDialog = document.querySelector('#request-dialog');
const bookingForm = document.querySelector('#booking-form');

function openRequest(program = '') {
  if (!requestDialog) return;
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

if (location.hash === '#request') openRequest();

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
