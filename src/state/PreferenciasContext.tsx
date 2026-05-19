/**
 * Contexto de Preferências — SPEC §8.4.
 *
 * Responsabilidade: `tema` (claro/escuro, persistido + aplicado no DOM) e
 * `onboardingConcluido`, além de reabrir o onboarding sob demanda (SPEC §6.5).
 * Persiste a fatia `preferencias` via read-modify-write do `EstadoApp`.
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
import { estadoInicial, type EstadoApp, type Preferencias, type Tema } from '@/domain/types';

interface PreferenciasContextValue {
  tema: Tema;
  onboardingConcluido: boolean;
  carregando: boolean;
  mostrarOnboarding: boolean;
  alternarTema: () => void;
  definirTema: (tema: Tema) => void;
  concluirOnboarding: () => void;
  reabrirOnboarding: () => void;
}

const PreferenciasContext = createContext<PreferenciasContextValue | null>(null);

function temaDoSistema(): Tema {
  if (typeof window === 'undefined' || !window.matchMedia) return 'claro';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

function aplicarTema(tema: Tema): void {
  document.documentElement.classList.toggle('dark', tema === 'escuro');
}

export function PreferenciasProvider({
  children,
  repo = repoPadrao,
}: {
  children: ReactNode;
  repo?: StorageRepository;
}) {
  const [tema, setTema] = useState<Tema>(temaDoSistema);
  const [onboardingConcluido, setOnboarding] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [reaberto, setReaberto] = useState(false);
  const baseRef = useRef<EstadoApp>(estadoInicial());

  useEffect(() => {
    let ativo = true;
    repo
      .carregar()
      .then((estado) => {
        if (!ativo || !estado) return;
        baseRef.current = estado;
        setTema(estado.preferencias.tema);
        setOnboarding(estado.preferencias.onboardingConcluido);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [repo]);

  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  const persistir = useCallback(
    async (patch: Partial<Preferencias>) => {
      const base = (await repo.carregar()) ?? estadoInicial();
      baseRef.current = base;
      await repo.salvar({
        ...base,
        preferencias: { ...base.preferencias, ...patch },
      });
    },
    [repo],
  );

  const definirTema = useCallback(
    (novo: Tema) => {
      setTema(novo);
      void persistir({ tema: novo });
    },
    [persistir],
  );

  const alternarTema = useCallback(() => {
    setTema((t) => {
      const novo: Tema = t === 'claro' ? 'escuro' : 'claro';
      void persistir({ tema: novo });
      return novo;
    });
  }, [persistir]);

  const concluirOnboarding = useCallback(() => {
    setOnboarding(true);
    setReaberto(false);
    void persistir({ onboardingConcluido: true });
  }, [persistir]);

  const reabrirOnboarding = useCallback(() => {
    setReaberto(true);
  }, []);

  const mostrarOnboarding = !carregando && (!onboardingConcluido || reaberto);

  const value = useMemo<PreferenciasContextValue>(
    () => ({
      tema,
      onboardingConcluido,
      carregando,
      mostrarOnboarding,
      alternarTema,
      definirTema,
      concluirOnboarding,
      reabrirOnboarding,
    }),
    [
      tema,
      onboardingConcluido,
      carregando,
      mostrarOnboarding,
      alternarTema,
      definirTema,
      concluirOnboarding,
      reabrirOnboarding,
    ],
  );

  return (
    <PreferenciasContext.Provider value={value}>{children}</PreferenciasContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferencias(): PreferenciasContextValue {
  const ctx = useContext(PreferenciasContext);
  if (!ctx) {
    throw new Error('usePreferencias deve ser usado dentro de <PreferenciasProvider>');
  }
  return ctx;
}
