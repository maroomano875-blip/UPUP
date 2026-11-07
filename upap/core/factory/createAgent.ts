// ==========================================================
// مصنع الوكلاء — createAgent()
// تمرير الإعدادات → وكيل جاهز يمر بدورة المعالجة الكاملة
// ==========================================================
import { AgentConfig, AgentResult, RequestStatus } from "../types/agent";
import { generateResponse, extractJSON } from "../engine/ai";
import { getDB } from "../engine/db";
import { audit } from "../engine/audit";

// ── جودة الرد: عدّ القيم الفعلية في JSON وبناء نص المستخدم ──
function leafScore(v: unknown, key = ""): number {
  if (key === "confidence_score" || key === "warnings") return 0;
  if (v === null || v === undefined) return 0;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t && t !== "—" && t !== "-" && t !== "null" && t !== "unknown" ? 1 : 0;
  }
  if (typeof v === "number") return v !== 0 ? 1 : 0;
  if (Array.isArray(v)) return v.reduce((a: number, x) => a + leafScore(x), 0);
  if (typeof v === "object") return Object.entries(v as Record<string, unknown>).reduce((a, [k, x]) => a + leafScore(x, k), 0);
  return 0;
}

function buildUserText(extractedText: string, retry = false): string {
  const note =
    "ملاحظة: النص التالي مستخرج آلياً من ملف، وقد يكون ترتيب الأجزاء داخل السطر الواحد مقلوباً في العربية. اقرأه كاملاً وأعد بناء المعنى. المستند يحتوي نصاً فعلياً فلا تقل إنه فارغ.";
  const again = retry ? "\nالمحاولة السابقة أرجعت حقولاً فارغة رغم وجود محتوى؛ استخرج كل الحقول الممكنة." : "";
  return `${note}${again}\n\n[نص المستند]\n${extractedText}\n\nأعد JSON فقط.`;
}

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

        // ضمان وجود صف الوكيل في جدول agents (يمنع خطأ FK للوكلاء الجدد)
        try {
          const __c = config as any;
          const { data: __ag } = await db.from("agents").select("id").eq("id", config.id).maybeSingle();
          if (!__ag) {
            const __slug = String(config.id).split(".")[0];
            const { data: __prof } = await db.from("professions").select("id").eq("slug", __slug).maybeSingle();
            if (__prof) {
              await db.from("agents").upsert({
                id: config.id,
                profession_id: __prof.id,
                name: __c.name ?? __c.name_ar ?? config.id,
                name_ar: __c.name_ar ?? config.id,
                type: __c.type ?? "agent",
                version: "1.0.0",
                status: "active",
                supported_countries: __c.supported_countries ?? [],
                supported_languages: __c.supported_languages ?? [],
                supported_currencies: [],
                input_types: __c.input_types ?? [],
                confidence_threshold: __c.confidence_threshold ?? 0.8,
                is_active: true,
              }, { onConflict: "id" });
            }
          }
        } catch (e) {
          console.error("[createAgent] ensure agent row failed", e);
        }

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
          userText: buildUserText(input.extractedText),
          imageBase64: input.imageBase64,
        });

        await audit({
          actor_id: "system",
          action: "agent.called",
          resource_type: "request",
          resource_id: requestId,
          metadata: { provider: aiRes.provider, model: aiRes.model, latency: aiRes.latency_ms },
        });

        let rawOutput: Record<string, unknown> = {};
        {
          const tried: string[] = [String(aiRes.model)];
          let cur = aiRes;
          let best: Record<string, unknown> | null = null;
          let bestScore = -1;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const obj = unwrapOutput(extractJSON(cur.text));
              const __sec = (obj as any).sections;
              const __cnt = (x: unknown) => (Array.isArray(x) ? x.length : 0);
              const __weak = Array.isArray(__sec) &&
                __sec.reduce((a: number, x: any) => a + __cnt(x?.items), 0) === 0 &&
                __cnt((obj as any).checks) === 0 && __cnt((obj as any).key_findings) === 0 &&
                __cnt((obj as any).date_checks) === 0;
              // رد بلا أقسام ولا فحوصات ولا ملاحظات يُعدّ ضعيفاً فيُعاد بنموذج آخر
              const sc = __weak ? Math.min(leafScore(obj), 2) : leafScore(obj);
              if (sc > bestScore) { best = obj; bestScore = sc; }
              const shortDoc = input.extractedText.trim().length < 40 && !input.imageBase64;
              if (sc >= 3 || shortDoc) break;
              console.warn("[createAgent] رد شبه فارغ من", cur.model, "- إعادة المحاولة بنموذج آخر");
            } catch {
              console.error("[createAgent] JSON parse failed. model:", cur.model, "len:", String(cur.text ?? "").length, "head:", String(cur.text ?? "").slice(0, 400));
            }
            if (attempt === 1) break;
            try {
              cur = await generateResponse({
                systemPrompt: buildPrompt(config, input),
                userText: buildUserText(input.extractedText, true),
                imageBase64: input.imageBase64,
                avoidModels: tried,
              });
              tried.push(String(cur.model));
            } catch { break; }
          }
          if (!best) {
            throw new Error("فشل تحليل JSON. النموذج=" + String(cur.model ?? "?") + " | بداية الرد: " + String(cur.text ?? "").slice(0, 200).replace(/\s+/g, " "));
          }
          rawOutput = best;
      rawOutput = redactSecrets(rawOutput) as typeof rawOutput;
          {
            const __inner = (rawOutput as any).output;
            const __allowed = ["output", "confidence_score", "needs_human_review", "warnings"];
            if (__inner && typeof __inner === "object" && !Array.isArray(__inner) &&
                Object.keys(rawOutput).every((k) => __allowed.includes(k))) {
              const { output: _drop, ...__outer } = rawOutput as any;
              rawOutput = { ...__inner, ...__outer } as typeof rawOutput;
            }
          }
        }

        
        const confidence = normConf(rawOutput.confidence_score, 0);
        const needsHuman =
          config.requires_human_approval || confidence < config.confidence_threshold;

        // 4️⃣ المراجعة المزدوجة (reviewing)
        await setStatus(requestId, "reviewing");
        const reviewRes = await withTimeout(generateResponse({
          systemPrompt: `أنت مراجع خبير. افحص هذا JSON من وكيل ${config.name_ar} وتحقق من اتساقه المنطقي فقط. أعد نفس JSON مع تعديل warnings وconfidence_score إن لزم. JSON فقط.`,
          userText: "[النص الأصلي]\n" + input.extractedText.slice(0, 6000) + "\n\n[المخرجات المطلوب مراجعتها]\n" + JSON.stringify(rawOutput),
        }), 25000, { text: "" } as Awaited<ReturnType<typeof generateResponse>>);

        let finalOutput = rawOutput;
        let reviewerNotes = "تمت المراجعة";
        try {
          {
          const rv = unwrapOutput(extractJSON(reviewRes.text) as Record<string, unknown>);
          if (leafScore(rv) >= leafScore(rawOutput) * 0.6 && (!Array.isArray(rawOutput.sections) || Array.isArray(rv.sections))) finalOutput = rv;
          else reviewerNotes = "تجاهلنا تعديل المراجع لأنه أفرغ البيانات";
        }
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
          confidence_score: normConf(finalOutput.confidence_score, confidence),
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
          confidence_score: normConf(finalOutput.confidence_score, confidence),
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

// مهلة للمراجعة: إن تأخرت أو فشلت نُسلّم النتيجة الأولية دون مراجعة (تظهر في ملاحظات المراجع).
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p.catch(() => fallback), new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);
}

