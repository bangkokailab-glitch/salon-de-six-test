// UI labels are separate from editable customer names, replies and other content.
// Japanese keys are stable across all views; unknown content is returned unchanged.
const rows = `
フォロー|Follow-up|ติดตามลูกค้า
予約を取り消す|Cancel booking|ยกเลิกการจอง
すべての機能|All features|ฟังก์ชันทั้งหมด
毎日の業務|Daily tasks|งานประจำวัน
質問への対応|Questions & answers|คำถามและคำตอบ
お店の設定|Salon settings|การตั้งค่าร้าน
接続と履歴|Connections & history|การเชื่อมต่อและประวัติ
予約カレンダー・追加・変更・来店記録|Calendar, bookings & visits|ปฏิทิน การจอง และบันทึกการเข้ารับบริการ
プロフィール・来店履歴・スタッフメモ|Profiles, visits & staff notes|ข้อมูลลูกค้า ประวัติการเข้ารับบริการ และบันทึกพนักงาน
返信下書き・スタッフ対応・自動返信|Drafts, staff replies & automatic replies|ร่างข้อความ พนักงานตอบ และการตอบกลับอัตโนมัติ
8種類のお知らせ・対象者・予定と履歴|8 follow-ups, recipients & history|การติดตาม 8 แบบ ผู้รับ และประวัติ
返信下書き|Reply drafts|ร่างข้อความตอบกลับ
顧客の詳細|Customer details|รายละเอียดลูกค้า
会話の詳細|Conversation details|รายละเอียดการสนทนา
一覧に戻る|Back to list|กลับไปที่รายการ
顧客を追加しました。予約の入力を続けられます|Customer added. Continue your booking.|เพิ่มลูกค้าแล้ว กรอกการจองต่อได้
プレビューを取り消す|Cancel preview|ยกเลิกตัวอย่าง
自動応答を停止中|Automatic replies paused|หยุดการตอบกลับอัตโนมัติอยู่
自動応答の停止|Automatic replies paused|หยุดการตอบกลับอัตโนมัติ
言語・配信停止・自動応答・メモの変更|Update language, opt-out, automatic replies and notes|แก้ไขภาษา การรับข้อความ การตอบกลับอัตโนมัติ และบันทึก
ログイン中の役割|Signed-in role|บทบาทที่เข้าสู่ระบบ
Googleアカウントで確認|Verify with your Google account|ยืนยันด้วยบัญชี Google
共用アカウント・個人の識別なし|Shared account · no individual attribution|บัญชีส่วนกลาง · ไม่ระบุตัวบุคคล
オーナーアカウント|Owner account|บัญชีเจ้าของ
スタッフアカウント|Staff account|บัญชีพนักงาน
参加者|Participant|ผู้เข้าร่วม
閲覧のみ|Read only|ดูได้อย่างเดียว
このアカウントは閲覧のみです|This account has read-only access|บัญชีนี้มีสิทธิ์ดูข้อมูลเท่านั้น
自動応答を停止|Stop automatic replies|หยุดการตอบกลับอัตโนมัติ
自動応答停止の確認|Confirm stopping automatic replies|ยืนยันการหยุดตอบกลับอัตโนมัติ
この条件で候補が見つかりません|No suggested times match these conditions|ไม่พบเวลาที่แนะนำตามเงื่อนไขนี้
実TESTデータを表示中|Showing TEST data|กำลังแสดงข้อมูล TEST
実TEST・読み込み中|TEST · loading|TEST · กำลังโหลด
実TEST・接続エラー|TEST · connection error|TEST · การเชื่อมต่อผิดพลาด
実TEST・ログイン期限切れ|TEST · session expired|TEST · เซสชันหมดอายุ
実TEST・ログイン中|TEST · signing in|TEST · กำลังเข้าสู่ระบบ
30分ごとに6件まで表示|Up to 6 options at 30-minute intervals|แสดงสูงสุด 6 ตัวเลือก ทุก 30 นาที
TEST管理へ|Open TEST admin|ไปที่จัดการ TEST
デモに戻る|Back to demo|กลับสู่ตัวอย่าง
1行に1日ずつ入力|Enter one date per line|กรอกวันที่บรรทัดละหนึ่งวัน
CRM・フォロー|CRM & follow-up|CRM และติดตามลูกค้า
CRM表示|CRM view|มุมมอง CRM
FAQを保存|Save FAQ|บันทึกคำถามที่พบบ่อย
Googleログイン・接続確認|Google sign-in & connection|เข้าสู่ระบบ Google และตรวจสอบการเชื่อมต่อ
LINEメニュー|LINE menu|เมนู LINE
LINE登録のみ|LINE friend only|เพิ่มเพื่อน LINE เท่านั้น
いつ・何を変更したか|See when and what changed|ดูว่าเปลี่ยนอะไรและเมื่อใด
お客様への表示|Customer preview|ตัวอย่างที่ลูกค้าเห็น
お客様への表示を確認|Preview for customers|ดูตัวอย่างสำหรับลูกค้า
お知らせを受け取らない|Do not receive notices|ไม่รับการแจ้งเตือน
お知らせ同意済み|Notices allowed|ยินยอมรับการแจ้งเตือนแล้ว
お知らせ日|Notification date|วันที่แจ้งเตือน
ここでは送信されません|Nothing is sent here|หน้านี้ไม่มีการส่งข้อความ
このお客様の予約と重なります|This customer already has an overlapping booking|เวลาทับซ้อนกับการจองของลูกค้ารายนี้
この予約は変更できません|This booking cannot be changed|ไม่สามารถเปลี่ยนการจองนี้ได้
この内容のプレビューは作成済み|This preview has already been created|สร้างตัวอย่างนี้แล้ว
この日に空きはありません|No times are available on this date|วันนี้ไม่มีช่วงเวลาว่าง
この日の予約はありません|No bookings on this date|วันนี้ไม่มีการจอง
この日時の対象者はいません|No recipients match this date and time|ไม่มีผู้รับที่ตรงกับวันและเวลานี้
この時間のスタッフ枠が埋まっています|All staff are booked at this time|พนักงานเต็มในช่วงเวลานี้
この記録には変更前後の情報がありません|Before-and-after details are not available for this entry|รายการนี้ไม่มีข้อมูลก่อนและหลังการเปลี่ยนแปลง
ご案内（タイ語）|Description (Thai)|คำอธิบาย (ไทย)
ご案内（日本語）|Description (Japanese)|คำอธิบาย (ญี่ปุ่น)
ご案内（英語）|Description (English)|คำอธิบาย (อังกฤษ)
すべて|All|ทั้งหมด
すべてのメニュー|All services|ทุกบริการ
その他|More|เพิ่มเติม
ひらく|Open|เปิด
まだ来店履歴はありません|No visit history yet|ยังไม่มีประวัติการใช้บริการ
キャンペーン|Campaigns|แคมเปญ
キャンペーンはありません|No campaigns yet|ยังไม่มีแคมเปญ
キャンペーンを保存|Save campaign|บันทึกแคมเปญ
キャンペーンを編集|Edit campaign|แก้ไขแคมเปญ
キャンペーンを追加|Add campaign|เพิ่มแคมเปญ
キャンペーン・クーポン|Campaigns & coupons|แคมเปญและคูปอง
クーポン|Coupons|คูปอง
クーポンはありません|No coupons yet|ยังไม่มีคูปอง
クーポンを保存|Save coupon|บันทึกคูปอง
クーポンを編集|Edit coupon|แก้ไขคูปอง
クーポンを追加|Add coupon|เพิ่มคูปอง
クーポン番号|Coupon code|รหัสคูปอง
クーポン番号（任意）|Coupon code (optional)|รหัสคูปอง (ไม่บังคับ)
スタッフ|Staff|พนักงาน
スタッフが取消しました|Cancelled by staff|พนักงานยกเลิกแล้ว
スタッフが対応|Take over conversation|ให้พนักงานดูแล
スタッフに相談|Ask our staff|สอบถามพนักงาน
スタッフへ引き継ぎ・自動応答を停止|Hand over to staff and pause auto-replies|ส่งต่อให้พนักงานและหยุดตอบอัตโนมัติ
スタッフメモ|Staff notes|บันทึกของพนักงาน
スタッフメモを保存|Save staff note|บันทึกโน้ตของพนักงาน
スタッフ対応|Staff handling|พนักงานดูแล
スタッフ対応を完了|Complete staff handling|เสร็จสิ้นการดูแลโดยพนักงาน
スタッフ対応中|Being handled by staff|พนักงานกำลังดูแล
タイトル（タイ語）|Title (Thai)|ชื่อเรื่อง (ไทย)
タイトル（日本語）|Title (Japanese)|ชื่อเรื่อง (ญี่ปุ่น)
タイトル（英語）|Title (English)|ชื่อเรื่อง (อังกฤษ)
タップしたとき|On tap|เมื่อแตะ
デモに保存|Save in demo|บันทึกในเดโม
デモ内で表示する|Show in demo|แสดงในเดโม
デモ内のFAQ表示を変更|Change FAQ visibility in demo|เปลี่ยนการแสดงคำถามที่พบบ่อยในเดโม
デモ操作|Demo user|ผู้ใช้เดโม
デモ表示です。LINEには反映されません|Demo preview. No changes are made to LINE.|ตัวอย่างเดโม ไม่มีการเปลี่ยนแปลงใน LINE
トーク下部のボタン|Buttons below the conversation|ปุ่มด้านล่างแชต
トーク画面での表示|Chat preview|ตัวอย่างในหน้าแชต
バンコク時間|Bangkok time|เวลาประเทศไทย
フォロー設定|Follow-up settings|ตั้งค่าการติดตาม
フォロー設定が変更されました|Follow-up settings changed|เปลี่ยนการตั้งค่าติดตามแล้ว
フォロー設定を保存|Save follow-up settings|บันทึกการตั้งค่าติดตาม
プレビューを保存|Save preview|บันทึกตัวอย่าง
プレビューを取消|Cancel preview|ยกเลิกตัวอย่าง
プレビュー対象|Included in preview|รวมในตัวอย่าง
ボタン|Button|ปุ่ม
ボタンを編集|Edit buttons|แก้ไขปุ่ม
ボタン名|Button label|ชื่อปุ่ม
メッセージ|Messages|ข้อความ
メッセージなし|No messages|ไม่มีข้อความ
メニュー|Service|บริการ
メニューが変更されました|Service details changed|เปลี่ยนรายละเอียดบริการแล้ว
メニューの見出し|Menu title|ชื่อเมนู
メニューを保存|Save service|บันทึกบริการ
メニューを編集|Edit service|แก้ไขบริการ
メニューを追加|Add service|เพิ่มบริการ
メニューを追加してください|Add a service to get started|เพิ่มบริการเพื่อเริ่มต้น
メニューを開く|Open menu|เปิดเมนู
メニュー・料金|Services & prices|บริการและราคา
メニュー名（タイ語）|Service name (Thai)|ชื่อบริการ (ไทย)
メニュー名（日本語）|Service name (Japanese)|ชื่อบริการ (ญี่ปุ่น)
メニュー名（英語）|Service name (English)|ชื่อบริการ (อังกฤษ)
リッチメニューをデモ内に保存|Save rich menu in demo|บันทึกริชเมนูในเดโม
一致する操作履歴はありません|No matching activity|ไม่พบประวัติที่ตรงกัน
一致する質問はありません|No matching questions|ไม่พบคำถามที่ตรงกัน
一覧|List|รายการ
下のメニューからお選びください|Choose from the menu below|เลือกจากเมนูด้านล่าง
下書き|Draft|ฉบับร่าง
下書きに戻す|Return to draft|เปลี่ยนเป็นฉบับร่าง
下書きを保存|Save draft|บันทึกฉบับร่าง
下書き・未送信|Draft · not sent|ฉบับร่าง · ยังไม่ส่ง
予定・履歴|Schedule & history|กำหนดการและประวัติ
予約|Bookings|การจอง
予約なし|No bookings|ไม่มีการจอง
予約の何分前|Minutes before appointment|นาทีก่อนเวลานัด
予約の表示|Booking view|มุมมองการจอง
予約をひらく|Open bookings|เปิดการจอง
予約を取消|Cancel booking|ยกเลิกการจอง
予約を変更|Change booking|เปลี่ยนการจอง
予約を確定|Confirm booking|ยืนยันการจอง
予約を追加|Add booking|เพิ่มการจอง
予約メモ|Booking note|บันทึกการจอง
予約・来店履歴|Booking & visit history|ประวัติการจองและการใช้บริการ
予約内容が変更されました|Booking details changed|เปลี่ยนรายละเอียดการจองแล้ว
予約希望を作成|Create booking request|สร้างคำขอจอง
予約確定|Confirmed|ยืนยันแล้ว
今日|Today|วันนี้
今日の、|A beautiful|เริ่มวันนี้
美しい流れ。|flow for today.|อย่างราบรื่น
件|items|รายการ
休業日|Closed dates|วันหยุดร้าน
休業日です|The salon is closed on this date|ร้านหยุดในวันนี้
休業日・スタッフ・施術席|Closed dates, staff & treatment stations|วันหยุด พนักงาน และจุดให้บริการ
会話をひらく|Open conversation|เปิดแชต
会話を検索|Search conversations|ค้นหาแชต
会話を選んでください|Select a conversation|เลือกแชต
会話を開く|Open conversation|เปิดแชต
使用言語|Preferred language|ภาษาที่ใช้
保存したプレビュー|Saved previews|ตัวอย่างที่บันทึกไว้
保存したプレビューはありません|No saved previews|ยังไม่มีตัวอย่างที่บันทึกไว้
保存する|Save|บันทึก
停止中|Paused|หยุดชั่วคราว
元の質問を確認|View original question|ดูคำถามต้นฉบับ
公開中|Published|เผยแพร่แล้ว
デモ表示中|Shown in demo|แสดงในเดโม
デモに表示|Show in demo|แสดงในเดโม
公開前に確認|Review before publishing|ตรวจสอบก่อนเผยแพร่
内容を保存|Save details|บันทึกรายละเอียด
内容を確認|Review details|ตรวจสอบรายละเอียด
分|min|นาที
分前|min before|นาทีก่อน
分類|Category|หมวดหมู่
初めてのお客様|New customer|ลูกค้าใหม่
初回来店前の予約あり|First visit booked|จองครั้งแรกแล้ว
利用できる設備がありません|No treatment station is available|ไม่มีจุดให้บริการที่พร้อมใช้งาน
利用条件|Terms of use|เงื่อนไขการใช้
前の日|Previous day|วันก่อนหน้า
取り消す|Cancel|ยกเลิก
取消履歴あり・予約なし|Cancelled before · no booking|เคยยกเลิก · ไม่มีการจอง
取消済み|Cancelled|ยกเลิกแล้ว
受付する|Accept bookings|เปิดรับจอง
受付できるスタッフ人数|Available staff|จำนวนพนักงานที่รับลูกค้าได้
受付中|Available|เปิดรับจอง
受付停止|Unavailable|หยุดรับจอง
受付状態|Booking status|สถานะการจอง
受信|Received|ได้รับแล้ว
同じ設備の予約と重なります|This treatment station has an overlapping booking|เวลาทับซ้อนกับการจองของจุดให้บริการนี้
同時に受付できる人数|Customers at the same time|จำนวนลูกค้าที่รับพร้อมกันได้
同時受付|Capacity|รับพร้อมกัน
名|people|คน
名前・メッセージを検索|Search names or messages|ค้นหาชื่อหรือข้อความ
名前・興味・メモを検索|Search names, interests or notes|ค้นหาชื่อ ความสนใจ หรือบันทึก
営業時間|Opening hours|เวลาเปิดบริการ
営業時間・受付設定|Hours & booking settings|เวลาเปิดและตั้งค่ารับจอง
営業時間外です|Outside opening hours|นอกเวลาเปิดบริการ
営業終了|Closing time|เวลาปิด
営業開始|Opening time|เวลาเปิด
回答|Answer|คำตอบ
回答が必要な質問を確認|Review questions awaiting answers|ดูคำถามที่รอคำตอบ
回答の編集と表示確認|Edit answers and preview|แก้ไขคำตอบและดูตัวอย่าง
回答は未入力です|No answer entered|ยังไม่ได้กรอกคำตอบ
回答を編集|Edit answer|แก้ไขคำตอบ
回答を追加|Add answer|เพิ่มคำตอบ
回答下書きあり|Answer drafted|มีคำตอบฉบับร่าง
回答（タイ語）|Answer (Thai)|คำตอบ (ไทย)
回答（英語）|Answer (English)|คำตอบ (อังกฤษ)
土日・祝日|Weekends & holidays|เสาร์ อาทิตย์ และวันหยุด
変更前|Before|ก่อนเปลี่ยน
変更前と変更後を見る|View before & after|ดูก่อนและหลังเปลี่ยน
変更後|After|หลังเปลี่ยน
実TEST接続|TEST connection|เชื่อมต่อ TEST
実施した施術|Treatments performed|บริการที่ได้รับจริง
実配信はOFF|Live sending is OFF|ปิดการส่งจริง
対応を完了|Mark handled|เสร็จสิ้นการดูแล
対応中|In progress|กำลังดูแล
対応済み|Handled|ดูแลแล้ว
対応状況|Handling status|สถานะการดูแล
対象|Applies to|ใช้กับ
対象の興味タグなし|No matching interest tag|ไม่มีแท็กความสนใจที่ตรงกัน
対象メニュー|Eligible service|บริการที่ร่วมรายการ
対象・スタッフ・操作を検索|Search target, staff or action|ค้นหารายการ พนักงาน หรือการดำเนินการ
対象外|Excluded|ไม่เข้าเงื่อนไข
対象外の理由|Reasons for exclusion|เหตุผลที่ไม่เข้าเงื่อนไข
対象施術の実施記録なし|No record of this treatment|ไม่มีประวัติรับบริการนี้
対象者|Recipients|ผู้รับ
対象者のプレビューに含める|Include in recipient preview|รวมในตัวอย่างผู้รับ
対象者を確認|Check recipients|ตรวจสอบผู้รับ
対象者・文面確認|Recipients & message preview|ผู้รับและตัวอย่างข้อความ
差込項目|Personalization fields|ช่องแทนข้อมูล
希望として保存|Save as request|บันทึกเป็นคำขอ
平日|Weekdays|วันธรรมดา
年-月-日の形式で入力してください|Use YYYY-MM-DD|ใช้รูปแบบ ปี-เดือน-วัน (YYYY-MM-DD)
店舗設定|Salon settings|ตั้งค่าร้าน
店舗設定を保存|Save salon settings|บันทึกการตั้งค่าร้าน
所要時間|Duration|ระยะเวลา
操作の種類|Action type|ประเภทการดำเนินการ
操作履歴|Activity history|ประวัติการดำเนินการ
料金|Price|ราคา
料金はお問い合わせください|Please ask for pricing|สอบถามราคาได้ที่ร้าน
料金（THB・未設定なら空欄）|Price (THB; leave blank if unset)|ราคา (บาท เว้นว่างหากยังไม่กำหนด)
新しいメニュー|New service|บริการใหม่
施術を受けた方|Previous treatment clients|ลูกค้าที่เคยรับบริการ
施術メモ|Treatment notes|บันทึกการให้บริการ
施術席|Treatment station|จุดให้บริการ
施術席ごとの受付数|Capacity by treatment station|จำนวนที่รับได้ในแต่ละจุดให้บริการ
施術席の名前|Treatment station name|ชื่อจุดให้บริการ
施術席を追加|Add treatment station|เพิ่มจุดให้บริการ
施術席・受付人数を設定|Set treatment stations & capacity|ตั้งค่าจุดให้บริการและจำนวนที่รับได้
施術時間|Treatment time|เวลาให้บริการ
施術時間・料金・施術席|Duration, prices & stations|ระยะเวลา ราคา และจุดให้บริการ
施術時間・施術席を確認済み|Duration and station verified|ตรวจสอบเวลาและจุดให้บริการแล้ว
施術時間（分）|Treatment time (minutes)|เวลาให้บริการ (นาที)
日|Day|วัน
日付|Date|วันที่
日付を確認してください|Check the date|ตรวจสอบวันที่
日時|Date & time|วันและเวลา
日時を変更|Change date & time|เปลี่ยนวันและเวลา
日時未記録|Time not recorded|ไม่ได้บันทึกเวลา
日本語|Japanese|ภาษาญี่ปุ่น
時刻|Time|เวลา
時刻を確認してください|Check the time|ตรวจสอบเวลา
最終受付|Last appointment starts|เวลาเริ่มนัดสุดท้าย
未回答|Unanswered|ยังไม่ตอบ
未回答の質問|Unanswered questions|คำถามที่ยังไม่ตอบ
未回答の質問はありません|No unanswered questions|ไม่มีคำถามที่ยังไม่ตอบ
未対応|To do|รอดูแล
未登録|Not registered|ยังไม่ได้บันทึก
未設定|Not set|ยังไม่กำหนด
本日の予約|Today's bookings|การจองวันนี้
来店1時間前|One hour before visit|ก่อนนัด 1 ชั่วโมง
来店からの日数|Days after visit|จำนวนวันหลังใช้บริการ
来店を記録|Record visit|บันทึกการใช้บริการ
来店前日|Day before visit|วันก่อนนัด
来店当日|Day of visit|วันนัด
来店後のお礼|Thank-you after visit|ขอบคุณหลังใช้บริการ
来店済み|Visited|ใช้บริการแล้ว
来店済みの記録なし|No completed visit recorded|ไม่มีประวัติใช้บริการที่เสร็จสิ้น
架空データを用意しました。|Demo data created.|เตรียมข้อมูลเดโมแล้ว
検索|Search|ค้นหา
次の予約あり|Has an upcoming booking|มีการจองครั้งถัดไป
次の日|Next day|วันถัดไป
次回予約のご案内|Rebooking reminder|แจ้งเตือนจองครั้งถัดไป
氏名|Full name|ชื่อและนามสกุล
準備|Preparation|เตรียมการ
準備・片付け（分）|Preparation & cleanup (minutes)|เตรียมและเก็บอุปกรณ์ (นาที)
無送信プレビューを保存|Save preview without sending|บันทึกตัวอย่างโดยไม่ส่ง
特典と有効期間|Benefits & validity|สิทธิพิเศษและระยะเวลา
特典内容|Benefit|สิทธิพิเศษ
状態|Status|สถานะ
確定した予約なし|No confirmed booking|ไม่มีการจองที่ยืนยันแล้ว
確認する日時|Date & time to check|วันและเวลาที่ต้องการตรวจสอบ
確認待ち|Awaiting confirmation|รอยืนยัน
種類|Type|ประเภท
空き時間を探す|Find an available time|หาเวลาว่าง
終了日|End date|วันสิ้นสุด
終了日なし|No end date|ไม่กำหนดวันสิ้นสุด
絞り込む|Apply filters|กรองข้อมูล
編集|Edit|แก้ไข
編集する|Edit|แก้ไข
自動応答を再開|Resume auto-replies|เปิดตอบอัตโนมัติอีกครั้ง
自動返信|Auto-replies|ตอบอัตโนมัติ
自動返信は停止中|Auto-replies paused|หยุดตอบอัตโนมัติชั่วคราว
自動返信を再開|Resume auto-replies|เปิดตอบอัตโนมัติอีกครั้ง
自動返信中|Auto-replies on|เปิดตอบอัตโนมัติ
興味のあるメニュー|Services of interest|บริการที่สนใจ
興味タグ|Interest tag|แท็กความสนใจ
表示する|Show|แสดง
表示を確認|Preview|ดูตัวอย่าง
表示中|Visible|แสดงอยู่
表示中のボタンはありません|No buttons are visible|ไม่มีปุ่มที่แสดงอยู่
表示名|Display name|ชื่อที่แสดง
表示状態|Visibility|สถานะการแสดง
言語|Language|ภาษา
設備はメニューに合わせて選ばれます|The station is selected for the service|เลือกจุดให้บริการตามบริการที่จอง
設備・所要時間の確認が必要です|Verify the station and duration first|โปรดตรวจสอบจุดให้บริการและระยะเวลาก่อน
設定する|Set up|ตั้งค่า
設定を保存|Save settings|บันทึกการตั้งค่า
該当する会話はありません|No matching conversations|ไม่พบแชตที่ตรงกัน
該当する顧客はいません|No matching customers|ไม่พบลูกค้าที่ตรงกัน
詳細|Details|รายละเอียด
誕生日|Birthday|วันเกิด
誕生日のお知らせに同意|Consent to birthday notices|ยินยอมรับข้อความวันเกิด
誕生日未登録|Birthday not registered|ยังไม่ได้บันทึกวันเกิด
誕生日配信の同意なし|No consent for birthday notices|ไม่ได้ยินยอมรับข้อความวันเกิด
説明（タイ語）|Description (Thai)|คำอธิบาย (ไทย)
説明（日本語）|Description (Japanese)|คำอธิบาย (ญี่ปุ่น)
説明（英語）|Description (English)|คำอธิบาย (อังกฤษ)
質問|Question|คำถาม
質問と回答|Questions & answers|คำถามและคำตอบ
質問と回答の下書きへ|Create FAQ draft|สร้างฉบับร่างคำถามที่พบบ่อย
質問と回答を開く|Open questions & answers|เปิดคำถามและคำตอบ
質問への回答を保存|Save answer to question|บันทึกคำตอบ
質問・回答を検索|Search questions or answers|ค้นหาคำถามหรือคำตอบ
質問（タイ語）|Question (Thai)|คำถาม (ไทย)
質問（英語）|Question (English)|คำถาม (อังกฤษ)
返信の下書き|Reply draft|ฉบับร่างข้อความตอบ
返信の下書きを保存|Save reply draft|บันทึกฉบับร่างข้อความตอบ
返信待ち|Awaiting reply|รอตอบกลับ
送信される文面の確認|Message preview|ตัวอย่างข้อความ
送信せず文面を確認|Preview without sending|ดูตัวอย่างโดยไม่ส่ง
送信なし|No sending|ไม่ส่งข้อความ
週|Week|สัปดาห์
過去の日時は選べません|Choose a future date and time|เลือกวันและเวลาในอนาคต
選択してください|Please select|โปรดเลือก
配信予定時刻ではありません|Not the scheduled time|ยังไม่ถึงเวลาที่กำหนด
配信停止中|Opted out|ปิดรับข้อความ
閉じる|Close|ปิด
開始日|Start date|วันเริ่มต้น
開始日なし|No start date|ไม่กำหนดวันเริ่มต้น
開始時刻|Start time|เวลาเริ่ม
顧客|Customer|ลูกค้า
顧客の分類|Customer segment|กลุ่มลูกค้า
顧客の言語の本文が未入力|Message missing in the customer's language|ยังไม่มีข้อความในภาษาของลูกค้า
顧客を検索|Search customers|ค้นหาลูกค้า
顧客を見る|View customers|ดูลูกค้า
顧客を追加|Add customer|เพิ่มลูกค้า
顧客を追加してください|Add a customer to get started|เพิ่มลูกค้าเพื่อเริ่มต้น
顧客を選んでください|Select a customer|เลือกลูกค้า
顧客情報|Customer details|ข้อมูลลูกค้า
顧客情報を保存|Save customer details|บันทึกข้อมูลลูกค้า
顧客情報を編集|Edit customer details|แก้ไขข้อมูลลูกค้า
顧客情報・対応状態が変更されました|Customer details or handling status changed|เปลี่ยนข้อมูลลูกค้าหรือสถานะการดูแลแล้ว
顧客未登録|Customer not registered|ยังไม่ได้ลงทะเบียนลูกค้า
ホーム|Home|หน้าหลัก
戻る|Back|กลับ
ログアウト|Sign out|ออกจากระบบ
ログイン|Sign in|เข้าสู่ระบบ
接続確認|Check connection|ตรวจสอบการเชื่อมต่อ
アカウント|Account|บัญชี
設定|Settings|ตั้งค่า
日本語・英語・タイ語|Japanese, English & Thai|ญี่ปุ่น อังกฤษ และไทย
OFF|OFF|ปิด
ON|ON|เปิด
English|English|ภาษาอังกฤษ
ภาษาไทย|Thai|ภาษาไทย
ไทย|Thai|ภาษาไทย
保存しました|Saved|บันทึกแล้ว
保存しました。|Saved.|บันทึกแล้ว
確認|Review|ตรวจสอบ
キャンセル|Cancel|ยกเลิก
この内容で保存|Save these changes|บันทึกตามนี้
この内容で確定|Confirm these details|ยืนยันตามนี้
再読み込み|Refresh|โหลดใหม่
読み込み中|Loading|กำลังโหลด
再ログイン|Sign in again|เข้าสู่ระบบอีกครั้ง
接続済み|Connected|เชื่อมต่อแล้ว
未接続|Not connected|ยังไม่เชื่อมต่อ
デモ|Demo|เดโม
架空データ|Demo data|ข้อมูลเดโม
送信OFF|Sending OFF|ปิดการส่ง
操作を確認|Review action|ตรวจสอบการดำเนินการ
処理中|Processing|กำลังดำเนินการ
完了|Done|เสร็จสิ้น
エラー|Error|ข้อผิดพลาด
自動返信の停止|Auto-replies paused|หยุดตอบอัตโนมัติ
名称|Name|ชื่อ
有効|Enabled|เปิดใช้งาน
本文|Message text|เนื้อหาข้อความ
本文（英語）|Message text (English)|เนื้อหาข้อความ (อังกฤษ)
本文（タイ語）|Message text (Thai)|เนื้อหาข้อความ (ไทย)
予定日時|Scheduled date & time|วันและเวลาที่กำหนด
取消の理由|Cancellation reason|เหตุผลที่ยกเลิก
メッセージの種類|Message type|ประเภทข้อความ
保留|On hold|พักไว้
引継ぎなし|No staff handover|ไม่ได้ส่งต่อให้พนักงาน
画像あり|Image attached|มีรูปภาพ
項目|Field|รายการ
変更された項目はありません|No fields changed|ไม่มีรายการที่เปลี่ยนแปลง
`.trim().split('\n').map(line => line.split('|'));

