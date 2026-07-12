const env = require('../config/env');

function baseLayout(title, bodyHtml) {
  return `
  <div style="background:#eef1f6;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#3a4149;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h2 style="margin:0 0 16px;font-family:'Segoe UI',Arial,sans-serif;font-style:italic;color:#2b3240;">${title}</h2>
      ${bodyHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#9aa3ad;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  </div>`;
}

function otpBlock(otp) {
  return `
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;letter-spacing:8px;font-size:28px;font-weight:bold;color:#00B8FF;background:#f3f6fa;border-radius:12px;padding:14px 24px;">${otp}</span>
    </div>
    <p style="margin:0;font-size:14px;">This code expires in <strong>${env.otp.expiryMinutes} minutes</strong>.</p>`;
}

function verificationEmail(fullName, otp) {
  return {
    subject: 'Verify your email address',
    html: baseLayout(
      'Verify your email',
      `<p style="font-size:14px;">Hi ${fullName},</p>
       <p style="font-size:14px;">Welcome aboard! Use the code below to verify your email address:</p>
       ${otpBlock(otp)}`
    ),
  };
}

function passwordResetEmail(fullName, otp) {
  return {
    subject: 'Your password reset code',
    html: baseLayout(
      'Reset your password',
      `<p style="font-size:14px;">Hi ${fullName},</p>
       <p style="font-size:14px;">We received a request to reset your password. Use this code to continue:</p>
       ${otpBlock(otp)}`
    ),
  };
}

// Generic notification email used by the notification service.
function notificationEmail(fullName, title, message) {
  return {
    subject: `EcoSphere: ${title}`,
    html: baseLayout(
      title,
      `<p style="font-size:14px;">Hi ${fullName},</p>
       <p style="font-size:14px;">${message || ''}</p>
       <p style="font-size:13px;color:#7d8593;">Open EcoSphere to see the details.</p>`
    ),
  };
}

module.exports = { verificationEmail, passwordResetEmail, notificationEmail };
