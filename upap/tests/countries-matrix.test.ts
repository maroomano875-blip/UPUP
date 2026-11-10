import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildPrompt } from '../core/factory/createAgent';
import { COUNTRIES, LANGUAGES, VERIFIED_COUNTRIES, complianceChecks, fmtMoney } from '../data/countries';
import { countryDateContext } from '../lib/countryContext';
import type { AgentConfig } from '../core/types/agent';

// تحميل إعدادات كل الوكلاء من المجلدات (بلا استدعاء أي نموذج)
async function loadConfigs(): Promise<AgentConfig[]> {
  const root = resolve(__dirname, '../professions');
  const out: AgentConfig[] = [];
  for (const prof of readdirSync(root)) {
    const dir = join(root, prof, 'agents');
    if (prof.startsWith('_') || !existsSync(dir)) continue;
    for (const a of readdirSync(dir)) {
      const f = join(dir, a, 'agent.config.ts');
      if (!existsSync(f)) continue;
      const mod = await import(f);
      const cfg = Object.values(mod).find((v: any) => v && typeof v === 'object' && 'system_prompt_template' in v) as AgentConfig; // eslint-disable-line @typescript-eslint/no-explicit-any
      assert.ok(cfg, `لا إعدادات في ${f}`);
      out.push(cfg);
    }
  }
  return out;
}

const CODES = COUNTRIES.map((c) => c.code);

test('إعدادات كل وكيل تشير إلى دول ولغات موجودة فعلاً', async () => {
  const cfgs = await loadConfigs();
  assert.ok(cfgs.length >= 20);
  for (const c of cfgs) {
    for (const k of c.supported_countries) assert.ok(CODES.includes(k), `${c.id}: دولة غير معروفة ${k}`);
    for (const l of c.supported_languages) assert.ok(l in LANGUAGES, `${c.id}: لغة غير معروفة ${l}`);
  }
});

test('قاعدة 7: كل وكيل × ثلاث دول مختلفة (عربية، أوروبية، أمريكية لاتينية) يبني برومبتاً سليماً', async () => {
  const cfgs = await loadConfigs();
  const cases = [{ country: 'SY', language: 'ar-SY' }, { country: 'FR', language: 'fr' }, { country: 'BR', language: 'pt-BR' }];
  for (const cfg of cfgs) {
    for (const k of cases) {
      const p = buildPrompt(cfg, { clientId: 'x', extractedText: '', context: {}, ...k });
      assert.ok(!/\{(country|language|context)\}/.test(p), `${cfg.id}/${k.country}: متغيّر لم يُستبدل`);
      assert.ok(p.includes(k.language), `${cfg.id}/${k.country}: اللغة غائبة`);
      assert.match(p, /20\d\d/, `${cfg.id}/${k.country}: تاريخ اليوم غائب`);
    }
  }
});

test('كل دولة: تاريخ وعملة وفحوص امتثال بالثلاث لغات تعمل', () => {
  for (const c of COUNTRIES) {
    assert.ok(countryDateContext(c.code).length > 50, c.code);
    assert.ok(fmtMoney(1234.5, c).length > 0, c.code);
    for (const l of ['ar', 'en', 'fr'] as const) assert.ok(complianceChecks(c, 'accounting', l).length >= 1, `${c.code}/${l}`);
    for (const l of c.languages) assert.ok(l in LANGUAGES, `${c.code}: ${l}`);
  }
});

test('الدول المُجرَّبة فعلياً موجودة في القائمة', () => {
  for (const v of VERIFIED_COUNTRIES) assert.ok(CODES.includes(v), v);
});
