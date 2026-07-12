const { transporter, isConfigured } = require('../config/mailer');
const env = require('../config/env');

async function sendEmail(to, { subject, html }) {
  if (!isConfigured) {
    // Local development fallback: SMTP not configured, so surface the email in
    // the server console instead of failing the request.
    const otpMatch = html.match(/\d{6}/);
    console.log('----------------------------------------------------------');
    console.log(`[mail] SMTP not configured - email NOT sent.`);
    console.log(`[mail] To: ${to}`);
    console.log(`[mail] Subject: ${subject}`);
    if (otpMatch) console.log(`[mail] OTP code: ${otpMatch[0]}`);
    console.log('----------------------------------------------------------');
    return;
  }

  await transporter.sendMail({
    from: `"${env.smtp.fromName}" <${env.smtp.user}>`,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
