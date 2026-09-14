export const pages = ['home', 'about', 'services', 'venues', 'reviews', 'contacts', 'booking', 'privacy'];
export const filenames = {home:'index.html',about:'about.html',services:'services.html',venues:'venues.html',reviews:'reviews.html',contacts:'contacts.html',booking:'booking.html',privacy:'privacy.html'};
const version = '20260914a';
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


const pageLink = (page, text, className='line-link') => `<a class="${className}" href="${filenames[page]}"><span>${esc(text)}</span><b aria-hidden="true">↗</b></a>`;
const sectionHeading = (label, title, link='') => `<header class="section-heading"><div><p class="eyebrow">${esc(label)}</p><h2>${esc(title)}</h2></div>${link}</header>`;
const facts = c => `<div class="fact-rotator" aria-label="${esc(c.ui.factsLabel)}"><div class="fact-slides">${c.home.stats.map((stat,i)=>`<div class="fact-slide ${i===0?'is-active':''}" ${i?'aria-hidden="true"':''}><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join('')}</div><div class="fact-controls">${c.home.stats.map((stat,i)=>`<button type="button" class="fact-dot ${i===0?'is-active':''}" data-fact="${i}" aria-label="${esc(stat.value+' '+stat.label)}" aria-pressed="${i===0}"></button>`).join('')}<button class="fact-pause" type="button" aria-label="${esc(c.ui.pauseFacts)}" data-play-label="${esc(c.ui.playFacts)}" data-pause-label="${esc(c.ui.pauseFacts)}"><span aria-hidden="true">Ⅱ</span></button></div></div>`;
function hero(c) {
  return `<section class="hero"><div class="wrap hero-grid ${c.home.image?'with-media':''}"><div class="hero-copy"><p class="eyebrow">${esc(c.home.eyebrow)}</p><h1>${esc(c.home.title)}<em>${esc(c.home.titleAccent)}</em></h1><p class="hero-lead">${esc(c.home.text)}</p><div class="actions">${requestLink(c.ui.contact)}</div></div>${c.home.image?`<div class="hero-visual has-photo">${optionalImage(c.home.image,c.home.imageAlt,'hero-photo','',true)}</div>`:''}</div></section><div class="wrap facts-wrap">${facts(c)}</div>`;
}
function programItem(p,c,featured=false) {
 const title=esc(p.title).replace(/Командообразующая/g,'Командо&shy;образующая');
 return `<article class="program ${featured?'program-featured':''}" data-category="${esc(p.category)}" id="${esc(p.id)}"><a class="program-cover ${p.image?'with-image':''}" href="#request" data-request-open data-program="${esc(p.id)}" aria-label="${esc(p.title+' — '+c.ui.contact)}">${p.image?optionalImage(p.image,p.imageAlt,'program-image'):`<span class="program-tag">${esc(p.tag||p.category)}</span><h3>${title}</h3>`}</a><div class="program-content">${p.image?`<p class="program-tag">${esc(p.tag||p.category)}</p><h3>${title}</h3>`:''}${p.description?`<p class="program-description">${esc(p.description)}</p>`:''}<div class="program-bottom"><div class="program-price"><strong>${esc(p.price||c.ui.priceUnknown)}</strong>${p.unit?`<small>${esc(p.unit)}</small>`:''}</div>${requestLink(c.ui.book,'line-link',p.id)}</div></div></article>`;
}
function programs(c) {
 const all=visible(c.programs), chosen=all.filter(p=>p.featured).slice(0,3);
 return `<section class="wrap section" id="programs">${sectionHeading(c.home.programsLabel,c.home.programsTitle,pageLink('services',c.ui.allPrograms))}<div class="featured-grid">${(chosen.length?chosen:all.slice(0,3)).map(p=>programItem(p,c,true)).join('')}</div></section>`;
}
function venueItem(v,c,detail=false) {
 return `<article class="venue" id="${esc(v.id)}">${optionalImage(v.image,v.imageAlt,'venue-image')}<div class="venue-copy"><p class="eyebrow">${esc(v.district)}</p><h3>${esc(v.name)}</h3><p>${esc(v.address)}</p>${detail?`<p class="venue-description">${esc(v.description)}</p>`:''}<div class="venue-actions">${externalLink(v.mapUrl,c.ui.map)}${detail?requestLink(c.ui.contact,'line-link'):''}</div></div></article>`;
}
function places(c) {
 return `<section class="places-band" id="places"><div class="wrap">${sectionHeading(c.home.venuesLabel,c.home.venuesTitle,pageLink('venues',c.ui.venueDetails))}<div class="venues-grid">${visible(c.venues).map(v=>venueItem(v,c)).join('')}</div></div></section>`;
}
function media(c,compact=false) {
 const gallery=[...(c.home.gallery||[]),...(c.about.gallery||[])].filter(p=>p.image), videos=visible(c.videos.items);
 if(!gallery.length&&!videos.length)return '';
 return `<section class="wrap section" id="media">${sectionHeading(c.ui.gallery,c.home.galleryTitle)}${gallery.length?`<div class="gallery-grid">${(compact?gallery.slice(0,3):gallery).map((item,i)=>`<button class="gallery-open" type="button" data-image-open="${safeUrl(item.image)}" data-image-alt="${esc(item.alt)}" aria-label="${esc(c.ui.openPhoto)} ${i+1}">${optionalImage(item.image,item.alt,'gallery-image')}</button>`).join('')}</div>`:''}${videos.length?`<div class="video-grid">${(compact?videos.slice(0,1):videos).map(v=>`<article>${/\.(mp4|webm|mov)(?:[?#]|$)/i.test(v.url)?`<video controls playsinline preload="metadata" ${v.poster?`poster="${safeUrl(v.poster)}"`:''} src="${safeUrl(v.url)}"></video>`:`${optionalImage(v.poster,v.title,'video-poster')}${externalLink(v.url,c.ui.watchVideo)}`}<h3>${esc(v.title)}</h3></article>`).join('')}</div>`:''}${compact?pageLink('about',c.ui.allMedia):''}</section>`;
}
function reviewItems(c,compact=false) {
 let items=visible(c.reviews.items);if(compact)items=items.slice(0,2);
 return items.length?`<div class="review-grid">${items.map(v=>`<blockquote><p>${esc(v.text)}</p><footer><strong>${esc(v.name)}</strong>${v.date?`<span>${esc(v.date)}</span>`:''}${v.url?externalLink(v.url,c.ui.reviewSource):''}</footer></blockquote>`).join('')}</div>`:'';
}
function reviewsTeaser(c) {
 return `<section class="wrap reviews-teaser" id="reviews"><div><p class="eyebrow">${esc(c.reviews.eyebrow)}</p><h2>${esc(c.home.reviewsTitle)}</h2></div><div><p>${esc(c.home.reviewsText)}</p>${pageLink('reviews',c.ui.nav.reviews)}</div></section>`;
}
function pageIntro(c,section) {
 const s=c[section];return `<header class="page-intro wrap"><p class="eyebrow">${esc(s.eyebrow)}</p><h1>${esc(s.title)} <em>${esc(s.titleAccent)}</em></h1><p>${esc(s.text)}</p></header>`;
}
function faqs(c) {
 return `<section class="wrap section faq">${sectionHeading('',c.services.faqTitle)}<div>${c.services.faqs.map(f=>`<details><summary>${esc(f.question)}<span aria-hidden="true">+</span></summary><p>${esc(f.answer)}</p></details>`).join('')}</div></section>`;
}
function catalog(c) {
 const categories=[...new Set([...c.services.filters,...visible(c.programs).map(p=>p.category)])];
 return `${pageIntro(c,'services')}<section class="wrap catalog"><div class="filter-bar" role="group" aria-label="${esc(c.ui.filterLabel)}"><button type="button" class="filter active" data-filter="" aria-pressed="true">${esc(c.ui.all)}</button>${categories.map(s=>`<button type="button" class="filter" data-filter="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join('')}</div><div class="catalog-grid">${visible(c.programs).map(p=>programItem(p,c)).join('')}</div><p class="catalog-empty" role="status" hidden>${esc(c.ui.empty)}</p><p class="price-note">${esc(c.services.priceNote)}</p></section>${faqs(c)}`;
}
function about(c) {
 return `${pageIntro(c,'about')}<section class="wrap about-section">${optionalImage(c.about.image,c.about.imageAlt,'about-image')}<div class="about-story"><h2>${esc(c.about.storyTitle)}</h2><p>${esc(c.about.storyText)}</p></div><div class="values-grid">${c.about.values.map(v=>`<article><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></article>`).join('')}</div></section>${media(c)}`;
}
function venues(c) {
 return `${pageIntro(c,'venuesPage')}<section class="wrap venues-detail"><div class="venues-grid">${visible(c.venues).map(v=>venueItem(v,c,true)).join('')}</div><div class="equipment"><h2>${esc(c.venuesPage.equipmentTitle)}</h2><div><ul>${c.venuesPage.equipment.map(v=>`<li>${esc(v)}</li>`).join('')}</ul><p>${esc(c.venuesPage.equipmentNote)}</p></div></div></section>`;
}
function reviews(c) {
 return `${pageIntro(c,'reviews')}<section class="wrap reviews-page">${reviewItems(c)}<div class="community-link"><p>${esc(c.reviews.empty)}</p>${externalLink(c.brand.vk,c.reviews.linkText,'action action-primary')}</div></section>`;
}
function contacts(c) {
 return `${pageIntro(c,'contacts')}<section class="wrap contacts-page"><div class="contact-details"><div><p class="eyebrow">${esc(c.contacts.phoneLabel)}</p><a class="contact-phone" href="${safeUrl(c.brand.phoneHref)}">${esc(c.brand.phone)}</a><a class="contact-phone" href="${safeUrl(c.brand.phone2Href)}">${esc(c.brand.phone2)}</a></div><div><p class="eyebrow">${esc(c.contacts.vkLabel)}</p>${externalLink(c.brand.vk,c.ui.vk)}<p>${esc(c.contacts.vkText)}</p></div><div><h2>${esc(c.contacts.checklistTitle)}</h2><ul>${c.contacts.checklist.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${requestLink(c.ui.contact)}</div></div>${sectionHeading('',c.contacts.locationTitle)}<div class="venues-grid">${visible(c.venues).map(v=>venueItem(v,c)).join('')}</div></section>`;
}
function privacy(c) {
 return `${pageIntro(c,'privacy')}<section class="wrap legal">${c.privacy.operator?`<p class="operator">${esc(c.privacy.operator)}</p>`:''}${c.privacy.sections.map(v=>`<article><h2>${esc(v.title)}</h2><p>${esc(v.text)}</p></article>`).join('')}</section>`;
}
function requestDialog(content) {
  const booking = content.booking;
  return `<dialog class="request-dialog" id="request-dialog" aria-labelledby="request-title">
    <button class="dialog-close" type="button" data-request-close aria-label="${esc(content.ui.close)}">${esc(content.ui.close)} <span aria-hidden="true">×</span></button>
    <div class="dialog-layout">
      <header class="dialog-intro"><p class="eyebrow">${esc(booking.eyebrow)}</p><h2 id="request-title">${esc(booking.title)} ${esc(booking.titleAccent)}</h2><p>${esc(booking.text)}</p><div><a href="${safeUrl(content.brand.phoneHref)}">${esc(content.brand.phone)}</a><a href="${safeUrl(content.brand.phone2Href)}">${esc(content.brand.phone2)}</a></div></header>
      <form id="booking-form" class="booking-form" novalidate>
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
        <div class="form-submit"><button class="action action-primary" type="submit" disabled><span>${esc(booking.submitLabel)}</span><b aria-hidden="true">↗</b></button><p id="booking-status" class="site-notice" data-kind="info" role="status" aria-live="polite" tabindex="-1">${esc(booking.offlineText)}</p></div>
      </form>
    </div>
    <script id="booking-config" type="application/json">${JSON.stringify({apiBase: content.settings.apiBase, privacyReady: content.privacy.ready, labels: booking}).replace(/</g, '\\u003c')}</script>
  </dialog>`;
}


function header(c,page) {
 const nav=['about','services','venues','reviews','contacts'];
 return `<header class="site-header"><div class="wrap header-inner"><a class="brand" href="index.html" aria-label="${esc(c.brand.name)} — ${esc(c.ui.nav.home)}"><strong>${esc(c.brand.name)}</strong><span>${esc(c.brand.descriptor)}<small>${esc(c.brand.city)}</small></span></a><nav class="main-nav" id="main-nav" aria-label="${esc(c.ui.navigation)}">${nav.map(p=>`<a href="${filenames[p]}" ${p===page?'aria-current="page"':''}>${esc(c.ui.nav[p])}</a>`).join('')}</nav>${requestLink(c.ui.contact,'header-action'+(page==='home'?' is-hidden':''))}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav"><span>${esc(c.ui.menu)}</span><i aria-hidden="true"></i></button></div></header>`;
}
function footer(c) {
 return `<footer class="site-footer"><div class="wrap"><div class="footer-top"><a class="footer-brand" href="index.html">${esc(c.brand.name)}</a><p>${esc(c.brand.footerText)}</p><div><a href="${safeUrl(c.brand.phoneHref)}">${esc(c.brand.phone)}</a><a href="${safeUrl(c.brand.phone2Href)}">${esc(c.brand.phone2)}</a></div><div>${externalLink(c.brand.vk,c.ui.vk)}<a href="contacts.html">${esc(c.ui.nav.contacts)}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(c.brand.copyright)}</span><a href="privacy.html">${esc(c.ui.privacy)}</a><a class="admin-corner" href="admin.html" aria-label="${esc(c.ui.admin)}">ааа</a></div></div></footer>`;
}
export function main(c,page) {
 const views={home:()=>`${hero(c)}${programs(c)}${places(c)}${media(c,true)}${reviewsTeaser(c)}`,services:()=>catalog(c),about:()=>about(c),venues:()=>venues(c),reviews:()=>reviews(c),contacts:()=>contacts(c),privacy:()=>privacy(c),booking:()=>`${pageIntro(c,'booking')}<div class="wrap booking-page">${requestLink(c.ui.contact)}</div>`};
 return (views[page]||views.home)();
}
export function layout(c,page) {
 const baseTitle='Лес|Программы для классов|Новосибирск';
 return `<!doctype html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#faf8ef"><meta name="description" content="${esc(c.brand.description)}"><meta name="color-scheme" content="light"><title>${esc(page==='home'?baseTitle:c.ui.nav[page]+' — '+baseTitle)}</title><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="preload" as="font" type="font/ttf" href="assets/fonts/Manrope.ttf" crossorigin><link rel="stylesheet" href="assets/style.css?v=${version}"><script type="module" src="assets/app.mjs?v=${version}"></script></head><body data-page="${page}"><a class="skip" href="#main">${esc(c.ui.skip)}</a>${header(c,page)}<main id="main">${main(c,page)}</main>${footer(c)}${requestDialog(c)}<dialog class="image-dialog" aria-label="${esc(c.ui.openPhoto)}"><button type="button" data-image-close aria-label="${esc(c.ui.close)}">×</button><img alt=""></dialog></body></html>`;
}
