/**
 * Tela de Hábitos (rota `/habitos`) — SPEC §6.2.
 *
 * Lista por período na ordem do usuário, drag-and-drop dentro do período
 * (`@dnd-kit/sortable`, com suporte a teclado), criar/editar via modal e
 * arquivar com confirmação. Seção "Arquivados" recolhível.
 */
import { useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArchiveRestore, GripVertical, Pencil, Plus } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { classesCor } from '@/theme/cores';
import { iconePor } from '@/theme/icones';
import { PERIODOS, type Habito, type Periodo } from '@/domain/types';
import { useHabitos } from '@/state/HabitosContext';
import { HabitoFormModal } from './HabitoFormModal';

const ROTULO_PERIODO: Record<Periodo, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

function LinhaHabito({
  habito,
  onEditar,
  onArquivar,
}: {
  habito: Habito;
  onEditar: () => void;
  onArquivar: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: habito.id });
  const Icone = iconePor(habito.icone);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-900"
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={`Reordenar ${habito.nome}`}
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" aria-hidden="true" />
      </button>

      {habito.cor ? (
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${classesCor(habito.cor)}`}
        >
          {Icone && <Icone className="h-4 w-4" aria-hidden="true" />}
        </span>
      ) : (
        Icone && <Icone className="h-5 w-5 text-gray-500" aria-hidden="true" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {habito.nome}
        </p>
        <p className="text-xs text-gray-500">{habito.metaSemanal}x por semana</p>
      </div>

      <button
        type="button"
        onClick={onEditar}
        aria-label={`Editar ${habito.nome}`}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onArquivar}
        aria-label={`Arquivar ${habito.nome}`}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
      >
        <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}

export function HabitosScreen() {
  const { habitos, carregando, reordenar, arquivar, desarquivar } = useHabitos();
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Habito | undefined>(undefined);
  const [arquivadosAbertos, setArquivadosAbertos] = useState(false);
  const [confirmando, setConfirmando] = useState<Habito | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const porPeriodo = useMemo(() => {
    const mapa: Record<Periodo, Habito[]> = { manha: [], tarde: [], noite: [] };
    for (const h of habitos) {
      if (!h.arquivado) mapa[h.periodo].push(h);
    }
    for (const p of PERIODOS) mapa[p].sort((a, b) => a.ordem - b.ordem);
    return mapa;
  }, [habitos]);

  const arquivados = useMemo(() => habitos.filter((h) => h.arquivado), [habitos]);

  function onDragEnd(periodo: Periodo, evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    const ids = porPeriodo[periodo].map((h) => h.id);
    const de = ids.indexOf(String(active.id));
    const para = ids.indexOf(String(over.id));
    if (de < 0 || para < 0) return;
    void reordenar(periodo, arrayMove(ids, de, para));
  }

  function abrirCriar() {
    setEmEdicao(undefined);
    setFormAberto(true);
  }
  function abrirEditar(h: Habito) {
    setEmEdicao(h);
    setFormAberto(true);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Hábitos</h1>
        <button
          type="button"
          onClick={abrirCriar}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo
        </button>
      </div>

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando…</p>
      ) : habitos.filter((h) => !h.arquivado).length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="mb-3 text-sm text-gray-500">
            Você ainda não tem hábitos. Comece com um pequeno passo.
          </p>
          <button
            type="button"
            onClick={abrirCriar}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          >
            Criar primeiro hábito
          </button>
        </div>
      ) : (
        PERIODOS.map((periodo) => (
          <section key={periodo}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {ROTULO_PERIODO[periodo]}
            </h2>
            {porPeriodo[periodo].length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum hábito neste período.</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => onDragEnd(periodo, e)}
              >
                <SortableContext
                  items={porPeriodo[periodo].map((h) => h.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {porPeriodo[periodo].map((h) => (
                      <LinhaHabito
                        key={h.id}
                        habito={h}
                        onEditar={() => abrirEditar(h)}
                        onArquivar={() => setConfirmando(h)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </section>
        ))
      )}

      {arquivados.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setArquivadosAbertos((v) => !v)}
            aria-expanded={arquivadosAbertos}
            className="text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Arquivados ({arquivados.length}) {arquivadosAbertos ? '▾' : '▸'}
          </button>
          {arquivadosAbertos && (
            <ul className="mt-2 space-y-2">
              {arquivados.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 dark:border-gray-800"
                >
                  <span className="truncate">{h.nome}</span>
                  <button
                    type="button"
                    onClick={() => void desarquivar(h.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Restaurar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {formAberto && (
        <HabitoFormModal
          aberto={formAberto}
          habito={emEdicao}
          onFechar={() => setFormAberto(false)}
        />
      )}

      <Modal
        aberto={confirmando != null}
        titulo="Arquivar hábito"
        onFechar={() => setConfirmando(null)}
      >
        <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
          Arquivar <strong>{confirmando?.nome}</strong>? O histórico é preservado e você pode
          restaurá-lo depois.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmando(null)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirmando) void arquivar(confirmando.id);
              setConfirmando(null);
            }}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white"
          >
            Arquivar
          </button>
        </div>
      </Modal>
    </div>
  );
}
