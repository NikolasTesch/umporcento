import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { HabitosProvider } from '@/state/HabitosContext';
import { DiaProvider } from '@/state/DiaContext';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root não encontrado em index.html');
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <HabitosProvider>
        <DiaProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DiaProvider>
      </HabitosProvider>
    </ThemeProvider>
  </StrictMode>,
);
