-- المرحلة 1 (تتمة): المستخدم الواحد في مكتب واحد فقط (قرار صاحب المشروع)
-- إضافة فقط: فهرس فريد على user_id. آمن لإعادة التنفيذ، ولا يمسّ أي بيانات.
-- ملاحظة: جداول المكاتب جديدة وفارغة، فلا تعارض مع بيانات موجودة.
create unique index if not exists uq_office_members_one_office_per_user
  on office_members(user_id);
