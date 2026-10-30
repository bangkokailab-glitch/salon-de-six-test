// Approved FAQ copied without rewriting from work/salon-demo-next/index.html.
// Source language-map literal SHA-256: 02d69207b965ccf4b87cfc482ef42e0691ef31c2e7e2fb4a9d1912803272d087
// The 24 Japanese, English and Thai questions/answers remain byte-for-byte unchanged.
const source = {
  "ja": [
    {
      "id": "hours",
      "category": "基本情報",
      "question": "営業時間は？",
      "answer": "営業時間は10:00〜20:00です。年末年始とソンクランの休業日は、スタッフへご確認ください。"
    },
    {
      "id": "address",
      "category": "基本情報",
      "question": "お店の住所は？",
      "answer": "住所は595, 3rd Floor, 3-4 Soi Sukhumvit 33/1, Khlong Tan Nuea, Watthana, Bangkok 10110です。"
    },
    {
      "id": "phone",
      "category": "基本情報",
      "question": "電話番号は？",
      "answer": "お電話は0983918717へお願いします。"
    },
    {
      "id": "parking",
      "category": "基本情報",
      "question": "駐車場はありますか？",
      "answer": "専用駐車場はありません。近隣のEmQuartierの駐車料金は、現地でご確認ください。"
    },
    {
      "id": "payment",
      "category": "基本情報",
      "question": "支払い方法は？",
      "answer": "現金、QR決済、VISA・MasterCard・JCBをご利用いただけます。カード決済には3%の手数料がかかります。American ExpressとDinersはご利用いただけません。"
    },
    {
      "id": "bts",
      "category": "アクセス",
      "question": "最寄りのBTS駅は？",
      "answer": "最寄りのBTS駅はプロンポン駅です。"
    },
    {
      "id": "children",
      "category": "来店",
      "question": "子どもと一緒に来店できますか？",
      "answer": "お子様と一緒にご来店いただけます。"
    },
    {
      "id": "early",
      "category": "来店",
      "question": "予約時間より早く着いても大丈夫ですか？",
      "answer": "早めにご来店いただけますが、お待ちいただく場合があります。"
    },
    {
      "id": "same-day",
      "category": "予約",
      "question": "当日予約はできますか？",
      "answer": "当日のご予約希望も受け付けます。空き状況をスタッフが確認してご案内します。"
    },
    {
      "id": "late",
      "category": "来店",
      "question": "予約に遅れそうな場合は？",
      "answer": "遅れる場合は店舗へご連絡ください。施術時間が短くなる場合があります。"
    },
    {
      "id": "booking-request",
      "category": "予約",
      "question": "予約希望を送ると予約は確定しますか？",
      "answer": "まだ予約は確定しません。希望日時とメニューを伺い、スタッフが空き状況を確認してご連絡します。"
    },
    {
      "id": "all-genders",
      "category": "来店",
      "question": "男性も女性も利用できますか？",
      "answer": "男性も女性もご利用いただけます。"
    },
    {
      "id": "seasonal-closure",
      "category": "営業時間",
      "question": "年末年始とソンクランは営業していますか？",
      "answer": "年末年始とソンクランは休業します。具体的な休業日はスタッフへご確認ください。"
    },
    {
      "id": "hair-full-face-vio",
      "category": "脱毛",
      "question": "全身脱毛には顔やVIOも含まれますか？",
      "answer": "はい。全身脱毛には顔・VIOも含まれています。"
    },
    {
      "id": "pw-overview",
      "category": "PW",
      "question": "PWとは何ですか？",
      "answer": "Premium Whitening by ecxia Japanを使用した美容ホワイトニングです。歯の表面の着色汚れを除去し、本来の自然な白さへ導きます。"
    },
    {
      "id": "pw-not-medical",
      "category": "PW",
      "question": "PWは医療ホワイトニングですか？",
      "answer": "いいえ。PWは美容サービスです。歯科医院で行うホワイトニングとは施術方法や目的が異なります。"
    },
    {
      "id": "pw-time",
      "category": "PW",
      "question": "PWの施術時間はどのくらいですか？",
      "answer": "施術時間の目安は約45〜50分です。予約枠の長さはスタッフが確認します。"
    },
    {
      "id": "pw-food",
      "category": "PW",
      "question": "PWの施術後に食事制限はありますか？",
      "answer": "PW施術後の飲食制限はありません。"
    },
    {
      "id": "pw-coffee",
      "category": "PW",
      "question": "PWの施術後にコーヒーやお茶を飲んでも大丈夫ですか？",
      "answer": "はい。問題ありません。ただし、着色しやすい飲食物を頻繁に摂取すると再び着色することがあります。"
    },
    {
      "id": "pw-smoking",
      "category": "PW",
      "question": "PWの施術後にタバコを吸っても大丈夫ですか？",
      "answer": "問題ありませんが、喫煙は着色の原因になります。"
    },
    {
      "id": "pw-natural-white",
      "category": "PW",
      "question": "PWで本来の歯より白くなりますか？",
      "answer": "PWは歯の表面の着色を除去し、本来の自然な白さへ導く美容ホワイトニングです。本来の歯以上に白くする施術ではありません。"
    },
    {
      "id": "plasma-overview",
      "category": "Plasma",
      "question": "プラズマシャワーとは何ですか？",
      "answer": "特殊な低温プラズマを使用し、お肌を健やかな状態へ整える肌管理プログラムです。肌への負担を抑えながら、お肌のコンディションを整えます。"
    },
    {
      "id": "plasma-time",
      "category": "Plasma",
      "question": "プラズマシャワーの施術時間はどのくらいですか？",
      "answer": "施術時間の目安は約70分です。予約枠の長さはスタッフが確認します。"
    },
    {
      "id": "plasma-makeup",
      "category": "Plasma",
      "question": "プラズマシャワーにはメイクをしたまま行けますか？",
      "answer": "はい。メイクをしたままご来店いただけます。施術前にクレンジングを行います。"
    }
  ],
  "en": [
    {
      "id": "hours",
      "category": "基本情報",
      "question": "What are your opening hours?",
      "answer": "We are open from 10:00 to 20:00. Please ask our staff for the exact New Year and Songkran closure dates."
    },
    {
      "id": "address",
      "category": "基本情報",
      "question": "Where is the salon?",
      "answer": "Our address is 595, 3rd Floor, 3-4 Soi Sukhumvit 33/1, Khlong Tan Nuea, Watthana, Bangkok 10110."
    },
    {
      "id": "phone",
      "category": "基本情報",
      "question": "What is your phone number?",
      "answer": "Please call us at 0983918717."
    },
    {
      "id": "parking",
      "category": "基本情報",
      "question": "Is parking available?",
      "answer": "We do not have dedicated parking. Please check the parking charges at nearby EmQuartier on site."
    },
    {
      "id": "payment",
      "category": "基本情報",
      "question": "What payment methods do you accept?",
      "answer": "We accept cash, QR payment, Visa, MasterCard and JCB. Card payments incur a 3% fee. American Express and Diners are not accepted."
    },
    {
      "id": "bts",
      "category": "アクセス",
      "question": "Which BTS station is closest?",
      "answer": "The nearest BTS station is Phrom Phong."
    },
    {
      "id": "children",
      "category": "来店",
      "question": "Can I bring my child?",
      "answer": "You may visit with your child."
    },
    {
      "id": "early",
      "category": "来店",
      "question": "Can I arrive early for my appointment?",
      "answer": "You may arrive early, but you might need to wait."
    },
    {
      "id": "same-day",
      "category": "予約",
      "question": "Can I book for today?",
      "answer": "We accept same-day appointment requests. Our staff will check availability and get back to you."
    },
    {
      "id": "late",
      "category": "来店",
      "question": "What if I am running late?",
      "answer": "Please contact the salon if you will be late. Your treatment time may be shortened."
    },
    {
      "id": "booking-request",
      "category": "予約",
      "question": "Is my appointment confirmed when I send a booking request?",
      "answer": "Not yet. We will ask for your preferred date, time and service, then staff will check availability and contact you."
    },
    {
      "id": "all-genders",
      "category": "来店",
      "question": "Do you serve both men and women?",
      "answer": "Both men and women are welcome."
    },
    {
      "id": "seasonal-closure",
      "category": "営業時間",
      "question": "Are you open over New Year and Songkran?",
      "answer": "We close over New Year and Songkran. Please ask our staff for the exact dates."
    },
    {
      "id": "hair-full-face-vio",
      "category": "脱毛",
      "question": "Does full-body hair removal include the face and VIO?",
      "answer": "Yes. Full-body hair removal includes the face and VIO."
    },
    {
      "id": "pw-overview",
      "category": "PW",
      "question": "What is PW?",
      "answer": "PW is a cosmetic whitening service using Premium Whitening by ecxia Japan. It removes surface stains from the teeth to bring out their natural whiteness."
    },
    {
      "id": "pw-not-medical",
      "category": "PW",
      "question": "Is PW medical teeth whitening?",
      "answer": "No. PW is a cosmetic service. Its method and purpose differ from whitening performed at a dental clinic."
    },
    {
      "id": "pw-time",
      "category": "PW",
      "question": "How long does a PW treatment take?",
      "answer": "The treatment itself takes approximately 45–50 minutes. Please ask staff to confirm the booking slot length."
    },
    {
      "id": "pw-food",
      "category": "PW",
      "question": "Are there food or drink restrictions after PW?",
      "answer": "There are no food or drink restrictions after PW."
    },
    {
      "id": "pw-coffee",
      "category": "PW",
      "question": "Can I drink coffee or tea after PW?",
      "answer": "Yes. However, frequently consuming foods or drinks that cause staining may stain the teeth again."
    },
    {
      "id": "pw-smoking",
      "category": "PW",
      "question": "Can I smoke after PW?",
      "answer": "Yes, but smoking can cause staining."
    },
    {
      "id": "pw-natural-white",
      "category": "PW",
      "question": "Can PW make my teeth whiter than their natural color?",
      "answer": "PW is a cosmetic whitening service that removes surface stains and brings out the teeth’s natural whiteness. It does not make teeth whiter than their natural color."
    },
    {
      "id": "plasma-overview",
      "category": "Plasma",
      "question": "What is a plasma shower?",
      "answer": "It is a skin-care program using special low-temperature plasma to help maintain skin in healthy condition while limiting strain on the skin."
    },
    {
      "id": "plasma-time",
      "category": "Plasma",
      "question": "How long does a plasma shower take?",
      "answer": "The treatment itself takes approximately 70 minutes. Please ask staff to confirm the booking slot length."
    },
    {
      "id": "plasma-makeup",
      "category": "Plasma",
      "question": "Can I come wearing makeup for a plasma shower?",
      "answer": "Yes. You may arrive wearing makeup. Cleansing is done before the treatment."
    }
  ],
  "th": [
    {
      "id": "hours",
      "category": "基本情報",
      "question": "ร้านเปิดกี่โมง?",
      "answer": "ร้านเปิดเวลา 10:00–20:00 น. กรุณาสอบถามพนักงานเกี่ยวกับวันหยุดช่วงปีใหม่และสงกรานต์ที่แน่นอน"
    },
    {
      "id": "address",
      "category": "基本情報",
      "question": "ร้านอยู่ที่ไหน?",
      "answer": "ที่อยู่ของร้านคือ 595 ชั้น 3, 3-4 ซอยสุขุมวิท 33/1 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110"
    },
    {
      "id": "phone",
      "category": "基本情報",
      "question": "เบอร์โทรของร้านคืออะไร?",
      "answer": "ติดต่อร้านทางโทรศัพท์ได้ที่ 0983918717"
    },
    {
      "id": "parking",
      "category": "基本情報",
      "question": "มีที่จอดรถไหม?",
      "answer": "ร้านไม่มีที่จอดรถเฉพาะ กรุณาตรวจสอบค่าจอดรถที่ EmQuartier ซึ่งอยู่ใกล้เคียง ณ สถานที่"
    },
    {
      "id": "payment",
      "category": "基本情報",
      "question": "รับชำระเงินด้วยวิธีใด?",
      "answer": "รับเงินสด ชำระผ่าน QR, Visa, MasterCard และ JCB การชำระด้วยบัตรมีค่าธรรมเนียม 3% ไม่รับ American Express และ Diners"
    },
    {
      "id": "bts",
      "category": "アクセス",
      "question": "สถานี BTS ที่ใกล้ที่สุดคือสถานีไหน?",
      "answer": "สถานี BTS ที่ใกล้ที่สุดคือพร้อมพงษ์"
    },
    {
      "id": "children",
      "category": "来店",
      "question": "พาเด็กมาด้วยได้ไหม?",
      "answer": "สามารถพาเด็กมาด้วยได้"
    },
    {
      "id": "early",
      "category": "来店",
      "question": "มาก่อนเวลานัดได้ไหม?",
      "answer": "สามารถมาก่อนเวลานัดได้ แต่อาจต้องรอ"
    },
    {
      "id": "same-day",
      "category": "予約",
      "question": "จองคิววันนี้ได้ไหม?",
      "answer": "สามารถส่งคำขอจองภายในวันเดียวกันได้ พนักงานจะตรวจสอบคิวว่างและแจ้งกลับ"
    },
    {
      "id": "late",
      "category": "来店",
      "question": "หากไปสายควรทำอย่างไร?",
      "answer": "หากจะมาสาย กรุณาติดต่อร้าน ระยะเวลาการทำทรีตเมนต์อาจสั้นลง"
    },
    {
      "id": "booking-request",
      "category": "予約",
      "question": "ส่งคำขอจองแล้วถือว่าจองสำเร็จหรือยัง?",
      "answer": "ยังไม่ถือว่าจองสำเร็จ เราจะสอบถามวัน เวลา และบริการที่ต้องการ จากนั้นพนักงานจะตรวจสอบคิวว่างและติดต่อกลับ"
    },
    {
      "id": "all-genders",
      "category": "来店",
      "question": "ผู้หญิงและผู้ชายใช้บริการได้ไหม?",
      "answer": "ทั้งผู้หญิงและผู้ชายสามารถใช้บริการได้"
    },
    {
      "id": "seasonal-closure",
      "category": "営業時間",
      "question": "ช่วงปีใหม่และสงกรานต์เปิดไหม?",
      "answer": "ร้านหยุดในช่วงปีใหม่และสงกรานต์ กรุณาสอบถามพนักงานเกี่ยวกับวันที่หยุดที่แน่นอน"
    },
    {
      "id": "hair-full-face-vio",
      "category": "脱毛",
      "question": "กำจัดขนทั่วตัวรวมใบหน้าและ VIO หรือไม่?",
      "answer": "รวมค่ะ/ครับ การกำจัดขนทั่วตัวรวมใบหน้าและ VIO"
    },
    {
      "id": "pw-overview",
      "category": "PW",
      "question": "PW คืออะไร?",
      "answer": "PW คือบริการฟอกสีฟันเพื่อความงามที่ใช้ Premium Whitening by ecxia Japan ช่วยขจัดคราบสีบนผิวฟัน เพื่อให้เห็นความขาวตามธรรมชาติของฟัน"
    },
    {
      "id": "pw-not-medical",
      "category": "PW",
      "question": "PW เป็นการฟอกสีฟันทางการแพทย์หรือไม่?",
      "answer": "ไม่ใช่ PW เป็นบริการเพื่อความงาม วิธีและวัตถุประสงค์แตกต่างจากการฟอกสีฟันที่คลินิกทันตกรรม"
    },
    {
      "id": "pw-time",
      "category": "PW",
      "question": "ทำ PW ใช้เวลานานเท่าไร?",
      "answer": "ระยะเวลาทำบริการประมาณ 45–50 นาที กรุณาให้พนักงานยืนยันความยาวของช่วงเวลาจอง"
    },
    {
      "id": "pw-food",
      "category": "PW",
      "question": "หลังทำ PW ต้องงดอาหารหรือเครื่องดื่มหรือไม่?",
      "answer": "หลังทำ PW ไม่มีข้อจำกัดเรื่องอาหารหรือเครื่องดื่ม"
    },
    {
      "id": "pw-coffee",
      "category": "PW",
      "question": "หลังทำ PW ดื่มกาแฟหรือชาได้ไหม?",
      "answer": "ได้ อย่างไรก็ตาม การรับประทานอาหารหรือเครื่องดื่มที่ทำให้เกิดคราบสีบ่อย ๆ อาจทำให้ฟันกลับมามีคราบได้"
    },
    {
      "id": "pw-smoking",
      "category": "PW",
      "question": "หลังทำ PW สูบบุหรี่ได้ไหม?",
      "answer": "ได้ แต่การสูบบุหรี่อาจทำให้เกิดคราบสีบนฟัน"
    },
    {
      "id": "pw-natural-white",
      "category": "PW",
      "question": "PW ทำให้ฟันขาวกว่าสีธรรมชาติได้ไหม?",
      "answer": "PW เป็นบริการเพื่อความงามที่ขจัดคราบสีบนผิวฟันและช่วยให้เห็นความขาวตามธรรมชาติ ไม่ได้ทำให้ฟันขาวกว่าสีธรรมชาติ"
    },
    {
      "id": "plasma-overview",
      "category": "Plasma",
      "question": "พลาสมาชาวเวอร์คืออะไร?",
      "answer": "เป็นโปรแกรมดูแลผิวที่ใช้พลาสมาอุณหภูมิต่ำชนิดพิเศษ เพื่อช่วยให้ผิวอยู่ในสภาพที่ดีโดยลดภาระต่อผิว"
    },
    {
      "id": "plasma-time",
      "category": "Plasma",
      "question": "พลาสมาชาวเวอร์ใช้เวลานานเท่าไร?",
      "answer": "ระยะเวลาทำบริการประมาณ 70 นาที กรุณาให้พนักงานยืนยันความยาวของช่วงเวลาจอง"
    },
    {
      "id": "plasma-makeup",
      "category": "Plasma",
      "question": "แต่งหน้ามาทำพลาสมาชาวเวอร์ได้ไหม?",
      "answer": "ได้ สามารถแต่งหน้ามาที่ร้านได้ โดยจะมีการทำความสะอาดผิวก่อนรับบริการ"
    }
  ]
};

export const APPROVED_FAQ = Object.freeze(source.ja.map(item => {
  const en = source.en.find(row => row.id === item.id);
  const th = source.th.find(row => row.id === item.id);
  return Object.freeze({ id: item.id, category: item.category, question: item.question, answer: item.answer,
    questionEn: en.question, answerEn: en.answer, questionTh: th.question, answerTh: th.answer, published: true });
}));

export function createApprovedFaq() {
  return APPROVED_FAQ.map(item => ({ ...item }));
}
