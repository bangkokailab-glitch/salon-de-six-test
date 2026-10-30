import { createTestClient } from './vendor/test-client.mjs';
import { mountOperationsPanel } from './vendor/operations-panel.mjs';

// Public configuration, retained from the approved GitHub Pages integration.
// The Google client is identity-only. No token, session or customer data is persisted.
const API_ORIGIN = 'https://salon-de-six-test-client-api.sales782396.chatgpt.site';
const GOOGLE_CLIENT_ID = '145507506805-5mkm6j4c99f96k0mc41iv2sc3ci8vpdl.apps.googleusercontent.com';
const PAGE_ORIGIN = 'https://bangkokailab-glitch.github.io';
const ALLOWED_EDITS = new Set(['fixture.prepare', 'booking.create', 'booking.reschedule', 'booking.cancel', 'customer.profile', 'customer.settings', 'crm.draft']);
const CRM_IDS = new Set(['reminder_day_before', 'reminder_day_of', 'reminder_hours_before', 'thank_you_after_visit',
  'followup_days_after_visit', 'birthday', 'interest_campaign', 'visit_segment_campaign'].map(kind => `client-${kind.replaceAll('_', '-')}`));
const VALID_ID = /^[a-zA-Z0-9-]{1,64}$/;
const OPERATION_NAMES = ['架空TEST顧客の用意', '架空TEST予約の作成', '予約日時変更', '予約取消', 'プロフィール変更', '言語・配信停止・自動応答・メモの変更', 'CRM下書き保存', '操作'];
const CRM_LABELS = new Set(['来店前日', '来店当日', '来店1時間前', '来店後のお礼', '再来店', '誕生日', '興味別', '施術履歴別']);
const PREVIEW_LABELS = new Set(['開始（バンコク）', '終了（バンコク）', '状態', '言語', '配信停止', '自動応答の停止', 'スタッフメモ', '氏名', '誕生日', '誕生日の利用同意', '興味タグ', '案内の種類', '日本語', 'English', 'ไทย', 'プレビューON', '時刻', '来店後の日数', '来店前の分数', '実施メニュー']);

// Translate only system labels; keep customer names, IDs and preview values verbatim.
export function translateOperationText(value, t, kind = 'static') {
  if (kind === 'heading') {
    for (const suffix of ['：管理設定', '：プロフィール']) if (value.endsWith(suffix)) return value.slice(0, -suffix.length) + t(suffix);
    if (value.startsWith('TEST予約：')) return t('TEST予約：') + value.slice('TEST予約：'.length);
    if (value.startsWith('CRM下書き：')) {
      const label = value.slice('CRM下書き：'.length);
      return t('CRM下書き：') + (CRM_LABELS.has(label) ? t(label) : label);
    }
    for (const name of OPERATION_NAMES) if (value === name + 'の確認') return t(name) + t('の確認');
  }
  if (kind === 'preview') {
    return value.split('\n').map(line => {
      const separator = line.indexOf('：'), label = line.slice(0, separator);
      const rawValue=line.slice(separator+1);
      const displayValue=label==='案内の種類'&&CRM_LABELS.has(rawValue)?t(rawValue):rawValue;
      return separator >= 0 && PREVIEW_LABELS.has(label) ? t(label) + '：' + displayValue
        : ['未設定', '取消（履歴を残す）'].includes(line) ? t(line) : line;
    }).join('\n');
  }
  if (value.startsWith('対象：') && value.endsWith(' ／ 時刻：バンコク')) {
    return t('対象：') + value.slice('対象：'.length, -' ／ 時刻：バンコク'.length) + t(' ／ 時刻：バンコク');
  }
  if (value.startsWith('反映できませんでした：')) return t('反映できませんでした：') + value.slice('反映できませんでした：'.length);
  for (const name of OPERATION_NAMES) if (value === name + 'の結果を確認（再実行なし）') return t(name) + t('の結果を確認（再実行なし）');
  return t(value);
}

