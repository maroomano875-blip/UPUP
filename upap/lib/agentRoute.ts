// معالج موحّد لمسارات الوكلاء: التحقق من المدخلات، حد الحجم، رسائل خطأ عامة.
// أي إصلاح أمني يُكتب هنا مرة واحدة فيشمل كل الوكلاء.
import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "../core/factory/createAgent";
import { readUpload, UnreadableFileError } from "./readUpload";
import type { AgentConfig } from "../core/types/agent";

// معرّف العميل التجريبي الثابت. لا نقبل client_id من المتصفح (انتحال هوية)؛ يُستبدل بالمصادقة لاحقاً.
const DEMO_CLIENT_ID = "00000000-0000-0000-0000-000000000001";
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function makeAgentRoute(config: AgentConfig, label: string) {
  return async function POST(req: NextRequest) {
    try {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "لم يتم إرفاق ملف" }, { status: 400 });
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: "حجم الملف كبير جداً (الحد 25 ميغابايت)." }, { status: 413 });
      }

      // تحقق من الشكل فقط: أي قيمة غير صالحة تُستبدل بالافتراضي
      const rawCountry = String(formData.get("country") ?? "");
      const country = /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : "US";
      const rawLang = String(formData.get("language") ?? "");
      const language = /^[a-z]{2,3}(-[A-Za-z0-9]{2,4})?$/.test(rawLang) ? rawLang : "en-US";
      const notes = String(formData.get("notes") ?? "").trim().slice(0, 4000);

      const buf = Buffer.from(await file.arrayBuffer());
      const read = await readUpload(buf, file.name, file.type);
      let extractedText = read.text;
      if (notes) extractedText += "\n\n[ملاحظات المستخدم]\n" + notes;

      const agent = await createAgent(config);
      const result = await agent.run({
        clientId: DEMO_CLIENT_ID,
        country,
        language,
        extractedText,
        imageBase64: read.imageBase64,
        context: { file_name: file.name },
      });
      return NextResponse.json(result);
    } catch (err) {
      // رسائل قراءة الملف مكتوبة للمستخدم عمداً؛ أي خطأ آخر داخلي فلا يُكشف تفصيله
      if (err instanceof UnreadableFileError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      console.error("[" + label + " API]", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: "تعذّر إكمال التحليل الآن. حاول مرة أخرى بعد قليل." }, { status: 500 });
    }
  };
}
