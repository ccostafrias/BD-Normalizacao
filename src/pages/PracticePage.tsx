import { useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { usePractice } from '../hooks/usePractice';
import { useQuiz } from '../hooks/useQuiz';
import { useProgress } from '../hooks/useProgress';
import { difficultyLabels, modules, questionsByModule } from '../data/catalog';
import type { Question } from '../types';
import { AnswerOptions } from '../components/AnswerOptions';
import { SolutionView } from '../components/SolutionView';
import { RelationView } from '../components/RelationView';
import { SourceReferences } from '../components/SourceReferences';
import { Icon } from '../components/ui/Icon';
import { Badge, Button, ButtonLink, EmptyState, PageHeading, ProgressBar } from '../components/ui/Primitives';

function QuestionRunner({ question, next, previous, index, count, resultPath }: {
  question: Question;
  next?: () => void;
  previous?: () => void;
  index: number;
  count: number;
  resultPath: string;
}) {
  const quiz = useQuiz(question);
  const { progress, toggleBookmark } = useProgress();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [question.id]);
  const saved = progress.bookmarks.includes(question.id);
  return <article className="question-card panel">
    <div className="section-inline question-meta">
      <div className="inline-row">
        <Badge color={question.difficulty === 'easy' ? 'mint' : question.difficulty === 'hard' ? 'lilac' : 'blue'}>
          {difficultyLabels[question.difficulty]}
        </Badge>
        <span className="muted small">Questão {index + 1} de {count}</span>
      </div>
      <button className={`save-button ${saved ? 'is-saved' : ''}`} aria-pressed={saved} onClick={() => toggleBookmark(question.id)}>
        <Icon name={saved ? 'check' : 'book'} size={17} />
        <span>
          {saved ? 'Salva' : 'Salvar'}
        </span>
      </button>
    </div>
    <h2 ref={heading} tabIndex={-1} className="question-title">
      {question.title}
    </h2>
    <p className="question-prompt">
      {question.prompt}
    </p>
    {question.relation && <RelationView relation={question.relation} />}
    {question.assumption && <p className="assumption">
      <Icon name="info" size={17} />
      {question.assumption}
    </p>}
    <p className="answer-instruction">
      {question.type === 'choice' ? 'Escolha uma alternativa.' : question.type === 'attributes' ? 'Selecione todos os atributos que fazem parte da resposta.' : 'Selecione todas as afirmações verdadeiras.'}
    </p>
    <AnswerOptions question={question} selected={quiz.selected} submitted={quiz.submitted} onChoose={quiz.choose} />
    {!quiz.submitted && <>
      <div className="question-actions">
        <Button variant="ghost" onClick={quiz.revealHint} icon="bulb" aria-expanded={quiz.hintVisible}>
          {quiz.hintVisible ? 'Ocultar dica' : 'Preciso de uma dica'}
        </Button>
        <Button onClick={quiz.submit} disabled={!quiz.selected.length}>Conferir resposta</Button>
      </div>
      {quiz.hintVisible && <div className="hint-box" role="status">
        <Icon name="bulb" size={20} />
        <p>
          {question.hint}
        </p>
      </div>}
    </>}
    {quiz.submitted && <>
      <SolutionView question={question} correct={quiz.correct} selected={quiz.selected} />
      <div className="question-actions solution-actions">
        <Button variant="ghost" onClick={quiz.retry} icon="rotate">Tentar novamente</Button>
        {next ? <Button onClick={next}>Próxima questão</Button> : <ButtonLink to={resultPath}>Ver resultado do módulo</ButtonLink>}
      </div>
    </>}
    <SourceReferences sources={question.sources} />
    <div className="question-bottom-nav">
      <Button variant="ghost" onClick={previous} disabled={!previous}>Anterior</Button>
      <span className="muted small">Sem pressa. Entenda o caminho.</span>
      {next ? <Button variant="ghost" onClick={next}>
        {quiz.submitted ? 'Próxima' : 'Pular por enquanto'}
      </Button> : <ButtonLink variant="ghost" to={resultPath}>Encerrar prática</ButtonLink>}
    </div>
  </article>;
}
function PracticeSession({ moduleId }: {
  moduleId: string;
}) {
  const { module, list, question, index, goTo } = usePractice(moduleId);
  const { progress } = useProgress();
  if (!module)
    return <EmptyState title="Módulo não encontrado" description="Escolha um dos módulos disponíveis para continuar." action={<ButtonLink to="/praticar">Ver módulos</ButtonLink>} />;
  if (!question)
    return <EmptyState title="Tudo em dia por aqui" description="Não há questões neste módulo com os filtros escolhidos." action={<ButtonLink to="/praticar">Escolher exercícios</ButtonLink>} />;
  const answered = list.filter((q) => progress.attempts[q.id]).length;
  return <>
    <div className="practice-breadcrumb">
      <Link to="/praticar">Praticar</Link>
      <Icon name="chevron" size={16} />
      <span>
        {module.shortTitle}
      </span>
    </div>
    <div className="practice-heading">
      <h1>
        {module.title}
      </h1>
      <p>
        {module.description}
      </p>
    </div>
    <div className="practice-layout">
      <QuestionRunner key={question.id} question={question} index={index} count={list.length} next={list[index + 1] ? () => goTo(list[index + 1].id) : undefined} previous={list[index - 1] ? () => goTo(list[index - 1].id) : undefined} resultPath={`/resultado/${module.id}`} />
      <aside className="practice-sidebar">
        <section className="panel session-overview">
          <p className="field-label">SEU PERCURSO NO MÓDULO</p>
          <div className="section-inline">
            <strong>{answered} de {list.length}</strong>
            <span className="muted small">respondidas</span>
          </div>
          <ProgressBar value={answered / list.length * 100} label="Questões respondidas nesta prática" />
          <div className="question-navigation" aria-label="Navegar pelas questões">
            {list.map((q, i) => <button key={q.id} aria-label={`Questão ${i + 1}: ${q.title}${progress.attempts[q.id] ? progress.attempts[q.id].correct ? ', acertou' : ', revisar' : ''}`} aria-current={q.id === question.id ? 'step' : undefined} className={`${q.id === question.id ? 'current' : ''} ${progress.attempts[q.id] ? progress.attempts[q.id].correct ? 'done' : 'needs-review' : ''}`} onClick={() => goTo(q.id)}>
              {progress.attempts[q.id]?.correct ? <Icon name="check" size={18} /> : i + 1}
            </button>)}
          </div>
          <div className="navigation-legend">
            <span><i className="legend-done" />Acerto</span>
            <span><i className="legend-review" />Revisar</span>
          </div>
        </section>
        <section className="study-tip">
          <Icon name="bulb" size={23} />
          <h3>O erro também ensina.</h3>
          <p>Leia a explicação, teste a dica e tente novamente. O objetivo é entender a decisão.</p>
          <Link to="/guia">Consultar os conceitos</Link>
        </section>
      </aside>
    </div>
  </>;
}
export default function PracticePage() {
  const { moduleId = '' } = useParams();
  const [params] = useSearchParams();
  return <PracticeSession key={`${moduleId}-${params.get('nivel')}-${params.get('modo')}-${params.get('busca')}`} moduleId={moduleId} />;
}
export function ResultsPage() {
  const { moduleId } = useParams();
  const { progress } = useProgress();
  const module = modules.find((m) => m.id === moduleId);
  if (!module)
    return <EmptyState title="Módulo não encontrado" description="Volte à lista para escolher um módulo." action={<ButtonLink to="/praticar">Ver módulos</ButtonLink>} />;
  const list = questionsByModule.get(module.id)!;
  const answered = list.filter((q) => progress.attempts[q.id]);
  const correct = answered.filter((q) => progress.attempts[q.id].correct).length;
  const nextModule = modules[modules.indexOf(module) + 1];
  return <>
    <PageHeading eyebrow="CADA PASSO CONTA" title={answered.length === list.length ? 'Mais um conceito explorado.' : 'Seu caminho até aqui.'} description={`Confira suas últimas respostas em ${module.shortTitle}. Você pode retomar quando quiser.`} />
    <section className="results-card panel">
      <span className="results-icon tint-mint">
        <Icon name="target" size={37} />
      </span>
      <h2>{correct} {correct === 1 ? 'acerto' : 'acertos'} em {answered.length} {answered.length === 1 ? 'resposta' : 'respostas'}</h2>
      <p>
        {list.length - answered.length > 0 ? `${list.length - answered.length} questões ainda estão esperando por você.` : correct === list.length ? 'Você acertou todas as questões deste módulo.' : 'Retome os pontos que precisam de mais uma tentativa.'}
      </p>
      <div className="result-question-list">
        {list.map((q, index) => <Link to={`/praticar/${module.id}?questao=${q.id}`} key={q.id}>
          <span className={`result-status ${progress.attempts[q.id] ? progress.attempts[q.id].correct ? 'tint-mint' : 'tint-peach' : 'tint-blue'}`}>
            <Icon name={progress.attempts[q.id]?.correct ? 'check' : progress.attempts[q.id] ? 'rotate' : 'circle'} size={18} />
          </span>
          <span>{index + 1}. {q.title}</span>
          <span className="small muted">
            {progress.attempts[q.id] ? progress.attempts[q.id].correct ? 'Acertou' : 'Revisar' : 'Não respondida'}
          </span>
        </Link>)}
      </div>
      <div className="button-row">
        {answered.length > correct && <ButtonLink variant="soft" to={`/praticar/${module.id}?modo=revisao`}>Revisar erros</ButtonLink>}
        {answered.length < list.length ? <ButtonLink to={`/praticar/${module.id}?questao=${list.find((q) => !progress.attempts[q.id])!.id}`}>Retomar módulo</ButtonLink> : nextModule ? <ButtonLink to={`/praticar/${nextModule.id}`}>Explorar próximo módulo</ButtonLink> : <ButtonLink to="/progresso">Ver meu progresso</ButtonLink>}
      </div>
    </section>
  </>;
}
