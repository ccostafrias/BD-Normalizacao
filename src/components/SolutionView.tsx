import { m } from 'framer-motion';
import type { Question } from '../types';
import { Icon } from './ui/Icon';
import { SchemaTable } from './RelationView';
import { ClosureExplorer } from './ClosureExplorer';

export function SolutionView({ question, correct, selected }: {
  question: Question;
  correct: boolean;
  selected: string[];
}) {
  const chosenFeedback = question.options?.filter((o) => selected.includes(o.id) && !question.answer.includes(o.id));
  const answerLabels = question.type === 'attributes' ? question.answer : question.options!.filter((o) => question.answer.includes(o.id)).map((o) => o.label);
  return <m.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="solution" aria-label="Resolução">
    <div className={`answer-feedback ${correct ? 'feedback-correct' : 'feedback-incorrect'}`} role="status">
      <span className="feedback-icon">
        <Icon name={correct ? 'check' : 'bulb'} size={23} />
      </span>
      <div>
        <h3>
          {correct ? 'Você acertou. Vamos entender por quê.' : 'Vamos entender juntos.'}
        </h3>
        <p>
          {question.explanation}
        </p>
      </div>
    </div>
    {!correct && <div className="correct-answer">
      <p className="field-label">Resposta correta</p>
      <ul>
        {answerLabels.map((label) => <li key={label}>
          {label}
        </li>)}
      </ul>
      {chosenFeedback?.map((option) => <p className="option-feedback" key={option.id}>
        {option.feedback}
      </p>)}
    </div>}
    <div className="section-inline solution-heading">
      <h3>O raciocínio, passo a passo</h3>
      <span className="small muted">{question.steps.length} etapas</span>
    </div>
    <ol className="solution-steps">
      {question.steps.map((step, index) => <li key={index}>
        <span className="step-number">
          {index + 1}
        </span>
        <div>
          <h4>
            {step.title}
          </h4>
          <p>
            {step.text}
          </p>
          {step.tables && <div className="schema-tables">
            {step.tables.map((table) => <SchemaTable table={table} key={table.name} />)}
          </div>}
        </div>
      </li>)}
    </ol>
    {question.closureStart && question.relation && <ClosureExplorer key={`${question.id}-closure`} relation={question.relation} initial={question.closureStart} />}
  </m.section>;
}
