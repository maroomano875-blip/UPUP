# UPAP — نظام تشغيل المهن (Universal Professions AI Platform)

منصة وكلاء ذكاء اصطناعي لمراجعة مستندات 20 مهنة. يرفع المستخدم ملفاً (PDF، صورة، Word، Excel) فيستخرج الوكيل المعلومات ويفحص المستند ويعيد تقريراً منظماً مع درجة ثقة وتنبيهات وأسئلة للمستخدم.

الموقع المنشور: https://upap-olive.vercel.app

## المبدأ
- الأرقام والتواريخ تُفحص بالكود لا بالنموذج: النموذج ينقل الرقم المعلن والأجزاء، والتطبيق يجمعها ويقارنها (lib/verify.ts).
- لا يُصحَّح أي شيء بصمت؛ ما يبدو خاطئاً يُعرض كملاحظة مع تفسير نصي.
- المخرجات مراجعة مساعدة وليست رأياً مهنياً نهائياً.

## الحالة
- 20 مهنة، ولكل مهنة وكيل مراجع واحد على الأقل (القائمة في data/catalog.ts).
- وكلاء المهن يشتركون في عقد مخرجات واحد وواجهة عرض واحدة (ui/components/GenericResult.tsx)؛ قارئ الفواتير له مخطط خاص.
- محرك AI بسلسلة مزوّدين احتياطية (Groq ثم Gemini ثم Cloudflare ثم OpenRouter) كلها بخطط مجانية.
- تحديد معدل الطلبات لكل IP، وسجل تدقيق، وRow Level Security مفعّل على كل الجداول.

## بنية المشروع
    app/api/agents/<agent>/route.ts : مسار كل وكيل
    lib/agentRoute.ts : المعالج المشترك للمسارات
    lib/readUpload.ts : قراءة الملفات
    lib/verify.ts : فحص الأرقام والتواريخ
    core/factory/createAgent.ts : محرك الوكيل
    core/engine/ : المزوّدون والتدقيق وقاعدة البيانات
    professions/ : إعدادات وتعليمات كل وكيل
    data/catalog.ts : فهرس المهن والوكلاء
    supabase/migrations/ : ترحيلات قاعدة البيانات
    tests/ : اختبارات آلية
    scripts/new-agent.py : مولّد وكيل جديد

## التشغيل والاختبار
1. npm install
2. انسخ .env.example إلى .env.local واملأ القيم
3. npm run dev
4. npm test لاختبار منطق الأرقام والتواريخ

## إضافة وكيل جديد
    python3 scripts/new-agent.py --profession <مهنة> --agent <slug> --name-en "..." --name-ar "..." --desc-ar "..." --prompt-file /tmp/p.txt
ملف التعليمات يجب أن يحوي {country} و{language}. بعد التوليد شغّل ملف seed في Supabase.

## النشر
GitHub ثم Vercel، مع نسخ متغيرات .env.local إلى إعدادات Vercel. تحديد المعدل: RATE_LIMIT_HOUR (الافتراضي 8) و RATE_LIMIT_DAY_GLOBAL (الافتراضي 200).

## غير منجز بعد
حسابات المستخدمين والاشتراك بـ USDT، وترقية قارئ الفواتير لفحص الأرقام بالكود.

القواعد الثابتة للعمل في CLAUDE.md.
