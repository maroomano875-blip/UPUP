#!/usr/bin/env python3
"""Generate a new UPAP agent: config, prompt, API route, catalog entry, seed SQL.
Usage: python3 scripts/new-agent.py --profession education --agent exam-reviewer \
  --name-en "Exam Reviewer" --name-ar "..." --desc-ar "..." --prompt-file /tmp/p.txt
Nothing is written unless every check passes."""
import argparse, os, re, sys

ap = argparse.ArgumentParser()
for a in ['profession', 'agent', 'name-en', 'name-ar', 'desc-ar', 'prompt-file']:
    ap.add_argument('--' + a, required=True)
A = ap.parse_args()
prof, agent = A.profession, A.agent
const = agent.upper().replace('-', '_')
aid = prof + '.' + agent
for v in (A.name_en, A.name_ar, A.desc_ar):
    assert "'" not in v and '"' not in v, 'no quotes allowed in names/description'
assert re.fullmatch(r'[a-z][a-z0-9_-]*', prof) and re.fullmatch(r'[a-z][a-z0-9-]*', agent), 'bad slug'

task = open(A.prompt_file, encoding='utf-8').read().strip()
assert '{country}' in task and '{language}' in task, 'prompt file must contain {country} and {language}'

CONTRACT = """

OUTPUT: return ONE flat JSON object only (no markdown, no commentary, no wrapper key such as "output"). Exactly this shape:
{
  "confidence_score": number between 0 and 1,
  "needs_human_review": true,
  "warnings": [string],
  "document_type": string,
  "summary": string (3-5 plain sentences, without computed totals),
  "checks": [ { "label": string, "stated": number or null, "parts": [number] } ],
  "date_checks": [ { "label": string, "quote": string, "start": "YYYY-MM-DD" or null, "end": "YYYY-MM-DD" or null } ],
  "sections": [ { "title": string, "items": [ { "label": string, "detail": string, "status": "ok" | "warn" | "issue" | "info" } ] } ],
  "attention_level": "urgent" | "soon" | "routine",
  "key_findings": [string],
  "questions_for_user": [string]
}

STANDARD RULES
- Never state or imply that totals, sums or marks "match", "add up" or are "correct". Only the "checks" array covers totals; the application verifies them. Do not write sentences about a total being right or wrong, and do not write per-line remarks such as "arithmetically correct".
- Never silently correct anything in the document (dates, amounts, names, spelling). Report exactly what is written and flag what looks wrong as an item with status "issue" or "warn". Never write that something "was corrected" or "adjusted".
- Every title and label you output (section titles, check labels) must be written in the output language, even though the instructions above name them in English.
- "date_checks": for every period that has a start and an end date, copy both dates in ISO format exactly as written in the document (convert month names carefully). Never reorder, swap or correct them, even if the end date is before the start date: copy start and end exactly as the document states them. The application checks the order. In "quote" copy word for word the phrase from the document that contains the period, and assign start and end by the words that introduce each date (for example "from" and "to"), not by the order in which the dates appear on the line.
- Plain numbers only (no thousands separators, no currency symbols). Convert Arabic-Indic digits to ordinary digits.
- "checks": for every total the document itself states (for example a sum of marks), put the stated number in "stated" and the individual numbers it should add up to in "parts". Never compute the sum yourself.
- Never invent values. If something is absent or unreadable use null and give the related item the status "warn".
- attention_level is "urgent" when any item has status "issue", "soon" when only "warn", otherwise "routine".
- If the file is not the kind of document described above, return confidence_score below 0.2, an empty sections array and a warning explaining what the file is.
- If the file is unreadable, say so in warnings and lower confidence_score; never guess.
- Do not repeat personal data (phone numbers, emails, national IDs, personal names).
- Write every human-readable string in the language named at the top of this prompt."""
full = task + CONTRACT
esc = full.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

