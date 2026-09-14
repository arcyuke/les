import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {layout,pages,filenames,esc,safeUrl} from '../dist/assets/render.mjs';

// Minimal DOM double; textarea.type deliberately has the browser's getter-only contract.
class Element {
 constructor(tag='div') {
  this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.dataset={};this.attributes={};this.className='';this.textContent='';this.value='';this.hidden=false;this.checked=false;this.disabled=false;
  if(this.tagName==='TEXTAREA')Object.defineProperty(this,'type',{get:()=> 'textarea'});
  this.classList={add:(c)=>this.toggleClass(c,true),remove:(c)=>this.toggleClass(c,false),toggle:(c,on)=>this.toggleClass(c,on),contains:c=>this.className.split(' ').includes(c)};
 }
 toggleClass(c,on){const set=new Set(this.className.split(' ').filter(Boolean));if(on??!set.has(c))set.add(c);else set.delete(c);this.className=[...set].join(' ');}
 setAttribute(k,v){this.attributes[k]=String(v);}
 getAttribute(k){return this.attributes[k]??null;}
 append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n);}}
 replaceChildren(...nodes){this.children=[];this.textContent='';this.append(...nodes);}
 addEventListener(type,listener){(this.listeners[type]??=[]).push(listener);}
 async emit(type){for(const listener of this.listeners[type]||[])await listener({currentTarget:this,target:this,preventDefault(){}});}
 matches(selector){if(selector===':hover')return !!this.hovered;if(selector.startsWith('#'))return this.id===selector.slice(1);if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));if(selector==='[data-section]')return 'section'in this.dataset;if(selector==='[data-fact]')return 'fact'in this.dataset;if(selector==='[type=submit]')return this.type==='submit';return this.tagName===selector.toUpperCase();}
 querySelectorAll(selector){return this.children.flatMap(n=>[...(n.matches(selector)?[n]:[]),...n.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 contains(el){return this===el||this.children.some(n=>n.contains(el));}
 getBoundingClientRect(){return this.rect||{top:200,bottom:300,left:0,right:390,width:390,height:100};}
}
function environment(){
 const document=new Element('document');document.createElement=tag=>new Element(tag);document.body=document;document.activeElement=null;document.hidden=false;
 const window=new Element('window');const timers=new Map();let timerId=0;
 const context=vm.createContext({document,window,innerHeight:844,innerWidth:390,location:{hash:'',pathname:'/index.html',search:''},history:{},crypto:{randomUUID:()=> 'test-id'},URL,URLSearchParams,Blob,TextEncoder,TextDecoder,Uint8Array,structuredClone,atob,btoa,console,
  setInterval:fn=>{timers.set(++timerId,fn);return timerId;},clearInterval:id=>timers.delete(id),setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:()=>1,
  matchMedia:()=>({matches:true,addEventListener(){}}),setNotice(el,message,kind){el.textContent=message;el.dataset.kind=kind;},notify(){},busy(){},confirmAction:async()=>true,validateForm:()=>true,clearFieldError(){},layout,pages,filenames,esc,safeUrl});
 return {document,context,timers};
}
async function load(file,context){const source=await readFile(new URL('../dist/assets/'+file,import.meta.url),'utf8');vm.runInContext('"use strict";\n'+source.replace(/^import .*\n/gm,''),context,{filename:file});}
const content=JSON.parse(await readFile(new URL('../dist/data/content.json',import.meta.url),'utf8'));
function adminEnvironment(){
 const env=environment();const ids={};
 for(const id of ['login-panel','login','token','workspace','logout','publish','tabs','editor','admin-status','export-text']){const el=new Element(id==='token'?'input':'div');el.id=id;ids[id]=el;env.document.append(el);}
 ids.workspace.hidden=true;ids.logout.hidden=true;
 const submit=new Element('button');submit.type='submit';ids.login.append(submit);ids.token.value='test-token';
 return {...env,ids};
}

test('admin opens every content section and saves edited text and booleans to both published copies',async()=>{
 const {context,ids,document}=adminEnvironment();let savedTree,updatedRef;
 context.fetch=async(url,options={})=>{
  const route=url.split('/repos/arcyuke/les/')[1];const body=options.body?JSON.parse(options.body):null;
  if(route==='git/ref/heads/main')return {ok:true,json:async()=>({object:{sha:'original-commit'}})};
  if(route.startsWith('contents/'))return {ok:true,json:async()=>({content:Buffer.from(JSON.stringify(content)).toString('base64')})};
  if(route==='git/commits/original-commit')return {ok:true,json:async()=>({tree:{sha:'original-tree'}})};
  if(route==='git/trees'){savedTree=body;return {ok:true,json:async()=>({sha:'new-tree'})};}
  if(route==='git/commits')return {ok:true,json:async()=>({sha:'new-commit'})};
  if(route==='git/refs/heads/main'){updatedRef=body;return {ok:true,json:async()=>({})};}
  throw Error('Unexpected request: '+route);
 };
 await load('admin.mjs',context);await ids.login.emit('submit');
 assert.equal(ids.workspace.hidden,false);assert.equal(ids['login-panel'].hidden,true);assert.equal(ids['admin-status'].dataset.kind,'success');
 for(const tab of ids.tabs.children.filter(t=>!['requests','telegram'].includes(t.dataset.section))){await tab.emit('click');assert.ok(ids.editor.querySelectorAll('input').length+ids.editor.querySelectorAll('textarea').length>0,tab.dataset.section);}
 await ids.tabs.children.find(t=>t.dataset.section==='home').emit('click');
 const title=ids.editor.querySelectorAll('label').find(l=>l.textContent==='Заголовок').querySelector('input');title.value='Проверка: «Лес» & класс';await title.emit('input');
 const longText=ids.editor.querySelector('textarea');longText.value='Обновлённый многострочный текст\nВторая строка';await longText.emit('input');
 await ids.tabs.children.find(t=>t.dataset.section==='programs').emit('click');
 const visible=ids.editor.querySelectorAll('label').find(l=>l.textContent==='Показывать').querySelector('input');visible.checked=false;await visible.emit('input');
 await ids.publish.emit('click');
 assert.equal(ids['admin-status'].dataset.kind,'success');assert.equal(ids.publish.disabled,false);
 assert.equal(updatedRef.sha,'new-commit');assert.equal(updatedRef.force,false);assert.equal(savedTree.base_tree,'original-tree');
 const json=savedTree.tree.find(e=>e.path==='dist/data/content.json').content;const saved=JSON.parse(json);
 assert.equal(saved.home.title,title.value);assert.equal(saved.programs[0].visible,false);assert.ok(json.includes('Вторая строка'));
 assert.equal(savedTree.tree.find(e=>e.path==='data/content.json').content,json);
 for(const page of pages){const html=savedTree.tree.find(e=>e.path==='dist/'+filenames[page]).content;assert.equal(html,layout(saved,page));assert.equal(savedTree.tree.find(e=>e.path===filenames[page]).content,html);}
 assert.equal(document.querySelector('#token').value,'');
});

test('failed admin login keeps the editor closed and allows another login',async()=>{
 const {context,ids}=adminEnvironment();context.fetch=async()=>({ok:false,status:401});
 await load('admin.mjs',context);await ids.login.emit('submit');
 assert.equal(ids.workspace.hidden,true);assert.equal(ids.logout.hidden,true);assert.equal(ids['login-panel'].hidden,false);assert.equal(ids.login.querySelector('[type=submit]').disabled,false);assert.equal(ids['admin-status'].dataset.kind,'error');
});

test('facts autoplay despite sticky touch hover, focus, and reduced motion; manual pause still works',async()=>{
 const {context,document,timers}=environment();const rotator=new Element();rotator.className='fact-rotator';rotator.hovered=true;document.append(rotator);
 const slides=[],dots=[];for(let i=0;i<3;i++){const slide=new Element();slide.className='fact-slide'+(i===0?' is-active':'');rotator.append(slide);slides.push(slide);const dot=new Element('button');dot.dataset.fact=String(i);rotator.append(dot);dots.push(dot);}
 const pause=new Element('button');pause.className='fact-pause';pause.dataset.playLabel='Продолжить';pause.dataset.pauseLabel='Пауза';pause.append(new Element('span'));rotator.append(pause);document.activeElement=dots[0];
 await load('app.mjs',context);
 const tick=()=>{for(const timer of [...timers.values()])timer();};
 assert.equal(timers.size,1);tick();assert.ok(slides[1].classList.contains('is-active'));tick();assert.ok(slides[2].classList.contains('is-active'));tick();assert.ok(slides[0].classList.contains('is-active'));
 await dots[1].emit('click');tick();assert.ok(slides[2].classList.contains('is-active'));
 await pause.emit('click');assert.equal(timers.size,0);assert.equal(pause.getAttribute('aria-pressed'),'true');tick();assert.ok(slides[2].classList.contains('is-active'));
 await pause.emit('click');tick();assert.ok(slides[0].classList.contains('is-active'));
 document.hidden=true;tick();assert.ok(slides[0].classList.contains('is-active'));document.hidden=false;tick();assert.ok(slides[1].classList.contains('is-active'));
 rotator.rect={top:1000,bottom:1100};tick();assert.ok(slides[1].classList.contains('is-active'));rotator.rect={top:200,bottom:300};tick();assert.ok(slides[2].classList.contains('is-active'));
});
