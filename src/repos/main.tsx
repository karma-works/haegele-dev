import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReposPage } from './ReposPage';
import '../styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <ReposPage />
  </StrictMode>
);
