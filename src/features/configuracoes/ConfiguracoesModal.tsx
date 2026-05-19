/**
 * Configurações (modal — sem rota) — SPEC §6.5.
 *
 * M3.5 cobre tema e "Como funciona o Índice 1%" (reabre o onboarding).
 * Exportar/importar, recalcular e resetar chegam na M5.
 */
import { Moon, Sun } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { usePreferencias } from '@/state/PreferenciasContext';

export function ConfiguracoesModal({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  const { tema, alternarTema, reabrirOnboarding } = usePreferencias();

  return (
    <Modal aberto={aberto} titulo="Configurações" onFechar={onFechar}>
      <div className="space-y-2">
        <button
          type="button"
          onClick={alternarTema}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-800"
        >
          <span className="font-medium text-gray-900 dark:text-gray-100">Tema</span>
          <span className="flex items-center gap-2 text-gray-500">
            {tema === 'claro' ? (
              <>
                <Sun className="h-4 w-4" aria-hidden="true" /> Claro
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" aria-hidden="true" /> Escuro
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            reabrirOnboarding();
            onFechar();
          }}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100"
        >
          Como funciona o Índice 1%
        </button>
      </div>
    </Modal>
  );
}
