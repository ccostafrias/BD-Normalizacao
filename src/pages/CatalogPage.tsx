import { useCatalog } from '../hooks/useCatalog';
import { ModuleCard } from '../components/ModuleCard';
import { Icon } from '../components/ui/Icon';
import { Button, EmptyState, PageHeading } from '../components/ui/Primitives';

export default function CatalogPage() {
  const { search, difficulty, mode, groups, queryString, setFilter, clearFilters } = useCatalog();
  return <>
    <PageHeading eyebrow="APRENDA FAZENDO" title="Um desafio de cada vez." description="Escolha um módulo. Você pode voltar às respostas e refazer qualquer questão." />
    <div className="catalog-toolbar panel">
      <label className="search-field">
        <Icon name="search" size={19} />
        <span className="sr-only">Buscar questões por assunto</span>
        <input type="search" placeholder="Busque por chaves, dependências, 3FN…" value={search} onChange={(event) => setFilter('busca', event.target.value)} />
      </label>
      <label className="select-field">
        <span>Nível</span>
        <select value={difficulty} onChange={(event) => setFilter('nivel', event.target.value)}>
          <option value="">Todos os níveis</option>
          <option value="easy">Fácil</option>
          <option value="medium">Intermediário</option>
          <option value="hard">Desafio</option>
        </select>
      </label>
    </div>
    <div className="catalog-subbar">
      <div className="segmented" aria-label="Filtrar questões">
        <button className={mode === '' ? 'active' : ''} onClick={() => setFilter('modo', '')}>Todas</button>
        <button className={mode === 'revisao' ? 'active' : ''} onClick={() => setFilter('modo', 'revisao')}>Revisar erros</button>
        <button className={mode === 'salvas' ? 'active' : ''} onClick={() => setFilter('modo', 'salvas')}>Salvas para depois</button>
      </div>
      <span className="muted small">{groups.reduce((sum, g) => sum + g.count, 0)} questões disponíveis</span>
    </div>
    {groups.length ? <div className="module-grid">
      {groups.map((item) => <ModuleCard key={item.module.id} {...item} to={`/praticar/${item.module.id}${queryString ? `?${queryString}` : ''}`} />)}
    </div> : <EmptyState title="Nenhuma questão por aqui" description={mode === 'revisao' ? 'Você ainda não tem erros com esses filtros. Continue praticando ou veja todos os exercícios.' : mode === 'salvas' ? 'Salve questões durante a prática para encontrá-las aqui.' : 'Tente outro assunto ou remova o filtro de dificuldade.'} action={<Button onClick={clearFilters}>Ver todas as questões</Button>} />}
    <aside className="tip-strip">
      <Icon name="bulb" size={21} />
      <p><strong>Não sabe por onde começar?</strong> Siga a ordem dos módulos. Os primeiros ajudam a construir a intuição para os próximos.</p>
    </aside>
  </>;
}
