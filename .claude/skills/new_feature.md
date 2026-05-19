# Skill: /new-feature

## Descrição

Inicia uma nova feature do "1%" com plano alinhado ao SPEC e às regras, antes
de escrever código.

## Trigger

`/new-feature <nome>` · "quero implementar [feature]".

## Processo do Agente (Workflow)

1. **Localizar no SPEC:** achar a seção correspondente em `SPEC.md` (§6 telas,
   §5 regras, §4 dados) e o milestone no Roadmap do `README.md`.
2. **Verificar escopo:** confirmar que está no MVP (ver `.claude/steering/product.md`
   §Não-objetivos). Fora do escopo → não criar, avisar o dev.
3. **Identificar camada e agente:** domínio/estado/UI → ler a regra e o agente
   correspondentes em `.claude/`.
4. **Apresentar plano:** passos técnicos granulares (incluindo arquivos a
   criar/editar e os **testes** correspondentes).
5. **Aguardar aprovação** do dev antes de escrever código.

## Restrições

- Nunca escrever código antes da aprovação do plano.
- Nunca criar feature fora do escopo do MVP.
- Todo plano inclui os testes (regra `.claude/rules/testing.md`).
- Mudança em regra de negócio deve citar a seção do `SPEC.md` que a embasa.
