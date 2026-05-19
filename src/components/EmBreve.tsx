/** Placeholder para telas de marcos futuros (M3+). */
export function EmBreve({ titulo, marco }: { titulo: string; marco: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
      <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
        Em breve — {marco}.
      </p>
    </div>
  );
}
