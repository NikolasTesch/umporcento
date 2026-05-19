import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { OnboardingOverlay } from './OnboardingOverlay';
import { PreferenciasProvider } from '@/state/PreferenciasContext';
import { HabitosProvider } from '@/state/HabitosContext';
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

function tela(repo: StorageRepository) {
  return render(
    <PreferenciasProvider repo={repo}>
      <HabitosProvider repo={repo}>
        <OnboardingOverlay />
      </HabitosProvider>
    </PreferenciasProvider>,
  );
}

describe('OnboardingOverlay (SPEC §6.0)', () => {
  it('aparece no primeiro acesso com a tela 1', async () => {
    tela(fakeRepo());
    expect(await screen.findByRole('dialog', { name: /boas-vindas/i })).toBeInTheDocument();
    expect(screen.getByText(/melhore 1% por dia/i)).toBeInTheDocument();
  });

  it('navega pelas 4 telas e a última cria o primeiro hábito', async () => {
    const repo = fakeRepo();
    tela(repo);
    await screen.findByRole('dialog', { name: /boas-vindas/i });

    await userEvent.click(screen.getByRole('button', { name: /^próximo$/i }));
    expect(screen.getByText(/como o índice funciona/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^próximo$/i }));
    await userEvent.click(screen.getByRole('button', { name: /^próximo$/i }));

    const cta = screen.getByRole('button', { name: /criar primeiro hábito/i });
    await userEvent.click(cta);

    expect(await screen.findByRole('dialog', { name: /novo hábito/i })).toBeInTheDocument();
    await waitFor(async () =>
      expect((await repo.carregar())?.preferencias.onboardingConcluido).toBe(true),
    );
  });

  it('pular fecha o onboarding e marca como concluído', async () => {
    const repo = fakeRepo();
    tela(repo);
    await screen.findByRole('dialog', { name: /boas-vindas/i });

    await userEvent.click(screen.getByRole('button', { name: /pular introdução/i }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /boas-vindas/i })).not.toBeInTheDocument(),
    );
    expect((await repo.carregar())?.preferencias.onboardingConcluido).toBe(true);
  });

  it('não aparece quando o onboarding já foi concluído', async () => {
    const base = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    base.preferencias.onboardingConcluido = true;
    tela(fakeRepo(base));
    await waitFor(() => new Promise((r) => setTimeout(r, 50)));
    expect(screen.queryByRole('dialog', { name: /boas-vindas/i })).not.toBeInTheDocument();
  });
});
