import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSummary } from '../lib/analysisSummary';

test('buildSummary: فاتورة', () => {
  const s = buildSummary({ output: { document_type: 'invoice', vendor_name: 'ACME', total: 120.5, currency: 'USD', boq_items: [1, 2] }, confidence_score: 0.91, warnings: ['a'], needs_human_review: false }, 'inv.pdf');
  assert.deepEqual(s, { doc_type: 'invoice', party: 'ACME', total: '120.5', currency: 'USD', counts: { items: 2 }, confidence: 0.91, warnings: 1, needs_review: false, file_name: 'inv.pdf' });
});

test('buildSummary: لا يحفظ نصاً حراً ولا حقولاً غير معروفة، ويقصّ الطويل', () => {
  const s = buildSummary({ output: { sections: [{}, {}], secret_text: 'نص سري من المستند', vendor_name: 'x'.repeat(500) }, confidence_score: 5 });
  assert.equal((s as Record<string, unknown>).secret_text, undefined);
  assert.equal(s.party!.length, 80);
  assert.equal(s.confidence, 1);
  assert.deepEqual(s.counts, { sections: 2 });
});

test('buildSummary: مخرجات فارغة أو غير صالحة لا تكسر', () => {
  assert.deepEqual(buildSummary({}), { confidence: 0, warnings: 0, needs_review: false });
  assert.equal(buildSummary({ output: 'x', confidence_score: 'abc' }).confidence, 0);
});

test('الهوية تأتي من ترويسة middleware فقط وتُحذف قيمة العميل', () => {
  const mw = readFileSync(join(__dirname, '..', 'middleware.ts'), 'utf8');
  assert.match(mw, /fwd\.delete\('x-upap-uid'\)/);
  const route = readFileSync(join(__dirname, '..', 'lib', 'agentRoute.ts'), 'utf8');
  assert.match(route, /req\.headers\.get\("x-upap-uid"\)/);
  assert.doesNotMatch(route, /formData\.get\("(user|office)/);
});

test('الحفظ: المكتب يُقرأ من الخادم ولا يُقبل من المتصفح، والفشل لا يكسر التحليل', () => {
  const h = readFileSync(join(__dirname, '..', 'lib', 'analysisHistory.ts'), 'utf8');
  assert.match(h, /from\('office_members'\)/);
  assert.match(h, /catch \(e\)/);
  assert.doesNotMatch(h, /office_id:\s*p\./);
});
