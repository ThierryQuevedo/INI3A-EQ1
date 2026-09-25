import { db } from '@/db';
import { usuarios, servicos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/app/actions/auth.actions';

export const dynamic = 'force-dynamic';

const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const EXTENSOES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp'];
const LIMITE_TAMANHO_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let file = null;
    let tipo = null;
    let servicoId = null;
    let salvarNoBanco = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file') || formData.get('image');
      tipo = formData.get('tipo')?.toString() || null;
      servicoId = formData.get('servicoId')?.toString() || null;
      salvarNoBanco = formData.get('salvarNoBanco') === 'true';
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      tipo = body?.tipo || null;
      servicoId = body?.servicoId || null;
      salvarNoBanco = !!body?.salvarNoBanco;

      if (body?.dataUrl) {
        const url = body.dataUrl;

        // Persistência opcional via JSON
        if (tipo || salvarNoBanco) {
          await persistirNoBanco({ tipo, servicoId, url });
        }

        return Response.json({
          success: true,
          url,
          name: body.name || 'imagem.png',
          size: body.size || 0,
          type: body.type || 'image/png',
          salvoNoBanco: true,
        });
      }

      return Response.json(
        { success: false, error: 'Dados JSON inválidos para upload.' },
        { status: 400 }
      );
    }

    if (!file || typeof file === 'string') {
      return Response.json(
        { success: false, error: 'Nenhum arquivo enviado.' },
        { status: 400 }
      );
    }

    // 1. Validação de formato (MIME type e extensão)
    const nomeArquivo = (file.name || '').toLowerCase();
    const extensaoValida = EXTENSOES_PERMITIDAS.some((ext) => nomeArquivo.endsWith(ext));
    const tipoValido = FORMATOS_PERMITIDOS.includes(file.type);

    if (!tipoValido && !extensaoValida) {
      return Response.json(
        {
          success: false,
          error: 'Formato inválido. Apenas PNG, JPG e WEBP são suportados.',
        },
        { status: 400 }
      );
    }

    // 2. Validação de tamanho (máximo 5MB)
    if (file.size > LIMITE_TAMANHO_BYTES) {
      const tamanhoMB = (file.size / (1024 * 1024)).toFixed(1);
      return Response.json(
        {
          success: false,
          error: `O arquivo tem ${tamanhoMB}MB e excede o limite máximo permitido de 5MB.`,
        },
        { status: 400 }
      );
    }

    // 3. Conversão para Base64 Data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // 4. Integração com o banco de dados
    let salvoNoBanco = false;
    if (tipo || salvarNoBanco) {
      salvoNoBanco = await persistirNoBanco({ tipo, servicoId, url: dataUrl });
    }

    return Response.json({
      success: true,
      url: dataUrl,
      name: file.name,
      size: file.size,
      type: mimeType,
      salvoNoBanco,
      message: salvoNoBanco
        ? 'Upload concluído e URL salva no banco de dados com sucesso.'
        : 'Upload concluído com sucesso.',
    });
  } catch (error) {
    console.error('Erro na rota de upload:', error);
    return Response.json(
      {
        success: false,
        error: 'Falha interna ao processar o upload da imagem.',
      },
      { status: 500 }
    );
  }
}

async function persistirNoBanco({ tipo, servicoId, url }) {
  try {
    const usuario = await getSession();
    if (!usuario) return false;

    if (tipo === 'avatar') {
      await db
        .update(usuarios)
        .set({ urlImagem: url })
        .where(eq(usuarios.id, usuario.id));
      return true;
    }

    if (tipo === 'banner') {
      await db
        .update(usuarios)
        .set({ urlBanner: url })
        .where(eq(usuarios.id, usuario.id));
      return true;
    }

    if (tipo === 'servico' && servicoId) {
      await db
        .update(servicos)
        .set({ urlImagem: url })
        .where(eq(servicos.id, Number(servicoId)));
      return true;
    }

    return false;
  } catch (err) {
    console.error('Erro ao persistir imagem no banco:', err);
    return false;
  }
}

export async function GET() {
  return Response.json({
    status: 'online',
    maxSizeMB: 5,
    allowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
  });
}
