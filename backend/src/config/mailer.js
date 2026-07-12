const nodemailer = require('nodemailer');
const env = require('./env');

// SMTP is optional in local development: without credentials the app still runs
// and emails are printed to the console by utils/sendEmail instead.
const isConfigured = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  : null;

module.exports = { transporter, isConfigured };
