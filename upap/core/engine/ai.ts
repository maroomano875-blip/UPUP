import { parseLooseJSON } from "../../lib/parseLooseJSON";

// ============================================================
// محرك الذكاء الاصطناعي: OpenRouter (مجاني، يُختار تلقائياً من النماذج المتاحة الآن) → Gemini
// - يجلب قائمة النماذج المجانية الحية ويخزنها ساعة (لا نعتمد على أسماء قد تُحذف)
// - مهلة لكل محاولة، ويجرّب عدة نماذج بالتتابع
// - الرد الفارغ يُعتبر فشلاً فيُجرَّب نموذج آخر
// ============================================================

export interface AIRequest {
  systemPrompt: string;
  userText: string;
  imageBase64?: string;
  temperature?: number;
  maxTokens?: number;
  avoidModels?: string[]; // نماذج جُرّبت وفشلت
}

export interface AIResponse {
  text: string;
  provider: "openrouter" | "gemini";
  model: string;
  latency_ms: number;
}

const OR_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS ?? 30000);
const OR_MAX_ATTEMPTS = Number(process.env.AI_MAX_ATTEMPTS ?? 5);

type ORModel = {
  id: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { input_modalities?: string[]; output_modalities?: string[] };
  supported_parameters?: string[];
};

let cache: { at: number; models: ORModel[] } | null = null;
const badUntil = new Map<string, number>(); // نموذج معطّل مؤقتاً
const BAD_MS = 10 * 60 * 1000;

