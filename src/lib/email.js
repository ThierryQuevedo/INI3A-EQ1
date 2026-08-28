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

export function emailServicoConcluidoHtml({ clienteNome, servicoNome, prestadorNome, linkAvaliacao }) {
  return `
  <div style="font-family: 'Inter', Arial, sans-serif; background-color: #F7F8FC; padding: 32px 16px;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E5E6E7;">
      <div style="background-color: #0B4F98; padding: 24px 32px;">
        <span style="color: #FFFFFF; font-size: 20px; font-weight: 700;">Marca Aí</span>
      </div>
      <div style="padding: 32px;">
        <h1 style="color: #1A1A2E; font-size: 20px; margin: 0 0 16px;">Olá, ${clienteNome}!</h1>
        <p style="color: #4E5054; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Seu serviço <strong>${servicoNome}</strong> com <strong>${prestadorNome}</strong> foi marcado como concluído.
        </p>
        <p style="color: #4E5054; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Conta pra gente como foi a sua experiência? Sua avaliação ajuda outros clientes e o profissional a melhorar cada vez mais.
        </p>
        <div style="text-align: center; margin-bottom: 8px;">
          <a href="${linkAvaliacao}" style="display: inline-block; background-color: #FD953A; color: #FFFFFF; font-weight: 700; font-size: 15px; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">
            Avaliar serviço
          </a>
        </div>
      </div>
      <div style="background-color: #F7F8FC; padding: 16px 32px; text-align: center;">
        <span style="color: #94979E; font-size: 12px;">Marca Aí — conectando você aos melhores profissionais.</span>
      </div>
    </div>
  </div>`;
}
