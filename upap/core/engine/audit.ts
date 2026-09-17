// ==========================================================
// سجل المراجعة (Audit Log) — القاعدة 5: إلزامي بلا استثناء
// كل عملية تُسجَّل: من؟ ماذا؟ متى؟ على أي مورد؟
// ==========================================================
import { getDB } from "./db";

export type AuditAction =
  | "request.created"
  | "request.status_changed"
  | "agent.called"
  | "agent.reviewer_called"
  | "request.delivered"
  | "request.failed"
  | "client.created"
  | "subscription.activated"
  | "subscription.expired"
  | "payment.received";

interface AuditEntry {
  actor_id?: string;        // client_id أو "system"
  action: AuditAction;
  resource_type: string;    // "request", "agent", "client", "subscription"...
  resource_id: string;
  metadata?: Record<string, unknown>;
  country?: string;
  language?: string;
}

export async function audit(entry: AuditEntry): Promise<void> {
  // نطبع دائماً محلياً — حتى لو فشل الحفظ في قاعدة البيانات
  console.log(
    `[AUDIT] ${entry.action} | ${entry.resource_type}:${entry.resource_id}`,
    entry.metadata ?? ""
  );

  try {
    const db = getDB();
    await db.from("audit_log").insert({
      actor_id: entry.actor_id ?? "system",
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      metadata: entry.metadata ?? {},
      country: entry.country,
      language: entry.language,
    });
  } catch (err) {
    // لا نُفشل العملية الأساسية بسبب فشل التسجيل، لكن نصرخ في اللوج
    console.error("[AUDIT] ⚠️ فشل حفظ السجل في قاعدة البيانات:", err);
  }
}