async function listFreeModels(): Promise<ORModel[]> {
  if (cache && Date.now() - cache.at < 3600_000) return cache.models;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    const res = await fetch("https://openrouter.ai/api/v1/models", { signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { data?: ORModel[] };
    const free = (data.data ?? []).filter(
      (m) =>
        m.id &&
        Number(m.pricing?.prompt ?? "1") === 0 &&
        Number(m.pricing?.completion ?? "1") === 0 &&
        (m.architecture?.output_modalities ?? ["text"]).includes("text") &&
        (m.context_length ?? 0) >= 16000
    );
    cache = { at: Date.now(), models: free };
    return free;
  } catch {
    return cache?.models ?? [];
  }
}

// تفضيل نماذج قوية بالعربية واتباع التعليمات
function score(m: ORModel): number {
  const id = m.id.toLowerCase();
  let s = 0;
  const prefs: [string, number][] = [
    ["qwen", 30], ["llama-3.3-70b", 28], ["gpt-oss", 26], ["deepseek", 24], ["gemma-3", 22],
    ["mistral", 14], ["llama-3.1-405b", 25], ["hermes", 10], ["gemini", 27],
  ];
  for (const [k, v] of prefs) if (id.includes(k)) s = Math.max(s, v);
  if (/(7b|8b|3b|1b|4b|mini)/.test(id)) s -= 15; // نماذج صغيرة ضعيفة بالعربية
  if (/(70b|72b|120b|235b|405b|large)/.test(id)) s += 6;
  if (/(thinking|reason|r1)/.test(id)) s -= 8; // بطيئة
  s += Math.min((m.context_length ?? 0) / 100000, 3);
  return s;
}

async function pickModels(vision: boolean, avoid: string[] = []): Promise<string[]> {
  const envList = (vision ? process.env.OPENROUTER_VISION_MODEL : process.env.OPENROUTER_MODEL)
    ?.split(",").map((x) => x.trim()).filter(Boolean) ?? [];
  const live = await listFreeModels();
  const now = Date.now();
  const pool = live.filter((m) => {
    if ((badUntil.get(m.id) ?? 0) > now) return false;
    const outs = m.architecture?.output_modalities ?? ["text"];
    if (outs.length !== 1 || outs[0] !== "text") return false; // لا صوت/صورة
    if (!m.id.endsWith(":free")) return false;                 // المجاني الرسمي فقط
    const sz = m.id.match(/(\d+(?:\.\d+)?)b(?![a-z])/i);
    if (sz && Number(sz[1]) < 20) return false;               // النماذج الصغيرة ضعيفة بالعربية
    if (vision) return (m.architecture?.input_modalities ?? []).includes("image");
    return !/(-vl|vision|guard|moderation|embed|audio|tts|image|safety|nemotron|lyria|clip|music|laguna|inkling)/i.test(m.id);
  });
  const ranked = pool.sort((a, b) => score(b) - score(a)).map((m) => m.id);
  const out = [...envList.filter((x) => (badUntil.get(x) ?? 0) <= now), ...ranked, "openrouter/free"];
  const uniq = Array.from(new Set(out));
  const fresh = uniq.filter((x) => !avoid.includes(x));
  return fresh.length ? fresh : uniq;
}

async function callOneModel(model: string, req: AIRequest): Promise<AIResponse> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY مفقود في المتغيرات البيئية");

  const userContent: unknown[] = [{ type: "text", text: req.userText }];
  if (req.imageBase64) {
    userContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${req.imageBase64}` } });
  }

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), OR_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: ctl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.imageBase64 ? userContent : req.userText },
        ],
        temperature: req.temperature ?? 0.1,
        max_tokens: req.maxTokens ?? 3000,
      }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`OpenRouter ${res.status} (${model}): ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    if (!text || !text.trim()) throw new Error(`رد فارغ من ${model}`);
    return { text, provider: "openrouter", model: String(data.model ?? model), latency_ms: Date.now() - start };
  } catch (e) {
    if ((e as Error).name === "AbortError") throw new Error(`انتهت المهلة (${OR_TIMEOUT_MS}ms) للنموذج ${model}`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenRouter(req: AIRequest): Promise<AIResponse> {
  const models = (await pickModels(Boolean(req.imageBase64), req.avoidModels ?? [])).slice(0, OR_MAX_ATTEMPTS);
  const errors: string[] = [];
  for (const m of models) {
    try {
      return await callOneModel(m, req);
    } catch (e) {
      const msg = (e as Error).message;
      badUntil.set(m, Date.now() + BAD_MS);
      errors.push(`${m}: ${msg.replace(/\s+/g, " ").slice(0, 90)}`);
      console.warn("[AI] فشل", msg);
    }
  }
  throw new Error(`فشلت ${errors.length} محاولات | ` + errors.join(" ; "));
}

// ── Groq (احتياطي مجاني وسريع، نص فقط) ──
async function callGroq(req: AIRequest): Promise<AIResponse> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY مفقود");
  if (req.imageBase64) throw new Error("Groq لا يدعم الصور هنا");
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 45000);
  const start = Date.now();
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: ctl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: req.systemPrompt },
          { role: "user", content: req.userText },
        ],
        temperature: req.temperature ?? 0.1,
        max_tokens: req.maxTokens ?? 3000,
      }),
    });
    if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text().catch(() => "")).slice(0, 160)}`);
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("رد فارغ من Groq");
    return { text, provider: "openrouter", model: `groq/${model}`, latency_ms: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

// ── Google Gemini (احتياطي) ──
async function callGemini(req: AIRequest): Promise<AIResponse> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY مفقود — لا يوجد مزوّد احتياطي");

  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const parts: unknown[] = [{ text: `${req.systemPrompt}\n\n${req.userText}` }];
  if (req.imageBase64) parts.push({ inline_data: { mime_type: "image/jpeg", data: req.imageBase64 } });

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 60000);
  const start = Date.now();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        signal: ctl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: req.temperature ?? 0.1, responseMimeType: "application/json" },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Gemini ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text.trim()) throw new Error("رد فارغ من Gemini");
    return { text, provider: "gemini", model, latency_ms: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

// ── الواجهة العامة: OpenRouter أولاً ثم Gemini ──
export async function generateResponse(req: AIRequest): Promise<AIResponse> {
  // Groq أولاً للنص فقط إن وُجد مفتاحه (أسرع وأكثر استقراراً من النماذج المجانية العشوائية)
  if (process.env.GROQ_API_KEY && !req.imageBase64 && !(req.avoidModels ?? []).some((x) => x.startsWith("groq/"))) {
    try {
      return await callGroq(req);
    } catch (e) {
      console.warn("[AI] Groq فشل:", (e as Error).message);
    }
  }
  try {
    return await callOpenRouter(req);
  } catch (primaryError) {
    console.warn("[AI] OpenRouter فشل، الانتقال إلى Gemini:", (primaryError as Error).message);
    try {
      return await callGemini(req);
    } catch (fallbackError) {
      throw new Error(
        `تعذّر الوصول لأي نموذج. OpenRouter: ${(primaryError as Error).message} | Gemini: ${(fallbackError as Error).message}`
      );
    }
  }
}

// استخراج JSON متسامح (يتعامل مع Markdown وكلام حول الـJSON)
export function extractJSON(raw: string): unknown {
  return parseLooseJSON(raw);
}
