import { Link } from 'react-router-dom';
import { useLaboratory, labExamples } from '../hooks/useLaboratory';
import { RelationView } from '../components/RelationView';
import { SourceReferences } from '../components/SourceReferences';
import { ClosureExplorer } from '../components/ClosureExplorer';
import { Icon } from '../components/ui/Icon';
import { Button, PageHeading } from '../components/ui/Primitives';

const statusText = {
  incomplete: { title: 'Ainda não determina toda a relação', text: 'O fecho desse conjunto não alcança todos os atributos. Experimente incluir outro atributo.', color: 'blue' },
  superkey: { title: 'Você encontrou uma superchave', text: 'O conjunto determina toda a relação, mas algum atributo pode ser retirado. Experimente encontrar um conjunto mínimo.', color: 'peach' },
  candidate: { title: 'Você encontrou uma chave candidata', text: 'O conjunto determina todos os atributos e é mínimo: retirar qualquer atributo faz essa propriedade desaparecer.', color: 'mint' },
};
export default function LabPage() {
  const lab = useLaboratory();
  const status = statusText[lab.status];
  return <>
    <PageHeading eyebrow="APRENDA EXPERIMENTANDO" title="Veja o fecho acontecer." description="Escolha os atributos iniciais. Depois acompanhe o que cada dependência permite descobrir." />
    <div className="lab-layout">
      <section className="panel lab-controls">
        <div className="section-inline">
          <h2>Seu experimento</h2>
          <span className="icon-tile tint-lilac">
            <Icon name="flask" size={22} />
          </span>
        </div>
        <label className="select-field lab-select">
          <span>Escolha uma relação</span>
          <select value={lab.exampleId} onChange={(event) => lab.chooseExample(event.target.value)}>
            {labExamples.map((example) => <option key={example.id} value={example.id}>
              {example.label}
            </option>)}
          </select>
        </label>
        <RelationView relation={lab.relation} />
        <fieldset className="lab-attributes">
          <legend>Atributos do conjunto inicial</legend>
          <p className="small muted">Clique para incluir ou retirar.</p>
          <div className="attribute-selector">
            {lab.relation.attributes.map((attribute) => <button key={attribute} className={`attribute-toggle ${lab.selected.includes(attribute) ? 'active' : ''}`} aria-pressed={lab.selected.includes(attribute)} onClick={() => lab.toggleAttribute(attribute)}>
              {attribute}
            </button>)}
          </div>
        </fieldset>
        <Button variant="ghost" icon="rotate" disabled={!lab.selected.length} onClick={lab.clear}>Limpar seleção</Button>
        <SourceReferences sources={lab.example.sources} />
      </section>
      <div className="lab-output">
        <section className="panel lab-calculation">
          <div className="section-inline">
            <span className="eyebrow">O RACIOCÍNIO EM MOVIMENTO</span>
            <Icon name="branch" size={22} />
          </div>
          <ClosureExplorer key={`${lab.exampleId}-${lab.selected.join('|')}`} relation={lab.relation} initial={lab.selected} />
        </section>
        <div className={`key-status tint-${status.color}`} aria-live="polite">
          <Icon name="key" size={25} />
          <div>
            <h3>
              {lab.selected.length ? status.title : 'Qual será o seu ponto de partida?'}
            </h3>
            <p>
              {lab.selected.length ? status.text : 'Selecione um ou mais atributos à esquerda para investigar seu fecho.'}
            </p>
          </div>
        </div>
        <div className="lab-help">
          <h3>O que é o fecho, mesmo?</h3>
          <p>X⁺ é o conjunto que contém X e todos os atributos que podemos deduzir a partir dele usando as dependências funcionais.</p>
          <Link className="text-link" to="/guia#chaves">Relembrar chaves e fechos</Link>
        </div>
      </div>
    </div>
  </>;
}
