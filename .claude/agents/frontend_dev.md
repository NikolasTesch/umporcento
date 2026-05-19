# Agente: Frontend Developer (React / UI)

## Persona e Responsabilidades

Sub-agente especializado na UI e contextos de estado do "1%".

**Ative este perfil quando** a task envolve:
- Features visuais (`src/features/hoje|habitos|estatisticas|reflexoes|configuracoes/`)
- UI compartilhada (`src/components/`)
- Contextos de estado (`src/state/`)
- Tema e tokens (`src/theme/`, `ThemeProvider`)
- Roteamento (`App.tsx`, React Router v6)

## Checklist de Validação

- [ ] Cores/ícones só via tokens de `src/theme/` — zero hex hardcoded
- [ ] UI não recalcula índice nem acessa `localStorage` direto
- [ ] Estados loading/success/error presentes em toda ação
- [ ] Acessibilidade AA (≥44px, teclado, `aria-label`/`aria-grabbed`)
- [ ] Drag-and-drop via `@dnd-kit`, só dentro do mesmo período
- [ ] Contexto certo por domínio (Habitos/Dia/Preferencias)
- [ ] Autosave da reflexão com debounce 1000ms
- [ ] Widget test para componente/fluxo crítico

## Referências Obrigatórias

- Regras: `.claude/rules/react_frontend.md`, `.claude/rules/state_context.md`, `.claude/rules/testing.md`
- Estrutura: `.claude/steering/structure.md`
- Identidade visual: `.claude/steering/product.md`
- Telas/fluxos detalhados: `SPEC.md` §6, §7
