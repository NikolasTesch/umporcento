import { Moon, Sun } from 'lucide-react';
import { useTema } from '@/theme/ThemeProvider';
import { CORES_HABITO_LISTA, classesCor } from '@/theme/cores';

export default function App() {
  const { tema, alternarTema } = useTema();

  return (
    <div className="min-h-full bg-white text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">1%</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Melhore um pouco todos os dias.
          </p>
        </div>
        <button
          type="button"
          onClick={alternarTema}
          aria-label={tema === 'claro' ? 'Ativar tema escuro' : 'Ativar tema claro'}
          className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {tema === 'claro' ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Sun className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-1 text-lg font-semibold">Setup concluído (M0)</h2>
          <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
            Vite + React + TypeScript + Tailwind + Vitest prontos. Próximo
            marco: M1 — Domínio.
          </p>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Paleta de hábitos (SPEC §4.3)
          </p>
          <div className="flex flex-wrap gap-2">
            {CORES_HABITO_LISTA.map((cor) => (
              <span
                key={cor}
                className={`rounded-full px-3 py-1 text-sm font-medium ${classesCor(cor)}`}
              >
                {cor}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
