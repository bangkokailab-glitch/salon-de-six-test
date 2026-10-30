export const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icon = (name, cls = '') => {
  const paths = {
    home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',
    booking:'M8 3v4m8-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1M8 13h1m6 0h1m-8 4h1m6 0h1',
    customers:'M16 21v-3a5 5 0 0 0-10 0v3m13 0v-3a5 5 0 0 0-3-4M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m2-4a4 4 0 0 1 0 8',
    messages:'M20 11a8 8 0 0 1-8 8H8l-5 3 1-7a8 8 0 1 1 16-4Z',
    crm:'M5 20V12m7 8V4m7 16V8', more:'M4 6h16M4 12h16M4 18h16',
    arrow:'m9 5 7 7-7 7M3 12h13', back:'m15 5-7 7 7 7', plus:'M12 4v16M4 12h16',
    search:'M16 16l5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    check:'m4 12 5 5L20 6', close:'m5 5 14 14M5 19 19 5',
    settings:'M4 7h16M4 17h16M8 4v6m8 4v6', faq:'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    account:'M19 21a7 7 0 0 0-14 0M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    menus:'M5 4h14v17H5ZM8 8h8M8 12h8M8 16h4', campaigns:'m3 10 15-6v16L3 14Zm4 5 2 6h4l-2-5M21 8v8',
    audit:'M12 6v6l4 2M3 12a9 9 0 1 0 3-7M3 3v5h5', questions:'M7 4h14v12H11l-4 4V4M3 8v14h12',
    richmenu:'M3 5h18v14H3Zm6 0v14m6-14v14', test:'M8 3h8M9 3v6L4 19q-1 2 2 2h12q3 0 2-2L15 9V3M7 15h10',
  };
  return `<svg class="icon ${e(cls)}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[({calendar:'booking',message:'messages',menu:'menus',gift:'campaigns',history:'audit',help:'faq',shield:'test',edit:'settings',sparkles:'check'})[name]||name] || paths.more}"/></svg>`;
};
export function field(t, label, name, value = '', type = 'text', extra = '') {
  return `<label class="field"><span>${e(t(label))}</span><input name="${e(name)}" type="${e(type)}" value="${e(value)}" ${extra}></label>`;
}
export function area(t, label, name, value = '', extra = '') {
  return `<label class="field full"><span>${e(t(label))}</span><textarea name="${e(name)}" rows="3" ${extra}>${e(value)}</textarea></label>`;
}
export function select(t, label, name, value, rows, extra = '') {
  return `<label class="field"><span>${e(t(label))}</span><select name="${e(name)}" ${extra}>${rows.map(([id, text]) => `<option value="${e(id)}" ${id === value ? 'selected' : ''}>${e(t(text))}</option>`).join('')}</select></label>`;
}
export const checked = (t, label, name, value) => `<label class="checkbox"><input type="checkbox" name="${e(name)}" data-bool ${value ? 'checked' : ''}> <span>${e(t(label))}</span></label>`;
export const hidden = (name, value) => `<input type="hidden" name="${e(name)}" value="${e(value)}">`;
export const statusLabel = {pending:'確認待ち', confirmed:'予約確定', attended:'来店済み', cancelled:'取消済み', preview:'送信なし', paused:'保留中', draft:'下書き', received:'受信', note:'スタッフメモ'};
export const badge = (status,t) => `<span class="badge ${status === 'confirmed'|| status === 'attended' ? 'mint' : status === 'pending' ? 'peach' : 'muted'}">${e(t(statusLabel[status] || status))}</span>`;
export const dateAdd = (day,n) => new Date(Date.parse(`${day}T00:00:00Z`)+n*86400000).toISOString().slice(0,10);
export const menuName = (menu, locale) => menu?.[locale === 'en' ? 'nameEn' : locale === 'th' ? 'nameTh' : 'name'] || menu?.name || '';
