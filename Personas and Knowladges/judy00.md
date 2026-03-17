
الخطوة ١ (تصميم الشخصيات) خلّصناها: مليكة، جودي التعليمية الأردنية، وسبع.
لتثبيت السلوك بدون كسر الموقع/الصوتيات عند تبديل الشخصيات، لازم “مصدر حقيقة واحد” للبيانات.
إذن الخطوة ٢ المنطقية: بناء BossFile v1 (ملف مدير موحّد) بحدّ أدنى من الحقول للأردن ومصر، خصوصاً قسم التعليم والتخصصات المستقبلية للتوجيهي.
الخلاصة:
الخطوة الثانية = تجهيز BossFile v1. املأ القالب المختصر أدناه وأرسله لي، وأرجع لك نسخة نهائية موصولة بكل الشخصيات.

قالب BossFile v1 (انسخه واملأه)
{
"brand": {
"osName": "judyOS7",
"noCommissionPolicy": true,
"freeAdvicePolicy": true,
"localePrimary": "ar-EG/ar-JO",
"toneNotes": "جار/جارِة محترمة؛ حازمة عند اللزوم"
},
"contacts": {
"whatsappMain": "[+962/ +20 رقم واتساب التسليم البشري]",
"educationDesk": "[واتساب/هاتف مرشد التعليم]",
"tourismDesk": "[اختياري]",
"complaints": "[اختياري]"
},
"locations": [
{ "name": "نزلة السمان - الجيزة", "meetingPoints": ["..."], "maps": ["https://..."] },
{ "name": "[BaseArea–Jordan] - الأردن", "meetingPoints": ["..."], "maps": ["https://..."] }
],
"education": {
"targetAudiences": ["توجيهي", "بكالوريوس", "دراسات عليا", "مهارات/كورسات"],
"universities": [
{
"name": "جامعة الزيتونة الأردنية",
"city": "عمّان",
"portals": {"main":"https://...","admissions":"https://...","calendar":"https://..."},
"contacts": {"admissions":"+962...", "housing":"+962...", "studentAffairs":"+962..."},
"tuitionRange": "تقريبي أو نطاق",
"notablePrograms": ["..."]
},
{
"name": "الجامعة الأردنية",
"city": "عمّان",
"portals": {"main":"https://...","admissions":"https://...","calendar":"https://..."},
"contacts": {"admissions":"+962...", "housing":"+962...", "studentAffairs":"+962..."},
"tuitionRange": "تقريبي",
"notablePrograms": ["..."]
}
// أضف بقية الجامعات الحكومية/الخاصة المختصرة (يرموك، الهاشمية، GJU، PSUT، applied science...).
],
"majorsCatalog": [
{
"major": "محاسبة",
"automationRisk": "عالٍ/متوسط/منخفض",
"demandSignals": ["ديوان الخدمة المدنية: ...", "منصات توظيف: ..."],
"skillStack": ["Analytics", "ERP", "Tax", "RPA"],
"altTracks": ["FinTech", "RegTech", "Data for Audit"],
"unisOffering": ["الزيتونة","الجامعة الأردنية","..."],
"tuitionRange": "نطاق",
"scholarships": ["منح الجامعة","جمعيات","وزارات"]
},
{
"major": "[تخصص ٢]",
"automationRisk": "...",
"demandSignals": ["..."],
"skillStack": ["..."],
"altTracks": ["..."],
"unisOffering": ["..."],
"tuitionRange": "...",
"scholarships": ["..."]
}
],
"studySupport": {
"guides": ["روابط خطط دراسية رسمية", "بنوك أسئلة حيث يُسمح", "قنوات موثوقة"],
"tools": ["جداول زمنية", "Checklists", "اختبارات ذاتية قصيرة"]
},
"researchSupport": {
"repositories": ["مستودعات جامعات", "مجلات OA", "أطروحات"],
"querySynonyms": {"ar":[["ذكاء اصطناعي","تعلم آلي"]],"en":[["AI","Machine Learning"]]}
},
"policies": {
"payOnArrivalAllowed": false,
"onlineFirst": true
}
},
"tourism": {
"onlineOnly": true,
"partners": ["اختياري"],
"services": ["إرشاد رقمي", "تنسيق تواصل فقط"],
"notes": "سياحة ثانوية اختيارية"
},
"egyptServices": {
"pyramids_tour": {"available": true, "durationMin": 120, "priceRange": "متغير"},
"horses_carriages": {"available": true, "animalWelfare": true},
"coworking_bazar_hotel": {"available": true, "hours": "10:00-22:00"}
},
"policies": {
"harassment": {"levels":[1,2,3], "escalationWhatsApp":"[whatsappMain]"},
"negotiation": {"allowReceptionBridge": true, "principles": ["وضوح السعر","تأكيد التوافر","خصم مباشر"]}
},
"personae": {
"malika": {"active": true},
"judy_edu_jordan": {"active": true, "baseArea":"[BaseArea–Jordan]"},
"saba": {"active": true},
"judy_tts": {"active": true, "ttsMaxSentences": 2}
}
}

أرسل لي:

[BaseArea–Jordan]
أرقام واتساب/هواتف: whatsappMain + educationDesk
الجامعات المراد تغطيتها أولاً وروابط بواباتها
5–8 تخصصات أساسية مع تقدير مخاطر الأتمتة ونطاقات الأقساط إن وُجدت
أي سياسات خصم/منح معروفة وروابطها
بعد استلامها، أرجع لك BossFile v1 مدمج، وأربطه فوراً ببرومبتات مليكة/جودي/سبع، ونبدأ اختبار سيناريوهات حقيقية.

No file chosen
