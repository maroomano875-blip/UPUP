// ==========================================================
// نقطة الدخول الفعلية لوكيل مراجعة العقود
// نفس نمط وكيل الفواتير — المحرك العام (createAgent) يتكفل بالباقي
// ==========================================================
import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "../../../../core/factory/createAgent";
import { CONTRACT_REVIEWER_CONFIG } from "../../../../professions/law/agents/contract-reviewer/agent.config";
import { ocrPDF } from "../../../../core/factory/agentTemplate/agent.tools";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const country = (formData.get("country") as string) || "US";
    const language = (formData.get("language") as string) || "en-US";
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
      extractedText = "(عقد بصيغة صورة — يُقرأ مباشرة عبر موديل الرؤية)";
    }

    const agent = await createAgent(CONTRACT_REVIEWER_CONFIG);
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
    console.error("[contract-reviewer API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
