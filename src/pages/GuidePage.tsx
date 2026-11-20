import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import guide from '../data/guide.json';
import { documents, sourceUrl } from '../data/catalog';
import type { IconName } from '../types';
import { Icon } from '../components/ui/Icon';
import { ButtonLink, PageHeading } from '../components/ui/Primitives';

export default function GuidePage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash)
      document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);
  return <>
    <PageHeading eyebrow="PARA CONSULTAR QUANDO PRECISAR" title="Os conceitos, lado a lado." description="Uma referência curta para voltar ao raciocínio. As páginas indicadas correspondem à posição no PDF." />
    <div className="guide-layout">
      <nav className="guide-nav" aria-label="Conceitos do guia">
        {guide.map((section) => <a key={section.id} href={`#${section.id}`}>
          <Icon name={section.icon as IconName} size={18} />
          {section.title}
        </a>)}
        <a href="#fontes"><Icon name="book" size={18} />Materiais de origem</a>
      </nav>
      <div className="guide-content">
        {guide.map((section) => <section className="panel guide-section" id={section.id} key={section.id}>
          <div className="inline-row">
            <span className={`icon-tile tint-${section.color}`}>
              <Icon name={section.icon as IconName} size={23} />
            </span>
            <h2>
              {section.title}
            </h2>
          </div>
          <p className="guide-intro">
            {section.intro}
          </p>
          <dl>
            {section.items.map((item) => <div key={item.term}>
              <dt>
                {item.term}
              </dt>
              <dd>
                {item.text}
              </dd>
            </div>)}
          </dl>
          <p className="guide-source">Base: 9.1-Normalizacao.pdf · páginas {section.pages.join(', ')}.</p>
          {section.id === 'chaves' && <ButtonLink variant="soft" icon="flask" to="/laboratorio">Experimentar no laboratório</ButtonLink>}
        </section>)}
        <section className="panel guide-section" id="fontes">
          <div className="inline-row">
            <span className="icon-tile tint-blue">
              <Icon name="book" size={23} />
            </span>
            <h2>Materiais de origem</h2>
          </div>
          <p>O conteúdo foi adaptado dos arquivos da disciplina. As questões acrescentam hipóteses explícitas quando necessário e apresentam justificativas próprias. Não há consulta a IA durante o uso.</p>
          <div className="source-document-list">
            {documents.map((doc) => <a href={sourceUrl(doc)} key={doc.id} target="_blank" rel="noreferrer">
              <Icon name="book" size={21} />
              <div>
                <strong>
                  {doc.fileName}
                </strong>
                <span>{doc.title} · {doc.pages} páginas</span>
              </div>
              <Icon name="external" size={17} />
            </a>)}
          </div>
          <p className="small muted">Esses links exigem permissão para acessar os arquivos originais. Para estudar com uma cópia própria, localize os mesmos nomes e as páginas indicadas. O quiz funciona sem abrir os PDFs.</p>
          <div className="editorial-note">
            <h3>Como tratamos as adaptações</h3>
            <p>As listas contêm propostas que o aluno deve julgar, incluindo decomposições incorretas. Uma alternativa do enunciado não é tratada como solução oficial. Novos exemplos seguem os conceitos do material e são identificados como adaptações.</p>
          </div>
        </section>
      </div>
    </div>
  </>;
}
