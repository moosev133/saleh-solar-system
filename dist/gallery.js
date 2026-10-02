const HOST = 'https://saleh-solar-system.meliodasin14.chatgpt.site';
const local = ['localhost','127.0.0.1'].includes(location.hostname) && location.port === '4174';
const api = local || location.origin === HOST ? '' : HOST;
const copy = {
 he:{nav:'מהשטח',eyebrow:'רגעים מהצד המואר',title:'השמש. בעבודה.',intro:'תמונות וסרטונים מהשטח, דרך העיניים של Saleh.',all:'הכול',image:'תמונות',video:'סרטונים',open:'פתיחת התוכן',close:'סגירה',more:'עוד רגעים',empty:'אין עדיין פריטים בתצוגה הזו.',admin:'ניהול תוכן',play:'ניגון הסרטון'},
 ar:{nav:'من أعمالنا',eyebrow:'لحظات من الجانب المشرق',title:'الشمس. تعمل.',intro:'صور وفيديوهات من العمل، بعيون Saleh.',all:'الكل',image:'صور',video:'فيديوهات',open:'فتح المحتوى',close:'إغلاق',more:'المزيد من اللحظات',empty:'لا توجد عناصر في هذا العرض بعد.',admin:'إدارة المحتوى',play:'تشغيل الفيديو'},
 en:{nav:'From the field',eyebrow:'MOMENTS FROM THE BRIGHT SIDE',title:'Sunlight. At work.',intro:'Photos and films from the field, through Saleh’s eyes.',all:'All',image:'Photos',video:'Videos',open:'Open content',close:'Close',more:'More moments',empty:'No items in this view yet.',admin:'Manage content',play:'Play video'}
};
const $ = s => document.querySelector(s);
const section = $('#gallery');
let items = [], filter = 'all', visible = 6, active = null;
const t = key => (copy[document.documentElement.lang] || copy.he)[key];
const el = (tag,cls,text) => {const node = document.createElement(tag);node.className = cls;if(text)node.textContent = text;return node;};
function media(item, full) {
  const node = document.createElement(item.type === 'video' ? 'video' : 'img'); node.src = api + item.url;
  if(item.type === 'video') {node.controls = full;node.preload = full ? 'metadata' : 'none';node.playsInline = true;if(!full)node.muted = true;}
  else {node.alt = item.title;node.loading = full ? 'eager' : 'lazy';node.decoding = 'async';}
  return node;
}
function close(){ window.dispatchEvent(new CustomEvent('gallery-open',{detail:false})); $('#gallery-dialog').close(); $('#gallery-full-media').replaceChildren();active = null; }
function open(item){ window.dispatchEvent(new CustomEvent('gallery-open',{detail:true}));active = item;$('#gallery-full-media').replaceChildren(media(item,true));$('#gallery-full-title').textContent = item.title;$('#gallery-full-caption').textContent = item.caption;$('#gallery-dialog').showModal();}
function render(){
  document.querySelectorAll('[data-gallery-text]').forEach(node => node.textContent = t(node.dataset.galleryText));
  $('#gallery-close').ariaLabel = t('close');
  const filtered = items.filter(item => filter === 'all' || item.type === filter);
  const grid = $('#gallery-grid');grid.replaceChildren();
  for(const item of filtered.slice(0,visible)) {
    const card = el('article','gallery-card');
    const button = el('button','gallery-image');button.type = 'button';button.setAttribute('aria-label',t(item.type === 'video'?'play':'open') + ': ' + item.title);
    if(item.type === 'image') button.append(media(item,false));
    else {const cover=el('div','film-cover');cover.append(el('span','film-sun','☀'),el('span','film-play','▶'));button.append(cover);}
    button.append(el('span','gallery-type',t(item.type)),el('span','gallery-expand','↗'));
    button.addEventListener('click',() => open(item));
    const text = el('div','gallery-copy'),title = el('h3','',item.title);title.dir = 'auto';text.append(title);
    if(item.caption){const caption = el('p','',item.caption);caption.dir = 'auto';text.append(caption);}
    card.append(button,text);grid.append(card);
  }
  $('#gallery-empty').hidden = filtered.length !== 0;$('#gallery-more').hidden = filtered.length <= visible;
  document.querySelectorAll('[data-gallery-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.galleryFilter === filter)));
}
document.querySelectorAll('[data-gallery-filter]').forEach(button => button.addEventListener('click',() => {filter = button.dataset.galleryFilter;visible = 6;render();}));
$('#gallery-more').addEventListener('click',() => {visible += 6;render();});
$('#gallery-close').addEventListener('click',close);
$('#gallery-dialog').addEventListener('cancel',e => {e.preventDefault();close();});
$('#gallery-dialog').addEventListener('click',e => {if(e.target === $('#gallery-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
let loading = false, anchored = false;
function anchor(){if(!anchored && items.length && location.hash==='#gallery' && !document.documentElement.classList.contains('intro-pending')){section.scrollIntoView();anchored=true;}}
window.addEventListener('solar-intro-ready',anchor);
async function refresh(){
  if(loading)return;loading = true;
  try{const response=await fetch(api+'/api/gallery',{credentials:'omit'});if(!response.ok)throw new Error('Gallery unavailable');const data=await response.json();items=data.items;section.hidden=!items.length;$('.gallery-nav').hidden=!items.length;render();window.dispatchEvent(new Event('resize'));anchor();}
  catch(error){console.warn(error.message);}
  finally{loading=false;}
}
render();refresh();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
