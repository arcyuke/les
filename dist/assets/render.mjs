export const pages = ['home', 'about', 'services', 'venues', 'reviews', 'contacts', 'booking', 'privacy'];

export const filenames = {
  home: 'index.html',
  about: 'about.html',
  services: 'services.html',
  venues: 'venues.html',
  reviews: 'reviews.html',
  contacts: 'contacts.html',
  booking: 'booking.html',
  privacy: 'privacy.html'
};

const redirects = {
  about: 'index.html#about',
  services: 'index.html#programs',
  venues: 'index.html#places',
  reviews: 'index.html#reviews',
  contacts: 'index.html#contact',
  booking: 'index.html#request'
};

export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

export function safeUrl(value) {
  const url = String(value || '').trim();
  if (/^(https:\/\/|tel:\+?[\d ()-]+$)/i.test(url)) return esc(url);
  if (/^(assets|uploads)\/[a-zA-Z0-9_./-]+$/.test(url) && !url.includes('..')) return esc(url);
  return '#';
}

const visible = items => (items || []).filter(item => item.visible !== false);

const requestLink = (label, className = 'action action-primary', program = '') =>
  `<a class="${className}" href="#request" data-request-open${program ? ` data-program="${esc(program)}"` : ''}><span>${esc(label)}</span><b aria-hidden="true">↗</b></a>`;

const externalLink = (href, label, className = 'line-link') =>
  `<a class="${className}" href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer"><span>${esc(label)}</span><b aria-hidden="true">↗</b></a>`;

