export const pages = ['home', 'about', 'services', 'venues', 'reviews', 'contacts', 'booking', 'privacy'];
export const filenames = {home:'index.html',about:'about.html',services:'services.html',venues:'venues.html',reviews:'reviews.html',contacts:'contacts.html',booking:'booking.html',privacy:'privacy.html'};

export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function safeUrl(value) {
  const url = String(value || '').trim();
  if (/^(https:\/\/|tel:\+?[\d ()-]+$)/i.test(url)) return esc(url);
  if (/^(assets|uploads)\/[a-zA-Z0-9_./-]+$/.test(url) && !url.includes('..')) return esc(url);
  return '#';
}

const visible = items => (items || []).filter(item => item.visible !== false);
const number = index => String(index + 1).padStart(2, '0');
const button = (href, label, kind = 'solid', external = false) => `<a class="button button-${kind}" href="${href}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}><span>${esc(label)}</span><b aria-hidden="true">↗</b></a>`;
const textLink = (href, label, external = false) => `<a class="text-link" href="${href}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}><span>${esc(label)}</span><b aria-hidden="true">↗</b></a>`;
const sectionHead = (eyebrow, title, link = '') => `<header class="section-head reveal"><div><p class="kicker">${esc(eyebrow)}</p><h2>${esc(title)}</h2></div>${link}</header>`;

function media(src, alt, options = {}) {
  const {className = '', label = 'Место для фотографии', eager = false, tone = 'sun'} = options;
  if (src) return `<figure class="media-frame has-media ${className}"><img src="${safeUrl(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1440" height="960"><figcaption>${esc(label)}</figcaption></figure>`;
  return `<div class="media-frame media-placeholder tone-${tone} ${className}" role="img" aria-label="${esc(alt)}"><span class="media-plus" aria-hidden="true">+</span><div class="media-brand" aria-hidden="true">ЛЕС</div><p>${esc(label)}</p><i aria-hidden="true"></i></div>`;
}

function programDescription(program) {
  if (program.description) return program.description;
  if (program.category === 'Семья') return 'Совместное приключение для детей и родителей на природе.';
  if (program.category === 'Аренда') return 'Закрытая лесная площадка для вашей компании и собственного сценария.';
  if (program.category === 'Сезонные') return 'Тематическая программа с заданиями, героями и общей историей.';
  return 'Активная командная программа для школьного класса на свежем воздухе.';
}

function programCard(program, index, content) {
  const picture = program.image ? media(program.image, program.imageAlt, {className:'program-media',label:program.tag}) : '';
  return `<article class="program-card reveal" data-category="${esc(program.category)}" style="--delay:${(index % 3) * 70}ms">${picture}<div class="program-top"><span class="pill">${esc(program.category)}</span></div><div class="program-copy"><p class="program-tag">${esc(program.tag)}</p><h3 id="program-${index}">${esc(program.title)}</h3><p>${esc(programDescription(program))}</p></div><div class="program-bottom"><div><small>${esc(content.ui.price)}</small><strong>${esc(program.price || content.ui.priceUnknown)}</strong>${program.unit ? `<span>${esc(program.unit)}</span>` : ''}</div>${textLink(`booking.html?program=${encodeURIComponent(program.id || program.title)}`, content.ui.book)}</div></article>`;
}

function venueCard(venue, index, content, large = false) {
  return `<article class="venue-card ${large ? 'venue-card-large' : ''} reveal" style="--delay:${index * 90}ms">${media(venue.image, venue.imageAlt, {className:'venue-media',label:'Фотография площадки',tone:index ? 'leaf' : 'sun'})}<div class="venue-copy"><div class="venue-meta"><span>${esc(venue.district)}</span></div><h3>${esc(venue.name)}</h3><p>${esc(large ? venue.description : venue.address)}</p>${large ? `<p class="venue-address">${esc(venue.address)}</p>${button(safeUrl(venue.mapUrl), content.ui.map, 'line', true)}` : textLink('venues.html', content.ui.details)}</div></article>`;
}

