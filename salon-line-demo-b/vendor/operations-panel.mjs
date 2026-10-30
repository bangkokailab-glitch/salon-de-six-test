// All data and tokens stay in memory. Server-side previews are authoritative.
export function mountOperationsPanel(root,client,{section='all'}={}) {
 if(!['all','bookings','customers','crm'].includes(section))throw Error('invalid_section');
 const show=group=>section==='all'||section===group;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
 const status=el('p','TEST操作候補（無送信）'), body=el('div'), review=el('section'), message=el('p'), reloadReview=el('section');
 root.replaceChildren(status,message,body,review,reloadReview);
 let current=null,generation=0,busy=false,disposed=false,authenticated=false;
 let formRecords=new Map();const locked=new Map(),targetLabels=new Map();
 const kinds=[['reminder_day_before','来店前日'],['reminder_day_of','来店当日'],['reminder_hours_before','来店1時間前'],['thank_you_after_visit','来店後のお礼'],['followup_days_after_visit','再来店'],['birthday','誕生日'],['interest_campaign','興味別'],['visit_segment_campaign','施術履歴別']];
 const targetKey=(action,target)=>(action.startsWith('customer.')?'customer':action.startsWith('booking.')?'booking':action==='crm.draft'?'crm':'fixture')+':'+target;
 const hasUnsavedChanges=()=>!!current||[...formRecords.values()].some(record=>record.form.dataset.dirty==='true');
 function controls(){
  if(busy){for(const node of root.querySelectorAll('button,input,select,textarea')){if(!locked.has(node))locked.set(node,node.disabled);node.disabled=true;}}
  else{for(const [node,disabled]of locked)node.disabled=disabled;locked.clear();}
  loadButton.disabled=busy||!authenticated;
  for(const record of formRecords.values())if(record.stopButton)record.stopButton.disabled=busy||!authenticated||record.savedSettings.botPaused;
 }
 async function task(work){if(busy||disposed||!authenticated)return;busy=true;controls();try{return await work();}finally{busy=false;if(!disposed)controls();}}
 const formKey=(action,target)=>action.startsWith('booking.')?'booking:'+target:action==='customer.profile'?'profile:'+target:action==='customer.settings'?'settings:'+target:action==='crm.draft'?'crm:'+target:'';
 const dirtyRecords=except=>new Map([...formRecords].filter(([key,record])=>key!==except&&record.form.dataset.dirty==='true'));
 function restoreDirty(records,stoppedCustomerId){for(const [key,old]of records){const fresh=formRecords.get(key);if(!fresh||!fresh.form.querySelectorAll('input,select,textarea').length)continue;
  if(fresh.savedSettings){old.savedSettings=fresh.savedSettings;if(key==='settings:'+stoppedCustomerId)for(const node of old.form.querySelectorAll('input'))if(['optedOut','botPaused'].includes(node.name))node.checked=node.checked||fresh.savedSettings[node.name];}
  body.insertBefore(old.section,fresh.section);fresh.section.remove();formRecords.set(key,old);}}
 const bangkok=value=>{if(value==null||value==='')return '未設定';const d=new Date(value);return Number.isFinite(+d)?new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(d):'未設定';};
 const labels={'fixture.prepare':'架空TEST顧客の用意','booking.create':'架空TEST予約の作成','booking.reschedule':'予約日時変更','booking.cancel':'予約取消','customer.profile':'プロフィール変更','customer.settings':'言語・配信停止・自動応答・メモの変更','crm.draft':'CRM下書き保存'};
 const error=e=>{message.textContent=({disabled:'この操作はまだ有効化されていません。',stale_preview:'情報が変わったため再確認してください。',preview_expired:'確認期限を過ぎました。もう一度内容を確認してください。',target_busy:'この対象は結果確認中です。繰り返し操作しないでください。',not_found:'操作できる対象がありません。',unauthorized:'再ログインしてください。',birthday_consent_required:'誕生日の利用同意と配信停止状態を確認してください。'})[e.message]||'結果を確認できませんでした。確定操作の再送は同じ確認番号で結果を照会します。';};
 const clear=()=>{generation++;current=null;review.replaceChildren();reloadReview.replaceChildren();};
 const button=(text,fn)=>{const b=el('button',text);b.type='button';b.className='action secondary';b.onclick=fn;return b;};
 function field(form,name,label,value='',type='text',options){
  const l=el('label',label),n=el(options?'select':type==='textarea'?'textarea':'input');n.name=name;l.className='field';
  if(options)for(const [v,t]of options){const o=el('option',t);o.value=v;n.append(o);}else if(type!=='textarea')n.type=type;
  if(type==='checkbox')n.checked=!!value;else n.value=value??'';
  l.append(n);form.append(l);return n;
 }
 function form(title,key){const s=el('section'),h=el('h3',title),f=el('form');f.className='form-grid';f.dataset.operationKey=key;s.append(h,f);body.append(s);formRecords.set(key,{section:s,form:f});f.addEventListener('input',()=>{if(busy)return;f.dataset.dirty='true';clear();});return f;}
 async function preview(action,target,input,{stopCustomerId=null}={}){
  return task(async()=>{clear();message.textContent='変更内容を確認しています…';const epoch=generation;
   try{const p=await client.operations('preview',{action,target,input});if(epoch!==generation||disposed)return;
    if(!p.previewId||!Number.isFinite(p.expiresAt))throw Error('invalid_response');current={...p,formKey:stopCustomerId?'stop:'+target:formKey(action,target),stopCustomerId,displayTarget:targetLabels.get(targetKey(action,target))||labels[action]||'操作'};message.textContent='まだ変更していません。内容を確認してください。';drawReview();
   }catch(e){if(epoch===generation&&!disposed)error(e);}
  });
 }
 function display(obj){const lines=[];const names={startAt:'開始（バンコク）',endAt:'終了（バンコク）',status:'状態',language:'言語',opt_out:'配信停止',optedOut:'配信停止',test_bot_paused:'自動応答の停止',botPaused:'自動応答の停止',note:'スタッフメモ',staffNote:'スタッフメモ',full_name:'氏名',fullName:'氏名',birthday_mmdd:'誕生日',birthdayMmdd:'誕生日',birthday_use_consent:'誕生日の利用同意',birthdayUseConsent:'誕生日の利用同意',interest_keys_json:'興味タグ',interestKeys:'興味タグ',kind:'案内の種類',bodyText:'日本語',bodyTextEn:'English',bodyTextTh:'ไทย',enabled:'プレビューON',sendLocalTime:'時刻',offsetDays:'来店後の日数',offsetMinutes:'来店前の分数',interestKey:'興味タグ',segmentMenuId:'実施メニュー'};
  if(obj?.rule_json){try{return display(JSON.parse(obj.rule_json));}catch{}}
  for(const [key,value]of Object.entries(obj||{}))if(names[key])lines.push(names[key]+'：'+(['startAt','endAt'].includes(key)?bangkok(value):key==='kind'?(kinds.find(([kind])=>kind===value)?.[1]||'未設定'):Array.isArray(value)?value.join('、'):value===true?'ON':value===false?'OFF':value??'未設定'));
  return lines.join('\n')||'未設定';
 }
 function drawReview(){
  review.replaceChildren();if(!current)return;const p=current;
  review.append(el('h3',p.stopCustomerId?'自動応答停止の確認':(labels[p.action]||'操作')+'の確認'),el('p','対象：'+p.displayTarget+' ／ 時刻：バンコク'),el('h4','変更前'),el('pre',display(p.before)),el('h4','変更後'),el('pre',p.action==='booking.cancel'?'取消（履歴を残す）':display(p.after)),el('p','この操作ではLINEを送信しません。確認期限は5分です。'));
  const commit=button('この内容でTESTに反映',async()=>{
    if(current!==p)return;
    return task(async()=>{const epoch=generation;
     try{const result=await client.operations('confirm',{previewId:p.previewId});if(epoch!==generation||disposed)return;
      if(result.status==='unknown'){message.textContent='結果確認中です。新しい操作を作らず、この確認番号で結果を照会してください。';commit.textContent='同じ確認番号で結果を照会';}
      else if(result.status==='completed'||result.testCalendarEventChanged||result.testCalendarEventCreated){const drafts=dirtyRecords(p.formKey);clear();message.textContent='TESTへの反映を確認しました（LINE送信なし）。';await load(drafts,{stoppedCustomerId:p.stopCustomerId});}
      else{clear();message.textContent='反映できませんでした：'+result.code;}
     }catch(e){if(epoch===generation&&!disposed){error(e);commit.textContent='同じ確認番号で結果を照会';}}
    });
  });review.append(commit,button('戻る',()=>{if(!busy)clear();}));review.scrollIntoView({behavior:'smooth',block:'start'});
 }
 async function load(preserved=new Map(),{stoppedCustomerId=null}={}){
  const epoch=generation;
  try{const data=await client.operations('state');if(epoch!==generation||disposed)return;body.replaceChildren();formRecords=new Map();targetLabels.clear();if(message.textContent==='操作するにはログインしてください。')message.textContent='操作対象を読み込みました。';
   const bookings=data.bookings||client.snapshot().bookings;
   for(const c of data.customers||[])targetLabels.set('customer:'+c.id,c.displayName||'TEST顧客');
   for(const b of bookings)targetLabels.set('booking:'+b.id,(b.menu||'TEST予約')+' ／ '+bangkok(b.startsAt));
   for(const [kind,label]of kinds)targetLabels.set('crm:client-'+kind.replaceAll('_','-'),label);
   if(data.fixturePreparation)targetLabels.set('fixture:'+data.fixturePreparation.requestId,'架空TEST顧客の用意');
   if(show('bookings')&&data.fixturePreparation)body.append(button('架空TEST顧客の用意を確認',()=>preview('fixture.prepare',data.fixturePreparation.requestId,{})));
   for(const p of show('bookings')?data.pendingOperations||[]:[])body.append(button((labels[p.action]||'操作')+'の結果を確認（再実行なし）',()=>task(async()=>{const epoch=generation;try{const r=await client.operations('confirm',{previewId:p.previewId});if(epoch!==generation||disposed)return;message.textContent=r.testCalendarEventChanged?'Google予定との照合が完了しました（再実行・LINE送信なし）。':'結果確認中です。再操作せず、時間をおいて同じ確認番号で照合してください。';if(r.testCalendarEventChanged){const drafts=dirtyRecords();clear();await load(drafts);}}catch(e){if(epoch===generation&&!disposed)error(e);}})));
   if(show('bookings')){
   const calendarForm=form('TESTカレンダーの空き時間','calendar');const from=field(calendarForm,'from','開始日','','date'),through=field(calendarForm,'through','終了日（含まない）','','date');calendarForm.append(button('カレンダーを確認（閲覧のみ）',()=>task(async()=>{const epoch=generation;try{const d=await client.operations('calendar',{start:from.value,end:through.value});if(epoch!==generation||disposed)return;message.textContent=d.busy.length?d.busy.map(b=>bangkok(b.startAt)+'〜'+bangkok(b.endAt)).join('\n'):'指定期間に使用中の時間はありません。';}catch(e){if(epoch===generation&&!disposed)error(e);}})));calendarForm.onsubmit=e=>e.preventDefault();
   for(const b of bookings.filter(b=>b.readOnly||(data.writableBookingIds||[]).includes(b.id))){if((data.pendingOperations||[]).some(p=>p.target===b.id))continue;const f=form('TEST予約：'+(b.menu||'TEST予約'),'booking:'+b.id);f.append(el('p',(b.startsAt?bangkok(b.startsAt):'')+' ／ '+(b.status||'')));
    if(b.readOnly){f.append(el('p','取消済みの履歴です。追加操作はできません。'));continue;}
    const at=field(f,'startAt','変更後の日時（バンコク）','','datetime-local');
    if(b.status==='pending_staff'){const end=field(f,'endAt','終了日時（バンコク）','','datetime-local');f.append(button('架空TEST予約の作成を確認',()=>preview('booking.create',b.id,{startAt:at.value+':00+07:00',endAt:end.value+':00+07:00'})));}else f.append(button('日時変更を確認',()=>preview('booking.reschedule',b.id,{startAt:at.value.length===16?at.value+':00+07:00':at.value+'+07:00'})),button('取消内容を確認',()=>preview('booking.cancel',b.id,{})));f.onsubmit=e=>e.preventDefault();
   }
   }
   for(const c of show('customers')?data.customers:[]){
    const f=form((c.displayName||'TEST顧客')+'：管理設定','settings:'+c.id),lang=field(f,'language','案内言語',c.settings.language,'select',[['ja','日本語'],['en','English'],['th','ไทย']]),out=field(f,'optedOut','配信停止',c.settings.optedOut,'checkbox'),pause=field(f,'botPaused','自動応答を停止中',c.settings.botPaused,'checkbox'),note=field(f,'staffNote','スタッフメモ',c.settings.staffNote,'textarea');
    const record=formRecords.get('settings:'+c.id);record.savedSettings={...c.settings};
    record.stopButton=button('自動応答を停止',()=>{
     const saved=formRecords.get('settings:'+c.id)?.savedSettings;if(!saved||saved.botPaused)return;
     return preview('customer.settings',c.id,{language:saved.language,optedOut:saved.optedOut,botPaused:true,staffNote:saved.staffNote},{stopCustomerId:c.id});
    });f.append(record.stopButton);
    f.append(button('管理設定を確認',()=>preview('customer.settings',c.id,{language:lang.value,optedOut:out.checked,botPaused:pause.checked,staffNote:note.value})));f.onsubmit=e=>e.preventDefault();
    const pf=form((c.displayName||'TEST顧客')+'：プロフィール','profile:'+c.id),p=c.profile||{},name=field(pf,'fullName','氏名',p.full_name),birth=field(pf,'birthday','誕生日（月-日）',p.birthday_mmdd),consent=field(pf,'consent','誕生日の利用同意あり',p.birthday_use_consent===1,'checkbox'),interest=field(pf,'interest','興味のある施術','','select',(data.interestOptions||[]).map(x=>[x.key,x.label]));
    interest.multiple=true;for(const option of interest.options)option.selected=JSON.parse(p.interest_keys_json||'[]').includes(option.value);
    pf.append(button('プロフィールを確認',()=>preview('customer.profile',c.id,{fullName:name.value,birthdayMmdd:birth.value,birthdayUseConsent:consent.checked,interestKeys:Array.from(interest.selectedOptions).map(o=>o.value),interestSource:'staff_entry'})));pf.onsubmit=e=>e.preventDefault();
   }
   for(const [kind,label]of show('crm')?kinds:[]){const id='client-'+kind.replaceAll('_','-'),saved=data.drafts.find(d=>d.id===id),r=saved?JSON.parse(saved.rule_json):{};
    const f=form('CRM下書き：'+label,'crm:'+id),on=field(f,'enabled','プレビューON（実配信はOFF）',r.enabled,'checkbox');
    const time=['reminder_day_before','reminder_day_of','thank_you_after_visit','followup_days_after_visit','birthday'].includes(kind)?field(f,'time','時刻（バンコク）',r.sendLocalTime||'10:00','time'):null;
    const days=['thank_you_after_visit','followup_days_after_visit'].includes(kind)?field(f,'days','来店後の日数',r.offsetDays??(kind==='followup_days_after_visit'?7:0),'number'):null;
    const interest=kind==='interest_campaign'?field(f,'interest','興味のある施術',r.interestKey||'','select',[['','選択してください'],...(data.interestOptions||[]).map(x=>[x.key,x.label])]):null;
    const menu=kind==='visit_segment_campaign'?field(f,'menu','実施した施術',r.segmentMenuId||'','select',[['','選択してください'],...(data.menuOptions||[]).map(x=>[x.id,x.name])]):null;
    for(const node of [time,days,interest,menu])if(node)node.required=true;
    if(days){days.min=kind==='thank_you_after_visit'?'0':'1';days.max=kind==='thank_you_after_visit'?'1':'30';days.step='1';}
    const ja=field(f,'ja','日本語',r.bodyText||'','textarea'),en=field(f,'en','English',r.bodyTextEn||'','textarea'),th=field(f,'th','ไทย',r.bodyTextTh||'','textarea');ja.required=true;
    f.append(button('CRM下書きを確認',()=>{if(f.reportValidity&&!f.reportValidity())return;return preview('crm.draft',id,{kind,interestKey:interest?interest.value:null,offsetMinutes:kind==='reminder_hours_before'?60:null,offsetDays:days?Number(days.value):null,sendLocalTime:time?time.value:null,bodyText:ja.value,bodyTextEn:en.value||null,bodyTextTh:th.value||null,segmentMenuId:menu?menu.value:null,enabled:on.checked});}));f.onsubmit=e=>e.preventDefault();
    if(saved){const at=field(f,'simulateAt','候補を確認する日時（バンコク）','','datetime-local');f.append(button('送信候補を確認（無送信）',()=>task(async()=>{const epoch=generation;try{const data=await client.operations('simulate',{ruleId:id,at:at.value+':00+07:00'});if(epoch!==generation||disposed)return;message.textContent=data.candidates.length?data.candidates.map(c=>c.customerId+' / '+c.language+'：'+c.text).join('\n'):'この日時の候補はありません。';}catch(e){if(epoch===generation&&!disposed)error(e);}})));}
   }
   restoreDirty(preserved,stoppedCustomerId);
  }catch(e){if(epoch===generation&&!disposed)error(e);}
 }
 function reload(){return task(async()=>{clear();await load();});}
 const loadButton=button('操作対象を読み込む',()=>{
  if(busy||disposed||!authenticated)return;
  if(!hasUnsavedChanges())return reload();
  reloadReview.replaceChildren(el('h3','保存していない変更があります'),el('p','編集内容と確認画面を破棄して、操作対象を読み直しますか？'),
    button('変更を破棄して再読込',reload),button('編集を続ける',()=>{if(!busy)reloadReview.replaceChildren();}));
  reloadReview.scrollIntoView({behavior:'smooth',block:'start'});
 });root.insertBefore(loadButton,body);
 const unsubscribe=client.subscribe(s=>{authenticated=['authenticated','connected'].includes(s.status);if(!authenticated){clear();body.replaceChildren();formRecords.clear();targetLabels.clear();message.textContent='操作するにはログインしてください。';}controls();});
 const cleanup=()=>{disposed=true;generation++;clear();formRecords.clear();targetLabels.clear();unsubscribe();root.replaceChildren();};
 cleanup.isBusy=()=>!disposed&&busy;
 cleanup.hasUnsavedChanges=()=>!disposed&&hasUnsavedChanges();
 return cleanup;
}
