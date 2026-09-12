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
  const {className = '', label = 'Фотоматериал', index = '01', eager = false, tone = 'yellow'} = options;
  if (src) return `<figure class="media-frame has-media ${className}"><img src="${safeUrl(src)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1440" height="960"><figcaption>${esc(label)}</figcaption></figure>`;
  return `<div class="media-frame media-placeholder tone-${tone} ${className}" role="img" aria-label="${esc(alt)}"><div class="media-grid" aria-hidden="true"><span>ЛЕС</span><strong>${esc(index)}</strong><i></i><i></i></div><p class="media-label">${esc(label)}</p><span class="media-corner" aria-hidden="true">↘</span></div>`;
}

function programDescription(program) {
  if (program.description) return program.description;
  if (program.category === 'Семья') return 'Совместное приключение для детей и родителей на природе.';
  if (program.category === 'Аренда') return 'Закрытая лесная площадка для вашей компании и собственного сценария.';
  if (program.category === 'Сезонные') return 'Тематическая программа с заданиями, героями и общей историей.';
  return 'Командные задания и активная программа для школьного класса.';
}

function programRow(program, index, content, compact = false) {
  return `<article class="program-row ${compact ? 'program-row-compact' : ''} reveal" data-category="${esc(program.category)}" style="--delay:${(index % 5) * 45}ms"><span class="program-number">${number(index)}</span><span class="program-category">${esc(program.category)}</span><div class="program-name"><p>${esc(program.tag)}</p><h3 id="program-${index}">${esc(program.title)}</h3>${compact ? '' : `<span>${esc(programDescription(program))}</span>`}</div><div class="program-price"><small>${esc(content.ui.price)}</small><strong>${esc(program.price || content.ui.priceUnknown)}</strong>${program.unit ? `<span>${esc(program.unit)}</span>` : ''}</div><a class="program-action" href="booking.html?program=${encodeURIComponent(program.id || program.title)}" aria-label="${esc(content.ui.book)}: ${esc(program.title)}"><span>${esc(content.ui.book)}</span><b aria-hidden="true">↗</b></a></article>`;
}

function venueFeature(venue, index, content, full = false) {
  return `<article class="venue-feature reveal"><div class="venue-visual">${media(venue.image, venue.imageAlt, {className:'venue-media',label:venue.name,index:number(index),tone:index ? 'cream' : 'yellow'})}<span class="venue-coordinate">54°59′ N / 82°54′ E</span></div><div class="venue-info"><div class="venue-index"><span>${number(index)}</span><p>${esc(venue.district)}</p></div><h3>${esc(venue.name)}</h3><p>${esc(full ? venue.description : venue.address)}</p>${full ? `<address>${esc(venue.address)}</address>${button(safeUrl(venue.mapUrl), content.ui.map, 'outline', true)}` : textLink('venues.html', content.ui.details)}</div></article>`;
}

function pageHero(page, index, note = 'ЛЕС · НОВОСИБИРСК') {
  return `<section class="page-intro"><div class="page-index hero-enter"><span>/ ${index}</span><p>${esc(note)}</p></div><div class="page-title hero-enter" style="--delay:70ms"><p class="kicker">${esc(page.eyebrow)}</p><h1><span>${esc(page.title)}</span><em>${esc(page.titleAccent)}</em></h1></div><p class="page-lead hero-enter" style="--delay:140ms">${esc(page.text)}</p></section>`;
}

function facts(content) {
  return `<section class="facts-band"><p>Коротко о площадках</p>${content.home.stats.map((stat, index) => `<article><span>${number(index)}</span><strong>${esc(stat.value)}</strong><p>${esc(stat.label)}</p></article>`).join('')}</section>`;
}

