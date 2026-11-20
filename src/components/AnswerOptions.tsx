import { memo, useMemo } from 'react';
import type { Question } from '../types';
import { Icon } from './ui/Icon';

export const AnswerOptions = memo(function AnswerOptions({ question, selected, submitted, onChoose }: {
  question: Question;
  selected: string[];
  submitted: boolean;
  onChoose: (id: string) => void;
}) {
  const options = useMemo(() => question.type === 'attributes' ? question.relation!.attributes.map((a) => ({ id: a, label: a })) : question.options!, [question]);
  return <fieldset className={`answer-options ${question.type === 'attributes' ? 'attribute-options' : ''}`}>
    <legend className="sr-only">
      {question.type === 'choice' ? 'Escolha uma resposta' : 'Selecione todas as respostas corretas'}
    </legend>
    {options.map((option, index) => {
      const chosen = selected.includes(option.id);
      const correct = question.answer.includes(option.id);
      const state = submitted ? correct ? 'correct' : chosen ? 'incorrect' : 'neutral' : chosen ? 'selected' : '';
      return <label className={`answer-option answer-${state}`} key={option.id}>
        <input type={question.type === 'choice' ? 'radio' : 'checkbox'} name={question.id} value={option.id} checked={chosen} onChange={() => onChoose(option.id)} disabled={submitted} />
        <span className="option-marker" aria-hidden="true">
          {submitted && correct ? <Icon name="check" size={16} /> : submitted && chosen ? <Icon name="close" size={16} /> : question.type === 'attributes' ? <Icon name="check" size={16} /> : String.fromCharCode(65 + index)}
        </span>
        <span>
          {option.label}
          {submitted && correct && <span className="sr-only"> — resposta correta</span>}
          {submitted && chosen && !correct && <span className="sr-only"> — sua resposta, incorreta</span>}
        </span>
        {chosen && !submitted && question.type !== 'attributes' && <Icon name="check" size={18} className="option-selected-icon" />}
      </label>;
    })}
  </fieldset>;
});
