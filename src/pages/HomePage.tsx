import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLearningPath } from '../hooks/useLearningPath';
import { questions } from '../data/catalog';
import { ModuleCard } from '../components/ModuleCard';
import { Badge, ButtonLink } from '../components/ui/Primitives';
import { Icon } from '../components/ui/Icon';

function RelationIllustration() {
  return <div className="hero-illustration" aria-label="Ilustração de uma tabela sendo organizada em duas relações">
    <div className="demo-table demo-original">
      <div className="demo-table-name"><Icon name="grid" size={16} />CASAS</div>
      <div className="demo-row demo-row-head">
        <span>Quadra</span>
        <span>Construtor</span>
        <span>Estilo</span>
      </div>
      <div className="demo-row">
        <span>Q01</span>
        <span>Alfa</span>
        <span className="demo-repeated">Colonial</span>
      </div>
      <div className="demo-row">
        <span>Q02</span>
        <span>Alfa</span>
        <span className="demo-repeated">Colonial</span>
      </div>
    </div>
    <div className="demo-connection">
      <span />
      <Icon name="layers" size={20} />
      <span />
    </div>
    <div className="demo-results">
      <div className="demo-table demo-small">
        <div className="demo-table-name"><Icon name="key" size={14} />QUADRAS</div>
        <div className="demo-pills">
          <span>Quadra</span>
          <span>Construtor</span>
        </div>
      </div>
      <div className="demo-table demo-small demo-mint">
        <div className="demo-table-name"><Icon name="key" size={14} />CONSTRUTORES</div>
        <div className="demo-pills">
          <span>Construtor</span>
          <span>Estilo</span>
        </div>
      </div>
    </div>
    <p className="demo-caption">CASAS, em uma versão simplificada.</p>
  </div>;
}
export default function HomePage() {
  const { stats } = useProgress();
  const { overview, completed, recommended, continuePath } = useLearningPath();
  return <>
    <div className="home-welcome">
      <div>
        <p className="eyebrow">SEU ESPAÇO DE ESTUDO</p>
        <h1>Vamos descomplicar?</h1>
        <p className="page-description">Normalização faz sentido quando você vê como funciona.</p>
      </div>
      <Badge color="mint">Da 1FN à 5FN</Badge>
    </div>
    <m.section className="hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="hero-copy">
        <span className="hero-eyebrow"><span />MENOS REDUNDÂNCIA. MAIS CLAREZA.</span>
        <h2>Dê forma ao seu<br />conhecimento.</h2>
        <p>Explore dependências, encontre chaves e organize relações. Um pequeno desafio de cada vez.</p>
        <ButtonLink to={continuePath} variant="light" icon="play">
          {stats.answered ? 'Continuar aprendendo' : 'Começar a praticar'}
        </ButtonLink>
        <span className="hero-note">Sem cronômetro. Com espaço para entender.</span>
      </div>
      <RelationIllustration />
    </m.section>
    <div className="stats-grid">
      <div className="stat-card">
        <span className="icon-tile tint-blue">
          <Icon name="layers" size={22} />
        </span>
        <div>
          <strong>
            {stats.answered}
            <span> / {questions.length}</span>
          </strong>
          <p>Questões exploradas</p>
        </div>
      </div>
      <div className="stat-card">
        <span className="icon-tile tint-mint">
          <Icon name="target" size={22} />
        </span>
        <div>
          <strong>
            {stats.answered ? `${stats.accuracy}%` : '—'}
          </strong>
          <p>
            {stats.answered ? 'Acerto nas últimas respostas' : 'Seu aprendizado começa aqui'}
          </p>
        </div>
      </div>
      <div className="stat-card">
        <span className="icon-tile tint-lilac">
          <Icon name="check" size={22} />
        </span>
        <div>
          <strong>
            {completed}
            <span> / {overview.length}</span>
          </strong>
          <p>Módulos explorados por completo</p>
        </div>
      </div>
    </div>
    <section className="learning-section">
      <div className="section-title">
        <div>
          <h2>Seu caminho de aprendizado</h2>
          <p>Comece pela base ou escolha o conceito que quer praticar.</p>
        </div>
        <Link to="/praticar" className="text-link">Ver exercícios</Link>
      </div>
      {stats.answered > 0 && <div className="continue-strip">
        <Icon name="play" size={20} />
        <span>Próximo passo: <strong>
          {recommended.module.title}
        </strong></span>
        <Link to={continuePath}>Continuar</Link>
      </div>}
      <div className="module-grid">
        {overview.map((item, index) => <ModuleCard key={item.module.id} {...item} index={index} />)}
      </div>
    </section>
    <section className="lab-invitation">
      <span className="lab-invitation-icon">
        <Icon name="flask" size={31} />
      </span>
      <div>
        <h2>E se você pudesse ver o fecho acontecer?</h2>
        <p>Escolha atributos e acompanhe cada dependência no laboratório.</p>
      </div>
      <ButtonLink to="/laboratorio" variant="soft">Explorar laboratório</ButtonLink>
    </section>
    <div className="learning-note">
      <Icon name="book" size={19} />
      <p>Exercícios e explicações construídos a partir dos slides da disciplina. Cada questão mostra de onde veio.</p>
    </div>
  </>;
}
