let sgMail = null;
let nodemailer = null;

// lazy-load SendGrid only when API key is configured
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (err) {
    console.warn('SendGrid package not installed; skipping SendGrid init.');
    sgMail = null;
  }
}

// lazy-load nodemailer if SMTP config provided
if (process.env.SMTP_HOST) {
  try { nodemailer = require('nodemailer'); } catch (err) { nodemailer = null; }
}

// POST /api/contact
exports.sendContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }

    const recipient = process.env.CONTACT_RECIPIENT || 'hello@nottee9.in';

    // Prefer SendGrid if available
    if (sgMail) {
      const msg = {
        to: recipient,
        from: process.env.CONTACT_SENDER || 'no-reply@nottee9.in',
        subject: subject ? `Website contact: ${subject}` : `Website contact from ${name}`,
        text: `${message}\n\nFrom: ${name} <${email}>`,
        html: `<p>${message.replace(/\n/g, '<br/>')}</p><hr/><p>From: <strong>${name}</strong> &lt;${email}&gt;</p>`
      };
      await sgMail.send(msg);
      return res.json({ success: true, message: 'Message sent. We will contact you shortly.' });
    }

    // If SendGrid isn't configured, but SMTP creds are available, use nodemailer
    if (process.env.SMTP_HOST && nodemailer) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
      });

      await transporter.sendMail({
        from: process.env.CONTACT_SENDER || process.env.SMTP_USER || 'no-reply@nottee9.in',
        to: recipient,
        subject: subject ? `Website contact: ${subject}` : `Website contact from ${name}`,
        text: `${message}\n\nFrom: ${name} <${email}>`,
        html: `<p>${message.replace(/\n/g, '<br/>')}</p><hr/><p>From: <strong>${name}</strong> &lt;${email}&gt;</p>`
      });

      return res.json({ success: true, message: 'Message sent via SMTP. We will contact you shortly.' });
    }

    // Fallback: log message and acknowledge (useful for local/dev)
    console.warn('Contact form received (no mailer configured):', { name, email, subject, message });
    return res.json({ success: true, message: 'Message received (delivery disabled in this environment).' });
  } catch (err) {
    console.error('Failed to send contact message', err);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

exports.health = (req, res) => res.json({ success: true, message: 'Contact route ok' });
