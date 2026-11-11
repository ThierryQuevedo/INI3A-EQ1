// apaga o banco inteiro e cria dados de demonstracao
// precisa de confirmar_limpeza sim e demo_senha no ambiente
// node --experimental-strip-types --env-file=.env --env-file=demo.env db/seed-demo.js
// emails example com nao chegam a ninguem
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import {
  usuarios, prestadores, categorias, servicos, disponibilidades, agendamentos,
  avaliacoes, mensagens, favoritos, notificacoes,
} from './schema.ts';
import { CATEGORIAS_PADRAO } from '../lib/categorias.js';
import { gerarSlug } from '../lib/slug.js';
import { hojeNoFuso, somarDias, diaDaSemana, instanteNoFuso, minutosDaHora } from '../lib/formatoData.js';
import {
  emailNovoAgendamentoPrestador, emailAgendamentoSolicitadoCliente, emailAgendamentoConfirmado,
  emailAgendamentoCancelado, emailNovaMensagem, emailServicoConcluido, emailNovaAvaliacao,
} from '../lib/emails/templates.js';

const PREFIXO_MOTIVO = 'Cancelei este agendamento. Motivo: '; // igual a lib motivocancelamento
const foto = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const BAURU = { lat: -22.3246, lng: -49.0871 };

// pessoas
const PRESTADORES = [
  { chave: 'rafael', nome: 'Rafael Barbosa', bio: 'Barbeiro há 9 anos. Corte clássico, degradê e barba na navalha, com toalha quente.', bairro: 'Vila Universitária', d: [0.004, -0.006] },
  { chave: 'camila', nome: 'Camila Duarte', bio: 'Massoterapeuta e instrutora de yoga. Atendo em espaço próprio, tranquilo e climatizado.', bairro: 'Jardim Estoril', d: [-0.012, 0.009] },
  { chave: 'diego', nome: 'Diego Martins', bio: 'Educador físico (CREF ativo). Treinos de força e condicionamento, do iniciante ao avançado.', bairro: 'Vila Nova Cidade Universitária', d: [0.016, -0.004] },
  { chave: 'juliana', nome: 'Juliana Prado', bio: 'Manicure e nail designer. Material esterilizado em autoclave e esmaltes hipoalergênicos.', bairro: 'Centro', d: [0.001, 0.002] },
  { chave: 'marcos', nome: 'Marcos Ribeiro', bio: 'Violonista formado pelo conservatório de Tatuí. Aulas para crianças e adultos, do zero às primeiras músicas.', bairro: 'Vila Cardia', d: [-0.006, -0.011] },
  { chave: 'beatriz', nome: 'Beatriz Lima', bio: 'Professora de matemática e inglês. Reforço escolar, vestibular e conversação.', bairro: 'Jardim Infante Dom Henrique', d: [0.009, 0.013] },
  { chave: 'patricia', nome: 'Patrícia Nogueira', bio: 'Nutricionista (CRN-3). Planos alimentares para emagrecimento, ganho de massa e reeducação alimentar.', bairro: 'Vila Aviação', d: [-0.018, 0.003] },
  { chave: 'lucas', nome: 'Lucas Ferreira', bio: 'Desenvolvedor web e técnico de informática. Sites rápidos para pequenos negócios e manutenção de computadores.', bairro: 'Jardim Bela Vista', d: [0.011, 0.007] },
  { chave: 'fernanda', nome: 'Fernanda Alves', bio: 'Fotógrafa e designer gráfica. Ensaios externos, fotos de produto e identidade visual.', bairro: 'Vila Engler', d: [-0.003, 0.015] },
  { chave: 'antonio', nome: 'Antônio Souza', bio: 'Eletricista e encanador com 15 anos de experiência. Orçamento na hora e serviço com garantia.', bairro: 'Parque Vista Alegre', d: [0.021, -0.013] },
  { chave: 'jose', nome: 'José Carlos Pereira', bio: 'Pintor e montador de móveis. Trabalho limpo, com proteção de pisos e móveis.', bairro: 'Jardim Ouro Verde', d: [-0.014, -0.017] },
  { chave: 'sonia', nome: 'Sônia Ramos', bio: 'Faxina residencial completa, com produtos próprios. Atendo casas e apartamentos.', bairro: 'Núcleo Mary Dota', d: [0.025, 0.019] },
];