function optionalImage(src, alt, className, caption = '', eager = false) {
  if (!src) return '';
  return `<figure class="${className}"><img src="${safeUrl(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1440" height="960">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
}

function hero(content) {
  const home = content.home;
  const heroArt = home.image
    ? optionalImage(home.image, home.imageAlt, 'hero-photo', home.imageCaption, true)
    : `<div class="hero-type" aria-hidden="true"><span>Л</span><span>Е</span><span>С</span></div>`;
  return `<section class="landing-hero" aria-labelledby="hero-title">
    <div class="hero-copy hero-enter">
      <p class="eyebrow">${esc(home.eyebrow)}</p>
      <h1 id="hero-title">${esc(home.title)}${home.titleAccent ? `<em>${esc(home.titleAccent)}</em>` : ''}</h1>
      <p class="hero-lead">${esc(home.text)}</p>
      <div class="hero-actions">
        ${requestLink(content.ui.contact)}
        <a class="line-link" href="${safeUrl(content.brand.phoneHref)}"><span>${esc(content.brand.phone)}</span></a>
      </div>
    </div>
    <div class="hero-art hero-enter" style="--delay:120ms">${heroArt}</div>
    <div class="hero-facts hero-enter" style="--delay:220ms" aria-label="Коротко о площадках">
      ${home.stats.map(stat => `<div><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join('')}
    </div>
  </section>`;
}

function intro(content) {
  return `<section class="intro reveal" id="about">
    <p class="eyebrow">${esc(content.home.introLabel)}</p>
    <h2>${esc(content.home.introTitle)}</h2>
    <p>${esc(content.home.introText)}</p>
  </section>`;
}

function programs(content) {
  const all = visible(content.programs);
  const featured = all.filter(item => item.featured).slice(0, 3);
  const selected = featured.length ? featured : all.slice(0, 3);
  return `<section class="landing-section" id="programs">
    <header class="section-title reveal">
      <p class="eyebrow">${esc(content.home.programsLabel)}</p>
      <h2>${esc(content.home.programsTitle)}</h2>
    </header>
    <div class="program-list">
      ${selected.map((program, index) => `<article class="program-row reveal" style="--delay:${index * 65}ms">${optionalImage(program.image, program.imageAlt, 'program-image')}
        <div class="program-name"><small>${esc(program.tag || program.category)}</small><h3>${esc(program.title)}</h3></div>
        <div class="program-price"><small>${esc(content.ui.price)}</small><strong>${esc(program.price || content.ui.priceUnknown)}</strong></div>
        ${requestLink(content.ui.book, 'row-link', program.id)}
      </article>`).join('')}
    </div>
    <div class="section-action reveal">${requestLink(content.ui.allPrograms, 'line-link')}</div>
  </section>`;
}

function places(content) {
  return `<section class="landing-section" id="places">
    <header class="section-title reveal">
      <p class="eyebrow">${esc(content.home.venuesLabel)}</p>
      <h2>${esc(content.home.venuesTitle)}</h2>
    </header>
    <div class="place-list">
      ${visible(content.venues).map((venue, index) => `<article class="place reveal" style="--delay:${index * 70}ms">${optionalImage(venue.image, venue.imageAlt, 'place-image')}
        <div><small>${esc(venue.district)}</small><h3>${esc(venue.name)}</h3><p>${esc(venue.address)}</p></div>
        ${externalLink(venue.mapUrl, content.ui.map)}
      </article>`).join('')}
    </div>
  </section>`;
}

function mediaStrip(content) {
  const gallery = content.home.gallery || [];
  const videos = visible(content.videos.items);
  if (!gallery.length && !videos.length) return '';
  return `<section class="landing-section media-section">
    <header class="section-title reveal"><p class="eyebrow">${esc(content.ui.gallery)}</p><h2>${esc(content.home.galleryTitle || content.videos.title)}</h2></header>
    ${gallery.length ? `<div class="gallery-strip">${gallery.map((item, index) => optionalImage(item.image, item.alt, `gallery-image reveal delay-${Math.min(index, 3)}`)).join('')}</div>` : ''}
    ${videos.length ? `<div class="video-strip">${videos.map((video, index) => `<article class="reveal" style="--delay:${index * 70}ms"><video controls playsinline preload="metadata" ${video.poster ? `poster="${safeUrl(video.poster)}"` : ''} src="${safeUrl(video.url)}"></video><p>${esc(video.title)}</p></article>`).join('')}</div>` : ''}
  </section>`;
}

function reviews(content) {
  const items = visible(content.reviews.items).slice(0, 2);
  if (!items.length) return '';
  return `<section class="landing-section reviews" id="reviews">
    <header class="section-title reveal"><p class="eyebrow">${esc(content.reviews.eyebrow)}</p><h2>${esc(content.reviews.title)} ${esc(content.reviews.titleAccent)}</h2></header>
    <div class="review-list">${items.map((item, index) => `<blockquote class="reveal" style="--delay:${index * 70}ms"><p>${esc(item.text)}</p><footer>${esc(item.name)}${item.date ? ` · ${esc(item.date)}` : ''}</footer></blockquote>`).join('')}</div>
    <div class="section-action reveal">${externalLink(content.brand.vk, content.reviews.linkText)}</div>
  </section>`;
}

function contact(content) {
  return `<section class="contact reveal" id="contact">
    <p class="eyebrow">${esc(content.home.ctaLabel)}</p>
    <h2>${esc(content.home.ctaTitle)}</h2>
    <p>${esc(content.home.ctaText)}</p>
    <div class="contact-actions">${requestLink(content.ui.contact)}${externalLink(content.brand.vk, content.ui.vk, 'action action-quiet')}</div>
    <div class="contact-line">
      <a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a>
      <a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a>
      <span>${esc(content.brand.city)}</span>
    </div>
  </section>`;
}

function requestDialog(content) {
  const booking = content.booking;
  return `<dialog class="request-dialog" id="request-dialog" aria-labelledby="request-title">
    <button class="dialog-close" type="button" data-request-close aria-label="${esc(content.ui.close)}">Закрыть <span aria-hidden="true">×</span></button>
    <div class="dialog-layout">
      <header class="dialog-intro"><p class="eyebrow">${esc(booking.eyebrow)}</p><h2 id="request-title">${esc(booking.title)} ${esc(booking.titleAccent)}</h2><p>${esc(booking.text)}</p><div><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a></div></header>
      <form id="booking-form" class="booking-form">
        <div class="form-grid">
          <label><span>${esc(booking.nameLabel)}</span><input name="name" autocomplete="name" maxlength="100" required></label>
          <label><span>${esc(booking.phoneLabel)}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="25" required placeholder="+7 …"></label>
          <label><span>${esc(booking.programLabel)}</span><select name="program" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.programs).map(program => `<option value="${esc(program.id)}">${esc(program.title)}</option>`).join('')}</select></label>
          <label><span>${esc(booking.venueLabel)}</span><select name="venue" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.venues).map(venue => `<option value="${esc(venue.id)}">${esc(venue.name)}</option>`).join('')}</select></label>
          <label><span>${esc(booking.dateLabel)}</span><input type="date" name="date" required></label>
          <label><span>${esc(booking.timeLabel)}</span><input type="time" name="time" required></label>
          <label><span>${esc(booking.peopleLabel)}</span><input name="people" type="number" inputmode="numeric" min="1" max="200" required></label>
          <label class="form-wide"><span>${esc(booking.commentLabel)}</span><textarea name="comment" rows="2" maxlength="1500"></textarea></label>
        </div>
        <div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <label class="consent"><input name="consent" type="checkbox" required><span>${esc(booking.consentLabel)}. <a href="privacy.html" target="_blank" rel="noopener noreferrer">${esc(content.ui.privacy)}</a></span></label>
        <div class="form-submit"><button class="action action-primary" type="submit" disabled><span>${esc(booking.submitLabel)}</span><b aria-hidden="true">↗</b></button><p id="booking-status" role="status" aria-live="polite" tabindex="-1">${esc(booking.offlineText)}</p></div>
      </form>
    </div>
    <script id="booking-config" type="application/json">${JSON.stringify({apiBase: content.settings.apiBase, privacyReady: content.privacy.ready, labels: booking}).replace(/</g, '\\u003c')}</script>
  </dialog>`;
}

function footer(content) {
  return `<footer class="site-footer">
    <a class="footer-brand" href="index.html">${esc(content.brand.name)}</a>
    <div class="footer-links"><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.vk)}" target="_blank" rel="noopener noreferrer">ВКонтакте ↗</a><a href="privacy.html">${esc(content.ui.privacy)}</a></div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(content.brand.copyright)}</span><a class="admin-corner" href="admin.html" aria-label="Администрирование">ааа</a></div>
  </footer>`;
}

function home(content) {
  return `${hero(content)}${intro(content)}${programs(content)}${places(content)}${mediaStrip(content)}${reviews(content)}${contact(content)}`;
}

function privacy(content) {
  return `<section class="legal"><header><p class="eyebrow">${esc(content.privacy.eyebrow)}</p><h1>${esc(content.privacy.title)} ${esc(content.privacy.titleAccent)}</h1><p>${esc(content.privacy.text)}</p></header>${content.privacy.operator ? `<p class="operator">${esc(content.privacy.operator)}</p>` : ''}<div class="legal-list">${content.privacy.sections.map((section, index) => `<article id="privacy-${index}"><h2>${esc(section.title)}</h2><p>${esc(section.text)}</p></article>`).join('')}</div></section>`;
}

function header(content, onHome = true) {
  const prefix = onHome ? '' : 'index.html';
  return `<header class="site-header"><a class="brand" href="index.html" aria-label="${esc(content.brand.name)} — на главную"><strong>${esc(content.brand.name)}</strong><small>${esc(content.brand.descriptor)}</small></a><nav aria-label="Основная навигация"><a href="${prefix}#programs">Программы</a><a href="${prefix}#places">Площадки</a></nav><a class="header-phone" href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a>${onHome ? requestLink(content.ui.contact, 'header-action') : `<a class="header-action" href="index.html#request"><span>${esc(content.ui.contact)}</span><b aria-hidden="true">↗</b></a>`}</header>`;
}

function shell(content, page, body) {
  const baseTitle = 'Лес|Программы для классов|Новосибирск';
  const title = page === 'home' ? baseTitle : `${content.ui.nav[page]} — ${baseTitle}`;
  return `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f0df95"><meta name="description" content="${esc(content.brand.description)}"><meta name="color-scheme" content="light"><title>${esc(title)}</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"><script type="module" src="assets/app.mjs"></script></head><body data-page="${page}"><a class="skip" href="#main">${esc(content.ui.skip)}</a>${header(content, page === 'home')}<main id="main">${body}</main>${footer(content)}${page === 'home' ? requestDialog(content) : ''}</body></html>`;
}

function redirect(content, page) {
  const target = redirects[page];
  const title = content.ui.nav[page] || 'ЛЕС';
  return `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><meta name="robots" content="noindex"><title>${esc(title)} — Лес|Программы для классов|Новосибирск</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"></head><body class="redirect"><main><h1>${esc(title)}</h1><p>Этот раздел теперь находится на короткой главной странице.</p><a class="action action-primary" href="${target}"><span>Открыть</span><b aria-hidden="true">↗</b></a></main></body></html>`;
}

export function main(content, page) {
  if (page === 'home') return home(content);
  if (page === 'privacy') return privacy(content);
  return '';
}

export function layout(content, page) {
  if (redirects[page]) return redirect(content, page);
  return shell(content, page, main(content, page));
}
