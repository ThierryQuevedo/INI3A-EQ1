import { Calendar, Clock, DollarSign, Phone, Mail, MapPin, Award } from 'lucide-react';
import Image from "next/image";
import Link from 'next/link';
import CardServicoCatalogo from '../../../../components/cards/CardServicoCatalogo'; 


async function getServicoDados(id) {
  return {
    id: id,
    nome: "Corte de Cabelo & Barba Premium",
    descricao: "Um serviço completo para o seu visual. Inclui lavagem com shampoo premium, corte personalizado de acordo com seu estilo, alinhamento de barba com toalha quente e finalização com pomada modeladora nacional ou importada.",
    preco: "85.00",
    duracaoEstimada: 60,
    categoria: "Cabelo e Barba",
    avaliacaoMedia: 4.5,
    prestador: {
      nome: "Fabrício Santos",
      biografia: "Profissional com mais de 8 anos de experiência no mercado de estética masculina, especializado em cortes modernos, visagismo e barboterapia relaxante.",
      telefone: "(14) 99888-7766",
      email: "fabricio.barber@marcaai.com",
    }
  };
}

export default async function DetalheServico({ params }) {
  const { id } = await params;
  const servico = await getServicoDados(id);

  return (
    <div className="bg-tcc-azul-deep min-h-screen text-white font-sans">
      

      <div className="relative h-60 w-full bg-gradient-to-b from-tcc-azul-darker to-tcc-azul-deep overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover bg-center" />
      </div>


      <div className="max-w-5xl mx-auto px-6 -mt-24 relative z-10 pb-20">
        

        <div className="flex flex-col items-center text-center md:text-left md:items-end md:flex-row md:justify-between bg-tcc-azul-darker/60 backdrop-blur-md p-6 rounded-3xl shadow-2xl gap-6">
          <div className="flex flex-col items-center md:flex-row gap-6">
    
            <div className="relative size-32 rounded-2xl overflow-hidden border-4 border-tcc-azul-medium shadow-md">
              <Image 
                src="https://picsum.photos/200/200?random=1" 
                alt={servico.prestador.nome}
                fill
                className="object-cover"
              />
            </div>
  
            <div className="flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-tcc-laranja-pale mb-1">
                {servico.categoria}
              </span>
              <h1 className="text-3xl font-extrabold font-urbanist tracking-tight mb-2">
                {servico.nome}
              </h1>
              <p className="text-tcc-azul-light font-medium mb-3">Por: {servico.prestador.nome}</p>
              
              <div className="bg-tcc-azul-dark w-fit mx-auto md:mx-0 px-4 py-1.5 rounded-full flex items-center gap-2 border border-tcc-azul/40">
                <span className="text-sm font-bold text-tcc-laranja">{servico.avaliacaoMedia.toFixed(1)}</span>
                <div className="flex text-tcc-laranja scale-90">
                  <span>★ ★ ★ ★ ½</span>
                </div>
                <span className="text-xs text-tcc-azul-lightest">(32 avaliações)</span>
              </div>
            </div>
          </div>

 
          <Link href={`/agendamento/novo?servico=${servico.id}`} className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-tcc-laranja text-white hover:bg-tcc-laranja-dark active:scale-98 font-bold px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg">
              <Calendar size={22} /> Agendar Horário
            </button>
          </Link>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          
        
          <div className="md:col-span-2 space-y-6">
            <div className="bg-tcc-azul-darker/40 p-8 rounded-3xl  shadow-inner">
              <h2 className="text-xl font-bold font-urbanist border-b border-tcc-azul-dark pb-3 mb-4 flex items-center gap-2">
                <Award size={20} className="text-tcc-laranja" /> Detalhes do Serviço
              </h2>
              <p className="text-tcc-azul-lightest leading-relaxed font-light whitespace-pre-line">
                {servico.descricao}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-tcc-azul-darker/40 p-5 rounded-2xl   flex items-center gap-4">
                <div className="bg-tcc-laranja/10 p-3 rounded-xl text-tcc-laranja">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-xs text-tcc-azul-light font-medium">Valor do serviço</p>
                  <p className="text-xl font-bold text-white">R$ {parseFloat(servico.preco).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              <div className="bg-tcc-azul-darker/40 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-tcc-azul/20 p-3 rounded-xl text-tcc-azul-medium">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs text-tcc-azul-light font-medium">Tempo estimado</p>
                  <p className="text-xl font-bold text-white">{servico.duracaoEstimada} min</p>
                </div>
              </div>
            </div>
          </div>


          <div className="space-y-6">
            <div className="bg-tcc-azul-darker/40 p-6 rounded-3xl shadow-md">
              <h2 className="text-lg font-bold font-urbanist border-b border-tcc-azul-dark pb-3 mb-4">
                Sobre o Profissional
              </h2>
              <p className="text-sm text-tcc-azul-lightest leading-relaxed mb-6 font-light">
                {servico.prestador.biografia}
              </p>

              <h3 className="text-xs font-bold uppercase tracking-wider text-tcc-azul-light mb-3">
                Canais de Contato
              </h3>
              
              <div className="space-y-3">
                <a href={`tel:${servico.prestador.telefone}`} className="flex items-center gap-3 text-sm text-tcc-azul-lightest hover:text-tcc-azul-medium transition-colors p-2.5 rounded-xl bg-tcc-azul-deep/50 border border-tcc-azul-dark/30">
                  <Phone size={16} className="text-tcc-laranja" />
                  <span>{servico.prestador.telefone}</span>
                </a>
                <a href={`mailto:${servico.prestador.email}`} className="flex items-center gap-3 text-sm text-tcc-azul-lightest hover:text-tcc-azul-medium transition-colors p-2.5 rounded-xl bg-tcc-azul-deep/50 border border-tcc-azul-dark/30 overflow-hidden text-ellipsis">
                  <Mail size={16} className="text-tcc-laranja" />
                  <span className="truncate">{servico.prestador.email}</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}