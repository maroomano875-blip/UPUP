// ==========================================================
// مصنع الوكلاء — createAgent()
// تمرير الإعدادات → وكيل جاهز يمر بدورة المعالجة الكاملة
// ==========================================================
import { AgentConfig, AgentResult, RequestStatus } from "../types/agent";
import { generateResponse, extractJSON } from "../engine/ai";
import { getDB } from "../engine/db";
import { audit } from "../engine/audit";

// ── واجهة مدخل تشغيل الوكيل ──────────────────────────────
export interface RunAgentInput {
  clientId: string;
  country: string;
  language: string;
  extractedText: string;        // نص مستخرج من ملف أو نص مباشر
  imageBase64?: string;         // صورة (اختياري)
  context?: Record<string, unknown>; // سياق إضافي (اسم العميل، معلومات المشروع...)
}

// ── بناء البرومبت مع حقن سياق الدولة واللغة ─────────────
function buildPrompt(config: AgentConfig, input: RunAgentInput): string {
  return config.system_prompt_template
    .replace("{country}", input.country)
    .replace("{language}", input.language)
    .replace("{context}", JSON.stringify(input.context ?? {}));
}

// ── تحديث حالة الطلب في قاعدة البيانات ──────────────────
async function setStatus(requestId: string, status: RequestStatus): Promise<void> {
  const db = getDB();
  await db
    .from("requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);
}

// ── الدالة الرئيسية ───────────────────────────────────────
export async function createAgent(config: AgentConfig) {
  return {
    // ── تشغيل الوكيل بدورة كاملة ─────────────────────────
    async run(input: RunAgentInput): Promise<AgentResult> {
      const db = getDB();
      const start = Date.now();

      // 1️⃣ إنشاء سجل الطلب (received)
      const { data: reqRow, error: reqErr } = await db
        .from("requests")
        .insert({
          agent_id: config.id,
          client_id: input.clientId,
          country: input.country,
          language: input.language,
          status: "received",
          input_data: {
            extracted_text: input.extractedText,
            has_image: Boolean(input.imageBase64),
            context: input.context,
          },
        })
        .select("id")
        .single();

      if (reqErr || !reqRow) throw new Error(`فشل إنشاء الطلب: ${reqErr?.message}`);
      const requestId: string = reqRow.id;

      await audit({
        actor_id: input.clientId,
        action: "request.created",
        resource_type: "request",
        resource_id: requestId,
        country: input.country,
        language: input.language,
      });

      try {
        // 2️⃣ تحليل المدخلات (parsing)
        await setStatus(requestId, "parsing");

        // 3️⃣ الاستدعاء الأساسي للذكاء الاصطناعي (processing)
        await setStatus(requestId, "processing");
        const aiRes = await generateResponse({
          systemPrompt: buildPrompt(config, input),
          userText: `${input.extractedText}\n\nأعد كائن JSON فقط.`,
          imageBase64: input.imageBase64,
        });

        await audit({
          actor_id: "system",
          action: "agent.called",
          resource_type: "request",
          resource_id: requestId,
          metadata: { provider: aiRes.provider, model: aiRes.model, latency: aiRes.latency_ms },
        });

        let rawOutput: Record<string, unknown>;
        try {
          rawOutput = extractJSON(aiRes.text) as Record<string, unknown>;
        } catch {
          throw new Error("فشل تحليل JSON من الوكيل الأساسي");
        }

        const confidence = (rawOutput.confidence_score as number) ?? 0;
        const needsHuman =
          config.requires_human_approval || confidence < config.confidence_threshold;

        // 4️⃣ المراجعة المزدوجة (reviewing)
        await setStatus(requestId, "reviewing");
        const reviewRes = await generateResponse({
          systemPrompt: `أنت مراجع خبير. افحص هذا JSON من وكيل ${config.name_ar} وتحقق من اتساقه المنطقي فقط. أعد نفس JSON مع تعديل warnings وconfidence_score إن لزم. JSON فقط.`,
          userText: JSON.stringify(rawOutput),
        });

        let finalOutput = rawOutput;
        let reviewerNotes = "تمت المراجعة";
        try {
          finalOutput = extractJSON(reviewRes.text) as Record<string, unknown>;
        } catch {
          reviewerNotes = "فشلت المراجعة الآلية — استُخدمت النتيجة الأصلية";
        }

        await audit({
          actor_id: "system",
          action: "agent.reviewer_called",
          resource_type: "request",
          resource_id: requestId,
          metadata: { reviewer_notes: reviewerNotes },
        });

        // 5️⃣ التسليم (delivered أو needs_human)
        const finalStatus: RequestStatus = needsHuman ? "needs_human" : "delivered";
        const processingTime = Date.now() - start;

        await db.from("requests").update({
          output_data: finalOutput,
          confidence_score: finalOutput.confidence_score ?? confidence,
          status: finalStatus,
          processing_time_ms: processingTime,
          updated_at: new Date().toISOString(),
        }).eq("id", requestId);

        await audit({
          actor_id: "system",
          action: finalStatus === "delivered" ? "request.delivered" : "request.status_changed",
          resource_type: "request",
          resource_id: requestId,
          metadata: { confidence, needs_human: needsHuman, time_ms: processingTime },
        });

        return {
          request_id: requestId,
          agent_id: config.id,
          status: finalStatus,
          output: finalOutput,
          confidence_score: (finalOutput.confidence_score as number) ?? confidence,
          warnings: (finalOutput.warnings as string[]) ?? [],
          processing_time_ms: processingTime,
          provider_used: aiRes.provider,
          reviewer_notes: reviewerNotes,
          needs_human_review: needsHuman,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "خطأ غير متوقع";
        await setStatus(requestId, "failed");
        await audit({
          actor_id: "system",
          action: "request.failed",
          resource_type: "request",
          resource_id: requestId,
          metadata: { error: message },
        });
        throw err;
      }
    },
  };
}
