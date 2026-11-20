import { useMemo, useState } from 'react';
import { m } from 'framer-motion';
import { attributeClosure } from '../lib/relational.mjs';
import type { Relation } from '../types';
import { DependencyView } from './RelationView';
import { Button } from './ui/Primitives';

export function ClosureExplorer({ relation, initial }: {
  relation: Relation;
  initial: string[];
}) {
  const calculation = useMemo(() => attributeClosure(initial, relation.dependencies), [initial, relation.dependencies]);
  const [index, setIndex] = useState(0);
  const current = calculation.steps[Math.min(index, calculation.steps.length - 1)];
  const finished = index >= calculation.steps.length - 1;
  return <section className="closure-explorer" aria-label="Cálculo do fecho passo a passo">
    <div className="section-inline">
      <div>
        <p className="field-label">Fecho de {initial.length ? `{${initial.join(', ')}}` : '∅'}</p>
        <h3>
          {index === 0 ? 'Comece com os atributos escolhidos' : 'Aplique uma dependência de cada vez'}
        </h3>
      </div>
      <span className="muted small">Etapa {index + 1} de {calculation.steps.length}</span>
    </div>
    <div className="closure-attributes" aria-live="polite" aria-atomic="true">
      {relation.attributes.map((attribute) => <m.span key={attribute} animate={{ opacity: current.attributes.includes(attribute) ? 1 : 0.5 }} className={`attribute ${current.attributes.includes(attribute) ? 'attribute-known' : 'attribute-unknown'}`}>
        {attribute}
      </m.span>)}
    </div>
    <div className="closure-description">
      {current.dependency ? <>
        <DependencyView dependency={current.dependency} active />
        <p>Acrescentamos <strong>
          {current.added.join(', ')}
        </strong>, pois já temos todos os atributos à esquerda da seta.</p>
      </> : <p>O fecho começa com o próprio conjunto. Procure DFs cujo lado esquerdo já esteja disponível.</p>}
    </div>
    {finished && <p className="closure-finished">Nenhuma DF acrescenta outro atributo. Fecho final: <strong>
      {`{${calculation.attributes.join(', ')}}`}
    </strong>.</p>}
    <div className="button-row">
      <Button variant="ghost" onClick={() => setIndex(0)} disabled={index === 0} icon="rotate">Recomeçar</Button>
      <Button variant="soft" onClick={() => setIndex((previous) => previous + 1)} disabled={finished}>Aplicar próxima DF</Button>
    </div>
  </section>;
}
