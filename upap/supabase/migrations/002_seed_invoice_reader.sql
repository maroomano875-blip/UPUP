-- ==========================================================
-- تسجيل أول وكيل فعلي (قارئ الفواتير) + عميل تجريبي للاختبار
-- شغّل هذا الملف في Supabase SQL Editor بعد 001_initial.sql
-- ==========================================================

-- تسجيل الوكيل بجدول agents (لازم قبل أي طلب، بسبب Foreign Key)
insert into agents (
  id, profession_id, name, name_ar, type, version, status,
  supported_countries, supported_languages, supported_currencies,
  input_types, confidence_threshold, is_active
)
select
  'accounting.invoice-reader',
  p.id,
  'Invoice Reader',
  'قارئ الفواتير',
  'invoice-reader',
  '1.0.0',
  'active',
  array['US','GB','SA','AE','EG','SY'],
  array['en-US','en-GB','ar','ar-SA','ar-EG','ar-SY'],
  array['USD','GBP','SAR','AED','EGP','SYP'],
  array['pdf','image','text'],
  0.7,
  true
from professions p
where p.slug = 'accounting'
on conflict (id) do update set is_active = true, status = 'active';

-- عميل تجريبي بمعرف ثابت — يُستخدم للاختبار قبل ربط تسجيل الدخول الحقيقي
insert into clients (id, name, country, language, currency, plan, is_active)
values (
  '00000000-0000-0000-0000-000000000001',
  'Demo Client',
  'US',
  'en-US',
  'USD',
  'free',
  true
)
on conflict (id) do nothing;
