import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { EmBreve } from '@/components/EmBreve';
import { HabitosScreen } from '@/features/habitos/HabitosScreen';
import { HojeScreen } from '@/features/hoje/HojeScreen';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HojeScreen />} />
        <Route path="habitos" element={<HabitosScreen />} />
        <Route path="estatisticas" element={<EmBreve titulo="Estatísticas" marco="M4" />} />
        <Route path="reflexoes" element={<EmBreve titulo="Reflexões" marco="M5" />} />
        <Route path="*" element={<EmBreve titulo="Página não encontrada" marco="404" />} />
      </Route>
    </Routes>
  );
}
