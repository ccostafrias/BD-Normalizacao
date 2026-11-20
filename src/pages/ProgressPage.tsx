import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useProgressActions } from '../hooks/useProgressActions';
import { useLearningPath } from '../hooks/useLearningPath';
import { questions, questionById } from '../data/catalog';
import { Icon } from '../components/ui/Icon';
import { Badge, Button, ButtonLink, EmptyState, PageHeading, ProgressBar } from '../components/ui/Primitives';

export default function ProgressPage() {
  const { stats, resetProgress } = useProgress();
  const { overview, continuePath } = useLearningPath();
  const { exportProgress } = useProgressActions();
  const resetDialog = useRef<HTMLDialogElement>(null);
  return <>
    <PageHeading eyebrow="SEU APRENDIZADO, NO SEU RITMO" title="Veja o caminho que já fez." description="O progresso considera sua última resposta em cada questão, incluindo novas tentativas." action={<Button variant="soft" icon="download" onClick={exportProgress}>Exportar progresso</Button>} />
    {stats.answered === 0 ? <EmptyState title="Todo caminho tem um começo" description="Responda sua primeira questão. Seus resultados e os conceitos para revisar vão aparecer aqui." action={<ButtonLink to={continuePath}>Começar pelos fundamentos</ButtonLink>} /> : <>
      <div className="progress-stat-grid">
        <section className="panel progress-stat">
          <span className="icon-tile tint-blue">
            <Icon name="layers" size={22} />
          </span>
          <strong>
            {stats.answered}
            <span>/ {questions.length}</span>
          </strong>
          <p>Questões respondidas</p>
        </section>
        <section className="panel progress-stat">
          <span className="icon-tile tint-mint">
            <Icon name="check" size={22} />
          </span>
          <strong>
            {stats.correct}
          </strong>
          <p>Respostas corretas atuais</p>
        </section>
        <section className="panel progress-stat">
          <span className="icon-tile tint-peach">
            <Icon name="rotate" size={22} />
          </span>
          <strong>
            {stats.toReview.length}
          </strong>
          <p>Pontos para revisar</p>
        </section>
      </div>
      <section className="panel progress-module-list">
        <div className="section-inline">
          <h2>Como estão seus módulos?</h2>
          <ButtonLink to={continuePath} variant="soft">Continuar praticando</ButtonLink>
        </div>
        {overview.map(({ module, count, answered, correct }) => <Link to={`/resultado/${module.id}`} className="progress-module" key={module.id}>
          <span className={`icon-tile tint-${module.color}`}>
            <Icon name={module.icon} size={21} />
          </span>
          <div>
            <strong>
              {module.shortTitle}
            </strong>
            <ProgressBar value={answered / count * 100} label={`Progresso de ${module.shortTitle}`} />
          </div>
          <span className="small muted">{answered}/{count} respondidas</span>
          <Badge color={correct === count ? 'mint' : 'blue'}>
            {correct}
            {correct === 1 ? 'acerto' : 'acertos'}
          </Badge>
        </Link>)}
      </section>
      <section className="panel review-list">
        <div className="section-inline">
          <h2>
            {stats.toReview.length ? 'Vale mais uma tentativa' : 'Tudo revisado por aqui'}
          </h2>
          {stats.toReview.length > 0 && <ButtonLink to="/praticar?modo=revisao" variant="ghost">Ver revisão</ButtonLink>}
        </div>
        {stats.toReview.length ? stats.toReview.map((id) => {
          const q = questionById.get(id)!;
          return <Link key={id} to={`/praticar/${q.moduleId}?questao=${q.id}`}>
            <Icon name="rotate" size={18} />
            <span>
              {q.title}
            </span>
            <span className="text-link small">Retomar</span>
          </Link>;
        }) : <p className="muted">Todas as questões que você respondeu estão corretas na última tentativa. Explore os próximos conceitos.</p>}
      </section>
    </>}
    <div className="progress-privacy">
      <Icon name="info" size={20} />
      <p>Seu progresso fica neste navegador. Ele não é sincronizado entre dispositivos. A exportação gera uma cópia em JSON para consulta; a importação ainda não está disponível.</p>
    </div>
    <div className="reset-row">
      <Button variant="ghost" icon="rotate" onClick={() => resetDialog.current?.showModal()}>Recomeçar meu progresso</Button>
    </div>
    <dialog ref={resetDialog} className="reset-dialog">
      <h2>Começar do zero?</h2>
      <p>As respostas e questões salvas neste navegador serão apagadas. Você pode exportar uma cópia antes.</p>
      <div className="button-row">
        <Button variant="soft" onClick={() => resetDialog.current?.close()}>Continuar estudando</Button>
        <Button onClick={() => { resetProgress(); resetDialog.current?.close(); }}>Apagar progresso</Button>
      </div>
    </dialog>
  </>;
}
