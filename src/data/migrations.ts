/**
 * Migração de schema por versão — SPEC §8.3.
 *
 * `carregar()` e `importar()` sempre passam o dado bruto por `migrar()`.
 * Nunca remover uma migration do histórico: cada função transforma de N
 * para N+1.
 */
import { z } from 'zod';
import { VERSAO_SCHEMA, type EstadoApp } from '@/domain/types';

const habitoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  periodo: z.enum(['manha', 'tarde', 'noite']),
  metaSemanal: z.number().int().min(1).max(7),
  ordem: z.number().int().min(0),
  cor: z.enum(['azul', 'roxo', 'ciano', 'verde', 'lima', 'amarelo', 'laranja', 'rosa']).optional(),
  icone: z.string().optional(),
  arquivado: z.boolean(),
  criadoEm: z.string(),
});

const registroDiaSchema = z.object({
  data: z.string(),
  habitosConcluidos: z.array(z.string()),
  reflexao: z.string(),
  avaliacao: z.enum(['cumprido', 'perdido', 'neutro']).optional(),
  indiceFechado: z.number().optional(),
});

const estadoSchema = z.object({
  versao: z.number().int().min(1),
  habitos: z.array(habitoSchema),
  dias: z.record(registroDiaSchema),
  indiceBase: z.number(),
  preferencias: z.object({
    tema: z.enum(['claro', 'escuro']),
    onboardingConcluido: z.boolean(),
  }),
  criadoEm: z.string(),
});

/**
 * Valida a forma de um estado persistido. Lança `Error` descritivo se
 * inválido — nunca aceitar dados malformados (SPEC §8.1).
 */
export function validarEstado(raw: unknown): EstadoApp {
  const parsed = estadoSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Estado inválido: ${parsed.error.issues[0]?.message ?? 'formato desconhecido'}`,
    );
  }
  return parsed.data as EstadoApp;
}

/** Funções de migração indexadas pela versão de destino (N → versão N). */
const migrations: Record<number, (e: Record<string, unknown>) => Record<string, unknown>> = {
  1: (e) => e, // versão base
};

/**
 * Migra `raw` até `VERSAO_SCHEMA` aplicando as migrations em sequência,
 * depois valida o resultado final — SPEC §8.3.
 */
export function migrar(raw: unknown): EstadoApp {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Estado inválido: não é um objeto');
  }
  let estado = raw as Record<string, unknown>;
  let versao = estado.versao;
  if (typeof versao !== 'number' || !Number.isInteger(versao) || versao < 1) {
    throw new Error('Estado inválido: versão ausente ou inválida');
  }
  while (versao < VERSAO_SCHEMA) {
    const proxima = migrations[versao + 1];
    if (!proxima) {
      throw new Error(`Migration ausente para a versão ${versao + 1}`);
    }
    estado = proxima(estado);
    versao += 1;
    estado.versao = versao;
  }
  return validarEstado(estado);
}
