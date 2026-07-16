const nodemailer = require("nodemailer");

function otpEmailBody(storeName, otp, ttlMinutes) {
  const text =
    `Hi ${storeName},\n\n` +
    `Your AdShield AI verification code is: ${otp}\n` +
    `This code expires in ${ttlMinutes} minutes.\n\n` +
    `If you didn't request this, you can ignore this email.\n\n` +
    `— AdShield AI`;

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#080D18; padding:32px; color:#E9EDF6;">
      <div style="max-width:420px; margin:0 auto; background:#101A2E; border:1px solid #223154; border-radius:16px; padding:32px;">
        <p style="color:#35E8C9; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; margin:0 0 8px;">
          AdShield AI
        </p>
        <h2 style="margin:0 0 16px; font-size:20px;">Verify your account</h2>
        <p style="color:#8592AD; font-size:14px; line-height:1.5; margin:0 0 24px;">
          Hi ${storeName}, use this code to finish setting up your AdShield AI dashboard.
        </p>
        <div style="background:#0C1424; border:1px dashed #223154; border-radius:12px; padding:16px; text-align:center; font-size:28px; letter-spacing:0.3em; font-family: 'Courier New', monospace; color:#35E8C9;">
          ${otp}
        </div>
        <p style="color:#4E5A78; font-size:12px; margin:24px 0 0;">
          This code expires in ${ttlMinutes} minutes. If you didn't request it, you can ignore this email.
        </p>
      </div>
    </div>
    `;

  return { text, html };
}

async function sendOtpEmail(config, toEmail, storeName, otp) {
  const ttl = config.OTP_TTL_MINUTES;
  const { text, html } = otpEmailBody(storeName, otp, ttl);

  const host = config.SMTP_HOST;
  if (!host) {
    if (config.EMAIL_DEV_FALLBACK) {
      console.warn(
        `SMTP not configured — logging OTP instead of emailing. email=${toEmail} otp=${otp} ` +
          `(set SMTP_* env vars to send real emails)`
      );
      return;
    }
    throw new Error("SMTP is not configured and EMAIL_DEV_FALLBACK is disabled.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: config.SMTP_PORT,
    secure: false, // STARTTLS is negotiated via requireTLS below, not implicit TLS
    requireTLS: config.SMTP_USE_TLS,
    auth: config.SMTP_USERNAME ? { user: config.SMTP_USERNAME, pass: config.SMTP_PASSWORD } : undefined,
  });

  await transporter.sendMail({
    from: config.MAIL_FROM,
    to: toEmail,
    subject: "Your AdShield AI verification code",
    text,
    html,
  });
}

module.exports = { sendOtpEmail };