// Server state is the authority for available TEST operations. Keeping the UI
// capable of an operation does not execute it; preview and explicit confirmation
// remain separate. No credentials, business state or preview IDs are persisted.
export function createScopedOperationsClient(client) {
  let disposed = false, epoch = 0, connected = false, preparationId = '', stateAcquired = false;
  let customerIds = new Set(), draftIds = new Set(), bookingIds = new Set();
  const previews = new Map();
  const reject = code => { throw new Error(code); };
  const clear = () => { epoch++; preparationId = ''; stateAcquired = false; customerIds.clear(); draftIds.clear(); bookingIds.clear(); previews.clear(); };
  const unsubscribe = client.subscribe(state => {
    connected = state.status === 'connected' && state.principal?.role !== 'participant';
    if (!connected) clear();
  });
  const safeSnapshot = state => ({ ...state, status: state.status === 'connected' ? 'connected' : 'ready', bookings: [] });
  const ids = rows => {
    if (!Array.isArray(rows) || rows.some(row => !VALID_ID.test(row?.id || ''))) reject('invalid_response');
    return new Set(rows.map(row => row.id));
  };
  return {
    configured: client.configured,
    snapshot: () => safeSnapshot(client.snapshot()),
    subscribe: listener => client.subscribe(state => listener(safeSnapshot(state))),
    async operations(operation, body = {}) {
      if (disposed || !connected || !client.isAuthenticated()) reject('unauthorized');
      const current = epoch;
      if (operation === 'preview') {
        if (!ALLOWED_EDITS.has(body.action)) reject('disabled');
        const allowed = body.action === 'fixture.prepare' ? preparationId && body.target === preparationId
          : body.action.startsWith('booking.') ? bookingIds.has(body.target)
          : body.action === 'crm.draft' ? stateAcquired && (draftIds.has(body.target) || CRM_IDS.has(body.target)) : customerIds.has(body.target);
        if (!allowed) reject('not_found');
        if (body.action === 'crm.draft' && CRM_IDS.has(body.target)
          && body.target !== `client-${String(body.input?.kind || '').replaceAll('_', '-')}`) reject('not_found');
      } else if (operation === 'confirm') {
        if (!previews.has(body.previewId)) reject('not_found');
      } else if (operation === 'simulate') {
        if (!draftIds.has(body.ruleId)) reject('not_found');
      } else if (!['state', 'calendar'].includes(operation)) reject('disabled');
      const data = await client.operations(operation, body);
      if (disposed || current !== epoch || !connected || !client.isAuthenticated()) reject('stale_response');
      if (operation === 'state') {
        if (data.sendEnabled !== false) reject('invalid_response');
        const nextCustomers = ids(data.customers), nextDrafts = ids(data.drafts);
        const bookings = data.bookings || [], writable = data.writableBookingIds || [], pending = data.pendingOperations || [];
        ids(bookings);
        if (!Array.isArray(writable) || writable.some(id => !VALID_ID.test(id))) reject('invalid_response');
        if (!Array.isArray(pending) || pending.some(row => !VALID_ID.test(row?.previewId || '')
          || !VALID_ID.test(row?.target || '') || !['booking.reschedule', 'booking.cancel'].includes(row.action))) reject('invalid_response');
        if (data.fixturePreparation && !VALID_ID.test(data.fixturePreparation.requestId || '')) reject('invalid_response');
        for (const customer of data.customers) {
          if (!customer.settings || !['ja', 'en', 'th'].includes(customer.settings.language)) reject('invalid_response');
          if (!Array.isArray(JSON.parse(customer.profile?.interest_keys_json || '[]'))) reject('invalid_response');
        }
        for (const draft of data.drafts) if (!JSON.parse(draft.rule_json)) reject('invalid_response');
        stateAcquired = true; customerIds = nextCustomers; draftIds = nextDrafts; bookingIds = new Set(writable);
        preparationId = data.fixturePreparation?.requestId || '';
        // Recovery IDs can arrive from an earlier session. Never create a fresh
        // preview when the existing server transaction is still unresolved.
        for (const pendingOperation of pending) previews.set(pendingOperation.previewId, {
          action: pendingOperation.action, target: pendingOperation.target, recovery: true,
        });
        return { ...data, bookings: bookings.filter(booking => booking.readOnly === true || bookingIds.has(booking.id)),
          interestOptions: data.interestOptions || [], menuOptions: data.menuOptions || [] };
      }
      if (operation === 'preview') {
        if (data.action !== body.action || data.target !== body.target || !VALID_ID.test(data.previewId || '') || !Number.isFinite(data.expiresAt)) reject('invalid_response');
        previews.set(data.previewId, { action: body.action, target: body.target });
      }
      return data;
    },
    dispose() { disposed = true; connected = false; clear(); unsubscribe(); },
  };
}

