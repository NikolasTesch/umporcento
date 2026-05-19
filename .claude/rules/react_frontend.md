# Regra de Comportamento: React Frontend / UI — "1%"

## Contexto

Manter a UI consistente, acessível e fiel ao design system minimalista do
"1%", consumindo estado dos contextos sem reimplementar regra de negócio.

## Instruções

### Regra 1 — Cores/ícones SOMENTE via tokens de `src/theme/`

✅ `<span className={classesCor(habito.cor ?? 'azul')}>`
❌ `<span className="bg-[#3b82f6]">` · `style={{ color: '#dd0b0e' }}`

8 cores de hábito em `theme/cores.ts`. Semânticas: `cumprido=green-500`,
`perdido=red-500`, `neutro=gray-400`. `verde` usa `emerald` (distinto do
verde semântico).

### Regra 2 — Componente não acessa storage nem recalcula índice

UI lê do contexto e renderiza. Cálculo vem de `domain/` via contexto.

### Regra 3 — Feedback visual obrigatório

Toda ação tem loading, success e error visíveis. Nunca UI silenciosa.

### Regra 4 — Acessibilidade AA

Contraste AA · alvos de toque ≥ 44px · navegação por teclado em checkbox e
modais · `aria-label` nos controles · `aria-grabbed` no drag-and-drop.

### Regra 5 — Drag-and-drop via @dnd-kit

Reordenação de hábitos usa `@dnd-kit/sortable`, somente dentro do mesmo
período. Persistir nova `ordem` via `HabitosContext`.

### Regra 6 — Navegação via React Router v6

Rotas: `/` `/habitos` `/estatisticas` `/reflexoes`. Configurações é **modal**,
sem rota. Use `<Link>`/`useNavigate`, não manipulação manual de `history`.

### Regra 7 — Separar features

Cada feature em seu diretório `src/features/<nome>/`. UI compartilhada em
`src/components/`. Não vazar componente específico de feature para outra.
