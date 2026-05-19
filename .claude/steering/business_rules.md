# Steering — Regras de Negócio (Índice 1%)

Detalhe completo: [SPEC.md §5](../../SPEC.md). Resumo operacional:

## Avaliação diária (para cada hábito ativo com `criadoEm` ≤ D)

- `metaEfetiva(D)` = `metaSemanal` integral, exceto na semana de criação →
  `max(1, round(metaSemanal × diasRestantesDesdeCriacao / 7))`.
- `feitasNaSemanaAteD` = conclusões de segunda até D (incl.).
- `diasRestantesIncluindoD` = D até domingo (incl.).
- `faltam = max(0, metaEfetiva − feitasNaSemanaAteD)`.

Estados no dia D:
- **Em dia:** `faltam == 0` — não pressiona.
- **Em risco:** `faltam == diasRestantesIncluindoD` — **obrigatório hoje**.
- **Perdido na semana:** `faltam > diasRestantesIncluindoD` — irrecuperável.

## Avaliação do dia D

- **`perdido`** (`×0.99`) — ≥1 hábito *perdido na semana* **ou** obrigatório não concluído.
- **`cumprido`** (`×1.01`) — todos obrigatórios concluídos e nenhum perdido na
  semana (inclui caso sem obrigatórios mas com ≥1 hábito marcado).
- **`neutro`** (`×1.00`) — sem obrigatórios e nenhum hábito marcado.

## Cálculo do Índice

```
indice = indiceBase × Π fator_d   (todo d fechado com RegistroDia)
fator_d ∈ {1.01, 0.99, 1.00}
```

- **Incremental:** ao fechar dia, `indiceFechado = anterior × fator_d`. Índice
  atual = `indiceFechado` do último dia fechado (sem iterar tudo).
- **Recálculo** (§5.4): reprocessa a cadeia inteira.
- Hoje não entra até fechar; UI mostra **projeção** ("se fechar agora: …").

## Streaks

- `streakAtual`: sequência de dias `cumprido` consecutivos até hoje.
- `melhorStreak`: derivado varrendo `dias` cronologicamente — nunca persistido.
- Dia `neutro` **zera** o streak (exige constância), mas mantém o índice.

## Ciclo de vida do hábito

`ativo → arquivado` (soft delete, `arquivado: true`). Nunca deletar.
