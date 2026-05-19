import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { PreferenciasProvider } from '@/state/PreferenciasContext';
import { HabitosProvider } from '@/state/HabitosContext';
import { DiaProvider } from '@/state/DiaContext';
import './index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Elemento #root não encontrado em index.html');
}

createRoot(container).render(
  <StrictMode>
    <PreferenciasProvider>
      <HabitosProvider>
        <DiaProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DiaProvider>
      </HabitosProvider>
    </PreferenciasProvider>
  </StrictMode>,
);
