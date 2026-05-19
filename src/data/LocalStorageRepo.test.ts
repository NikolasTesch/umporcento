import { beforeEach, describe, expect, it } from 'vitest';
import { CHAVE_RAIZ, LocalStorageRepo } from './LocalStorageRepo';
import { estadoInicial } from '@/domain/types';

function fakeStorage(): Storage {
  const mapa = new Map<string, string>();
  return {
    get length() {
      return mapa.size;
    },
    clear: () => mapa.clear(),
    getItem: (k: string) => mapa.get(k) ?? null,
    key: (i: number) => Array.from(mapa.keys())[i] ?? null,
    removeItem: (k: string) => void mapa.delete(k),
    setItem: (k: string, v: string) => void mapa.set(k, v),
  };
}

let storage: Storage;
let repo: LocalStorageRepo;

beforeEach(() => {
  storage = fakeStorage();
  repo = new LocalStorageRepo(storage);
});

describe('LocalStorageRepo (SPEC §8.1)', () => {
  it('carregar retorna null quando vazio', async () => {
    expect(await repo.carregar()).toBeNull();
  });

  it('round-trip salvar → carregar', async () => {
    const e = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    await repo.salvar(e);
    expect(await repo.carregar()).toEqual(e);
  });

  it('carregar retorna null com dados corrompidos (fallback SPEC §8.5)', async () => {
    storage.setItem(CHAVE_RAIZ, '{ não é json }');
    expect(await repo.carregar()).toBeNull();
  });

  it('carregar retorna null com schema inválido', async () => {
    storage.setItem(CHAVE_RAIZ, JSON.stringify({ versao: 1, lixo: true }));
    expect(await repo.carregar()).toBeNull();
  });

  it('exportar devolve o JSON persistido', async () => {
    const e = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    await repo.salvar(e);
    expect(JSON.parse(await repo.exportar())).toEqual(e);
  });

  it('importar válido valida, persiste e retorna o estado', async () => {
    const e = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    const importado = await repo.importar(JSON.stringify(e));
    expect(importado).toEqual(e);
    expect(await repo.carregar()).toEqual(e);
  });

  it('importar JSON inválido lança e não sobrescreve', async () => {
    const e = estadoInicial(new Date('2024-01-01T00:00:00.000'));
    await repo.salvar(e);
    await expect(repo.importar('{{{')).rejects.toThrow(/JSON/i);
    expect(await repo.carregar()).toEqual(e);
  });

  it('importar estado malformado lança antes de aceitar', async () => {
    await expect(repo.importar(JSON.stringify({ versao: 1, foo: 1 }))).rejects.toThrow(/inválido/i);
  });
});
