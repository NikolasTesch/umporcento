# Steering — Topologia e Nomenclatura

```
src/
  main.tsx
  App.tsx                   # rotas + composição de providers + tema
  theme/
    cores.ts                # CorHabito → classes Tailwind (8 tokens)
    icones.ts               # lista curada de ícones lucide (~24)
    ThemeProvider.tsx
  domain/                   # CAMADA PURA — sem React/storage, 100% testada
    types.ts                # entidades + VERSAO_SCHEMA
    indice.ts               # regras do Índice 1%
    semana.ts               # semana ISO, metaEfetiva, streaks
  data/                     # infraestrutura/persistência
    StorageRepository.ts    # interface (contrato)
    LocalStorageRepo.ts     # implementação localStorage
    migrations.ts           # migração por versão de schema
  state/                    # orquestração de estado React
    HabitosContext.tsx      # habitos[] + CRUD + reordenar
    DiaContext.tsx          # dias{} + marcar + reflexão + fechamento
    PreferenciasContext.tsx # tema + onboarding
  features/                 # módulos visuais
    hoje/ habitos/ estatisticas/ reflexoes/ configuracoes/
  components/               # UI compartilhada (Checkbox, Card, Modal, Toast…)
  test/                     # setup + helpers de teste
```

## Camadas e donos

| Camada | Diretório | Regra |
|---|---|---|
| Domínio (lógica pura) | `src/domain/` | `.claude/rules/domain_logic.md` |
| Estado / Contextos | `src/state/` | `.claude/rules/state_context.md` |
| UI / Features | `src/features/`, `src/components/` | `.claude/rules/react_frontend.md` |
| Persistência | `src/data/` | `.claude/rules/domain_logic.md` |
| Testes | colocados / `src/test/` | `.claude/rules/testing.md` |

## Nomenclatura

- Arquivos de componente React: `PascalCase.tsx`.
- Lógica/utilitários de domínio: `camelCase.ts`.
- Testes: `nomeDoArquivo.test.ts(x)` ao lado do alvo.
- Contextos: `XContext.tsx` expondo provider + hook `useX()`.
- Rotas: `/` (hoje), `/habitos`, `/estatisticas`, `/reflexoes`. Configurações = modal (sem rota).
