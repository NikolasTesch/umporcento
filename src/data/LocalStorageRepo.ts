/**
 * Implementação `localStorage` do contrato de persistência — SPEC §8.1.
 *
 * Tudo sob a chave raiz `umporcento:v1`. `carregar()` é tolerante a dados
 * corrompidos (retorna `null`); `importar()` valida + migra antes de aceitar
 * e nunca sobrescreve o estado atual com JSON inválido.
 */
import { migrar } from './migrations';
import type { StorageRepository } from './StorageRepository';
import type { EstadoApp } from '@/domain/types';

export const CHAVE_RAIZ = 'umporcento:v1';

export class LocalStorageRepo implements StorageRepository {
  constructor(private readonly storage: Storage = window.localStorage) {}

  async carregar(): Promise<EstadoApp | null> {
    const bruto = this.storage.getItem(CHAVE_RAIZ);
    if (bruto == null) return null;
    try {
      return migrar(JSON.parse(bruto));
    } catch {
      // Dados corrompidos ou schema irrecuperável: fallback seguro (SPEC §8.5).
      return null;
    }
  }

  async salvar(estado: EstadoApp): Promise<void> {
    this.storage.setItem(CHAVE_RAIZ, JSON.stringify(estado));
  }

  async exportar(): Promise<string> {
    const bruto = this.storage.getItem(CHAVE_RAIZ);
    return bruto ?? '';
  }

  async importar(json: string): Promise<EstadoApp> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Arquivo inválido: não é um JSON válido');
    }
    const estado = migrar(parsed); // valida + migra; lança se inválido
    await this.salvar(estado);
    return estado;
  }
}
