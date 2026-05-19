# Steering — Produto (Visão e Identidade)

## Identidade

**"1%" (umporcento)** — planner pessoal de hábitos. Filosofia: melhorar
**1% por dia** (efeito composto), inspirado em *Hábitos Atômicos*. O coração
emocional é o gráfico do **Índice 1%**.

## Princípios

1. **Simplicidade primeiro** — MVP enxuto, sem feature creep.
2. **Local-first** — 100% offline (`localStorage`); nuvem é evolução futura.
3. **Feedback imediato** — toda ação tem retorno visual claro.
4. **Motivação por composição** — visualizar o esforço acumulado.

## Não-objetivos (fora do MVP)

Conta/login/sync nuvem · multiusuário/social · push do SO · app mobile nativo
(é web responsiva) · integrações externas (calendário, wearables).

## Restrições críticas inegociáveis

1. Persistência **só** via `StorageRepository` — UI nunca toca `localStorage`.
2. `domain/` é **puro** — sem React, sem storage. Regras testáveis isoladamente.
3. Cores/ícones **só** via tokens de `src/theme/` — proibido hex hardcoded.
4. Arquivar nunca deleta (`arquivado: true`).
5. `carregar()`/`importar()` sempre passam por `migrar()`.
6. Toda mudança de lógica/feature acompanha teste.

## Identidade visual

Minimalismo de planner, legibilidade e calma. Tema claro/escuro persistido.
Tipografia Inter. Semânticas: `cumprido=green-500` · `perdido=red-500` ·
`neutro=gray-400`. Acessibilidade AA (contraste, alvo ≥ 44px, teclado).
