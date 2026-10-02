import { createSolarScene } from './scene.js?v=studio-1';
import { translations } from './translations.js';
const $=selector=>document.querySelector(selector);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let language='he';
try{const requested=new URL(location.href).searchParams.get('lang');const saved=localStorage.getItem('sss-language');language=Object.hasOwn(translations,requested)?requested:Object.hasOwn(translations,saved)?saved:'he';}catch{}
const t=key=>translations[language][key];
const state={hour:10.5,progress:0,pointer:{x:0,y:0},paused:reduced.matches,system:'home',onScreen:true,detail:false};
const range=$('#sun-range'),timeDisplay=$('#time-display'),energyValue=$('#energy-value');
function setHour(value){
  state.hour=Number(value);
  const totalMinutes=Math.round(state.hour*60),hours=Math.floor(totalMinutes/60),minutes=totalMinutes%60;
  const time=`${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;
  timeDisplay.textContent=time;range.setAttribute('aria-valuetext',time);
  range.style.setProperty('--range-fill',`${(state.hour-6)/12*100}%`);
  const power=Math.max(0,Math.round(Math.sin((state.hour-6)/12*Math.PI)*100));
  energyValue.innerHTML=`${power}<small>%</small>`;
  $('#status-label').textContent=power<10?t('statusWaiting'):power<50?t('statusGolden'):t('statusBright');
}
range.addEventListener('input',event=>setHour(event.target.value));setHour(range.value);
function syncMotion(){const button=$('#motion-toggle');button.setAttribute('aria-pressed',String(state.paused));button.setAttribute('aria-label',state.paused?t('resume'):t('pause'));button.innerHTML=`<span aria-hidden="true">${state.paused?'▷':'Ⅱ'}</span>`;document.body.classList.toggle('motion-paused',state.paused);}
$('#motion-toggle').addEventListener('click',()=>{state.paused=!state.paused;syncMotion();});syncMotion();
reduced.addEventListener('change',event=>{state.paused=event.matches;syncMotion();});
document.querySelectorAll('[data-system]').forEach(button=>button.addEventListener('click',()=>{
  state.system=button.dataset.system;
  state.detail=false;syncDetails();
  $('#array-caption').textContent=state.system==='business'?t('arrayBusiness'):t('arrayHome');
  document.querySelectorAll('[data-system]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
}));
function syncDetails(){
  $('.stage').classList.toggle('showing-detail',state.detail);
  $('#detail-toggle').setAttribute('aria-pressed',String(state.detail));
  $('#detail-toggle span').textContent=state.detail?t('detailClose'):t('detailOpen');
  $('.scene-note .mini-label').textContent=state.detail?t('detailEyebrow'):t('noteLabel');
  setLines($('.hero-description'),state.detail?t('detailDescription'):t('heroDescription'));
  $('#array-caption').textContent=state.detail?t('detailCaption'):state.system==='business'?t('arrayBusiness'):t('arrayHome');
}
$('#detail-toggle').addEventListener('click',()=>{state.detail=!state.detail;syncDetails();});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.detail){state.detail=false;syncDetails();$('#detail-toggle').focus({preventScroll:true});}});
window.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&!state.paused){state.pointer.x=(event.clientX/innerWidth-.5)*2;state.pointer.y=(event.clientY/innerHeight-.5)*2;}},{passive:true});
const hero=$('.hero-copy'),lab=$('.lab-copy'),stage=$('.stage'),journey=$('.journey');
let scheduled=false;
function updateScroll(){
  const height=journey.offsetHeight-stage.offsetHeight;
  const progress=Math.max(0,Math.min(1,-journey.getBoundingClientRect().top/height));state.progress=progress;
  const transition=Math.max(0,Math.min(1,(progress-.28)/.18));
  const heroOpacity=1-transition;
  const labOpacity=transition;
  hero.style.opacity=heroOpacity;hero.style.transform=`translateY(${-transition*55}px)`;hero.inert=heroOpacity<.1;
  lab.style.opacity=labOpacity;lab.style.transform=`translateY(${(1-labOpacity)*25}px)`;lab.inert=labOpacity<.5;
  $('.journey-progress span').style.width=`${progress*100}%`;
  $('.scroll-cue').href=progress>.5?($('#gallery')&&!$('#gallery').hidden?'#gallery':'#contact'):'#experience';
  const contactVisible=journey.getBoundingClientRect().bottom<innerHeight*.4||$('#contact').getBoundingClientRect().top<innerHeight*.4;
  document.body.classList.toggle('at-contact',contactVisible);$('.site-header').inert=contactVisible||document.documentElement.classList.contains('intro-pending');
  scheduled=false;
}
window.addEventListener('scroll',()=>{if(!scheduled){requestAnimationFrame(updateScroll);scheduled=true;}},{passive:true});window.addEventListener('resize',updateScroll);updateScroll();
const intro=$('#solar-intro');
let solarScene;
function revealWebsite(){
  clearTimeout(window.solarIntroTimeout);
  const hadFocus=intro.contains(document.activeElement);
  document.documentElement.classList.remove('intro-pending');
  intro.classList.add('intro-complete');intro.inert=true;
  window.dispatchEvent(new Event('solar-intro-ready'));
  $('main').inert=false;updateScroll();
  if(hadFocus)$('#motion-toggle').focus({preventScroll:true});
  setTimeout(()=>{intro.hidden=true;},700);
}
if(document.documentElement.classList.contains('intro-pending')){
  $('main').inert=true;$('.site-header').inert=true;
}else{intro.hidden=true;intro.inert=true;}
function skipIntro(){solarScene?.skipIntro();revealWebsite();}
$('#intro-skip').addEventListener('click',skipIntro);
intro.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();skipIntro();}
  if(event.key==='Tab'){event.preventDefault();$('#intro-skip').focus();}
});
window.addEventListener('solar-intro-timeout',skipIntro,{once:true});
reduced.addEventListener('change',event=>{if(event.matches)skipIntro();});
try{solarScene=createSolarScene($('#scene'),state,revealWebsite);}catch(error){
  console.error('3D scene unavailable:',error);$('.scene-fallback').hidden=false;$('#scene').hidden=true;$('#detail-toggle').hidden=true;revealWebsite();
}
function setLines(element,text,heading=false){
  element.replaceChildren();const lines=text.split('\n');
  lines.forEach((line,i)=>{if(i){element.append(document.createElement('br'));element.append(document.createTextNode(' '));}if(!heading){element.append(document.createTextNode(line));return;}const words=line.split(' ');words.forEach((word,j)=>{if(j)element.append(document.createTextNode(' '));if(i===lines.length-1&&j===words.length-1){const em=document.createElement('em');em.textContent=word;element.append(em);}else element.append(document.createTextNode(word));});});
}
function applyLanguage(code,persist=false){
  language=Object.hasOwn(translations,code)?code:'he';
  document.documentElement.lang=language;document.documentElement.dir=t('dir');
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
  document.querySelectorAll('[data-i18n-lines]').forEach(el=>setLines(el,t(el.dataset.i18nLines)));
  document.querySelectorAll('[data-i18n-heading]').forEach(el=>setLines(el,t(el.dataset.i18nHeading),true));
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
  document.title=`Saleh Solar System — ${t('title')}`;document.querySelector('meta[name="description"]').content=t('description');
  $('#language-select').value=language;
  $('#array-caption').textContent=state.system==='business'?t('arrayBusiness'):t('arrayHome');
  setHour(state.hour);syncMotion();syncDetails();
  if(persist){try{localStorage.setItem('sss-language',language);}catch{}const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);}
  updateScroll();
}
$('#language-select').addEventListener('change',event=>applyLanguage(event.target.value,true));
applyLanguage(language);
// Shared names and contact details stay in English in every language.
fetch(new URL('./content.json',import.meta.url)).then(response=>{if(!response.ok)throw new Error('Content unavailable');return response.json();}).then(content=>{
  $('.phone-link').textContent=content.phoneDisplay;$('.phone-link').href=`tel:${content.phone}`;
  $('.email-link').textContent=content.email;$('.email-link').href=`mailto:${content.email}`;$('.owner strong').textContent=content.owner;
}).catch(error=>console.warn(error.message));

window.addEventListener('gallery-open',event=>{state.galleryOpen=event.detail;});
