/**
 * Contrato de persistência — SPEC §8.1.
 *
 * Abstração trocável: hoje `localStorage`, no futuro nuvem. A validação e a
 * migração acontecem em `carregar()` e `importar()` (SPEC §8.1 / §8.3).
 */
import type { EstadoApp } from '@/domain/types';

export interface StorageRepository {
  /** Lê o estado persistido (migrado). `null` se ausente ou corrompido. */
  carregar(): Promise<EstadoApp | null>;
  /** Persiste o estado completo. */
  salvar(estado: EstadoApp): Promise<void>;
  /** Serializa o estado atual como JSON. */
  exportar(): Promise<string>;
  /** Valida + migra o JSON antes de aceitar; rejeita se inválido. */
  importar(json: string): Promise<EstadoApp>;
}
