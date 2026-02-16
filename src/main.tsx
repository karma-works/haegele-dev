import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EffectsProvider } from './contexts/EffectsContext.tsx';
import { ReduceMotionProvider } from './contexts/ReduceMotionContext.tsx';
import App from './App.tsx';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <ReduceMotionProvider>
      <EffectsProvider>
        <App />
      </EffectsProvider>
    </ReduceMotionProvider>
  </StrictMode>
);
