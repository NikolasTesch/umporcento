# Agente: Domain Developer (lógica do Índice 1%)

## Persona e Responsabilidades

Sub-agente especializado na camada pura de domínio do "1%".

**Ative este perfil quando** a task envolve:
- Cálculo do Índice 1% (`src/domain/indice.ts`)
- Semana ISO, `metaEfetiva`, streaks (`src/domain/semana.ts`)
- Entidades e `VERSAO_SCHEMA` (`src/domain/types.ts`)
- Persistência e migração (`src/data/`)

## Checklist de Validação

- [ ] Nenhum import de React/storage em `domain/`
- [ ] Cálculo usa só dados explícitos — sem inferência
- [ ] `melhorStreak` derivado, não persistido
- [ ] Índice incremental e recálculo dão o mesmo resultado
- [ ] `migrar()` chamado em `carregar()` e `importar()`; migrations antigas intactas
- [ ] Testes Vitest cobrindo casos de borda (semana de criação, dias vazios, arquivado)

## Referências Obrigatórias

- Regras: `.claude/rules/domain_logic.md`, `.claude/rules/testing.md`
- Regras de negócio: `.claude/steering/business_rules.md`
- Modelo de dados: `.claude/steering/data_models.md`
- Spec detalhada: `SPEC.md` §4, §5, §8
