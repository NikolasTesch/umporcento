/**
 * Contexto do Dia — SPEC §8.4.
 *
 * Responsabilidade: `dias{}`, marcar/desmarcar hábito, reflexão com autosave
 * (debounce 1000ms — SPEC §6.1), fechamento de dias pendentes ao abrir
 * (SPEC §5.4) e projeção de hoje. Persiste a fatia `dias` via read-modify-write
 * do `EstadoApp` (não sobrescreve `habitos` de outro contexto — SPEC §8.4).
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
import {
  avaliarDia,
  fecharDiasPendentes,
  indiceAtual,
  statusHabito,
  type StatusHabito,
} from '@/domain/indice';
import { chaveData, streakAtual } from '@/domain/semana';
import {
  estadoInicial,
  type Avaliacao,
  type EstadoApp,
  type Habito,
  type RegistroDia,
} from '@/domain/types';
import { useHabitos } from './HabitosContext';

export const LIMITE_REFLEXAO = 1000;
const DEBOUNCE_REFLEXAO_MS = 1000;

interface DiaContextValue {
  hoje: string;
  dias: Record<string, RegistroDia>;
  carregando: boolean;
  marcado: (habitoId: string) => boolean;
  alternar: (habitoId: string) => Promise<void>;
  reflexao: string;
  editarReflexao: (texto: string) => void;
  reflexaoSalva: boolean;
  projecao: Avaliacao;
  indice: number;
  streak: number;
  statusDe: (habito: Habito) => StatusHabito;
}

const DiaContext = createContext<DiaContextValue | null>(null);

function registroVazio(data: string): RegistroDia {
  return { data, habitosConcluidos: [], reflexao: '' };
}

export function DiaProvider({
  children,
  repo = repoPadrao,
  agora = new Date(),
}: {
  children: ReactNode;
  repo?: StorageRepository;
  agora?: Date;
}) {
  const { habitos, carregando: carregandoHabitos } = useHabitos();
  const hoje = useMemo(() => chaveData(agora), [agora]);

  const [dias, setDias] = useState<Record<string, RegistroDia>>({});
  const [reflexao, setReflexaoState] = useState('');
  const [reflexaoSalva, setReflexaoSalva] = useState(true);
  const [carregando, setCarregando] = useState(true);

  const diasRef = useRef<Record<string, RegistroDia>>({});
  const baseRef = useRef<EstadoApp>(estadoInicial(agora));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fechouRef = useRef(false);

  useEffect(() => {
    let ativo = true;
    repo
      .carregar()
      .then((estado) => {
        if (!ativo) return;
        baseRef.current = estado ?? estadoInicial(agora);
        diasRef.current = baseRef.current.dias;
        setDias(diasRef.current);
        setReflexaoState(diasRef.current[hoje]?.reflexao ?? '');
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [repo, agora, hoje]);

  const persistirDias = useCallback(
    async (novos: Record<string, RegistroDia>) => {
      const base = (await repo.carregar()) ?? estadoInicial(agora);
      baseRef.current = base;
      await repo.salvar({ ...base, dias: novos });
      diasRef.current = novos;
      setDias(novos);
    },
    [repo, agora],
  );

  // Fechamento de dias pendentes ao abrir, quando hábitos já carregaram
  // (SPEC §5.4). Roda uma única vez por sessão.
  useEffect(() => {
    if (carregando || carregandoHabitos || fechouRef.current) return;
    fechouRef.current = true;
    const atual: EstadoApp = { ...baseRef.current, habitos, dias: diasRef.current };
    const fechado = fecharDiasPendentes(atual, hoje);
    if (fechado.dias !== diasRef.current) {
      void persistirDias(fechado.dias);
    }
  }, [carregando, carregandoHabitos, habitos, hoje, persistirDias]);

  const marcado = useCallback(
    (habitoId: string) => diasRef.current[hoje]?.habitosConcluidos.includes(habitoId) ?? false,
    [hoje],
  );

  const alternar = useCallback(
    async (habitoId: string) => {
      const atual = diasRef.current[hoje] ?? registroVazio(hoje);
      const jaTem = atual.habitosConcluidos.includes(habitoId);
      const habitosConcluidos = jaTem
        ? atual.habitosConcluidos.filter((id) => id !== habitoId)
        : [...atual.habitosConcluidos, habitoId];
      const novos = { ...diasRef.current, [hoje]: { ...atual, habitosConcluidos } };
      await persistirDias(novos);
    },
    [hoje, persistirDias],
  );

  const editarReflexao = useCallback(
    (texto: string) => {
      const limitado = texto.slice(0, LIMITE_REFLEXAO);
      setReflexaoState(limitado);
      setReflexaoSalva(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const atual = diasRef.current[hoje] ?? registroVazio(hoje);
        const novos = { ...diasRef.current, [hoje]: { ...atual, reflexao: limitado } };
        void persistirDias(novos).then(() => setReflexaoSalva(true));
      }, DEBOUNCE_REFLEXAO_MS);
    },
    [hoje, persistirDias],
  );

  const statusDe = useCallback((habito: Habito) => statusHabito(habito, dias, hoje), [dias, hoje]);

  const projecao = useMemo<Avaliacao>(() => avaliarDia(habitos, dias, hoje), [habitos, dias, hoje]);

  const indice = useMemo(() => indiceAtual({ ...baseRef.current, dias }), [dias]);

  const streak = useMemo(() => streakAtual(dias), [dias]);

  const value = useMemo<DiaContextValue>(
    () => ({
      hoje,
      dias,
      carregando,
      marcado,
      alternar,
      reflexao,
      editarReflexao,
      reflexaoSalva,
      projecao,
      indice,
      streak,
      statusDe,
    }),
    [
      hoje,
      dias,
      carregando,
      marcado,
      alternar,
      reflexao,
      editarReflexao,
      reflexaoSalva,
      projecao,
      indice,
      streak,
      statusDe,
    ],
  );

  return <DiaContext.Provider value={value}>{children}</DiaContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDia(): DiaContextValue {
  const ctx = useContext(DiaContext);
  if (!ctx) {
    throw new Error('useDia deve ser usado dentro de <DiaProvider>');
  }
  return ctx;
}
