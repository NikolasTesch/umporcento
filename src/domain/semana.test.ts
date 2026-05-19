import { describe, expect, it } from 'vitest';
import {
  chaveData,
  chavesEntre,
  diaIso,
  diasRestantesIncluindo,
  inicioSemanaIso,
  melhorStreak,
  mesmaSemanaIso,
  metaEfetiva,
  parseData,
  streakAtual,
} from './semana';
import type { Habito, RegistroDia } from './types';

function habito(parcial: Partial<Habito> = {}): Habito {
  return {
    id: 'h1',
    nome: 'Hábito',
    periodo: 'manha',
    metaSemanal: 7,
    ordem: 0,
    arquivado: false,
    criadoEm: '2024-01-01T08:00:00.000',
    ...parcial,
  };
}

function dia(data: string, avaliacao: RegistroDia['avaliacao']): RegistroDia {
  return { data, habitosConcluidos: [], reflexao: '', avaliacao };
}

describe('chaveData / parseData (hora local, SPEC §3)', () => {
  it('faz round-trip sem deslocamento de fuso', () => {
    const d = parseData('2024-03-10');
    expect(chaveData(d)).toBe('2024-03-10');
    expect(d.getHours()).toBe(0);
  });
});

describe('diaIso / inicioSemanaIso (semana ISO seg–dom)', () => {
  it('segunda = 1, domingo = 7', () => {
    expect(diaIso(parseData('2024-01-01'))).toBe(1); // segunda
    expect(diaIso(parseData('2024-01-07'))).toBe(7); // domingo
  });

  it('início da semana é sempre a segunda', () => {
    expect(chaveData(inicioSemanaIso(parseData('2024-01-03')))).toBe('2024-01-01');
    expect(chaveData(inicioSemanaIso(parseData('2024-01-07')))).toBe('2024-01-01');
  });

  it('vira o ano corretamente', () => {
    // 2023-12-31 é domingo → semana começa em 2023-12-25 (segunda)
    expect(chaveData(inicioSemanaIso(parseData('2023-12-31')))).toBe('2023-12-25');
  });
});

describe('diasRestantesIncluindo (SPEC §5.1)', () => {
  it('domingo = 1, segunda = 7', () => {
    expect(diasRestantesIncluindo(parseData('2024-01-07'))).toBe(1);
    expect(diasRestantesIncluindo(parseData('2024-01-01'))).toBe(7);
  });
});

describe('mesmaSemanaIso', () => {
  it('reconhece dias da mesma semana e de semanas distintas', () => {
    expect(mesmaSemanaIso(parseData('2024-01-01'), parseData('2024-01-07'))).toBe(true);
    expect(mesmaSemanaIso(parseData('2024-01-07'), parseData('2024-01-08'))).toBe(false);
  });
});

describe('chavesEntre', () => {
  it('lista inclusiva em ordem', () => {
    expect(chavesEntre(parseData('2024-01-01'), parseData('2024-01-03'))).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
    ]);
  });
});

describe('metaEfetiva (SPEC §4.2 / §5.1)', () => {
  it('semana de criação: proporcional aos dias restantes', () => {
    // criado sábado (diaIso 6) → restantes 2 → round(7 × 2/7) = 2
    const h = habito({ metaSemanal: 7, criadoEm: '2024-01-06T10:00:00.000' });
    expect(metaEfetiva(h, parseData('2024-01-06'))).toBe(2);
  });

  it('semana de criação: nunca abaixo de 1', () => {
    // criado domingo (restantes 1) → round(3 × 1/7) = 0 → max(1, 0) = 1
    const h = habito({ metaSemanal: 3, criadoEm: '2024-01-07T10:00:00.000' });
    expect(metaEfetiva(h, parseData('2024-01-07'))).toBe(1);
  });

  it('criado na segunda: meta integral já na 1ª semana', () => {
    const h = habito({ metaSemanal: 5, criadoEm: '2024-01-01T10:00:00.000' });
    expect(metaEfetiva(h, parseData('2024-01-03'))).toBe(5);
  });

  it('a partir da semana seguinte: meta integral', () => {
    const h = habito({ metaSemanal: 7, criadoEm: '2024-01-06T10:00:00.000' });
    expect(metaEfetiva(h, parseData('2024-01-08'))).toBe(7); // semana seguinte
  });
});

describe('streakAtual / melhorStreak (SPEC §5.3)', () => {
  it('conta cumpridos consecutivos recentes; neutro/perdido zeram', () => {
    const dias: Record<string, RegistroDia> = {
      '2024-01-01': dia('2024-01-01', 'cumprido'),
      '2024-01-02': dia('2024-01-02', 'perdido'),
      '2024-01-03': dia('2024-01-03', 'cumprido'),
      '2024-01-04': dia('2024-01-04', 'cumprido'),
      '2024-01-05': dia('2024-01-05', 'cumprido'),
    };
    expect(streakAtual(dias)).toBe(3);
  });

  it('streak atual zera se o dia mais recente não é cumprido', () => {
    const dias: Record<string, RegistroDia> = {
      '2024-01-01': dia('2024-01-01', 'cumprido'),
      '2024-01-02': dia('2024-01-02', 'neutro'),
    };
    expect(streakAtual(dias)).toBe(0);
  });

  it('melhorStreak = maior sequência histórica', () => {
    const dias: Record<string, RegistroDia> = {
      '2024-01-01': dia('2024-01-01', 'cumprido'),
      '2024-01-02': dia('2024-01-02', 'cumprido'),
      '2024-01-03': dia('2024-01-03', 'cumprido'),
      '2024-01-04': dia('2024-01-04', 'perdido'),
      '2024-01-05': dia('2024-01-05', 'cumprido'),
    };
    expect(melhorStreak(dias)).toBe(3);
    expect(streakAtual(dias)).toBe(1);
  });

  it('sem dias avaliados → 0', () => {
    expect(streakAtual({})).toBe(0);
    expect(melhorStreak({})).toBe(0);
  });
});
