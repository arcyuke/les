// Shared feedback for the public site and the authenticated editor.
const treePath='M24 2 12 19h7L8 34h10L4 51h16v11h8V51h16L30 34h10L29 19h7Z';
export const treeMarkup=()=>`<span class="tree-loader" aria-hidden="true"><svg viewBox="0 0 48 64" focusable="false"><path class="tree-base" d="${treePath}"/><path class="tree-fill" d="${treePath}"/></svg></span>`;
export function setNotice(element,message,kind='info') {
 if(!element)return;
 element.classList.add('site-notice');element.dataset.kind=kind;
 element.setAttribute('aria-busy',String(kind==='loading'));
 element.replaceChildren();
 if(!message){element.hidden=true;return;}element.hidden=false;
 const mark=document.createElement('span');mark.className='notice-mark';mark.setAttribute('aria-hidden','true');
 if(kind==='loading')mark.innerHTML=treeMarkup();else mark.textContent=kind==='error'?'!':kind==='success'?'✓':'i';
 const text=document.createElement('span');text.textContent=message;element.append(mark,text);
}
let toastTimer;
export function notify(message,kind='info') {
 let region=document.querySelector('.toast-region');
 if(!region){region=document.createElement('div');region.className='toast-region';region.setAttribute('aria-label','Уведомления');document.body.append(region);}
 const toast=document.createElement('div');toast.className='site-toast';toast.setAttribute('role',kind==='error'?'alert':'status');
 setNotice(toast,message,kind);
 const close=document.createElement('button');close.type='button';close.className='toast-close';close.setAttribute('aria-label','Закрыть уведомление');close.textContent='×';close.addEventListener('click',()=>toast.remove());toast.append(close);
 region.replaceChildren(toast);clearTimeout(toastTimer);if(kind!=='error')toastTimer=setTimeout(()=>toast.remove(),6500);
}
export function busy(element,active=true) {
 if(!element)return;
 element.setAttribute('aria-busy',String(active));
 if(active){if(!element.querySelector(':scope > .tree-loader'))element.insertAdjacentHTML('beforeend',treeMarkup());}
 else element.querySelector(':scope > .tree-loader')?.remove();
}
export async function withBusy(element,operation) {busy(element);try{return await operation();}finally{busy(element,false);}}
let confirmationOpen=false;
export function confirmAction(message,{title='Подтвердите действие',confirmLabel='Подтвердить',cancelLabel='Отмена'}={}) {
 if(confirmationOpen)return Promise.resolve(false);
 confirmationOpen=true;const opener=document.activeElement;
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='confirm-dialog';dialog.setAttribute('aria-labelledby','confirm-title');
  const heading=document.createElement('h2');heading.id='confirm-title';heading.textContent=title;
  const copy=document.createElement('p');copy.textContent=message;
  const actions=document.createElement('div');actions.className='confirm-actions';
  const cancel=document.createElement('button');cancel.type='button';cancel.className='action action-quiet';cancel.textContent=cancelLabel;cancel.autofocus=true;
  const accept=document.createElement('button');accept.type='button';accept.className='action action-primary';accept.textContent=confirmLabel;
  actions.append(cancel,accept);dialog.append(heading,copy,actions);document.body.append(dialog);
  let accepted=false;cancel.addEventListener('click',()=>dialog.close());accept.addEventListener('click',()=>{accepted=true;dialog.close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{dialog.remove();confirmationOpen=false;opener?.focus();resolve(accepted);},{once:true});dialog.showModal();
 });
}
export function validateForm(form) {
 form.querySelectorAll('.field-error').forEach(el=>el.remove());
 let first;
 for(const field of form.elements){if(!field.willValidate)continue;field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');
  if(field.validity.valid)continue;
  let message='Проверьте значение.';
  if(field.validity.valueMissing)message=field.type==='checkbox'?'Нужно ваше согласие.':field.tagName==='SELECT'?'Выберите вариант.':'Заполните это поле.';
  else if(field.validity.rangeUnderflow)message=`Минимальное значение: ${field.min}.`;
  else if(field.validity.rangeOverflow)message=`Максимальное значение: ${field.max}.`;
  const error=document.createElement('small');error.className='field-error';error.id=`error-${field.name}`;error.textContent=message;
  field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',error.id);field.closest('label').append(error);first||=field;
 }
 if(first){first.focus();return false;}return true;
}
export function clearFieldError(event) {
 const field=event.target;if(!field.matches('input,select,textarea'))return;
 if(field.validity.valid){field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');field.closest('label')?.querySelector('.field-error')?.remove();}
}
