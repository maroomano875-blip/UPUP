insert into agents (
  id, profession_id, name, name_ar, type,
  version, status,
  supported_countries, supported_languages,
  supported_currencies,
  input_types, confidence_threshold, is_active
)
select
  'education.exam-reviewer', p.id, 'Exam Reviewer', 'مراجع الاختبارات', 'exam-reviewer',
  '1.0.0', 'active',
  array['US','GB','FR','DE','ES','IT','SA','AE','EG','SY','JO','LB','MA','DZ','IQ','KW','QA','BH','OM','YE','TR','CA','AU','IN','PK','ID','BR'],
  array['en-US','en-GB','en-IN','ar','ar-SA','ar-EG','ar-SY','fr','es','tr','de','it','pt-BR','id','hi','ur'],
  array[]::text[],
  array['pdf','image','text'], 0.8, true
from professions p
where p.slug = 'education'
on conflict (id) do update set is_active = true, status = 'active';