// يحوّل أي قيمة ثقة إلى مجال 0-1 (يقبل 0.9 أو 90)
function normConf(v: unknown, fallback: number): number {
  const n = Number(v);
  if (v === null || v === undefined || !Number.isFinite(n)) return fallback;
  return n > 1 ? Math.min(n / 100, 1) : Math.max(n, 0);
}


const SECRET_PATTERNS: RegExp[] = [
  /\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9_]{6,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bghp_[A-Za-z0-9]{20,}/g,
  /\bAIza[0-9A-Za-z_-]{20,}/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];

function maskSecretsInString(t: string): string {
  let out = t;
  for (const re of SECRET_PATTERNS) {
    out = out.replace(re, (m) => m.slice(0, 4) + "****");
  }
  out = out.replace(
    /((?:api[_-]?key|secret|token|password|passwd)\w*\s*[=:]\s*["'])([^"']{8,})(["'])/gi,
    (_m, a: string, v: string, c: string) => a + v.slice(0, 4) + "****" + c
  );
  return out;
}

function redactSecrets(v: unknown): unknown {
  if (typeof v === "string") return maskSecretsInString(v);
  if (Array.isArray(v)) return v.map(redactSecrets);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) o[k] = redactSecrets(x);
    return o;
  }
  return v;
}


// يفكّ غلاف {output:{...}} إن لفّ النموذج النتيجة به (نفس منطق نتيجة الاستخراج الأولى)
function unwrapOutput(o0: unknown): Record<string, unknown> {
  // بعض النماذج تُرجع مصفوفة فيها كائن واحد بدل الكائن نفسه
  const o = (Array.isArray(o0) && o0.length > 0 && o0[0] && typeof o0[0] === "object" ? o0[0] : o0) as Record<string, unknown>;
  const inner = (o as any).output;
  const allowed = ["output", "confidence_score", "needs_human_review", "warnings"];
  if (inner && typeof inner === "object" && !Array.isArray(inner) && Object.keys(o).every((k) => allowed.includes(k))) {
    const { output: _drop, ...outer } = o as any;
    return { ...inner, ...outer };
  }
  return o;
}
