import nodemailer from "nodemailer";

let transporter = null;

const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const getTransporter = () => {
  if (!transporter && isSmtpConfigured()) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

export const sendResetOtpEmail = async ({ to, name, otp }) => {
  const subject = "UptoSkills AI LMS - Password Reset Code";
  const textContent = `Hello ${name || "User"},\n\nYour one-time password reset code is: ${otp}\n\nThis code will expire in 10 minutes and can only be used once.\n\nIf you did not request this, please ignore this email.`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-bottom: 16px;">UptoSkills AI LMS</h2>
      <p>Hello <strong>${name || "Learner"}</strong>,</p>
      <p>You requested a one-time password reset code for your account.</p>
      <div style="background-color: #f3f4f6; padding: 18px; text-align: center; border-radius: 6px; margin: 20px 0;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827;">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>10 minutes</strong> and is strictly single-use.</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">If you did not request this change, you can safely ignore this email.</p>
    </div>
  `;

  if (isSmtpConfigured()) {
    try {
      const mailClient = getTransporter();
      const info = await mailClient.sendMail({
        from: process.env.SMTP_FROM || `"UptoSkills Security" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[EMAIL] Reset OTP email dispatched to ${to} (Message ID: ${info.messageId})`);
      return { success: true, mode: "smtp", messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed sending to ${to} via SMTP:`, err.message);
      console.log(`[EMAIL FALLBACK] Password Reset OTP for ${to}: ${otp}`);
      return { success: true, mode: "fallback-log", error: err.message };
    }
  } else {
    console.log("=======================================================");
    console.log(`[EMAIL SERVICE] (SMTP not configured - Dev Logging)`);
    console.log(`[EMAIL SERVICE] To: ${to}`);
    console.log(`[EMAIL SERVICE] Subject: ${subject}`);
    console.log(`[EMAIL SERVICE] Password Reset OTP: ${otp}`);
    console.log(`[EMAIL SERVICE] Expires in: 10 minutes`);
    console.log("=======================================================");
    return { success: true, mode: "console-log" };
  }
};
