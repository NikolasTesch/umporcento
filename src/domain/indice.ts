/**
 * Regras do Índice 1% — SPEC §5.
 *
 * Funções puras: sem React, sem storage. O índice materializa o efeito
 * composto (dia cumprido ×1.01, perdido ×0.99, neutro ×1.00) e é calculado
 * de forma incremental via `indiceFechado` (SPEC §5.2).
 */
import type { Avaliacao, EstadoApp, Habito, RegistroDia } from './types';
import {
  chaveData,
  chavesEntre,
  diasRestantesIncluindo,
  inicioSemanaIso,
  metaEfetiva,
  parseData,
} from './semana';

export const FATOR: Record<Avaliacao, number> = {
  cumprido: 1.01,
  perdido: 0.99,
  neutro: 1.0,
};

export function fatorAvaliacao(av: Avaliacao): number {
  return FATOR[av];
}

export type EstadoHabito = 'em_dia' | 'obrigatorio' | 'perdido_na_semana';

export interface StatusHabito {
  meta: number; // metaEfetiva na data (SPEC §4.2)
  feitas: number; // conclusões na semana até a data (incl.)
  restantes: number; // dias de hoje até domingo (incl.)
  faltam: number; // max(0, meta − feitas)
  estado: EstadoHabito;
  concluido: boolean; // marcado especificamente nesse dia
}

/** Hábitos ativos (não arquivados) já existentes na data `chave`. */
function habitosAtivosEm(habitos: Habito[], chave: string): Habito[] {
  return habitos.filter((h) => !h.arquivado && chaveData(new Date(h.criadoEm)) <= chave);
}

function feitasNaSemanaAte(
  habito: Habito,
  dias: Record<string, RegistroDia>,
  data: string,
): number {
  const d = parseData(data);
  const chaves = chavesEntre(inicioSemanaIso(d), d);
  let total = 0;
  for (const c of chaves) {
    if (dias[c]?.habitosConcluidos.includes(habito.id)) total += 1;
  }
  return total;
}

/**
 * Situação semanal de um hábito num dia — base de badges e progresso da tela
 * Hoje (SPEC §5.1 / §6.1). Não congela nada.
 */
export function statusHabito(
  habito: Habito,
  dias: Record<string, RegistroDia>,
  data: string,
): StatusHabito {
  const d = parseData(data);
  const meta = metaEfetiva(habito, d);
  const feitas = feitasNaSemanaAte(habito, dias, data);
  const restantes = diasRestantesIncluindo(d);
  const faltam = Math.max(0, meta - feitas);
  let estado: EstadoHabito = 'em_dia';
  if (faltam > 0 && faltam > restantes) estado = 'perdido_na_semana';
  else if (faltam > 0 && faltam === restantes) estado = 'obrigatorio';
  const concluido = dias[data]?.habitosConcluidos.includes(habito.id) ?? false;
  return { meta, feitas, restantes, faltam, estado, concluido };
}

/**
 * Avalia o dia `data` em `cumprido | perdido | neutro` — SPEC §5.1.
 *
 * Não congela nada: usada tanto para fechar dias quanto para a projeção de
 * hoje (SPEC §5.2 / §6.1).
 */
export function avaliarDia(
  habitos: Habito[],
  dias: Record<string, RegistroDia>,
  data: string,
): Avaliacao {
  const ativos = habitosAtivosEm(habitos, data);
  const concluidos = dias[data]?.habitosConcluidos ?? [];

  let temPerdidoNaSemana = false;
  let temObrigatorio = false;
  let obrigatorioNaoConcluido = false;

  for (const h of ativos) {
    const { estado } = statusHabito(h, dias, data);
    if (estado === 'perdido_na_semana') {
      temPerdidoNaSemana = true;
    } else if (estado === 'obrigatorio') {
      temObrigatorio = true;
      if (!concluidos.includes(h.id)) obrigatorioNaoConcluido = true;
    }
  }

  if (temPerdidoNaSemana || obrigatorioNaoConcluido) return 'perdido';
  if (temObrigatorio) return 'cumprido';
  return concluidos.length > 0 ? 'cumprido' : 'neutro';
}

/** Índice atual: `indiceFechado` do último dia fechado, ou `indiceBase`. */
export function indiceAtual(estado: EstadoApp): number {
  let indice = estado.indiceBase;
  let ultimaChave = '';
  for (const r of Object.values(estado.dias)) {
    if (r.indiceFechado != null && r.data > ultimaChave) {
      ultimaChave = r.data;
      indice = r.indiceFechado;
    }
  }
  return indice;
}

/** Projeção do dia de hoje, sem congelar — SPEC §6.1. */
export function projecaoHoje(estado: EstadoApp, hoje: string): Avaliacao {
  return avaliarDia(estado.habitos, estado.dias, hoje);
}

function chavesComRegistroAntesDe(dias: Record<string, RegistroDia>, hoje: string): string[] {
  return Object.keys(dias)
    .filter((c) => c < hoje)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Fecha dias anteriores com `RegistroDia` mas sem `avaliacao`, em ordem
 * cronológica, atualizando `indiceFechado` de forma incremental — SPEC §5.4.
 * Dias já congelados são preservados. Retorna um novo estado (imutável).
 */
export function fecharDiasPendentes(estado: EstadoApp, hoje: string): EstadoApp {
  const dias = { ...estado.dias };
  let ultimoIndice = estado.indiceBase;
  for (const chave of chavesComRegistroAntesDe(dias, hoje)) {
    const registro = dias[chave];
    if (!registro) continue;
    if (registro.avaliacao != null && registro.indiceFechado != null) {
      ultimoIndice = registro.indiceFechado;
      continue;
    }
    const avaliacao = avaliarDia(estado.habitos, estado.dias, chave);
    const indiceFechado = ultimoIndice * fatorAvaliacao(avaliacao);
    dias[chave] = { ...registro, avaliacao, indiceFechado };
    ultimoIndice = indiceFechado;
  }
  return { ...estado, dias };
}

/**
 * Reprocessa toda a cadeia do zero, ignorando snapshots congelados — usado
 * pelo "Recalcular histórico" (SPEC §5.4). Retorna um novo estado.
 */
export function recalcular(estado: EstadoApp, hoje: string): EstadoApp {
  const dias = { ...estado.dias };
  let ultimoIndice = estado.indiceBase;
  for (const chave of chavesComRegistroAntesDe(dias, hoje)) {
    const registro = dias[chave];
    if (!registro) continue;
    const avaliacao = avaliarDia(estado.habitos, estado.dias, chave);
    const indiceFechado = ultimoIndice * fatorAvaliacao(avaliacao);
    dias[chave] = { ...registro, avaliacao, indiceFechado };
    ultimoIndice = indiceFechado;
  }
  return { ...estado, dias };
}
