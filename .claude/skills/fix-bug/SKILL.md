---
name: bug-fixer
description: |
  Diagnose and fix bugs in the "1%" (umporcento) React habit-tracker. Use when
  the user reports incorrect behavior, a failing test, a regression, or
  unexpected UI/state/index-calculation results. Covers root-cause analysis,
  minimal fix, and a regression test in the same change.
---

# Bug Fixer — "1%"

## Quando usar

Comportamento incorreto, teste quebrado, regressão, ou cálculo do Índice 1%
divergente do esperado.

## Workflow

1. **Reproduzir:** rodar `npm run test` (ou o teste específico) e/ou
   `npm run dev` para confirmar o sintoma.
2. **Localizar a camada:**
   - Cálculo errado → `src/domain/` (puro, testável isolado).
   - Estado/persistência inconsistente → `src/state/` ou `src/data/`.
   - Render/UX → `src/features/` ou `src/components/`.
3. **Causa-raiz:** identificar a origem real — não mascarar com workaround.
   Conferir contra `.claude/steering/business_rules.md` e `SPEC.md`.
4. **Fix mínimo:** alterar só o necessário; sem refactor oportunista.
5. **Teste de regressão:** adicionar teste que falha antes e passa depois,
   no mesmo PR (regra `.claude/rules/testing.md`).
6. **Verificar:** `npm run test` + `npm run lint` verdes; sem `console.log`.

## Restrições

- Não desativar/ignorar testes para "passar".
- Não persistir `melhorStreak` nem inferir dados para "consertar" o índice.
- Bug de regra de negócio: citar a seção do `SPEC.md` que define o correto.