const COPY = {
  'ログイン中の役割': ['Signed-in role', 'บทบาทที่เข้าสู่ระบบ'],
  'Googleアカウントで確認': ['Verify with your Google account', 'ยืนยันด้วยบัญชี Google'],
  '共用アカウント・個人の識別なし': ['Shared account · no individual attribution', 'บัญชีส่วนกลาง · ไม่ระบุตัวบุคคล'],
  'オーナーアカウント': ['Owner account', 'บัญชีเจ้าของ'],
  'スタッフアカウント': ['Staff account', 'บัญชีพนักงาน'],
  '参加者': ['Participant', 'ผู้เข้าร่วม'],
  '閲覧のみ': ['Read only', 'ดูได้อย่างเดียว'],
  'このアカウントは閲覧のみです': ['This account has read-only access', 'บัญชีนี้มีสิทธิ์ดูข้อมูลเท่านั้น'],
  '自動応答を停止': ['Stop automatic replies', 'หยุดการตอบกลับอัตโนมัติ'],
  '自動応答停止の確認': ['Confirm stopping automatic replies', 'ยืนยันการหยุดตอบกลับอัตโนมัติ'],
  '編集内容と確認画面を破棄して、操作対象を読み直しますか？': ['Discard your edits and review, and reload the available records?', 'ละทิ้งข้อมูลที่แก้ไขและหน้าตรวจสอบ แล้วโหลดรายการที่จัดการได้ใหม่หรือไม่?'],
  '変更を破棄して再読込': ['Discard changes and reload', 'ละทิ้งการแก้ไขและโหลดใหม่'],
  '予約の操作': ['Manage appointments', 'จัดการการจอง'],
  '顧客の編集': ['Edit customers', 'แก้ไขข้อมูลลูกค้า'],
  'CRM下書き・送信候補': ['CRM drafts and preview recipients', 'แบบร่าง CRM และผู้รับตัวอย่าง'],
  'デモに戻るとログアウトし、表示したTESTデータを消去します。': ['Returning to the demo signs you out and clears displayed TEST data.', 'เมื่อกลับไปที่ตัวอย่าง ระบบจะออกจากบัญชีและล้างข้อมูล TEST ที่แสดง'],
  '保存済みの要約のみ表示します。返信送信はまだ接続していません。': ['Saved summaries only. Sending replies is not connected yet.', 'แสดงเฉพาะสรุปที่บันทึกไว้ ยังไม่ได้เชื่อมต่อการส่งข้อความตอบกลับ'],
  '接続の詳細': ['Connection details', 'รายละเอียดการเชื่อมต่อ'],
  '停止中の接続設定を確認': ['Check configuration while updates are stopped', 'ตรวจสอบการตั้งค่าเมื่อหยุดการอัปเดต'],
  '更新機能を停止中のときだけ確認できます。': ['This check is available only while updates are stopped.', 'ตรวจสอบได้เฉพาะเมื่อหยุดฟังก์ชันอัปเดตแล้ว'],
  '接続設定を確認しています…': ['Checking configuration…', 'กำลังตรวจสอบการตั้งค่า…'],
  '接続設定を確認しました。更新機能は停止中です。': ['Configuration verified. Updates remain stopped.', 'ตรวจสอบการตั้งค่าแล้ว ฟังก์ชันอัปเดตยังหยุดอยู่'],
  '接続設定を確認できませんでした。': ['Configuration could not be verified.', 'ไม่สามารถยืนยันการตั้งค่าได้'],
  '実TEST管理': ['TEST administration', 'จัดการ TEST'],
  'Googleでログイン': ['Sign in with Google', 'เข้าสู่ระบบด้วย Google'],
  '最新の情報に更新': ['Refresh data', 'อัปเดตข้อมูล'],
  'ログアウト': ['Sign out', 'ออกจากระบบ'],
  'ログインしてください': ['Sign in to view TEST data', 'เข้าสู่ระบบเพื่อดูข้อมูล TEST'],
  'ログインを準備しています…': ['Preparing sign-in…', 'กำลังเตรียมการเข้าสู่ระบบ…'],
  'Googleのボタンからログインしてください': ['Use the Google button to sign in', 'กดปุ่ม Google เพื่อเข้าสู่ระบบ'],
  '認証を確認しています…': ['Checking sign-in…', 'กำลังตรวจสอบการเข้าสู่ระบบ…'],
  'TESTデータを読み込んでいます…': ['Loading TEST data…', 'กำลังโหลดข้อมูล TEST…'],
  '実TESTデータを取得済み': ['TEST data loaded', 'โหลดข้อมูล TEST แล้ว'],
  'ログイン期限が切れました': ['Your session has expired', 'เซสชันหมดอายุแล้ว'],
  '接続を確認できませんでした': ['Could not confirm the connection', 'ไม่สามารถยืนยันการเชื่อมต่อได้'],
  'このローカルプレビューではGoogleログインを利用できません': ['Google sign-in is unavailable in this local preview', 'ตัวอย่างในเครื่องนี้ไม่รองรับการเข้าสู่ระบบ Google'],
  'TEST顧客': ['TEST customers', 'ลูกค้า TEST'],
  'TEST予約': ['TEST appointments', 'การจอง TEST'],
  '会話の要約': ['Conversation summary', 'สรุปการสนทนา'],
  '顧客を選ぶと、保存済みの要約を確認できます': ['Select a customer to view their saved summary', 'เลือกลูกค้าเพื่อดูสรุปที่บันทึกไว้'],
  '会話を読み込んでいます…': ['Loading conversation…', 'กำลังโหลดการสนทนา…'],
  '保存済みの会話要約はありません': ['No saved conversation summary', 'ไม่มีสรุปการสนทนาที่บันทึกไว้'],
  '対象のTEST顧客はありません': ['No eligible TEST customers', 'ไม่มีลูกค้า TEST ที่เข้าเกณฑ์'],
  '対象のTEST予約はありません': ['No eligible TEST appointments', 'ไม่มีการจอง TEST ที่เข้าเกณฑ์'],
  '予約・顧客・フォローの操作': ['Appointments, customers and follow-ups', 'จัดการการจอง ลูกค้า และการติดตาม'],
  '操作できる対象だけ表示します。変更前に内容を確認できます。': ['Only available operations are shown. Review changes before confirming.', 'แสดงเฉพาะรายการที่จัดการได้ ตรวจสอบการเปลี่ยนแปลงก่อนยืนยัน'],
  '架空TEST顧客の編集': ['Edit the synthetic TEST customer', 'แก้ไขลูกค้า TEST จำลอง'],
  '新しい顧客・予約の作成と、予約の変更・取消はこの画面では行いません。': ['Creating customers or appointments, rescheduling and cancellation are unavailable here.', 'หน้านี้ไม่รองรับการสร้างลูกค้าหรือการจองใหม่ การเปลี่ยนเวลา หรือการยกเลิก'],
  '登録済みTESTデータだけを表示します。会話は保存済み要約、予約は保存記録です。': ['Only registered TEST data is shown. Conversations are saved summaries and appointments are stored records.', 'แสดงเฉพาะข้อมูล TEST ที่ลงทะเบียน การสนทนาเป็นสรุปที่บันทึกไว้ และการจองเป็นข้อมูลที่จัดเก็บไว้'],
  'この画面を離れるとログアウトし、表示したTESTデータを消去します。': ['Leaving this page signs you out and clears the displayed TEST data.', 'เมื่อออกจากหน้านี้ ระบบจะออกจากบัญชีและล้างข้อมูล TEST ที่แสดง'],
  '登録済みアカウントのみ': ['Registered account only', 'เฉพาะบัญชีที่ลงทะเบียน'],
  'ログインをやり直してください': ['Please sign in again', 'กรุณาเข้าสู่ระบบอีกครั้ง'],
  '端末とサーバーの時刻に差があります': ['Your device clock differs from the server', 'เวลาของอุปกรณ์แตกต่างจากเซิร์ฟเวอร์'],
  '接続が時間内に完了しませんでした': ['The connection timed out', 'การเชื่อมต่อหมดเวลา'],
  'Googleログインを読み込めませんでした': ['Google sign-in could not be loaded', 'ไม่สามารถโหลดการเข้าสู่ระบบ Google ได้'],
  '取得した情報を確認できませんでした': ['The response could not be verified', 'ไม่สามารถตรวจสอบข้อมูลที่ได้รับ'],
  'もう一度ログインすると再確認できます。': ['Sign in again to retry.', 'เข้าสู่ระบบอีกครั้งเพื่อลองใหม่'],
  '予約確定': ['Confirmed', 'ยืนยันแล้ว'], '確認待ち': ['Awaiting confirmation', 'รอการยืนยัน'],
  '取消済み': ['Cancelled', 'ยกเลิกแล้ว'], '来店済み': ['Visited', 'เข้าใช้บริการแล้ว'],
  'お客様': ['Customer', 'ลูกค้า'], 'スタッフ': ['Staff', 'พนักงาน'], '自動応答': ['Automated reply', 'ตอบกลับอัตโนมัติ'],
};
const STYLES = `.test-view{display:grid;gap:22px;min-width:0}.test-view .panel{margin:0}.test-view-status{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.test-view-status .badge{white-space:normal}.test-view-muted{color:var(--muted,#667b70);font-size:.9rem;line-height:1.7}.test-view-account{font-weight:650;overflow-wrap:anywhere}.test-view-error{padding:14px 17px;background:#fff1ed;color:#88372c;border:1px solid #e6b6ab;border-radius:14px}.test-view-error[hidden],.test-view [hidden]{display:none!important}.test-view-data{display:grid;gap:22px;min-width:0}.test-view-record{padding:16px 0;border-bottom:1px solid #e4eadf;overflow-wrap:anywhere}.test-view-record:last-child{border:0}.test-view-record strong{display:block}.test-view-record p{margin:6px 0 0}.test-view-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:22px}.test-view-grid-single{grid-template-columns:minmax(0,1fr)}.test-view-customer-list{display:flex;flex-wrap:wrap;gap:10px}.test-view-summary{white-space:pre-wrap;overflow-wrap:anywhere}.test-view-operations>div>section{border:1px solid #dde7d9;border-radius:16px;margin:12px 0;padding:0 18px;background:#fffefa}.test-view-operations details>summary{padding:17px 0;font-weight:700;cursor:pointer;overflow-wrap:anywhere}.test-view-operations details>.form-grid{padding:2px 0 20px}.test-view-operations .form-grid>p{grid-column:1/-1}.test-view-operations .field input[type=checkbox]{width:22px;height:22px;align-self:flex-start}.test-view-operations>p,.test-view-operations pre{white-space:pre-wrap;overflow-wrap:anywhere}.test-view-operations>section:not(:empty){border:2px solid #d8bf86;background:#fff9e9;border-radius:18px;padding:22px;margin-top:20px}.test-view-operations>section button{margin:8px 10px 0 0}.test-view-operations pre{font:inherit;background:#fffefa;padding:12px;border-radius:10px}.test-view-google{margin-top:18px;min-height:0;overflow:auto}@media(max-width:720px){.test-view-grid{grid-template-columns:minmax(0,1fr)}.test-view .button-row>.btn{flex:1 1 40%}.test-view-operations .form-grid{grid-template-columns:minmax(0,1fr)}.test-view-operations .form-grid>button{width:100%}.test-view-operations>section:not(:empty){padding:16px}}`;
let googleLoad;
function loadGoogle(doc, win) {
  if (win.google?.accounts?.id) return Promise.resolve(win.google);
  if (googleLoad) return googleLoad;
  googleLoad = new Promise((resolve, reject) => {
    const script = doc.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true;
    const timer = win.setTimeout(() => { script.remove(); googleLoad = null; reject(new Error('google_unavailable')); }, 15000);
    script.onload = () => { win.clearTimeout(timer); if (win.google?.accounts?.id) resolve(win.google); else { googleLoad = null; reject(new Error('google_unavailable')); } };
    script.onerror = () => { win.clearTimeout(timer); script.remove(); googleLoad = null; reject(new Error('google_unavailable')); };
    doc.head.append(script);
  });
  return googleLoad;
}

