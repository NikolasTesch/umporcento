import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { DiaProvider, useDia } from './DiaContext';
import { HabitosProvider } from './HabitosContext';
import type { StorageRepository } from '@/data/StorageRepository';
import { estadoInicial, type EstadoApp, type Habito } from '@/domain/types';

const AGORA = new Date('2024-01-10T12:00:00.000'); // hoje = 2024-01-10 (quarta)

function habito(p: Partial<Habito> = {}): Habito {
  return {
    id: 'h1',
    nome: 'Beber água',
    periodo: 'manha',
    metaSemanal: 7,
    ordem: 0,
    arquivado: false,
    criadoEm: '2024-01-01T08:00:00.000',
    ...p,
  };
}

function fakeRepo(inicial: EstadoApp): StorageRepository {
  let estado = structuredClone(inicial);
  return {
    carregar: async () => structuredClone(estado),
    salvar: async (e) => {
      estado = structuredClone(e);
    },
    exportar: async () => JSON.stringify(estado),
    importar: async (j) => (estado = JSON.parse(j)),
  };
}

function montar(repo: StorageRepository) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <HabitosProvider repo={repo}>
      <DiaProvider repo={repo} agora={AGORA}>
        {children}
      </DiaProvider>
    </HabitosProvider>
  );
  return renderHook(() => useDia(), { wrapper });
}

function estadoBase(over: Partial<EstadoApp> = {}): EstadoApp {
  return { ...estadoInicial(new Date('2024-01-01T00:00:00.000')), habitos: [habito()], ...over };
}

describe('DiaContext (SPEC §8.4 / §6.1)', () => {
  it('alternar marca e desmarca o hábito de hoje e persiste', async () => {
    const repo = fakeRepo(estadoBase());
    const { result } = montar(repo);
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(async () => {
      await result.current.alternar('h1');
    });
    expect(result.current.marcado('h1')).toBe(true);
    expect((await repo.carregar())?.dias['2024-01-10']?.habitosConcluidos).toEqual(['h1']);

    await act(async () => {
      await result.current.alternar('h1');
    });
    expect(result.current.marcado('h1')).toBe(false);
  });

  it('projeção e índice refletem a marcação de hoje', async () => {
    const repo = fakeRepo(estadoBase({ habitos: [habito({ metaSemanal: 1 })] }));
    const { result } = montar(repo);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.projecao).toBe('neutro');

    await act(async () => {
      await result.current.alternar('h1');
    });
    expect(result.current.projecao).toBe('cumprido');
    // hoje não congela: índice permanece na base
    expect(result.current.indice).toBe(1);
  });

  it('reflexão faz autosave após 1000ms de inatividade', async () => {
    const repo = fakeRepo(estadoBase());
    const { result } = montar(repo);
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => {
      result.current.editarReflexao('Dia produtivo');
    });
    expect(result.current.reflexao).toBe('Dia produtivo');
    expect(result.current.reflexaoSalva).toBe(false);
    expect((await repo.carregar())?.dias['2024-01-10']?.reflexao ?? '').toBe('');

    await waitFor(() => expect(result.current.reflexaoSalva).toBe(true), {
      timeout: 2000,
    });
    expect((await repo.carregar())?.dias['2024-01-10']?.reflexao).toBe('Dia produtivo');
  });

  it('reflexão é limitada a 1000 caracteres', async () => {
    const repo = fakeRepo(estadoBase());
    const { result } = montar(repo);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    act(() => {
      result.current.editarReflexao('a'.repeat(1500));
    });
    expect(result.current.reflexao).toHaveLength(1000);
  });

  it('fecha dias pendentes ao abrir, congelando avaliação e índice (SPEC §5.4)', async () => {
    const repo = fakeRepo(
      estadoBase({
        dias: {
          '2024-01-09': { data: '2024-01-09', habitosConcluidos: ['h1'], reflexao: '' },
        },
      }),
    );
    const { result } = montar(repo);
    await waitFor(() => expect(result.current.dias['2024-01-09']?.avaliacao).toBe('cumprido'));
    expect(result.current.dias['2024-01-09']?.indiceFechado).toBeCloseTo(1.01, 10);
    expect(result.current.indice).toBeCloseTo(1.01, 10);
    expect((await repo.carregar())?.dias['2024-01-09']?.avaliacao).toBe('cumprido');
  });
});