function pageHero(page, mediaLabel = '') {
  return `<section class="page-hero"><div class="page-hero-copy hero-enter"><p class="kicker">${esc(page.eyebrow)}</p><h1>${esc(page.title)} <em>${esc(page.titleAccent)}</em></h1><p class="page-lead">${esc(page.text)}</p></div><div class="page-hero-mark hero-enter" style="--delay:120ms"><span>ЛЕС</span><p>${esc(mediaLabel || 'Новосибирск')}</p></div></section>`;
}

function ticker() {
  const labels = ['Приключения для классов', 'Две лесные площадки', 'Отдых круглый год', 'Только ваша компания'];
  const row = labels.map(label => `<span>${esc(label)} <b>✦</b></span>`).join('');
  return `<div class="ticker" aria-label="Коротко о Лесе"><div>${row}${row}</div></div>`;
}

function process() {
  const steps = [
    ['01', 'Выберите формат', 'Посмотрите программы по возрасту и характеру события.'],
    ['02', 'Оставьте заявку', 'Укажите площадку, дату и количество участников.'],
    ['03', 'Подтвердите детали', 'Администратор свяжется с вами и согласует поездку.']
  ];
  return `<section class="process section"><div class="process-title reveal"><p class="kicker">Как это работает</p><h2>От идеи до встречи — три шага</h2></div><div class="process-grid">${steps.map((step, index) => `<article class="reveal" style="--delay:${index * 90}ms"><span>${step[0]}</span><h3>${step[1]}</h3><p>${step[2]}</p></article>`).join('')}</div></section>`;
}

function videoSection(content) {
  const videos = visible(content.videos.items);
  return `<section class="video-section section">${sectionHead('Смотрите, как это бывает', content.videos.title)}${videos.length ? `<div class="video-grid">${videos.map((video, index) => `<article class="reveal" style="--delay:${index * 80}ms"><video controls playsinline preload="metadata" ${video.poster ? `poster="${safeUrl(video.poster)}"` : ''} src="${safeUrl(video.url)}"></video><h3>${esc(video.title)}</h3></article>`).join('')}</div>` : `<div class="video-stage reveal"><div class="video-play" aria-hidden="true"><span>▶</span></div><div><p class="kicker">Видео добавим следующим этапом</p><h3>Здесь будут живые моменты с программ</h3><p>${esc(content.videos.text)}</p></div><span class="video-time">00:00</span></div>`}</section>`;
}

function cta(content) {
  return `<section class="big-cta section reveal"><div class="cta-orbit" aria-hidden="true"><span>ЛЕС</span></div><div><p class="kicker">${esc(content.home.ctaLabel)}</p><h2>${esc(content.home.ctaTitle)}</h2><p>${esc(content.home.ctaText)}</p></div>${button('booking.html', content.ui.contact, 'light')}</section>`;
}

function home(content) {
  const featured = visible(content.programs).filter(program => program.featured).slice(0, 3);
  return `<section class="home-hero"><div class="hero-main hero-enter"><p class="kicker">${esc(content.home.eyebrow)}</p><h1><span>${esc(content.home.title)}</span><em>${esc(content.home.titleAccent)}</em></h1><p class="hero-lead">${esc(content.home.text)}</p><div class="hero-actions">${button('services.html', content.ui.programs)}${textLink('about.html', content.ui.learn)}</div><div class="hero-note"><span>${esc(content.brand.city)}</span><span>Круглый год</span></div></div><div class="hero-visual hero-enter" style="--delay:120ms">${media(content.home.image, content.home.imageAlt, {className:'hero-media',label:'Главная фотография проекта',eager:true})}<div class="hero-badge"><span>2</span><p>лесные<br>площадки</p></div><p class="hero-caption">${esc(content.home.imageCaption)}</p></div></section>${ticker()}<section class="manifest section"><div class="manifest-mark reveal" aria-hidden="true"><span>Л</span></div><div class="reveal"><p class="kicker">${esc(content.home.introLabel)}</p><h2>${esc(content.home.introTitle)}</h2><p>${esc(content.home.introText)}</p></div></section><section class="numbers section">${content.home.stats.map((stat, index) => `<article class="reveal" style="--delay:${index * 80}ms"><strong>${esc(stat.value)}</strong><p>${esc(stat.label)}</p></article>`).join('')}</section><section class="section programs-section">${sectionHead(content.home.programsLabel, content.home.programsTitle, textLink('services.html', content.ui.allPrograms))}<div class="program-grid featured-grid">${featured.map(program => programCard(program, content.programs.indexOf(program), content)).join('')}</div></section>${process()}<section class="section venues-section">${sectionHead(content.home.venuesLabel, content.home.venuesTitle)}<div class="venue-grid">${visible(content.venues).map((venue, index) => venueCard(venue, index, content)).join('')}</div></section>${videoSection(content)}${cta(content)}`;
}

