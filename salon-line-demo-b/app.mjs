import {seedDemo,validateState,applyAction} from './domain.mjs';
import {e,icon,dateAdd,menuName} from './html.mjs';
import {translator} from './i18n.mjs';
import {home,bookings,customers,messagesView,crm,attendForm,customerForm} from './views.mjs';
import {renderSettingsView} from './settings-views.mjs';
import {mountLiveTest} from './test-view.mjs';

const STORE='salon-b-synthetic-v1';
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let stored=null,storageIssue=false;
try{const raw=localStorage.getItem(STORE);if(raw){stored=validateState(JSON.parse(raw));if(!stored)storageIssue=true;}}catch{storageIssue=true;}
function upgradeDemo(value){value.today=today;if(!value.faq.some(f=>f.id==='hours'))value.faq=[...value.faq,...seedDemo({today}).faq];return value;}
let state=upgradeDemo(stored||seedDemo({today}));
let preferred='ja';try{preferred=localStorage.getItem('salon-b-language')||'ja';}catch{}
const ui={locale:['ja','en','th'].includes(preferred)?preferred:'ja',view:'home',day:today,calendarMode:'day',selectedCustomer:'D-A',selectedMessage:'',selectedBooking:'',messageFilter:'open',crmTab:'rules',filters:{},edit:null,dirty:false,previewAt:`${today}T10:00`};
const app=document.querySelector('#app'),modalRoot=document.querySelector('#modal-root'),toastEl=document.querySelector('#toast');
let unmountLive=null,modal=null,busy=false,toastTimer,focusBeforeModal=null;
const titles={home:'ホーム',bookings:'予約',customers:'顧客',messages:'メッセージ',crm:'CRM・フォロー',more:'すべての機能',faq:'質問と回答',questions:'未回答の質問',menus:'メニュー・料金',campaigns:'キャンペーン・クーポン',richmenu:'LINEメニュー',settings:'営業時間・受付設定',audit:'操作履歴',test:'実TEST接続'};
const aliases={overview:'home',booking:'bookings',inbox:'messages',knowledge:'faq',shifts:'settings',account:'test',coupons:'campaigns'};
const testSections={all:'実TEST接続',bookings:'予約',customers:'顧客',messages:'メッセージ',crm:'CRM・フォロー',connection:'実TEST接続'};
const testSection=hash=>{const part=(hash||'').replace(/^#\/?/,'').split(/[?\/]/)[1];return Object.hasOwn(testSections,part)?part:'all';};
const currentPath=()=>ui.view==='test'&&ui.testSection!=='all'?`test/${ui.testSection}`:ui.view;
const t=key=>translator(ui.locale)(key);
const context=()=>({state,ui,t,e,icon});
const route=hash=>{const name=(hash||'').replace(/^#\/?/,'').split(/[?\/]/)[0];return aliases[name]|| (Object.hasOwn(titles,name)?name:'home');};
const navItems=[['bookings','予約','booking'],['customers','顧客','customers'],['messages','メッセージ','messages'],['crm','フォロー','crm'],['more','すべて','more']];
function focusPane(selector){const pane=document.querySelector(selector);if(!pane)return;pane.setAttribute?.('tabindex','-1');pane.focus({preventScroll:true});if(window.matchMedia?.('(max-width: 820px)').matches)pane.scrollIntoView({block:'start'});}
function bookingResource(form){const menu=state.menus.find(m=>m.id===form?.querySelector('[name=menuId]')?.value),resource=state.settings.resources.find(r=>r.id===menu?.resource),box=form?.querySelector('[data-booking-resource]');if(box)box.textContent=`${t('設備はメニューに合わせて選ばれます')} · ${resource?.name||''} · ${menu?.duration} ${t('分')} + ${t('準備')} ${menu?.cleanup} ${t('分')}`;}
function notify(message){clearTimeout(toastTimer);toastEl.textContent=t(message);toastEl.hidden=false;toastTimer=setTimeout(()=>toastEl.hidden=true,4200);}
function render(){
  const liveConnection=ui.view==='test'?unmountLive?.retainConnection?.():null;
  unmountLive?.();unmountLive=null;
  document.documentElement.lang=ui.locale;
  const skip=document.querySelector('.skip-link');if(skip)skip.textContent=t('メインへ');
  const live=ui.view==='test',pageTitle=live?`TEST · ${t(testSections[ui.testSection]||testSections.all)}`:t(titles[ui.view]);
  document.title=`${pageTitle} | Salon de Six`;
  const active=view=>live?ui.testSection===(view==='more'?'connection':view):ui.view===view||(view==='more'&&!['home','bookings','customers','messages','crm'].includes(ui.view));
  const nav=mobile=>navItems.map(([view,label,glyph])=>{const target=live?`test/${view==='more'?'connection':view}`:view;return `<a href="#/${target}" data-nav="${target}" class="${active(view)?'active':''}" ${active(view)?'aria-current="page"':''}>${icon(glyph)}<span>${e(t(live&&view==='more'?'実TEST接続':label))}</span></a>`;}).join('');
  const mainView=({home,bookings,customers,messages:messagesView,crm})[ui.view];
  const head=!['home','more','faq','questions','menus','campaigns','richmenu','settings','audit'].includes(ui.view)?`<div class="page-header"><div class="title-group"><a href="#/${live?'test':'home'}" data-nav="${live?'test':'home'}" class="back-button" aria-label="${e(t('ホームへ'))}">${icon('back')}</a><h1>${e(pageTitle)}</h1></div><img class="page-mascots" src="./assets/salon-b-mascots.png" alt=""></div>`:'';
  app.innerHTML=`<header class="app-header"><a class="brand" href="#/${live?'test':'home'}" data-nav="${live?'test':'home'}">Salon de Six</a><nav class="desktop-nav" aria-label="${e(t('メインメニュー'))}">${nav(false)}</nav><div class="header-actions"><select class="language-select" data-language aria-label="${e(t('表示言語'))}"><option value="ja" ${ui.locale==='ja'?'selected':''}>日本語</option><option value="en" ${ui.locale==='en'?'selected':''}>English</option><option value="th" ${ui.locale==='th'?'selected':''}>ไทย</option></select><a class="account-button" href="#/${live?'test/connection':'test'}" data-nav="${live?'test/connection':'test'}" aria-label="${e(t('アカウント・実TEST接続'))}">${icon('account')}</a></div></header><div class="mode-strip"><span class="mode-dot"></span><span id="mode-label">${e(t(ui.view==='test'?'実TEST・Googleログインが必要':'デモ・この端末に保存'))}</span>${ui.view!=='test'?`<span class="mode-note">${e(t('架空データ・送信なし'))}</span>`:''}<a class="mode-switch" href="#/${ui.view==='test'?'home':['bookings','customers','messages','crm'].includes(ui.view)?`test/${ui.view}`:'test'}" data-nav="${ui.view==='test'?'home':['bookings','customers','messages','crm'].includes(ui.view)?`test/${ui.view}`:'test'}">${e(t(ui.view==='test'?'デモに戻る':'TEST管理へ'))} →</a></div><main class="app-main" id="main" tabindex="-1">${storageIssue&&!live?`<div class="error-state" role="alert">${e(t('保存データを読み込めなかったため、架空データを表示しています'))}</div>`:''}${head}${mainView?mainView(context()):ui.view==='test'?'<section class="panel" id="live-test"></section>':renderSettingsView(context())}</main><nav class="bottom-nav" aria-label="${e(t('メインメニュー'))}">${nav(true)}</nav>`;
  if(ui.view==='test')unmountLive=mountLiveTest(document.querySelector('#live-test'),{t,locale:ui.locale,connection:liveConnection,section:ui.testSection,onStatus:status=>{const label=document.querySelector('#mode-label');if(label&&ui.view==='test')label.textContent=t(({connected:'実TESTデータを表示中',authenticated:'実TEST・読み込み中',error:'実TEST・接続エラー',expired:'実TEST・ログイン期限切れ',signing_in:'実TEST・ログイン中'})[status.status]||'実TEST・Googleログインが必要');}});
}
function showModal(title,body,{confirm,cancel,onConfirm,html=false}={}){
  focusBeforeModal=document.activeElement;
  const parent=modal&&modalRoot.querySelector('form')?{model:modal,nodes:[...modalRoot.childNodes]}:null;
  modal={onConfirm,parent,dirtyBefore:ui.dirty};
  modalRoot.innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><h2 id="modal-title">${e(t(title))}</h2><button type="button" class="btn secondary small" data-modal-close aria-label="${e(t('閉じる'))}">${icon('close')}</button></div><div class="modal-body">${html?body:`<p>${e(t(body))}</p>`}</div><p class="error-state" data-modal-error role="alert" hidden></p>${confirm?`<div class="modal-actions"><button class="btn secondary" data-modal-close>${e(t(cancel||'戻る'))}</button><button class="btn primary" data-modal-confirm>${e(t(confirm))}</button></div>`:''}</section></div>`;
  app.inert=true;document.body.classList.add('modal-open');
  queueMicrotask(()=>modalRoot.querySelector('button,input,select,textarea')?.focus());
}
function closeModal(all=false){if(busy)return;if(!all&&modal?.parent){const parent=modal.parent;modal=parent.model;modalRoot.replaceChildren(...parent.nodes);return;}if(modalRoot.querySelector('form'))ui.dirty=modal?.dirtyBefore||false;modal=null;modalRoot.replaceChildren();app.inert=false;document.body.classList.remove('modal-open');focusBeforeModal?.isConnected&&focusBeforeModal.focus();}
function syncStored(){try{const next=validateState(JSON.parse(localStorage.getItem(STORE)||'null'));if(next){state=upgradeDemo(next);}}catch{}}
function guarded(action){if(unmountLive?.isBusy?.()){notify('処理中');return;}if(!ui.dirty&&!unmountLive?.hasUnsavedChanges?.()){syncStored();action();return;}showModal('保存していない変更があります','変更を破棄して移動しますか？',{confirm:'変更を破棄',cancel:'編集を続ける',onConfirm:()=>{ui.dirty=false;closeModal();syncStored();action();}});}
function go(view,{reset=true}={}){guarded(()=>{ui.view=route(view);ui.testSection=testSection(view);if(reset){ui.edit=null;ui.selectedBooking='';}history.pushState(null,'',`#/${currentPath()}`);render();window.scrollTo({top:0});});}
function edit(kind,id=''){guarded(()=>{ui.edit={kind,id};ui.view=({customer:'customers',booking:'bookings',rule:'crm',faq:'faq',menu:'menus',campaign:'campaigns',coupon:'campaigns'})[kind]||ui.view;history.pushState(null,'',`#/${ui.view}`);render();document.querySelector('form[data-action]:not([data-action="ui.filter"]) input:not([type=hidden])')?.focus();});}
const errorMessages={
 INVALID_IMAGE:'PNG・JPEG・WebPの500KB以下の画像を選んでください',
 RESOURCE_CONFLICT:'同じ設備の予約と重なります',STAFF_CAPACITY:'この時間のスタッフ枠が埋まっています',CUSTOMER_CONFLICT:'このお客様の予約と重なります',MENU_UNAVAILABLE:'設備・所要時間の確認が必要です',RESOURCE_UNAVAILABLE:'利用できる設備がありません',CLOSED:'休業日です',OUTSIDE_HOURS:'営業時間外です',PAST_BOOKING:'過去の予約は作成・変更・取消できません',VISIT_NOT_FINISHED:'施術が終わってから来店を記録してください',DUPLICATE_BOOKING:'同じ予約がすでにあります',INVALID_BOOKING_STATE:'この予約は変更できません',REVISION_CONFLICT:'別の操作で更新されました。内容を確認し直してください',IDEMPOTENCY_CONFLICT:'同じ操作の内容が変わりました。確認し直してください',INVALID_BIRTHDAY:'誕生日を確認してください',BIRTHDAY_REQUIRED:'同意を登録するには誕生日を入力してください',NO_CHANGE:'変更はありません',INVALID_DATE:'日付を確認してください',INVALID_DATE_RANGE:'開始日と終了日を確認してください',INVALID_TIME:'時刻を確認してください',INVALID_RULE:'フォローの条件と文面を確認してください',INVALID_SETTINGS:'営業時間・受付人数・休業日を確認してください',INVALID_PERFORMED_MENUS:'実施した施術を選んでください',NAME_REQUIRED:'名前を入力してください',MESSAGE_REQUIRED:'メッセージを入力してください',RESOURCE_IN_USE:'メニューで使用中の設備は削除できません',STORAGE_ERROR:'端末に保存できませんでした。空き容量やブラウザ設定を確認してください',INVALID_PAYLOAD:'入力内容を確認してください',INVALID_RESULT:'入力内容を確認してください',INVALID_NUMBER:'数値を確認してください',INVALID_PRICE:'料金を確認してください',INVALID_TEXT:'入力内容を確認してください',INVALID_LOCAL_TIME:'日時を確認してください',INVALID_JOB_STATE:'このプレビューはすでに取り消されています',INVALID_FAQ:'質問と回答を入力してください'};
function report(error){const message=errorMessages[error.message]||'操作を完了できませんでした。入力内容を確認してください';const box=modalRoot.querySelector('[data-modal-error]');if(box){box.textContent=t(message);box.hidden=false;}else{notify(message);}console.warn('Salon action failed:',error.message);}
function persist(next){try{localStorage.setItem(STORE,JSON.stringify(next));}catch{throw Error('STORAGE_ERROR');}state=next;storageIssue=false;}
function captureOtherDrafts(type,payload){return [...document.querySelectorAll('form[data-dirty]')].filter(form=>!(form.dataset.action===type&&(!payload.id||form.querySelector('[name=id]')?.value===payload.id))).map(form=>({action:form.dataset.action,id:form.querySelector('[name=id]')?.value||'',fields:[...form.querySelectorAll('input,select,textarea')].map(el=>({name:el.name,value:el.value,checked:el.checked}))}));}
function restoreDrafts(drafts){for(const draft of drafts){const form=[...document.querySelectorAll('form[data-action]')].find(f=>f.dataset.action===draft.action&&(f.querySelector('[name=id]')?.value||'')===draft.id);if(!form)continue;for(const entry of draft.fields){const input=[...form.querySelectorAll('input,select,textarea')].find(el=>el.name===entry.name);if(input){input.value=entry.value;if(input.type==='checkbox')input.checked=entry.checked;}}form.dataset.dirty='true';ui.dirty=true;}}
function run(type,payload,key=crypto.randomUUID(),revision=state.revision){
  const bookingDraft=type==='customer.add'?modal?.bookingDraft:null;
  const current=localStorage.getItem(STORE);if(current){let parsed=null;try{parsed=validateState(JSON.parse(current));}catch{}if(parsed&&parsed.revision!==state.revision)throw Error('REVISION_CONFLICT');if(!parsed){try{localStorage.setItem(`${STORE}-recovery`,current);}catch{throw Error('STORAGE_ERROR');}}}
  const drafts=captureOtherDrafts(type==='message.draft'||type==='message.note'?'message.compose':type,payload);
  const out=applyAction(state,type,payload,{idempotencyKey:key,expectedRevision:revision,nowISO:new Date().toISOString()});persist(out.state);ui.dirty=false;
  if(type==='customer.add'){ui.selectedCustomer=out.result.id;ui.edit=bookingDraft?{kind:'booking',id:''}:null;}
  if(type==='booking.create'){ui.selectedBooking=out.result.id;ui.day=payload.day;ui.calendarMode='day';}
  if(type==='booking.change')ui.day=payload.day;
  if(!bookingDraft&&!['message.draft','message.note','question.save','settings.save','richmenu.save'].includes(type))ui.edit=null;
  render();restoreDrafts(drafts);
  if(bookingDraft){const form=document.querySelector('form[data-action="booking.create"]');for(const el of form?.querySelectorAll('input[name],select[name],textarea[name]')||[]){if(Object.hasOwn(bookingDraft,el.name))el.value=bookingDraft[el.name];if(el.name==='customerId')el.value=out.result.id;}bookingResource(form);closeModal(true);ui.dirty=true;if(form)form.dataset.dirty='true';form?.querySelector('[name=customerId]')?.focus();}
  notify(bookingDraft?'顧客を追加しました。予約の入力を続けられます':type.startsWith('message.')?'下書きを保存しました':type==='crm.previewJob'?'プレビューを保存しました・送信なし':'保存しました');return out;
}
function summaryFor(type,payload){
  if(type.startsWith('booking.')){
    const old=state.bookings.find(b=>b.id===payload.id), b={...old,...payload};
    const describe=row=>`${row.day} ${row.time} · ${menuName(state.menus.find(m=>m.id===row.menuId),ui.locale)}`;
    return `<p><strong>${e(state.customers.find(c=>c.id===b.customerId)?.name||'')}</strong></p>${old&&type==='booking.change'?`<p>${e(t('変更前'))}: ${e(describe(old))}</p>`:''}<p>${e(t(type==='booking.change'?'変更後':'日時'))}: <strong>${e(describe(b))}</strong></p><p>${e(t('バンコク時間'))}</p><span class="badge muted">${e(t('架空データ・送信なし'))}</span>`;
  }
  if(type==='message.draft'||type==='message.note')return `<p>${e(state.customers.find(c=>c.id===payload.id)?.name)}</p><div class="bubble outgoing"><p>${e(payload.text)}</p></div><span class="badge muted">${e(t('下書き・未送信'))}</span>`;
  if(type==='richmenu.save')return `${payload.image?`<img class="richmenu-art" src="${e(payload.image)}" alt="">`:''}<h3>${e(payload.title)}</h3><div class="richmenu-preview grid three">${payload.areas.filter(a=>a.enabled&&payload.visible).map(a=>`<div class="preview-card">${e(a.label)}</div>`).join('')}</div><p>${e(t('デモ内の表示を変更します'))}</p>`;
  if(type==='faq.publish'){const f=state.faq.find(f=>f.id===payload.id);return `<h3>${e(f?.question)}</h3><p>${e(f?.answer)}</p><span class="badge muted">${e(t('デモ内の表示を変更します'))}</span>`;}
  return `<p>${e(t('内容を確認して保存してください'))}</p><span class="badge muted">${e(t('架空データ・送信なし'))}</span>`;
}
function confirmAction(type,payload){
  const key=crypto.randomUUID(),rev=state.revision;
  const title=({'booking.create':'この内容で予約を保存しますか？','booking.confirm':'予約を確定しますか？','booking.change':'この内容に変更しますか？','booking.cancel':'この予約を取り消しますか？','booking.attend':'来店を記録しますか？','message.draft':'返信の下書きを確認','message.note':'スタッフメモを確認','faq.publish':'表示内容を確認','customer.resume':'自動返信を再開しますか？','customer.takeover':'スタッフ対応に切り替えますか？','customer.resolve':'対応を完了しますか？','crm.cancelJob':'プレビューを取り消しますか？'})[type]||'内容を確認';
  const confirmLabels={'booking.create':payload.status==='confirmed'?'予約を確定':'希望として保存','booking.confirm':'予約を確定','booking.change':'予約を変更','booking.cancel':'予約を取り消す','booking.attend':'来店を記録','message.draft':'下書きを保存','message.note':'スタッフメモを保存','richmenu.save':'デモに保存','faq.publish':payload.published?'デモに表示':'下書きに戻す','customer.takeover':'スタッフが対応','customer.resume':'自動返信を再開','customer.resolve':'対応を完了','crm.cancelJob':'プレビューを取り消す','crm.pauseJob':'保留する','crm.resumeJob':'再開する'};
  showModal(title,summaryFor(type,payload),{confirm:confirmLabels[type]||'保存する',html:true,onConfirm:()=>{try{run(type,payload,key,rev);closeModal(true);}catch(error){report(error);}}});
}
function formValues(form){
  const read=container=>{const data={};for(const element of container.querySelectorAll('input[name],select[name],textarea[name]')){if(element.closest('[data-collection]')&&container===form)continue;if(element.disabled)continue;const name=element.name;if(element.hasAttribute('data-array')){data[name]??=[];if(element.checked)data[name].push(element.value);continue;}if(element.hasAttribute('data-bool'))data[name]=element.checked;else if(element.hasAttribute('data-number'))data[name]=element.value.trim()===''?NaN:Number(element.value);else if(element.hasAttribute('data-list'))data[name]=[...new Set(element.value.split(',').map(s=>s.trim()).filter(Boolean))];else if(element.hasAttribute('data-lines'))data[name]=[...new Set(element.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean))];else data[name]=element.value;}return data;};
  const data=read(form);for(const collection of form.querySelectorAll('[data-collection]'))data[collection.dataset.collection]=[...collection.querySelectorAll('[data-row]')].map(read);return data;
}
document.addEventListener('submit',event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement)||(!form.dataset.action&&!form.dataset.search))return;event.preventDefault();if(busy)return;
  const payload=formValues(form),action=form.dataset.action;
  if(form.dataset.search){guarded(()=>{ui.filters[form.dataset.search]=payload.query;render();});return;}
  if(action==='ui.filter'){const filters=[...form.querySelectorAll('[data-filter]')].map(el=>[el.dataset.filter,el.value]);guarded(()=>{for(const [key,value] of filters)ui.filters[key]=value;render();});return;}
  if(action==='crm.preview'){ui.previewAt=payload.atLocal;ui.dirty=false;render();return;}
  if(action==='message.compose'){const {kind,...p}=payload;confirmAction(kind==='note'?'message.note':'message.draft',p);return;}
  if(action.startsWith('booking.')||action==='richmenu.save'){confirmAction(action,payload);return;}
  try{run(action,payload);}catch(error){report(error);}
});
document.addEventListener('input',event=>{const form=event.target.closest('form[data-action]:not([data-action="ui.filter"]):not([data-action="crm.preview"])');if(form){ui.dirty=true;form.dataset.dirty='true';}});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.name==='menuId'&&el.closest('form[data-action^="booking."]')){const m=state.menus.find(m=>m.id===el.value),r=state.settings.resources.find(r=>r.id===m?.resource),box=el.form.querySelector('[data-booking-resource]');if(box)box.textContent=`${t('設備はメニューに合わせて選ばれます')} · ${r?.name||''} · ${m?.duration} ${t('分')} + ${t('準備')} ${m?.cleanup} ${t('分')}`;}
 if(el.matches('[data-richmenu-image]')){const file=el.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>500000){notify('PNG・JPEG・WebPの500KB以下の画像を選んでください');el.value='';return;}const reader=new FileReader();reader.onload=()=>{if(!el.isConnected)return;el.form.querySelector('[name=image]').value=reader.result;const img=document.querySelector('[data-richmenu-preview]');if(img){img.src=reader.result;img.hidden=false;}ui.dirty=true;el.form.dataset.dirty='true';};reader.readAsDataURL(file);return;}
 if(el.matches('[data-language]')){const next=el.value;el.value=ui.locale;guarded(()=>{ui.locale=next;try{localStorage.setItem('salon-b-language',next);}catch{}render();});}
 else if(el.matches('[data-day]'))guarded(()=>{ui.day=el.value||today;ui.selectedBooking='';render();});
 else if(el.matches('[data-filter]')&&!el.closest('[data-action="ui.filter"]')){const value=el.value;guarded(()=>{ui.filters[el.dataset.filter]=value;render();});}
});
document.addEventListener('click',event=>{
 const el=event.target.closest('button,a');if(!el)return;
 if(el.matches('.skip-link')){event.preventDefault();document.querySelector('#main')?.focus();return;}
 if(el.hasAttribute('data-modal-close')){event.preventDefault();closeModal();return;}
 if(el.hasAttribute('data-modal-confirm')){event.preventDefault();if(busy)return;const callback=modal?.onConfirm;if(callback){busy=true;el.disabled=true;Promise.resolve().then(()=>{busy=false;callback();}).finally(()=>{busy=false;if(el.isConnected)el.disabled=false;});}return;}
 if(el.dataset.shortcut){event.preventDefault();guarded(()=>{const shortcut=el.dataset.shortcut;if(shortcut==='today-bookings'){ui.calendarMode='day';ui.day=today;go('bookings');}else if(shortcut==='unanswered'){ui.filters.questionStatus='unanswered';ui.filters.questionSearch='';ui.filters.questionLocale='';ui.filters.questionFrom='';ui.filters.questionTo='';go('questions');}else if(['message-drafts','message-waiting'].includes(shortcut)){ui.messageFilter=shortcut==='message-drafts'?'drafts':'waiting';ui.selectedMessage='';ui.filters.messageSearch='';go('messages');}});return;}
 if(el.dataset.nav){event.preventDefault();go(el.dataset.nav);return;}
 if(el.dataset.edit){event.preventDefault();edit(el.dataset.edit,el.dataset.id);return;}
 if(el.dataset.customer){event.preventDefault();guarded(()=>{ui.selectedCustomer=el.dataset.customer;ui.filters.customerSearch='';ui.filters.customerSegment='';ui.edit=null;ui.view='customers';history.pushState(null,'','#/customers');render();focusPane('.detail-pane');});return;}
 if(el.dataset.message){event.preventDefault();guarded(()=>{ui.selectedMessage=el.dataset.message;if(ui.view!=='messages'){ui.messageFilter='all';ui.filters.messageSearch='';}ui.view='messages';ui.edit=null;history.pushState(null,'','#/messages');render();focusPane('.detail-pane');});return;}
 if(el.dataset.booking){event.preventDefault();guarded(()=>{ui.selectedBooking=el.dataset.booking;ui.view='bookings';ui.edit=null;history.pushState(null,'','#/bookings');render();document.querySelector('.app-main > .panel:last-child')?.scrollIntoView({block:'nearest'});});return;}
 if(el.dataset.tab){guarded(()=>{if(el.dataset.tab==='calendar')ui.calendarMode=el.dataset.value;if(el.dataset.tab==='message'){ui.messageFilter=el.dataset.value;ui.selectedMessage='';}if(el.dataset.tab==='crm')ui.crmTab=el.dataset.value;ui.edit=null;render();});return;}
 if(el.dataset.dayOffset){guarded(()=>{ui.day=dateAdd(ui.day,Number(el.dataset.dayOffset));render();});return;}
 if(el.dataset.propose){edit('booking',el.dataset.id);const input=document.querySelector('input[name="time"]');if(input){input.value=el.dataset.propose;ui.dirty=true;}return;}
 const action=el.dataset.act,id=el.dataset.id;if(!action)return;
 if(action==='focus-list'){focusPane('.list-pane');return;}
 if(action==='booking.addCustomer'){const form=document.querySelector('form[data-action="booking.create"]');if(!form)return;const draft=formValues(form),markup=customerForm({...context(),ui:{...ui,edit:{kind:'customer',id:''}}});showModal('顧客を追加',markup.slice(markup.indexOf('<form ')),{html:true});modal.bookingDraft=draft;return;}
 if(['edit.close','close-edit'].includes(action)){guarded(()=>{ui.edit=null;render();});return;}
 if(action==='today'){guarded(()=>{ui.day=today;render();});return;}
 if(action==='attend-form'){const b=state.bookings.find(b=>b.id===id);showModal('来店を記録',attendForm(b,context()),{html:true});return;}
 if(action==='question.openChat'){const q=state.questions.find(q=>q.id===id);guarded(()=>{ui.selectedMessage=q.customerId;ui.messageFilter='all';ui.filters.messageSearch='';go('messages');});return;}
 if(action==='question.toFaq'){const q=state.questions.find(q=>q.id===id);guarded(()=>{try{const result=run('faq.save',{question:q.question,answer:q.answer,category:'その他'});edit('faq',result.result.id);}catch(error){report(error);}});return;}
 if(action==='settings.addResource'){const form=el.closest('form'),collection=form.querySelector('[data-collection="resources"]'),clone=collection.querySelector('[data-row]').cloneNode(true);clone.querySelector('[name=id]').value=`room-${crypto.randomUUID().slice(0,8)}`;clone.querySelector('[name=name]').value='';clone.querySelector('legend').textContent=t('新しい施術席');clone.querySelector('[name=capacity]').value='1';clone.querySelector('[name=enabled]').checked=true;collection.append(clone);ui.dirty=true;clone.querySelector('[name=name]').focus();return;}
 if(action==='richmenu.preview'){const area=state.richMenu.areas.find(a=>a.id===id);const target=area.action==='booking'?'bookings':area.action;guarded(()=>go(target));return;}
 if(action==='crm.previewJob'){try{run(action,{atLocal:ui.previewAt});}catch(error){report(error);}return;}
 if(action==='faq.publish'){confirmAction(action,{id,published:el.dataset.value==='true'});return;}
 if(['booking.confirm','booking.cancel','customer.takeover','customer.resolve','customer.resume','crm.cancelJob','crm.pauseJob','crm.resumeJob'].includes(action))confirmAction(action,{id});
});
document.addEventListener('keydown',event=>{
 if(!modal)return;if(event.key==='Escape'){event.preventDefault();closeModal();}
 if(event.key==='Tab'){const elements=[...modalRoot.querySelectorAll('button:not([disabled]),input:not([type=hidden]),textarea,select,a[href]')].filter(el=>el.offsetParent!==null);const first=elements[0],last=elements.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
});
window.addEventListener('hashchange',()=>{const target=route(location.hash),section=testSection(location.hash);if(target===ui.view&&(target!=='test'||section===ui.testSection))return;const next=target==='test'&&section!=='all'?`test/${section}`:target;if(ui.dirty||unmountLive?.hasUnsavedChanges?.()||unmountLive?.isBusy?.()){history.replaceState(null,'',`#/${currentPath()}`);go(next);}else{ui.view=target;ui.testSection=section;ui.edit=null;render();}});
window.addEventListener('beforeunload',event=>{if(ui.dirty||unmountLive?.hasUnsavedChanges?.()||unmountLive?.isBusy?.()){event.preventDefault();event.returnValue='';}});
window.addEventListener('storage',event=>{if(event.key===STORE&&event.newValue){try{const next=validateState(JSON.parse(event.newValue));if(next){if(!ui.dirty&&!modal){state=upgradeDemo(next);if(ui.view!=='test')render();}else notify('別の画面で更新されました。保存前に内容を確認してください');}}catch{}}});
ui.view=route(location.hash);ui.testSection=testSection(location.hash);render();
