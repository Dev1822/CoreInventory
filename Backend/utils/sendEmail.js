const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an OTP email to the given address
 */
async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"StockFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(139, 92, 246, 0.3);">
        <div style="padding: 40px 32px; text-align: center;">
          <h1 style="color: #a78bfa; font-size: 28px; margin: 0 0 8px;">StockFlow</h1>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 32px;">Email Verification</p>
          
          <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 24px;">Your one-time verification code is:</p>
          
          <div style="background: rgba(139, 92, 246, 0.15); border: 2px solid rgba(139, 92, 246, 0.4); border-radius: 12px; padding: 20px; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #a78bfa;">${otp}</span>
          </div>
          
          <p style="color: #64748b; font-size: 13px; margin: 0;">This code expires in <strong style="color: #a78bfa;">5 minutes</strong>. Do not share it with anyone.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (err) {
    console.error(`❌ Email failed for ${to}:`, err.message);
    throw err; // Re-throw so the auth route knows it failed
  }
}

module.exports = sendOtpEmail;