export const messages = { en: Object.create(null), th: Object.create(null) };
for (const [key, en, th] of rows) {
  if (!key || !en || !th || Object.hasOwn(messages.en, key)) throw new Error(`Invalid translation: ${key}`);
  messages.en[key] = en;
  messages.th[key] = th;
}

const applicationRows = `
ホームへ|Go to home|กลับหน้าหลัก
メインメニュー|Main menu|เมนูหลัก
表示言語|Display language|ภาษาที่แสดง
アカウント・実TEST接続|Account & TEST connection|บัญชีและการเชื่อมต่อ TEST
実TEST・Googleログインが必要|Live TEST · Google sign-in required|TEST จริง · ต้องเข้าสู่ระบบ Google
デモ・この端末に保存|Demo · saved on this device|เดโม · บันทึกในอุปกรณ์นี้
架空データ・送信なし|Demo data · nothing sent|ข้อมูลจำลอง · ไม่มีการส่ง
保存データを読み込めなかったため、架空データを表示しています|Saved data could not be loaded. Showing demo data.|โหลดข้อมูลที่บันทึกไว้ไม่ได้ จึงแสดงข้อมูลเดโม
保存していない変更があります|You have unsaved changes|มีการเปลี่ยนแปลงที่ยังไม่บันทึก
変更を破棄して移動しますか？|Discard your changes and leave?|ละทิ้งการเปลี่ยนแปลงแล้วออกจากหน้านี้หรือไม่?
変更を破棄|Discard changes|ละทิ้งการเปลี่ยนแปลง
編集を続ける|Keep editing|แก้ไขต่อ
過去の予約は作成・変更・取消できません|Past bookings cannot be created, changed or cancelled|ไม่สามารถสร้าง เปลี่ยน หรือยกเลิกการจองในอดีตได้
施術が終わってから来店を記録してください|Record the visit after the treatment ends|บันทึกการใช้บริการหลังให้บริการเสร็จแล้ว
同じ予約がすでにあります|This booking already exists|มีการจองนี้แล้ว
別の操作で更新されました。内容を確認し直してください|Another action changed this information. Please review it again.|มีการเปลี่ยนข้อมูลจากการดำเนินการอื่น โปรดตรวจสอบอีกครั้ง
同じ操作の内容が変わりました。確認し直してください|The details of this action changed. Please review them again.|รายละเอียดการดำเนินการนี้เปลี่ยนแล้ว โปรดตรวจสอบอีกครั้ง
誕生日を確認してください|Check the birthday|ตรวจสอบวันเกิด
同意を登録するには誕生日を入力してください|Enter a birthday before recording consent|กรอกวันเกิดก่อนบันทึกความยินยอม
変更はありません|No changes to save|ไม่มีการเปลี่ยนแปลงให้บันทึก
開始日と終了日を確認してください|Check the start and end dates|ตรวจสอบวันเริ่มต้นและวันสิ้นสุด
フォローの条件と文面を確認してください|Check the follow-up conditions and message|ตรวจสอบเงื่อนไขติดตามและข้อความ
営業時間・受付人数・休業日を確認してください|Check opening hours, capacity and closed dates|ตรวจสอบเวลาเปิด จำนวนที่รับได้ และวันหยุด
実施した施術を選んでください|Select the treatments performed|เลือกบริการที่ได้รับจริง
名前を入力してください|Enter a name|กรอกชื่อ
メッセージを入力してください|Enter a message|กรอกข้อความ
メニューで使用中の設備は削除できません|A station used by a service cannot be removed|ไม่สามารถลบจุดให้บริการที่มีบริการใช้งานอยู่ได้
端末に保存できませんでした。空き容量やブラウザ設定を確認してください|Could not save on this device. Check free space and browser settings.|บันทึกในอุปกรณ์ไม่ได้ โปรดตรวจสอบพื้นที่ว่างและการตั้งค่าเบราว์เซอร์
入力内容を確認してください|Check the entered details|ตรวจสอบข้อมูลที่กรอก
数値を確認してください|Check the number|ตรวจสอบตัวเลข
料金を確認してください|Check the price|ตรวจสอบราคา
日時を確認してください|Check the date and time|ตรวจสอบวันและเวลา
このプレビューはすでに取り消されています|This preview has already been cancelled|ยกเลิกตัวอย่างนี้แล้ว
質問と回答を入力してください|Enter a question and answer|กรอกคำถามและคำตอบ
操作を完了できませんでした。入力内容を確認してください|Could not complete the action. Check the entered details.|ดำเนินการไม่สำเร็จ โปรดตรวจสอบข้อมูลที่กรอก
下書きを保存しました|Draft saved|บันทึกฉบับร่างแล้ว
プレビューを保存しました・送信なし|Preview saved · nothing sent|บันทึกตัวอย่างแล้ว · ไม่มีการส่ง
デモ内の表示を変更します|This changes the demo display|เปลี่ยนการแสดงผลในเดโม
内容を確認して保存してください|Review the details before saving|ตรวจสอบรายละเอียดก่อนบันทึก
この内容で予約を保存しますか？|Save this booking?|บันทึกการจองตามนี้หรือไม่?
予約を確定しますか？|Confirm this booking?|ยืนยันการจองนี้หรือไม่?
この内容に変更しますか？|Apply these changes?|เปลี่ยนเป็นข้อมูลนี้หรือไม่?
この予約を取り消しますか？|Cancel this booking?|ยกเลิกการจองนี้หรือไม่?
来店を記録しますか？|Record this visit?|บันทึกการใช้บริการนี้หรือไม่?
返信の下書きを確認|Review reply draft|ตรวจสอบฉบับร่างข้อความตอบ
スタッフメモを確認|Review staff note|ตรวจสอบบันทึกของพนักงาน
表示内容を確認|Review display content|ตรวจสอบเนื้อหาที่จะแสดง
自動返信を再開しますか？|Resume auto-replies?|เปิดตอบอัตโนมัติอีกครั้งหรือไม่?
スタッフ対応に切り替えますか？|Hand this conversation over to staff?|ส่งต่อแชตนี้ให้พนักงานดูแลหรือไม่?
対応を完了しますか？|Mark this conversation as handled?|ระบุว่าดูแลแชตนี้เสร็จแล้วหรือไม่?
プレビューを取り消しますか？|Cancel this preview?|ยกเลิกตัวอย่างนี้หรือไม่?
新しい施術席|New treatment station|จุดให้บริการใหม่
メニュー画像を変更|Change menu image|เปลี่ยนภาพเมนู
メニュー全体を表示する|Show the whole menu|แสดงเมนูทั้งหมด
メニュー画像|Menu image|ภาพเมนู
祝日・休日スタッフ人数を使う日|Dates using holiday staffing|วันที่ใช้จำนวนพนักงานแบบวันหยุด
PNG・JPEG・WebPの500KB以下の画像を選んでください|Choose a PNG, JPEG or WebP image up to 500 KB|เลือกภาพ PNG, JPEG หรือ WebP ขนาดไม่เกิน 500 KB
別の画面で更新されました。保存前に内容を確認してください|Updated in another window. Review the details before saving.|มีการอัปเดตในอีกหน้าต่าง โปรดตรวจสอบก่อนบันทึก
`.trim().split('\n').map(line => line.split('|'));
for (const [key, en, th] of applicationRows) {
  if (!key || !en || !th || Object.hasOwn(messages.en, key)) throw new Error(`Invalid translation: ${key}`);
  messages.en[key] = en;
  messages.th[key] = th;
}

