
export const FORMATOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const EXTENSOES_ACEITAS = ['.jpg', '.jpeg', '.png', '.webp'];

// valida so o tipo do arquivo
export function validarArquivo(file) {
  if (!file) {
    return { valido: false, erro: 'Nenhum arquivo selecionado.' };
  }

  const nome = (file.name || '').toLowerCase();
  const extensaoValida = EXTENSOES_ACEITAS.some((ext) => nome.endsWith(ext));
  const tipoValido = FORMATOS_ACEITOS.includes(file.type);

  if (!tipoValido && !extensaoValida) {
    return {
      valido: false,
      erro: 'Formato inválido. Selecione um arquivo PNG, JPG ou WEBP.',
    };
  }

  return { valido: true, erro: null };
}

export function gerarPreviewLocal(file) {
  if (!file) return '';
  return URL.createObjectURL(file);
}

export function lerArquivoComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// reduz e converte a imagem no navegador
export function comprimirImagem(file, opcoes = {}) {
  const { maxDimensao = 1600, qualidade = 0.82, formato = 'image/webp' } = opcoes;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxDimensao || height > maxDimensao) {
        const escala = maxDimensao / Math.max(width, height);
        width = Math.round(width * escala);
        height = Math.round(height * escala);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Falha ao comprimir a imagem.'));
          const nomeBase = file.name.replace(/\.[^.]+$/, '');
          const extensao = formato === 'image/webp' ? 'webp' : 'jpg';
          resolve(new File([blob], `${nomeBase}.${extensao}`, { type: formato }));
        },
        formato,
        qualidade
      );
    };

    img.onerror = reject;
    img.src = url;
  });
}

export async function fazerUploadImagem(file, options = {}) {
  const validacao = validarArquivo(file);

  if (!validacao.valido) {
    throw new Error(validacao.erro);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    if (options.tipo) formData.append('tipo', options.tipo);
    if (options.servicoId) formData.append('servicoId', String(options.servicoId));
    if (options.salvarNoBanco !== false) formData.append('salvarNoBanco', 'true');

    const basePath = '/26-marcaai';
    const endpoints = [
      `${basePath}/api/upload/`,
      '/api/upload/',
    ];

    let resposta = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          resposta = await res.json();
          break;
        }
      } catch {
      }
    }

    if (resposta?.success && resposta?.url) {
      return {
        success: true,
        url: resposta.url,
        name: resposta.name || file.name,
        size: resposta.size || file.size,
        salvoNoBanco: !!resposta.salvoNoBanco,
      };
    }
  } catch (err) {
    console.warn('Aviso: fallback local ativado:', err);
  }

  const dataUrl = await lerArquivoComoDataUrl(file);
  return {
    success: true,
    url: dataUrl,
    name: file.name,
    size: file.size,
    salvoNoBanco: false,
  };
}