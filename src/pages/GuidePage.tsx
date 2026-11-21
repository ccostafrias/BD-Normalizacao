import { useEffect, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import rawGuide from '../data/guide.json';
import { documents, sourceUrl } from '../data/catalog';
import { searchGuide } from '../lib/guide-search.mjs';
import type { GuideSection } from '../types';
import { Icon } from '../components/ui/Icon';
import { Button, ButtonLink, EmptyState, PageHeading } from '../components/ui/Primitives';

const guide = rawGuide as GuideSection[];
const entries = guide.flatMap((section) => section.items);
const entryById = new Map(entries.map((entry) => [entry.id, entry]));
const alphabeticalEntries = [...entries].sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));
const startingPath = ['relacao', 'atributo', 'dependencia-funcional', 'chave-candidata', '1fn'];

export default function GuidePage() {
  const { hash } = useLocation();
  const [params, setParams] = useSearchParams();
  const search = params.get('busca') ?? '';
  const sections = useMemo(() => searchGuide(guide, search), [search]);
  const count = sections.reduce((sum, section) => sum + section.items.length, 0);
  const isSearching = search.trim().length > 0;

  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView({ block: 'start' });
    target?.focus({ preventScroll: true });
  }, [hash, sections]);

  function setSearch(value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set('busca', value);
      else next.delete('busca');
      return next;
    }, { replace: true, preventScrollReset: true });
  }

  return <>
    <PageHeading eyebrow="SEU DICIONÁRIO DE NORMALIZAÇÃO" title="Todo conceito tem um começo." description="Não precisa conhecer as siglas de antemão. Encontre uma definição, veja um exemplo e conecte os conceitos no seu ritmo." />
    <section className="guide-start panel" aria-labelledby="guide-start-title">
      <div className="inline-row">
        <span className="icon-tile tint-mint"><Icon name="bulb" size={23} /></span>
        <div>
          <h2 id="guide-start-title">Primeira vez na matéria?</h2>
          <p>Comece por este caminho. DF significa dependência funcional: uma regra sobre quais valores determinam outros.</p>
        </div>
      </div>
      <ol className="guide-start-path" aria-label="Caminho para começar">
        {startingPath.map((id, index) => <li key={id}>
          <Link to={`/guia#${id}`}><span aria-hidden="true">{index + 1}</span>{entryById.get(id)!.term}</Link>
        </li>)}
      </ol>
    </section>
    <div className="guide-search panel" role="search" aria-label="Buscar no guia de consulta">
      <label className="search-field" htmlFor="guide-search">
        <Icon name="search" size={20} />
        <span className="sr-only">Buscar um termo, sigla ou conceito</span>
        <input id="guide-search" type="search" placeholder="Busque por DF, chave, 3FN, Boyce–Codd…" value={search} onChange={(event) => setSearch(event.target.value)} aria-describedby="guide-search-help" aria-controls="guide-results" />
      </label>
      {search && <Button variant="ghost" icon="close" onClick={() => setSearch('')}>Limpar busca</Button>}
    </div>
    <div className="guide-search-status">
      <p id="guide-search-help">Pesquise pelo nome, pela sigla ou por uma palavra da explicação. Acentos e maiúsculas não fazem diferença.</p>
      <p role="status" aria-live="polite" aria-atomic="true">{isSearching ? `${count} ${count === 1 ? 'verbete encontrado' : 'verbetes encontrados'}` : `${entries.length} conceitos para consultar`}</p>
    </div>
    <div className="guide-layout">
      <nav className="guide-nav" aria-label="Conceitos do guia">
        <p className="eyebrow">POR ASSUNTO</p>
        {sections.map((section) => <Link key={section.id} to={`/guia${params.size ? `?${params}` : ''}#${section.id}`}>
          <Icon name={section.icon} size={18} />
          <span>{section.title}</span>
          <span className="guide-nav-count">{section.items.length}</span>
        </Link>)}
        <Link to="/guia#fontes"><Icon name="book" size={18} />Materiais de origem</Link>
        <details className="guide-index">
          <summary>Índice de A a Z</summary>
          <ul>
            {alphabeticalEntries.map((entry) => <li key={entry.id}><Link to={`/guia#${entry.id}`}>{entry.term}</Link></li>)}
          </ul>
        </details>
      </nav>
      <div className="guide-content" id="guide-results">
        {!count && <EmptyState title="Ainda não encontramos esse termo" description="Tente uma sigla como DF ou FNBC, uma palavra como chave, ou limpe a busca para explorar por assunto." action={<Button onClick={() => setSearch('')}>Ver todos os conceitos</Button>} />}
        {sections.map((section) => <section className="panel guide-section" id={section.id} key={section.id} tabIndex={-1} aria-labelledby={`${section.id}-title`}>
          <div className="inline-row">
            <span className={`icon-tile tint-${section.color}`}><Icon name={section.icon} size={23} /></span>
            <h2 id={`${section.id}-title`}>{section.title}</h2>
          </div>
          <p className="guide-intro">{section.intro}</p>
          <div className="guide-entries">
            {section.items.map((entry) => <article className="guide-entry" id={entry.id} key={entry.id} tabIndex={-1} aria-labelledby={`${entry.id}-title`}>
              <h3 id={`${entry.id}-title`}><Link className="guide-term-link" to={`/guia#${entry.id}`}>{entry.term}<Icon name="external" size={14} /></Link></h3>
              <p className="guide-aliases"><span>Você também encontra como:</span> {entry.aliases.join(' · ')}</p>
              <p className="guide-definition">{entry.text}</p>
              <div className="guide-example"><strong>Veja um exemplo</strong><p>{entry.example}</p></div>
              <details className="guide-detail"><summary>Um detalhe importante</summary><p>{entry.detail}</p></details>
              <div className="guide-related" aria-label={`Conceitos relacionados a ${entry.term}`}>
                <span>Conecte com</span>
                {entry.related.map((id) => <Link key={id} to={`/guia#${id}`}>{entryById.get(id)!.term}<Icon name="chevron" size={12} /></Link>)}
              </div>
            </article>)}
          </div>
          <p className="guide-source">Base conceitual: 9.1-Normalizacao.pdf · páginas {section.pages.join(', ')}. Definições introdutórias e exemplos foram ampliados para estudo.</p>
          {section.id === 'chaves' && <ButtonLink variant="soft" icon="flask" to="/laboratorio">Experimentar no laboratório</ButtonLink>}
        </section>)}
        <section className="panel guide-section" id="fontes" tabIndex={-1} aria-labelledby="fontes-title">
          <div className="inline-row">
            <span className="icon-tile tint-blue"><Icon name="book" size={23} /></span>
            <h2 id="fontes-title">Materiais de origem</h2>
          </div>
          <p>O conteúdo foi adaptado dos arquivos da disciplina. As questões acrescentam hipóteses explícitas quando necessário e apresentam justificativas próprias. Não há consulta a IA durante o uso.</p>
          <div className="source-document-list">
            {documents.map((doc) => <a href={sourceUrl(doc)} key={doc.id} target="_blank" rel="noreferrer">
              <Icon name="book" size={21} />
              <div><strong>{doc.fileName}</strong><span>{doc.title} · {doc.pages} páginas</span></div>
              <Icon name="external" size={17} />
            </a>)}
          </div>
          <p className="small muted">Os PDFs estão disponíveis no próprio site, sem login. Cada material abre em outra aba e só é carregado quando você acessa o link. As páginas citadas no guia e nas questões correspondem à posição no arquivo.</p>
          <div className="editorial-note">
            <h3>Como tratamos as adaptações</h3>
            <p>As listas contêm propostas que o aluno deve julgar, incluindo decomposições incorretas. Uma alternativa do enunciado não é tratada como solução oficial. Novos exemplos seguem os conceitos do material e são identificados como adaptações.</p>
          </div>
        </section>
      </div>
    </div>
  </>;
}
