/**
 * Tela Hoje (rota `/`) — SPEC §6.1.
 *
 * Cabeçalho (data, Índice 1%, streak), badge de projeção, hábitos em 3
 * seções colapsáveis por período com progresso semanal, e reflexão do dia
 * com autosave (1000ms) e contador a partir de 900 chars.
 */
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { classesCor } from '@/theme/cores';
import { iconePor } from '@/theme/icones';
import { parseData } from '@/domain/semana';
import { LIMITE_REFLEXAO, useDia } from '@/state/DiaContext';
import { useHabitos } from '@/state/HabitosContext';
import { PERIODOS, type Habito, type Periodo } from '@/domain/types';

const ROTULO_PERIODO: Record<Periodo, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function LinhaHabito({ habito }: { habito: Habito }) {
  const { marcado, alternar, statusDe } = useDia();
  const status = statusDe(habito);
  const concluido = marcado(habito.id);
  const Icone = iconePor(habito.icone);
  const metaBatida = status.faltam === 0 && status.feitas >= status.meta;

  return (
    <li>
      <label
        className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
          concluido
            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
        }`}
      >
        <input
          type="checkbox"
          checked={concluido}
          onChange={() => void alternar(habito.id)}
          aria-label={`Marcar ${habito.nome} como concluído hoje`}
          className="h-6 w-6 shrink-0 rounded accent-emerald-600"
        />
        {habito.cor ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${classesCor(habito.cor)}`}
          >
            {Icone && <Icone className="h-4 w-4" aria-hidden="true" />}
          </span>
        ) : (
          Icone && <Icone className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-sm font-medium ${
              concluido
                ? 'text-gray-500 line-through dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {habito.nome}
          </span>
          <span className="text-xs text-gray-500">
            {status.feitas}/{status.meta} nesta semana
          </span>
        </span>
        {status.estado === 'obrigatorio' && !concluido && (
          <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
            hoje
          </span>
        )}
        {metaBatida && (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            semana
          </span>
        )}
      </label>
    </li>
  );
}

export function HojeScreen() {
  const { habitos, carregando: carregandoHabitos } = useHabitos();
  const { hoje, carregando, reflexao, editarReflexao, reflexaoSalva, projecao, indice, streak } =
    useDia();
  const [colapsado, setColapsado] = useState<Record<Periodo, boolean>>({
    manha: false,
    tarde: false,
    noite: false,
  });

  const porPeriodo = useMemo(() => {
    const mapa: Record<Periodo, Habito[]> = { manha: [], tarde: [], noite: [] };
    for (const h of habitos) if (!h.arquivado) mapa[h.periodo].push(h);
    for (const p of PERIODOS) mapa[p].sort((a, b) => a.ordem - b.ordem);
    return mapa;
  }, [habitos]);

  const ativos = habitos.filter((h) => !h.arquivado);
  const pct = Math.round((indice - 1) * 100);
  const dataLonga = capitalizar(format(parseData(hoje), "EEEE, d 'de' MMMM", { locale: ptBR }));

  const projecaoTexto =
    projecao === 'cumprido'
      ? 'A caminho de cumprido'
      : projecao === 'perdido'
        ? 'Hoje está como perdido'
        : 'Marque um hábito para começar';
  const projecaoCor =
    projecao === 'cumprido'
      ? 'bg-emerald-100 text-emerald-700'
      : projecao === 'perdido'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600';

  if (carregando || carregandoHabitos) {
    return <p className="text-sm text-gray-500">Carregando…</p>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm text-gray-500">{dataLonga}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold tracking-tight">{indice.toFixed(2)}x</p>
            <p className="text-sm text-gray-500">
              {pct >= 0 ? '+' : ''}
              {pct}% desde o início
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight">{streak}</p>
            <p className="text-sm text-gray-500">dias seguidos</p>
          </div>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${projecaoCor}`}>
          {projecaoTexto}
        </span>
      </header>

      {ativos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="mb-3 text-sm text-gray-500">
            Nenhum hábito ainda. Crie o primeiro para começar a evoluir 1% por dia.
          </p>
          <Link
            to="/habitos"
            className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          >
            Criar hábito
          </Link>
        </div>
      ) : (
        PERIODOS.map((periodo) => {
          const lista = porPeriodo[periodo];
          if (lista.length === 0) return null;
          const aberto = !colapsado[periodo];
          return (
            <section key={periodo}>
              <button
                type="button"
                onClick={() => setColapsado((c) => ({ ...c, [periodo]: !c[periodo] }))}
                aria-expanded={aberto}
                className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {aberto ? (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
                {ROTULO_PERIODO[periodo]}
              </button>
              {aberto && (
                <ul className="space-y-2">
                  {lista.map((h) => (
                    <LinhaHabito key={h.id} habito={h} />
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}

      <section>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="reflexao"
            className="text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Reflexão do dia
          </label>
          {!reflexaoSalva ? (
            <span className="text-xs text-gray-400">Salvando…</span>
          ) : reflexao.length > 0 ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Salvo
            </span>
          ) : null}
        </div>
        <textarea
          id="reflexao"
          value={reflexao}
          onChange={(e) => editarReflexao(e.target.value)}
          maxLength={LIMITE_REFLEXAO}
          rows={4}
          placeholder="Como foi o seu dia? O que você aprendeu?"
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        {reflexao.length >= 900 && (
          <p className="mt-1 text-right text-xs text-gray-400">
            {reflexao.length}/{LIMITE_REFLEXAO}
          </p>
        )}
      </section>
    </div>
  );
}
