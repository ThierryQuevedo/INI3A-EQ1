import { db } from './index.js';
import { 
  usuarios, 
  sessoes, 
  clientes, 
  prestadores, 
  categorias, 
  servicos, 
  disponibilidades, 
  agendamentos, 
  avaliacoes 
} from './schema.js';

async function executarSeed() {

  const novosUsuarios = await db.insert(usuarios).values([
    { nome: 'Ana Cliente', email: 'ana@email.com', telefone: '11999991111', senha: '123', tipo: 'cliente' },
    { nome: 'Bruno Cliente', email: 'bruno@email.com', telefone: '11999992222', senha: '123', tipo: 'cliente' },
    { nome: 'Carlos Prestador', email: 'carlos@email.com', telefone: '11999993333', senha: '123', tipo: 'prestador' },
    { nome: 'Diego Prestador', email: 'diego@email.com', telefone: '11999994444', senha: '123', tipo: 'prestador' }
  ]).returning({ id: usuarios.id });

  const idAna = novosUsuarios[0].id;
  const idBruno = novosUsuarios[1].id;
  const idCarlos = novosUsuarios[2].id;
  const idDiego = novosUsuarios[3].id;

  await db.insert(sessoes).values([
    { id: 'sessao_ana_123', usuarioId: idAna, expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 24) },
    { id: 'sessao_carlos_456', usuarioId: idCarlos, expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 24) }
  ]);

  await db.insert(clientes).values([
    { usuarioId: idAna, cpf: '111.111.111-11' },
    { usuarioId: idBruno, cpf: '222.222.222-22' }
  ]);

  await db.insert(prestadores).values([
    { usuarioId: idCarlos, documento: '33.333.333/0001-33', biografia: 'Especialista em reformas gerais.', raioAtendimentoKm: 15 },
    { usuarioId: idDiego, documento: '44.444.444/0001-44', biografia: 'Designer de interiores e consultor.', raioAtendimentoKm: 30 }
  ]);

  const novasCategorias = await db.insert(categorias).values([
    { nome: 'Manutenção' },
    { nome: 'Design' }
  ]).returning({ id: categorias.id });

  const idCatManutencao = novasCategorias[0].id;
  const idCatDesign = novasCategorias[1].id;

  const novosServicos = await db.insert(servicos).values([
    { prestadorId: idCarlos, categoriaId: idCatManutencao, nome: 'Pintura de Parede', descricao: 'Pintura residencial interna.', preco: '250.00', duracaoEstimada: 120 },
    { prestadorId: idCarlos, categoriaId: idCatManutencao, nome: 'Troca de Chuveiro', descricao: 'Instalação física e elétrica.', preco: '80.00', duracaoEstimada: 45 },
    { prestadorId: idDiego, categoriaId: idCatDesign, nome: 'Consultoria de Cores', descricao: 'Paleta ideal para ambientes.', preco: '400.00', duracaoEstimada: 90 }
  ]).returning({ id: servicos.id });

  const idServPintura = novosServicos[0].id;
  const idServChuveiro = novosServicos[1].id;

  await db.insert(disponibilidades).values([
    { prestadorId: idCarlos, diaSemana: 1, horaInicio: '08:00', horaFim: '18:00' },
    { prestadorId: idCarlos, diaSemana: 2, horaInicio: '08:00', horaFim: '18:00' },
    { prestadorId: idDiego, diaSemana: 3, horaInicio: '09:00', horaFim: '17:00' }
  ]);

  const novosAgendamentos = await db.insert(agendamentos).values([
    { clienteId: idAna, servicoId: idServPintura, dataHora: new Date(Date.now() + 1000 * 60 * 60 * 48), status: 'confirmado' },
    { clienteId: idBruno, servicoId: idServChuveiro, dataHora: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'concluido' }
  ]).returning({ id: agendamentos.id });

  const idAgendamentoConcluido = novosAgendamentos[1].id;

  await db.insert(avaliacoes).values([
    { 
      agendamentoId: idAgendamentoConcluido, 
      notaParaPrestador: 5, 
      comentarioPrestador: 'Excelente serviço, muito rápido!', 
      notaParaCliente: 5, 
      comentarioCliente: 'Ótimo cliente, pagamento imediato.' 
    }
  ]);

  process.exit(0);
}

executarSeed().catch((err) => {
  process.exit(1);
});