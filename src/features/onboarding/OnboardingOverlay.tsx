/**
 * Onboarding — SPEC §6.0 / §6.5.
 *
 * 4 telas curtas, puláveis a qualquer momento. A última tem CTA para criar o
 * primeiro hábito (abre o modal de hábito). Exibido no primeiro acesso e
 * reaberto via Configurações; sempre marca `onboardingConcluido` ao fechar.
 */
import { useEffect, useRef, useState } from 'react';
import { Sparkles, TrendingUp, X } from 'lucide-react';
import { usePreferencias } from '@/state/PreferenciasContext';
import { HabitoFormModal } from '@/features/habitos/HabitoFormModal';

const FATOR_EXEMPLO = (1.01 ** 30).toFixed(2).replace('.', ',');

interface Passo {
  titulo: string;
  corpo: React.ReactNode;
}

const PASSOS: Passo[] = [
  {
    titulo: 'Melhore 1% por dia',
    corpo: (
      <>
        Pequenas melhorias diárias se acumulam. Não é sobre grandes saltos — é sobre{' '}
        <strong>consistência</strong> que compõe ao longo do tempo.
      </>
    ),
  },
  {
    titulo: 'Como o índice funciona',
    corpo: (
      <>
        Cada dia <strong>cumprido</strong> multiplica seu índice por <strong>×1,01</strong>; um dia{' '}
        <strong>perdido</strong>, por <strong>×0,99</strong>; um dia <strong>neutro</strong>, por
        ×1,00.
        <br />
        <br />
        30 dias cumpridos → <strong>{FATOR_EXEMPLO}x</strong>.
      </>
    ),
  },
  {
    titulo: 'Cumprido, perdido, neutro',
    corpo: (
      <>
        <strong>Cumprido:</strong> todos os hábitos obrigatórios do dia feitos.{' '}
        <strong>Perdido:</strong> faltou um obrigatório. <strong>Neutro:</strong> nada marcado e
        nada cobrado. Dias cumpridos seguidos formam seu <strong>streak</strong> — neutro ou perdido
        zeram a sequência.
      </>
    ),
  },
  {
    titulo: 'Comece agora',
    corpo: (
      <>Crie seu primeiro hábito. Comece pequeno: algo que você consiga manter todos os dias.</>
    ),
  },
];

export function OnboardingOverlay() {
  const { mostrarOnboarding, concluirOnboarding } = usePreferencias();
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState(0);
  const [criandoHabito, setCriandoHabito] = useState(false);
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mostrarOnboarding) {
      setAberto(true);
      setPasso(0);
    }
  }, [mostrarOnboarding]);

  useEffect(() => {
    if (!aberto) return;
    painelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finalizar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  function finalizar() {
    concluirOnboarding();
    setAberto(false);
    setPasso(0);
  }

  function criarPrimeiro() {
    concluirOnboarding();
    setCriandoHabito(true);
  }

  if (!aberto) return null;

  const passoAtual = PASSOS[passo]!;
  const ultimo = passo === PASSOS.length - 1;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div
          ref={painelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Boas-vindas ao 1%"
          tabIndex={-1}
          className="w-full max-w-md rounded-2xl bg-white p-6 outline-none dark:bg-gray-900"
        >
          <div className="mb-4 flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
              {passo === 1 ? (
                <TrendingUp className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <button
              type="button"
              onClick={finalizar}
              aria-label="Pular introdução"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {passoAtual.titulo}
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {passoAtual.corpo}
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            {PASSOS.map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all ${
                  i === passo
                    ? 'w-6 bg-gray-900 dark:bg-gray-100'
                    : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            {passo > 0 && (
              <button
                type="button"
                onClick={() => setPasso((p) => p - 1)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                Voltar
              </button>
            )}
            {ultimo ? (
              <button
                type="button"
                onClick={criarPrimeiro}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
              >
                Criar primeiro hábito
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPasso((p) => p + 1)}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
              >
                Próximo
              </button>
            )}
          </div>

          {!ultimo && (
            <button
              type="button"
              onClick={finalizar}
              className="mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Pular
            </button>
          )}
        </div>
      </div>

      {criandoHabito && (
        <HabitoFormModal
          aberto={criandoHabito}
          onFechar={() => {
            setCriandoHabito(false);
            setAberto(false);
          }}
        />
      )}
    </>
  );
}