// Shared with the retained TEST adapter; no session or customer content is translated.
const testLabels = {
  "実TEST管理": [
    "TEST administration",
    "จัดการ TEST"
  ],
  "Googleでログイン": [
    "Sign in with Google",
    "เข้าสู่ระบบด้วย Google"
  ],
  "最新の情報に更新": [
    "Refresh data",
    "อัปเดตข้อมูล"
  ],
  "ログアウト": [
    "Sign out",
    "ออกจากระบบ"
  ],
  "ログインしてください": [
    "Sign in to view TEST data",
    "เข้าสู่ระบบเพื่อดูข้อมูล TEST"
  ],
  "ログインを準備しています…": [
    "Preparing sign-in…",
    "กำลังเตรียมการเข้าสู่ระบบ…"
  ],
  "Googleのボタンからログインしてください": [
    "Use the Google button to sign in",
    "กดปุ่ม Google เพื่อเข้าสู่ระบบ"
  ],
  "認証を確認しています…": [
    "Checking sign-in…",
    "กำลังตรวจสอบการเข้าสู่ระบบ…"
  ],
  "TESTデータを読み込んでいます…": [
    "Loading TEST data…",
    "กำลังโหลดข้อมูล TEST…"
  ],
  "実TESTデータを取得済み": [
    "TEST data loaded",
    "โหลดข้อมูล TEST แล้ว"
  ],
  "ログイン期限が切れました": [
    "Your session has expired",
    "เซสชันหมดอายุแล้ว"
  ],
  "接続を確認できませんでした": [
    "Could not confirm the connection",
    "ไม่สามารถยืนยันการเชื่อมต่อได้"
  ],
  "このローカルプレビューではGoogleログインを利用できません": [
    "Google sign-in is unavailable in this local preview",
    "ตัวอย่างในเครื่องนี้ไม่รองรับการเข้าสู่ระบบ Google"
  ],
  "TEST顧客": [
    "TEST customers",
    "ลูกค้า TEST"
  ],
  "TEST予約": [
    "TEST appointments",
    "การจอง TEST"
  ],
  "会話の要約": [
    "Conversation summary",
    "สรุปการสนทนา"
  ],
  "顧客を選ぶと、保存済みの要約を確認できます": [
    "Select a customer to view their saved summary",
    "เลือกลูกค้าเพื่อดูสรุปที่บันทึกไว้"
  ],
  "会話を読み込んでいます…": [
    "Loading conversation…",
    "กำลังโหลดการสนทนา…"
  ],
  "保存済みの会話要約はありません": [
    "No saved conversation summary",
    "ไม่มีสรุปการสนทนาที่บันทึกไว้"
  ],
  "対象のTEST顧客はありません": [
    "No eligible TEST customers",
    "ไม่มีลูกค้า TEST ที่เข้าเกณฑ์"
  ],
  "対象のTEST予約はありません": [
    "No eligible TEST appointments",
    "ไม่มีการจอง TEST ที่เข้าเกณฑ์"
  ],
  "架空TEST顧客の編集": [
    "Edit the synthetic TEST customer",
    "แก้ไขลูกค้า TEST จำลอง"
  ],
  "新しい顧客・予約の作成と、予約の変更・取消はこの画面では行いません。": [
    "Creating customers or appointments, rescheduling and cancellation are unavailable here.",
    "หน้านี้ไม่รองรับการสร้างลูกค้าหรือการจองใหม่ การเปลี่ยนเวลา หรือการยกเลิก"
  ],
  "登録済みTESTデータだけを表示します。会話は保存済み要約、予約は保存記録です。": [
    "Only registered TEST data is shown. Conversations are saved summaries and appointments are stored records.",
    "แสดงเฉพาะข้อมูล TEST ที่ลงทะเบียน การสนทนาเป็นสรุปที่บันทึกไว้ และการจองเป็นข้อมูลที่จัดเก็บไว้"
  ],
  "この画面を離れるとログアウトし、表示したTESTデータを消去します。": [
    "Leaving this page signs you out and clears the displayed TEST data.",
    "เมื่อออกจากหน้านี้ ระบบจะออกจากบัญชีและล้างข้อมูล TEST ที่แสดง"
  ],
  "登録済みアカウントのみ": [
    "Registered account only",
    "เฉพาะบัญชีที่ลงทะเบียน"
  ],
  "ログインをやり直してください": [
    "Please sign in again",
    "กรุณาเข้าสู่ระบบอีกครั้ง"
  ],
  "端末とサーバーの時刻に差があります": [
    "Your device clock differs from the server",
    "เวลาของอุปกรณ์แตกต่างจากเซิร์ฟเวอร์"
  ],
  "接続が時間内に完了しませんでした": [
    "The connection timed out",
    "การเชื่อมต่อหมดเวลา"
  ],
  "Googleログインを読み込めませんでした": [
    "Google sign-in could not be loaded",
    "ไม่สามารถโหลดการเข้าสู่ระบบ Google ได้"
  ],
  "取得した情報を確認できませんでした": [
    "The response could not be verified",
    "ไม่สามารถตรวจสอบข้อมูลที่ได้รับ"
  ],
  "もう一度ログインすると再確認できます。": [
    "Sign in again to retry.",
    "เข้าสู่ระบบอีกครั้งเพื่อลองใหม่"
  ],
  "予約確定": [
    "Confirmed",
    "ยืนยันแล้ว"
  ],
  "確認待ち": [
    "Awaiting confirmation",
    "รอการยืนยัน"
  ],
  "取消済み": [
    "Cancelled",
    "ยกเลิกแล้ว"
  ],
  "来店済み": [
    "Visited",
    "เข้าใช้บริการแล้ว"
  ],
  "お客様": [
    "Customer",
    "ลูกค้า"
  ],
  "スタッフ": [
    "Staff",
    "พนักงาน"
  ],
  "自動応答": [
    "Automated reply",
    "ตอบกลับอัตโนมัติ"
  ]
};
for (const [key, [en, th]] of Object.entries(testLabels)) {
  if (!Object.hasOwn(messages.en, key)) { messages.en[key] = en; messages.th[key] = th; }
}

