-- جدول حد الاستخدام + تفعيل RLS على كل الجداول (الوصول من الخادم بمفتاح الخدمة فقط)
create table if not exists rate_hits (
  id bigint generated always as identity primary key,
  key text not null,
  at timestamptz not null default now()
);
create index if not exists idx_rate_hits_key_at on rate_hits(key, at);
create index if not exists idx_rate_hits_at on rate_hits(at);
alter table countries enable row level security;
alter table professions enable row level security;
alter table agents enable row level security;
alter table audit_log enable row level security;
alter table compliance_checks enable row level security;
alter table rate_hits enable row level security;
