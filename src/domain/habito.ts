/**
 * Regras puras de validação e ordenação de hábitos — SPEC §4.2.
 *
 * Sem React, sem storage. A construção (uuid, data) fica no HabitosContext;
 * aqui só validação e cálculo de ordem, para serem 100% testáveis.
 */
import type { Habito, Periodo } from './types';

export const LIMITE_NOME = 40;
export const META_MIN = 1;
export const META_MAX = 7;

/** Retorna mensagem de erro ou `null` se o nome é válido (1..40 chars). */
export function validarNome(nome: string): string | null {
  const limpo = nome.trim();
  if (limpo.length === 0) return 'Informe um nome para o hábito.';
  if (limpo.length > LIMITE_NOME) {
    return `O nome deve ter no máximo ${LIMITE_NOME} caracteres.`;
  }
  return null;
}

/** Retorna mensagem de erro ou `null` se a meta semanal é válida (1..7). */
export function validarMeta(meta: number): string | null {
  if (!Number.isInteger(meta) || meta < META_MIN || meta > META_MAX) {
    return `A meta semanal deve ser um inteiro entre ${META_MIN} e ${META_MAX}.`;
  }
  return null;
}

export interface EntradaHabito {
  nome: string;
  periodo: Periodo;
  metaSemanal: number;
}

/** Primeiro erro encontrado nos campos da entrada, ou `null`. */
export function validarEntradaHabito(entrada: EntradaHabito): string | null {
  return validarNome(entrada.nome) ?? validarMeta(entrada.metaSemanal);
}

/**
 * Próxima `ordem` para um novo hábito no período: `max(ordem) + 1` entre os
 * hábitos não arquivados do período, ou `0` se não houver — SPEC §4.2.
 */
export function proximaOrdem(habitos: Habito[], periodo: Periodo): number {
  const ordens = habitos.filter((h) => !h.arquivado && h.periodo === periodo).map((h) => h.ordem);
  return ordens.length === 0 ? 0 : Math.max(...ordens) + 1;
}
