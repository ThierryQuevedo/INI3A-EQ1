"use client";
import { startTransition, useActionState, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import ServiceImageUpload from '@/app/components/features/servicos/ServiceImageUpload';
import ServiceCard from '@/app/components/features/servicos/ServiceCard';
import Combobox from '@/app/components/ui/Combobox';
import PageContainer, { PageHeader } from '@/app/components/ui/PageContainer';
import BotaoVoltar from '@/app/components/ui/BotaoVoltar';
import FormField from '@/app/components/ui/FormField';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';

// Mesmo contorno, foco e estado de erro do <Input>, para o campo de várias linhas.
const CLASSE_TEXTAREA =
  'w-full min-h-28 bg-background border border-input rounded-lg px-4 py-3 text-body text-foreground placeholder:text-muted-foreground outline-none transition resize-y focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent';

const ESTADO_INICIAL = { erro: null, campo: null };

/** Formulário de serviço: cria um novo ou, recebendo `servico`, edita o existente. */
export default function ServicoForm({ categorias = [], action, nomePrestador, servico = null }) {
  const [estado, formAction, enviando] = useActionState(action, ESTADO_INICIAL);
  const editando = !!servico;

  const [categoriaSelecionada, setCategoriaSelecionada] = useState(servico ? String(servico.categoriaId) : '');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [erroCategoriaLocal, setErroCategoriaLocal] = useState(false);
  const [nome, setNome] = useState(servico?.nome ?? '');
  const [preco, setPreco] = useState(servico?.preco ?? '');
  const [duracao, setDuracao] = useState(servico ? String(servico.duracaoEstimada) : '');
  const [descricao, setDescricao] = useState(servico?.descricao ?? '');
  const [urlImagem, setUrlImagem] = useState(servico?.urlImagem ?? '');

  // Erro vindo do servidor: leva o foco ao campo em questão.
  useEffect(() => {
    if (estado?.campo) document.getElementById(estado.campo)?.focus();
  }, [estado]);

  const nomeCategoriaPreview = useMemo(() => {
    if (categoriaSelecionada === 'outro') return novaCategoria.trim();
    const categoria = categorias.find((c) => String(c.id) === String(categoriaSelecionada));
    return categoria?.nome || '';
  }, [categoriaSelecionada, novaCategoria, categorias]);

  const servicoPreview = {
    nomeServico: nome.trim() || 'Nome do serviço',
    nomeProfissional: nomePrestador || 'Você',
    nomeCategoria: nomeCategoriaPreview || null,
    preco,
    duracaoEstimada: duracao === '' ? null : duracao,
    urlImagem,
  };

  function erroDoCampo(campo) {
    return estado?.campo === campo ? estado.erro : null;
  }

  const erroCategoria = erroCategoriaLocal ? 'Selecione uma categoria para continuar.' : erroDoCampo('categoriaId');
  // Erro do servidor sem campo (falha ao salvar) aparece junto do botão.
  const erroGeral = estado?.erro && !estado?.campo ? estado.erro : null;

  function escolherCategoria(valor) {
    setCategoriaSelecionada(valor);
    setErroCategoriaLocal(false);
  }

  // Envio manual: quando o React executa a `action` do <form>, ele reseta o
  // formulário a cada envio e os campos controlados voltam a mostrar o valor
  // anterior enquanto o estado guarda o novo.
  function aoSubmeter(e) {
    e.preventDefault();
    if (!categoriaSelecionada) {
      setErroCategoriaLocal(true);
      document.getElementById('categoriaId')?.focus();
      return;
    }
    const dados = new FormData(e.currentTarget);
    startTransition(() => formAction(dados));
  }

  function aoMudarPreco(e) {
    if (e.target.value.length > 9) {
      e.target.value = e.target.value.slice(0, 9);
    }
    const num = parseFloat(e.target.value);
    if (!isNaN(num) && num > 999999.99) {
      e.target.value = '999999.99';
    }
    setPreco(e.target.value);
  }

  function propsErro(campo) {
    const erro = erroDoCampo(campo);
    return erro ? { 'aria-invalid': true, 'aria-describedby': `${campo}-erro` } : {};
  }

  return (
    <PageContainer size="lg" className="py-8">
      <BotaoVoltar fallbackHref={editando ? `/servicos/${servico.slug || servico.id}` : '/dashboard'} className="h-toque mb-3" />
      <PageHeader
        title={editando ? 'Editar serviço' : 'Novo serviço'}
        description={
          editando
            ? 'As alterações valem para os próximos agendamentos. O card de pré-visualização mostra como ele vai aparecer para os clientes.'
            : 'Preencha as informações abaixo. O card de pré-visualização mostra como ele vai aparecer para os clientes.'
        }
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
        <form
          // `action` fica para o envio antes da hidratação (POST progressivo,
          // nada na URL). Hidratado, o preventDefault do onSubmit faz o React
          // não executá-la — e, com isso, não resetar o formulário.
          action={formAction}
          onSubmit={aoSubmeter}
          aria-busy={enviando}
          className="bg-card rounded-xl shadow-soft border border-border p-6 md:p-8 space-y-6"
        >
          {editando && <input type="hidden" name="servicoId" value={servico.id} />}

          <FormField id="nome" label="Nome do serviço" required error={erroDoCampo('nome')}>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Consultoria de Software"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={120}
              autoComplete="off"
              required
              {...propsErro('nome')}
            />
          </FormField>

          <FormField id="categoriaId" label="Categoria" required error={erroCategoria}>
            <input type="hidden" name="categoriaId" value={categoriaSelecionada} />
            <Combobox
              id="categoriaId"
              aria-label="Categoria"
              aria-invalid={!!erroCategoria}
              aria-describedby={erroCategoria ? 'categoriaId-erro' : undefined}
              value={categoriaSelecionada}
              onChange={escolherCategoria}
              placeholder="Selecione uma categoria"
              className="[&>button]:h-12 [&>button]:text-body"
              options={[
                ...categorias.map((cat) => ({ value: String(cat.id), label: cat.nome })),
                { value: 'outro', label: 'Outro (especificar)' },
              ]}
            />
          </FormField>

          {categoriaSelecionada === 'outro' && (
            <FormField
              id="novaCategoria"
              label="Qual é a nova categoria?"
              required
              error={erroDoCampo('novaCategoria')}
            >
              <Input
                id="novaCategoria"
                name="novaCategoria"
                placeholder="Digite o nome da categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                maxLength={60}
                required
                {...propsErro('novaCategoria')}
              />
            </FormField>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4">
            <FormField id="preco" label="Preço" required error={erroDoCampo('preco')}>
              <div className="relative">
                <span
                  className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground text-body pointer-events-none"
                  aria-hidden="true"
                >
                  R$
                </span>
                <Input
                  type="number"
                  id="preco"
                  name="preco"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  max="999999.99"
                  placeholder="0,00"
                  value={preco}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                  }}
                  onChange={aoMudarPreco}
                  className="pl-11 tabular-nums"
                  required
                  {...propsErro('preco')}
                />
              </div>
            </FormField>

            <FormField
              id="duracaoEstimada"
              label="Duração estimada"
              required
              error={erroDoCampo('duracaoEstimada')}
            >
              <div className="relative">
                <Input
                  type="number"
                  id="duracaoEstimada"
                  name="duracaoEstimada"
                  inputMode="numeric"
                  min="1"
                  max="1440"
                  step="1"
                  placeholder="Ex: 60"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  className="pr-24 tabular-nums"
                  required
                  {...propsErro('duracaoEstimada')}
                />
                <span
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground text-body-sm pointer-events-none"
                  aria-hidden="true"
                >
                  minutos
                </span>
              </div>
            </FormField>
          </div>

          <ServiceImageUpload
            name="urlImagem"
            initialUrl={servico?.urlImagem ?? ''}
            label="Foto de apresentação do serviço"
            maxSizeMB={5}
            onChange={(url) => setUrlImagem(url || '')}
          />

          <FormField id="descricao" label="Descrição" hint="Opcional.">
            <textarea
              id="descricao"
              name="descricao"
              rows={4}
              maxLength={2000}
              placeholder="Descreva detalhadamente o escopo..."
              aria-describedby="descricao-dica"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={CLASSE_TEXTAREA}
            />
          </FormField>

          {erroGeral && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-body-sm text-foreground"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
              <p>{erroGeral}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={enviando}>
            {enviando && <Loader2 className="animate-spin" aria-hidden="true" />}
            {editando
              ? (enviando ? 'Salvando…' : 'Salvar alterações')
              : (enviando ? 'Cadastrando…' : 'Cadastrar serviço')}
          </Button>
        </form>

        <section aria-labelledby="titulo-previa" className="lg:sticky lg:top-8">
          <h2 id="titulo-previa" className="font-sans text-body-sm font-semibold text-muted-foreground tracking-normal mb-3 text-center lg:text-left">
            Pré-visualização
          </h2>
          <div className="bg-muted/40 border border-border rounded-xl p-5 flex justify-center">
            <div className="w-full max-w-[240px]">
              <ServiceCard servico={servicoPreview} interativo={false} />
            </div>
          </div>
          <p className="text-caption text-muted-foreground mt-3 text-center lg:text-left">
            É assim que os clientes vão ver seu serviço na busca.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
