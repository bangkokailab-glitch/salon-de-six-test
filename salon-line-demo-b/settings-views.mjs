// Pure renderers for the synthetic management views. No storage or network access.
export function renderSettingsView(ctx) {
  const { state, ui, t, e, icon } = ctx;
  const esc = value => e(String(value ?? ''));
  const tr = value => esc(t(value));
  const filters = ui.filters || {};
  const language = ui.locale || ui.language || 'ja';
  const localized = (item, key) => item[`${key}${language === 'en' ? 'En' : language === 'th' ? 'Th' : ''}`] || item[key] || '';
  const symbol = name => typeof icon === 'function' ? icon(name) : '';
  const hiddenId = item => item?.id ? `<input type="hidden" name="id" value="${esc(item.id)}">` : '';
  const selected = (a, b) => String(a ?? '') === String(b ?? '') ? ' selected' : '';
  const badge = (label, color = 'mint') => `<span class="badge ${color}">${tr(label)}</span>`;
  const empty = (label, action = '') => `<div class="empty-state">${symbol('sparkles')}<p>${tr(label)}</p>${action}</div>`;
  const nav = (view, label, kind = 'secondary') => `<button type="button" class="btn ${kind}" data-nav="${esc(view)}">${tr(label)}</button>`;
  const edit = (kind, id = '', label = '編集する', primary = false) => `<button type="button" class="btn ${primary ? 'primary' : 'secondary small'}" data-edit="${esc(kind)}"${id ? ` data-id="${esc(id)}"` : ''}>${symbol(id ? 'edit' : 'plus')}${tr(label)}</button>`;
  const action = (name, label, id = '', kind = 'secondary', extra = '') => `<button type="button" class="btn ${kind}" data-act="${esc(name)}"${id ? ` data-id="${esc(id)}"` : ''}${extra}>${tr(label)}</button>`;
  const heading = (title, subtitle = '', controls = '') => `<div class="page-header"><div><h1>${tr(title)}</h1>${subtitle ? `<p class="muted">${tr(subtitle)}</p>` : ''}</div>${controls ? `<div class="button-row">${controls}</div>` : ''}</div>`;
  const field = (name, label, value = '', type = 'text', attrs = '', full = false) => `<label class="field${full ? ' full' : ''}"><span>${tr(label)}</span><input type="${esc(type)}" name="${esc(name)}" value="${esc(value)}"${type === 'number' ? ' data-number' : ''}${attrs ? ` ${attrs}` : ''}></label>`;
  const area = (name, label, value = '', attrs = '') => `<label class="field full"><span>${tr(label)}</span><textarea name="${esc(name)}" rows="3"${attrs ? ` ${attrs}` : ''}>${esc(value)}</textarea></label>`;
  const check = (name, label, value) => `<label class="check-field"><input type="checkbox" name="${esc(name)}" data-bool${value ? ' checked' : ''}><span>${tr(label)}</span></label>`;
  const select = (name, label, value, options, attrs = '') => `<label class="field"><span>${tr(label)}</span><select name="${esc(name)}"${attrs ? ` ${attrs}` : ''}>${options.map(([key, label]) => `<option value="${esc(key)}"${selected(value, key)}>${tr(label)}</option>`).join('')}</select></label>`;
  const menuSelect = value => `<label class="field"><span>${tr('対象メニュー')}</span><select name="menuId"><option value="">${tr('すべてのメニュー')}</option>${state.menus.map(item => `<option value="${esc(item.id)}"${selected(value, item.id)}>${esc(localized(item, 'name'))}</option>`).join('')}</select></label>`;
  const save = (label = '保存する') => `<div class="button-row full"><button type="submit" class="btn primary">${symbol('check')}${tr(label)}</button>${action('edit.close', '閉じる')}</div>`;
  const filterField = (key, label, type = 'search') => field(key, label, filters[key] || '', type, `data-filter="${esc(key)}"`);
  const filterSelect = (key, label, options) => select(key, label, filters[key] || '', options, `data-filter="${esc(key)}"`);
  const filterForm = body => `<form class="toolbar" data-action="ui.filter">${body}<button type="submit" class="btn secondary">${symbol('search')}${tr('絞り込む')}</button></form>`;
  const matches = (value, term) => String(value ?? '').toLocaleLowerCase().includes(String(term || '').trim().toLocaleLowerCase());
  const localDate = value => value ? new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Bangkok'}).format(new Date(value)) : '';
  const dateLabel = value => value ? esc(new Intl.DateTimeFormat(language,{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Bangkok'}).format(new Date(value))) : tr('日時未記録');
  const preview = (title, text, extra = '') => `<section class="preview-card"><h3>${tr('お客様への表示')}</h3><strong>${esc(title)}</strong><p class="preserve-lines">${esc(text)}</p>${extra}</section>`;
  const getEditing = (kind, rows) => ui.edit?.kind === kind ? (rows.find(item => item.id === ui.edit.id) || {}) : null;

  function faqView() {
    const editing = getEditing('faq', state.faq);
    const categories = [...new Set(state.faq.map(item => item.category).filter(Boolean))];
    const rows = state.faq.filter(item => matches([item.question, item.answer, item.questionEn, item.answerEn, item.questionTh, item.answerTh].join(' '), filters.faqSearch)
      && (!filters.faqCategory || item.category === filters.faqCategory)
      && (!filters.faqStatus || (filters.faqStatus === 'published') === item.published));
    const editor = editing ? `<section class="panel"><div class="panel-head"><h2>${tr(editing.id ? '回答を編集' : '回答を追加')}</h2>${badge('下書き', 'peach')}</div>
      <form class="form-grid" data-action="faq.save">${hiddenId(editing)}
        ${field('category', '分類', editing.category || 'その他', 'text', 'maxlength="80"')}
        <div class="full language-editor"><h3>${tr('日本語')}</h3><div class="form-grid">${field('question', '質問', editing.question, 'text', 'required maxlength="500"', true)}${area('answer', '回答', editing.answer, 'maxlength="4000"')}</div></div>
        <details class="full language-editor"${language === 'en' ? ' open' : ''}><summary>English ${editing.answerEn ? '✓' : ''}</summary><div class="form-grid">${field('questionEn', '質問（英語）', editing.questionEn, 'text', 'maxlength="500"', true)}${area('answerEn', '回答（英語）', editing.answerEn, 'maxlength="4000"')}</div></details>
        <details class="full language-editor"${language === 'th' ? ' open' : ''}><summary>ไทย ${editing.answerTh ? '✓' : ''}</summary><div class="form-grid">${field('questionTh', '質問（タイ語）', editing.questionTh, 'text', 'maxlength="500"', true)}${area('answerTh', '回答（タイ語）', editing.answerTh, 'maxlength="4000"')}</div></details>
        ${save('下書きを保存')}
      </form></section>` : '';
    return `${heading('質問と回答', '', edit('faq', '', '回答を追加', true))}${filterForm(filterField('faqSearch', '質問・回答を検索') + filterSelect('faqStatus', '表示状態', [['', 'すべて'], ['published', 'デモ表示中'], ['draft', '下書き']]) + filterSelect('faqCategory', '分類', [['', 'すべて'], ...categories.map(item => [item, item])]))}
      ${editor}<div class="stack">${rows.map(item => `<article class="panel"><div class="panel-head"><div class="button-row">${badge(item.published ? 'デモ表示中' : '下書き', item.published ? 'mint' : 'peach')}<span class="muted">${esc(item.category)}</span></div>${edit('faq', item.id)}</div><h2>${esc(localized(item, 'question'))}</h2><p class="preserve-lines">${esc(localized(item, 'answer')) || tr('回答は未入力です')}</p><div class="button-row"><span class="badge ${item.answer ? 'mint' : 'muted'}">日本語 ${item.answer ? '✓' : '—'}</span><span class="badge ${item.answerEn ? 'mint' : 'muted'}">English ${item.answerEn ? '✓' : '—'}</span><span class="badge ${item.answerTh ? 'mint' : 'muted'}">ไทย ${item.answerTh ? '✓' : '—'}</span></div><details><summary>${tr('表示を確認')}</summary>${preview(localized(item, 'question'), localized(item, 'answer'))}</details><div class="button-row">${action('faq.publish', item.published ? '下書きに戻す' : 'デモに表示', item.id, item.published ? 'secondary' : 'primary', ` data-value="${item.published ? 'false' : 'true'}"${!item.answer ? ' disabled' : ''}`)}</div></article>`).join('') || empty('一致する質問はありません') }</div>`;
  }

  function questionsView() {
    const all = state.questions.filter(item => matches(`${item.question} ${item.answer}`, filters.questionSearch)
      && (!filters.questionStatus || item.status === filters.questionStatus)
      && (!filters.questionLocale || item.locale === filters.questionLocale)
      && (!filters.questionFrom || localDate(item.at || item.receivedAt) >= filters.questionFrom)
      && (!filters.questionTo || !!(item.at || item.receivedAt) && localDate(item.at || item.receivedAt) <= filters.questionTo));
    const grouped = new Map();
    for (const item of all) {
      const key = `${item.locale}:${item.question.trim().replace(/\s+/g, ' ').toLocaleLowerCase()}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    }
    const statuses = [['unanswered', '未回答'], ['draft', '回答下書きあり'], ['answered', '対応済み']];
    return `${heading('未回答の質問', '', nav('faq', '質問と回答を開く'))}${filterForm(filterField('questionSearch', '質問・回答を検索') + filterSelect('questionStatus', '対応状況', [['', 'すべて'], ...statuses]) + filterSelect('questionLocale', '言語', [['', 'すべて'], ['ja', '日本語'], ['en', 'English'], ['th', 'ไทย']]) + filterField('questionFrom', '開始日', 'date') + filterField('questionTo', '終了日', 'date'))}
      <div class="stack">${[...grouped.values()].map(group => `<article class="panel"><div class="panel-head"><h2>${esc(group[0].question)}</h2>${badge(`${group.length}件`, 'peach')}</div><div class="stack">${group.map(item => {
        const customer = state.customers.find(row => row.id === item.customerId);
        return `<section class="row-card"><div class="panel-head"><strong>${esc(customer?.displayName || customer?.name || t('顧客未登録'))}</strong>${badge(statuses.find(([key]) => key === item.status)?.[1] || item.status, item.status === 'answered' ? 'mint' : 'peach')}</div><p class="muted">${dateLabel(item.at || item.receivedAt)} · ${esc(({ ja: '日本語', en: 'English', th: 'ไทย' })[item.locale])}</p><details><summary>${tr('元の質問を確認')}</summary><p class="preserve-lines">${esc(item.question)}</p>${item.reason ? `<p>${esc(item.reason)}</p>` : ''}</details>
          <form class="form-grid" data-action="question.save">${hiddenId(item)}${area('answer', '返信の下書き', item.answer, 'maxlength="4000"')}${select('status', '対応状況', item.status, statuses)}<div class="button-row full"><button type="submit" class="btn primary">${tr('下書きを保存')}</button>${item.customerId ? action('question.openChat', '会話を開く', item.id) : ''}${action('question.toFaq', '質問と回答の下書きへ', item.id, 'secondary', item.answer ? '' : ' disabled')}</div><p class="muted full">${tr('ここでは送信されません')}</p></form></section>`;
      }).join('')}</div></article>`).join('') || empty('未回答の質問はありません')}</div>`;
  }

  function menusView() {
    const editing = getEditing('menu', state.menus);
    const resourceOptions = state.settings.resources.map(item => [item.id, `${item.name}${item.enabled ? '' : ` · ${t('受付停止')}`}`]);
    return `${heading('メニュー・料金', '', edit('menu', '', 'メニューを追加', true))}${editing ? `<section class="panel"><h2>${tr(editing.id ? 'メニューを編集' : '新しいメニュー')}</h2><form class="form-grid" data-action="menu.save">${hiddenId(editing)}
      ${field('name', 'メニュー名（日本語）', editing.name, 'text', 'required maxlength="160"')}${field('nameEn', 'メニュー名（英語）', editing.nameEn, 'text', 'maxlength="160"')}${field('nameTh', 'メニュー名（タイ語）', editing.nameTh, 'text', 'maxlength="160"')}
      ${area('description', '説明（日本語）', editing.description, 'maxlength="4000"')}${area('descriptionEn', '説明（英語）', editing.descriptionEn, 'maxlength="4000"')}${area('descriptionTh', '説明（タイ語）', editing.descriptionTh, 'maxlength="4000"')}
      ${field('price', '料金（THB・未設定なら空欄）', editing.price, 'text', 'inputmode="decimal" pattern="[0-9]+([.][0-9]{1,2})?"')}${field('duration', '施術時間（分）', editing.duration ?? 60, 'number', 'required min="1" max="480"')}${field('cleanup', '準備・片付け（分）', editing.cleanup ?? 5, 'number', 'required min="0" max="120"')}${select('resource', '施術席', editing.resource || '', [['', '選択してください'], ...resourceOptions])}
      <div class="full button-row">${check('verified', '施術時間・施術席を確認済み', editing.verified)}${check('enabled', '受付する', editing.enabled !== false)}</div>${save()}</form></section>` : ''}
      <div class="grid two">${state.menus.map(item => {
        const resource = state.settings.resources.find(row => row.id === item.resource);
        return `<article class="panel"><div class="panel-head"><div class="button-row">${badge(item.enabled === false ? '受付停止' : item.verified ? '受付中' : '確認待ち', item.enabled === false ? 'muted' : item.verified ? 'mint' : 'peach')}</div>${edit('menu', item.id)}</div><h2>${esc(localized(item, 'name'))}</h2><p>${esc(localized(item, 'description'))}</p><dl class="detail-list"><div><dt>${tr('料金')}</dt><dd>${item.price !== '' && item.price != null ? `${esc(item.price)} THB` : tr('未設定')}</dd></div><div><dt>${tr('施術時間')}</dt><dd>${esc(item.duration)}${tr('分')} + ${tr('準備')} ${esc(item.cleanup)}${tr('分')}</dd></div><div><dt>${tr('施術席')}</dt><dd>${esc(resource?.name || t('未設定'))} · ${tr('同時受付')} ${esc(resource?.capacity ?? '—')}</dd></div></dl><details><summary>${tr('お客様への表示を確認')}</summary>${preview(localized(item, 'name'), localized(item, 'description'), `<strong>${item.price !== '' && item.price != null ? `${esc(item.price)} THB` : tr('料金はお問い合わせください')}</strong>`)}</details></article>`;
      }).join('') || empty('メニューを追加してください')}</div>${nav('settings', '施術席・受付人数を設定')}`;
  }

  function campaignEditor(kind, item) {
    return `<section class="panel"><h2>${tr(kind === 'coupon' ? 'クーポンを編集' : 'キャンペーンを編集')}</h2><form class="form-grid" data-action="${kind}.save">${hiddenId(item)}
      ${field('title', 'タイトル（日本語）', item.title, 'text', 'required maxlength="160"', true)}${field('titleEn', 'タイトル（英語）', item.titleEn, 'text', 'maxlength="160"')}${field('titleTh', 'タイトル（タイ語）', item.titleTh, 'text', 'maxlength="160"')}
      ${area('description', 'ご案内（日本語）', item.description, 'maxlength="4000"')}${area('descriptionEn', 'ご案内（英語）', item.descriptionEn, 'maxlength="4000"')}${area('descriptionTh', 'ご案内（タイ語）', item.descriptionTh, 'maxlength="4000"')}
      ${kind === 'coupon' ? field('price', '料金（THB・未設定なら空欄）', item.price || '', 'text', 'inputmode="decimal" pattern="[0-9]+([.][0-9]{1,2})?"') : ''}${field('benefit', '特典内容', item.benefit, 'text', 'maxlength="500"', true)}${kind === 'coupon' ? field('code', 'クーポン番号（任意）', item.code, 'text', 'maxlength="80"') : ''}${menuSelect(item.menuId)}${field('startDate', '開始日', item.startDate, 'date')}${field('expires', '終了日', item.expires, 'date')}${area('conditions', '利用条件', item.conditions, 'maxlength="4000"')}
      <div class="full">${check('enabled', 'デモ内で表示する', item.enabled)}</div>${save('内容を保存')}</form></section>`;
  }

  function campaignsView() {
    const campaign = getEditing('campaign', state.campaigns), coupon = getEditing('coupon', state.coupons);
    const cards = (kind, rows) => rows.map(item => `<article class="panel"><div class="panel-head">${badge(item.enabled ? '表示中' : '下書き', item.enabled ? 'mint' : 'peach')}${edit(kind, item.id)}</div><h3>${esc(localized(item, 'title'))}</h3><p class="preserve-lines">${esc(localized(item, 'description'))}</p>${item.benefit ? `<p class="offer-benefit">${esc(item.benefit)}</p>` : ''}<p class="muted">${esc(item.startDate || t('開始日なし'))} — ${esc(item.expires || t('終了日なし'))}</p><p>${tr('対象')}：${esc(state.menus.find(row => row.id === item.menuId)?.name || t('すべてのメニュー'))}</p><details><summary>${tr('表示を確認')}</summary>${preview(localized(item, 'title'), localized(item, 'description'), `<p>${esc(item.benefit)}</p>${item.price?`<p>${esc(item.price)} THB</p>`:''}${item.code ? `<p>${tr('クーポン番号')}：${esc(item.code)}</p>` : ''}<p class="muted">${esc(item.conditions)}</p>`)}</details></article>`).join('');
    return `${heading('キャンペーン・クーポン', '', edit('campaign', '', 'キャンペーンを追加', true) + edit('coupon', '', 'クーポンを追加'))}${campaign ? campaignEditor('campaign', campaign) : ''}${coupon ? campaignEditor('coupon', coupon) : ''}<section><h2>${tr('キャンペーン')}</h2><div class="grid two">${cards('campaign', state.campaigns) || empty('キャンペーンはありません')}</div></section><section><h2>${tr('クーポン')}</h2><div class="grid two">${cards('coupon', state.coupons) || empty('クーポンはありません')}</div></section>`;
  }

  function richmenuView() {
    const areas = state.richMenu.areas;
    const choices = [['booking', '予約'], ['menus', 'メニュー・料金'], ['campaigns', 'キャンペーン・クーポン'], ['faq', '質問と回答'], ['messages', 'スタッフに相談']];
    return `${heading('LINEメニュー')}<div class="grid two"><section class="panel"><h2>${tr('ボタンを編集')}</h2><form class="form-grid" data-action="richmenu.save">${field('title', 'メニューの見出し', state.richMenu.title, 'text', 'required maxlength="80"', true)}<input type="hidden" name="image" value="${esc(state.richMenu.image||'')}"><label class="field full"><span>${tr('メニュー画像を変更')}</span><input type="file" data-richmenu-image accept="image/png,image/jpeg,image/webp"></label><div class="full">${check('visible', 'メニュー全体を表示する', state.richMenu.visible!==false)}</div><div class="stack full" data-collection="areas">${areas.map((area, index) => `<fieldset class="row-card" data-row><legend>${tr('ボタン')} ${index + 1}</legend><input type="hidden" name="id" value="${esc(area.id)}"><div class="form-grid">${field('label', 'ボタン名', area.label, 'text', 'required maxlength="80"')}${select('action', 'タップしたとき', area.action, choices)}<div class="full">${check('enabled', '表示する', area.enabled)}</div></div></fieldset>`).join('')}</div><div class="full button-row"><button type="submit" class="btn primary">${tr('デモに保存')}</button></div></form></section><section class="panel"><h2>${tr('トーク画面での表示')}</h2><div class="line-preview"><div class="line-preview-chat"><span class="chat-bubble">${tr('下のメニューからお選びください')}</span></div><img data-richmenu-preview class="richmenu-art" src="${esc(state.richMenu.image||'')}" alt="${tr('メニュー画像')}" ${state.richMenu.image?'':'hidden'}><div class="richmenu-preview grid three">${areas.filter(area => area.enabled&&state.richMenu.visible!==false).map(area => `<button type="button" class="btn secondary" data-act="richmenu.preview" data-id="${esc(area.id)}">${symbol(area.action === 'booking' ? 'calendar' : area.action === 'menus' ? 'menu' : 'gift')}<span>${esc(area.label)}</span></button>`).join('') || empty('表示中のボタンはありません')}</div><div class="richmenu-title">${esc(state.richMenu.title)}</div></div><p class="muted">${tr('デモ表示です。LINEには反映されません')}</p></section></div>`;
  }

  function settingsView() {
    const settings = state.settings;
    return `${heading('営業時間・受付設定')}<form class="stack" data-action="settings.save"><section class="panel"><h2>${tr('営業時間')}</h2><div class="form-grid">${field('open', '営業開始', settings.open, 'time', 'required')}${field('close', '営業終了', settings.close, 'time', 'required')}${field('lastStart', '最終受付', settings.lastStart, 'time', 'required')}</div></section><section class="panel"><h2>${tr('受付できるスタッフ人数')}</h2><div class="form-grid">${field('staffWeekday', '平日', settings.staffWeekday, 'number', 'required min="0" max="100"')}${field('staffWeekend', '土日・祝日', settings.staffWeekend, 'number', 'required min="0" max="100"')}</div></section><section class="panel"><h2>${tr('施術席ごとの受付数')}</h2><div class="stack" data-collection="resources">${settings.resources.map(resource => `<fieldset class="row-card" data-row><legend>${esc(resource.name)}</legend><input type="hidden" name="id" value="${esc(resource.id)}"><div class="form-grid">${field('name', '施術席の名前', resource.name, 'text', 'required maxlength="100"')}${field('capacity', '同時に受付できる人数', resource.capacity, 'number', 'required min="1" max="100"')}<div class="full">${check('enabled', '受付する', resource.enabled)}</div></div></fieldset>`).join('')}</div><div class="button-row">${action('settings.addResource', '施術席を追加')}</div></section><section class="panel"><h2>${tr('休業日')}</h2>${area('closedDates', '1行に1日ずつ入力', settings.closedDates.join('\n'), 'data-lines placeholder="2026-12-31&#10;2027-01-01"')}${area('holidayDates', '祝日・休日スタッフ人数を使う日', (settings.holidayDates||[]).join('\n'), 'data-lines placeholder="YYYY-MM-DD"')}<p class="muted">${tr('年-月-日の形式で入力してください')}</p></section><div class="button-row"><button type="submit" class="btn primary">${symbol('check')}${tr('設定を保存')}</button></div></form>`;
  }

  function auditChanges(entry) {
    const labels = {
      name: '氏名', displayName: '表示名', locale: '使用言語', birthday: '誕生日', birthdayConsent: '誕生日のお知らせに同意',
      interests: '興味タグ', botPaused: '自動返信の停止', optedOut: 'お知らせを受け取らない', memo: 'スタッフメモ', handoffStatus: '対応状況',
      customerId: '顧客', menuId: 'メニュー', day: '日付', time: '時刻', status: '状態', performedMenuIds: '実施した施術', notes: '施術メモ',
      question: '質問', answer: '回答', questionEn: '質問（英語）', answerEn: '回答（英語）', questionTh: '質問（タイ語）', answerTh: '回答（タイ語）',
      category: '分類', published: 'デモ表示中', label: '名称', kind: '案内の種類', enabled: '有効', days: '来店後の日数', offsetMinutes: '来店前の分数',
      interest: '興味タグ', text: '本文', textEn: '本文（英語）', textTh: '本文（タイ語）', sendDate: 'お知らせ日', scheduledAt: '予定日時',
      cancelReason: '取消の理由', nameEn: 'メニュー名（英語）', nameTh: 'メニュー名（タイ語）', description: '説明（日本語）',
      descriptionEn: '説明（英語）', descriptionTh: '説明（タイ語）', duration: '施術時間（分）', cleanup: '準備・片付け（分）',
      resource: '施術席', verified: '施術時間・施術席を確認済み', price: '料金', title: 'タイトル（日本語）', titleEn: 'タイトル（英語）',
      titleTh: 'タイトル（タイ語）', startDate: '開始日', expires: '終了日', code: 'クーポン番号', benefit: '特典内容', conditions: '利用条件',
      open: '営業開始', close: '営業終了', lastStart: '最終受付', staffWeekday: '平日', staffWeekend: '土日・祝日',
      closedDates: '休業日', holidayDates: '祝日・休日スタッフ人数を使う日', resources: '施術席', capacity: '同時に受付できる人数',
      areas: 'ボタン', action: 'タップしたとき', image: 'メニュー画像', visible: 'メニュー全体を表示する', from: 'メッセージの種類',
    };
    const statuses = { pending: '確認待ち', confirmed: '予約確定', attended: '来店済み', cancelled: '取消済み', preview: '送信なし', paused: '保留',
      draft: '下書き', received: '受信', note: 'スタッフメモ', unanswered: '未回答', answered: '対応済み', none: '引継ぎなし', open: '未対応', progress: '対応中', resolved: '対応済み' };
    const kinds = { reminder_day_before: '来店前日', reminder_day_of: '来店当日', reminder_hours_before: '来店1時間前', thank_you_after_visit: '来店後のお礼',
      followup_days_after_visit: '次回予約のご案内', birthday: '誕生日', interest_campaign: '興味別', visit_segment_campaign: '施術履歴別' };
    const customerName = id => { const customer = state.customers.find(row => row.id === id); return customer?.displayName || customer?.name || t('顧客未登録'); };
    const serviceName = id => { const service = state.menus.find(row => row.id === id); return service ? localized(service, 'name') : t('未登録'); };
    const stable = value => {
      if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
      if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${key}:${stable(value[key])}`).join(',')}}`;
      return JSON.stringify(value);
    };
    const format = (key, value) => {
      if (value == null || value === '' || Array.isArray(value) && !value.length) return tr('未設定');
      if (typeof value === 'boolean') return tr(value ? 'ON' : 'OFF');
      if (key === 'customerId') return esc(customerName(value));
      if (key === 'menuId') return esc(serviceName(value));
      if (key === 'resource') return esc(state.settings.resources.find(row => row.id === value)?.name || t('未設定'));
      if (key === 'locale') return tr(({ ja: '日本語', en: 'English', th: 'ไทย' })[value] || '未設定');
      if (key === 'status' || key === 'handoffStatus') return tr(statuses[value] || '未設定');
      if (key === 'kind') return tr(kinds[value] || '未設定');
      if (key === 'action') return tr(({ booking: '予約', menus: 'メニュー・料金', campaigns: 'キャンペーン・クーポン', faq: '質問と回答', messages: 'スタッフに相談' })[value] || '未設定');
      if (key === 'from') return tr(({ customer: '顧客', staff: '返信の下書き', note: 'スタッフメモ' })[value] || '未設定');
      if (key === 'image') {
        const type = value?.mimeType?.split('/')[1]?.toUpperCase();
        return `${tr('画像あり')}${type ? ` · ${esc(type)}` : ''}${Number.isFinite(value?.bytes) ? ` · ${esc(Math.ceil(value.bytes / 1024))} KB` : ''}`;
      }
      if (Array.isArray(value)) return value.map(item => key === 'performedMenuIds' ? esc(serviceName(item)) : esc(item)).join('<br>');
      if (key === 'scheduledAt') {
        const instant = String(value).length === 16 ? `${value}:00+07:00` : value;
        return Number.isFinite(Date.parse(instant)) ? dateLabel(instant) : tr('未設定');
      }
      if (key === 'cancelReason') return tr(value);
      return esc(value);
    };
    const result = [];
    const walk = (before, after, prefix = []) => {
      if (stable(before) === stable(after)) return;
      if (Array.isArray(before) || Array.isArray(after)) {
        const previous = Array.isArray(before) ? before : [], next = Array.isArray(after) ? after : [];
        const ids = [...new Set([...previous, ...next].map((row, index) => row?.id || index))];
        for (const id of ids) {
          const oldRow = previous.find((row, index) => (row?.id || index) === id);
          const newRow = next.find((row, index) => (row?.id || index) === id);
          const record = newRow || oldRow || {};
          const rowName = record.name || record.label || (record.customerId ? customerName(record.customerId) : t('項目'));
          walk(oldRow, newRow, [...prefix, rowName]);
        }
        return;
      }
      const previous = before && typeof before === 'object' ? before : {};
      const next = after && typeof after === 'object' ? after : {};
      for (const key of [...new Set([...Object.keys(previous), ...Object.keys(next)])]) {
        if (!Object.hasOwn(labels, key) || stable(previous[key]) === stable(next[key])) continue;
        if (previous[key] === undefined && (next[key] === '' || next[key] == null || Array.isArray(next[key]) && !next[key].length)) continue;
        if (key === 'resources' || key === 'areas') { walk(previous[key], next[key], [...prefix, t(labels[key])]); continue; }
        const label = key === 'name' && (entry.type.startsWith('menu.') || prefix.length) ? '名称'
          : key === 'notes' && entry.type.startsWith('booking.') && entry.type !== 'booking.attend' ? '予約メモ' : labels[key];
        result.push({ label: [...prefix, t(label)].join(' / '), before: format(key, previous[key]), after: format(key, next[key]) });
      }
    };
    walk(entry.before, entry.after);
    return result;
  }

  function auditTarget(entry) {
    const record = (!Array.isArray(entry.after) && entry.after) || (!Array.isArray(entry.before) && entry.before) || {};
    if (entry.type === 'settings.save') return t('営業時間・受付設定');
    if (entry.type === 'richmenu.save') return t('LINEメニュー');
    if (Array.isArray(entry.after)) return t(`${entry.after.length}件`);
    if (entry.type.startsWith('customer.')) return record.displayName || record.name || '';
    if (entry.type.startsWith('menu.')) return localized(record, 'name');
    if (entry.type.startsWith('faq.') || entry.type.startsWith('question.')) return localized(record, 'question');
    if (entry.type.startsWith('campaign.') || entry.type.startsWith('coupon.')) return localized(record, 'title');
    const customer = state.customers.find(row => row.id === record.customerId || row.chat.some(message => message.id === entry.entityId));
    const service = state.menus.find(row => row.id === record.menuId);
    return [customer?.displayName || customer?.name, service && localized(service, 'name'), record.label && t(record.label)].filter(Boolean).join(' / ');
  }

  function auditView() {
    const rows = state.audit.filter(item => matches([item.text, item.entityId, item.actor, item.type, JSON.stringify(item.before || ''), JSON.stringify(item.after || '')].join(' '), filters.auditSearch)
      && (!filters.auditType || item.type.startsWith(filters.auditType))
      && (!filters.auditFrom || localDate(item.at) >= filters.auditFrom)
      && (!filters.auditTo || localDate(item.at) <= filters.auditTo));
    const types = [['', 'すべて'], ['booking.', '予約'], ['customer.', '顧客'], ['message.', 'メッセージ'], ['question.', '未回答'], ['faq.', '質問と回答'], ['crm.', 'CRM・フォロー'], ['menu.', 'メニュー'], ['campaign.', 'キャンペーン'], ['coupon.', 'クーポン'], ['settings.', '店舗設定'], ['richmenu.', 'LINEメニュー']];
    return `${heading('操作履歴')}${filterForm(filterField('auditSearch', '対象・スタッフ・操作を検索') + filterSelect('auditType', '操作の種類', types) + filterField('auditFrom', '開始日', 'date') + filterField('auditTo', '終了日', 'date'))}<div class="stack">${rows.map(item => {
      const changes = auditChanges(item), target = auditTarget(item);
      const comparison = changes.length ? `<div class="table-scroll"><table><thead><tr><th scope="col">${tr('項目')}</th><th scope="col">${tr('変更前')}</th><th scope="col">${tr('変更後')}</th></tr></thead><tbody>${changes.map(change => `<tr><th scope="row">${esc(change.label)}</th><td class="preserve-lines" data-label="${tr('変更前')}">${change.before}</td><td class="preserve-lines" data-label="${tr('変更後')}">${change.after}</td></tr>`).join('')}</tbody></table></div>`
        : `<p class="muted">${tr(item.before !== undefined || item.after !== undefined ? '変更された項目はありません' : 'この記録には変更前後の情報がありません')}</p>`;
      return `<article class="panel"><div class="panel-head"><strong>${tr(item.text)}</strong><span class="muted">${dateLabel(item.at)}</span></div><p class="muted">${target ? `${tr('対象')}：${esc(target)} · ` : ''}${tr('スタッフ')}：${tr(item.actor || 'デモ操作')}</p><details><summary>${tr('変更前と変更後を見る')}</summary>${comparison}</details></article>`;
    }).join('') || empty('一致する操作履歴はありません')}</div>`;
  }

  function moreView() {
    const groups = [
      ['毎日の業務', [
        ['bookings', '予約', '予約カレンダー・追加・変更・来店記録', 'booking', 'mint'],
        ['customers', '顧客', 'プロフィール・来店履歴・スタッフメモ', 'customers', 'peach'],
        ['messages', 'メッセージ', '返信下書き・スタッフ対応・自動返信', 'messages', 'lavender'],
        ['crm', 'フォロー', '8種類のお知らせ・対象者・予定と履歴', 'crm', 'mint'],
      ]],
      ['質問への対応', [
      ['questions', '未回答の質問', '回答が必要な質問を確認', 'message', 'peach'],
      ['faq', '質問と回答', '回答の編集と表示確認', 'help', 'lavender'],
      ]],
      ['お店の設定', [
      ['menus', 'メニュー・料金', '施術時間・料金・施術席', 'menu', 'mint'],
      ['campaigns', 'キャンペーン・クーポン', '特典と有効期間', 'gift', 'peach'],
      ['richmenu', 'LINEメニュー', 'トーク下部のボタン', 'message', 'mint'],
      ['settings', '営業時間・受付設定', '休業日・スタッフ・施術席', 'settings', 'lavender'],
      ]],
      ['接続と履歴', [
      ['audit', '操作履歴', 'いつ・何を変更したか', 'history', 'peach'],
      ['test', '実TEST接続', 'Googleログイン・接続確認', 'shield', 'mint'],
      ]],
    ];
    return `${heading('すべての機能')}<div class="feature-directory">${groups.map(([label,links]) => `<section class="feature-group"><h2>${tr(label)}</h2><div class="grid two">${links.map(([view, title, subtitle, glyph, color]) => `<button type="button" class="panel hub-card" data-nav="${view}"><span class="hub-icon ${color}">${symbol(glyph)}</span><span><strong>${tr(title)}</strong><small>${tr(subtitle)}</small></span>${symbol('arrow')}</button>`).join('')}</div></section>`).join('')}</div>`;
  }

  return ({ faq: faqView, questions: questionsView, menus: menusView, campaigns: campaignsView, richmenu: richmenuView, settings: settingsView, audit: auditView, more: moreView })[ui.view]?.() || '';
}
