// Transporte de e-mail (Nodemailer). Os templates ficam em lib/emails/ e os
// eventos que disparam envio, em lib/notificacoes.js.

import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

export async function enviarEmail({ to, subject, html }) {
  const client = getTransporter();

  if (!client) {
    console.warn(`[email] SMTP não configurado — e-mail "${subject}" para ${to} não foi enviado.`);
    return { enviado: false };
  }

  try {
    await client.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { enviado: true };
  } catch (error) {
    console.error('[email] Falha ao enviar e-mail:', error);
    return { enviado: false, erro: error };
  }
}
