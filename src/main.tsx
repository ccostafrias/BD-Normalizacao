import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion';
import { App } from './App';
import './styles.css';
createRoot(document.getElementById('root')!).render(<StrictMode>

  <BrowserRouter>

    <MotionConfig reducedMotion="user" transition={{ duration: 0.2 }}>

      <LazyMotion features={domAnimation} strict>
        <App />
      </LazyMotion>

    </MotionConfig>

  </BrowserRouter>
</StrictMode>);
