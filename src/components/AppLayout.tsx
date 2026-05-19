/**
 * Casca de navegação — barra lateral no desktop, barra inferior no mobile
 * (SPEC §6). Inclui o alternador de tema.
 */
import { BarChart3, BookText, CalendarCheck, ListChecks, Moon, Sun } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTema } from '@/theme/ThemeProvider';

const ITENS = [
  { para: '/', rotulo: 'Hoje', Icone: CalendarCheck },
  { para: '/habitos', rotulo: 'Hábitos', Icone: ListChecks },
  { para: '/estatisticas', rotulo: 'Estatísticas', Icone: BarChart3 },
  { para: '/reflexoes', rotulo: 'Reflexões', Icone: BookText },
] as const;

export function AppLayout() {
  const { tema, alternarTema } = useTema();

  return (
    <div className="flex min-h-full flex-col sm:flex-row">
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 sm:static sm:w-56 sm:flex-col sm:border-r sm:border-t-0 sm:py-6"
      >
        <div className="hidden px-6 pb-8 sm:block">
          <p className="text-2xl font-bold tracking-tight">1%</p>
          <p className="text-xs text-gray-500">um pouco melhor a cada dia</p>
        </div>
        {ITENS.map(({ para, rotulo, Icone }) => (
          <NavLink
            key={para}
            to={para}
            end={para === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium sm:flex-none sm:flex-row sm:gap-3 sm:px-6 sm:py-2.5 sm:text-sm ${
                isActive
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`
            }
          >
            <Icone className="h-5 w-5" aria-hidden="true" />
            {rotulo}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={alternarTema}
          aria-label={tema === 'claro' ? 'Ativar tema escuro' : 'Ativar tema claro'}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 sm:mt-auto sm:flex-none sm:flex-row sm:gap-3 sm:px-6 sm:py-2.5 sm:text-sm"
        >
          {tema === 'claro' ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Sun className="h-5 w-5" aria-hidden="true" />
          )}
          Tema
        </button>
      </nav>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 pb-24 sm:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