export function mountLiveTest(root, { t = value => value, locale = 'ja', onStatus = () => {}, connection = null, section = 'all' } = {}) {
  if (!['all', 'bookings', 'customers', 'messages', 'crm', 'connection'].includes(section)) throw new Error('invalid_section');
  const show = value => section === 'all' || section === value;
  const doc = root.ownerDocument, win = doc.defaultView || window;
  const lang = ['ja', 'en', 'th'].includes(locale) ? locale : 'ja';
  const tx = value => { const translated = t(value); return translated !== value ? translated : COPY[value]?.[lang === 'th' ? 1 : 0] && lang !== 'ja' ? COPY[value][lang === 'th' ? 1 : 0] : value; };
  const node = (tag, value = '', cls = '') => { const element = doc.createElement(tag); if (value) element.textContent = value; if (cls) element.className = cls; return element; };
  const button = (label, cls = 'secondary') => { const element = node('button', tx(label), `btn ${cls}`); element.type = 'button'; return element; };
  const panel = heading => { const element = node('section', '', 'panel'); element.append(node('h2', tx(heading))); return element; };
  const allowedOrigin = win.location.origin === PAGE_ORIGIN;
  const client = connection || createTestClient({ apiOrigin: API_ORIGIN, clientId: GOOGLE_CLIENT_ID });
  let retainConnection = false;
  let disposed = false, uiEpoch = 0, busy = false, selecting = false, selectedId = '', selectedName = '', verificationEpoch = 0, verifying = false;
  let unmountOperations = null, scoped = null, operationsObserver = null, displayedStatus = 'ready';
  let latest = client.snapshot();
  const container = node('div', '', 'test-view'), style = node('style', STYLES);
  const auth = panel('実TEST管理'), status = node('p', '', 'test-view-status'), badge = node('span', '', 'badge mint');
  badge.setAttribute('role', 'status'); badge.setAttribute('aria-live', 'polite'); status.append(badge);
  const account = node('p', tx('Googleアカウントで確認'), 'test-view-account');
  const accountLabel = node('p', tx('登録済みアカウントのみ'), 'test-view-muted');
  const actions = node('div', '', 'button-row'), login = button('Googleでログイン', 'primary'), refresh = button('最新の情報に更新'), logout = button('ログアウト');
  actions.append(login, refresh, logout);
  const googleButton = node('div', '', 'test-view-google'), errors = node('p', '', 'test-view-error');
  errors.hidden = true; errors.setAttribute('role', 'alert');
  const details = node('p', tx('登録済みTESTデータだけを表示します。会話は保存済み要約、予約は保存記録です。'), 'test-view-muted');
  const leave = node('p', tx('デモに戻るとログアウトし、表示したTESTデータを消去します。'), 'test-view-muted');
  const connectionDetails = node('details'), verify = button('停止中の接続設定を確認'), verificationResult = node('p', '', 'test-view-muted');
  verificationResult.setAttribute('role', 'status');
  connectionDetails.append(node('summary', tx('接続の詳細')), node('p', tx('更新機能を停止中のときだけ確認できます。'), 'test-view-muted'), verify, verificationResult);
  const dataRoot = node('div', '', 'test-view-data');
  auth.append(status, accountLabel, account, actions, googleButton, errors, details, leave);
  if (show('connection')) auth.append(connectionDetails);
  container.append(style, auth, dataRoot); root.replaceChildren(container);
  container.addEventListener('input', event => {
    const form = event.target.closest('.test-view-operations form');
    if (form) { form.dataset.dirty = 'true'; controls(); }
  });

  const reportStatus = state => {
    try { onStatus({ status: state.status, connected: state.status === 'connected', authenticated: ['authenticated', 'connected'].includes(state.status) }); } catch { /* UI notification must not retain a failed session. */ }
  };
  const disposeOperations = () => { operationsObserver?.disconnect(); operationsObserver = null; unmountOperations?.(); unmountOperations = null; scoped?.dispose(); scoped = null; };
  const discard = () => { uiEpoch++; verificationEpoch++; verifying = false; verificationResult.textContent = ''; selectedId = ''; selectedName = ''; selecting = false; dataRoot.replaceChildren(); disposeOperations(); };
  const time = value => {
    const date = new Date(value);
    return Number.isFinite(+date) ? new Intl.DateTimeFormat(lang === 'ja' ? 'ja-JP' : lang === 'th' ? 'th-TH' : 'en-GB', {
      timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(date) : '—';
  };
  const errorMessage = error => {
    const code = error?.message || latest.error;
    const key = ({ session_clock_ahead: '端末とサーバーの時刻に差があります', session_expired: 'ログインをやり直してください', unauthorized: 'ログインをやり直してください',
      invalid_response: '取得した情報を確認できませんでした', google_unavailable: 'Googleログインを読み込めませんでした', TimeoutError: '接続が時間内に完了しませんでした',
      not_connected: '接続を確認できませんでした' })[code] || '接続を確認できませんでした';
    errors.textContent = `${tx(key)}。${tx('もう一度ログインすると再確認できます。')}`; errors.hidden = false;
  };
  function controls() {
    const authenticated = client.isAuthenticated();
    connectionDetails.hidden = latest.principal?.role === 'participant';
    verify.disabled = !authenticated || latest.principal?.role === 'participant' || busy || verifying;
    login.disabled = !allowedOrigin || !client.configured || busy || latest.status === 'signing_in' || authenticated;
    refresh.disabled = !authenticated || busy || selecting || !!unmountOperations?.hasUnsavedChanges?.() || !!unmountOperations?.isBusy?.();
    logout.disabled = !!unmountOperations?.isBusy?.() || (['ready', 'not_connected'].includes(latest.status) && !busy);
    dataRoot.querySelectorAll('[data-test-customer]').forEach(element => { element.disabled = busy || selecting; });
  }
  function enhanceOperations(operationsRoot) {
    for (const element of operationsRoot.querySelectorAll('button')) element.classList.add('btn');
    for (const section of operationsRoot.querySelectorAll(':scope > div > section')) {
      if (section.dataset.enhanced) continue;
      const heading = section.querySelector('h3');
      if (!heading) continue;
      section.dataset.enhanced = 'true';
      const disclosure = node('details'), summary = node('summary', heading.textContent);
      heading.remove(); disclosure.append(summary, ...Array.from(section.childNodes)); section.replaceChildren(disclosure);
    }
    for (const element of operationsRoot.querySelectorAll('button, label, summary, h3, h4')) {
      const kind = ['SUMMARY', 'H3'].includes(element.tagName.toUpperCase()) ? 'heading' : 'static';
      for (const child of element.childNodes) if (child.nodeType === 3) {
        const translated = translateOperationText(child.nodeValue, tx, kind);
        if (translated !== child.nodeValue) child.nodeValue = translated;
      }
    }
    // Only the status/review paragraphs are system text. Form values and dynamic
    // customer/service option labels are deliberately outside these selectors.
    for (const element of operationsRoot.querySelectorAll(':scope > p, :scope > section > p, select[name="language"] > option, select > option[value=""]')) {
      const translated = translateOperationText(element.textContent, tx);
      if (translated !== element.textContent) element.textContent = translated;
    }
    for (const element of operationsRoot.querySelectorAll(':scope > section > pre')) {
      const translated = translateOperationText(element.textContent, tx, 'preview');
      if (translated !== element.textContent) element.textContent = translated;
    }
  }
  function mountOperations() {
    const operationsSection = panel(({bookings:'予約の操作',customers:'顧客の編集',crm:'CRM下書き・送信候補'})[section] || '予約・顧客・フォローの操作');
    operationsSection.append(node('p', tx('操作できる対象だけ表示します。変更前に内容を確認できます。'), 'test-view-muted'));
    const operationsRoot = node('div', '', 'test-view-operations'); operationsSection.append(operationsRoot); dataRoot.append(operationsSection);
    scoped = createScopedOperationsClient(client);
    unmountOperations = mountOperationsPanel(operationsRoot, scoped, { section });
    enhanceOperations(operationsRoot);
    if (win.MutationObserver) { operationsObserver = new win.MutationObserver(() => { enhanceOperations(operationsRoot); controls(); }); operationsObserver.observe(operationsRoot, { childList: true, subtree: true }); }
  }
  function renderData(state) {
    if (section === 'connection') { dataRoot.replaceChildren(); return; }
    // Keep the operations panel alive while a conversation selection changes.
    const operationsSection = dataRoot.lastElementChild?.querySelector('.test-view-operations') ? dataRoot.lastElementChild : null;
    if (operationsSection) operationsSection.remove();
    dataRoot.replaceChildren();
    const grid = node('div', '', 'test-view-grid'), customers = panel('TEST顧客'), bookings = panel('TEST予約');
    const list = node('div', '', 'test-view-customer-list');
    if (!state.customers.length) list.append(node('p', tx('対象のTEST顧客はありません'), 'test-view-muted'));
    for (const [index, customer] of state.customers.entries()) {
      const choice = button(customer.displayName || `${tx('TEST顧客')} ${index + 1}`, selectedId === customer.id ? 'primary' : 'secondary');
      choice.dataset.testCustomer = customer.id; choice.setAttribute('aria-pressed', String(selectedId === customer.id));
      choice.onclick = async () => {
        if (busy || selecting || disposed) return;
        selectedId = customer.id; selectedName = customer.displayName || `${tx('TEST顧客')} ${index + 1}`;
        selecting = true; errors.hidden = true; const current = uiEpoch; renderData({ ...latest, messages: [] }); controls();
        try { await client.conversation(customer.id); if (current !== uiEpoch || disposed) return; }
        catch (error) { if (current === uiEpoch && !disposed && error.message !== 'stale_response') errorMessage(error); }
        finally { if (current === uiEpoch && !disposed) { selecting = false; renderData(latest); controls(); } }
      };
      list.append(choice);
    }
    customers.append(list);
    if (!state.bookings.length) bookings.append(node('p', tx('対象のTEST予約はありません'), 'test-view-muted'));
    for (const booking of state.bookings) {
      const row = node('article', '', 'test-view-record');
      row.append(node('strong', booking.menu || '—'), node('p', `${time(booking.startsAt)}${booking.endsAt ? ` – ${time(booking.endsAt)}` : ''} · Bangkok`),
        node('p', tx(({ confirmed: '予約確定', pending_staff: '確認待ち', pending: '確認待ち', cancelled: '取消済み', attended: '来店済み' })[booking.status] || booking.status || '—'), 'test-view-muted'));
      bookings.append(row);
    }
    if (show('customers') || section === 'messages') grid.append(customers);
    if (show('bookings')) grid.append(bookings);
    if (section !== 'all') grid.classList.add('test-view-grid-single');
    if (grid.children.length) dataRoot.append(grid);
    const conversation = panel('会話の要約');
    if (selectedName) conversation.append(node('p', selectedName, 'test-view-account'));
    if (selecting) conversation.append(node('p', tx('会話を読み込んでいます…'), 'test-view-muted'));
    else if (!selectedId) conversation.append(node('p', tx('顧客を選ぶと、保存済みの要約を確認できます'), 'test-view-muted'));
    else if (!state.messages.length || state.conversationCustomerId !== selectedId) conversation.append(node('p', tx('保存済みの会話要約はありません'), 'test-view-muted'));
    else for (const message of state.messages) {
      const row = node('article', '', 'test-view-record');
      const role = ({ inbound: 'お客様', customer: 'お客様', outbound: '自動応答', bot: '自動応答', staff: 'スタッフ' })[message.direction] || '';
      row.append(node('small', `${time(message.at)}${role ? ` · ${tx(role)}` : ''}`, 'test-view-muted'), node('p', message.text || '', 'test-view-summary')); conversation.append(row);
    }
    if (show('messages') || section === 'customers') dataRoot.append(conversation);
    if (section === 'messages') {
      dataRoot.append(node('p', tx('保存済みの要約のみ表示します。返信送信はまだ接続していません。'), 'test-view-muted'));
    } else if (state.principal?.role === 'participant' || state.mode === 'test_read_only') {
      if (operationsSection) disposeOperations();
      dataRoot.append(node('p', tx('このアカウントは閲覧のみです'), 'test-view-muted'));
    } else if (operationsSection) dataRoot.append(operationsSection); else mountOperations();
  }
  const statusText = { ready: 'ログインしてください', signing_in: 'ログインを準備しています…', authenticated: 'TESTデータを読み込んでいます…', connected: '実TESTデータを取得済み', expired: 'ログイン期限が切れました', error: '接続を確認できませんでした', not_connected: '接続を確認できませんでした' };
  const unsubscribe = client.subscribe(state => {
    if (disposed) return;
    latest = state;
    if (state.status !== 'connected') {
      if (displayedStatus === 'connected' || ['expired', 'error', 'ready'].includes(state.status)) discard();
      if (['expired', 'error', 'ready', 'not_connected'].includes(state.status)) { busy = false; googleButton.replaceChildren(); }
    }
    displayedStatus = state.status;
    const authenticated = client.isAuthenticated();
    accountLabel.textContent = tx(authenticated ? 'ログイン中の役割' : '登録済みアカウントのみ');
    const roleLabel = ({ shared_admin: '共用アカウント・個人の識別なし', owner: 'オーナーアカウント', staff: 'スタッフアカウント', participant: '参加者' })[state.principal?.role] || '共用アカウント・個人の識別なし';
    account.textContent = authenticated ? tx(roleLabel) + (state.mode === 'test_read_only' || state.principal?.role === 'participant' ? ` · ${tx('閲覧のみ')}` : '') : tx('Googleアカウントで確認');
    badge.textContent = tx(allowedOrigin ? statusText[state.status] || statusText.error : 'このローカルプレビューではGoogleログインを利用できません');
    badge.className = `badge ${state.status === 'connected' ? 'mint' : 'muted'}`;
    reportStatus(state);
    if (state.status === 'connected') renderData(state);
    controls();
  });
  login.onclick = async () => {
    if (disposed || busy || !allowedOrigin) return;
    busy = true; errors.hidden = true; googleButton.replaceChildren();
    const challenge = client.beginSignIn(); const current = uiEpoch; controls();
    try {
      const config = await challenge;
      if (current !== uiEpoch || disposed) return;
      const google = await loadGoogle(doc, win);
      if (current !== uiEpoch || disposed) return;
      google.accounts.id.initialize({ client_id: config.clientId, nonce: config.nonce, auto_select: false, cancel_on_tap_outside: true,
        callback: async response => {
          if (current !== uiEpoch || disposed) return;
          badge.textContent = tx('認証を確認しています…'); busy = true; controls();
          try {
            await client.completeSignIn(response.credential);
            if (current !== uiEpoch || disposed) return;
            googleButton.replaceChildren(); await client.refresh();
          } catch (error) { if (!disposed && (current === uiEpoch || latest.status === 'error') && error.message !== 'stale_response') errorMessage(error); }
          finally { if (!disposed && current === uiEpoch) { busy = false; controls(); } }
        },
      });
      google.accounts.id.renderButton(googleButton, { type: 'standard', text: 'signin_with', theme: 'outline', size: 'large', locale: lang });
      badge.textContent = tx('Googleのボタンからログインしてください');
    } catch (error) { if (!disposed && (current === uiEpoch || latest.status === 'error') && error.message !== 'stale_response') errorMessage(error); }
    finally { if (!disposed && current === uiEpoch) { busy = false; controls(); } }
  };
  refresh.onclick = async () => {
    if (disposed || busy || selecting || unmountOperations?.hasUnsavedChanges?.() || unmountOperations?.isBusy?.() || !client.isAuthenticated()) return;
    busy = true; errors.hidden = true; controls(); const current = uiEpoch;
    try { await client.refresh(); }
    catch (error) { if (!disposed && error.message !== 'stale_response') errorMessage(error); }
    finally { if (current === uiEpoch && !disposed) { busy = false; selectedId = ''; selectedName = ''; if (latest.status === 'connected') renderData(latest); controls(); } }
  };
  verify.onclick = async () => {
    if (disposed || busy || verifying || latest.principal?.role === 'participant' || !client.isAuthenticated()) return;
    const current = ++verificationEpoch; verifying = true; controls();
    verificationResult.textContent = tx('接続設定を確認しています…');
    try {
      const result = await client.operations('verify');
      if (disposed || current !== verificationEpoch) return;
      if (result.readOnly !== true || result.writeSignatureVerified !== true || result.writeKeyFormatValid !== true
        || result.updatesDisabled !== true || !Number.isInteger(result.allowedCustomerCount)) throw new Error('invalid_response');
      verificationResult.textContent = tx('接続設定を確認しました。更新機能は停止中です。');
    } catch (error) {
      if (!disposed && current === verificationEpoch) verificationResult.textContent = tx(error.message === 'verification_requires_stopped'
        ? '更新機能を停止中のときだけ確認できます。' : '接続設定を確認できませんでした。');
    } finally { if (!disposed && current === verificationEpoch) { verifying = false; controls(); } }
  };
  logout.onclick = () => {
    if (unmountOperations?.isBusy?.()) return;
    discard(); errors.hidden = true; googleButton.replaceChildren();
    try { win.google?.accounts?.id?.cancel(); win.google?.accounts?.id?.disableAutoSelect(); } catch { /* No automatic sign-in is used. */ }
    void client.logout();
  };
  const expiryTimer = win.setInterval(() => { if (!disposed) { client.snapshot(); controls(); } }, 1000);
  const cleanup = () => {
    if (disposed) return;
    disposed = true; discard(); unsubscribe(); win.clearInterval(expiryTimer);
    try { win.google?.accounts?.id?.cancel(); } catch { /* The local session is still cleared. */ }
    if (retainConnection) client.cancelConversation?.(); else void client.logout(); root.replaceChildren();
    reportStatus({ status: 'ready' });
  };
  // Re-rendering labels on this same route may retain its in-memory session.
  // Navigation away still uses ordinary cleanup and always logs out.
  cleanup.isBusy = () => !disposed && (busy || selecting || verifying || !!unmountOperations?.isBusy?.());
  cleanup.hasUnsavedChanges = () => !disposed && (Array.from(container.querySelectorAll('form')).some(form => form.dataset.dirty === 'true')
    || container.querySelectorAll('.test-view-operations pre').length > 0 || !!unmountOperations?.hasUnsavedChanges?.());
  cleanup.retainConnection = () => {
    retainConnection = !disposed && client.isAuthenticated();
    return retainConnection ? client : null;
  };
  return cleanup;
}