function routeSection() {
  const steps = [
    ['Сначала', 'Выберите программу', 'Возраст, формат и характер события.'],
    ['Затем', 'Оставьте заявку', 'Дата, площадка и количество участников.'],
    ['Готово', 'Согласуйте детали', 'Администратор подтвердит свободное время.']
  ];
  return `<section class="route-section section"><header class="route-title reveal"><p class="kicker">Маршрут до встречи</p><h2>Три понятных шага</h2></header><div class="route-line" aria-hidden="true"><i></i></div><div class="route-steps">${steps.map((step, index) => `<article class="reveal" style="--delay:${index * 80}ms"><span>0${index + 1} / ${step[0]}</span><h3>${step[1]}</h3><p>${step[2]}</p></article>`).join('')}</div></section>`;
}

function videoSection(content) {
  const videos = visible(content.videos.items);
  if (videos.length) return `<section class="video-section section">${sectionHead('Лес в движении', content.videos.title)}<div class="video-grid">${videos.map((video, index) => `<article class="reveal" style="--delay:${index * 70}ms"><video controls playsinline preload="metadata" ${video.poster ? `poster="${safeUrl(video.poster)}"` : ''} src="${safeUrl(video.url)}"></video><div><span>${number(index)}</span><h3>${esc(video.title)}</h3></div></article>`).join('')}</div></section>`;
  return `<section class="video-section section"><div class="video-stage reveal"><div class="video-code"><span>VIDEO / 00</span><span>СКОРО</span></div><button class="video-play" type="button" disabled aria-label="Видео появится после добавления материалов"><span>▶</span></button><div class="video-copy"><p class="kicker">Лес в движении</p><h2>${esc(content.videos.title)}</h2><p>${esc(content.videos.text)}</p></div></div></section>`;
}

function cta(content) {
  return `<section class="big-cta section reveal"><div class="cta-side"><span>54°59′ N</span><span>НОВОСИБИРСК</span></div><div><p class="kicker">${esc(content.home.ctaLabel)}</p><h2>${esc(content.home.ctaTitle)}</h2><p>${esc(content.home.ctaText)}</p></div>${button('booking.html', content.ui.contact, 'yellow')}</section>`;
}

function home(content) {
  const featured = visible(content.programs).filter(program => program.featured).slice(0, 4);
  return `<section class="home-hero"><div class="hero-meta hero-enter"><span>ТЕРРИТОРИЯ / 54</span><span>${esc(content.brand.city)} · круглый год</span></div><div class="hero-copy hero-enter" style="--delay:60ms"><p class="kicker">${esc(content.home.eyebrow)}</p><h1><span>${esc(content.home.title)}</span><em>${esc(content.home.titleAccent)}</em></h1><p>${esc(content.home.text)}</p><div class="hero-actions">${button('services.html', content.ui.programs, 'yellow')}${textLink('about.html', content.ui.learn)}</div></div><div class="hero-visual hero-enter" style="--delay:130ms">${media(content.home.image, content.home.imageAlt, {className:'hero-media',label:content.home.imageCaption,index:'01',eager:true,tone:'yellow'})}<div class="hero-seal"><strong>2</strong><span>закрытые<br>площадки</span></div></div><div class="hero-bottom"><span>ТЕМАТИЧЕСКИЕ</span><span>ПОЗНАВАТЕЛЬНЫЕ</span><span>КОМАНДНЫЕ</span><span>РАЗВЛЕКАТЕЛЬНЫЕ</span></div></section>${facts(content)}<section class="manifest section"><div class="manifest-aside reveal"><span>01</span><p>${esc(content.home.introLabel)}</p></div><div class="manifest-copy reveal"><h2>${esc(content.home.introTitle)}</h2><p>${esc(content.home.introText)}</p></div></section><section class="programs-section section">${sectionHead(content.home.programsLabel, content.home.programsTitle, textLink('services.html', content.ui.allPrograms))}<div class="program-list featured-list">${featured.map(program => programRow(program, content.programs.indexOf(program), content, true)).join('')}</div></section>${routeSection()}<section class="venues-section section">${sectionHead(content.home.venuesLabel, content.home.venuesTitle)}<div class="venue-grid">${visible(content.venues).map((venue, index) => venueFeature(venue, index, content)).join('')}</div></section>${videoSection(content)}${cta(content)}`;
}

