'use strict';
const PRICE = Object.freeze({'10x15':18,'13x18':28,'15x21':42,'20x30':95});
const RUB = new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0});
const byId = id => document.getElementById(id);
let currentTotal = 0;
function calculate({format, quantity, paper, urgency}) {
  if (!(format in PRICE) || !Number.isInteger(quantity) || quantity < 1 || quantity > 9999) return null;
  const base = PRICE[format] * quantity;
  const paperExtra = paper === 'matte' ? base * .2 : 0;
  const beforeRush = base + paperExtra;
  const rushExtra = urgency === 'express' ? beforeRush * .3 : 0;
  const beforeDiscount = beforeRush + rushExtra;
  const discount = quantity >= 50 ? beforeDiscount * .1 : 0;
  return {base,paperExtra,rushExtra,discount,total:Math.round(beforeDiscount - discount)};
}
function recalc(){
  const input = byId('quantity');
  const quantity = Number(input.value);
  const val = calculate({format:byId('format').value,quantity,paper:byId('paper').value,urgency:byId('urgency').value});
  if(!val){byId('total').textContent = '—';byId('order-total').value='';currentTotal=0;return;}
  for (const [key,id] of [['base','base'],['paperExtra','paper-extra'],['rushExtra','rush-extra']]) byId(id).textContent=RUB.format(Math.round(val[key]));
  byId('discount').textContent=val.discount ? '−'+RUB.format(Math.round(val.discount)) : '0 ₽';
  const changed = currentTotal !== 0 && currentTotal !== val.total;
  byId('total').textContent=RUB.format(val.total);byId('order-total').value=RUB.format(val.total);currentTotal=val.total;
  byId('discount').closest('.summary-line').classList.toggle('is-active',val.discount>0);
  if(changed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const el=byId('sum-total');el.classList.remove('is-updating');void el.offsetWidth;el.classList.add('is-updating');
  }
}
for(const id of ['format','quantity','paper','urgency']) byId(id).addEventListener('input',recalc);
byId('minus').addEventListener('click',()=>{byId('quantity').value=Math.max(1,(Number(byId('quantity').value)||1)-1);recalc();});
byId('plus').addEventListener('click',()=>{byId('quantity').value=Math.min(9999,(Number(byId('quantity').value)||0)+1);recalc();});
byId('customer-phone').addEventListener('input',()=>byId('customer-phone').setCustomValidity(''));
byId('photos-url').addEventListener('input',()=>byId('photos-url').setCustomValidity(''));
function buildYandexUrl(){
  const c=window.FOTOLIST_YANDEX||{};
  const fields=c.fields||{},choices=c.choices||{};
  if(!/^https:\/\/forms\.yandex\.ru\/u\/[a-zA-Z0-9_-]+\/?$/.test(c.url||''))return null;
  const required=['name','phone','email','pickup','photos','total','format','quantity','paper','urgency'];
  if(required.some(field=>!fields[field]||!/^[-\w]+$/.test(fields[field])))return null;
  if(new Set(required.map(field=>fields[field])).size!==required.length)return null;
  const format=byId('format').value,paper=byId('paper').value,
    urgency=byId('urgency').value,pickup=byId('pickup-select').value;
  if(!choices.format?.[format] || !choices.paper?.[paper] ||
     !choices.urgency?.[urgency] || !choices.pickup?.[pickup])return null;
  const url=new URL(c.url);
  const values={
    // Контакты в URL подходят только для демонстрационных тестов.
    name:byId('customer-name').value.trim(),phone:byId('customer-phone').value.trim(),
    email:byId('customer-email').value.trim(),pickup:choices.pickup[pickup],
    photos:byId('photos-url').value.trim(),total:String(currentTotal),
    format:choices.format[format], quantity:byId('quantity').value,
    paper:choices.paper[paper], urgency:choices.urgency[urgency]
  };
  for(const key of required)url.searchParams.set(fields[key],values[key]);
  return url.href;
}
byId('order-form').addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget;const phone=byId('customer-phone');
  const digits=phone.value.replace(/\D/g,'');
  phone.setCustomValidity((digits.length===11&&(digits[0]==='7'||digits[0]==='8'))?'':'Введите российский номер из 11 цифр, например +7 999 123-45-67');
  if(!form.reportValidity())return;
  const photos=byId('photos-url');
  if(!/^https:\/\/disk\.yandex\.(ru|com)\//i.test(photos.value)){
    photos.setCustomValidity('Укажите ссылку на папку Яндекс Диска (https://disk.yandex.ru/...)');photos.reportValidity();return;
  }
  photos.setCustomValidity('');
  if(!currentTotal){byId('form-message').textContent='Укажите корректное количество фотографий.';byId('quantity').focus();return;}
  const yandexUrl=buildYandexUrl();
  const message=byId('form-message');message.classList.remove('success');
  if(!yandexUrl){message.textContent='Прием заказов еще не подключен: администратору нужно указать адрес формы и идентификаторы вопросов в yandex-config.js. Никакие данные не отправлены.';return;}
  byId('yandex-external').href=yandexUrl;
  byId('yandex-amount').textContent=RUB.format(currentTotal);
  const preview = [
    ['Формат', byId('format').selectedOptions[0].textContent.split(' — ')[0]],
    ['Количество', byId('quantity').value + ' шт.'],
    ['Бумага', byId('paper').selectedOptions[0].textContent],
    ['Срочность', byId('urgency').selectedOptions[0].textContent],
    ['Пункт выдачи', byId('pickup-select').selectedOptions[0].textContent],
    ['Сумма', RUB.format(currentTotal)]
  ];
  byId('yandex-order-preview').replaceChildren(...preview.map(([label,value])=>{
    const line=document.createElement('div');
    const labelEl=document.createElement('span');labelEl.textContent=label;
    const valueEl=document.createElement('strong');valueEl.textContent=value;
    line.append(labelEl,valueEl);return line;
  }));
  byId('yandex-step').hidden=false;
  message.textContent='Ссылка для Яндекс Формы подготовлена. Проверьте параметры ниже и откройте форму в новой вкладке.';
  message.classList.add('success');
  byId('yandex-step').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
});
byId('edit-order').addEventListener('click',()=>{
  byId('yandex-step').hidden=true;
  byId('order').scrollIntoView({behavior:'smooth',block:'start'});
});
recalc();

