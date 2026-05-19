import { describe, expect, it } from 'vitest';
import {
  LIMITE_NOME,
  proximaOrdem,
  validarEntradaHabito,
  validarMeta,
  validarNome,
} from './habito';
import type { Habito } from './types';

function habito(parcial: Partial<Habito>): Habito {
  return {
    id: 'h',
    nome: 'X',
    periodo: 'manha',
    metaSemanal: 1,
    ordem: 0,
    arquivado: false,
    criadoEm: '2024-01-01T00:00:00.000',
    ...parcial,
  };
}

describe('validarNome (SPEC §4.2)', () => {
  it('rejeita vazio ou só espaços', () => {
    expect(validarNome('')).toMatch(/informe/i);
    expect(validarNome('   ')).toMatch(/informe/i);
  });

  it('rejeita acima de 40 chars', () => {
    expect(validarNome('a'.repeat(LIMITE_NOME + 1))).toMatch(/máximo/i);
  });

  it('aceita nome no limite', () => {
    expect(validarNome('a'.repeat(LIMITE_NOME))).toBeNull();
  });
});

describe('validarMeta (SPEC §4.2)', () => {
  it('rejeita fora de 1..7 e não inteiros', () => {
    expect(validarMeta(0)).not.toBeNull();
    expect(validarMeta(8)).not.toBeNull();
    expect(validarMeta(3.5)).not.toBeNull();
  });

  it('aceita limites', () => {
    expect(validarMeta(1)).toBeNull();
    expect(validarMeta(7)).toBeNull();
  });
});

describe('validarEntradaHabito', () => {
  it('retorna o primeiro erro (nome antes da meta)', () => {
    expect(validarEntradaHabito({ nome: '', periodo: 'manha', metaSemanal: 9 })).toMatch(
      /informe/i,
    );
  });

  it('null quando tudo válido', () => {
    expect(validarEntradaHabito({ nome: 'Ler', periodo: 'noite', metaSemanal: 5 })).toBeNull();
  });
});

describe('proximaOrdem (SPEC §4.2)', () => {
  it('0 quando o período está vazio', () => {
    expect(proximaOrdem([], 'manha')).toBe(0);
  });

  it('max(ordem) + 1 dentro do período, ignorando arquivados e outros períodos', () => {
    const habitos = [
      habito({ id: 'a', periodo: 'manha', ordem: 0 }),
      habito({ id: 'b', periodo: 'manha', ordem: 3 }),
      habito({ id: 'c', periodo: 'manha', ordem: 9, arquivado: true }),
      habito({ id: 'd', periodo: 'tarde', ordem: 7 }),
    ];
    expect(proximaOrdem(habitos, 'manha')).toBe(4);
    expect(proximaOrdem(habitos, 'noite')).toBe(0);
  });
});
