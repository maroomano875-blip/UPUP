-- المرحلة 1: المكاتب والأعضاء والاشتراك والدفع والحصص (إضافة فقط)
-- لا يحذف ولا يعدّل أي جدول موجود. كل شيء "if not exists". آمن لإعادة التنفيذ.
-- الوصول من التطبيق يتم عبر الخادم بمفتاح الخدمة (يتجاوز RLS)؛ سياسات RLS هنا
-- للقراءة فقط من جهة العميل، ولا توجد سياسات كتابة (الكتابة ممنوعة افتراضياً).

-- ── الخطط (الأسعار تُترك فارغة ويحددها صاحب المشروع) ───────────────
create table if not exists plans (
  code text primary key,                       -- small / medium / large
  name text not null,
  max_members int not null check (max_members > 0),
  monthly_analyses int not null check (monthly_analyses > 0),
  price_weekly_usdt numeric(18,6),
  price_monthly_usdt numeric(18,6),
  price_yearly_usdt numeric(18,6),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into plans (code, name, max_members, monthly_analyses) values
  ('small',  'Small',  3,  80),
  ('medium', 'Medium', 8,  200),
  ('large',  'Large',  20, 400)
on conflict (code) do nothing;

-- ── المكاتب والأعضاء ─────────────────────────────────────────────
create table if not exists offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists office_members (
  office_id uuid not null references offices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','supervisor','member')),
  created_at timestamptz not null default now(),
  primary key (office_id, user_id)
);
create index if not exists idx_office_members_user on office_members(user_id);

-- ── الاشتراكات (جدول جديد، منفصل عن جدول subscriptions القديم) ────
create table if not exists office_subscriptions (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices(id) on delete cascade,
  plan_code text not null references plans(code),
  period text not null check (period in ('weekly','monthly','yearly')),
  status text not null default 'pending' check (status in ('pending','active','expired','cancelled')),
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_office_subs_office on office_subscriptions(office_id, status, expires_at);

-- ── طلبات الدفع بـ USDT (مبلغ فريد، صالح ساعتين) ───────────────────
create table if not exists payment_orders (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices(id) on delete cascade,
  plan_code text not null references plans(code),
  period text not null check (period in ('weekly','monthly','yearly')),
  amount_usdt numeric(18,6) not null check (amount_usdt > 0),
  status text not null default 'pending' check (status in ('pending','paid','expired')),
  expires_at timestamptz not null default (now() + interval '2 hours'),
  tx_id text,                                   -- معرّف عملية Tron
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
-- المبلغ الفريد: لا يتكرر بين الطلبات المعلّقة
create unique index if not exists uq_payment_orders_pending_amount
  on payment_orders(amount_usdt) where status = 'pending';
-- منع استخدام العملية نفسها مرتين (التفعيل مرة واحدة)
create unique index if not exists uq_payment_orders_tx
  on payment_orders(tx_id) where tx_id is not null;
create index if not exists idx_payment_orders_office on payment_orders(office_id, created_at desc);

-- ── التجربة المجانية (حساب واحد = تجربة واحدة) ──────────────────────
create table if not exists trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'unknown',     -- google / email
  started_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '3 days')
);

-- ── عدّاد الاستخدام (للتجربة والخطط) ───────────────────────────────
create table if not exists usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  office_id uuid references offices(id) on delete set null,
  agent_slug text not null,
  kind text not null check (kind in ('trial','plan')),
  at timestamptz not null default now()
);
create index if not exists idx_usage_user_at on usage_events(user_id, at desc);
create index if not exists idx_usage_office_at on usage_events(office_id, at desc);

-- ── ملخصات التحليل (تُحفظ 30 يوماً ثم تُحذف بمهمة لاحقة) ────────────
create table if not exists analysis_summaries (
  id uuid primary key default gen_random_uuid(),
  office_id uuid references offices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_slug text not null,
  country text,
  summary jsonb not null default '{}'::jsonb,   -- ملخص فقط، لا المستند الأصلي
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);
create index if not exists idx_summaries_office on analysis_summaries(office_id, created_at desc);
create index if not exists idx_summaries_user on analysis_summaries(user_id, created_at desc);
create index if not exists idx_summaries_expires on analysis_summaries(expires_at);

-- ── دوال مساعدة للصلاحيات (security definer لتفادي التكرار في RLS) ──
create or replace function is_office_member(oid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from office_members where office_id = oid and user_id = auth.uid());
$$;

create or replace function office_role(oid uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from office_members where office_id = oid and user_id = auth.uid() limit 1;
$$;

-- ── تفعيل RLS على كل الجداول الجديدة ───────────────────────────────
alter table plans enable row level security;
alter table offices enable row level security;
alter table office_members enable row level security;
alter table office_subscriptions enable row level security;
alter table payment_orders enable row level security;
alter table trials enable row level security;
alter table usage_events enable row level security;
alter table analysis_summaries enable row level security;

-- ── سياسات القراءة فقط (لا كتابة من جهة العميل) ─────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='plans' and policyname='plans_read_all') then
    create policy "plans_read_all" on plans for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='offices' and policyname='offices_read_member') then
    create policy "offices_read_member" on offices for select using (is_office_member(id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='office_members' and policyname='members_read_same_office') then
    create policy "members_read_same_office" on office_members for select using (is_office_member(office_id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='office_subscriptions' and policyname='office_subs_read_member') then
    create policy "office_subs_read_member" on office_subscriptions for select using (is_office_member(office_id));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='payment_orders' and policyname='orders_read_owner') then
    create policy "orders_read_owner" on payment_orders for select using (office_role(office_id) = 'owner');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='trials' and policyname='trials_read_own') then
    create policy "trials_read_own" on trials for select using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='usage_events' and policyname='usage_read_own_or_staff') then
    create policy "usage_read_own_or_staff" on usage_events for select using (
  user_id = auth.uid() or office_role(office_id) in ('owner','supervisor')
);
  end if;
end $$;

-- العضو يرى ملخصاته فقط، والمشرف والمالك يريان كل ملخصات المكتب
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='analysis_summaries' and policyname='summaries_read_own_or_staff') then
    create policy "summaries_read_own_or_staff" on analysis_summaries for select using (
  user_id = auth.uid() or office_role(office_id) in ('owner','supervisor')
);
  end if;
end $$;
