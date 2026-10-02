const HOST = 'https://saleh-solar-system.meliodasin14.chatgpt.site';
if (location.hostname === 'moosev133.github.io') location.replace(HOST + '/admin' + location.search + location.hash);
if (location.hostname !== 'moosev133.github.io') {
const $ = s => document.querySelector(s);
const copy = {
 he:{studio:'סטודיו התוכן',website:'פתיחת האתר ↗',signout:'יציאה',welcome:'מקום לכל רגע מואר.',loading:'טוענים את הסטודיו…',signin:'כניסה עם ChatGPT',setupLabel:'מפתח ההפעלה הפרטי',activate:'הפעלת הגישה שלי',setupNote:'ההפעלה מקשרת את ניהול האתר לחשבון המחובר. משתמשים במפתח פעם אחת בלבד.',retry:'ניסיון נוסף',eyebrow:'הצד שלכם של האתר',heading:'תוכן חדש. אור חדש.',intro:'תמונות, סרטונים ורגעים מהשטח — בדרך שלכם.',allContent:'כל התוכן',onWebsite:'מופיע באתר',drafts:'טיוטות',add:'מוסיפים רגע חדש',choose:'בחירת תמונה או סרטון',drop:'אפשר גם לגרור קובץ לכאן',limits:'JPG, PNG, WebP עד 12MB\nMP4, WebM עד 40MB',uploading:'מעלים את הקובץ…',draftNote:'כל העלאה מתחילה כטיוטה. רק אתם מחליטים מתי לפרסם.',library:'הספרייה שלכם',published:'פורסם',emptyTitle:'כל סיפור מתחיל ברגע.',empty:'העלו את התמונה או הסרטון הראשונים שלכם.',edit:'עריכת התוכן',titleLabel:'כותרת',captionLabel:'כמה מילים על הרגע הזה',captionNote:'הכותרת והתיאור מוצגים בדיוק כפי שכתבתם, בכל שפות האתר.',visible:'הצגת התוכן באתר',first:'העברה לראש הגלריה',save:'שמירת השינויים',deleteTitle:'למחוק את התוכן?',deleteNote:'הקובץ יימחק מהספרייה ומהאתר. אפשר לבטל את הפעולה עכשיו.',cancel:'ביטול',delete:'מחיקה',signinNote:'כניסה מאובטחת לחשבון שקיבל גישה לניהול האתר.',setupIntro:'מחברים את החשבון שלכם לסטודיו עם מפתח ההפעלה שקיבלתם.',denied:'לחשבון הזה אין גישת ניהול. צאו והיכנסו עם החשבון שהפעיל את הסטודיו.',draft:'טיוטה',untitled:'ללא כותרת',video:'סרטון',image:'תמונה',saved:'השינויים נשמרו.',deleted:'התוכן נמחק.',uploaded:'הקובץ נשמר כטיוטה. אפשר להוסיף כותרת ולפרסם.',noFilter:'אין עדיין פריטים בתצוגה הזו.',close:'סגירה',filter:'סינון תוכן',saving:'שומרים…',deleting:'מוחקים…',unsaved:'יש שינויים שלא נשמרו. לסגור בכל זאת?',error:'לא הצלחנו להשלים את הפעולה. נסו שוב.',too_large:'הקובץ גדול מדי. תמונות עד 12MB וסרטונים עד 40MB.',type:'בחרו JPG, PNG, WebP, MP4 או WebM תקין.',access:'אין גישת ניהול לחשבון הזה. היכנסו שוב.',setup_invalid:'מפתח ההפעלה אינו תקין.',setup_used:'הסטודיו כבר הופעל עם חשבון אחר.',title_required:'הוסיפו כותרת לפני הפרסום.',invalid:'בדקו את הכותרת והתיאור ונסו שוב.',library_full:'הספרייה מלאה (200 פריטים). מחקו תוכן שאינו נחוץ.',unavailable:'הסטודיו אינו זמין כרגע. התוכן שלכם נשמר; נסו שוב.',origin:'הפעולה נחסמה. פתחו מחדש את הסטודיו.',signin:'כניסה עם ChatGPT'},
 ar:{studio:'استوديو المحتوى',website:'فتح الموقع ↗',signout:'تسجيل الخروج',welcome:'مساحة لكل لحظة مشرقة.',loading:'جارٍ تحميل الاستوديو…',signin:'الدخول باستخدام ChatGPT',setupLabel:'مفتاح التفعيل الخاص',activate:'تفعيل صلاحياتي',setupNote:'يربط التفعيل إدارة الموقع بالحساب الحالي. يُستخدم المفتاح مرة واحدة فقط.',retry:'المحاولة مجددًا',eyebrow:'مساحتكم خلف الموقع',heading:'محتوى جديد. نور جديد.',intro:'صور وفيديوهات ولحظات من العمل — بطريقتكم.',allContent:'كل المحتوى',onWebsite:'ظاهر في الموقع',drafts:'المسودات',add:'أضيفوا لحظة جديدة',choose:'اختيار صورة أو فيديو',drop:'يمكنكم أيضًا سحب الملف إلى هنا',limits:'JPG, PNG, WebP حتى 12MB\nMP4, WebM حتى 40MB',uploading:'جارٍ رفع الملف…',draftNote:'يُحفظ كل ملف كمسودة. أنتم تختارون متى تنشرونه.',library:'مكتبتكم',published:'منشور',emptyTitle:'كل حكاية تبدأ بلحظة.',empty:'ارفعوا أول صورة أو فيديو لكم.',edit:'تعديل المحتوى',titleLabel:'العنوان',captionLabel:'بضع كلمات عن هذه اللحظة',captionNote:'يظهر العنوان والوصف كما كتبتموهما في جميع لغات الموقع.',visible:'إظهار المحتوى في الموقع',first:'نقل إلى بداية المعرض',save:'حفظ التغييرات',deleteTitle:'حذف هذا المحتوى؟',deleteNote:'سيُحذف الملف من المكتبة والموقع. يمكنكم إلغاء العملية الآن.',cancel:'إلغاء',delete:'حذف',signinNote:'دخول آمن للحساب الذي لديه صلاحية إدارة الموقع.',setupIntro:'اربطوا حسابكم بالاستوديو باستخدام مفتاح التفعيل الذي استلمتموه.',denied:'هذا الحساب لا يملك صلاحية الإدارة. سجّلوا الدخول بالحساب الذي فعّل الاستوديو.',draft:'مسودة',untitled:'بدون عنوان',video:'فيديو',image:'صورة',saved:'تم حفظ التغييرات.',deleted:'تم حذف المحتوى.',uploaded:'تم حفظ الملف كمسودة. يمكنكم إضافة عنوان ونشره.',noFilter:'لا توجد عناصر في هذا العرض بعد.',close:'إغلاق',filter:'تصفية المحتوى',saving:'جارٍ الحفظ…',deleting:'جارٍ الحذف…',unsaved:'هناك تغييرات غير محفوظة. هل تريدون الإغلاق؟',error:'تعذّر إكمال العملية. حاولوا مجددًا.',too_large:'الملف كبير جدًا. الصور حتى 12MB والفيديوهات حتى 40MB.',type:'اختاروا ملف JPG أو PNG أو WebP أو MP4 أو WebM صالحًا.',access:'لا توجد صلاحية إدارة لهذا الحساب. سجّلوا الدخول مجددًا.',setup_invalid:'مفتاح التفعيل غير صالح.',setup_used:'تم تفعيل الاستوديو بحساب آخر.',title_required:'أضيفوا عنوانًا قبل النشر.',invalid:'راجعوا العنوان والوصف وحاولوا مجددًا.',library_full:'المكتبة ممتلئة (200 ملف). احذفوا المحتوى غير الضروري.',unavailable:'الاستوديو غير متاح مؤقتًا. محتواكم محفوظ؛ حاولوا مجددًا.',origin:'تم حظر العملية. افتحوا الاستوديو مجددًا.'},
 en:{studio:'Content studio',website:'View website ↗',signout:'Sign out',welcome:'A place for brighter moments.',loading:'Opening your studio…',signin:'Sign in with ChatGPT',setupLabel:'Private activation key',activate:'Activate my access',setupNote:'Activation connects this signed-in account to the content studio. The key can only be used once.',retry:'Try again',eyebrow:'YOUR SIDE OF THE WEBSITE',heading:'Fresh content. New light.',intro:'Photos, videos, and moments from your work. Make them yours.',allContent:'All content',onWebsite:'On the website',drafts:'Drafts',add:'Add a new moment',choose:'Choose a photo or video',drop:'Or drag a file into this space',limits:'JPG, PNG, WebP up to 12MB\nMP4, WebM up to 40MB',uploading:'Uploading your file…',draftNote:'Every upload starts as a draft. You decide when it goes live.',library:'Your library',published:'Published',emptyTitle:'Every story starts somewhere.',empty:'Add your first photo or video to get started.',edit:'Edit content',titleLabel:'Title',captionLabel:'A few words about this moment',captionNote:'Your title and caption appear exactly as written in every website language.',visible:'Show this on the website',first:'Move to the start of the gallery',save:'Save changes',deleteTitle:'Delete this content?',deleteNote:'This removes the file from your library and website. You can cancel now.',cancel:'Cancel',delete:'Delete',signinNote:'Secure access for the account authorized to manage this website.',setupIntro:'Connect your account using the private activation key you received.',denied:'This account does not have admin access. Sign out and use the account that activated the studio.',draft:'Draft',untitled:'Untitled',video:'Video',image:'Photo',saved:'Your changes are saved.',deleted:'Content deleted.',uploaded:'Saved as a draft. Add a title, then publish when you’re ready.',noFilter:'No items in this view yet.',close:'Close',filter:'Filter content',saving:'Saving…',deleting:'Deleting…',unsaved:'You have unsaved changes. Close anyway?',error:'We couldn’t complete that. Please try again.',too_large:'This file is too large. Photos can be up to 12MB and videos up to 40MB.',type:'Choose a valid JPG, PNG, WebP, MP4 or WebM file.',access:'This account does not have admin access. Please sign in again.',setup_invalid:'The activation key is not valid.',setup_used:'The studio has already been activated with another account.',title_required:'Add a title before publishing.',invalid:'Check the title and caption and try again.',library_full:'The library is full (200 items). Remove content you no longer need.',unavailable:'The studio is temporarily unavailable. Your content is safe; please try again.',origin:'This request was blocked. Open the studio again.'}
};
let language = new URL(location.href).searchParams.get('lang');
try { language ||= localStorage.getItem('sss-language'); } catch {}
if (!copy[language]) language = 'he';
const t = key => copy[language][key] || copy.en[key] || key;
let items = [], selected = null, deleting = null, busy = false, dirty = false, session = null, toastTimer;
const errorMessage = error => copy[language][error.message] || t('error');
function toast(message, error = false) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.toggle('error', error); $('#toast').hidden = false; toastTimer = setTimeout(() => $('#toast').hidden = true, error ? 8000 : 4500); }
function applyLanguage() {
  document.documentElement.lang = language; document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  document.querySelectorAll('[data-t]').forEach(el => el.textContent = t(el.dataset.t));
  $('#language').value = language; $('#close-editor').ariaLabel = t('close'); $('#filter').ariaLabel = t('filter');
  if (session) showSession(); render();
}
$('#language').addEventListener('change', e => { language = e.target.value; try { localStorage.setItem('sss-language', language); } catch {} applyLanguage(); });
async function api(path, options) { const response = await fetch(path, { credentials:'same-origin', ...options }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'error'); return data; }
function showSession() {
  const admin = session.admin;
  $('#access-panel').hidden = admin; $('#studio').hidden = !admin;
  $('#signout').hidden = !session.signedIn; $('#signin').hidden = session.signedIn;
  $('#claim-form').hidden = !session.signedIn || !session.setupAvailable;
  $('#access-message').textContent = t(!session.signedIn ? 'signinNote' : session.setupAvailable ? 'setupIntro' : 'denied');
}
async function initialize() {
  $('#retry-access').hidden = true;
  try { session = await api('/api/session'); showSession(); if (session.admin) { const data = await api('/api/admin/media'); items = data.items; render(); } }
  catch (error) { $('#access-panel').hidden = false; $('#studio').hidden = true; $('#access-message').textContent = errorMessage(error); $('#retry-access').hidden = false; }
}
$('#retry-access').addEventListener('click', initialize);
// This short-lived setup value is never sent to analytics or included in referrers.
try {
  const token = new URLSearchParams(location.hash.slice(1)).get('setup');
  if (/^[a-f0-9]{64}$/.test(token || '')) { sessionStorage.setItem('saleh-setup', token); history.replaceState(null,'',location.pathname + location.search); }
  $('#setup-token').value = sessionStorage.getItem('saleh-setup') || '';
} catch {}
$('#claim-form').addEventListener('submit', async e => {
  e.preventDefault(); const button = e.submitter; button.disabled = true;
  try { await api('/api/claim', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token:$('#setup-token').value.trim()}) }); try { sessionStorage.removeItem('saleh-setup'); } catch {} $('#setup-token').value = ''; await initialize(); }
  catch(error) { toast(errorMessage(error), true); } finally { button.disabled = false; }
});
function element(tag, className, text) { const el = document.createElement(tag); if(className) el.className = className; if(text !== undefined) el.textContent = text; return el; }
function preview(item, controls = false) {
  const el = document.createElement(item.type === 'video' ? 'video' : 'img'); el.src = item.url;
  if (item.type === 'video') { el.controls = controls; el.preload = 'metadata'; el.playsInline = true; if (!controls) el.muted = true; }
  else { el.alt = item.title || t('untitled'); el.loading = 'lazy'; }
  return el;
}
function render() {
  $('#total-count').textContent = items.length; const published = items.filter(i => i.published).length;
  $('#published-count').textContent = published; $('#draft-count').textContent = items.length - published;
  const filter = $('#filter').value, shown = items.filter(i => filter === 'all' || (filter === 'published' ? i.published : !i.published));
  $('#library-state').hidden = shown.length > 0; $('#library-state p').textContent = t(items.length ? 'noFilter' : 'empty');
  const grid = $('#media-grid'); grid.replaceChildren();
  for (const item of shown) {
    const card = element('article','media-card'), image = element('div','card-preview'); image.append(preview(item));
    image.append(element('span','status-badge' + (item.published ? ' live' : ''),t(item.published ? 'published' : 'draft')));
    if(item.type === 'video') image.append(element('span','video-badge','▶ ' + t('video')));
    const content = element('div','card-copy'); const title = element('h3','',item.title || t('untitled')); title.dir = 'auto'; content.append(title,element('p','',t(item.type) + ' · ' + (item.size / 1048576).toFixed(1) + ' MB'));
    const actions = element('div','card-actions'), edit = element('button','',t('edit')), remove = element('button','',t('delete'));
    edit.addEventListener('click',() => openEditor(item)); remove.addEventListener('click',() => { deleting = item; $('#delete-error').hidden = true; $('#delete-dialog').showModal(); $('#cancel-delete').focus(); });
    actions.append(edit,remove); content.append(actions); card.append(image,content); grid.append(card);
  }
}
$('#filter').addEventListener('change',render);
function openEditor(item) { selected = item; dirty = false; $('#item-title').value = item.title; $('#item-caption').value = item.caption; $('#item-published').checked = item.published; $('#item-first').checked = false; $('#editor-preview').replaceChildren(preview(item,true)); $('#editor-error').hidden = true; $('#editor').showModal(); }
function closeEditor() { if (busy || (dirty && !confirm(t('unsaved')))) return; $('#editor').close(); $('#editor-preview').replaceChildren(); dirty = false; }
$('#close-editor').addEventListener('click',closeEditor);
$('#editor').addEventListener('cancel',e => { e.preventDefault(); closeEditor(); });
$('#editor-form').addEventListener('input',() => dirty = true);
$('#editor-form').addEventListener('submit',async e => {
  e.preventDefault(); if (busy) return; busy = true; $('#save-item').disabled = true; $('#save-item').textContent = t('saving'); $('#editor-error').hidden = true;
  try { const data = await api('/api/admin/media/' + selected.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:$('#item-title').value,caption:$('#item-caption').value,published:$('#item-published').checked,first:$('#item-first').checked})}); items = items.map(i => i.id === data.item.id ? data.item : i).sort((a,b) => b.position-a.position || b.createdAt-a.createdAt); dirty = false; $('#editor').close(); $('#editor-preview').replaceChildren(); render(); toast(t('saved')); }
  catch(error) { $('#editor-error').textContent = errorMessage(error); $('#editor-error').hidden = false; }
  finally { busy = false; $('#save-item').disabled = false; $('#save-item').textContent = t('save'); }
});
$('#cancel-delete').addEventListener('click',() => { if (!busy) $('#delete-dialog').close(); });
$('#delete-dialog').addEventListener('cancel', e => { if(busy) e.preventDefault(); });
$('#delete-form').addEventListener('submit',async e => {
  e.preventDefault(); if(busy) return; busy = true; $('#confirm-delete').disabled = true; $('#confirm-delete').textContent = t('deleting');
  try { await api('/api/admin/media/' + deleting.id,{method:'DELETE'}); items = items.filter(i => i.id !== deleting.id); render(); $('#delete-dialog').close(); toast(t('deleted')); }
  catch(error) { $('#delete-error').textContent = errorMessage(error); $('#delete-error').hidden = false; }
  finally { busy = false; $('#confirm-delete').disabled = false; $('#confirm-delete').textContent = t('delete'); }
});
async function upload(file) {
  if (!file || busy) return;
  const types = ['image/jpeg','image/png','image/webp','video/mp4','video/webm'];
  if (!types.includes(file.type)) { toast(t('type'),true); return; }
  if(file.size > (file.type.startsWith('video/') ? 40 : 12) * 1048576) { toast(t('too_large'),true); return; }
  busy = true; $('#file-input').disabled = true; $('#upload-progress').hidden = false; $('#progress-bar').value = 0; $('#upload-percent').textContent = '0%';
  try {
    const data = await new Promise((resolve,reject) => { const xhr = new XMLHttpRequest(); xhr.open('POST','/api/admin/media'); xhr.setRequestHeader('Content-Type',file.type); xhr.timeout = 180000;
      xhr.upload.onprogress = e => { if(e.lengthComputable) { const value = Math.round(e.loaded/e.total*100); $('#progress-bar').value = value; $('#upload-percent').textContent = value + '%'; } };
      xhr.onerror = xhr.ontimeout = () => reject(new Error('error'));
      xhr.onload = () => { try { const data = JSON.parse(xhr.responseText); if(xhr.status < 200 || xhr.status >= 300) reject(new Error(data.error || 'error')); else resolve(data); } catch { reject(new Error('error')); } }; xhr.send(file);
    });
    items.unshift(data.item); $('#filter').value = 'all'; render(); openEditor(data.item); toast(t('uploaded'));
  } catch(error) { toast(errorMessage(error),true); }
  finally { busy = false; $('#file-input').disabled = false; $('#file-input').value = ''; $('#upload-progress').hidden = true; }
}
$('#file-input').addEventListener('change',e => upload(e.target.files[0]));
for (const event of ['dragenter','dragover']) $('#drop-zone').addEventListener(event,e => {e.preventDefault();$('#drop-zone').classList.add('dragging');});
for (const event of ['dragleave','drop']) $('#drop-zone').addEventListener(event,e => {e.preventDefault();$('#drop-zone').classList.remove('dragging');});
$('#drop-zone').addEventListener('drop',e => upload(e.dataTransfer.files[0]));
window.addEventListener('beforeunload',e => { if(busy || dirty) {e.preventDefault();e.returnValue = '';} });
applyLanguage();
if (location.hostname !== 'moosev133.github.io') initialize();

}