CONFIG = """// ============================================================
// @@NAME_AR@@ — إعدادات الوكيل (مولَّد بواسطة scripts/new-agent.py)
// ============================================================
import { AgentConfig } from "../../../../core/types/agent";
import { @@C@@_SYSTEM_PROMPT } from "./agent.prompt";

export const @@C@@_CONFIG: AgentConfig = {
  id: "@@ID@@",
  name: "@@NAME_EN@@",
  name_ar: "@@NAME_AR@@",
  profession: "@@PROF@@" as unknown as AgentConfig["profession"],
  type: "@@AGENT@@" as unknown as AgentConfig["type"],
  version: "1.0.0",
  status: "active",

  supported_countries: [
    "US", "GB", "FR", "DE", "ES", "IT", "SA", "AE",
    "EG", "SY", "JO", "LB", "MA", "DZ",
    "IQ", "KW", "QA", "BH", "OM", "YE", "TR", "CA",
    "AU", "IN", "PK", "ID", "BR",
  ],
  supported_languages: [
    "en-US", "en-GB", "en-IN", "ar", "ar-SA", "ar-EG", "ar-SY",
    "fr", "es", "tr", "de", "it", "pt-BR", "id", "hi", "ur",
  ],
  supported_currencies: [],

  input_types: ["pdf", "image", "text"],
  output_schema: {},

  confidence_threshold: 0.8,
  requires_human_approval: true,
  max_processing_time_ms: 60000,
  cost_per_request_usd: 0,

  system_prompt_template: @@C@@_SYSTEM_PROMPT,
  tools: ["ocrPDF"],
  knowledge_base_ids: [],
};
"""
PROMPT = "// ============================================================\n// @@NAME_AR@@ — نص التعليمات (مولَّد)\n// ============================================================\nexport const @@C@@_SYSTEM_PROMPT = `@@PROMPT@@`;\n"
SQL = """insert into agents (
  id, profession_id, name, name_ar, type,
  version, status,
  supported_countries, supported_languages,
  supported_currencies,
  input_types, confidence_threshold, is_active
)
select
  '@@ID@@', p.id, '@@NAME_EN@@', '@@NAME_AR@@', '@@AGENT@@',
  '1.0.0', 'active',
  array['US','GB','FR','DE','ES','IT','SA','AE','EG','SY','JO','LB','MA','DZ','IQ','KW','QA','BH','OM','YE','TR','CA','AU','IN','PK','ID','BR'],
  array['en-US','en-GB','en-IN','ar','ar-SA','ar-EG','ar-SY','fr','es','tr','de','it','pt-BR','id','hi','ur'],
  array[]::text[],
  array['pdf','image','text'], 0.8, true
from professions p
where p.slug = '@@PROF@@'
on conflict (id) do update set is_active = true, status = 'active';
"""

def fill(t):
    for k, v in {'@@NAME_AR@@': A.name_ar, '@@NAME_EN@@': A.name_en, '@@C@@': const, '@@ID@@': aid,
                 '@@PROF@@': prof, '@@AGENT@@': agent}.items():
        t = t.replace(k, v)
    return t

agent_dir = 'professions/%s/agents/%s' % (prof, agent)
route_dir = 'app/api/agents/' + agent
assert not os.path.exists(agent_dir), 'agent folder already exists: ' + agent_dir
assert not os.path.exists(route_dir), 'route folder already exists: ' + route_dir

# المسار يستخدم المعالج المشترك lib/agentRoute.ts (لا نسخ من وكيل آخر)
route = ('// مسار الوكيل: المنطق المشترك في lib/agentRoute.ts (حد الحجم، التحقق من المدخلات، رسائل خطأ عامة)\n'
         'import { makeAgentRoute } from "../../../../lib/agentRoute";\n'
         'import { %s_CONFIG } from "../../../../%s/agent.config";\n\n'
         'export const POST = makeAgentRoute(%s_CONFIG, "%s");\n') % (const, agent_dir, const, agent)

cp = 'data/catalog.ts'
lines = open(cp, encoding='utf-8').read().split('\n')
idx = [i for i, l in enumerate(lines) if l.lstrip().startswith("P('%s'" % prof)]
assert len(idx) == 1, 'catalog line for profession not found once'
ln = lines[idx[0]].rstrip()
assert ("slug: '%s'" % agent) not in ln, 'agent already in catalog'
obj = "{ slug: '%s', name_ar: '%s', desc_ar: '%s', href: '/professions/%s?agent=%s', needsApproval: true }" % (agent, A.name_ar, A.desc_ar, prof, agent)
if ln.endswith('}]),'):
    ln = ln[:-3] + ', ' + obj + ']),'
elif ln.endswith(']),'):
    ln = ln[:-2] + ', [' + obj + ']),'
else:
    sys.exit('unexpected catalog line ending: ' + ln[-30:])
lines[idx[0]] = ln

mig_dir = 'supabase/migrations'
nums = [int(m.group(1)) for f in os.listdir(mig_dir) for m in [re.match(r'(\d+)_', f)] if m] if os.path.isdir(mig_dir) else []
mig = '%s/%03d_seed_%s.sql' % (mig_dir, (max(nums) + 1) if nums else 1, agent.replace('-', '_'))

# all checks passed - write
os.makedirs(agent_dir); os.makedirs(route_dir); os.makedirs(mig_dir, exist_ok=True)
open(agent_dir + '/agent.config.ts', 'w', encoding='utf-8').write(fill(CONFIG))
open(agent_dir + '/agent.prompt.ts', 'w', encoding='utf-8').write(fill(PROMPT).replace('@@PROMPT@@', esc))
open(route_dir + '/route.ts', 'w', encoding='utf-8').write(route)
open(cp, 'w', encoding='utf-8').write('\n'.join(lines))
open(mig, 'w', encoding='utf-8').write(fill(SQL))
print('CREATED:', aid)
print(' ', agent_dir); print(' ', route_dir); print(' ', mig)
