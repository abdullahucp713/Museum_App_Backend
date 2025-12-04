const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Helper function to clean env variables (remove quotes and trim)
  const cleanEnvVar = (value) => {
    if (!value) return null;
    let cleaned = value.trim();
    // Remove surrounding quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    return cleaned.length > 0 ? cleaned : null;
  };

  // Get and clean environment variables
  const smtpHost = cleanEnvVar(process.env.SMTP_HOST);
  const smtpPort = cleanEnvVar(process.env.SMTP_PORT);
  const smtpEmail = cleanEnvVar(process.env.SMTP_EMAIL);
  const smtpPassword = cleanEnvVar(process.env.SMTP_PASSWORD);
  const fromName = cleanEnvVar(process.env.FROM_NAME);
  const fromEmail = cleanEnvVar(process.env.FROM_EMAIL);


  // Validate required SMTP environment variables
  if (!smtpHost) {
    throw new Error("SMTP_HOST environment variable is missing or empty. Please set it in your .env file.");
  }

  if (!smtpPort || isNaN(parseInt(smtpPort))) {
    throw new Error("SMTP_PORT environment variable is missing, empty, or invalid. Please set it in your .env file.");
  }

  if (!smtpEmail) {
    throw new Error("SMTP_EMAIL environment variable is missing or empty. Please set it in your .env file.");
  }

  if (!smtpPassword) {
    throw new Error("SMTP_PASSWORD environment variable is missing or empty. Please set it in your .env file. Note: For Gmail, you must use an App Password, not your regular password. Enable 2FA and generate an app password at: https://myaccount.google.com/apppasswords");
  }

  if (!fromName) {
    throw new Error("FROM_NAME environment variable is missing or empty. Please set it in your .env file.");
  }

  if (!fromEmail) {
    throw new Error("FROM_EMAIL environment variable is missing or empty. Please set it in your .env file.");
  }

  // Create transporter configuration
  // For Gmail, use 'service: gmail' which handles configuration automatically
  const transporterConfig = smtpHost.toLowerCase().includes('gmail')
    ? {
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    }
    : {
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    };

  const transporter = nodemailer.createTransport(transporterConfig);

  // Verify transporter configuration
  try {
    await transporter.verify();

  } catch (verifyError) {
    throw new Error(`SMTP connection failed: ${verifyError.message}`);
  }

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  const info = await transporter.sendMail(mailOptions);


  return true;
};

module.exports = sendEmail;
