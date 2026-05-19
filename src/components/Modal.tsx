/**
 * Modal acessível reutilizável.
 *
 * Fecha com Escape, foca o conteúdo ao abrir, bloqueia o scroll do body e
 * marca `role="dialog"` + `aria-modal` (SPEC §7 / §9.2).
 */
import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

export function Modal({ aberto, titulo, onFechar, children }: ModalProps) {
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', onKey);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    painelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = anterior;
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onFechar}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 outline-none dark:bg-gray-900 sm:max-w-md sm:rounded-2xl"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}
