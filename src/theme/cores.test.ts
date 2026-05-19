import { describe, expect, it } from 'vitest';
import { CORES_HABITO, CORES_HABITO_LISTA, classesCor } from './cores';

describe('cores dos hábitos (SPEC §4.3)', () => {
  it('expõe exatamente os 8 tokens fixos', () => {
    expect(CORES_HABITO_LISTA).toEqual([
      'azul',
      'roxo',
      'ciano',
      'verde',
      'lima',
      'amarelo',
      'laranja',
      'rosa',
    ]);
  });

  it('cada token mapeia para classes de fundo e texto', () => {
    for (const cor of CORES_HABITO_LISTA) {
      const classes = classesCor(cor);
      expect(classes).toMatch(/\bbg-\w+-100\b/);
      expect(classes).toMatch(/\btext-\w+-700\b/);
    }
  });

  it('verde usa emerald (distinto do verde semântico)', () => {
    expect(CORES_HABITO.verde).toContain('emerald');
    expect(CORES_HABITO.verde).not.toContain('green');
  });
});
