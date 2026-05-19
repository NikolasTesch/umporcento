/**
 * Contexto de Hábitos — SPEC §8.4.
 *
 * Responsabilidade: `habitos[]`, criar, editar, arquivar/desarquivar e
 * reordenar (drag-and-drop dentro do período). Persiste via
 * `StorageRepository` com read-modify-write do `EstadoApp` completo, para não
 * sobrescrever fatias de outros contextos no mesmo tab (SPEC §8.4 / §11).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { repo as repoPadrao } from '@/data/repo';
import type { StorageRepository } from '@/data/StorageRepository';
import { proximaOrdem, validarEntradaHabito } from '@/domain/habito';
import { estadoInicial, type Habito, type Periodo } from '@/domain/types';

export interface EntradaNovoHabito {
  nome: string;
  periodo: Periodo;
  metaSemanal: number;
  cor?: Habito['cor'];
  icone?: string;
}

export type PatchHabito = Partial<
  Pick<Habito, 'nome' | 'periodo' | 'metaSemanal' | 'cor' | 'icone'>
>;

interface HabitosContextValue {
  habitos: Habito[];
  carregando: boolean;
  erro: string | null;
  criar: (entrada: EntradaNovoHabito) => Promise<void>;
  editar: (id: string, patch: PatchHabito) => Promise<void>;
  arquivar: (id: string) => Promise<void>;
  desarquivar: (id: string) => Promise<void>;
  reordenar: (periodo: Periodo, idsOrdenados: string[]) => Promise<void>;
}

const HabitosContext = createContext<HabitosContextValue | null>(null);

export function HabitosProvider({
  children,
  repo = repoPadrao,
}: {
  children: ReactNode;
  repo?: StorageRepository;
}) {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  // Fonte de verdade síncrona: operações sequenciais (ex.: dois `criar` no
  // mesmo tick) precisam enxergar o resultado da anterior antes do re-render.
  const habitosRef = useRef<Habito[]>([]);

  useEffect(() => {
    let ativo = true;
    repo
      .carregar()
      .then((estado) => {
        if (ativo) {
          habitosRef.current = estado?.habitos ?? [];
          setHabitos(habitosRef.current);
        }
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar seus hábitos.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [repo]);

  const persistir = useCallback(
    async (novos: Habito[]) => {
      const base = (await repo.carregar()) ?? estadoInicial();
      await repo.salvar({ ...base, habitos: novos });
      habitosRef.current = novos;
      setHabitos(novos);
    },
    [repo],
  );

  const criar = useCallback(
    async (entrada: EntradaNovoHabito) => {
      const msg = validarEntradaHabito(entrada);
      if (msg) {
        setErro(msg);
        return;
      }
      const novo: Habito = {
        id: crypto.randomUUID(),
        nome: entrada.nome.trim(),
        periodo: entrada.periodo,
        metaSemanal: entrada.metaSemanal,
        ordem: proximaOrdem(habitosRef.current, entrada.periodo),
        cor: entrada.cor,
        icone: entrada.icone,
        arquivado: false,
        criadoEm: new Date().toISOString(),
      };
      setErro(null);
      await persistir([...habitosRef.current, novo]);
    },
    [persistir],
  );

  const editar = useCallback(
    async (id: string, patch: PatchHabito) => {
      const alvo = habitosRef.current.find((h) => h.id === id);
      if (!alvo) return;
      const futuro = { ...alvo, ...patch };
      const msg = validarEntradaHabito({
        nome: futuro.nome,
        periodo: futuro.periodo,
        metaSemanal: futuro.metaSemanal,
      });
      if (msg) {
        setErro(msg);
        return;
      }
      const novos = habitosRef.current.map((h) =>
        h.id === id ? { ...futuro, nome: futuro.nome.trim() } : h,
      );
      setErro(null);
      await persistir(novos);
    },
    [persistir],
  );

  const definirArquivado = useCallback(
    async (id: string, arquivado: boolean) => {
      const novos = habitosRef.current.map((h) => (h.id === id ? { ...h, arquivado } : h));
      await persistir(novos);
    },
    [persistir],
  );

  const arquivar = useCallback((id: string) => definirArquivado(id, true), [definirArquivado]);
  const desarquivar = useCallback((id: string) => definirArquivado(id, false), [definirArquivado]);

  const reordenar = useCallback(
    async (periodo: Periodo, idsOrdenados: string[]) => {
      const posicao = new Map(idsOrdenados.map((id, i) => [id, i]));
      const novos = habitosRef.current.map((h) =>
        h.periodo === periodo && !h.arquivado && posicao.has(h.id)
          ? { ...h, ordem: posicao.get(h.id)! }
          : h,
      );
      await persistir(novos);
    },
    [persistir],
  );

  const value = useMemo<HabitosContextValue>(
    () => ({
      habitos,
      carregando,
      erro,
      criar,
      editar,
      arquivar,
      desarquivar,
      reordenar,
    }),
    [habitos, carregando, erro, criar, editar, arquivar, desarquivar, reordenar],
  );

  return <HabitosContext.Provider value={value}>{children}</HabitosContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHabitos(): HabitosContextValue {
  const ctx = useContext(HabitosContext);
  if (!ctx) {
    throw new Error('useHabitos deve ser usado dentro de <HabitosProvider>');
  }
  return ctx;
}
