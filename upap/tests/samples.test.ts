import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLES, sampleLang } from '../data/samples';
import { liveAgents } from '../data/catalog';
import { verifyChecks, verifyDates, verifyInvoice } from '../lib/verify';

const slugs = liveAgents().map((a) => a.slug);

test('كل وكيل في الفهرس له مثال بالعربية والإنجليزية', () => {
  for (const s of slugs) {
    assert.ok(SAMPLES[s], `لا يوجد مثال للوكيل ${s}`);
    for (const l of ['ar', 'en'] as const) {
      const sm = SAMPLES[s][l];
      assert.ok(sm?.label && sm.file && sm.data?.output, `مثال ناقص: ${s}/${l}`);
    }
    assert.notEqual(SAMPLES[s].ar.label, SAMPLES[s].en.label, `مثال ${s} إنجليزي مطابق للعربي`);
  }
});

test('اختيار لغة المثال من لغة التحليل', () => {
  assert.equal(sampleLang('ar-SY'), 'ar');
  assert.equal(sampleLang('ar'), 'ar');
  assert.equal(sampleLang('en-US'), 'en');
  assert.equal(sampleLang('fr'), 'en');
});

test('أمثلة الوكلاء العامّين: تحوي خطأً مقصوداً يكشفه الكود، وتتطابق اللغتان', () => {
  for (const s of slugs) {
    const ar = SAMPLES[s].ar.data.output;
    const en = SAMPLES[s].en.data.output;
    if (!Array.isArray(ar.sections)) continue;
    const flags = (o: any) => verifyChecks(o.checks).filter((c) => c.bad).length + verifyDates(o.date_checks).filter((d) => d.bad).length; // eslint-disable-line @typescript-eslint/no-explicit-any
    assert.ok(flags(ar) >= 1, `لا خطأ مقصود في ${s} (ar)`);
    assert.equal(flags(ar), flags(en), `اختلاف عدد الأخطاء بين اللغتين في ${s}`);
  }
});

test('الفاتورة: كل مثال فيه خطأ في الإجمالي يكشفه الكود', () => {
  for (const l of ['ar', 'en'] as const) {
    assert.equal(verifyInvoice(SAMPLES['invoice-reader'][l].data.output).length, 1);
  }
});
