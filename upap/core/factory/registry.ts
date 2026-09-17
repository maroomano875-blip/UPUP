// ==========================================================
// سجل الوكلاء — نقطة التسجيل والبحث الموحّدة
// كل وكيل جديد يُسجَّل هنا قبل استخدامه
// ==========================================================
import { AgentConfig, AgentRegistryEntry } from "../types/agent";

// ── السجل في الذاكرة (كافٍ للنسخة الأولى) ───────────────
const registry = new Map<string, AgentRegistryEntry>();

export function registerAgent(config: AgentConfig): void {
  if (registry.has(config.id)) {
    console.warn(`[Registry] وكيل بمعرف ${config.id} مسجّل مسبقاً — سيتم تحديثه`);
  }
  registry.set(config.id, {
    config,
    createdAt: new Date(),
    requestCount: 0,
  });
  console.log(`[Registry] ✅ تم تسجيل الوكيل: ${config.name_ar} (${config.id})`);
}

export function getAgent(agentId: string): AgentConfig | null {
  return registry.get(agentId)?.config ?? null;
}

export function listAgents(filters?: {
  profession?: string;
  country?: string;
  language?: string;
}): AgentConfig[] {
  return Array.from(registry.values())
    .filter(({ config }) => {
      if (filters?.profession && config.profession !== filters.profession) return false;
      if (filters?.country && !config.supported_countries.includes(filters.country)) return false;
      if (filters?.language && !config.supported_languages.includes(filters.language)) return false;
      return true;
    })
    .map((e) => e.config);
}

export function incrementRequestCount(agentId: string): void {
  const entry = registry.get(agentId);
  if (entry) entry.requestCount++;
}

export function getStats() {
  return {
    total_agents: registry.size,
    agents: Array.from(registry.values()).map((e) => ({
      id: e.config.id,
      name_ar: e.config.name_ar,
      profession: e.config.profession,
      status: e.config.status,
      request_count: e.requestCount,
    })),
  };
}
