// إرسال البريد: Brevo عبر واجهة HTTP إن وُجد مفتاحه، وإلا Gmail عبر SMTP (كلمة مرور تطبيق). خادم فقط.
import nodemailer from 'nodemailer';

export type Mail = { to: string; subject: string; text: string; html: string };
export type MailResult = 'sent' | 'not_configured' | 'failed';

const clean = (v: string | undefined) => (v ?? '').trim();

export async function sendMail(m: Mail, f: typeof fetch = fetch): Promise<MailResult> {
  const brevo = clean(process.env.BREVO_API_KEY);
  const from = clean(process.env.MAIL_FROM) || clean(process.env.GMAIL_USER);
  try {
    if (brevo && from) {
      const r = await f('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevo, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: { email: from, name: 'UPAP' }, to: [{ email: m.to }], subject: m.subject, htmlContent: m.html, textContent: m.text }),
      });
      return r.ok ? 'sent' : 'failed';
    }
    const user = clean(process.env.GMAIL_USER);
    const pass = clean(process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, '');
    if (user && pass) {
      const tr = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
      await tr.sendMail({ from: `UPAP <${user}>`, to: m.to, subject: m.subject, text: m.text, html: m.html });
      return 'sent';
    }
    return 'not_configured';
  } catch (e) {
    console.error('[mail]', e instanceof Error ? e.message : 'error');
    return 'failed';
  }
}
