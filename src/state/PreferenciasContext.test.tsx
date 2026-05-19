import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { PreferenciasProvider, usePreferencias } from './PreferenciasContext';
import type { StorageRepository } from '@/data/StorageRepository';
import { estadoInicial, type EstadoApp } from '@/domain/types';

function fakeRepo(inicial?: EstadoApp): StorageRepository {
  let estado: EstadoApp | null = inicial ? structuredClone(inicial) : null;
  return {
    carregar: async () => (estado ? structuredClone(estado) : null),
    salvar: async (e) => {
      estado = structuredClone(e);
    },
    exportar: async () => JSON.stringify(estado),
    importar: async (j) => (estado = JSON.parse(j)),
  };
}

function montar(repo: StorageRepository) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PreferenciasProvider repo={repo}>{children}</PreferenciasProvider>
  );
  return renderHook(() => usePreferencias(), { wrapper });
}

describe('PreferenciasContext (SPEC §8.4 / §6.0 / §6.5)', () => {
  it('primeiro acesso: mostra onboarding', async () => {
    const { result } = montar(fakeRepo());
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.onboardingConcluido).toBe(false);
    expect(result.current.mostrarOnboarding).toBe(true);
  });

  it('concluir onboarding persiste e oculta', async () => {
    const repo = fakeRepo();
    const { result } = montar(repo);
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => result.current.concluirOnboarding());
    expect(result.current.mostrarOnboarding).toBe(false);
    await waitFor(async () =>
      expect((await repo.carregar())?.preferencias.onboardingConcluido).toBe(true),
    );
  });

  it('reabrir mostra o onboarding mesmo após concluído', async () => {
    const base = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    base.preferencias.onboardingConcluido = true;
    const { result } = montar(fakeRepo(base));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.mostrarOnboarding).toBe(false);

    act(() => result.current.reabrirOnboarding());
    expect(result.current.mostrarOnboarding).toBe(true);
  });

  it('alternar tema persiste a preferência', async () => {
    const repo = fakeRepo();
    const { result } = montar(repo);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    const inicial = result.current.tema;

    act(() => result.current.alternarTema());
    expect(result.current.tema).not.toBe(inicial);
    await waitFor(async () =>
      expect((await repo.carregar())?.preferencias.tema).toBe(result.current.tema),
    );
  });

  it('carrega preferências persistidas', async () => {
    const base = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    base.preferencias = { tema: 'escuro', onboardingConcluido: true };
    const { result } = montar(fakeRepo(base));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.tema).toBe('escuro');
    expect(result.current.onboardingConcluido).toBe(true);
  });
});
