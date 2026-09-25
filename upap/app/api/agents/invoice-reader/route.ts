// ==========================================================
// نقطة الدخول الفعلية لوكيل قراءة الفواتير
// ==========================================================
import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "../../../../core/factory/createAgent";
import { INVOICE_READER_CONFIG } from "../../../../professions/accounting/agents/invoice-reader/agent.config";
import { ocrPDF } from "../../../../core/factory/agentTemplate/agent.tools";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const country = (formData.get("country") as string) || "US";
    const language = (formData.get("language") as string) || "en-US";
    // معرف عميل تجريبي ثابت (مُسجَّل بملف supabase/migrations/002_seed_invoice_reader.sql)
    // لاحقاً يُستبدل بحساب حقيقي بعد ربط المصادقة (Supabase Auth)
    const clientId = (formData.get("client_id") as string) || "00000000-0000-0000-0000-000000000001";

    if (!file) {
      return NextResponse.json({ error: "لم يتم إرفاق ملف" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const isPdf = file.type === "application/pdf";

    let extractedText = "";
    let imageBase64: string | undefined;

    if (isPdf) {
      extractedText = await ocrPDF(Buffer.from(arrayBuffer));
    } else {
      imageBase64 = Buffer.from(arrayBuffer).toString("base64");
      extractedText = "(فاتورة بصيغة صورة — تُقرأ مباشرة عبر موديل الرؤية)";
    }

    const agent = await createAgent(INVOICE_READER_CONFIG);
    const result = await agent.run({
      clientId,
      country,
      language,
      extractedText,
      imageBase64,
      context: { file_name: file.name },
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع بالخادم";
    console.error("[invoice-reader API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
