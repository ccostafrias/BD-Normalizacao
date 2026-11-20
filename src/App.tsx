import { Component, lazy, Suspense } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProgressProvider } from './hooks/useProgress';
import { ButtonLink, EmptyState } from './components/ui/Primitives';
import HomePage from './pages/HomePage';

const PracticePage = lazy(() => import('./pages/PracticePage'));
const ResultsPage = lazy(() => import('./pages/PracticePage').then((m) => ({ default: m.ResultsPage })));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const LabPage = lazy(() => import('./pages/LabPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
class ErrorBoundary extends Component<{
  children: ReactNode;
}, {
  failed: boolean;
}> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Forma:', error, info.componentStack); }
  render() {
    return this.state.failed ? <div className="fatal-error">
      <h1>Não conseguimos abrir esta página.</h1>
      <p>Recarregue para tentar novamente. O progresso já salvo continuará no navegador.</p>
      <button className="button button-primary" onClick={() => window.location.reload()}>Recarregar página</button>
    </div> : this.props.children;
  }
}
export function App() {
  return <ErrorBoundary>
    <ProgressProvider>
      <Suspense fallback={<div className="loading-screen" role="status">Preparando seu espaço de estudo…</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="praticar" element={<CatalogPage />} />
            <Route path="praticar/:moduleId" element={<PracticePage />} />
            <Route path="resultado/:moduleId" element={<ResultsPage />} />
            <Route path="laboratorio" element={<LabPage />} />
            <Route path="guia" element={<GuidePage />} />
            <Route path="progresso" element={<ProgressPage />} />
            <Route path="*" element={<EmptyState title="Esta página não existe" description="Seu próximo conceito está a poucos passos daqui." action={<ButtonLink to="/">Voltar ao início</ButtonLink>} />} />
          </Route>
        </Routes>
      </Suspense>
    </ProgressProvider>
  </ErrorBoundary>;
}
