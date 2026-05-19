import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { HabitosProvider, useHabitos } from './HabitosContext';
import type { StorageRepository } from '@/data/StorageRepository';
import { estadoInicial, type EstadoApp } from '@/domain/types';

function fakeRepo(inicial?: EstadoApp): StorageRepository {
  let estado: EstadoApp | null = inicial ?? null;
  return {
    carregar: async () => (estado ? structuredClone(estado) : null),
    salvar: async (e) => {
      estado = structuredClone(e);
    },
    exportar: async () => JSON.stringify(estado),
    importar: async (j) => {
      estado = JSON.parse(j);
      return estado!;
    },
  };
}

function wrapper(repo: StorageRepository) {
  return ({ children }: { children: ReactNode }) => (
    <HabitosProvider repo={repo}>{children}</HabitosProvider>
  );
}

async function montar(repo: StorageRepository) {
  const { result } = renderHook(() => useHabitos(), { wrapper: wrapper(repo) });
  await waitFor(() => expect(result.current.carregando).toBe(false));
  return result;
}

describe('HabitosContext (SPEC §8.4)', () => {
  it('criar adiciona hábito e persiste no repositório', async () => {
    const repo = fakeRepo();
    const r = await montar(repo);
    await act(async () => {
      await r.current.criar({ nome: 'Ler', periodo: 'noite', metaSemanal: 5 });
    });
    expect(r.current.habitos).toHaveLength(1);
    expect(r.current.habitos[0]?.nome).toBe('Ler');
    expect(r.current.habitos[0]?.ordem).toBe(0);
    const persistido = await repo.carregar();
    expect(persistido?.habitos[0]?.nome).toBe('Ler');
  });

  it('criar com nome inválido define erro e não persiste', async () => {
    const repo = fakeRepo();
    const r = await montar(repo);
    await act(async () => {
      await r.current.criar({ nome: '   ', periodo: 'manha', metaSemanal: 3 });
    });
    expect(r.current.habitos).toHaveLength(0);
    expect(r.current.erro).toMatch(/informe/i);
  });

  it('ordem é max+1 dentro do período', async () => {
    const repo = fakeRepo();
    const r = await montar(repo);
    await act(async () => {
      await r.current.criar({ nome: 'A', periodo: 'manha', metaSemanal: 1 });
      await r.current.criar({ nome: 'B', periodo: 'manha', metaSemanal: 1 });
    });
    const ordens = r.current.habitos.map((h) => h.ordem);
    expect(ordens).toEqual([0, 1]);
  });

  it('editar valida e atualiza', async () => {
    const repo = fakeRepo();
    const r = await montar(repo);
    await act(async () => {
      await r.current.criar({ nome: 'A', periodo: 'manha', metaSemanal: 1 });
    });
    const id = r.current.habitos[0]!.id;
    await act(async () => {
      await r.current.editar(id, { nome: 'Atualizado', metaSemanal: 4 });
    });
    expect(r.current.habitos[0]?.nome).toBe('Atualizado');
    expect(r.current.habitos[0]?.metaSemanal).toBe(4);
  });

  it('arquivar e desarquivar alternam o soft-delete', async () => {
    const repo = fakeRepo();
    const r = await montar(repo);
    await act(async () => {
      await r.current.criar({ nome: 'A', periodo: 'manha', metaSemanal: 1 });
    });
    const id = r.current.habitos[0]!.id;
    await act(async () => {
      await r.current.arquivar(id);
    });
    expect(r.current.habitos[0]?.arquivado).toBe(true);
    await act(async () => {
      await r.current.desarquivar(id);
    });
    expect(r.current.habitos[0]?.arquivado).toBe(false);
  });

  it('reordenar persiste a nova ordem dentro do período', async () => {
    const repo = fakeRepo();
    const r = await montar(repo);
    await act(async () => {
      await r.current.criar({ nome: 'A', periodo: 'manha', metaSemanal: 1 });
      await r.current.criar({ nome: 'B', periodo: 'manha', metaSemanal: 1 });
      await r.current.criar({ nome: 'C', periodo: 'manha', metaSemanal: 1 });
    });
    const [a, b, c] = r.current.habitos.map((h) => h.id);
    await act(async () => {
      await r.current.reordenar('manha', [c!, a!, b!]);
    });
    const porId = new Map(r.current.habitos.map((h) => [h.id, h.ordem]));
    expect(porId.get(c!)).toBe(0);
    expect(porId.get(a!)).toBe(1);
    expect(porId.get(b!)).toBe(2);
    const persistido = await repo.carregar();
    expect(persistido?.habitos.find((h) => h.id === c)?.ordem).toBe(0);
  });

  it('carrega hábitos já existentes do repositório', async () => {
    const base = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    base.habitos.push({
      id: 'x',
      nome: 'Existente',
      periodo: 'tarde',
      metaSemanal: 2,
      ordem: 0,
      arquivado: false,
      criadoEm: '2024-01-01T00:00:00.000',
    });
    const r = await montar(fakeRepo(base));
    expect(r.current.habitos[0]?.nome).toBe('Existente');
  });
});