const CLIENTES = [
  { chave: 'ana', nome: 'Ana Clara Mendes' },
  { chave: 'pedro', nome: 'Pedro Henrique Costa' },
  { chave: 'mariana', nome: 'Mariana Oliveira' },
  { chave: 'gustavo', nome: 'Gustavo Rocha' },
  { chave: 'larissa', nome: 'Larissa Campos' },
  { chave: 'felipe', nome: 'Felipe Andrade' },
];

// servicos com dias de 0 domingo a 6 sabado
const UTEIS = [1, 2, 3, 4, 5];
const SERVICOS = [
  { chave: 'barba', p: 'rafael', cat: 2, nome: 'Corte masculino e barba', preco: 55, dur: 45, foto: 'photo-1503951914875-452162b0f3f1', dias: [2, 3, 4, 5, 6], ini: '09:00', fim: '19:00',
    desc: 'Corte na tesoura ou máquina, acabamento na navalha e barba com toalha quente. Inclui lavagem.' },
  { chave: 'massagem', p: 'camila', cat: 2, nome: 'Massagem relaxante', preco: 120, dur: 60, foto: 'photo-1544161515-4ab6ce6db874', dias: UTEIS, ini: '09:00', fim: '18:00',
    desc: 'Sessão de 1 hora com óleos essenciais para aliviar tensão nas costas, pescoço e ombros.' },
  { chave: 'yoga', p: 'camila', cat: 2, nome: 'Aula particular de yoga', preco: 70, dur: 60, foto: 'photo-1544367567-0f2fcb009e0b', dias: [6], ini: '08:00', fim: '12:00',
    desc: 'Aula individual de hatha yoga, adaptada ao seu nível. Tapete e acessórios inclusos.' },
  { chave: 'personal', p: 'diego', cat: 2, nome: 'Treino com personal trainer', preco: 80, dur: 60, foto: 'photo-1571019614242-c5c5dee9f50b', dias: [1, 2, 3, 4, 5, 6], ini: '06:00', fim: '12:00',
    desc: 'Treino individual de força e condicionamento, com avaliação inicial e planilha para os outros dias.' },
  { chave: 'manicure', p: 'juliana', cat: 2, nome: 'Manicure e pedicure', preco: 55, dur: 90, foto: 'photo-1604654894610-df63bc536371', dias: [2, 3, 4, 5, 6], ini: '09:00', fim: '18:00',
    desc: 'Cutilagem, esmaltação tradicional ou em gel e hidratação das mãos e dos pés.' },
  { chave: 'nutricao', p: 'patricia', cat: 2, nome: 'Consulta com nutricionista', preco: 150, dur: 60, foto: 'photo-1490645935967-10de6ba17061', dias: [1, 3, 5], ini: '08:00', fim: '17:00',
    desc: 'Avaliação completa, bioimpedância e plano alimentar personalizado entregue em até 3 dias.' },
  { chave: 'violao', p: 'marcos', cat: 1, nome: 'Aula de violão', preco: 70, dur: 60, foto: 'photo-1510915361894-db8b60106cb1', dias: UTEIS, ini: '14:00', fim: '21:00',
    desc: 'Aula individual para iniciantes e intermediários: acordes, ritmos e as músicas que você quer tocar.' },
  { chave: 'matematica', p: 'beatriz', cat: 1, nome: 'Aula particular de matemática', preco: 60, dur: 60, foto: 'photo-1509062522246-3755977927d7', dias: UTEIS, ini: '13:00', fim: '19:00',
    desc: 'Reforço do fundamental ao ensino médio e preparação para vestibular e ENEM.' },
  { chave: 'ingles', p: 'beatriz', cat: 1, nome: 'Inglês para conversação', preco: 75, dur: 60, foto: 'photo-1546410531-bb4caa6b424d', dias: [2, 4], ini: '19:00', fim: '21:00',
    desc: 'Conversação com foco em viagem e trabalho. Material digital incluso.' },
  { chave: 'site', p: 'lucas', cat: 0, nome: 'Criação de site para pequenos negócios', preco: 900, dur: 120, foto: 'photo-1498050108023-c5249f4df085', dias: UTEIS, ini: '08:00', fim: '18:00',
    desc: 'Reunião de briefing e criação de um site de uma página, com WhatsApp, mapa e domínio próprio.' },
  { chave: 'computador', p: 'lucas', cat: 0, nome: 'Formatação e manutenção de computador', preco: 100, dur: 90, foto: 'photo-1588702547919-26089e690ecc', dias: UTEIS, ini: '08:00', fim: '18:00',
    desc: 'Formatação com backup dos arquivos, limpeza interna e instalação dos programas essenciais.' },
  { chave: 'fotografia', p: 'fernanda', cat: 0, nome: 'Ensaio fotográfico', preco: 250, dur: 120, foto: 'photo-1452587925148-ce544e77e70d', dias: [3, 4, 5, 6, 0], ini: '08:00', fim: '18:00',
    desc: 'Ensaio externo de 2 horas, com 30 fotos tratadas em alta resolução.' },
  { chave: 'logo', p: 'fernanda', cat: 0, nome: 'Criação de logotipo', preco: 400, dur: 60, foto: 'photo-1626785774573-4b799315345d', dias: [1, 2], ini: '09:00', fim: '17:00',
    desc: 'Reunião de briefing, três propostas de logotipo e arquivos finais para impressão e redes sociais.' },
  { chave: 'eletrica', p: 'antonio', cat: 3, nome: 'Reparo elétrico residencial', preco: 120, dur: 60, foto: 'photo-1621905251189-08b45d6a269e', dias: [1, 2, 3, 4, 5, 6], ini: '08:00', fim: '17:00',
    desc: 'Troca de tomadas, disjuntores e chuveiros, instalação de luminárias e diagnóstico de curto-circuito.' },
  { chave: 'vazamento', p: 'antonio', cat: 3, nome: 'Conserto de vazamentos', preco: 90, dur: 60, foto: 'photo-1585704032915-c3400ca199e7', dias: [1, 2, 3, 4, 5, 6], ini: '08:00', fim: '17:00',
    desc: 'Torneiras, sifões, registros e caixa acoplada. Detecção de vazamento sem quebrar parede.' },
  { chave: 'pintura', p: 'jose', cat: 3, nome: 'Pintura de cômodo', preco: 350, dur: 240, foto: 'photo-1562259949-e8e7689d7828', dias: UTEIS, ini: '08:00', fim: '16:00',
    desc: 'Pintura de um cômodo de até 15 m², com massa corrida nos reparos. Tinta por conta do cliente.' },
  { chave: 'moveis', p: 'jose', cat: 3, nome: 'Montagem de móveis', preco: 80, dur: 90, foto: 'photo-1504148455328-c376907d081c', dias: [1, 2, 3, 4, 5, 6], ini: '08:00', fim: '17:00',
    desc: 'Montagem de guarda-roupa, cama, rack e escrivaninha, com fixação na parede quando necessário.' },
  { chave: 'faxina', p: 'sonia', cat: 3, nome: 'Faxina residencial', preco: 180, dur: 240, foto: 'photo-1581578731548-c64695cc6952', dias: UTEIS, ini: '08:00', fim: '16:00',
    desc: 'Limpeza completa de casa ou apartamento de até 3 quartos, com produtos e equipamentos próprios.' },
];

