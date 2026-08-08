const nodemailer = require('nodemailer');

/**
 * Creates a reusable Nodemailer transporter.
 * Supports Gmail (with App Password), SMTP relay, or any compatible provider.
 * Falls back gracefully when credentials are missing (dev / CI environments).
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[Mailer] EMAIL_USER / EMAIL_PASS not set — emails will be logged to console only.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: (process.env.EMAIL_PORT || '465') === '465', // true for port 465, false for 587
    auth: { user, pass },
  });
};

/**
 * Sends a 6-digit OTP email.
 *
 * @param {string} to         - recipient email address
 * @param {string} otp        - 6-digit OTP string
 * @param {'register'|'forgot'|'login'} purpose - determines email subject/body
 */
const sendOtpEmail = async (to, otp, purpose = 'register') => {
  const hospitalName = process.env.HOSPITAL_NAME || 'Apollo Hospital';

  const subjects = {
    register: `${hospitalName} — Email Verification Code`,
    forgot:   `${hospitalName} — Password Reset Code`,
    login:    `${hospitalName} — Login Verification Code`,
  };

  const headings = {
    register: 'Verify Your Email Address',
    forgot:   'Reset Your Password',
    login:    'Complete Your Login',
  };

  const descriptions = {
    register: 'Thank you for registering. Use the code below to verify your email address.',
    forgot:   'We received a request to reset your password. Use the code below to proceed.',
    login:    'A verification step is required to complete your login. Use the code below.',
  };

  const subject     = subjects[purpose]     || subjects.register;
  const heading     = headings[purpose]     || headings.register;
  const description = descriptions[purpose] || descriptions.register;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #6366f1, #22d3ee);
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
    .header p  { margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.8); }
    .body { padding: 36px 32px; }
    .body h2  { margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #f1f5f9; }
    .body p   { margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.6; }
    .otp-box  {
      display: block;
      background: rgba(99,102,241,0.12);
      border: 2px dashed rgba(99,102,241,0.5);
      border-radius: 12px;
      text-align: center;
      padding: 20px;
      letter-spacing: 18px;
      font-size: 38px;
      font-weight: 800;
      color: #818cf8;
      margin-bottom: 24px;
    }
    .note { font-size: 12px; color: #64748b; text-align: center; margin-top: 8px; }
    .footer {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>🏥 ${hospitalName}</h1>
        <p>Hospital Management System</p>
      </div>
      <div class="body">
        <h2>${heading}</h2>
        <p>${description}</p>
        <div class="otp-box">${otp}</div>
        <p class="note">⏱ This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
      </div>
      <div class="footer">
        If you did not request this, please ignore this email or
        <a href="mailto:${process.env.EMAIL_USER}">contact support</a>.<br/><br/>
        &copy; ${new Date().getFullYear()} ${hospitalName}. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;

  const transporter = createTransporter();

  if (!transporter) {
    // Dev fallback — credentials not configured
    console.log(`[Mailer-DEV] OTP email to ${to} | Subject: ${subject} | OTP: ${otp}`);
    return { dev: true, otp };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${hospitalName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Mailer] OTP email sent to ${to} — MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    // Mail failed — log OTP to console so development/testing still works
    console.error(`[Mailer] Failed to send email to ${to}: ${err.message}`);
    console.log(`[Mailer-FALLBACK] OTP for ${to}: ${otp}`);
    return { fallback: true, otp, error: err.message };
  }
};


/**
 * Sends a generic notification email (appointment booked, lab result ready, etc.)
 *
 * @param {string} to       - recipient email
 * @param {string} subject  - email subject line
 * @param {string} title    - card heading
 * @param {string} message  - body paragraph
 * @param {string} [icon]   - emoji icon shown in the header (default 🏥)
 */
const sendNotificationEmail = async (to, subject, title, message, icon = '🏥') => {
  const hospitalName = process.env.HOSPITAL_NAME || 'Apollo Hospital';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid rgba(99,102,241,0.25); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #06b6d4, #6366f1); padding: 28px 32px; text-align: center; }
    .header .icon { font-size: 48px; display: block; margin-bottom: 10px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; }
    .header p  { margin: 6px 0 0; font-size: 13px; color: rgba(255,255,255,0.8); }
    .body { padding: 36px 32px; }
    .body h2 { margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #f1f5f9; }
    .body p  { margin: 0 0 24px; font-size: 14px; color: #94a3b8; line-height: 1.7; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0 32px; }
    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #475569; }
    .footer a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <span class="icon">${icon}</span>
        <h1>${hospitalName}</h1>
        <p>Hospital Management System — Notification</p>
      </div>
      <div class="body">
        <h2>${title}</h2>
        <p>${message}</p>
        <p style="font-size:12px;color:#64748b;">This is an automated notification from ${hospitalName}. Please do not reply to this email.</p>
      </div>
      <div class="divider"></div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ${hospitalName}. All rights reserved.<br/>
        Questions? <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Mailer-DEV] Notification email to ${to} | Subject: ${subject}`);
    return { dev: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${hospitalName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Mailer] Notification email sent to ${to} — MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[Mailer] Failed to send notification to ${to}: ${err.message}`);
    return { fallback: true, error: err.message };
  }
};

module.exports = { sendOtpEmail, sendNotificationEmail };