// Анимации не вмешиваются в калькулятор, форму и логику отправки.
(function setupMotion(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reduced.matches || !('IntersectionObserver' in window)) return;
  const elements = [
    ...document.querySelectorAll('.section-heading,.paper-info>div,.calculator,.order-layout>div,.order-form,.instructions'),
    ...document.querySelectorAll('[data-reveal-group] > *')
  ];
  const observer = new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
    }
  },{threshold:.09,rootMargin:'0px 0px -25px 0px'});
  elements.forEach(el=>{
    if(el.closest('[data-reveal-group]')){
      const index=Array.prototype.indexOf.call(el.parentElement.children,el);
      el.style.setProperty('--reveal-delay',`${Math.min(index,5)*95}ms`);
    }
    el.classList.add('reveal');observer.observe(el);
  });
  document.documentElement.classList.add('motion-ready');
})();

// Легкий параллакс фотокарточек только для мыши; без обработки касаний.
(function heroParallax(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches)return;
  const art=byId('hero-art');if(!art)return;
  let frame=0;
  art.addEventListener('pointermove',e=>{
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      const r=art.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width-.5)*16;
      const y=((e.clientY-r.top)/r.height-.5)*12;
      art.querySelectorAll('.photo').forEach(el=>{const d=Number(el.dataset.depth)||1;el.style.setProperty('--dx',(x*d).toFixed(1)+'px');el.style.setProperty('--dy',(y*d).toFixed(1)+'px');});
      frame=0;
    });
  },{passive:true});
  art.addEventListener('pointerleave',()=>art.querySelectorAll('.photo').forEach(el=>{el.style.setProperty('--dx','0px');el.style.setProperty('--dy','0px');}));
})();
