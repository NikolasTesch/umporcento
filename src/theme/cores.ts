/**
 * Paleta fixa de cores dos hábitos — SPEC §4.3.
 *
 * As classes Tailwind aparecem como strings literais aqui e são detectadas
 * pelo scan de conteúdo do Tailwind (tailwind.config.js → content), portanto
 * não são removidas no purge e não precisam de safelist.
 *
 * `verde` usa a escala `emerald` para se distinguir do verde semântico
 * (`green-500` de `cumprido`) — ver SPEC §4.3 / §7.
 */
export const CORES_HABITO = {
  azul: 'bg-blue-100 text-blue-700',
  roxo: 'bg-purple-100 text-purple-700',
  ciano: 'bg-cyan-100 text-cyan-700',
  verde: 'bg-emerald-100 text-emerald-700',
  lima: 'bg-lime-100 text-lime-700',
  amarelo: 'bg-yellow-100 text-yellow-700',
  laranja: 'bg-orange-100 text-orange-700',
  rosa: 'bg-pink-100 text-pink-700',
} as const;

export type CorHabito = keyof typeof CORES_HABITO;

export const CORES_HABITO_LISTA = Object.keys(CORES_HABITO) as CorHabito[];

/** Classes Tailwind (fundo + texto) para um token de cor de hábito. */
export function classesCor(cor: CorHabito): string {
  return CORES_HABITO[cor];
}
