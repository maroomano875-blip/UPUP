// تحليل JSON متسامح لردود النماذج: يتحمل العلامات ```json، والنص قبل/بعد الجواب،
// والفواصل الزائدة، والجواب المقطوع (يغلق الأقواس الناقصة).

function stripFences(s: string): string {
  return s.replace(/```[a-zA-Z]*\s*/g, '').replace(/```/g, '').trim();
}

function sliceBalanced(s: string): string | null {
  const start = s.search(/[\[{]/);
  if (start < 0) return null;
  const stack: string[] = [];
  let inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') stack.push('}');
    else if (c === '[') stack.push(']');
    else if (c === '}' || c === ']') {
      stack.pop();
      if (stack.length === 0) return s.slice(start, i + 1);
    }
  }
  // مقطوع: أغلق ما بقي مفتوحاً
  let out = s.slice(start);
  if (inStr) out += '"';
  out = out.replace(/[,:\s]+$/, '');
  out = out.replace(/,\s*"[^"]*"\s*$/, '');   // مفتاح بلا قيمة في النهاية
  return out + stack.reverse().join('');
}

function removeTrailingCommas(s: string): string {
  return s.replace(/,\s*([}\]])/g, '$1');
}

export function parseLooseJSON(raw: string): unknown {
  const text = String(raw ?? '');
  const base = stripFences(text);
  const attempts: string[] = [base];
  const sliced = sliceBalanced(base);
  if (sliced) attempts.push(sliced);
  for (const a of attempts.slice()) attempts.push(removeTrailingCommas(a));
  let lastErr: unknown;
  for (const a of attempts) {
    try { return JSON.parse(a); } catch (e) { lastErr = e; }
  }
  throw lastErr instanceof Error ? lastErr : new Error('invalid JSON');
}
