// إرسال البريد: Brevo عبر واجهة HTTP أو SMTP، وإلا Gmail عبر SMTP (كلمة مرور تطبيق). خادم فقط.
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
    // نفس بيانات SMTP لـ Brevo المستعملة في تأكيد التسجيل (لا حاجة لمفتاح API جديد)
    const bu = clean(process.env.BREVO_SMTP_USER);
    const bk = clean(process.env.BREVO_SMTP_KEY);
    if (bu && bk && from) {
      const tr = nodemailer.createTransport({ host: 'smtp-relay.brevo.com', port: 587, secure: false, auth: { user: bu, pass: bk } });
      await tr.sendMail({ from: `UPAP <${from}>`, to: m.to, subject: m.subject, text: m.text, html: m.html });
      return 'sent';
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