const operationRows = `
TEST操作候補（無送信）|TEST operations (no sending)|การดำเนินการ TEST (ไม่ส่งข้อความ)
架空TEST顧客の用意|Prepare a synthetic TEST customer|เตรียมลูกค้า TEST จำลอง
架空TEST予約の作成|Create a synthetic TEST booking|สร้างการจอง TEST จำลอง
予約日時変更|Change booking date and time|เปลี่ยนวันและเวลาจอง
予約取消|Cancel booking|ยกเลิกการจอง
プロフィール変更|Update profile|เปลี่ยนข้อมูลส่วนตัว
言語・配信停止・bot・メモの変更|Update language, preferences, auto-replies and notes|เปลี่ยนภาษา การรับข้อความ การตอบอัตโนมัติ และบันทึก
CRM下書き保存|Save CRM draft|บันทึกฉบับร่าง CRM
この操作はまだ有効化されていません。|This action is not enabled.|ยังไม่เปิดใช้งานการดำเนินการนี้
情報が変わったため再確認してください。|The information has changed. Please review it again.|ข้อมูลเปลี่ยนแล้ว โปรดตรวจสอบอีกครั้ง
確認期限を過ぎました。もう一度内容を確認してください。|The review expired. Please review the details again.|หมดเวลายืนยันแล้ว โปรดตรวจสอบรายละเอียดอีกครั้ง
この対象は結果確認中です。繰り返し操作しないでください。|The result is being checked. Please do not repeat the action.|กำลังตรวจสอบผล โปรดอย่าดำเนินการซ้ำ
操作できる対象がありません。|No eligible record is available.|ไม่มีรายการที่ดำเนินการได้
再ログインしてください。|Please sign in again.|โปรดเข้าสู่ระบบอีกครั้ง
誕生日の利用同意と配信停止状態を確認してください。|Check birthday consent and messaging preferences.|ตรวจสอบความยินยอมใช้วันเกิดและการรับข้อความ
結果を確認できませんでした。確定操作の再送は同じ確認番号で結果を照会します。|The result could not be confirmed. Retry checks the same confirmation ID.|ยังยืนยันผลไม่ได้ การลองอีกครั้งจะตรวจสอบด้วยหมายเลขยืนยันเดิม
変更内容を確認しています…|Checking your changes…|กำลังตรวจสอบการเปลี่ยนแปลง…
まだ変更していません。内容を確認してください。|No changes yet. Please review the details.|ยังไม่มีการเปลี่ยนแปลง โปรดตรวจสอบรายละเอียด
開始（バンコク）|Start (Bangkok)|เริ่ม (เวลาประเทศไทย)
終了（バンコク）|End (Bangkok)|สิ้นสุด (เวลาประเทศไทย)
配信停止|Opt out of messages|ปิดรับข้อความ
bot停止|Pause auto-replies|หยุดตอบอัตโนมัติ
誕生日の利用同意|Birthday usage consent|ยินยอมใช้ข้อมูลวันเกิด
案内の種類|Notification type|ประเภทการแจ้งเตือน
プレビューON|Preview ON|เปิดตัวอย่าง
来店後の日数|Days after visit|จำนวนวันหลังใช้บริการ
来店前の分数|Minutes before visit|จำนวนนาทีก่อนนัด
実施メニュー|Treatment performed|บริการที่ได้รับจริง
操作|Action|การดำเนินการ
の確認| review| ตรวจสอบ
対象：|Record: |รายการ: 
 ／ 時刻：バンコク| / Time zone: Bangkok| / เขตเวลา: ประเทศไทย
取消（履歴を残す）|Cancel (keep history)|ยกเลิก (เก็บประวัติ)
この操作ではLINEを送信しません。確認期限は5分です。|This action sends no LINE message. Confirm within 5 minutes.|การดำเนินการนี้ไม่ส่ง LINE โปรดยืนยันภายใน 5 นาที
この内容でTESTに反映|Apply to TEST|บันทึกลง TEST
結果確認中です。新しい操作を作らず、この確認番号で結果を照会してください。|Checking the result. Use this confirmation ID; do not start a new action.|กำลังตรวจสอบผล โปรดใช้หมายเลขยืนยันนี้และอย่าเริ่มการดำเนินการใหม่
同じ確認番号で結果を照会|Check result with the same confirmation ID|ตรวจสอบผลด้วยหมายเลขยืนยันเดิม
TESTへの反映を確認しました（LINE送信なし）。|Saved to TEST (no LINE message sent).|บันทึกลง TEST แล้ว (ไม่มีการส่ง LINE)
反映できませんでした：|Could not save: |บันทึกไม่ได้: 
操作するにはログインしてください。|Sign in to continue.|เข้าสู่ระบบเพื่อดำเนินการต่อ
操作対象を読み込みました。|Available records loaded.|โหลดรายการที่ดำเนินการได้แล้ว
架空TEST顧客の用意を確認|Review synthetic TEST customer setup|ตรวจสอบการเตรียมลูกค้า TEST จำลอง
の結果を確認（再実行なし）| — check result without repeating| — ตรวจสอบผลโดยไม่ทำซ้ำ
Google予定との照合が完了しました（再実行・LINE送信なし）。|Checked against Google Calendar (no repeated action or LINE message).|ตรวจสอบกับ Google Calendar แล้ว (ไม่ทำซ้ำและไม่ส่ง LINE)
結果確認中です。再操作せず、時間をおいて同じ確認番号で照合してください。|The result is pending. Wait, then check the same confirmation ID without repeating the action.|กำลังรอผล โปรดรอสักครู่แล้วตรวจสอบหมายเลขยืนยันเดิมโดยไม่ดำเนินการซ้ำ
TESTカレンダーの空き時間|TEST calendar availability|เวลาว่างในปฏิทิน TEST
終了日（含まない）|End date (excluded)|วันสิ้นสุด (ไม่รวมวันนี้)
カレンダーを確認（閲覧のみ）|View calendar (read only)|ดูปฏิทิน (อ่านอย่างเดียว)
指定期間に使用中の時間はありません。|No busy times in this period.|ไม่มีช่วงเวลาที่ไม่ว่างในระยะเวลานี้
TEST予約：|TEST booking: |การจอง TEST: 
取消済みの履歴です。追加操作はできません。|This is a cancelled booking record. No further actions are available.|รายการนี้ถูกยกเลิกแล้ว ไม่สามารถดำเนินการเพิ่มเติมได้
変更後の日時（バンコク）|New date & time (Bangkok)|วันและเวลาใหม่ (เวลาประเทศไทย)
終了日時（バンコク）|End date & time (Bangkok)|วันและเวลาสิ้นสุด (เวลาประเทศไทย)
架空TEST予約の作成を確認|Review synthetic TEST booking|ตรวจสอบการจอง TEST จำลอง
日時変更を確認|Review date & time change|ตรวจสอบการเปลี่ยนวันและเวลา
取消内容を確認|Review cancellation|ตรวจสอบการยกเลิก
：管理設定|: management settings|: ตั้งค่าการดูแล
案内言語|Notification language|ภาษาที่ใช้แจ้งเตือน
スタッフ対応・bot停止|Staff handling · auto-replies paused|พนักงานดูแล · หยุดตอบอัตโนมัติ
管理設定を確認|Review management settings|ตรวจสอบการตั้งค่าดูแล
：プロフィール|: profile|: ข้อมูลส่วนตัว
誕生日（月-日）|Birthday (MM-DD)|วันเกิด (เดือน-วัน)
誕生日の利用同意あり|Consent to use birthday|ยินยอมใช้ข้อมูลวันเกิด
興味のある施術|Treatments of interest|บริการที่สนใจ
プロフィールを確認|Review profile|ตรวจสอบข้อมูลส่วนตัว
再来店|Return visit|กลับมาใช้บริการ
興味別|By interest|ตามความสนใจ
施術履歴別|By treatment history|ตามประวัติบริการ
CRM下書き：|CRM draft: |ฉบับร่าง CRM: 
プレビューON（実配信はOFF）|Preview ON (live sending OFF)|เปิดตัวอย่าง (ปิดการส่งจริง)
時刻（バンコク）|Time (Bangkok)|เวลา (ประเทศไทย)
CRM下書きを確認|Review CRM draft|ตรวจสอบฉบับร่าง CRM
候補を確認する日時（バンコク）|Preview date & time (Bangkok)|วันและเวลาที่จะตรวจสอบผู้รับ (ประเทศไทย)
送信候補を確認（無送信）|Check recipients (no sending)|ตรวจสอบผู้รับ (ไม่ส่งข้อความ)
この日時の候補はありません。|No recipients match this time.|ไม่มีผู้รับที่ตรงกับเวลานี้
操作対象を読み込む|Load available records|โหลดรายการที่ดำเนินการได้
`.trim().split('\n').map(line => line.split('|'));
for (const [key, en, th] of operationRows) {
  if (!key || !en || !th || Object.hasOwn(messages.en, key)) throw new Error(`Invalid translation: ${key}`);
  messages.en[key] = en;
  messages.th[key] = th;
}

