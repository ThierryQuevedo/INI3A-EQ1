import { Calendar, MapPin, Phone, Mail, Users, Star, Clock3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { buscarPerfilPrestador } from '@/app/actions/prestadores.actions';
import BotaoVoltar from '@/app/components/ui/BotaoVoltar';
import CardServicoCatalogo from '@/app/components/features/servicos/CardServicoCatalogo';

export const dynamic = 'force-dynamic';

function EstrelasNota({ nota = 0, tamanho = 16 }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[...Array(5)].map((_, i) => {
        const n = i + 1;
        const preenchida = nota >= n;
        const metade = nota > i && nota < n;
        return (
          <Star
            key={`star-${i}`}
            size={tamanho}
            className={
              preenchida || metade
                ? 'fill-amber-400 stroke-amber-400 shrink-0'
                : 'stroke-muted-foreground shrink-0'
            }
          />
        );
      })}
    </div>
  );
}

export default async function PerfilPrestador({ params }) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    return notFound();
  }

  const perfil = await buscarPerfilPrestador(Number(id));

  if (!perfil) {
    return notFound();
  }

  const { usuario, servicos, avaliacaoMedia, totalAvaliacoes, totalClientesAtendidos, avaliacoes } = perfil;

  const membroDesde = new Date(usuario.criadoEm).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const servicosFormatados = servicos.map((s) => ({
    id: s.id,
    slug: s.slug,
    nomeServico: s.nome,
    nomeProfissional: usuario.nome,
    nomeCategoria: s.categoriaNome,
    preco: parseFloat(s.preco).toFixed(2).replace('.', ','),
    urlImagem: s.urlImagem,
  }));

  return (
    <div className="bg-tcc-azul-deep min-h-screen text-white font-sans">

      <div className="relative h-60 w-full bg-gradient-to-b from-tcc-azul-darker to-tcc-azul-deep overflow-hidden">
        {usuario.urlBanner ? (
          <Image
            src={usuario.urlBanner}
            alt=""
            fill
            className="object-cover opacity-40"
          />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover bg-center" />
        )}

        <div className="absolute top-6 left-6 z-20">
          <BotaoVoltar fallbackHref="/servicos" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10 pb-20">

        <div className="flex flex-col items-center text-center md:text-left md:items-end md:flex-row md:justify-between bg-tcc-azul-darker/60 backdrop-blur-md p-6 rounded-3xl shadow-2xl gap-6">
          <div className="flex flex-col items-center md:flex-row gap-6">

            <div className="relative size-32 rounded-2xl overflow-hidden border-4 border-tcc-azul-medium shadow-md bg-tcc-azul-dark flex items-center justify-center">
              {usuario.urlImagem ? (
                <Image
                  src={usuario.urlImagem}
                  alt={usuario.nome}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-h4 font-bold text-tcc-azul-light">
                  {usuario.nome?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-h4 font-extrabold font-display tracking-tight mb-2">
                {usuario.nome}
              </h1>
              <p className="text-tcc-azul-light font-medium mb-3 flex items-center gap-1.5 justify-center md:justify-start">
                <MapPin size={14} aria-hidden="true" />
                {usuario.raioAtendimentoKm
                  ? `Atende num raio de ${usuario.raioAtendimentoKm} km`
                  : 'Profissional parceiro do Marca Aí'}
              </p>

              <div className="bg-tcc-azul-dark w-fit mx-auto md:mx-0 px-4 py-1.5 rounded-full flex items-center gap-2 border border-tcc-azul/40">
                <span className="text-body-sm font-bold text-tcc-laranja">
                  {avaliacaoMedia.toFixed(1)}
                </span>
                <EstrelasNota nota={avaliacaoMedia} tamanho={13} />
                <span className="text-caption text-tcc-azul-lightest">
                  ({totalAvaliacoes} avaliações)
                </span>
              </div>
            </div>
          </div>

          {/* Botão corrigido */}
          <a
            href={usuario.telefone ? `tel:${usuario.telefone}` : '#'}
            className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent-hover active:scale-[0.98] font-bold px-8 h-14 rounded-full shadow-elevated transition-all duration-200 ease-apple flex items-center justify-center gap-2 text-body-lg cursor-pointer"
          >
            <Phone size={20} aria-hidden="true" /> Entrar em contato
          </a>
        </div>

        {/* Métricas estilo iFood */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-tcc-azul-darker/40 p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Users size={22} className="text-tcc-laranja mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold">{totalClientesAtendidos}</p>
            <p className="text-caption text-tcc-azul-light">Clientes atendidos</p>
          </div>
          <div className="bg-tcc-azul-darker/40 p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Star size={22} className="text-tcc-laranja mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold">{totalAvaliacoes}</p>
            <p className="text-caption text-tcc-azul-light">Avaliações</p>
          </div>
          <div className="bg-tcc-azul-darker/40 p-5 rounded-2xl flex flex-col items-center text-center gap-1">
            <Clock3 size={22} className="text-tcc-laranja mb-1" aria-hidden="true" />
            <p className="text-h6 font-bold capitalize">{membroDesde}</p>
            <p className="text-caption text-tcc-azul-light">No Marca Aí desde</p>
          </div>
        </div>

        {/* Bio */}
        {usuario.biografia && (
          <div className="bg-tcc-azul-darker/40 p-6 rounded-3xl shadow-card mt-8">
            <h2 className="text-body-lg font-bold font-display mb-2">Sobre</h2>
            <p className="text-tcc-azul-lightest leading-relaxed whitespace-pre-line">
              {usuario.biografia}
            </p>
          </div>
        )}

        {/* Serviços do prestador */}
        <div className="mt-10">
          <h2 className="text-h6 font-bold font-display mb-4">
            Serviços de {usuario.nome.split(' ')[0]}
          </h2>

          {servicosFormatados.length === 0 ? (
            <p className="text-tcc-azul-lightest">Nenhum serviço cadastrado no momento.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {servicosFormatados.map((s) => (
                <CardServicoCatalogo key={s.id} servico={s} avaliacao={avaliacaoMedia} />
              ))}
            </div>
          )}
        </div>

        {/* Avaliações */}
        <div className="mt-10">
          <h2 className="text-h6 font-bold font-display mb-4">Avaliações de clientes</h2>

          {avaliacoes.length === 0 ? (
            <p className="text-tcc-azul-lightest">Ainda sem avaliações.</p>
          ) : (
            <div className="space-y-4">
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-tcc-azul-darker/40 p-5 rounded-2xl flex gap-4">
                  <div className="relative size-11 rounded-full overflow-hidden bg-tcc-azul-dark shrink-0 flex items-center justify-center">
                    {av.clienteImagem ? (
                      <Image src={av.clienteImagem} alt={av.clienteNome} fill className="object-cover" />
                    ) : (
                      <span className="text-body-sm font-bold text-tcc-azul-light">
                        {av.clienteNome?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-bold text-body-sm">{av.clienteNome}</p>
                      <EstrelasNota nota={av.nota || 0} tamanho={13} />
                    </div>
                    <p className="text-caption text-tcc-azul-light mb-1">{av.servicoNome}</p>
                    {av.comentario && (
                      <p className="text-body-sm text-tcc-azul-lightest">{av.comentario}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}