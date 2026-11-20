import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { Icon } from './ui/Icon';
import { ProgressBar } from './ui/Primitives';

const navigation = [
  { path: '/', title: 'Visão geral', icon: 'home' as const },
  { path: '/praticar', title: 'Praticar', icon: 'layers' as const },
  { path: '/laboratorio', title: 'Laboratório', icon: 'flask' as const },
  { path: '/guia', title: 'Guia de consulta', icon: 'book' as const },
  { path: '/progresso', title: 'Meu progresso', icon: 'chart' as const },
];
export function Layout() {
  const { pathname } = useLocation();
  const { stats, storageAvailable } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); document.title = `${navigation.find((n) => n.path !== '/' && pathname.startsWith(n.path))?.title ?? 'Normalização na prática'} — Forma`; }, [pathname]);
  return <div className="app-shell">
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <header className="mobile-header">
      <Link to="/" className="brand">forma<span>.</span></Link>
      <button className="icon-button" aria-label={menuOpen ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
        <Icon name={menuOpen ? 'close' : 'menu'} />
      </button>
    </header>
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand desktop-brand">forma<span>.</span><span className="brand-subtitle">Bancos de dados, sem nós.</span></Link>
      <div className="sidebar-section-label">APRENDER, NA PRÁTICA</div>
      <nav id="main-navigation" aria-label="Navegação principal">
        {navigation.map((item) => <NavLink to={item.path} key={item.path} end={item.path === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
          <Icon name={item.icon} size={20} />
          {item.title}
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-progress">
          <span className="icon-tile tint-blue">
            <Icon name="target" size={23} />
          </span>
          <strong>Um conceito de cada vez.</strong>
          <p>
            {stats.answered ? `${stats.answered} questões respondidas. Continue de onde parou.` : 'Seu primeiro passo já conta. Comece pelos fundamentos.'}
          </p>
          <ProgressBar value={stats.completion} label="Progresso geral" />
          <span className="small muted">{stats.completion}% do percurso explorado</span>
        </div>
        <p className="sidebar-footnote">Feito para entender.<br />Não só para decorar.</p>
      </div>
    </aside>
    {menuOpen && <button className="menu-overlay" aria-label="Fechar navegação" onClick={() => setMenuOpen(false)} />}
    <main id="conteudo" tabIndex={-1} className="main-content">
      <div className="topbar">
        <span>Normalização de bancos de dados</span>
        <span className="topbar-chip"><span className="save-indicator" />Seu ritmo. Seu aprendizado.</span>
      </div>
      {!storageAvailable && <div role="status" className="storage-notice">Seu navegador não permitiu salvar o progresso. Você pode continuar estudando nesta sessão.</div>}
      <Outlet />
      <footer className="site-footer">
        <span>forma. <span className="muted">Um jeito mais claro de aprender.</span></span>
        <Link to="/guia#fontes">Conteúdo baseado nos materiais da disciplina</Link>
      </footer>
    </main>
  </div>;
}
