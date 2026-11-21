import { documents, sourceUrl } from '../data/catalog';
import type { Source } from '../types';
import { Icon } from './ui/Icon';

export function SourceReferences({ sources }: {
  sources: Source[];
}) {
  return <details className="source-references">
    <summary><Icon name="book" size={16} />Base desta questão</summary>
    <div>
      {sources.map((source, index) => {
        const doc = documents.find((d) => d.id === source.document)!;
        return <p key={index}><strong>
          {doc.fileName}
        </strong><br />{source.pages.length === 1 ? 'Página' : 'Páginas'} {source.pages.join(', ')} · {source.kind === 'adapted' ? 'Questão adaptada' : 'Questão original'}<br /><a href={sourceUrl(doc, source.pages[0])} target="_blank" rel="noreferrer">Abrir material de origem <Icon name="external" size={13} /></a></p>;
      })}
      <p className="small muted">Os PDFs estão disponíveis no próprio site, sem login. As páginas indicadas correspondem à posição no arquivo.</p>
    </div>
  </details>;
}
