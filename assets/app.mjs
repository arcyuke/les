document.documentElement.classList.add('js');

const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const setMenu = open => {
  if (!menu || !navigation) return;
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
};
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenu(false);
});
window.addEventListener('resize', () => {
  if (innerWidth > 820) setMenu(false);
});

const progress = document.querySelector('.scroll-progress');
const updateProgress = () => {
  const total = document.documentElement.scrollHeight - innerHeight;
  const value = total > 0 ? Math.min(100, scrollY / total * 100) : 0;
  progress?.style.setProperty('--scroll', value + '%');
};
addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, {threshold:.12, rootMargin:'0px 0px -40px'});
  reveals.forEach(element => observer.observe(element));
} else {
  reveals.forEach(element => element.classList.add('is-visible'));
}

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  document.querySelectorAll('.program-card').forEach((card, index) => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.hidden = !show;
    if (show) {
      count++;
      card.classList.remove('is-visible');
      card.style.setProperty('--delay', Math.min(index, 4) * 45 + 'ms');
      requestAnimationFrame(() => card.classList.add('is-visible'));
    }
  });
  const empty = document.querySelector('.empty-state');
  if (empty) empty.hidden = count > 0;
}));

const bookingForm = document.querySelector('#booking-form');
if (bookingForm) {
  const config = JSON.parse(document.querySelector('#booking-config').textContent);
  const base = config.apiBase.replace(/\/$/, '');
  const message = document.querySelector('#booking-status');
  const submit = bookingForm.querySelector('[type=submit]');
  const date = bookingForm.elements.date;
  date.min = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Novosibirsk', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());
  const selected = new URL(location.href).searchParams.get('program');
  if (selected) bookingForm.elements.program.value = selected;
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