function about(content) {
  return `${pageHero(content.about, 'О проекте')}<section class="about-story section"><div class="reveal">${media(content.about.image, content.about.imageAlt, {className:'about-media',label:'Фотография команды или программы'})}</div><div class="about-story-copy reveal"><p class="kicker">${esc(content.brand.name)}</p><h2>${esc(content.about.storyTitle)}</h2><p>${esc(content.about.storyText)}</p><blockquote>«Для нас главное — провести программу увлекательно, весело и безопасно»</blockquote></div></section><section class="values section">${content.about.values.map((value, index) => `<article class="reveal" style="--delay:${index * 70}ms"><h3>${esc(value.title)}</h3><p>${esc(value.text)}</p></article>`).join('')}</section><section class="wide-statement section reveal"><p>Тематические</p><p>Познавательные</p><p>Командные</p><p>Развлекательные</p></section>${content.about.gallery.length ? `<section class="section">${sectionHead('Галерея', content.about.galleryTitle)}<div class="gallery">${content.about.gallery.map(item => media(item.image, item.alt, {label:'Фотография программы'})).join('')}</div></section>` : `<section class="gallery-plan section reveal"><div><p class="kicker">Галерея готова к наполнению</p><h2>${esc(content.about.galleryTitle)}</h2></div><p>Фотографии можно будет добавлять, удалять и менять местами через админку.</p></section>`}${cta(content)}`;
}

function services(content) {
  const programs = visible(content.programs);
  return `${pageHero(content.services, `${programs.length} программ`)}<section class="catalog-intro section reveal"><div><strong>${programs.length}</strong><span>форматов<br>для встреч</span></div><p>${esc(content.services.priceNote)}</p></section><div class="filters section" role="group" aria-label="Выбор программы"><button type="button" class="filter active" data-filter="all" aria-pressed="true">${esc(content.ui.all)} <span>${programs.length}</span></button>${content.services.filters.map(filter => `<button type="button" class="filter" data-filter="${esc(filter)}" aria-pressed="false">${esc(filter)} <span>${programs.filter(item => item.category === filter).length}</span></button>`).join('')}</div><section class="program-grid catalog-grid section">${programs.map((program, index) => programCard(program, index, content)).join('')}</section><p class="empty-state section" hidden role="status">${esc(content.ui.empty)}</p><section class="faq section"><div class="faq-title reveal"><p class="kicker">Полезно знать</p><h2>${esc(content.services.faqTitle)}</h2></div><div class="faq-list">${content.services.faqs.map((faq, index) => `<details class="reveal" style="--delay:${index * 70}ms"><summary><span>${esc(faq.question)}</span><b aria-hidden="true">+</b></summary><p>${esc(faq.answer)}</p></details>`).join('')}</div></section>${cta(content)}`;
}

