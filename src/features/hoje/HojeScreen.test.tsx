import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HojeScreen } from './HojeScreen';
import { DiaProvider } from '@/state/DiaContext';
import { HabitosProvider } from '@/state/HabitosContext';
import type { StorageRepository } from '@/data/StorageRepository';
import { estadoInicial, type EstadoApp, type Habito } from '@/domain/types';

const AGORA = new Date('2024-01-10T12:00:00.000');

function habito(p: Partial<Habito> = {}): Habito {
  return {
    id: 'h1',
    nome: 'Correr',
    periodo: 'manha',
    metaSemanal: 3,
    ordem: 0,
    arquivado: false,
    criadoEm: '2024-01-01T08:00:00.000',
    ...p,
  };
}

function repoCom(habitos: Habito[]): StorageRepository {
  let estado: EstadoApp = {
    ...estadoInicial(new Date('2024-01-01T00:00:00.000')),
    habitos,
  };
  return {
    carregar: async () => structuredClone(estado),
    salvar: async (e) => {
      estado = structuredClone(e);
    },
    exportar: async () => JSON.stringify(estado),
    importar: async (j) => (estado = JSON.parse(j)),
  };
}

function tela(repo: StorageRepository) {
  return render(
    <MemoryRouter>
      <HabitosProvider repo={repo}>
        <DiaProvider repo={repo} agora={AGORA}>
          <HojeScreen />
        </DiaProvider>
      </HabitosProvider>
    </MemoryRouter>,
  );
}

describe('HojeScreen (SPEC §6.1)', () => {
  it('mostra estado vazio com CTA para criar hábito', async () => {
    tela(repoCom([]));
    expect(await screen.findByText(/nenhum hábito ainda/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /criar hábito/i })).toHaveAttribute('href', '/habitos');
  });

  it('exibe índice, streak e projeção', async () => {
    tela(repoCom([habito()]));
    expect(await screen.findByText('1.00x')).toBeInTheDocument();
    expect(screen.getByText(/marque um hábito para começar/i)).toBeInTheDocument();
  });

  it('marcar o hábito atualiza progresso e projeção', async () => {
    tela(repoCom([habito({ metaSemanal: 3 })]));
    const check = await screen.findByRole('checkbox', {
      name: /marcar correr como concluído/i,
    });
    expect(screen.getByText('0/3 nesta semana')).toBeInTheDocument();

    await userEvent.click(check);

    await waitFor(() => expect(screen.getByText('1/3 nesta semana')).toBeInTheDocument());
    expect(screen.getByText(/a caminho de cumprido/i)).toBeInTheDocument();
  });

  it('contador da reflexão aparece a partir de 900 caracteres', async () => {
    tela(repoCom([habito()]));
    const textarea = await screen.findByLabelText(/reflexão do dia/i);
    expect(screen.queryByText(/\/1000/)).not.toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: 'a'.repeat(950) } });
    expect(await screen.findByText('950/1000')).toBeInTheDocument();
  });
});
