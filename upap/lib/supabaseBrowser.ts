// عميل Supabase للمتصفح (مفتاح anon العام فقط، والأمان الفعلي من RLS)
// يرجع null إن لم تُضبط متغيرات البيئة، فتتعطل واجهة الدخول بهدوء دون كسر الموقع.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

export function getBrowserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  // يجب كتابة أسماء المتغيرات حرفياً ليستبدلها Next وقت البناء
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key
    ? createClient(url, key, { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
    : null;
  return client;
}