function venues(content) {
  return `${pageHero(content.venuesPage, '2 площадки')}<section class="venue-list section">${visible(content.venues).map((venue, index) => venueCard(venue, index, content, true)).join('')}</section><section class="equipment section"><div class="equipment-title reveal"><p class="kicker">Всё необходимое</p><h2>${esc(content.venuesPage.equipmentTitle)}</h2><p>${esc(content.venuesPage.equipmentNote)}</p></div><div class="equipment-list">${content.venuesPage.equipment.map((item, index) => `<div class="reveal" style="--delay:${index * 50}ms"><p>${esc(item)}</p></div>`).join('')}</div></section>${cta(content)}`;
}

function reviews(content) {
  const reviews = visible(content.reviews.items);
  return `${pageHero(content.reviews, 'Отзывы гостей')}<section class="rating-stage section reveal"><div><strong>5,0</strong><span>★★★★★</span><p>оценка сообщества</p></div><div><strong>76</strong><p>отзывов опубликовано<br>во ВКонтакте</p>${button(safeUrl(content.brand.vk), content.reviews.linkText, 'line', true)}</div></section>${reviews.length ? `<section class="reviews-grid section">${reviews.map((review, index) => `<article class="review-card reveal" style="--delay:${index * 70}ms"><span>“</span><p>${esc(review.text)}</p><footer><strong>${esc(review.name)}</strong><time>${esc(review.date)}</time>${review.url ? textLink(safeUrl(review.url), 'Оригинал', true) : ''}</footer></article>`).join('')}</section>` : `<section class="reviews-empty section reveal"><span>“</span><div><h2>Отзывы добавим из сообщества</h2><p>Страница уже оформлена. Сюда можно загрузить реальные отзывы и фотографии гостей через админку.</p></div></section>`}${cta(content)}`;
}

function contacts(content) {
  return `${pageHero(content.contacts, 'Связаться')}<section class="contacts-layout section"><div class="contact-main reveal"><p class="kicker">${esc(content.contacts.phoneLabel)}</p><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a><p>${esc(content.brand.manager)}</p><div>${button(safeUrl(content.brand.vk), content.ui.vk, 'light', true)}</div></div><div class="contact-checklist reveal"><p class="kicker">Перед звонком</p><h2>${esc(content.contacts.checklistTitle)}</h2><ol>${content.contacts.checklist.map((item, index) => `<li><span>${number(index)}</span>${esc(item)}</li>`).join('')}</ol></div></section><section class="contact-venues section">${sectionHead('Адреса', content.contacts.locationTitle)}<div>${visible(content.venues).map((venue, index) => `<article class="reveal" style="--delay:${index * 90}ms"><h3>${esc(venue.name)}</h3><p>${esc(venue.address)}</p>${textLink(safeUrl(venue.mapUrl), content.ui.map, true)}</article>`).join('')}</div></section>`;
}

function booking(content) {
  const booking = content.booking;
  return `${pageHero(booking, 'Онлайн-заявка')}<section class="booking-layout section"><form id="booking-form" class="booking-form reveal"><div class="form-head"><div><p class="kicker">Параметры поездки</p><h2>Расскажите о вашем дне</h2></div></div><div class="form-grid"><label><span>${esc(booking.programLabel)}</span><select name="program" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.programs).map(program => `<option value="${esc(program.id)}">${esc(program.title)}</option>`).join('')}</select></label><label><span>${esc(booking.venueLabel)}</span><select name="venue" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.venues).map(venue => `<option value="${esc(venue.id)}">${esc(venue.name)}</option>`).join('')}</select></label><label><span>${esc(booking.dateLabel)}</span><input type="date" name="date" required></label><label><span>${esc(booking.timeLabel)}</span><input type="time" name="time" required></label><label><span>${esc(booking.nameLabel)}</span><input name="name" autocomplete="given-name" maxlength="100" required></label><label><span>${esc(booking.phoneLabel)}</span><input name="phone" type="tel" autocomplete="tel" maxlength="25" required placeholder="+7 …"></label><label><span>${esc(booking.peopleLabel)}</span><input name="people" type="number" min="1" max="200" required></label></div><label class="textarea-label"><span>${esc(booking.commentLabel)}</span><textarea name="comment" rows="4" maxlength="1500"></textarea></label><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input name="consent" type="checkbox" required><span>${esc(booking.consentLabel)}. <a href="privacy.html" target="_blank" rel="noopener noreferrer">${esc(content.ui.privacy)}</a></span></label><div class="form-submit"><button class="button button-solid" type="submit" disabled><span>${esc(booking.submitLabel)}</span><b aria-hidden="true">↗</b></button><p id="booking-status" role="status" aria-live="polite">${esc(booking.offlineText)}</p></div></form><aside class="booking-aside reveal" style="--delay:100ms"><p class="kicker">Что будет дальше</p><h2>Заявка — первый шаг</h2><p>${esc(booking.note)}</p><div class="booking-contact"><small>Можно связаться прямо сейчас</small><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a></div>${button(safeUrl(content.brand.vk), content.ui.vk, 'line', true)}</aside></section><script id="booking-config" type="application/json">${JSON.stringify({apiBase:content.settings.apiBase,privacyReady:content.privacy.ready,labels:booking}).replace(/</g,'\\u003c')}</script>`;
}

