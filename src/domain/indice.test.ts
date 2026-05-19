import { describe, expect, it } from 'vitest';
import {
  avaliarDia,
  fatorAvaliacao,
  fecharDiasPendentes,
  indiceAtual,
  projecaoHoje,
  recalcular,
} from './indice';
import { estadoInicial, type EstadoApp, type Habito, type RegistroDia } from './types';

function habito(parcial: Partial<Habito> = {}): Habito {
  return {
    id: 'h1',
    nome: 'Hábito',
    periodo: 'manha',
    metaSemanal: 1,
    ordem: 0,
    arquivado: false,
    criadoEm: '2024-01-01T08:00:00.000',
    ...parcial,
  };
}

function reg(data: string, habitosConcluidos: string[] = []): RegistroDia {
  return { data, habitosConcluidos, reflexao: '' };
}

function estado(parcial: Partial<EstadoApp> = {}): EstadoApp {
  return { ...estadoInicial(new Date('2024-01-01T00:00:00.000')), ...parcial };
}

describe('fatorAvaliacao (SPEC §5.2)', () => {
  it('mapeia cumprido/perdido/neutro', () => {
    expect(fatorAvaliacao('cumprido')).toBe(1.01);
    expect(fatorAvaliacao('perdido')).toBe(0.99);
    expect(fatorAvaliacao('neutro')).toBe(1.0);
  });
});

describe('avaliarDia (SPEC §5.1)', () => {
  it('sem hábitos ativos → neutro', () => {
    expect(avaliarDia([], {}, '2024-01-03')).toBe('neutro');
  });

  it('hábito sem pressão e nada marcado → neutro', () => {
    const h = habito({ metaSemanal: 1 });
    // quarta-feira, meta 1, nada feito: faltam 1 < restantes 5 → não pressiona
    expect(avaliarDia([h], { '2024-01-03': reg('2024-01-03') }, '2024-01-03')).toBe('neutro');
  });

  it('algo concluído sem obrigatório pendente → cumprido', () => {
    const h = habito({ metaSemanal: 1 });
    const dias = { '2024-01-03': reg('2024-01-03', ['h1']) };
    expect(avaliarDia([h], dias, '2024-01-03')).toBe('cumprido');
  });

  it('obrigatório não concluído → perdido', () => {
    // sábado, meta 2, nada feito na semana: faltam 2 == restantes 2 → obrigatório
    const h = habito({ metaSemanal: 2 });
    const dias = { '2024-01-06': reg('2024-01-06') };
    expect(avaliarDia([h], dias, '2024-01-06')).toBe('perdido');
  });

  it('perdido na semana (impossível recuperar) → perdido', () => {
    // domingo, meta 2, nada feito: faltam 2 > restantes 1 → perdido na semana
    const h = habito({ metaSemanal: 2 });
    const dias = { '2024-01-07': reg('2024-01-07') };
    expect(avaliarDia([h], dias, '2024-01-07')).toBe('perdido');
  });

  it('meta batida cedo não pressiona dias seguintes', () => {
    const h = habito({ metaSemanal: 1 });
    const dias = {
      '2024-01-01': reg('2024-01-01', ['h1']),
      '2024-01-05': reg('2024-01-05'),
    };
    expect(avaliarDia([h], dias, '2024-01-05')).toBe('neutro');
  });

  it('hábito arquivado é ignorado', () => {
    const h = habito({ metaSemanal: 2, arquivado: true });
    expect(avaliarDia([h], { '2024-01-07': reg('2024-01-07') }, '2024-01-07')).toBe('neutro');
  });

  it('hábito criado depois do dia é ignorado', () => {
    const h = habito({ metaSemanal: 2, criadoEm: '2024-01-10T08:00:00.000' });
    expect(avaliarDia([h], { '2024-01-07': reg('2024-01-07') }, '2024-01-07')).toBe('neutro');
  });

  it('mid-week: usa metaEfetiva proporcional', () => {
    // criado sábado, meta 7 → metaEfetiva sábado = 2; restantes 2 → obrigatório
    const h = habito({ metaSemanal: 7, criadoEm: '2024-01-06T10:00:00.000' });
    expect(avaliarDia([h], { '2024-01-06': reg('2024-01-06') }, '2024-01-06')).toBe('perdido');
  });
});

describe('índice incremental (SPEC §5.2 / §5.4)', () => {
  it('produto composto via fecharDiasPendentes', () => {
    const h = habito({ id: 'h1', metaSemanal: 7 });
    const dias: Record<string, RegistroDia> = {};
    for (const d of ['2024-01-01', '2024-01-02', '2024-01-03']) {
      dias[d] = reg(d, ['h1']);
    }
    const fechado = fecharDiasPendentes(estado({ habitos: [h], dias }), '2024-01-04');
    expect(fechado.dias['2024-01-01']?.avaliacao).toBe('cumprido');
    expect(fechado.dias['2024-01-03']?.indiceFechado).toBeCloseTo(1.01 ** 3, 10);
    expect(indiceAtual(fechado)).toBeCloseTo(1.01 ** 3, 10);
  });

  it('não entra hoje; só dias anteriores são congelados', () => {
    const h = habito({ id: 'h1', metaSemanal: 7 });
    const dias = { '2024-01-03': reg('2024-01-03', ['h1']) };
    const fechado = fecharDiasPendentes(estado({ habitos: [h], dias }), '2024-01-03');
    expect(fechado.dias['2024-01-03']?.avaliacao).toBeUndefined();
    expect(indiceAtual(fechado)).toBe(1.0);
  });

  it('preserva dias já congelados', () => {
    const h = habito({ id: 'h1', metaSemanal: 7 });
    const dias: Record<string, RegistroDia> = {
      '2024-01-01': { ...reg('2024-01-01', ['h1']), avaliacao: 'perdido', indiceFechado: 0.5 },
      '2024-01-02': reg('2024-01-02', ['h1']),
    };
    const fechado = fecharDiasPendentes(estado({ habitos: [h], dias }), '2024-01-03');
    expect(fechado.dias['2024-01-01']?.indiceFechado).toBe(0.5);
    expect(fechado.dias['2024-01-02']?.indiceFechado).toBeCloseTo(0.5 * 1.01, 10);
  });

  it('recalcular reprocessa a cadeia ignorando snapshots', () => {
    const h = habito({ id: 'h1', metaSemanal: 7 });
    const dias: Record<string, RegistroDia> = {
      '2024-01-01': { ...reg('2024-01-01', ['h1']), avaliacao: 'perdido', indiceFechado: 0.5 },
      '2024-01-02': reg('2024-01-02', ['h1']),
    };
    const recalc = recalcular(estado({ habitos: [h], dias }), '2024-01-03');
    expect(recalc.dias['2024-01-01']?.avaliacao).toBe('cumprido');
    expect(recalc.dias['2024-01-01']?.indiceFechado).toBeCloseTo(1.01, 10);
    expect(recalc.dias['2024-01-02']?.indiceFechado).toBeCloseTo(1.01 ** 2, 10);
  });
});

describe('projecaoHoje (SPEC §6.1)', () => {
  it('reflete a avaliação de hoje sem congelar', () => {
    const h = habito({ id: 'h1', metaSemanal: 1 });
    const e = estado({ habitos: [h], dias: { '2024-01-03': reg('2024-01-03', ['h1']) } });
    expect(projecaoHoje(e, '2024-01-03')).toBe('cumprido');
    expect(e.dias['2024-01-03']?.avaliacao).toBeUndefined();
  });
});
