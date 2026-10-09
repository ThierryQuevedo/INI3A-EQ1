'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, PackageSearch } from 'lucide-react';
import { Input } from '@/app/components/ui/InputCatalogo';
import EmptyState from '@/app/components/ui/EmptyState';
import ServiceCard from '@/app/components/features/servicos/ServiceCard';
import FilterDrawer, { FILTROS_PADRAO } from '@/app/components/features/servicos/FilterDrawer';
import { ehHoje } from '@/lib/disponibilidade';

export default function ServicosClient({ servicos = [], categorias = [] }) {
    const searchParams = useSearchParams();
    const [termoBusca, setTermoBusca] = useState(searchParams.get('q') || '');
    const [filtros, setFiltros] = useState(() => ({
        ...FILTROS_PADRAO,
        categoriaId: searchParams.get('categoria') || '',
    }));

    const precoMaximo = useMemo(() => {
        const maior = servicos.reduce((max, s) => Math.max(max, Number(s.preco) || 0), 0);
        return Math.max(100, Math.ceil(maior / 10) * 10);
    }, [servicos]);

    const servicosFiltrados = useMemo(() => {
        const termo = termoBusca.toLowerCase();

        let resultado = servicos.filter((servico) => {
            const nomeServico = servico.nomeServico?.toLowerCase() || '';
            const nomePrestador = servico.nomeProfissional?.toLowerCase() || '';
            const nomeCategoria = servico.nomeCategoria?.toLowerCase() || '';

            const correspondeBusca =
                !termo || nomeServico.includes(termo) || nomePrestador.includes(termo) || nomeCategoria.includes(termo);

            const correspondeCategoria = !filtros.categoriaId || String(servico.categoriaId) === filtros.categoriaId;
            const correspondePreco = filtros.precoMax == null || Number(servico.preco) <= filtros.precoMax;
            const correspondeAvaliacao = (servico.avaliacaoMedia || 0) >= filtros.avaliacaoMin;
            const correspondeHorario = !filtros.comHorarioHoje || ehHoje(servico.proximoHorario);

            return correspondeBusca && correspondeCategoria && correspondePreco && correspondeAvaliacao && correspondeHorario;
        });

        if (filtros.ordenacao === 'avaliacao') {
            resultado = [...resultado].sort((a, b) => (b.avaliacaoMedia || 0) - (a.avaliacaoMedia || 0));
        } else if (filtros.ordenacao === 'preco_asc') {
            resultado = [...resultado].sort((a, b) => Number(a.preco) - Number(b.preco));
        } else if (filtros.ordenacao === 'preco_desc') {
            resultado = [...resultado].sort((a, b) => Number(b.preco) - Number(a.preco));
        }

        return resultado;
    }, [servicos, termoBusca, filtros]);

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                <div className="mb-6">
                    <h1 className="font-display text-foreground font-bold text-h4">Catálogo de serviços</h1>
                    <p className="text-muted-foreground text-body mt-1">
                        Encontre um profissional pelo nome, categoria ou tipo de serviço.
                    </p>
                </div>

                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                    <label htmlFor="busca-servicos" className="sr-only">Buscar por serviço, prestador ou categoria</label>
                    <Input
                        id="busca-servicos"
                        className="h-12 pl-11 text-body"
                        placeholder="Buscar por serviço, prestador ou categoria..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    <FilterDrawer filtros={filtros} onChange={setFiltros} categorias={categorias} precoMaximo={precoMaximo} />

                    <div className="flex-1 min-w-0 w-full">
                        <p className="text-body-sm text-muted-foreground mb-4">
                            {servicosFiltrados.length} resultado{servicosFiltrados.length !== 1 ? 's' : ''}
                        </p>

                        {servicosFiltrados.length === 0 ? (
                            <EmptyState
                                icon={PackageSearch}
                                title={servicos.length === 0 ? 'Nenhum serviço cadastrado ainda' : 'Nenhum resultado encontrado'}
                                description={
                                    servicos.length === 0
                                        ? 'Volte em breve — novos profissionais aparecem aqui assim que se cadastram.'
                                        : 'Tente ajustar os filtros ou buscar por outro termo.'
                                }
                            />
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                {servicosFiltrados.map((servico) => (
                                    <ServiceCard key={servico.id} servico={servico} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
