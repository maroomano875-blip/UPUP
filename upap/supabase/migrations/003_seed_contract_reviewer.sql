insert into agents (
  id, profession_id, name, name_ar, type,
  version, status,
  supported_countries, supported_languages,
  supported_currencies,
  input_types, confidence_threshold, is_active
)
select
  'law.contract-reviewer',
  p.id,
  'Contract Reviewer',
  'مراجع العقود',
  'contract-reviewer',
  '1.0.0',
  'active',
  array['US','GB','SA','AE','EG','SY'],
  array['en-US','en-GB','ar','ar-SA','ar-EG','ar-SY'],
  array[]::text[],
  array['pdf','image','text'],
  0.8,
  true
from professions p
where p.slug = 'law'
on conflict (id) do update set is_active = true, status = 'active';