function about(content) {
  return `${pageHero(content.about, '01', 'О ПРОЕКТЕ')}<section class="about-story section"><div class="about-visual reveal">${media(content.about.image, content.about.imageAlt, {className:'about-media',label:'Команда и участники',index:'01',tone:'yellow'})}</div><div class="about-copy reveal"><span class="story-number">/ 2019—2026</span><p class="kicker">${esc(content.brand.name)}</p><h2>${esc(content.about.storyTitle)}</h2><p>${esc(content.about.storyText)}</p><blockquote>Для нас главное — провести программу увлекательно, весело и безопасно.</blockquote></div></section><section class="value-list section"><header class="value-heading reveal"><p class="kicker">Что важно</p><h2>Не декорации.<br>Настоящее участие.</h2></header>${content.about.values.map((value, index) => `<article class="reveal" style="--delay:${index * 55}ms"><span>${number(index)}</span><h3>${esc(value.title)}</h3><p>${esc(value.text)}</p></article>`).join('')}</section><section class="word-wall section reveal"><span>тематические</span><span>познавательные</span><span>командные</span><span>развлекательные</span></section>${content.about.gallery.length ? `<section class="section">${sectionHead('Фотографии', content.about.galleryTitle)}<div class="gallery">${content.about.gallery.map((item, index) => media(item.image, item.alt, {label:item.alt,index:number(index),tone:index % 2 ? 'cream' : 'yellow'})).join('')}</div></section>` : ''}${cta(content)}`;
}

function services(content) {
  const programs = visible(content.programs);
  return `${pageHero(content.services, '02', `${programs.length} ПРОГРАММ`)}<section class="catalog-note section reveal"><strong>${programs.length}</strong><div><span>программ сейчас в каталоге</span><p>${esc(content.services.priceNote)}</p></div></section><div class="filters section" role="group" aria-label="Выбор программы"><button type="button" class="filter active" data-filter="all" aria-pressed="true"><span>Все</span><b>${programs.length}</b></button>${content.services.filters.map(filter => `<button type="button" class="filter" data-filter="${esc(filter)}" aria-pressed="false"><span>${esc(filter)}</span><b>${programs.filter(item => item.category === filter).length}</b></button>`).join('')}</div><section class="program-list catalog-list section">${programs.map((program, index) => programRow(program, index, content)).join('')}</section><p class="empty-state section" hidden role="status">${esc(content.ui.empty)}</p><section class="faq section"><div class="faq-title reveal"><p class="kicker">Перед поездкой</p><h2>${esc(content.services.faqTitle)}</h2></div><div class="faq-list">${content.services.faqs.map((faq, index) => `<details class="reveal" style="--delay:${index * 55}ms"><summary><span>${number(index)}</span><h3>${esc(faq.question)}</h3><b aria-hidden="true">+</b></summary><p>${esc(faq.answer)}</p></details>`).join('')}</div></section>${cta(content)}`;
}

function venues(content) {
  return `${pageHero(content.venuesPage, '03', '2 ПЛОЩАДКИ')}<section class="venue-list section">${visible(content.venues).map((venue, index) => venueFeature(venue, index, content, true)).join('')}</section><section class="equipment section"><div class="equipment-heading reveal"><p class="kicker">На месте</p><h2>${esc(content.venuesPage.equipmentTitle)}</h2><p>${esc(content.venuesPage.equipmentNote)}</p></div><div class="equipment-list">${content.venuesPage.equipment.map((item, index) => `<div class="reveal" style="--delay:${index * 40}ms"><span>${number(index)}</span><p>${esc(item)}</p></div>`).join('')}</div></section>${cta(content)}`;
}

