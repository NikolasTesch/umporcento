/**
 * Formulário de criar/editar hábito (modal) — SPEC §6.2.
 *
 * Nome com contador (≤40), período, meta semanal 1–7, grade de 8 cores
 * (§4.3) e grade de ícones curados (§4.4). Feedback de erro vindo do contexto.
 */
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { CORES_HABITO_LISTA, classesCor } from '@/theme/cores';
import { ICONES, ICONES_LISTA } from '@/theme/icones';
import { LIMITE_NOME, META_MAX, META_MIN } from '@/domain/habito';
import { PERIODOS, type CorHabito, type Habito, type Periodo } from '@/domain/types';
import { useHabitos } from '@/state/HabitosContext';

const ROTULO_PERIODO: Record<Periodo, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

interface Props {
  aberto: boolean;
  onFechar: () => void;
  habito?: Habito; // ausente = criar
}

export function HabitoFormModal({ aberto, onFechar, habito }: Props) {
  const { criar, editar, erro } = useHabitos();
  const [nome, setNome] = useState(habito?.nome ?? '');
  const [periodo, setPeriodo] = useState<Periodo>(habito?.periodo ?? 'manha');
  const [meta, setMeta] = useState<number>(habito?.metaSemanal ?? 3);
  const [cor, setCor] = useState<CorHabito | undefined>(habito?.cor);
  const [icone, setIcone] = useState<string | undefined>(habito?.icone);
  const [salvando, setSalvando] = useState(false);

  const editando = habito != null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const entrada = { nome, periodo, metaSemanal: meta, cor, icone };
    if (editando) {
      await editar(habito.id, entrada);
    } else {
      await criar(entrada);
    }
    setSalvando(false);
    // Sem erro de validação no contexto → fechou com sucesso.
    if (!erro) onFechar();
  }

  return (
    <Modal aberto={aberto} titulo={editando ? 'Editar hábito' : 'Novo hábito'} onFechar={onFechar}>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="habito-nome"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nome
          </label>
          <input
            id="habito-nome"
            type="text"
            value={nome}
            maxLength={LIMITE_NOME}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {nome.length}/{LIMITE_NOME}
          </p>
        </div>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Período
          </legend>
          <div className="flex gap-2">
            {PERIODOS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={periodo === p}
                onClick={() => setPeriodo(p)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  periodo === p
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                    : 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {ROTULO_PERIODO[p]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Meta semanal
          </legend>
          <div className="flex gap-1">
            {Array.from({ length: META_MAX - META_MIN + 1 }, (_, i) => i + META_MIN).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={meta === n}
                aria-label={`${n}x por semana`}
                onClick={() => setMeta(n)}
                className={`h-9 flex-1 rounded-lg border text-sm transition-colors ${
                  meta === n
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                    : 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {CORES_HABITO_LISTA.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Cor ${c}`}
                aria-pressed={cor === c}
                onClick={() => setCor(cor === c ? undefined : c)}
                className={`h-8 w-8 rounded-full ${classesCor(c)} ${
                  cor === c ? 'ring-2 ring-gray-900 ring-offset-2 dark:ring-gray-100' : ''
                }`}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Ícone
          </legend>
          <div className="grid grid-cols-8 gap-2">
            {ICONES_LISTA.map((nomeIcone) => {
              const Icone = ICONES[nomeIcone];
              const ativo = icone === nomeIcone;
              return (
                <button
                  key={nomeIcone}
                  type="button"
                  aria-label={`Ícone ${nomeIcone}`}
                  aria-pressed={ativo}
                  onClick={() => setIcone(ativo ? undefined : nomeIcone)}
                  className={`flex h-9 items-center justify-center rounded-lg border transition-colors ${
                    ativo
                      ? 'border-gray-900 bg-gray-100 dark:border-gray-100 dark:bg-gray-800'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Icone className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </fieldset>

        {erro && (
          <p role="alert" className="text-sm text-red-500">
            {erro}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onFechar}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900"
          >
            {salvando ? 'Salvando…' : editando ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
