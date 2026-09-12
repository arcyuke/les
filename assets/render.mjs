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
const button = (href, label, kind = 'solid', external = false) => `<a class="button button-${kind}" href="${href}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}><span>${esc(label)}</span><b aria-hidden="true">↗</b></a>`;
const textLink = (href, label, external = false) => `<a class="text-link" href="${href}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}><span>${esc(label)}</span><b aria-hidden="true">↗</b></a>`;
const sectionHead = (eyebrow, title, link = '') => `<header class="section-head reveal"><div><p class="kicker">${esc(eyebrow)}</p><h2>${esc(title)}</h2></div>${link}</header>`;

function media(src, alt, options = {}) {
  const {className = '', label = 'Фотография проекта', eager = false, tone = 'sun'} = options;
  if (src) {
    return `<figure class="media-frame has-media ${className}"><img src="${safeUrl(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1440" height="960"><figcaption>${esc(label)}</figcaption></figure>`;
  }
  return `<div class="media-frame media-empty tone-${tone} ${className}" role="img" aria-label="${esc(alt)}"><span>Фото готовится</span><p>${esc(label)}</p></div>`;
}

function programDescription(program) {
  if (program.description) return program.description;
  if (program.category === 'Семья') return 'Совместное приключение для детей и родителей на природе.';
  if (program.category === 'Аренда') return 'Закрытая лесная площадка для вашей компании и собственного сценария.';
  if (program.category === 'Сезонные') return 'Тематическая программа с заданиями, героями и общей историей.';
  return 'Активная командная программа для школьного класса на свежем воздухе.';
}

function programCard(program, index, content) {
  const picture = program.image ? media(program.image, program.imageAlt, {className: 'program-media', label: program.tag}) : '';
  return `<article class="program-card ${picture ? 'has-picture' : ''} reveal" data-category="${esc(program.category)}" style="--delay:${Math.min(index % 4, 3) * 55}ms">${picture}<div class="program-meta"><span>${esc(program.category)}</span><small>${esc(program.tag)}</small></div><div class="program-copy"><h3>${esc(program.title)}</h3><p>${esc(programDescription(program))}</p></div><div class="program-price"><small>${esc(content.ui.price)}</small><strong>${esc(program.price || content.ui.priceUnknown)}</strong>${program.unit ? `<span>${esc(program.unit)}</span>` : ''}</div>${textLink(`booking.html?program=${encodeURIComponent(program.id || program.title)}`, content.ui.book)}</article>`;
}

function venueCard(venue, index, content, large = false) {
  const label = large ? 'Фотография площадки' : venue.address;
  return `<article class="venue-card ${large ? 'venue-card-large' : ''} reveal" style="--delay:${index * 80}ms"><div class="venue-copy"><p class="kicker">${esc(venue.district)}</p><h3>${esc(venue.name)}</h3><p>${esc(large ? venue.description : venue.address)}</p>${large ? `<p class="venue-address">${esc(venue.address)}</p>${button(safeUrl(venue.mapUrl), content.ui.map, 'line', true)}` : textLink('venues.html', content.ui.details)}</div>${media(venue.image, venue.imageAlt, {className: 'venue-media', label, tone: index ? 'leaf' : 'sun'})}</article>`;
}

function pageHero(page, aside = '') {
  return `<section class="page-hero"><div class="page-hero-copy hero-enter"><p class="kicker">${esc(page.eyebrow)}</p><h1>${esc(page.title)} <em>${esc(page.titleAccent)}</em></h1><p class="page-lead">${esc(page.text)}</p></div><aside class="page-hero-aside hero-enter" style="--delay:100ms"><span>ЛЕС</span><p>${esc(aside || 'Новосибирск')}</p><small>Программы для школьных классов</small></aside></section>`;
}

function process() {
  const steps = [
    ['Выберите формат', 'Посмотрите программы по возрасту и характеру события.'],
    ['Оставьте заявку', 'Укажите площадку, дату и количество участников.'],
    ['Согласуйте детали', 'Администратор свяжется с вами и соберёт поездку вместе с вами.']
  ];
  return `<section class="process section"><div class="process-title reveal"><p class="kicker">Как всё проходит</p><h2>Понятный путь от идеи до встречи</h2></div><ol class="process-list">${steps.map((step, index) => `<li class="reveal" style="--delay:${index * 70}ms"><h3>${step[0]}</h3><p>${step[1]}</p></li>`).join('')}</ol></section>`;
}

