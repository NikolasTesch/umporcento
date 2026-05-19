import { describe, expect, it } from 'vitest';
import { ICONES, ICONES_LISTA, iconePor } from './icones';

describe('ícones curados (SPEC §4.4)', () => {
  it('expõe ~24 ícones', () => {
    expect(ICONES_LISTA.length).toBeGreaterThanOrEqual(20);
    expect(ICONES_LISTA.length).toBeLessThanOrEqual(28);
  });

  it('todas as chaves resolvem para um componente', () => {
    for (const nome of ICONES_LISTA) {
      expect(typeof ICONES[nome]).not.toBe('undefined');
      expect(iconePor(nome)).toBe(ICONES[nome]);
    }
  });

  it('chave desconhecida ou ausente → null', () => {
    expect(iconePor('inexistente')).toBeNull();
    expect(iconePor(undefined)).toBeNull();
  });
});
