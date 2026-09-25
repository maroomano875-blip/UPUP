-- UPAP — Universal Professions AI Platform
-- مخطط قاعدة البيانات الكاملة v1
-- الصق هذا الملف في Supabase → SQL Editor → Run

create table if not exists countries (
  code text primary key,                -- US, SA, SY, AE...
  name_ar text not null,
  name_en text not null,
  flag text,
  currency text not null,
  currency_symbol text,
  languages text[] default '{}',
  primary_language text,
  text_direction text default 'ltr',
  tax_system text,
  tax_rates jsonb default '{}',
  regulations text[] default '{}',
  date_format text,
  number_format text,
  timezone text,
  business_hours jsonb,
  invoice_fields jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists professions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,            -- accounting, law, medicine...
  name_ar text not null,
  name_en text not null,
  icon text,                            -- إيموجي أو اسم أيقونة
  description_ar text,
  description_en text,
  color text,                           -- لون UI المهنة
  is_active boolean default false,      -- false = قيد الإعداد
  created_at timestamptz default now()
);

create table if not exists agents (
  id text primary key,                  -- profession.type: accounting.invoice-reader
  profession_id uuid references professions(id) on delete restrict,
  name text not null,
  name_ar text not null,
  type text not null,
  version text not null default '1.0.0',
  status text not null default 'coming_soon',
  supported_countries text[] default '{}',
  supported_languages text[] default '{}',
  supported_currencies text[] default '{}',
  input_types text[] default '{}',
  config jsonb default '{}',            -- AgentConfig كامل
  confidence_threshold numeric default 0.75,
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  profession_id uuid references professions(id),
  name text,
  country text references countries(code),
  language text default 'en',
  currency text default 'USD',
  plan text default 'free',             -- free, starter, pro, enterprise
  plan_expires_at timestamptz,
  usdt_wallet text,                     -- محفظة USDT للدفع
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id) on delete restrict,
  client_id uuid references clients(id) on delete cascade,
  country text references countries(code),
  language text,
  input_data jsonb default '{}',
  output_data jsonb,
  raw_output jsonb,                     -- قبل المراجعة
  confidence_score numeric,
  status text not null default 'received',
  processing_time_ms integer,
  provider_used text,                   -- openrouter | gemini
  needs_human_review boolean default false,
  human_reviewed_at timestamptz,
  human_reviewer_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists training_data (
  id uuid primary key default gen_random_uuid(),
  agent_id text references agents(id) on delete cascade,
  request_id uuid references requests(id),
  country text,
  language text,
  input_data jsonb not null,
  expected_output jsonb,
  actual_output jsonb,
  human_correction jsonb,              -- التصحيح البشري يبني الميزة التنافسية
  feedback text,
  quality_score numeric,
  created_at timestamptz default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id text,                        -- client_id أو "system"
  action text not null,
  resource_type text not null,
  resource_id text not null,
  metadata jsonb default '{}',
  country text,
  language text,
  ip text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists compliance_checks (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  country text,
  regulation text,                      -- gdpr, hipaa, pdpl...
  passed boolean not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  plan text not null,
  status text not null default 'pending', -- pending, active, expired, cancelled
  agents_included text[] default '{}',    -- قائمة الوكلاء المشمولة
  price_usd numeric,
  payment_method text default 'usdt',
  payment_tx_id text,                     -- معرف معاملة TronScan
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- فهارس الأداء
create index if not exists idx_requests_client on requests(client_id);
create index if not exists idx_requests_agent on requests(agent_id);
create index if not exists idx_requests_status on requests(status);
create index if not exists idx_requests_country on requests(country);
create index if not exists idx_requests_created on requests(created_at desc);
create index if not exists idx_audit_resource on audit_log(resource_type, resource_id);
create index if not exists idx_audit_actor on audit_log(actor_id);
create index if not exists idx_audit_created on audit_log(created_at desc);
create index if not exists idx_training_agent on training_data(agent_id, country, language);
create index if not exists idx_subscriptions_client on subscriptions(client_id, status);

-- Row Level Security (عزل تام بين العملاء)
alter table requests enable row level security;
alter table clients enable row level security;
alter table subscriptions enable row level security;
alter table training_data enable row level security;

-- العميل يرى فقط طلباته الخاصة
create policy "clients_own_requests"
  on requests for all
  using (
    client_id in (select id from clients where user_id = auth.uid())
  );

-- العميل يرى بياناته فقط
create policy "clients_own_data"
  on clients for all
  using (user_id = auth.uid());

-- العميل يرى اشتراكاته فقط
create policy "clients_own_subscriptions"
  on subscriptions for all
  using (
    client_id in (select id from clients where user_id = auth.uid())
  );

-- البيانات الأولية — المهن الأساسية
insert into professions (slug, name_ar, name_en, icon, color, is_active) values
  ('accounting',   'محاسبة',              'Accounting',      '📊', '#2F5D45', true),
  ('law',          'محاماة وقانون',        'Law',             '⚖️', '#14213D', true),
  ('medicine',     'طب وصحة',             'Medicine',        '🏥', '#8C3A2B', false),
  ('engineering',  'هندسة',               'Engineering',     '🏗️', '#A9782F', false),
  ('education',    'تعليم',               'Education',       '#3B4A63', '📚', false),
  ('marketing',    'تسويق',               'Marketing',       '📢', '#6B3FA0', false),
  ('hr',           'موارد بشرية',          'Human Resources', '👥', '#1A6B8A', false),
  ('real_estate',  'عقارات',              'Real Estate',     '🏠', '#5C4A1E', false),
  ('insurance',    'تأمين',               'Insurance',       '🛡️', '#0F4C75', false),
  ('translation',  'ترجمة',               'Translation',     '🌐', '#2D6A4F', false),
  ('programming',  'برمجة وتقنية',        'Programming',     '💻', '#1B1B2F', false),
  ('design',       'تصميم إبداعي',        'Design',          '🎨', '#B5451B', false),
  ('ecommerce',    'تجارة إلكترونية',     'E-Commerce',      '🛒', '#145A32', false),
  ('logistics',    'لوجستيات',            'Logistics',       '🚚', '#2C3E50', false),
  ('agriculture',  'زراعة',               'Agriculture',     '🌾', '#1E8449', false),
  ('tourism',      'سياحة وضيافة',        'Tourism',         '✈️', '#17588E', false),
  ('contracting',  'مقاولات وبناء',       'Contracting',     '🏗️', '#6E2F0E', false),
  ('consulting',   'استشارات أعمال',      'Consulting',      '💼', '#1F3A5F', false),
  ('journalism',   'صحافة وإعلام',        'Journalism',      '📰', '#4A235A', false),
  ('industry',     'صناعة وتصنيع',        'Industry',        '🏭', '#212F3D', false)
on conflict (slug) do nothing;

insert into countries (code, name_ar, name_en, flag, currency, currency_symbol, primary_language, text_direction) values
  ('US', 'الولايات المتحدة',       'United States',  '🇺🇸', 'USD', '$',   'en-US', 'ltr'),
  ('GB', 'المملكة المتحدة',        'United Kingdom', '🇬🇧', 'GBP', '£',   'en-GB', 'ltr'),
  ('FR', 'فرنسا',                  'France',         '🇫🇷', 'EUR', '€',   'fr',    'ltr'),
  ('DE', 'ألمانيا',                'Germany',        '🇩🇪', 'EUR', '€',   'de',    'ltr'),
  ('CA', 'كندا',                   'Canada',         '🇨🇦', 'CAD', 'CA$', 'en-CA', 'ltr'),
  ('AU', 'أستراليا',               'Australia',      '🇦🇺', 'AUD', 'A$',  'en-AU', 'ltr'),
  ('SA', 'المملكة العربية السعودية','Saudi Arabia',  '🇸🇦', 'SAR', 'ر.س', 'ar-SA', 'rtl'),
  ('AE', 'الإمارات العربية المتحدة','UAE',           '🇦🇪', 'AED', 'د.إ', 'ar-AE', 'rtl'),
  ('EG', 'مصر',                    'Egypt',          '🇪🇬', 'EGP', 'ج.م', 'ar-EG', 'rtl'),
  ('SY', 'سوريا',                  'Syria',          '🇸🇾', 'SYP', 'ل.س', 'ar-SY', 'rtl'),
  ('JO', 'الأردن',                 'Jordan',         '🇯🇴', 'JOD', 'د.أ', 'ar',    'rtl'),
  ('LB', 'لبنان',                  'Lebanon',        '🇱🇧', 'LBP', 'ل.ل', 'ar',    'rtl'),
  ('MA', 'المغرب',                 'Morocco',        '🇲🇦', 'MAD', 'د.م', 'ar',    'rtl'),
  ('DZ', 'الجزائر',                'Algeria',        '🇩🇿', 'DZD', 'د.ج', 'ar',    'rtl'),
  ('IQ', 'العراق',                 'Iraq',           '🇮🇶', 'IQD', 'د.ع', 'ar',    'rtl'),
  ('KW', 'الكويت',                 'Kuwait',         '🇰🇼', 'KWD', 'د.ك', 'ar',    'rtl'),
  ('QA', 'قطر',                    'Qatar',          '🇶🇦', 'QAR', 'ر.ق', 'ar',    'rtl'),
  ('BH', 'البحرين',                'Bahrain',        '🇧🇭', 'BHD', 'د.ب', 'ar',    'rtl'),
  ('OM', 'سلطنة عُمان',           'Oman',           '🇴🇲', 'OMR', 'ر.ع', 'ar',    'rtl'),
  ('TR', 'تركيا',                  'Turkey',         '🇹🇷', 'TRY', '₺',   'tr',    'ltr')
on conflict (code) do nothing;
