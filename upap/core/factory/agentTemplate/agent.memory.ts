// ==========================================================
// قالب الذاكرة — تاريخ الطلبات + التصحيحات البشرية (الخندق الدفاعي)
// ==========================================================
import { getDB } from "../../engine/db";

export async function getClientRequestHistory(
  agentId: string,
  clientId: string,
  limit = 20
) {
  const db = getDB();
  const { data, error } = await db
    .from("requests")
    .select("*")
    .eq("agent_id", agentId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`فشل جلب سجل العميل: ${error.message}`);
  return data;
}

// تسجيل تصحيح بشري — هذا ما يبني "الخندق الدفاعي" مع الوقت
export async function recordHumanCorrection(
  agentId: string,
  requestId: string,
  originalOutput: Record<string, unknown>,
  correctedOutput: Record<string, unknown>,
  feedback: string,
  country: string,
  language: string
): Promise<void> {
  const db = getDB();
  await db.from("training_data").insert({
    agent_id: agentId,
    request_id: requestId,
    actual_output: originalOutput,
    human_correction: correctedOutput,
    feedback,
    country,
    language,
  });
}
