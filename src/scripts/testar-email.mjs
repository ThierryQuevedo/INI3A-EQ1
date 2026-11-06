// Confere a configuração de SMTP do .env enviando um único e-mail.
// Uso, dentro de src/: npm run email:teste -- destino@exemplo.com
import { enviarEmail } from '../lib/email.js';

const destino = process.argv[2];

if (!destino || !destino.includes('@')) {
  console.error('Informe o destino: npm run email:teste -- destino@exemplo.com');
  process.exit(1);
}

const resultado = await enviarEmail({
  to: destino,
  subject: 'Teste de e-mail do Marca Aí',
  html: '<p>Se você recebeu esta mensagem, o SMTP do Marca Aí está funcionando.</p>',
});

if (resultado.enviado) {
  console.log(`Enviado para ${destino}. Confira a caixa de entrada e o spam.`);
  process.exit(0);
}

console.error(
  resultado.erro
    ? `Falhou: ${resultado.erro.message}`
    : 'Falhou: faltam SMTP_HOST, SMTP_USER ou SMTP_PASS no .env.'
);
process.exit(1);