function reviews(content) {
  const reviews = visible(content.reviews.items);
  return `${pageHero(content.reviews, '04', 'ОТЗЫВЫ ГОСТЕЙ')}<section class="rating-stage section reveal"><div class="rating-main"><span>Оценка сообщества</span><strong>5,0</strong><div aria-label="5 из 5 звёзд">★★★★★</div></div><div class="rating-count"><strong>76</strong><p>отзывов уже опубликовано во ВКонтакте</p>${button(safeUrl(content.brand.vk), content.reviews.linkText, 'outline', true)}</div></section>${reviews.length ? `<section class="reviews-grid section">${reviews.map((review, index) => `<article class="review-card reveal" style="--delay:${index * 55}ms"><span>“</span><p>${esc(review.text)}</p><footer><strong>${esc(review.name)}</strong><time>${esc(review.date)}</time>${review.url ? textLink(safeUrl(review.url), 'Оригинал', true) : ''}</footer></article>`).join('')}</section>` : `<section class="reviews-empty section reveal"><span>/ 76</span><div><p class="kicker">Пока без перепечатки</p><h2>Все отзывы уже можно прочитать в сообществе</h2><p>Не придумываем тексты и не переносим их без авторов. Откройте реальные впечатления гостей во ВКонтакте.</p>${button(safeUrl(content.brand.vk), content.reviews.linkText, 'solid', true)}</div></section>`}${cta(content)}`;
}

function contacts(content) {
  return `${pageHero(content.contacts, '05', 'НА СВЯЗИ')}<section class="contacts-layout section"><div class="contact-main reveal"><span>/ ТЕЛЕФОНЫ</span><p>${esc(content.contacts.phoneLabel)}</p><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a><div>${button(safeUrl(content.brand.vk), content.ui.vk, 'yellow', true)}</div></div><div class="contact-checklist reveal"><p class="kicker">Чтобы быстрее подобрать программу</p><h2>${esc(content.contacts.checklistTitle)}</h2><ol>${content.contacts.checklist.map((item, index) => `<li><span>${number(index)}</span><p>${esc(item)}</p></li>`).join('')}</ol></div></section><section class="contact-venues section">${sectionHead('Где встречаемся', content.contacts.locationTitle)}<div>${visible(content.venues).map((venue, index) => `<article class="reveal" style="--delay:${index * 70}ms"><span>${number(index)}</span><div><h3>${esc(venue.name)}</h3><p>${esc(venue.address)}</p></div>${textLink(safeUrl(venue.mapUrl), content.ui.map, true)}</article>`).join('')}</div></section>`;
}

function booking(content) {
  const booking = content.booking;
  return `${pageHero(booking, '06', 'ЗАЯВКА')}<section class="booking-layout section"><form id="booking-form" class="booking-form reveal"><div class="form-head"><span>/ 01</span><div><p class="kicker">Расскажите главное</p><h2>Параметры поездки</h2></div></div><div class="form-grid"><label><span>${esc(booking.programLabel)}</span><select name="program" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.programs).map(program => `<option value="${esc(program.id)}">${esc(program.title)}</option>`).join('')}</select></label><label><span>${esc(booking.venueLabel)}</span><select name="venue" required><option value="">${esc(booking.selectLabel)}</option>${visible(content.venues).map(venue => `<option value="${esc(venue.id)}">${esc(venue.name)}</option>`).join('')}</select></label><label><span>${esc(booking.dateLabel)}</span><input type="date" name="date" required></label><label><span>${esc(booking.timeLabel)}</span><input type="time" name="time" required></label><label><span>${esc(booking.nameLabel)}</span><input name="name" autocomplete="given-name" maxlength="100" required></label><label><span>${esc(booking.phoneLabel)}</span><input name="phone" type="tel" autocomplete="tel" maxlength="25" required placeholder="+7 …"></label><label><span>${esc(booking.peopleLabel)}</span><input name="people" type="number" min="1" max="200" required></label></div><label class="textarea-label"><span>${esc(booking.commentLabel)}</span><textarea name="comment" rows="4" maxlength="1500"></textarea></label><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="consent"><input name="consent" type="checkbox" required><span>${esc(booking.consentLabel)}. <a href="privacy.html" target="_blank" rel="noopener noreferrer">${esc(content.ui.privacy)}</a></span></label><div class="form-submit"><button class="button button-solid" type="submit" disabled><span>${esc(booking.submitLabel)}</span><b aria-hidden="true">↗</b></button><p id="booking-status" role="status" aria-live="polite">${esc(booking.offlineText)}</p></div></form><aside class="booking-aside reveal" style="--delay:80ms"><span>/ 02</span><p class="kicker">После отправки</p><h2>Мы свяжемся и всё уточним</h2><p>${esc(booking.note)}</p><div class="booking-contact"><small>Можно не ждать</small><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a></div>${button(safeUrl(content.brand.vk), content.ui.vk, 'outline', true)}</aside></section><script id="booking-config" type="application/json">${JSON.stringify({apiBase:content.settings.apiBase,privacyReady:content.privacy.ready,labels:booking}).replace(/</g,'\\u003c')}</script>`;
}