// d e dias a partir de hoje e s e o indice do horario
// nota do cliente e notac do prestador
const AGENDA = [
  // concluidos
  { sv: 'barba', c: 'pedro', d: -24, s: 1, st: 'concluido', nota: 5, coment: 'Melhor degradê que já fiz em Bauru. Pontual e caprichoso.', notaC: 5 },
  { sv: 'barba', c: 'gustavo', d: -17, s: 3, st: 'concluido', nota: 5, coment: 'Ambiente muito bom e a toalha quente faz diferença.', notaC: 5, comentC: 'Cliente pontual, recomendo.' },
  { sv: 'barba', c: 'felipe', d: -9, s: 6, st: 'concluido', nota: 4, coment: 'Corte ótimo, só atrasou uns 10 minutos.' },
  { sv: 'massagem', c: 'ana', d: -21, s: 2, st: 'concluido', nota: 5, coment: 'Saí outra pessoa. A Camila é muito atenciosa.', notaC: 5 },
  { sv: 'massagem', c: 'mariana', d: -12, s: 4, st: 'concluido', nota: 5, coment: 'Relaxante de verdade, espaço lindo e cheiroso.' },
  { sv: 'massagem', c: 'larissa', d: -5, s: 1, st: 'concluido', nota: 4, coment: 'Muito boa, voltarei com certeza.' },
  { sv: 'personal', c: 'gustavo', d: -20, s: 0, st: 'concluido', nota: 5, coment: 'O Diego montou um treino que cabe na minha rotina. Ótimo profissional.', notaC: 4 },
  { sv: 'personal', c: 'pedro', d: -13, s: 1, st: 'concluido', nota: 5, coment: 'Avaliação física completa já na primeira aula.' },
  { sv: 'personal', c: 'gustavo', d: -6, s: 0, st: 'concluido', nota: 5 },
  { sv: 'manicure', c: 'mariana', d: -19, s: 1, st: 'concluido', nota: 5, coment: 'Unhas perfeitas e duraram duas semanas.', notaC: 5, comentC: 'Super simpática!' },
  { sv: 'manicure', c: 'larissa', d: -11, s: 2, st: 'concluido', nota: 4, coment: 'Trabalho caprichado, só achei que demorou um pouco.' },
  { sv: 'nutricao', c: 'ana', d: -18, s: 2, st: 'concluido', nota: 5, coment: 'Plano alimentar fácil de seguir e já perdi 3 kg.' },
  { sv: 'violao', c: 'felipe', d: -16, s: 2, st: 'concluido', nota: 5, coment: 'Em uma aula já toquei minha primeira música!', notaC: 5 },
  { sv: 'violao', c: 'felipe', d: -9, s: 2, st: 'concluido', nota: 5, coment: 'Paciência enorme com iniciante.' },
  { sv: 'matematica', c: 'larissa', d: -15, s: 3, st: 'concluido', nota: 5, coment: 'Explicou função do 2º grau de um jeito que finalmente entendi.', notaC: 5 },
  { sv: 'matematica', c: 'pedro', d: -8, s: 2, st: 'concluido', nota: 4 },
  { sv: 'computador', c: 'mariana', d: -14, s: 1, st: 'concluido', nota: 5, coment: 'Notebook voltou rápido como novo, e ele salvou todas as minhas fotos.' },
  { sv: 'site', c: 'gustavo', d: -22, s: 1, st: 'concluido', nota: 5, coment: 'Site da minha barbearia ficou lindo e já recebo pedidos pelo WhatsApp.', notaC: 5 },
  { sv: 'fotografia', c: 'ana', d: -10, s: 1, st: 'concluido', nota: 5, coment: 'Fotos maravilhosas, a Fernanda deixa a gente muito à vontade.' },
  { sv: 'eletrica', c: 'felipe', d: -23, s: 3, st: 'concluido', nota: 5, coment: 'Resolveu o curto do chuveiro em meia hora.', notaC: 5 },
  { sv: 'vazamento', c: 'mariana', d: -7, s: 2, st: 'concluido', nota: 4, coment: 'Achou o vazamento sem quebrar nada. Recomendo.' },
  { sv: 'moveis', c: 'larissa', d: -13, s: 2, st: 'concluido', nota: 5, coment: 'Montou o guarda-roupa inteiro e ainda deixou tudo limpo.' },
  { sv: 'pintura', c: 'pedro', d: -18, s: 0, st: 'concluido', nota: 3, coment: 'Pintura boa, mas terminou mais tarde do que o combinado.' },
  { sv: 'faxina', c: 'ana', d: -6, s: 0, st: 'concluido', nota: 5, coment: 'Casa impecável. Já marquei de novo!', notaC: 5 },
  // cancelados
  { sv: 'logo', c: 'gustavo', d: -12, s: 2, st: 'cancelado', motivo: 'Precisei adiar o lançamento da marca, vou remarcar no mês que vem.', porCliente: true },
  { sv: 'yoga', c: 'mariana', d: -4, s: 1, st: 'cancelado', motivo: 'Fiquei gripada, desculpa! Remarco assim que melhorar.', porCliente: true },
  { sv: 'eletrica', c: 'pedro', d: 4, s: 4, st: 'cancelado', motivo: 'Surgiu uma emergência em outra obra nesse horário. Pode marcar outro dia?', porCliente: false },
  // futuros
  { sv: 'barba', c: 'pedro', d: 1, s: 4, st: 'confirmado' },
  { sv: 'massagem', c: 'ana', d: 2, s: 3, st: 'confirmado' },
  { sv: 'violao', c: 'felipe', d: 2, s: 2, st: 'confirmado' },
  { sv: 'nutricao', c: 'larissa', d: 3, s: 1, st: 'confirmado' },
  { sv: 'personal', c: 'gustavo', d: 1, s: 0, st: 'confirmado' },
  { sv: 'fotografia', c: 'mariana', d: 5, s: 2, st: 'confirmado' },
  { sv: 'manicure', c: 'larissa', d: 3, s: 2, st: 'pendente' },
  { sv: 'matematica', c: 'pedro', d: 1, s: 3, st: 'pendente' },
  { sv: 'faxina', c: 'mariana', d: 6, s: 0, st: 'pendente' },
  { sv: 'site', c: 'felipe', d: 4, s: 2, st: 'pendente' },
];

