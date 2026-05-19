# Skill: /start-session

## Descrição

Ritual de início de sessão do projeto "1%": carrega o contexto mínimo e
reporta o estado do roadmap, sem reler `SPEC.md`/`README.md` inteiros.

## Trigger

`/start-session` · "inicie a sessão" · "o que está pendente?".

## Processo do Agente (Workflow)

1. **Constituição:** ler `CLAUDE.md` (do projeto `umporcento/`, não o pai Cadife).
2. **Steering:** ler `.claude/steering/product.md`, `tech.md`, `structure.md`.
3. **Regras ativas:** ler `.claude/rules/` (exceto `_template_command.md`).
4. **Estado:** verificar o Roadmap em `README.md` (`## 🗺️ Roadmap`) e o
   `git log`/`git status` para inferir o milestone em andamento.
5. **Reportar:**

```
=== ESTADO DA SESSÃO — "1%" ===
Milestone atual: M1 — Core lógico (Índice 1%)
Próximo passo sugerido: implementar domain/indice.ts + testes
Pendências de qualidade: <lint/test/build se aplicável>
```

## Restrições

- Apenas leitura — não modificar arquivos no `start-session`.
- Não consultar nem aplicar o `CLAUDE.md` do diretório pai (projeto Cadife).
- Não assumir milestone automaticamente — confirmar com o dev se ambíguo.