function privacy(content) {
  return `${pageHero(content.privacy, '07', 'ДОКУМЕНТЫ')}<section class="privacy-layout section"><aside class="privacy-nav reveal"><p class="kicker">На странице</p>${content.privacy.sections.map((section, index) => `<a href="#privacy-${index}">${number(index)} <span>${esc(section.title)}</span></a>`).join('')}</aside><div class="privacy-copy">${content.privacy.operator ? `<p class="operator reveal">${esc(content.privacy.operator)}</p>` : ''}${content.privacy.sections.map((section, index) => `<article id="privacy-${index}" class="reveal" style="--delay:${index * 45}ms"><span>${number(index)}</span><h2>${esc(section.title)}</h2><p>${esc(section.text)}</p></article>`).join('')}</div></section>`;
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
  return `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#123d2c"><meta name="description" content="${esc(content.brand.description)}"><meta name="color-scheme" content="light"><title>${esc(title)}</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"><script type="module" src="assets/app.mjs"></script></head><body data-page="${page}"><div class="scroll-progress" aria-hidden="true"></div><a class="skip" href="#main">${esc(content.ui.skip)}</a><header class="site-header"><a class="brand" href="index.html" aria-label="${esc(content.brand.name)} — ${esc(content.ui.nav.home)}"><span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i></span><strong>${esc(content.brand.name)}</strong><small>Программы для классов<br>${esc(content.brand.city)}</small></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation"><span>${esc(content.ui.menu)}</span><i></i></button><nav id="navigation" aria-label="Основная навигация">${navPages.map((navPage, index) => `<a href="${filenames[navPage]}" ${navPage === page ? 'aria-current="page"' : ''}><i>0${index + 1}</i><span>${esc(content.ui.nav[navPage])}</span></a>`).join('')}</nav><a class="header-action" href="booking.html"><span>${esc(content.ui.contact)}</span><b aria-hidden="true">↗</b></a></header><main id="main">${main(content, page)}</main><footer class="site-footer"><div class="footer-top"><a class="footer-logo" href="index.html">${esc(content.brand.name)}<span>/54</span></a><div><p>${esc(content.brand.footerText)}</p>${button('booking.html', content.ui.contact, 'yellow')}</div></div><div class="footer-grid"><div><p class="footer-label">Навигация</p>${navPages.map(navPage => `<a href="${filenames[navPage]}">${esc(content.ui.nav[navPage])}</a>`).join('')}</div><div><p class="footer-label">Связаться</p><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a><a href="${safeUrl(content.brand.vk)}" target="_blank" rel="noopener noreferrer">ВКонтакте ↗</a></div><div><p class="footer-label">Площадки</p>${visible(content.venues).map(venue => `<span>${esc(venue.name)}<small>${esc(venue.address)}</small></span>`).join('')}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(content.brand.copyright)}</span><a href="privacy.html">${esc(content.ui.privacy)}</a><span>${baseTitle}</span><a class="admin-corner" href="admin.html" aria-label="Администрирование">ааа</a></div></footer></body></html>`;
}
