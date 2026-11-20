import { useCallback, useMemo, useState } from 'react';
import { questions } from '../data/catalog';
import { keyStatus } from '../lib/relational.mjs';

export const labExamples = [
  { id: 'c-casas', label: 'CASAS · uma chave inesperada' },
  { id: 'c-fecho', label: 'R(A,B,C,D,E,F) · cadeia de DFs' },
  { id: 'c-chave-cd', label: 'R(A,B,C,D,E) · chave composta' },
  { id: 'c-primarios', label: 'R(A,B,C,D) · chaves sobrepostas' },
  { id: 'a-ensina', label: 'ENSINA · 3FN e BCNF' },
];
export function useLaboratory() {
  const [exampleId, setExampleId] = useState(labExamples[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const example = questions.find((q) => q.id === exampleId)!;
  const relation = example.relation!;
  const chooseExample = useCallback((id: string) => { setExampleId(id); setSelected([]); }, []);
  const toggleAttribute = useCallback((attribute: string) => {
    setSelected((previous) => previous.includes(attribute) ? previous.filter((a) => a !== attribute) : [...previous, attribute]);
  }, []);
  const clear = useCallback(() => setSelected([]), []);
  const status = useMemo(() => keyStatus(selected, relation.attributes, relation.dependencies), [selected, relation]);
  return { exampleId, example, relation, selected, status, chooseExample, toggleAttribute, clear };
}
