import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Tema = 'claro' | 'escuro';

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
  definirTema: (tema: Tema) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function temaInicial(): Tema {
  if (typeof window === 'undefined') return 'claro';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

function aplicarTema(tema: Tema): void {
  const root = document.documentElement;
  root.classList.toggle('dark', tema === 'escuro');
}

/**
 * Provider de tema (M0). A persistência da preferência será assumida pelo
 * PreferenciasContext (M3) integrado ao StorageRepository — ver SPEC §8.4.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((t) => (t === 'claro' ? 'escuro' : 'claro'));
  }, []);

  const definirTema = useCallback((novo: Tema) => {
    setTema(novo);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ tema, alternarTema, definirTema }),
    [tema, alternarTema, definirTema],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTema(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTema deve ser usado dentro de <ThemeProvider>');
  }
  return ctx;
}