function privacy(content) {
  return `${pageHero(content.privacy, 'Документы')}<section class="privacy-layout section"><aside class="privacy-nav reveal"><p class="kicker">На странице</p>${content.privacy.sections.map((section, index) => `<a href="#privacy-${index}">${esc(section.title)}</a>`).join('')}</aside><div class="privacy-copy">${content.privacy.operator ? `<p class="operator reveal">${esc(content.privacy.operator)}</p>` : ''}${content.privacy.sections.map((section, index) => `<article id="privacy-${index}" class="reveal" style="--delay:${index * 60}ms"><h2>${esc(section.title)}</h2><p>${esc(section.text)}</p></article>`).join('')}</div></section>`;
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
  const title = page === 'home' ? baseTitle : `${content.ui.nav[page]} | ${baseTitle}`;
  return `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#efd173"><meta name="description" content="${esc(content.brand.description)}"><meta name="color-scheme" content="light"><title>${esc(title)}</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"><script type="module" src="assets/app.mjs"></script></head><body data-page="${page}"><div class="scroll-progress" aria-hidden="true"></div><a class="skip" href="#main">${esc(content.ui.skip)}</a><header class="site-header"><a class="brand" href="index.html" aria-label="${esc(content.brand.name)} — ${esc(content.ui.nav.home)}"><span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i></span><strong>${esc(content.brand.name)}</strong><small>${esc(content.brand.descriptor)}</small></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>${esc(content.ui.menu)}</span><i></i></button><nav id="navigation" aria-label="Основная навигация">${navPages.map(navPage => `<a href="${filenames[navPage]}" ${navPage === page ? 'aria-current="page"' : ''}><span>${esc(content.ui.nav[navPage])}</span></a>`).join('')}</nav><a class="header-book" href="booking.html"><span>${esc(content.ui.contact)}</span><b aria-hidden="true">↗</b></a></header><main id="main">${main(content, page)}</main><footer class="site-footer"><div class="footer-lead"><a class="footer-logo" href="index.html">${esc(content.brand.name)}<span>.</span></a><p>${esc(content.brand.footerText)}</p><a class="footer-book" href="booking.html">${esc(content.ui.contact)} <span>↗</span></a></div><div class="footer-grid"><div><p class="footer-label">Навигация</p>${navPages.map(navPage => `<a href="${filenames[navPage]}">${esc(content.ui.nav[navPage])}</a>`).join('')}</div><div><p class="footer-label">Связаться</p><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a><a href="${safeUrl(content.brand.vk)}" target="_blank" rel="noopener noreferrer">ВКонтакте ↗</a></div><div><p class="footer-label">Площадки</p>${visible(content.venues).map(venue => `<span>${esc(venue.name)}<small>${esc(venue.address)}</small></span>`).join('')}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(content.brand.copyright)}</span><a href="privacy.html">${esc(content.ui.privacy)}</a><a class="admin-corner" href="admin.html" aria-label="Администрирование">ааа</a></div></footer></body></html>`;
}
