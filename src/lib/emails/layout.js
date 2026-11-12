// layout dos emails com estilos inline
const CORES = {
  fundo: '#F7F8FC',
  card: '#FFFFFF',
  borda: '#E5E6E7',
  azul: '#0B4F98',
  laranja: '#FD953A',
  titulo: '#1A1A2E',
  texto: '#4E5054',
  suave: '#94979E',
};

// escapa texto do usuario
export function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// monta o html do email
export function layoutEmail({ saudacao, paragrafos = [], destaque = null, cta = null }) {
  const corpo = paragrafos
    .map(
      (texto) =>
        `<p style="color: ${CORES.texto}; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">${texto}</p>`
    )
    .join('');

  const caixaDestaque = destaque
    ? `
        <div style="background-color: ${CORES.fundo}; border: 1px solid ${CORES.borda}; border-radius: 12px; padding: 16px 20px; margin: 0 0 24px;">
          <p style="color: ${CORES.suave}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 12px;">${escapar(destaque.rotulo)}</p>
          ${destaque.itens
            .map(
              ([chave, valor]) =>
                `<p style="color: ${CORES.texto}; font-size: 14px; line-height: 1.5; margin: 0 0 6px;"><strong style="color: ${CORES.titulo};">${escapar(chave)}:</strong> ${valor}</p>`
            )
            .join('')}
        </div>`
    : '';

  const botao = cta
    ? `
        <div style="text-align: center; margin-bottom: 8px;">
          <a href="${cta.href}" style="display: inline-block; background-color: ${CORES.laranja}; color: #FFFFFF; font-weight: 700; font-size: 15px; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">
            ${escapar(cta.texto)}
          </a>
        </div>`
    : '';

  return `
  <div style="font-family: 'Inter', Arial, sans-serif; background-color: ${CORES.fundo}; padding: 32px 16px;">
    <div style="max-width: 480px; margin: 0 auto; background-color: ${CORES.card}; border-radius: 16px; overflow: hidden; border: 1px solid ${CORES.borda};">
      <div style="background-color: ${CORES.azul}; padding: 24px 32px;">
        <span style="color: #FFFFFF; font-size: 20px; font-weight: 700;">Marca Aí</span>
      </div>
      <div style="padding: 32px;">
        <h1 style="color: ${CORES.titulo}; font-size: 20px; margin: 0 0 16px;">${escapar(saudacao)}</h1>
        ${corpo}${caixaDestaque}${botao}
      </div>
      <div style="background-color: ${CORES.fundo}; padding: 16px 32px; text-align: center;">
        <span style="color: ${CORES.suave}; font-size: 12px;">Marca Aí — conectando você aos melhores profissionais.</span>
      </div>
    </div>
  </div>`;
}
