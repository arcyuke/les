import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pages,filenames,layout,safeUrl} from '../dist/assets/render.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const content=JSON.parse(await readFile(path.join(root,'data/content.json'),'utf8'));
test('all public pages keep working links and essential contact information',async()=>{const home=await readFile(path.join(root,'index.html'),'utf8');assert.ok(home.includes('<title>Лес|Программы для классов|Новосибирск</title>'));assert.ok(home.includes('+7 (913) 792-56-26'));assert.ok(home.includes('+7 (983) 005-38-68'));assert.ok(home.includes('privacy.html'));assert.equal((home.match(/class="program program-featured/g)||[]).length,3);assert.ok(!home.includes('Фото готовится'));for(const page of pages){const html=await readFile(path.join(root,filenames[page]),'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1);for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const url=match[1].split('?')[0].split('#')[0];if(url&&!/^(https?:|tel:|data:|blob:)/.test(url))await access(path.join(root,url));}}});
test('full catalog and detail pages remain available independently of the short home page',async()=>{
 const services=await readFile(path.join(root,'services.html'),'utf8');
 for(const p of content.programs)assert.ok(services.includes(`id="${p.id}"`));
 for(const filter of content.services.filters)assert.ok(services.includes(`data-filter="${filter}"`));
 for(const page of ['about','services','venues','reviews','contacts','booking']){
  const html=await readFile(path.join(root,filenames[page]),'utf8');
  assert.ok(!html.includes('http-equiv="refresh"'));assert.ok(html.includes('id="booking-form"'));
 }
});
test('content is escaped and unsafe media URLs cannot execute code',()=>{const c=structuredClone(content);c.home.title='<script>alert(1)</script>';const html=layout(c,'home');assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>alert(1)'));assert.equal(safeUrl('javascript:alert(1)'),'#');assert.equal(safeUrl('assets/../../.env'),'#');});
test('source prices and safe launch defaults are preserved',()=>{assert.equal(content.programs.length,15);assert.equal(content.programs.find(p=>p.title==='Аренда площадки').price,'10 000 ₽');assert.equal(content.privacy.ready,false);assert.equal(content.reviews.items.length,0);assert.equal(content.videos.items.length,0);assert.equal(new Set(content.programs.map(p=>p.id)).size,15);});