function videoSection(content) {
  const videos = visible(content.videos.items);
  if (videos.length) {
    return `<section class="video-section section">${sectionHead('Смотрите, как это бывает', content.videos.title)}<div class="video-grid">${videos.map((video, index) => `<article class="reveal" style="--delay:${index * 70}ms"><video controls playsinline preload="metadata" ${video.poster ? `poster="${safeUrl(video.poster)}"` : ''} src="${safeUrl(video.url)}"></video><h3>${esc(video.title)}</h3></article>`).join('')}</div></section>`;
  }
  return `<section class="video-section section"><div class="video-empty reveal"><div><p class="kicker">Видео</p><h2>${esc(content.videos.title)}</h2></div><div><span aria-hidden="true">▶</span><p>${esc(content.videos.text)}</p><small>Материалы будут добавлены после съёмки</small></div></div></section>`;
}

function cta(content) {
  return `<section class="big-cta section reveal"><div><p class="kicker">${esc(content.home.ctaLabel)}</p><h2>${esc(content.home.ctaTitle)}</h2></div><div><p>${esc(content.home.ctaText)}</p>${button('booking.html', content.ui.contact, 'light')}</div></section>`;
}

function home(content) {
  const featured = visible(content.programs).filter(program => program.featured).slice(0, 3);
  const heroVisual = content.home.image
    ? media(content.home.image, content.home.imageAlt, {className: 'hero-media', label: content.home.imageCaption, eager: true})
    : `<div class="hero-brief" aria-label="Фотография проекта будет добавлена"><p>ЛЕС / НОВОСИБИРСК</p><div><strong>2</strong><span>закрытые лесные<br>площадки</span></div><small>Фотографии с программ<br>будут добавлены сюда</small></div>`;
  return `<section class="home-hero"><div class="hero-main hero-enter"><p class="kicker">${esc(content.home.eyebrow)}</p><h1><span>${esc(content.home.title)}</span><em>${esc(content.home.titleAccent)}</em></h1><p class="hero-lead">${esc(content.home.text)}</p><div class="hero-actions">${button('booking.html', content.ui.contact)}${textLink('services.html', content.ui.allPrograms)}</div><div class="hero-note"><span>Только ваша группа</span><span>Круглый год</span><span>${esc(content.brand.city)}</span></div></div><div class="hero-visual hero-enter" style="--delay:110ms">${heroVisual}</div></section><section class="hero-facts" aria-label="Ключевые факты">${content.home.stats.map(stat => `<div><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join('')}<div><strong>✓</strong><span>подготовленные ведущие и безопасность на локациях</span></div></section><section class="promise section"><div class="promise-statement reveal"><p class="kicker">${esc(content.home.introLabel)}</p><h2>${esc(content.home.introTitle)}</h2></div><div class="promise-copy reveal"><p>${esc(content.home.introText)}</p><ul><li>Площадка закрыта для посторонних</li><li>Программа занимает участников без долгих пауз</li><li>Есть вода, электричество, мангалы и уборные</li></ul></div></section><section class="programs-section section">${sectionHead(content.home.programsLabel, content.home.programsTitle, textLink('services.html', content.ui.allPrograms))}<div class="program-grid featured-grid">${featured.map(program => programCard(program, content.programs.indexOf(program), content)).join('')}</div></section><section class="assurance"><div class="assurance-inner"><div class="reveal"><p class="kicker">Спокойствие взрослых</p><h2>Организация, которую видно в деталях</h2></div><div class="assurance-list">${content.about.values.map((value, index) => `<article class="reveal" style="--delay:${index * 55}ms"><h3>${esc(value.title)}</h3><p>${esc(value.text)}</p></article>`).join('')}</div></div></section><section class="venues-section section">${sectionHead(content.home.venuesLabel, content.home.venuesTitle, textLink('venues.html', content.ui.details))}<div class="venue-grid">${visible(content.venues).map((venue, index) => venueCard(venue, index, content)).join('')}</div></section><section class="review-proof section reveal"><div><strong>5,0</strong><span>оценка сообщества</span></div><div><strong>76</strong><span>отзывов во ВКонтакте</span></div>${button(safeUrl(content.brand.vk), content.reviews.linkText, 'line', true)}</section>${process()}${videoSection(content)}${cta(content)}`;
}

function about(content) {
  return `${pageHero(content.about, 'О проекте')}<section class="about-story section"><div class="reveal">${media(content.about.image, content.about.imageAlt, {className: 'about-media', label: 'Команда и программа'})}</div><div class="about-story-copy reveal"><p class="kicker">${esc(content.brand.name)}</p><h2>${esc(content.about.storyTitle)}</h2><p>${esc(content.about.storyText)}</p><blockquote>Для нас главное — провести программу увлекательно, весело и безопасно.</blockquote></div></section><section class="values section">${content.about.values.map((value, index) => `<article class="reveal" style="--delay:${index * 55}ms"><h3>${esc(value.title)}</h3><p>${esc(value.text)}</p></article>`).join('')}</section><section class="wide-statement section reveal"><p>Тематические</p><p>Познавательные</p><p>Командные</p><p>Развлекательные</p></section>${content.about.gallery.length ? `<section class="section">${sectionHead('Галерея', content.about.galleryTitle)}<div class="gallery">${content.about.gallery.map(item => media(item.image, item.alt, {label: 'Фотография программы'})).join('')}</div></section>` : `<section class="gallery-plan section reveal"><div><p class="kicker">Галерея</p><h2>${esc(content.about.galleryTitle)}</h2></div><p>Добавим реальные фотографии программ. После загрузки ими можно управлять через админку.</p></section>`}${cta(content)}`;
}

function services(content) {
  const programs = visible(content.programs);
  return `${pageHero(content.services, 'Программы и стоимость')}<section class="catalog-intro section reveal"><h2>${programs.length} форматов для встреч</h2><p>${esc(content.services.priceNote)}</p></section><div class="filters section" role="group" aria-label="Выбор программы"><button type="button" class="filter active" data-filter="all" aria-pressed="true">${esc(content.ui.all)} <span>${programs.length}</span></button>${content.services.filters.map(filter => `<button type="button" class="filter" data-filter="${esc(filter)}" aria-pressed="false">${esc(filter)} <span>${programs.filter(item => item.category === filter).length}</span></button>`).join('')}</div><section class="program-grid catalog-grid section">${programs.map((program, index) => programCard(program, index, content)).join('')}</section><p class="empty-state section" hidden role="status">${esc(content.ui.empty)}</p><section class="faq section"><div class="faq-title reveal"><p class="kicker">Полезно знать</p><h2>${esc(content.services.faqTitle)}</h2></div><div class="faq-list">${content.services.faqs.map((faq, index) => `<details class="reveal" style="--delay:${index * 55}ms"><summary><span>${esc(faq.question)}</span><b aria-hidden="true">+</b></summary><p>${esc(faq.answer)}</p></details>`).join('')}</div></section>${cta(content)}`;
}

function venues(content) {
  return `${pageHero(content.venuesPage, 'Две закрытые площадки')}<section class="venue-list section">${visible(content.venues).map((venue, index) => venueCard(venue, index, content, true)).join('')}</section><section class="equipment section"><div class="equipment-title reveal"><p class="kicker">Всё необходимое</p><h2>${esc(content.venuesPage.equipmentTitle)}</h2><p>${esc(content.venuesPage.equipmentNote)}</p></div><div class="equipment-list">${content.venuesPage.equipment.map((item, index) => `<div class="reveal" style="--delay:${index * 45}ms"><p>${esc(item)}</p></div>`).join('')}</div></section>${cta(content)}`;
}

function reviews(content) {
  const reviews = visible(content.reviews.items);
  return `${pageHero(content.reviews, 'Реальные впечатления')}<section class="rating-stage section reveal"><div><strong>5,0</strong><span>★★★★★</span><p>оценка сообщества</p></div><div><strong>76</strong><p>отзывов опубликовано во ВКонтакте</p>${button(safeUrl(content.brand.vk), content.reviews.linkText, 'line', true)}</div></section>${reviews.length ? `<section class="reviews-grid section">${reviews.map((review, index) => `<article class="review-card reveal" style="--delay:${index * 55}ms"><p>${esc(review.text)}</p><footer><strong>${esc(review.name)}</strong><time>${esc(review.date)}</time>${review.url ? textLink(safeUrl(review.url), 'Оригинал', true) : ''}</footer></article>`).join('')}</section>` : `<section class="reviews-empty section reveal"><p class="kicker">Без выдуманных цитат</p><div><h2>Отзывы перенесём из сообщества</h2><p>Пока смотрите опубликованные впечатления гостей во ВКонтакте. На сайт добавим только реальные отзывы.</p>${button(safeUrl(content.brand.vk), content.reviews.linkText, 'solid', true)}</div></section>`}${cta(content)}`;
}

function contacts(content) {
  return `${pageHero(content.contacts, 'Связаться с организатором')}<section class="contacts-layout section"><div class="contact-main reveal"><p class="kicker">${esc(content.contacts.phoneLabel)}</p><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a><p>${esc(content.brand.manager)}</p><div>${button(safeUrl(content.brand.vk), content.ui.vk, 'light', true)}</div></div><div class="contact-checklist reveal"><p class="kicker">Перед обращением</p><h2>${esc(content.contacts.checklistTitle)}</h2><ol>${content.contacts.checklist.map(item => `<li>${esc(item)}</li>`).join('')}</ol></div></section><section class="contact-venues section">${sectionHead('Адреса', content.contacts.locationTitle)}<div>${visible(content.venues).map((venue, index) => `<article class="reveal" style="--delay:${index * 70}ms"><h3>${esc(venue.name)}</h3><p>${esc(venue.address)}</p>${textLink(safeUrl(venue.mapUrl), content.ui.map, true)}</article>`).join('')}</div></section>`;
}

function booking(content) {
  const booking = content.booking;
  return `${pageHero(booking, 'Заявка без оплаты')}<section class="booking-layout section"><form id="booking-form" class="booking-form reveal"><div class="form-head"><p class="kicker">Параметры поездки</p><h2>Расскажите о вашем дне</h2><p>Заполнение займёт около двух минут. Дата станет подтверждённой после звонка администратора.</p></div><div class="form-grid"><label><span>${esc(booking.programLabel)}</span><select name="program" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.programs).map(program => `<option value="${esc(program.id)}">${esc(program.title)}</option>`).join('')}</select></label><label><span>${esc(booking.venueLabel)}</span><select name="venue" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.venues).map(venue => `<option value="${esc(venue.id)}">${esc(venue.name)}</option>`).join('')}</select></label><label><span>${esc(booking.dateLabel)}</span><input type="date" name="date" required></label><label><span>${esc(booking.timeLabel)}</span><input type="time" name="time" required></label><label><span>${esc(booking.nameLabel)}</span><input name="name" autocomplete="name" maxlength="100" required></label><label><span>${esc(booking.phoneLabel)}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="25" required placeholder="+7 …"></label><label><span>${esc(booking.peopleLabel)}</span><input name="people" type="number" inputmode="numeric" min="1" max="200" required></label></div><label class="textarea-label"><span>${esc(booking.commentLabel)}</span><textarea name="comment" rows="4" maxlength="1500"></textarea></label><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input name="consent" type="checkbox" required><span>${esc(booking.consentLabel)}. <a href="privacy.html" target="_blank" rel="noopener noreferrer">${esc(content.ui.privacy)}</a></span></label><div class="form-submit"><button class="button button-solid" type="submit" disabled><span>${esc(booking.submitLabel)}</span><b aria-hidden="true">↗</b></button><p id="booking-status" role="status" aria-live="polite" tabindex="-1">${esc(booking.offlineText)}</p></div></form><aside class="booking-aside reveal" style="--delay:90ms"><p class="kicker">Что будет дальше</p><h2>Заявка — первый шаг</h2><p>${esc(booking.note)}</p><div class="booking-contact"><small>Связаться прямо сейчас</small><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a></div>${button(safeUrl(content.brand.vk), content.ui.vk, 'line', true)}</aside></section><script id="booking-config" type="application/json">${JSON.stringify({apiBase: content.settings.apiBase, privacyReady: content.privacy.ready, labels: booking}).replace(/</g, '\\u003c')}</script>`;
}

function privacy(content) {
  return `${pageHero(content.privacy, 'Документы')}<section class="privacy-layout section"><aside class="privacy-nav reveal"><p class="kicker">На странице</p>${content.privacy.sections.map((section, index) => `<a href="#privacy-${index}">${esc(section.title)}</a>`).join('')}</aside><div class="privacy-copy">${content.privacy.operator ? `<p class="operator reveal">${esc(content.privacy.operator)}</p>` : ''}${content.privacy.sections.map((section, index) => `<article id="privacy-${index}" class="reveal" style="--delay:${index * 50}ms"><h2>${esc(section.title)}</h2><p>${esc(section.text)}</p></article>`).join('')}</div></section>`;
}

export function main(content, page) {
  if (page === 'home') return home(content);
  if (page === 'about') return about(content);
  if (page === 'services') return services(content);
  if (page === 'venues') return venues(content);
  if (page === 'reviews') return reviews(content);
  if (page === 'contacts') return contacts(content);
  if (page === 'booking') return booking(content);
  if (page === 'privacy') return privacy(content);
  return '';
}

export function layout(content, page) {
  const navPages = ['about', 'services', 'venues', 'reviews', 'contacts'];
  const baseTitle = 'Лес|Программы для классов|Новосибирск';
  const title = page === 'home' ? baseTitle : `${content.ui.nav[page]} — ${baseTitle}`;
  return `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#184b37"><meta name="description" content="${esc(content.brand.description)}"><meta name="color-scheme" content="light"><title>${esc(title)}</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"><script type="module" src="assets/app.mjs"></script></head><body data-page="${page}"><div class="scroll-progress" aria-hidden="true"></div><a class="skip" href="#main">${esc(content.ui.skip)}</a><header class="site-header"><a class="brand" href="index.html" aria-label="${esc(content.brand.name)} — ${esc(content.ui.nav.home)}"><span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i></span><strong>${esc(content.brand.name)}</strong><small>${esc(content.brand.descriptor)}</small></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>${esc(content.ui.menu)}</span><i aria-hidden="true"></i></button><nav id="navigation" aria-label="Основная навигация">${navPages.map(navPage => `<a href="${filenames[navPage]}" ${navPage === page ? 'aria-current="page"' : ''}><span>${esc(content.ui.nav[navPage])}</span></a>`).join('')}</nav><a class="header-book" href="booking.html"><span>${esc(content.ui.contact)}</span><b aria-hidden="true">↗</b></a></header><main id="main">${main(content, page)}</main><footer class="site-footer"><div class="footer-lead"><a class="footer-logo" href="index.html">${esc(content.brand.name)}</a><p>${esc(content.brand.footerText)}</p><a class="footer-book" href="booking.html">${esc(content.ui.contact)} <span>↗</span></a></div><div class="footer-grid"><div><p class="footer-label">Навигация</p>${navPages.map(navPage => `<a href="${filenames[navPage]}">${esc(content.ui.nav[navPage])}</a>`).join('')}</div><div><p class="footer-label">Связаться</p><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a><a href="${safeUrl(content.brand.vk)}" target="_blank" rel="noopener noreferrer">ВКонтакте ↗</a></div><div><p class="footer-label">Площадки</p>${visible(content.venues).map(venue => `<span>${esc(venue.name)}<small>${esc(venue.address)}</small></span>`).join('')}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(content.brand.copyright)}</span><a href="privacy.html">${esc(content.ui.privacy)}</a><a class="admin-corner" href="admin.html" aria-label="Администрирование">ааа</a></div></footer><div class="mobile-actions" aria-label="Быстрые действия"><a href="${safeUrl(content.brand.phoneHref)}">Позвонить</a><a href="booking.html">${esc(content.ui.contact)} <span aria-hidden="true">↗</span></a></div></body></html>`;
}
