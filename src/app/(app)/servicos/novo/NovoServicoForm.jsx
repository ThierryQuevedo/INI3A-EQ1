"use client";
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ServiceImageUpload from '@/app/components/features/servicos/ServiceImageUpload';
import ServiceCard from '@/app/components/features/servicos/ServiceCard';
import Combobox from '@/app/components/ui/Combobox';
import PageContainer from '@/app/components/ui/PageContainer';

const CAMPO_CLASSE =
  'w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-body-sm placeholder:text-muted-foreground shadow-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all';

export default function NovoServicoForm({ categorias = [], action, nomePrestador }) {
  const router = useRouter();

  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [erroCategoria, setErroCategoria] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState('');
  const [urlImagem, setUrlImagem] = useState('');

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

  function escolherCategoria(valor) {
    setCategoriaSelecionada(valor);
    setErroCategoria(false);
  }

  function aoSubmeter(e) {
    if (!categoriaSelecionada) {
      e.preventDefault();
      setErroCategoria(true);
    }
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

  return (
    <PageContainer size="lg" className="py-8">

        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 h-9 -ml-2 px-2 rounded-full text-body-sm text-primary font-semibold mb-3 hover:bg-muted transition-colors duration-fast cursor-pointer"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar
          </button>
          <h1 className="text-h4 font-extrabold text-foreground tracking-tight">Novo serviço</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Preencha as informações abaixo. O card à direita mostra como ele vai aparecer para os clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">

          <form action={action} onSubmit={aoSubmeter} className="bg-card rounded-2xl shadow-soft border border-border p-6 md:p-8 space-y-5">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-body-sm font-medium text-foreground">
                Nome do serviço <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Ex: Consultoria de Software"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={CAMPO_CLASSE}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoriaId" className="text-body-sm font-medium text-foreground">
                Categoria <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input type="hidden" name="categoriaId" value={categoriaSelecionada} />
              <Combobox
                id="categoriaId"
                aria-label="Categoria"
                value={categoriaSelecionada}
                onChange={escolherCategoria}
                placeholder="Selecione uma categoria"
                className="[&>button]:h-12"
                options={[
                  ...categorias.map((cat) => ({ value: String(cat.id), label: cat.nome })),
                  { value: 'outro', label: 'Outro (especificar)' },
                ]}
              />
              {erroCategoria && (
                <p role="alert" className="text-caption font-medium text-destructive">Selecione uma categoria para continuar.</p>
              )}
            </div>

            {categoriaSelecionada === 'outro' && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="novaCategoria" className="text-body-sm font-medium text-foreground">
                  Qual é a nova categoria? <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id="novaCategoria"
                  name="novaCategoria"
                  placeholder="Digite o nome da categoria"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  className={CAMPO_CLASSE}
                  required={categoriaSelecionada === 'outro'}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1.5">
                <label htmlFor="preco" className="text-body-sm font-medium text-foreground">
                  Preço (R$) <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground text-body-sm pointer-events-none">
                    R$
                  </span>
                  <input
                    type="number"
                    id="preco"
                    name="preco"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    maxLength={9}
                    placeholder="0,00"
                    value={preco}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={aoMudarPreco}
                    className={`${CAMPO_CLASSE} pl-10`}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="duracaoEstimada" className="text-body-sm font-medium text-foreground">
                  Duração estimada <span className="text-destructive" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="duracaoEstimada"
                    name="duracaoEstimada"
                    min="1"
                    placeholder="Ex: 60"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    className={`${CAMPO_CLASSE} pr-16`}
                    required
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground text-caption pointer-events-none">
                    minutos
                  </span>
                </div>
              </div>

            </div>

            <ServiceImageUpload
              name="urlImagem"
              label="Foto de apresentação do serviço"
              maxSizeMB={5}
              onChange={(url) => setUrlImagem(url || '')}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="descricao" className="text-body-sm font-medium text-foreground">
                  Descrição
                </label>
                <span className="text-caption text-muted-foreground">Opcional</span>
              </div>
              <textarea
                id="descricao"
                name="descricao"
                rows="4"
                placeholder="Descreva detalhadamente o escopo..."
                className={`${CAMPO_CLASSE} resize-none`}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 h-13 bg-accent hover:bg-accent-hover text-accent-foreground font-display font-bold text-body-lg rounded-full shadow-soft transition-all duration-200 ease-apple active:scale-[0.98] cursor-pointer text-center"
            >
              Cadastrar serviço
            </button>

          </form>

          <div className="lg:sticky lg:top-8">
            <p className="text-caption font-semibold text-muted-foreground uppercase tracking-wide mb-3 text-center lg:text-left">
              Pré-visualização
            </p>
            <div className="bg-muted/40 border border-border rounded-2xl p-5 flex justify-center">
              <div className="w-full max-w-[240px]">
                <ServiceCard servico={servicoPreview} interativo={false} />
              </div>
            </div>
            <p className="text-caption text-muted-foreground mt-3 text-center lg:text-left">
              É assim que os clientes vão ver seu serviço na busca.
            </p>
          </div>

        </div>

    </PageContainer>
  );
}
