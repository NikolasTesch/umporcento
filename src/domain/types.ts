/**
 * Entidades do domínio — SPEC §4.1.
 *
 * `CorHabito` é reexportada de `theme/cores.ts` (fonte única dos 8 tokens,
 * SPEC §4.3) para evitar duplicação do union.
 */
import type { CorHabito } from '@/theme/cores';

export type { CorHabito };

/** Versão atual do schema persistido. Incrementar a cada migração (SPEC §8.3). */
export const VERSAO_SCHEMA = 1;

export type Periodo = 'manha' | 'tarde' | 'noite';

export const PERIODOS: readonly Periodo[] = ['manha', 'tarde', 'noite'] as const;

/** Avaliação congelada de um dia fechado — SPEC §5.1. */
export type Avaliacao = 'cumprido' | 'perdido' | 'neutro';

export interface Habito {
  id: string; // crypto.randomUUID()
  nome: string; // 1..40 chars (SPEC §4.2)
  periodo: Periodo;
  metaSemanal: number; // 1..7
  ordem: number; // posição dentro do período (drag-and-drop)
  cor?: CorHabito;
  icone?: string; // nome de ícone lucide (SPEC §4.4)
  arquivado: boolean; // soft-delete — nunca remover
  criadoEm: string; // ISO datetime (hora local)
}

export interface RegistroDia {
  data: string; // 'YYYY-MM-DD' (hora local)
  habitosConcluidos: string[]; // ids de Habito marcados nesse dia
  reflexao: string; // ≤ 1000 chars (SPEC §4.2)
  avaliacao?: Avaliacao; // congelada ao fechar o dia
  indiceFechado?: number; // snapshot incremental do índice (SPEC §5.2)
}

export type Tema = 'claro' | 'escuro';

export interface Preferencias {
  tema: Tema;
  onboardingConcluido: boolean;
}

export interface EstadoApp {
  versao: number;
  habitos: Habito[];
  dias: Record<string, RegistroDia>; // chave = 'YYYY-MM-DD'
  indiceBase: number; // começa em 1.0 (= 100%)
  preferencias: Preferencias;
  criadoEm: string; // ISO datetime (hora local)
}

/** Estado inicial de uma instalação nova (SPEC §4.1). */
export function estadoInicial(agora: Date = new Date()): EstadoApp {
  return {
    versao: VERSAO_SCHEMA,
    habitos: [],
    dias: {},
    indiceBase: 1.0,
    preferencias: {
      tema: 'claro',
      onboardingConcluido: false,
    },
    criadoEm: agora.toISOString(),
  };
}
