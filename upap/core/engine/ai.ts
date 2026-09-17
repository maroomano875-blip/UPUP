// ==========================================================
// محرك الذكاء الاصطناعي الموحّد
// الأولوية: OpenRouter (مجاني) → Gemini (مجاني) → خطأ واضح
// ==========================================================

export interface AIRequest {
  systemPrompt: string;
  userText: string;
  imageBase64?: string;        // اختياري — للفواتير والوثائق الممسوحة
  temperature?: number;        // افتراضي: 0.1 (دقة عالية للبيانات المالية)
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  provider: "openrouter" | "gemini";
  model: string;
  latency_ms: number;
}

// ── OpenRouter ────────────────────────────────────────────
async function callOpenRouter(req: AIRequest): Promise<AIResponse> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY مفقود في متغيرات البيئة");

  const isVision = Boolean(req.imageBase64);
  const model = isVision
    ? (process.env.OPENROUTER_VISION_MODEL ?? "google/gemini-flash-1.5:free")
    : (process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.1-8b-instruct:free");

  // بناء محتوى رسالة المستخدم (نص + صورة اختياري)
  const userContent: unknown[] = [{ type: "text", text: req.userText }];
  if (req.imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${req.imageBase64}` },
    });
  }

  const start = Date.now();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: req.systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: req.temperature ?? 0.1,
      max_tokens: req.maxTokens ?? 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    provider: "openrouter",
    model,
    latency_ms: Date.now() - start,
  };
}

// ── Google Gemini (خطة احتياطية) ─────────────────────────
async function callGemini(req: AIRequest): Promise<AIResponse> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY مفقود — لا يوجد أي مزود متاح");

  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const parts: unknown[] = [
    { text: `${req.systemPrompt}\n\n${req.userText}` },
  ];
  if (req.imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: req.imageBase64 } });
  }

  const start = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: req.temperature ?? 0.1 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
    provider: "gemini",
    model,
    latency_ms: Date.now() - start,
  };
}

// ── الدالة العامة: يجرب OpenRouter أولاً ثم Gemini ──────
export async function generateResponse(req: AIRequest): Promise<AIResponse> {
  try {
    return await callOpenRouter(req);
  } catch (primaryError) {
    console.warn("[AI] OpenRouter فشل، انتقال إلى Gemini:", (primaryError as Error).message);
    return await callGemini(req);
  }
}

// مساعد: يستخرج JSON نظيف من نص قد يحتوي على Markdown fences
export function extractJSON(raw: string): unknown {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}