const countUnits = {
  en: { 件: ['item', 'items'], 名: ['person', 'people'], 人: ['person', 'people'], 分: ['min', 'min'], 日: ['day', 'days'], 時間: ['hour', 'hours'], 週間: ['week', 'weeks'], 回: ['time', 'times'] },
  th: { 件: ['รายการ', 'รายการ'], 名: ['คน', 'คน'], 人: ['คน', 'คน'], 分: ['นาที', 'นาที'], 日: ['วัน', 'วัน'], 時間: ['ชั่วโมง', 'ชั่วโมง'], 週間: ['สัปดาห์', 'สัปดาห์'], 回: ['ครั้ง', 'ครั้ง'] },
};

export function translator(locale = 'ja') {
  const language = String(locale).split(/[-_]/)[0];
  return key => {
    if (key == null) return '';
    const value = String(key);
    if (!messages[language]) return value;
    if (Object.hasOwn(messages[language], value)) return messages[language][value];
    const count = value.match(/^(\d[\d,]*(?:\.\d+)?)\s*(件|名|人|分|日|時間|週間|回)$/u);
    if (count) {
      const unit = countUnits[language][count[2]][Number(count[1].replaceAll(',', '')) === 1 ? 0 : 1];
      return `${count[1]} ${unit}`;
    }
    return value;
  };
}
Object.assign(messages.en, {'メインへ':'Skip to content','保留中':'On hold','保留する':'Put on hold','再開する':'Resume','プレビューを保留':'Preview put on hold','プレビューを再開':'Preview resumed'});
Object.assign(messages.th, {'メインへ':'ไปยังเนื้อหา','保留中':'พักไว้','保留する':'พักไว้ก่อน','再開する':'ดำเนินการต่อ','プレビューを保留':'พักตัวอย่างไว้','プレビューを再開':'เปิดตัวอย่างต่อ'});

