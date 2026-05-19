# CLAUDE.md — Projeto "1%" (umporcento)

> Este arquivo é a fonte de verdade da sessão para **este** projeto.
> É deliberadamente curto: tudo essencial está aqui para não reler `SPEC.md`
> (540 linhas) nem `README.md` a cada sessão.

## ⚠️ Escopo — leia primeiro

Existe um `CLAUDE.md` no diretório pai (`TESCH_DEV/`) que descreve o projeto
**Cadife Smart Travel** (FastAPI + Flutter + LangChain). **Ele NÃO se aplica
aqui.** Este projeto é independente: web app React local-first. Ignore as
regras de backend Python, webhook WhatsApp, JWT, Riverpod/Flutter e o ritual
de specs Cadife ao trabalhar em `umporcento/`.

## O que é

Planner pessoal de hábitos. Filosofia: melhorar **1% por dia** (efeito
composto). 100% offline, `localStorage`, PT-BR, tema claro/escuro.
Spec completa: [SPEC.md](SPEC.md) — consultar só quando precisar de detalhe
fino; o resumo abaixo cobre o dia a dia.

## Ritual de início de sessão

1. Ler este `CLAUDE.md` inteiro.
2. Ler `.claude/steering/` conforme a task (product · tech · structure ·
   data_models · business_rules).
3. Ler a regra da camada tocada em `.claude/rules/`.
4. Para tasks maiores, ativar o agente em `.claude/agents/` correspondente.
5. Não carregar nem aplicar o `CLAUDE.md` do diretório pai (projeto Cadife).

## Estrutura `.claude/`

```
.claude/
  settings.json          # allowlist de comandos (menos prompts)
  steering/              # contexto modular do projeto
    product.md tech.md structure.md data_models.md business_rules.md
  rules/                 # regras de comportamento por camada
    domain_logic.md state_context.md react_frontend.md testing.md
  agents/                # personas de sub-agente
    domain_dev.md frontend_dev.md test_dev.md auditor.md
  skills/                # comandos
    _template_command.md start_session.md new_feature.md fix-bug/SKILL.md
```

## Referência rápida

| Necessidade | Arquivo |
|---|---|
| Visão, princípios, escopo, identidade | `.claude/steering/product.md` |
| Stack, comandos, padrões de código | `.claude/steering/tech.md` |
| Topologia de pastas e nomenclatura | `.claude/steering/structure.md` |
| Entidades, schemas, contrato de storage | `.claude/steering/data_models.md` |
| Regras do Índice 1%, streaks, ciclo | `.claude/steering/business_rules.md` |
| Detalhe fino e fonte de verdade | `SPEC.md` |

## Stack

Vite · React 18 (function components + hooks) · TypeScript · Tailwind CSS ·
React Router v6 · Context API (separado por domínio) · `date-fns` (hora local,
semana ISO seg→dom, **sem UTC**) · `recharts` · `lucide-react` ·
`@dnd-kit` (drag-and-drop) · Vitest + React Testing Library · ESLint + Prettier · `zod`.

## Comandos

| Ação | Comando |
|---|---|
| Dev | `npm run dev` |
| Build (typecheck + vite) | `npm run build` |
| Testes | `npm run test` |
| Lint (0 warnings) | `npm run lint` |
| Format | `npm run format` |

## Arquitetura (camadas — não violar)

```
domain/   → lógica PURA, sem React/storage (indice.ts, semana.ts, types.ts) — 100% testada
data/     → StorageRepository (interface) + LocalStorageRepo + migrations.ts
state/    → HabitosContext · DiaContext · PreferenciasContext (1 contexto por domínio)
features/ → hoje · habitos · estatisticas · reflexoes · configuracoes
theme/    → cores.ts (tokens) · icones.ts · ThemeProvider
components/→ UI compartilhada
```

- UI nunca acessa `localStorage` direto — só via `StorageRepository`.
- `domain/` não importa React nem storage. Regras de negócio são funções puras.
- `carregar()` e `importar()` sempre passam por `migrar()`. Nunca remover migration antiga.

## Regras de negócio — Índice 1% (resumo)

- Índice inicia em `1.0`. Por dia fechado: `cumprido ×1.01` · `perdido ×0.99` · `neutro ×1.00`.
- Cálculo **incremental**: `indiceFechado = anterior × fator_d`. Recálculo (§5.4) reprocessa a cadeia.
- Hábito tem **meta semanal** (1–7×). "Em risco" = obrigatório hoje. "Perdido na semana" = irrecuperável.
- Hábito criado no meio da semana → meta proporcional aos dias restantes (SPEC §4.2/§5.1).
- Dia sem `RegistroDia` é ignorado no cálculo. `avaliacao` congela ao fechar.
- `melhorStreak` é **derivado** varrendo `dias`, nunca persistido.

## Convenções obrigatórias

- **Cores/ícones só via tokens** de `src/theme/` — proibido hex hardcoded em componentes.
  8 cores de hábito em `cores.ts`; semânticas: `cumprido=green-500`, `perdido=red-500`, `neutro=gray-400`.
- Arquivar nunca deleta: `arquivado: true` (soft delete). `nome` ≤ 40 chars · `reflexao` ≤ 1000.
- Autosave da reflexão com debounce **1000ms**.
- Toda ação tem feedback visual (loading/success/error).
- Acessibilidade AA: alvos ≥ 44px, navegação por teclado, `aria-label`.

## Testes (mandatório)

Toda mudança em `domain/`, lógica de estado ou feature acompanha teste
(Vitest + RTL) em `src/test/` ou colocado junto (`*.test.ts`). `domain/` exige
cobertura alta. Rodar `npm run test` e `npm run lint` antes de concluir.

## Roadmap (status em README §Roadmap)

M0 setup ✅ · M1 core lógico (índice) · M2 hábitos · M3 dashboard Hoje ·
M4 análises · M5 backup · M6 PWA/polish.
