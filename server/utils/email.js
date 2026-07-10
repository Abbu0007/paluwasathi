const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BRAND = '#40916C';
const INK = '#3D2B1F';

const wrap = (heading, body) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:${INK};">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="margin:0;font-size:22px;font-weight:800;color:${BRAND};">PaluwaSathi</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#8a8a8a;">Nepal's animal rescue platform</p>
  </div>
  <div style="background:#ffffff;border:1px solid #eeeeee;border-radius:16px;padding:32px;">
    <h2 style="margin:0 0 16px;font-size:19px;font-weight:700;color:${INK};">${heading}</h2>
    ${body}
  </div>
  <p style="text-align:center;margin:24px 0 0;font-size:12px;color:#a0a0a0;line-height:1.6;">
    Sent by PaluwaSathi, Kathmandu, Nepal.<br>
    If you did not request this, you can safely ignore this email.
  </p>
</div>
`;

exports.sendOtpEmail = async (to, name, otp) => {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#5a5a5a;">
      Hello ${name}, use this code to verify your account.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <div style="display:inline-block;background:#F0FDF4;border:2px dashed ${BRAND};border-radius:12px;padding:18px 36px;">
        <span style="font-size:34px;font-weight:800;letter-spacing:10px;color:${BRAND};">${otp}</span>
      </div>
    </div>
    <p style="margin:0;font-size:13px;color:#8a8a8a;line-height:1.6;">
      This code expires in 5 minutes. Never share it with anyone,
      including someone claiming to be from PaluwaSathi.
    </p>
  `;

  await transporter.sendMail({
    from: '"PaluwaSathi" <' + process.env.EMAIL_USER + '>',
    to,
    subject: otp + ' is your PaluwaSathi verification code',
    html: wrap('Verify your account', body),
  });
};

exports.sendResetEmail = async (to, name, resetUrl) => {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#5a5a5a;">
      Hello ${name}, we received a request to reset your password.
      Click the button below to choose a new one.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;
                padding:14px 32px;border-radius:999px;font-weight:700;font-size:15px;">
        Reset my password
      </a>
    </div>
    <p style="margin:0 0 16px;font-size:13px;color:#8a8a8a;line-height:1.6;">
      This link expires in 15 minutes and can only be used once.
    </p>
    <p style="margin:0;font-size:12px;color:#a0a0a0;line-height:1.6;word-break:break-all;">
      If the button does not work, paste this into your browser:<br>
      <span style="color:${BRAND};">${resetUrl}</span>
    </p>
  `;

  await transporter.sendMail({
    from: '"PaluwaSathi" <' + process.env.EMAIL_USER + '>',
    to,
    subject: 'Reset your PaluwaSathi password',
    html: wrap('Password reset', body),
  });
};

exports.sendPasswordChangedEmail = async (to, name) => {
  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5a5a5a;">
      Hello ${name}, your PaluwaSathi password was changed successfully.
    </p>
    <div style="background:#FEF2F2;border-radius:12px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#991B1B;line-height:1.6;">
        <strong>Did not do this?</strong> Your account may be compromised.
        Reset your password immediately and contact us at ${process.env.EMAIL_USER}.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: '"PaluwaSathi" <' + process.env.EMAIL_USER + '>',
    to,
    subject: 'Your PaluwaSathi password was changed',
    html: wrap('Password changed', body),
  });
};

exports.verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service ready');
    return true;
  } catch (err) {
    console.error('Email service failed:', err.message);
    return false;
  }
};