Object.assign(messages.en, {
  "接続の詳細": "Connection details",
  "停止中の接続設定を確認": "Check configuration while updates are stopped",
  "更新機能を停止中のときだけ確認できます。": "This check is available only while updates are stopped.",
  "接続設定を確認しています…": "Checking configuration…",
  "接続設定を確認しました。更新機能は停止中です。": "Configuration verified. Updates remain stopped.",
  "接続設定を確認できませんでした。": "Configuration could not be verified.",
  "予約・顧客・フォローの操作": "Appointments, customers and follow-ups",
  "操作できる対象だけ表示します。変更前に内容を確認できます。": "Only available operations are shown. Review changes before confirming."
});

Object.assign(messages.th, {
  "接続の詳細": "รายละเอียดการเชื่อมต่อ",
  "停止中の接続設定を確認": "ตรวจสอบการตั้งค่าเมื่อหยุดการอัปเดต",
  "更新機能を停止中のときだけ確認できます。": "ตรวจสอบได้เฉพาะเมื่อหยุดฟังก์ชันอัปเดตแล้ว",
  "接続設定を確認しています…": "กำลังตรวจสอบการตั้งค่า…",
  "接続設定を確認しました。更新機能は停止中です。": "ตรวจสอบการตั้งค่าแล้ว ฟังก์ชันอัปเดตยังหยุดอยู่",
  "接続設定を確認できませんでした。": "ไม่สามารถยืนยันการตั้งค่าได้",
  "予約・顧客・フォローの操作": "จัดการการจอง ลูกค้า และการติดตาม",
  "操作できる対象だけ表示します。変更前に内容を確認できます。": "แสดงเฉพาะรายการที่จัดการได้ ตรวจสอบการเปลี่ยนแปลงก่อนยืนยัน"
});

