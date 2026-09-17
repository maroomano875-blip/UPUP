// ==========================================================
// عميل Supabase — للاستخدام من جانب الخادم فقط (service_role)
// ==========================================================
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getDB(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY مفقود في متغيرات البيئة.\n" +
      "راجع ملف .env.example"
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}
