/**
 * Instância padrão do repositório de persistência (SPEC §8.1).
 *
 * Os contextos aceitam um `StorageRepository` injetável (testes usam um fake);
 * em runtime usam este singleton sobre `localStorage`.
 */
import { LocalStorageRepo } from './LocalStorageRepo';
import type { StorageRepository } from './StorageRepository';

export const repo: StorageRepository = new LocalStorageRepo();
