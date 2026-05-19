import { describe, expect, it } from 'vitest';
import { migrar, validarEstado } from './migrations';
import { estadoInicial } from '@/domain/types';

describe('validarEstado (SPEC §8.1)', () => {
  it('aceita um estado bem-formado', () => {
    const e = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    expect(validarEstado(e)).toEqual(e);
  });

  it('rejeita estado com tipo inválido', () => {
    const e = { ...estadoInicial(), indiceBase: 'x' };
    expect(() => validarEstado(e)).toThrow(/inválido/i);
  });

  it('rejeita metaSemanal fora de 1..7', () => {
    const e = estadoInicial();
    e.habitos.push({
      id: 'h1',
      nome: 'X',
      periodo: 'manha',
      metaSemanal: 9,
      ordem: 0,
      arquivado: false,
      criadoEm: '2024-01-01T00:00:00.000',
    });
    expect(() => validarEstado(e)).toThrow();
  });
});

describe('migrar (SPEC §8.3)', () => {
  it('identidade na versão base e revalida', () => {
    const e = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    expect(migrar(e)).toEqual(e);
  });

  it('rejeita não-objeto', () => {
    expect(() => migrar('texto')).toThrow(/não é um objeto/i);
    expect(() => migrar(null)).toThrow(/não é um objeto/i);
  });

  it('rejeita versão ausente ou inválida', () => {
    expect(() => migrar({ habitos: [] })).toThrow(/versão/i);
    expect(() => migrar({ versao: 0 })).toThrow(/versão/i);
  });

  it('versão já igual ou acima do schema não dispara migration', () => {
    const e = { ...estadoInicial(new Date('2024-01-01T00:00:00.000')), versao: 1 };
    expect(migrar(e)).toEqual(e);
  });
});
