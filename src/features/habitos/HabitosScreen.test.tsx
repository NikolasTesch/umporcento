import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HabitosScreen } from './HabitosScreen';
import { HabitosProvider } from '@/state/HabitosContext';
import type { StorageRepository } from '@/data/StorageRepository';
import { estadoInicial, type EstadoApp, type Habito } from '@/domain/types';

function repoCom(habitos: Habito[]): StorageRepository {
  let estado: EstadoApp = { ...estadoInicial(new Date('2024-01-01T00:00:00.000')), habitos };
  return {
    carregar: async () => structuredClone(estado),
    salvar: async (e) => {
      estado = structuredClone(e);
    },
    exportar: async () => JSON.stringify(estado),
    importar: async (j) => (estado = JSON.parse(j)),
  };
}

function habito(p: Partial<Habito>): Habito {
  return {
    id: 'h',
    nome: 'X',
    periodo: 'manha',
    metaSemanal: 1,
    ordem: 0,
    arquivado: false,
    criadoEm: '2024-01-01T00:00:00.000',
    ...p,
  };
}

function tela(repo: StorageRepository) {
  return render(
    <HabitosProvider repo={repo}>
      <HabitosScreen />
    </HabitosProvider>,
  );
}

describe('HabitosScreen (SPEC §6.2)', () => {
  it('mostra estado vazio quando não há hábitos', async () => {
    tela(repoCom([]));
    expect(await screen.findByText(/ainda não tem hábitos/i)).toBeInTheDocument();
  });

  it('lista hábitos agrupados na ordem do usuário com handle acessível', async () => {
    const repo = repoCom([
      habito({ id: 'a', nome: 'Beber água', periodo: 'manha', ordem: 1 }),
      habito({ id: 'b', nome: 'Correr', periodo: 'manha', ordem: 0 }),
    ]);
    tela(repo);
    await waitFor(() => expect(screen.getByText('Correr')).toBeInTheDocument());

    const itens = screen.getAllByRole('listitem').map((li) => li.textContent);
    // ordem 0 (Correr) antes de ordem 1 (Beber água)
    expect(itens[0]).toContain('Correr');
    expect(itens[1]).toContain('Beber água');
    expect(screen.getByLabelText('Reordenar Correr')).toBeInTheDocument();
  });

  it('abre o modal de novo hábito', async () => {
    tela(repoCom([]));
    await screen.findByText(/ainda não tem hábitos/i);
    await userEvent.click(screen.getByRole('button', { name: /^novo$/i }));
    expect(await screen.findByRole('dialog', { name: /novo hábito/i })).toBeInTheDocument();
  });

  it('mostra seção de arquivados recolhível', async () => {
    const repo = repoCom([habito({ id: 'z', nome: 'Antigo', arquivado: true })]);
    tela(repo);
    const toggle = await screen.findByRole('button', { name: /arquivados \(1\)/i });
    expect(screen.queryByText('Antigo')).not.toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.getByText('Antigo')).toBeInTheDocument();
  });
});
