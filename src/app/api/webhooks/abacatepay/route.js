import { NextResponse } from 'next/server';
import { assinaturaWebhookConfere, segredoWebhookConfere } from '@/lib/abacatepay';
import { processarEventoWebhook } from '@/lib/pagamentos';

export const dynamic = 'force-dynamic';

// a url leva o secret entao nao logar
export async function POST(request) {
  const segredo = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!segredo) {
    console.error('[webhook abacatepay] ABACATEPAY_WEBHOOK_SECRET não configurado.');
    return NextResponse.json({ erro: 'Webhook não configurado.' }, { status: 503 });
  }

  if (!segredoWebhookConfere(request.nextUrl.searchParams.get('webhookSecret'), segredo)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  const corpo = await request.text();
  if (!assinaturaWebhookConfere(corpo, request.headers.get('x-webhook-signature'))) {
    return NextResponse.json({ erro: 'Assinatura inválida.' }, { status: 401 });
  }

  let evento;
  try {
    evento = JSON.parse(corpo);
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 });
  }

  try {
    await processarEventoWebhook(evento);
  } catch (erro) {
    console.error(`[webhook abacatepay] falha ao processar ${evento?.id}:`, erro);
    return NextResponse.json({ erro: 'Falha temporária.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
