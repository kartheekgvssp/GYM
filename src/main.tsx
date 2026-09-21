import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './lib/theme.tsx';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA offline capabilities
if (typeof window !== 'undefined') {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
