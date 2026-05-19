/**
 * Helpers de semana ISO, meta efetiva e streaks — SPEC §4.2, §5.1, §5.3, §8.2.
 *
 * Funções puras: sem React, sem storage. Toda lógica de "dia" usa a hora
 * local do dispositivo, sem normalização UTC (SPEC §3). A semana ISO começa
 * na segunda-feira.
 */
import type { Avaliacao, Habito, RegistroDia } from './types';

/** Chave canônica 'YYYY-MM-DD' a partir de uma Date em hora local. */
export function chaveData(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Parseia 'YYYY-MM-DD' para uma Date local à meia-noite (sem UTC). */
export function parseData(chave: string): Date {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return new Date(ano ?? 1970, (mes ?? 1) - 1, dia ?? 1);
}

/** Dia ISO da semana: segunda = 1 … domingo = 7. */
export function diaIso(d: Date): number {
  return ((d.getDay() + 6) % 7) + 1;
}

/** Segunda-feira da semana ISO que contém `d` (Date local à meia-noite). */
export function inicioSemanaIso(d: Date): Date {
  const offset = diaIso(d) - 1;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

/** Dias de `d` até o domingo da mesma semana, incluindo `d`. Domingo = 1. */
export function diasRestantesIncluindo(d: Date): number {
  return 8 - diaIso(d);
}

/** Verdadeiro se ambas as datas caem na mesma semana ISO. */
export function mesmaSemanaIso(a: Date, b: Date): boolean {
  return chaveData(inicioSemanaIso(a)) === chaveData(inicioSemanaIso(b));
}

/**
 * Meta efetiva do hábito na data de referência — SPEC §4.2 / §5.1.
 *
 * Na semana de criação a meta é proporcional aos dias restantes (incl. o dia
 * de criação): `max(1, round(metaSemanal × diasRestantes / 7))`. A partir da
 * semana seguinte usa-se `metaSemanal` integral.
 */
export function metaEfetiva(habito: Habito, dataRef: Date): number {
  const criado = parseData(chaveData(new Date(habito.criadoEm)));
  if (!mesmaSemanaIso(criado, dataRef)) {
    return habito.metaSemanal;
  }
  const restantes = diasRestantesIncluindo(criado);
  return Math.max(1, Math.round((habito.metaSemanal * restantes) / 7));
}

/** Chaves 'YYYY-MM-DD' de `inicio` até `fim` (inclusive), em ordem. */
export function chavesEntre(inicio: Date, fim: Date): string[] {
  const chaves: string[] = [];
  const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  while (chaveData(cursor) <= chaveData(fim)) {
    chaves.push(chaveData(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return chaves;
}

/** Registros com `avaliacao` congelada, ordenados por data ascendente. */
function diasAvaliados(dias: Record<string, RegistroDia>): RegistroDia[] {
  return Object.values(dias)
    .filter((r): r is RegistroDia & { avaliacao: Avaliacao } => r.avaliacao != null)
    .sort((a, b) => a.data.localeCompare(b.data));
}

/**
 * Sequência de dias `cumprido` consecutivos mais recentes — SPEC §5.3.
 * `neutro` e `perdido` zeram. Derivado na hora, nunca persistido.
 */
export function streakAtual(dias: Record<string, RegistroDia>): number {
  const avaliados = diasAvaliados(dias);
  let streak = 0;
  for (let i = avaliados.length - 1; i >= 0; i--) {
    if (avaliados[i]?.avaliacao === 'cumprido') {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Maior sequência histórica de `cumprido` — SPEC §5.3.
 * Uma única passagem cronológica. Derivado na hora, nunca persistido.
 */
export function melhorStreak(dias: Record<string, RegistroDia>): number {
  let melhor = 0;
  let atual = 0;
  for (const r of diasAvaliados(dias)) {
    if (r.avaliacao === 'cumprido') {
      atual += 1;
      melhor = Math.max(melhor, atual);
    } else {
      atual = 0;
    }
  }
  return melhor;
}
