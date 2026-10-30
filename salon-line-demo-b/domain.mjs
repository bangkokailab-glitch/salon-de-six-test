// Synthetic, browser-local business rules. This module has no network or storage access.
import {createApprovedFaq} from './faq-data.mjs';
export const CRM_KINDS = Object.freeze([
  'reminder_day_before', 'reminder_day_of', 'reminder_hours_before',
  'thank_you_after_visit', 'followup_days_after_visit', 'birthday',
  'interest_campaign', 'visit_segment_campaign',
]);

const LOCALES = ['ja', 'en', 'th'];
const BOOKING_STATES = ['pending', 'confirmed', 'attended', 'cancelled'];
const ACTIVE = ['confirmed', 'attended'];
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const LOCAL_TIME = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const text = value => typeof value === 'string';
const bool = value => typeof value === 'boolean';
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const minute = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
const fail = code => { throw new Error(code); };
const unique = values => new Set(values).size === values.length;
const stringList = value => Array.isArray(value) && value.every(text) && unique(value);
const validId = value => text(value) && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,100}$/.test(value)
  && !['__proto__', 'constructor', 'prototype'].includes(value);
const get = (rows, id, code = 'NOT_FOUND') => rows.find(row => row.id === id) || fail(code);
const same = (a, b) => canonical(a) === canonical(b);
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (plain(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
export function validDay(value) {
  return text(value) && DAY.test(value) && value >= '1900-01-01' && value <= '9999-12-31'
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
function validBirthday(value, today) {
  if (value === '') return true;
  if (/^\d{2}-\d{2}$/.test(value)) return validDay(`2000-${value}`);
  return validDay(value) && value <= today;
}
const addDays = (day, count) => new Date(Date.parse(`${day}T00:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
const shiftMinutes = (day, time, count) => new Date(Date.parse(`${day}T${time}:00Z`) + count * 60000).toISOString().slice(0, 16);
const localISO = value => new Date(Date.parse(value) + 7 * 3600000).toISOString().slice(0, 16);
function assertLocal(value) {
  if (!text(value) || !LOCAL_TIME.test(value) || !validDay(value.slice(0, 10))) fail('INVALID_LOCAL_TIME');
}
function safeContent(value) {
  let serialized;
  try { serialized = JSON.stringify(value); } catch { return false; }
  return !!serialized && !/\bU[0-9a-f]{32}\b|@\d{3}[a-z0-9]{4,}|google_event_id|calendarId|access_token|refresh_token|client_secret|lineUserId/i.test(serialized);
}
function only(p, fields) {
  if (!plain(p) || Object.keys(p).some(key => !fields.includes(key)) || !safeContent(p)) fail('INVALID_PAYLOAD');
}
function requiredText(value, code = 'INVALID_TEXT', max = 500) {
  if (!text(value) || !value.trim() || value.length > max) fail(code);
  return value.trim();
}
const optionalText = (value, max = 4000) => {
  if (!text(value) || value.length > max) fail('INVALID_TEXT');
  return value.trim();
};
function checkTime(value) { if (!text(value) || !TIME.test(value)) fail('INVALID_TIME'); return value; }
function checkDay(value) { if (!validDay(value)) fail('INVALID_DATE'); return value; }
function checkBool(value) { if (!bool(value)) fail('INVALID_BOOLEAN'); return value; }
function checkInt(value, min, max) { if (!integer(value, min, max)) fail('INVALID_NUMBER'); return value; }
function validLocalImage(value) {
  if (value === undefined || value === '') return true;
  if (!text(value)) return false;
  const match = /^data:image\/(png|jpeg|webp);base64,((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/.exec(value);
  if (!match || !match[2]) return false;
  const [, type, encoded] = match;
  const size = encoded.length / 4 * 3 - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
  if (size > 500 * 1024) return false;
  try {
    const signature = atob(encoded.slice(0, 24));
    return type === 'png' ? signature.startsWith('\x89PNG\r\n\x1a\n')
      : type === 'jpeg' ? signature.startsWith('\xff\xd8\xff')
        : signature.startsWith('RIFF') && signature.slice(8, 12) === 'WEBP';
  } catch { return false; }
}

export function seedDemo({ today = '2026-10-30' } = {}) {
  checkDay(today);
  const person = (id, name, locale, extra = {}) => ({ id, name, displayName: name, locale,
    birthday: '', birthdayConsent: false, interests: [], botPaused: false, optedOut: false,
    memo: '', handoffStatus: 'none', unread: 0, chat: [], ...extra });
  const rule = (id, label, kind, ja, en, th, extra = {}) => ({ id, label, kind, enabled: false,
    time: '10:00', days: 0, offsetMinutes: 60, menuId: '', interest: '',
    text: ja, textEn: en, textTh: th, sendDate: addDays(today, 1), version: 1, ...extra });
  return {
    version: 3, synthetic: true, today, revision: 0, nextId: 100, _operations: {},
    customers: [
      person('D-A', 'デモ顧客 A', 'ja', { unread: 1, handoffStatus: 'open', botPaused: true,
        chat: [{ id: 'CHAT-A', from: 'customer', text: 'ケア A の予約をお願いします。', at: `${today}T08:00:00+07:00`, status: 'received' }] }),
      person('D-B', 'デモ顧客 B', 'en', { interests: ['ケア A'],
        chat: [{ id: 'CHAT-B', from: 'customer', text: 'Thank you. See you soon!', at: `${today}T08:15:00+07:00`, status: 'received' }] }),
      person('D-C', 'デモ顧客 C', 'th', { birthday: today.slice(5), birthdayConsent: true,
        memo: '架空の来店履歴があります。',
        chat: [{ id: 'CHAT-C', from: 'customer', text: 'ขอบคุณค่ะ', at: `${today}T08:30:00+07:00`, status: 'received' }] }),
      person('D-D', 'デモ顧客 D', 'ja', { interests: ['ケア B'] }),
    ],
    menus: [
      { id: 'care-a', name: 'ケア A', nameEn: 'Care A', nameTh: 'แคร์ A', description: '操作確認用の架空メニュー', descriptionEn: 'A fictional service for trying the demo', descriptionTh: 'บริการจำลองสำหรับทดลองใช้งาน', duration: 60, cleanup: 5, resource: 'room-a', verified: true, enabled: true, price: '' },
      { id: 'care-b', name: 'ケア B', nameEn: 'Care B', nameTh: 'แคร์ B', description: '設備・所要時間の確認前', descriptionEn: 'Equipment and duration await confirmation', descriptionTh: 'รอยืนยันอุปกรณ์และระยะเวลา', duration: 90, cleanup: 5, resource: 'room-b', verified: false, enabled: true, price: '' },
    ],
    bookings: [
      { id: 'DEMO-B1', customerId: 'D-B', menuId: 'care-a', day: today, time: '11:00', status: 'confirmed', performedMenuIds: [], notes: '' },
      { id: 'DEMO-B2', customerId: 'D-C', menuId: 'care-a', day: addDays(today, -7), time: '14:00', status: 'attended', performedMenuIds: ['care-a'], notes: '架空の施術記録' },
      { id: 'DEMO-B3', customerId: 'D-A', menuId: 'care-a', day: today, time: '15:00', status: 'pending', performedMenuIds: [], notes: '' },
    ],
    rules: [
      rule('day-before', '来店前日', 'reminder_day_before', '明日はご予約日です。', 'Your appointment is tomorrow.', 'พรุ่งนี้เป็นวันนัดหมายของคุณ', { days: 1 }),
      rule('day-of', '来店当日', 'reminder_day_of', '本日はご予約日です。', 'Your appointment is today.', 'วันนี้เป็นวันนัดหมายของคุณ', { time: '09:00' }),
      rule('one-hour', '来店1時間前', 'reminder_hours_before', 'ご予約まであと1時間です。', 'Your appointment is in one hour.', 'อีกหนึ่งชั่วโมงจะถึงเวลานัดหมาย', { time: '' }),
      rule('thanks', '来店後のお礼', 'thank_you_after_visit', '本日はご来店ありがとうございました。', 'Thank you for visiting today.', 'ขอบคุณที่มาใช้บริการวันนี้', { time: '18:00' }),
      rule('followup', '次回予約のご案内', 'followup_days_after_visit', '次回のご予約はいかがでしょうか。', 'Would you like to book your next visit?', 'ต้องการจองครั้งถัดไปหรือไม่', { time: '11:00', days: 7 }),
      rule('birthday', '誕生日', 'birthday', 'お誕生日おめでとうございます。', 'Happy birthday!', 'สุขสันต์วันเกิด'),
      rule('interest-care-a', '興味のあるメニュー', 'interest_campaign', 'ご興味のあるケア A のご案内です。', 'Information about Care A.', 'ข้อมูลเกี่ยวกับแคร์ A', { interest: 'ケア A' }),
      rule('performed-care-a', '施術を受けた方', 'visit_segment_campaign', 'ケア A を受けた方へのご案内です。', 'Information for guests who received Care A.', 'ข้อมูลสำหรับผู้ที่ใช้บริการแคร์ A', { menuId: 'care-a' }),
    ],
    questions: [{ id: 'Q-1', customerId: 'D-A', question: 'ケア A の空きはありますか？', answer: '', locale: 'ja', status: 'unanswered', at: `${today}T08:00:00+07:00`, reason: 'FAQ未登録' }],
    faq: createApprovedFaq(),
    campaigns: [], coupons: [], jobs: [],
    richMenu: { title: 'メニューを開く', image: '', visible: true, areas: [
      { id: 'booking', label: '予約', action: 'booking', enabled: true },
      { id: 'menus', label: 'メニュー・料金', action: 'menus', enabled: true },
      { id: 'campaigns', label: 'キャンペーン・クーポン', action: 'campaigns', enabled: true },
    ] },
    settings: { open: '10:00', close: '20:00', lastStart: '19:00', staffWeekday: 3, staffWeekend: 4,
      closedDates: [], holidayDates: [], resources: [{ id: 'room-a', name: '設備 A', capacity: 1, enabled: true }, { id: 'room-b', name: '設備 B', capacity: 1, enabled: true }] },
    audit: [{ at: `${today}T09:00:00+07:00`, type: 'seed', text: '架空データを用意しました。', revision: 0 }],
  };
}

export function customerSegment(state, id) {
  const bookings = state.bookings.filter(row => row.customerId === id);
  if (bookings.some(row => row.status === 'attended')) return '来店済み';
  if (bookings.some(row => ['confirmed', 'pending'].includes(row.status))) return '初回来店前の予約あり';
  if (bookings.some(row => row.status === 'cancelled')) return '取消履歴あり・予約なし';
  return 'LINE登録のみ';
}

const REASONS = {
  INVALID_DATE: '日付を確認してください', INVALID_TIME: '時刻を確認してください',
  CUSTOMER_NOT_FOUND: '顧客を選んでください', MENU_UNAVAILABLE: '設備・所要時間の確認が必要です',
  RESOURCE_UNAVAILABLE: '利用できる設備がありません', CLOSED: '休業日です',
  OUTSIDE_HOURS: '営業時間外です', PAST_BOOKING: '過去の日時は選べません',
  CUSTOMER_CONFLICT: 'このお客様の予約と重なります', RESOURCE_CONFLICT: '同じ設備の予約と重なります',
  STAFF_CAPACITY: 'この時間のスタッフ枠が埋まっています', INVALID_BOOKING_STATE: 'この予約は変更できません',
};
export function canConfirmDemo(state, booking) {
  const denied = code => ({ ok: false, code, reason: REASONS[code] || code });
  if (!booking || !validDay(booking.day)) return denied('INVALID_DATE');
  if (!text(booking.time) || !TIME.test(booking.time)) return denied('INVALID_TIME');
  if (!state.customers.some(c => c.id === booking.customerId)) return denied('CUSTOMER_NOT_FOUND');
  if (booking.status && !['pending', 'confirmed'].includes(booking.status)) return denied('INVALID_BOOKING_STATE');
  const menu = state.menus.find(row => row.id === booking.menuId);
  if (!menu?.verified || menu.enabled === false || !integer(menu.duration, 1, 480) || !integer(menu.cleanup, 0, 120)) return denied('MENU_UNAVAILABLE');
  const resource = state.settings.resources?.find(row => row.id === menu.resource && row.enabled !== false);
  if (!resource || !integer(resource.capacity, 1, 100)) return denied('RESOURCE_UNAVAILABLE');
  if (booking.day < state.today) return denied('PAST_BOOKING');
  if (state.settings.closedDates.includes(booking.day)) return denied('CLOSED');
  const start = minute(booking.time), end = start + menu.duration + menu.cleanup;
  if (start < minute(state.settings.open) || start > minute(state.settings.lastStart) || end > minute(state.settings.close)) return denied('OUTSIDE_HOURS');
  const overlaps = state.bookings.filter(other => other.id !== booking.id && other.day === booking.day && ACTIVE.includes(other.status))
    .map(other => ({ ...other, menu: state.menus.find(row => row.id === other.menuId) }))
    .filter(other => other.menu && start < minute(other.time) + other.menu.duration + other.menu.cleanup && minute(other.time) < end);
  if (overlaps.some(other => other.customerId === booking.customerId)) return denied('CUSTOMER_CONFLICT');
  // Count peak concurrent use, not the sum of non-overlapping appointments in the interval.
  const events = [[start, 1, menu.resource], [end, -1, menu.resource]];
  for (const other of overlaps) events.push([Math.max(start, minute(other.time)), 1, other.menu.resource], [Math.min(end, minute(other.time) + other.menu.duration + other.menu.cleanup), -1, other.menu.resource]);
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const dow = new Date(`${booking.day}T00:00:00Z`).getUTCDay();
  const staff = [0, 6].includes(dow) || state.settings.holidayDates?.includes(booking.day) ? state.settings.staffWeekend : state.settings.staffWeekday;
  let total = 0, equipment = 0;
  for (const [, delta, resourceId] of events) {
    total += delta;
    if (resourceId === menu.resource) equipment += delta;
    if (equipment > resource.capacity) return denied('RESOURCE_CONFLICT');
    if (total > staff) return denied('STAFF_CAPACITY');
  }
  return { ok: true };
}

const CRM_REASONS = {
  OPTED_OUT: '配信停止中', BOT_PAUSED: 'スタッフ対応中', BIRTHDAY_CONSENT: '誕生日配信の同意なし',
  BIRTHDAY_MISSING: '誕生日未登録', NO_CONFIRMED_BOOKING: '確定した予約なし',
  NO_ATTENDED_VISIT: '来店済みの記録なし', NO_PERFORMED_MENU: '対象施術の実施記録なし',
  NO_INTEREST: '対象の興味タグなし', FUTURE_BOOKING: '次の予約あり', NOT_DUE: '配信予定時刻ではありません',
  MISSING_TRANSLATION: '顧客の言語の本文が未入力', JOB_EXISTS: 'この内容のプレビューは作成済み',
};
function renderText(template, customer, booking, state) {
  const menu = state.menus.find(row => row.id === booking?.menuId);
  const values = { name: customer.displayName || customer.name, date: booking?.day || '', time: booking?.time || '',
    menu: customer.locale === 'en' ? menu?.nameEn || menu?.name || '' : customer.locale === 'th' ? menu?.nameTh || menu?.name || '' : menu?.name || '' };
  return template.replace(/\{(?:name|date|time|menu)\}/g, match => values[match.slice(1, -1)]);
}
export function simulateCrm(state, atLocal) {
  assertLocal(atLocal);
  const atDay = atLocal.slice(0, 10), atTime = atLocal.slice(11);
  const candidates = [], excluded = [];
  for (const rule of state.rules.filter(row => row.enabled)) for (const customer of state.customers) {
    const base = { ruleId: rule.id, customerId: customer.id, customer: customer.displayName || customer.name,
      label: rule.label, locale: customer.locale, scheduledAt: atLocal };
    const exclude = code => excluded.push({ ...base, code, reason: CRM_REASONS[code] || code });
    if (customer.optedOut) { exclude('OPTED_OUT'); continue; }
    if (customer.botPaused) { exclude('BOT_PAUSED'); continue; }
    const rows = state.bookings.filter(row => row.customerId === customer.id);
    const active = rows.filter(row => row.status === 'confirmed');
    const attended = rows.filter(row => row.status === 'attended');
    let matched = [], code = 'NOT_DUE';
    if (rule.kind === 'reminder_day_before') {
      matched = active.filter(row => `${addDays(row.day, -1)}T${rule.time}` === atLocal);
      if (!active.length) code = 'NO_CONFIRMED_BOOKING';
    } else if (rule.kind === 'reminder_day_of') {
      matched = active.filter(row => row.day === atDay && rule.time === atTime && rule.time <= row.time);
      if (!active.length) code = 'NO_CONFIRMED_BOOKING';
    } else if (rule.kind === 'reminder_hours_before') {
      matched = active.filter(row => shiftMinutes(row.day, row.time, -rule.offsetMinutes) === atLocal);
      if (!active.length) code = 'NO_CONFIRMED_BOOKING';
    } else if (rule.kind === 'thank_you_after_visit') {
      matched = attended.filter(row => `${row.day}T${rule.time}` === atLocal
        && shiftMinutes(row.day, row.time, state.menus.find(menu => menu.id === row.menuId)?.duration || 0) <= atLocal);
      if (!attended.length) code = 'NO_ATTENDED_VISIT';
    } else if (rule.kind === 'followup_days_after_visit') {
      matched = attended.filter(row => `${addDays(row.day, rule.days)}T${rule.time}` === atLocal);
      if (!attended.length) code = 'NO_ATTENDED_VISIT';
      if (active.some(row => `${row.day}T${row.time}` >= atLocal)) { matched = []; code = 'FUTURE_BOOKING'; }
      // A customer receives one follow-up even if two visits share the same date.
      matched = matched.slice(-1);
    } else if (rule.kind === 'birthday') {
      if (!customer.birthdayConsent) code = 'BIRTHDAY_CONSENT';
      else if (!customer.birthday) code = 'BIRTHDAY_MISSING';
      else if (customer.birthday.slice(-5) === atDay.slice(5) && rule.time === atTime) matched = [null];
    } else if (rule.kind === 'interest_campaign') {
      if (!customer.interests.includes(rule.interest)) code = 'NO_INTEREST';
      else if (rule.sendDate === atDay && rule.time === atTime) matched = [null];
    } else if (rule.kind === 'visit_segment_campaign') {
      if (!attended.some(row => row.performedMenuIds.includes(rule.menuId))) code = 'NO_PERFORMED_MENU';
      else if (rule.sendDate === atDay && rule.time === atTime) matched = [null];
    }
    if (!matched.length) { exclude(code); continue; }
    const template = customer.locale === 'en' ? rule.textEn : customer.locale === 'th' ? rule.textTh : rule.text;
    if (!template?.trim()) { exclude('MISSING_TRANSLATION'); continue; }
    for (const booking of matched) {
      const dedupeKey = `${rule.id}:v${rule.version || 1}:${customer.id}:${booking?.id || 'customer'}:${atLocal}`;
      candidates.push({ ...base, bookingId: booking?.id || '', text: renderText(template, customer, booking, state), dedupeKey });
    }
  }
  return { candidates, excluded };
}

function validResources(rows) {
  return Array.isArray(rows) && unique(rows.map(row => row?.id)) && rows.every(row => plain(row) && validId(row.id)
    && text(row.name) && row.name.trim() && integer(row.capacity, 1, 100) && bool(row.enabled));
}
function validSettings(settings) {
  return plain(settings) && ['open', 'close', 'lastStart'].every(key => text(settings[key]) && TIME.test(settings[key]))
    && settings.open < settings.close && settings.lastStart >= settings.open && settings.lastStart < settings.close
    && integer(settings.staffWeekday, 0, 100) && integer(settings.staffWeekend, 0, 100)
    && stringList(settings.closedDates) && settings.closedDates.every(validDay)
    && (settings.holidayDates === undefined || stringList(settings.holidayDates) && settings.holidayDates.every(validDay))
    && validResources(settings.resources);
}
function validRule(rule, state) {
  return validId(rule.id) && text(rule.label) && !!rule.label.trim() && CRM_KINDS.includes(rule.kind) && bool(rule.enabled)
    && (TIME.test(rule.time) || rule.kind === 'reminder_hours_before' && rule.time === '')
    && integer(rule.days, 0, 3650) && integer(rule.offsetMinutes, 1, 10080)
    && ['text', 'textEn', 'textTh', 'interest', 'menuId'].every(key => text(rule[key]))
    && (!rule.sendDate || validDay(rule.sendDate)) && integer(rule.version, 1, Number.MAX_SAFE_INTEGER)
    && (rule.kind !== 'visit_segment_campaign' || state.menus.some(row => row.id === rule.menuId))
    && (rule.kind !== 'interest_campaign' || !!rule.interest.trim())
    && (!rule.enabled || [rule.text, rule.textEn, rule.textTh].some(value => value.trim()));
}
export function validateState(value) {
  try {
    if (!plain(value) || value.version !== 3 || value.synthetic !== true || !safeContent(value)
      || !validDay(value.today) || !integer(value.revision, 0, Number.MAX_SAFE_INTEGER)
      || !integer(value.nextId, 1, Number.MAX_SAFE_INTEGER) || !plain(value._operations) || !validSettings(value.settings)) return null;
    for (const key of ['customers', 'bookings', 'menus', 'rules', 'questions', 'faq', 'campaigns', 'coupons', 'jobs']) {
      if (!Array.isArray(value[key]) || value[key].length > 10000 || !value[key].every(plain)
        || !value[key].every(row => validId(row.id)) || !unique(value[key].map(row => row.id))) return null;
    }
    if (!value.customers.every(row => text(row.name) && !!row.name.trim() && text(row.displayName)
      && LOCALES.includes(row.locale) && text(row.birthday) && validBirthday(row.birthday, value.today)
      && bool(row.birthdayConsent) && (!row.birthdayConsent || !!row.birthday) && stringList(row.interests)
      && bool(row.botPaused) && bool(row.optedOut) && text(row.memo) && ['none', 'open', 'progress', 'resolved'].includes(row.handoffStatus)
      && integer(row.unread, 0, Number.MAX_SAFE_INTEGER) && Array.isArray(row.chat)
      && row.chat.every(item => plain(item) && validId(item.id) && ['customer', 'staff', 'note'].includes(item.from)
        && text(item.text) && text(item.at) && ['received', 'draft', 'note'].includes(item.status))
      && unique(row.chat.map(item => item.id)))) return null;
    if (!value.menus.every(row => text(row.name) && !!row.name.trim()
      && ['nameEn', 'nameTh', 'description', 'resource'].every(key => text(row[key]))
      && ['descriptionEn', 'descriptionTh'].every(key => row[key] === undefined || text(row[key]))
      && integer(row.duration, 1, 480) && integer(row.cleanup, 0, 120) && bool(row.verified) && bool(row.enabled)
      && (text(row.price) || Number.isFinite(row.price) && row.price >= 0)
      && (!row.verified || value.settings.resources.some(item => item.id === row.resource)))) return null;
    if (!value.bookings.every(row => value.customers.some(c => c.id === row.customerId)
      && value.menus.some(menu => menu.id === row.menuId) && validDay(row.day) && TIME.test(row.time)
      && BOOKING_STATES.includes(row.status) && stringList(row.performedMenuIds) && text(row.notes)
      && row.performedMenuIds.every(id => value.menus.some(menu => menu.id === id))
      && (row.status === 'attended' || row.performedMenuIds.length === 0))) return null;
    if (!value.rules.every(row => validRule(row, value))) return null;
    if (!value.questions.every(row => text(row.question) && !!row.question.trim() && text(row.answer)
      && LOCALES.includes(row.locale) && ['unanswered', 'draft', 'answered'].includes(row.status)
      && (row.at === undefined || text(row.at) && validDay(row.at.slice(0, 10)) && Number.isFinite(Date.parse(row.at)))
      && (row.reason === undefined || text(row.reason))
      && (!row.customerId || value.customers.some(c => c.id === row.customerId)))) return null;
    if (!value.faq.every(row => ['question', 'answer', 'questionEn', 'answerEn', 'questionTh', 'answerTh', 'category'].every(key => text(row[key]))
      && bool(row.published) && (!row.published || !!row.question.trim() && !!row.answer.trim()))) return null;
    for (const key of ['campaigns', 'coupons']) if (!value[key].every(row => text(row.title) && !!row.title.trim()
      && text(row.description) && bool(row.enabled) && (!row.startDate || validDay(row.startDate))
      && ['titleEn', 'titleTh', 'descriptionEn', 'descriptionTh'].every(key => row[key] === undefined || text(row[key]))
      && (!row.expires || validDay(row.expires)) && (!row.startDate || !row.expires || row.startDate <= row.expires)
      && (!row.menuId || value.menus.some(menu => menu.id === row.menuId)))) return null;
    if (!value.jobs.every(row => ['preview', 'paused', 'cancelled'].includes(row.status) && text(row.text) && text(row.dedupeKey)
      && value.rules.some(rule => rule.id === row.ruleId) && value.customers.some(c => c.id === row.customerId)
      && (!row.bookingId || value.bookings.some(booking => booking.id === row.bookingId))
      && LOCAL_TIME.test(row.scheduledAt) && validDay(row.scheduledAt.slice(0, 10)))
      || !unique(value.jobs.map(row => row.dedupeKey))) return null;
    if (!plain(value.richMenu) || !text(value.richMenu.title) || !Array.isArray(value.richMenu.areas)
      || !validLocalImage(value.richMenu.image) || !(value.richMenu.visible === undefined || bool(value.richMenu.visible))
      || !value.richMenu.areas.length || value.richMenu.areas.length > 6
      || !unique(value.richMenu.areas.map(row => row.id)) || !value.richMenu.areas.every(row => plain(row) && validId(row.id)
        && text(row.label) && !!row.label.trim() && ['booking', 'menus', 'campaigns', 'faq', 'messages'].includes(row.action) && bool(row.enabled))) return null;
    if (!Array.isArray(value.audit) || !value.audit.every(row => plain(row) && text(row.at) && text(row.text) && text(row.type)
      && (row.actor === undefined || text(row.actor))
      && ['before', 'after'].every(key => row[key] === undefined || row[key] === null || plain(row[key]) || Array.isArray(row[key]))
      && integer(row.revision, 0, value.revision))) return null;
    if (!Object.entries(value._operations).every(([key, row]) => validId(key) && plain(row)
      && text(row.fingerprint) && plain(row.result) && integer(row.revision, 1, value.revision))) return null;
    return structuredClone(value);
  } catch { return null; }
}

const ACTION_LABELS = {
  'booking.create': '予約希望を作成', 'booking.change': '予約を変更', 'booking.confirm': '予約を確定',
  'booking.cancel': '予約を取消', 'booking.attend': '来店を記録', 'customer.add': '顧客を追加',
  'customer.save': '顧客情報を保存', 'customer.takeover': 'スタッフへ引き継ぎ・自動応答を停止',
  'customer.resolve': 'スタッフ対応を完了', 'customer.resume': '自動応答を再開',
  'message.draft': '返信の下書きを保存', 'message.note': 'スタッフメモを保存',
  'question.save': '質問への回答を保存', 'faq.save': 'FAQを保存', 'faq.publish': 'デモ内のFAQ表示を変更',
  'crm.save': 'フォロー設定を保存', 'crm.previewJob': '無送信プレビューを保存', 'crm.cancelJob': 'プレビューを取消', 'crm.pauseJob': 'プレビューを保留', 'crm.resumeJob': 'プレビューを再開',
  'menu.save': 'メニューを保存', 'campaign.save': 'キャンペーンを保存', 'coupon.save': 'クーポンを保存',
  'settings.save': '店舗設定を保存', 'richmenu.save': 'リッチメニューをデモ内に保存',
};
function cancelJobs(state, predicate, reason) {
  for (const job of state.jobs) if (['preview', 'paused'].includes(job.status) && predicate(job)) { job.status = 'cancelled'; job.cancelReason = reason; }
}
function patchCustomer(row, p, today) {
  for (const key of ['name', 'displayName', 'memo']) if (p[key] !== undefined) row[key] = key === 'name' ? requiredText(p[key]) : optionalText(p[key]);
  if (p.locale !== undefined) { if (!LOCALES.includes(p.locale)) fail('INVALID_LOCALE'); row.locale = p.locale; }
  if (p.birthday !== undefined) { if (!text(p.birthday) || !validBirthday(p.birthday, today)) fail('INVALID_BIRTHDAY'); row.birthday = p.birthday; }
  if (p.birthdayConsent !== undefined) row.birthdayConsent = checkBool(p.birthdayConsent);
  if (!row.birthday && row.birthdayConsent) fail('BIRTHDAY_REQUIRED');
  if (p.interests !== undefined) {
    if (!stringList(p.interests) || p.interests.some(tag => !tag.trim() || tag.length > 100)) fail('INVALID_INTERESTS');
    row.interests = [...p.interests];
  }
  for (const key of ['botPaused', 'optedOut']) if (p[key] !== undefined) row[key] = checkBool(p[key]);
  if (!row.displayName) row.displayName = row.name;
}
function bookingTimeGuard(state, row, now) {
  if (`${row.day}T${row.time}` <= localISO(now)) fail('PAST_BOOKING');
}
function actionSnapshot(state, type, payload, result) {
  if (type === 'settings.save') return structuredClone(state.settings);
  if (type === 'richmenu.save') {
    const snapshot = structuredClone(state.richMenu);
    if (snapshot.image) {
      const [header, encoded] = snapshot.image.split(',');
      snapshot.image = { mimeType: header.slice(5, -7), bytes: encoded.length / 4 * 3 - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0) };
    }
    return snapshot;
  }
  if (type === 'crm.previewJob') return result ? state.jobs.filter(job => result.ids.includes(job.id)).map(row => structuredClone(row)) : [];
  if (type.startsWith('message.')) {
    if (!result) return null;
    const customer = state.customers.find(row => row.id === result.customerId);
    return structuredClone(customer?.chat.find(row => row.id === result.id) || null);
  }
  const collection = type.startsWith('booking.') ? 'bookings' : type.startsWith('customer.') ? 'customers'
    : type.startsWith('question.') ? 'questions' : type.startsWith('faq.') ? 'faq'
      : ['crm.cancelJob','crm.pauseJob','crm.resumeJob'].includes(type) ? 'jobs' : type === 'crm.save' ? 'rules'
        : type.startsWith('menu.') ? 'menus' : type.startsWith('campaign.') ? 'campaigns'
          : type.startsWith('coupon.') ? 'coupons' : null;
  const id = result?.id || payload.id || payload.bookingId || payload.customerId || payload.jobId;
  return collection ? structuredClone(state[collection].find(row => row.id === id) || null) : null;
}
export function applyAction(input, type, payload = {}, options = {}) {
  const state = validateState(input);
  if (!state) fail('INVALID_STATE');
  if (!Object.hasOwn(ACTION_LABELS, type)) fail('UNSUPPORTED_ACTION');
  if (!plain(payload) || !safeContent(payload)) fail('INVALID_PAYLOAD');
  const p = structuredClone(payload);
  const { idempotencyKey, expectedRevision } = options;
  const nowISO = options.nowISO || `${state.today}T09:00:00+07:00`;
  if (!text(nowISO) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(nowISO)
    || !Number.isFinite(Date.parse(nowISO)) || !validDay(nowISO.slice(0, 10))) fail('INVALID_NOW');
  const fingerprint = canonical({ type, payload: p });
  if (idempotencyKey !== undefined) {
    if (!validId(idempotencyKey)) fail('INVALID_IDEMPOTENCY_KEY');
    const previous = Object.hasOwn(state._operations, idempotencyKey) && state._operations[idempotencyKey];
    if (previous) {
      if (previous.fingerprint !== fingerprint) fail('IDEMPOTENCY_CONFLICT');
      return { state, result: { ...structuredClone(previous.result), replayed: true } };
    }
  }
  if (expectedRevision !== undefined && expectedRevision !== state.revision) fail('REVISION_CONFLICT');
  const before = actionSnapshot(state, type, p);
  const newId = prefix => `${prefix}-${state.nextId++}`;
  const entityId = p.id || p.bookingId || p.customerId || p.jobId;
  let result = { status: 'saved' };
  if (type.startsWith('booking.')) {
    if (type === 'booking.create') {
      only(p, ['customerId', 'menuId', 'day', 'time', 'notes', 'status']);
      get(state.customers, p.customerId, 'CUSTOMER_NOT_FOUND'); get(state.menus, p.menuId, 'MENU_NOT_FOUND');
      const row = { id: newId('DEMO-B'), customerId: p.customerId, menuId: p.menuId, day: checkDay(p.day), time: checkTime(p.time),
        status: p.status || 'pending', notes: optionalText(p.notes || ''), performedMenuIds: [] };
      if (!['pending', 'confirmed'].includes(row.status)) fail('INVALID_BOOKING_STATE');
      bookingTimeGuard(state, row, nowISO);
      if (state.bookings.some(other => other.customerId === row.customerId && other.menuId === row.menuId && other.day === row.day && other.time === row.time && other.status !== 'cancelled')) fail('DUPLICATE_BOOKING');
      if (row.status === 'confirmed') { const checked = canConfirmDemo(state, row); if (!checked.ok) fail(checked.code); }
      state.bookings.push(row); result = { id: row.id, status: row.status };
    } else {
      const row = get(state.bookings, entityId, 'BOOKING_NOT_FOUND');
      if (type === 'booking.change') {
        only(p, ['id', 'bookingId', 'day', 'time', 'menuId', 'notes']);
        if (!['pending', 'confirmed'].includes(row.status)) fail('INVALID_BOOKING_STATE');
        bookingTimeGuard(state, row, nowISO);
        const before = structuredClone(row);
        if (p.day !== undefined) row.day = checkDay(p.day);
        if (p.time !== undefined) row.time = checkTime(p.time);
        if (p.menuId !== undefined) { get(state.menus, p.menuId, 'MENU_NOT_FOUND'); row.menuId = p.menuId; }
        if (p.notes !== undefined) row.notes = optionalText(p.notes);
        bookingTimeGuard(state, row, nowISO);
        if (same(before, row)) fail('NO_CHANGE');
        const checked = canConfirmDemo(state, row); if (!checked.ok) fail(checked.code);
      } else if (type === 'booking.confirm') {
        only(p, ['id', 'bookingId']);
        if (row.status !== 'pending') fail('INVALID_BOOKING_STATE');
        bookingTimeGuard(state, row, nowISO);
        const checked = canConfirmDemo(state, row); if (!checked.ok) fail(checked.code);
        row.status = 'confirmed';
      } else if (type === 'booking.cancel') {
        only(p, ['id', 'bookingId', 'notes']);
        if (!['pending', 'confirmed'].includes(row.status)) fail('INVALID_BOOKING_STATE');
        bookingTimeGuard(state, row, nowISO);
        row.status = 'cancelled';
        if (p.notes !== undefined) row.notes = optionalText(p.notes);
      } else if (type === 'booking.attend') {
        only(p, ['id', 'bookingId', 'performedMenuIds', 'notes']);
        if (row.status !== 'confirmed') fail('INVALID_BOOKING_STATE');
        const menu = get(state.menus, row.menuId);
        if (shiftMinutes(row.day, row.time, menu.duration) > localISO(nowISO)) fail('VISIT_NOT_FINISHED');
        const performed = p.performedMenuIds ?? [row.menuId];
        if (!stringList(performed) || !performed.length || !performed.every(id => state.menus.some(menu => menu.id === id))) fail('INVALID_PERFORMED_MENUS');
        row.status = 'attended'; row.performedMenuIds = [...performed];
        if (p.notes !== undefined) row.notes = optionalText(p.notes);
      }
      cancelJobs(state, job => job.bookingId === row.id, '予約内容が変更されました');
      result = { id: row.id, status: row.status };
    }
  } else if (type.startsWith('customer.')) {
    const fields = ['id', 'customerId', 'name', 'displayName', 'locale', 'birthday', 'birthdayConsent', 'interests', 'botPaused', 'optedOut', 'memo'];
    if (type === 'customer.add') {
      only(p, fields.filter(key => !['id', 'customerId'].includes(key)));
      const row = { id: newId('D'), name: requiredText(p.name, 'NAME_REQUIRED'), displayName: p.name, locale: 'ja', birthday: '', birthdayConsent: false,
        interests: [], botPaused: false, optedOut: false, memo: '', handoffStatus: 'none', unread: 0, chat: [] };
      patchCustomer(row, p, state.today); state.customers.push(row); result = { id: row.id, status: 'saved' };
    } else {
      const row = get(state.customers, entityId, 'CUSTOMER_NOT_FOUND');
      if (type === 'customer.save') { only(p, fields); patchCustomer(row, p, state.today); }
      else {
        only(p, ['id', 'customerId']);
        if (type === 'customer.takeover') { row.botPaused = true; row.handoffStatus = 'progress'; }
        if (type === 'customer.resolve') { row.handoffStatus = 'resolved'; row.unread = 0; }
        if (type === 'customer.resume') { row.botPaused = false; }
      }
      cancelJobs(state, job => job.customerId === row.id, '顧客情報・対応状態が変更されました');
      result = { id: row.id, status: row.handoffStatus, botPaused: row.botPaused };
    }
  } else if (type.startsWith('message.')) {
    only(p, ['id', 'customerId', 'text']);
    const row = get(state.customers, entityId, 'CUSTOMER_NOT_FOUND');
    const message = { id: newId('CHAT'), from: type === 'message.note' ? 'note' : 'staff', text: requiredText(p.text, 'MESSAGE_REQUIRED', 5000),
      at: nowISO, status: type === 'message.note' ? 'note' : 'draft' };
    row.chat.push(message); result = { id: message.id, customerId: row.id, status: message.status, sent: false };
  } else if (type === 'question.save') {
    only(p, ['id', 'customerId', 'question', 'answer', 'locale', 'status', 'reason']);
    const row = p.id ? get(state.questions, p.id, 'QUESTION_NOT_FOUND')
      : { id: newId('Q'), customerId: '', question: '', answer: '', locale: 'ja', status: 'unanswered', at: nowISO, reason: 'FAQ未登録' };
    if (p.customerId !== undefined) { if (p.customerId) get(state.customers, p.customerId, 'CUSTOMER_NOT_FOUND'); row.customerId = p.customerId; }
    if (p.question !== undefined) row.question = requiredText(p.question);
    if (p.answer !== undefined) row.answer = optionalText(p.answer);
    if (p.reason !== undefined) row.reason = optionalText(p.reason);
    if (p.locale !== undefined) { if (!LOCALES.includes(p.locale)) fail('INVALID_LOCALE'); row.locale = p.locale; }
    row.status = p.status || (row.answer ? 'draft' : 'unanswered');
    if (!['unanswered', 'draft', 'answered'].includes(row.status) || row.status === 'answered' && !row.answer) fail('INVALID_QUESTION_STATUS');
    if (!row.question) fail('QUESTION_REQUIRED');
    if (!p.id) state.questions.push(row); result = { id: row.id, status: row.status };
  } else if (type.startsWith('faq.')) {
    if (type === 'faq.publish') {
      only(p, ['id', 'published']);
      const row = get(state.faq, p.id, 'FAQ_NOT_FOUND');
      if (!row.question.trim() || !row.answer.trim()) fail('FAQ_INCOMPLETE');
      row.published = p.published === undefined ? true : checkBool(p.published);
      result = { id: row.id, status: row.published ? 'published-local' : 'draft' };
    } else {
      only(p, ['id', 'question', 'answer', 'questionEn', 'answerEn', 'questionTh', 'answerTh', 'category']);
      const row = p.id ? get(state.faq, p.id, 'FAQ_NOT_FOUND')
        : { id: newId('FAQ'), question: '', answer: '', questionEn: '', answerEn: '', questionTh: '', answerTh: '', category: 'その他', published: false };
      for (const key of ['question', 'answer', 'questionEn', 'answerEn', 'questionTh', 'answerTh', 'category']) if (p[key] !== undefined) row[key] = optionalText(p[key]);
      if (!row.question) fail('QUESTION_REQUIRED');
      row.published = false;
      if (!p.id) state.faq.push(row); result = { id: row.id, status: 'draft' };
    }
  } else if (type.startsWith('crm.')) {
    if (type === 'crm.previewJob') {
      only(p, ['atLocal']);
      const simulation = simulateCrm(state, p.atLocal);
      const ids = [];
      for (const candidate of simulation.candidates) {
        if (state.jobs.some(job => job.dedupeKey === candidate.dedupeKey)) continue;
        const job = { ...candidate, id: newId('PREVIEW'), status: 'preview', createdAt: nowISO, sent: false };
        state.jobs.push(job); ids.push(job.id);
      }
      result = { status: 'preview', ids, count: ids.length, candidates: simulation.candidates, excluded: simulation.excluded, sent: false };
    } else if (['crm.cancelJob','crm.pauseJob','crm.resumeJob'].includes(type)) {
      only(p, ['id', 'jobId']); const row = get(state.jobs, entityId, 'JOB_NOT_FOUND');
      if (!['preview','paused'].includes(row.status) || type==='crm.pauseJob'&&row.status!=='preview' || type==='crm.resumeJob'&&row.status!=='paused') fail('INVALID_JOB_STATE');
      row.status = type==='crm.pauseJob'?'paused':type==='crm.resumeJob'?'preview':'cancelled';
      row.cancelReason = type==='crm.cancelJob'?'スタッフが取消しました':''; result = { id: row.id, status: row.status, sent: false };
    } else {
      only(p, ['id', 'label', 'kind', 'enabled', 'time', 'days', 'offsetMinutes', 'menuId', 'interest', 'text', 'textEn', 'textTh', 'sendDate']);
      const row = p.id ? get(state.rules, p.id, 'RULE_NOT_FOUND') : { id: newId('RULE'), label: '', kind: 'reminder_day_before', enabled: false,
        time: '10:00', days: 1, offsetMinutes: 60, menuId: '', interest: '', text: '', textEn: '', textTh: '', sendDate: '', version: 0 };
      for (const key of ['label', 'kind', 'time', 'menuId', 'interest', 'text', 'textEn', 'textTh', 'sendDate']) if (p[key] !== undefined) row[key] = optionalText(p[key]);
      if (p.enabled !== undefined) row.enabled = checkBool(p.enabled);
      if (p.days !== undefined) row.days = checkInt(p.days, 0, 3650);
      if (p.offsetMinutes !== undefined) row.offsetMinutes = checkInt(p.offsetMinutes, 1, 10080);
      row.version += 1;
      if (!validRule(row, state)) fail('INVALID_RULE');
      cancelJobs(state, job => job.ruleId === row.id, 'フォロー設定が変更されました');
      if (!p.id) state.rules.push(row); result = { id: row.id, status: row.enabled ? 'enabled' : 'disabled' };
    }
  } else if (type === 'menu.save') {
    only(p, ['id', 'name', 'nameEn', 'nameTh', 'description', 'descriptionEn', 'descriptionTh', 'duration', 'cleanup', 'resource', 'verified', 'enabled', 'price']);
    const row = p.id ? get(state.menus, p.id, 'MENU_NOT_FOUND') : { id: newId('MENU'), name: '', nameEn: '', nameTh: '', description: '', duration: 60,
      descriptionEn: '', descriptionTh: '', cleanup: 5, resource: '', verified: false, enabled: true, price: '' };
    for (const key of ['name', 'nameEn', 'nameTh', 'description', 'descriptionEn', 'descriptionTh', 'resource']) if (p[key] !== undefined) row[key] = optionalText(p[key]);
    if (!row.name) fail('NAME_REQUIRED');
    if (p.duration !== undefined) row.duration = checkInt(p.duration, 1, 480);
    if (p.cleanup !== undefined) row.cleanup = checkInt(p.cleanup, 0, 120);
    for (const key of ['verified', 'enabled']) if (p[key] !== undefined) row[key] = checkBool(p[key]);
    if (p.price !== undefined) { if (!(text(p.price) || Number.isFinite(p.price) && p.price >= 0)) fail('INVALID_PRICE'); row.price = p.price; }
    if (row.verified && !state.settings.resources.some(resource => resource.id === row.resource && resource.enabled)) fail('RESOURCE_UNAVAILABLE');
    if (!p.id) state.menus.push(row);
    cancelJobs(state, job => job.bookingId && state.bookings.some(booking => booking.id === job.bookingId && booking.menuId === row.id), 'メニューが変更されました');
    result = { id: row.id, status: 'saved' };
  } else if (['campaign.save', 'coupon.save'].includes(type)) {
    only(p, ['id', 'title', 'titleEn', 'titleTh', 'description', 'descriptionEn', 'descriptionTh', 'enabled', 'startDate', 'expires', 'menuId', 'code', 'benefit', 'conditions', 'price']);
    const rows = type === 'campaign.save' ? state.campaigns : state.coupons;
    const row = p.id ? get(rows, p.id) : { id: newId(type === 'campaign.save' ? 'CAMPAIGN' : 'COUPON'), title: '', description: '',
      titleEn: '', titleTh: '', descriptionEn: '', descriptionTh: '', enabled: false, startDate: '', expires: '', menuId: '', code: '', benefit: '', conditions: '' };
    for (const key of ['title', 'titleEn', 'titleTh', 'description', 'descriptionEn', 'descriptionTh', 'startDate', 'expires', 'menuId', 'code', 'benefit', 'conditions', 'price']) if (p[key] !== undefined) row[key] = optionalText(p[key]);
    if (!row.title) fail('NAME_REQUIRED');
    if (row.price && !/^\d+(?:\.\d{1,2})?$/.test(row.price)) fail('INVALID_PRICE');
    if (row.startDate) checkDay(row.startDate);
    if (row.expires) checkDay(row.expires);
    if (row.startDate && row.expires && row.startDate > row.expires) fail('INVALID_DATE_RANGE');
    if (row.menuId) get(state.menus, row.menuId, 'MENU_NOT_FOUND');
    if (p.enabled !== undefined) row.enabled = checkBool(p.enabled);
    if (!p.id) rows.push(row); result = { id: row.id, status: row.enabled ? 'enabled' : 'draft' };
  } else if (type === 'settings.save') {
    only(p, ['open', 'close', 'lastStart', 'staffWeekday', 'staffWeekend', 'closedDates', 'holidayDates', 'resources']);
    const settings = { ...state.settings, ...p };
    if (!validSettings(settings)) fail('INVALID_SETTINGS');
    if (state.menus.some(menu => menu.verified && !settings.resources.some(resource => resource.id === menu.resource))) fail('RESOURCE_IN_USE');
    state.settings = structuredClone(settings); result = { status: 'saved' };
  } else if (type === 'richmenu.save') {
    only(p, ['title', 'areas', 'image', 'visible']);
    if (!validLocalImage(p.image)) fail('INVALID_IMAGE');
    if (p.visible !== undefined) checkBool(p.visible);
    state.richMenu = { ...state.richMenu, ...p }; result = { status: 'saved-local', sent: false };
  }
  state.revision += 1;
  state.audit.unshift({ at: nowISO, type, text: ACTION_LABELS[type], revision: state.revision, entityId: result.id || '',
    actor: 'デモ操作', before, after: actionSnapshot(state, type, p, result) });
  state.audit = state.audit.slice(0, 300);
  if (idempotencyKey) state._operations[idempotencyKey] = { fingerprint, result: structuredClone(result), revision: state.revision };
  if (!validateState(state)) fail('INVALID_RESULT');
  return { state, result };
}