const CONVERSAS = [
  { sv: 'barba', c: 'pedro', st: 'confirmado', msgs: [
    ['c', 'Oi Rafael! Consegue fazer o degradê mais baixo dessa vez?'],
    ['p', 'Consigo sim, Pedro. Te espero amanhã!'],
  ] },
  { sv: 'fotografia', c: 'mariana', st: 'confirmado', msgs: [
    ['c', 'Oi Fernanda, podemos fazer as fotos no Parque Vitória Régia?'],
    ['p', 'Ótima escolha! No fim da tarde a luz fica linda. Leve duas trocas de roupa.'],
    ['c', 'Combinado, obrigada!'],
  ] },
  { sv: 'site', c: 'felipe', st: 'pendente', msgs: [
    ['c', 'Olá Lucas, é para uma loja de bicicletas. Dá para ter catálogo de produtos?'],
  ] },
  { sv: 'violao', c: 'felipe', st: 'concluido', msgs: [
    ['c', 'Professor, qual violão você recomenda para começar?'],
    ['p', 'Um violão de nylon de entrada já resolve. Na próxima aula te mostro algumas opções.'],
  ] },
];

const FAVORITOS = [
  ['ana', 'massagem'], ['ana', 'fotografia'], ['pedro', 'barba'], ['gustavo', 'personal'],
  ['mariana', 'manicure'], ['larissa', 'matematica'], ['felipe', 'violao'],
  ['ana', '@camila'], ['mariana', '@fernanda'], ['gustavo', '@rafael'],
];

