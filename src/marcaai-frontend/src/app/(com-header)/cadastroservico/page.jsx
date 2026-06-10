"use client";
import React, { useState } from 'react';
import { executarCadastroServico } from '../../../app/actions/auth'; // Adapte o caminho da sua action

export default function CadastroServico() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  const categoriasMock = [
    { id: 1, nome: 'Design & Tecnologia' },
    { id: 2, nome: 'Aulas & Consultoria' },
    { id: 3, nome: 'Saúde & Bem-estar' },
    { id: 4, nome: 'Manutenção & Reformas' },
  ];

  return (
    <div className="min-h-screen bg-tcc-azul-deep flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-tcc-neutro-200/40 p-8 md:p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-sora font-bold text-tcc-azul-darker tracking-tight">
            Novo Serviço
          </h2>
          <p className="text-xs md:text-sm font-inter text-tcc-neutro-400 mt-2">
            Cadastre um serviço na plataforma preenchendo as especificações abaixo.
          </p>
        </div>

        {/* Formulário chamando a Server Action diretamente */}
        <form action={executarCadastroServico} className="space-y-5">
          
          {/* Nome do Serviço */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nome" className="text-sm font-inter font-medium text-tcc-neutro-600">
              Nome do serviço <span className="text-tcc-laranja-dark">*</span>
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Ex: Consultoria de Software"
              className="w-full px-4 py-3 rounded-xl bg-tcc-neutro-100/60 border border-tcc-neutro-200 text-tcc-neutro-700 font-inter text-sm placeholder-tcc-neutro-300 focus:outline-none focus:border-tcc-azul focus:ring-4 focus:ring-tcc-azul-lightest transition-all"
              required
            />
          </div>

          {/* Categoria (categoriaId) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="categoriaId" className="text-sm font-inter font-medium text-tcc-neutro-600">
              Categoria <span className="text-tcc-laranja-dark">*</span>
            </label>
            <div className="relative">
              <select
                id="categoriaId"
                name="categoriaId"
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-tcc-neutro-100/60 border border-tcc-neutro-200 text-tcc-neutro-700 font-inter text-sm focus:outline-none focus:border-tcc-azul focus:ring-4 focus:ring-tcc-azul-lightest transition-all appearance-none cursor-pointer"
                required
              >
                <option value="" disabled hidden>Selecione uma categoria</option>
                {categoriasMock.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
                <option value="outro">Outro (Especificar)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-tcc-neutro-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Campo Condicional: Só renderiza se a opção for 'outro' */}
          {categoriaSelecionada === 'outro' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="novaCategoria" className="text-sm font-inter font-medium text-tcc-neutro-600">
                Qual é a nova categoria? <span className="text-tcc-laranja-dark">*</span>
              </label>
              <input
                type="text"
                id="novaCategoria"
                name="novaCategoria"
                placeholder="Digite o nome da categoria"
                className="w-full px-4 py-3 rounded-xl bg-tcc-neutro-100/60 border border-tcc-neutro-200 text-tcc-neutro-700 font-inter text-sm placeholder-tcc-neutro-300 focus:outline-none focus:border-tcc-azul focus:ring-4 focus:ring-tcc-azul-lightest transition-all"
                required={categoriaSelecionada === 'outro'}
              />
            </div>
          )}

          {/* Grid de Preço e Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Preço */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="preco" className="text-sm font-inter font-medium text-tcc-neutro-600">
                Preço (R$) <span className="text-tcc-laranja-dark">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-tcc-neutro-400 font-inter text-sm pointer-events-none">
                  R$
                </span>
                <input
                  type="number"
                  id="preco"
                  name="preco"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-tcc-neutro-100/60 border border-tcc-neutro-200 text-tcc-neutro-700 font-inter text-sm focus:outline-none focus:border-tcc-azul focus:ring-4 focus:ring-tcc-azul-lightest transition-all"
                  required
                />
              </div>
            </div>

            {/* Duração Estimada */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="duracaoEstimada" className="text-sm font-inter font-medium text-tcc-neutro-600">
                Duração estimada <span className="text-tcc-laranja-dark">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="duracaoEstimada"
                  name="duracaoEstimada"
                  min="1"
                  placeholder="Ex: 60"
                  className="w-full pr-16 pl-4 py-3 rounded-xl bg-tcc-neutro-100/60 border border-tcc-neutro-200 text-tcc-neutro-700 font-inter text-sm focus:outline-none focus:border-tcc-azul focus:ring-4 focus:ring-tcc-azul-lightest transition-all"
                  required
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-tcc-neutro-400 font-inter text-xs pointer-events-none">
                  minutos
                </span>
              </div>
            </div>

          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="descricao" className="text-sm font-inter font-medium text-tcc-neutro-600">
                Descrição
              </label>
              <span className="text-xs text-tcc-neutro-300 font-inter">Opcional</span>
            </div>
            <textarea
              id="descricao"
              name="descricao"
              rows="4"
              placeholder="Descreva detalhadamente o escopo..."
              className="w-full px-4 py-3 rounded-xl bg-tcc-neutro-100/60 border border-tcc-neutro-200 text-tcc-neutro-700 font-inter text-sm focus:outline-none focus:border-tcc-azul focus:ring-4 focus:ring-tcc-azul-lightest transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3.5 bg-tcc-laranja hover:bg-tcc-laranja-dark text-white font-urbanist font-bold text-base rounded-xl shadow-md transition-all transform active:scale-[0.99] cursor-pointer text-center"
          >
            Cadastrar Serviço
          </button>

        </form>
      </div>
    </div>
  );
}