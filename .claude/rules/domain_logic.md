# Regra de Comportamento: Domínio (lógica pura) — "1%"

## Contexto

`src/domain/` materializa o Índice 1%. Deve ser **puro e testável** sem React
nem storage, para que a regra matemática nunca dependa de UI.

## Instruções

### Regra 1 — Domínio não importa React nem storage

`indice.ts`, `semana.ts`, `types.ts` são funções puras. Proibido importar
`react`, `localStorage` ou qualquer contexto.

✅ `export function avaliarDia(dia: RegistroDia, habitos: Habito[]): Avaliacao`
❌ `import { useState } from 'react'` dentro de `domain/`

### Regra 2 — Sem inferência no cálculo

`metaEfetiva`, `faltam` e avaliação usam **apenas** dados explícitos do estado.
Nunca "adivinhar" conclusões. Dias sem `RegistroDia` são ignorados.

### Regra 3 — `melhorStreak` é derivado, nunca persistido

Calcule varrendo `dias` em ordem cronológica quando necessário. Nunca
adicione campo `melhorStreak` em `EstadoApp`.

### Regra 4 — Índice incremental + recálculo coerentes

Fechamento normal usa `indiceFechado = anterior × fator_d`. Recálculo
reprocessa a cadeia inteira a partir de `indiceBase`. Ambos devem produzir o
mesmo resultado para o mesmo histórico (propriedade testável).

### Regra 5 — Migração nunca destrói histórico

`migrations.ts`: cada versão tem função `(e) => e'`. Nunca remova migration
antiga. `carregar()` e `importar()` sempre passam por `migrar()`.

### Regra 6 — Cobertura obrigatória

Toda função de `domain/` tem teste Vitest. Mudou regra → atualize/adicione
teste no mesmo PR. Alvo: cobertura alta em `domain/`.