function telefone(n) {
  return `(14) 90000-${String(n).padStart(4, '0')}`;
}
function emailDe(nome) {
  return `${gerarSlug(nome).replace(/-/g, '.')}@example.com`;
}
function horaMais(hora, minutos) {
  const t = minutosDaHora(hora) + minutos;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
// grade do servico igual a lib disponibilidade
function grade(sv) {
  const lista = [];
  for (let t = minutosDaHora(sv.ini); t + sv.dur <= minutosDaHora(sv.fim); t += sv.dur) lista.push(horaMais('00:00', t));
  return lista;
}

async function main() {
  if (process.env.CONFIRMAR_LIMPEZA !== 'sim') throw new Error('Defina CONFIRMAR_LIMPEZA=sim: este script APAGA o banco inteiro.');
  if (!process.env.DEMO_SENHA || process.env.DEMO_SENHA.length < 8) throw new Error('Defina DEMO_SENHA (8+ caracteres) no ambiente.');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.');

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);
  const hoje = hojeNoFuso();
  const agora = new Date();
  const senha = await bcrypt.hash(process.env.DEMO_SENHA, 10);

  await db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE usuarios, sessoes, prestadores, categorias, servicos, disponibilidades, agendamentos,
      cobrancas, avaliacoes, mensagens, favoritos, notificacoes RESTART IDENTITY CASCADE`);

    const cats = await tx.insert(categorias).values(CATEGORIAS_PADRAO.map((nome) => ({ nome }))).returning();

    // contas
    const ids = {};
    const nomes = {};
    let n = 1;
    const desde = (diasAtras) => instanteNoFuso(somarDias(hoje, -diasAtras), '10:00');
    const [admin] = await tx.insert(usuarios).values({
      nome: 'Administração Marca Aí', slug: 'administracao-marca-ai', email: 'admin@example.com',
      telefone: telefone(n++), senha, tipo: 'cliente', admin: true, criadoEm: desde(100),
    }).returning();
    for (const [i, p] of PRESTADORES.entries()) {
      const [u] = await tx.insert(usuarios).values({
        nome: p.nome, slug: gerarSlug(p.nome), email: emailDe(p.nome), telefone: telefone(n++),
        senha, tipo: 'prestador', criadoEm: desde(90 - i * 4),
      }).returning();
      ids[p.chave] = u.id;
      nomes[p.chave] = p.nome;
      await tx.insert(prestadores).values({
        usuarioId: u.id, biografia: p.bio, raioAtendimentoKm: 15,
        latitude: BAURU.lat + p.d[0], longitude: BAURU.lng + p.d[1], enderecoTexto: `${p.bairro}, Bauru - SP`,
      });
    }
    for (const [i, c] of CLIENTES.entries()) {
      const [u] = await tx.insert(usuarios).values({
        nome: c.nome, slug: gerarSlug(c.nome), email: emailDe(c.nome), telefone: telefone(n++),
        senha, tipo: 'cliente', criadoEm: desde(60 - i * 5),
      }).returning();
      ids[c.chave] = u.id;
      nomes[c.chave] = c.nome;
    }
    const emails = Object.fromEntries([...PRESTADORES, ...CLIENTES].map((x) => [x.chave, emailDe(x.nome)]));

    // servicos e disponibilidades
    const sv = {};
    for (const s of SERVICOS) {
      const [linha] = await tx.insert(servicos).values({
        prestadorId: ids[s.p], categoriaId: cats[s.cat].id, nome: s.nome, slug: gerarSlug(s.nome),
        descricao: s.desc, urlImagem: foto(s.foto), preco: s.preco.toFixed(2), duracaoEstimada: s.dur,
      }).returning();
      sv[s.chave] = { ...s, id: linha.id };
      await tx.insert(disponibilidades).values(s.dias.map((dia) => ({
        prestadorId: ids[s.p], servicoId: linha.id, diaSemana: dia, horaInicio: s.ini, horaFim: s.fim,
      })));
    }

    // acha dia valido e horario livre
    const ocupado = new Map(); // prestador e dia para intervalos
    const notifs = [];
    const notificar = (chaveUsuario, tipo, template, criadoEm, lida) => notifs.push({
      usuarioId: ids[chaveUsuario], tipo, titulo: template.titulo, mensagem: template.mensagem, link: template.link,
      emailDestino: emails[chaveUsuario], enviado: true, criadoEm, lidaEm: lida ? criadoEm : null,
    });
    const criados = [];
    for (const a of AGENDA) {
      const s = sv[a.sv];
      const passo = a.d < 0 ? -1 : 1;
      let dia = somarDias(hoje, a.d);
      for (let k = 0; !s.dias.includes(diaDaSemana(dia)) || (a.d > 0 && dia <= hoje); k++) dia = somarDias(dia, passo);
      const slots = grade(s);
      const chaveOc = `${s.p}|${dia}`;
      const livres = ocupado.get(chaveOc) ?? [];
      let i = Math.min(a.s, slots.length - 1);
      const conflita = (h) => livres.some(([ini, fim]) => minutosDaHora(h) < fim && ini < minutosDaHora(h) + s.dur);
      for (let tent = 0; tent < slots.length && conflita(slots[i]); tent++) i = (i + 1) % slots.length;
      const hora = slots[i];
      livres.push([minutosDaHora(hora), minutosDaHora(hora) + s.dur]);
      ocupado.set(chaveOc, livres);

      const dataHora = instanteNoFuso(dia, hora);
      const [ag] = await tx.insert(agendamentos).values({ clienteId: ids[a.c], servicoId: s.id, dataHora, status: a.st }).returning();
      criados.push({ ...a, id: ag.id, dataHora });

      const dados = { agendamentoId: ag.id, prestadorNome: nomes[s.p], clienteNome: nomes[a.c], servicoNome: s.nome, dataHora };
      const pedidoEm = new Date(dataHora.getTime() - (a.d > 0 ? Math.min(2, a.d) : 3) * 86400e3 + 3600e3);
      const pedidoNoPassado = pedidoEm < agora;
      const quandoPedido = pedidoNoPassado ? pedidoEm : new Date(agora.getTime() - 3 * 3600e3);
      const recente = agora - quandoPedido < 2 * 86400e3;
      notificar(s.p, 'agendamento_criado', emailNovoAgendamentoPrestador(dados), quandoPedido, !recente || a.st !== 'pendente');
      notificar(a.c, 'agendamento_solicitado', emailAgendamentoSolicitadoCliente(dados), quandoPedido, true);
      if (a.st === 'confirmado' || a.st === 'concluido') {
        const confirmEm = new Date(quandoPedido.getTime() + 2 * 3600e3);
        notificar(a.c, 'agendamento_confirmado', emailAgendamentoConfirmado(dados), confirmEm, a.st === 'concluido' || agora - confirmEm > 86400e3);
      }
      if (a.st === 'concluido') {
        const fimEm = new Date(dataHora.getTime() + s.dur * 60e3);
        notificar(a.c, 'servico_concluido', emailServicoConcluido(dados), fimEm, true);
        if (a.nota || a.notaC) {
          await tx.insert(avaliacoes).values({
            agendamentoId: ag.id, notaParaPrestador: a.nota ?? null, comentarioPrestador: a.coment ?? null,
            notaParaCliente: a.notaC ?? null, comentarioCliente: a.comentC ?? null,
          });
        }
        if (a.nota) notificar(s.p, 'avaliacao_recebida', emailNovaAvaliacao({ ...dados, nota: a.nota, comentario: a.coment ?? null }), new Date(fimEm.getTime() + 5 * 3600e3), true);
      }
      if (a.st === 'cancelado') {
        const canceladoEm = new Date(Math.min(dataHora.getTime() - 86400e3, agora.getTime() - 5 * 3600e3));
        const quem = a.porCliente ? a.c : s.p;
        await tx.insert(mensagens).values({ agendamentoId: ag.id, remetenteId: ids[quem], texto: PREFIXO_MOTIVO + a.motivo, criadoEm: canceladoEm, lidaEm: canceladoEm });
        notificar(a.porCliente ? s.p : a.c, 'agendamento_cancelado',
          emailAgendamentoCancelado({ ...dados, canceladoPeloCliente: a.porCliente, motivo: a.motivo }), canceladoEm, agora - canceladoEm > 86400e3);
      }
    }

    // conversas
    for (const conv of CONVERSAS) {
      const ag = criados.find((x) => x.sv === conv.sv && x.c === conv.c && x.st === conv.st);
      const s = sv[conv.sv];
      let t = Math.min(ag.dataHora.getTime(), agora.getTime()) - (conv.msgs.length + 1) * 3 * 3600e3;
      for (const [i, [quem, texto]] of conv.msgs.entries()) {
        t += 2 * 3600e3 + i * 600e3;
        const autor = quem === 'c' ? conv.c : s.p;
        const ultima = i === conv.msgs.length - 1;
        const criadoEm = new Date(t);
        await tx.insert(mensagens).values({ agendamentoId: ag.id, remetenteId: ids[autor], texto, criadoEm, lidaEm: ultima && conv.st !== 'concluido' ? null : criadoEm });
        if (ultima) {
          const destinatario = quem === 'c' ? s.p : conv.c;
          notificar(destinatario, 'mensagem_recebida', emailNovaMensagem({
            agendamentoId: ag.id, destinatarioNome: nomes[destinatario], remetenteNome: nomes[autor], servicoNome: s.nome, texto,
          }), criadoEm, conv.st === 'concluido');
        }
      }
    }

    // favoritos
    await tx.insert(favoritos).values(FAVORITOS.map(([c, alvo]) => (alvo.startsWith('@')
      ? { usuarioId: ids[c], prestadorId: ids[alvo.slice(1)] }
      : { usuarioId: ids[c], servicoId: sv[alvo].id })));

    if (notifs.length) await tx.insert(notificacoes).values(notifs);

    console.log(`Demonstração criada: 1 admin (#${admin.id}), ${PRESTADORES.length} prestadores, ${CLIENTES.length} clientes, `
      + `${SERVICOS.length} serviços, ${criados.length} agendamentos, ${notifs.length} notificações.`);
  });

  await client.end();
}

main().catch((err) => {
  console.error('Erro no seed de demonstração:', err.message);
  process.exit(1);
});
