import { memo } from 'react';
import type { Dependency, Relation, RelationTable } from '../types';
import { Icon } from './ui/Icon';

export const DependencyView = memo(function DependencyView({ dependency, active = false }: {
  dependency: Dependency;
  active?: boolean;
}) {
  return <span className={`dependency ${active ? 'dependency-active' : ''}`}>
    <span>
      {dependency.from.join(', ')}
    </span>
    <span className="dependency-arrow" aria-label="determina">→</span>
    <span>
      {dependency.to.join(', ')}
    </span>
  </span>;
});
export const RelationView = memo(function RelationView({ relation }: {
  relation: Relation;
}) {
  return <section className="relation-view" aria-label={`Relação ${relation.name}`}>
    <div className="relation-heading">
      <Icon name="grid" size={18} />
      <strong>
        {relation.name}
      </strong>
    </div>
    <div className="attribute-list">
      {relation.attributes.map((attribute) => <span className="attribute" key={attribute}>
        {attribute}
      </span>)}
    </div>
    <p className="field-label">Dependências funcionais</p>
    <div className="dependency-list">
      {relation.dependencies.map((dependency, index) => <DependencyView key={index} dependency={dependency} />)}
    </div>
    <p className="relation-note">Considere os atributos atômicos e as DFs informadas, incluindo suas consequências.</p>
  </section>;
});
export const SchemaTable = memo(function SchemaTable({ table }: {
  table: RelationTable;
}) {
  return <div className="schema-table">
    <div className="schema-table-heading">
      <Icon name="grid" size={17} />
      <strong>
        {table.name}
      </strong>
    </div>
    <ul>
      {table.attributes.map((attribute) => <li key={attribute}>
        <span>
          {attribute}
        </span>
        {table.key.includes(attribute) && <span className="key-label"><Icon name="key" size={14} />Chave</span>}
      </li>)}
    </ul>
  </div>;
});
