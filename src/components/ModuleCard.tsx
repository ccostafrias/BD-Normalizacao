import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { StudyModule } from '../types';
import { Icon } from './ui/Icon';
import { Badge, ProgressBar } from './ui/Primitives';

export const ModuleCard = memo(function ModuleCard({ module, count, answered, correct, index, to }: {
  module: StudyModule;
  count: number;
  answered: number;
  correct: number;
  index: number;
  to?: string;
}) {
  return <Link to={to ?? `/praticar/${module.id}`} className="module-card panel">
    <div className="section-inline">
      <span className={`icon-tile tint-${module.color}`}>
        <Icon name={module.icon} size={24} />
      </span>
      <span className="module-number">Módulo {String(index + 1).padStart(2, '0')}</span>
    </div>
    <h3>
      {module.title}
    </h3>
    <p>
      {module.description}
    </p>
    <div className="module-meta">
      <span>{count} questões</span>
      <span aria-hidden="true">·</span>
      <span>~{module.minutes} min</span>
    </div>
    <div className="module-progress">
      <div className="section-inline">
        <span>
          {answered ? `${answered} de ${count} respondidas` : 'Pronto para começar'}
        </span>
        {answered > 0 && <Badge color={correct === count ? 'mint' : 'blue'}>
          {correct}
          {correct === 1 ? 'acerto' : 'acertos'}
        </Badge>}
      </div>
      <ProgressBar value={answered / count * 100} label={`Progresso de ${module.shortTitle}`} />
    </div>
  </Link>;
});