Object.assign(messages.en, {
  "編集内容と確認画面を破棄して、操作対象を読み直しますか？": "Discard your edits and review, and reload the available records?",
  "変更を破棄して再読込": "Discard changes and reload",
  "予約の操作": "Manage appointments",
  "顧客の編集": "Edit customers",
  "CRM下書き・送信候補": "CRM drafts and preview recipients",
  "デモに戻るとログアウトし、表示したTESTデータを消去します。": "Returning to the demo signs you out and clears displayed TEST data.",
  "保存済みの要約のみ表示します。返信送信はまだ接続していません。": "Saved summaries only. Sending replies is not connected yet."
});

Object.assign(messages.th, {
  "編集内容と確認画面を破棄して、操作対象を読み直しますか？": "ละทิ้งข้อมูลที่แก้ไขและหน้าตรวจสอบ แล้วโหลดรายการที่จัดการได้ใหม่หรือไม่?",
  "変更を破棄して再読込": "ละทิ้งการแก้ไขและโหลดใหม่",
  "予約の操作": "จัดการการจอง",
  "顧客の編集": "แก้ไขข้อมูลลูกค้า",
  "CRM下書き・送信候補": "แบบร่าง CRM และผู้รับตัวอย่าง",
  "デモに戻るとログアウトし、表示したTESTデータを消去します。": "เมื่อกลับไปที่ตัวอย่าง ระบบจะออกจากบัญชีและล้างข้อมูล TEST ที่แสดง",
  "保存済みの要約のみ表示します。返信送信はまだ接続していません。": "แสดงเฉพาะสรุปที่บันทึกไว้ ยังไม่ได้เชื่อมต่อการส่งข้อความตอบกลับ"
});
