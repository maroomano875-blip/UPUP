import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// فحص مؤقت للفرع التجريبي فقط: هل المتغيرات موجودة؟ (نعم/لا فقط، لا قيم). يُحذف قبل الدمج.
export async function GET() {
  const has = (k: string) => !!process.env[k];
  return NextResponse.json({
    vercel_env: process.env.VERCEL_ENV ?? null,
    supabase_url: has('SUPABASE_URL') || has('NEXT_PUBLIC_SUPABASE_URL'),
    supabase_service_key: has('SUPABASE_SERVICE_ROLE_KEY'),
    openrouter: has('OPENROUTER_API_KEY'),
    gemini: has('GEMINI_API_KEY'),
    groq: has('GROQ_API_KEY'),
    cloudflare: has('CLOUDFLARE_API_TOKEN') && has('CLOUDFLARE_ACCOUNT_ID'),
  });
}
