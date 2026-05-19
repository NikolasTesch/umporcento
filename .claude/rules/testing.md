# Regra de Comportamento: Testes — "1%"

## Contexto

Curto prazo de MVP exige rede de segurança. Toda nova lógica/feature/correção
acompanha teste (Vitest + React Testing Library).

## Instruções

### 1. Mandato geral

- **NUNCA** entregue lógica de `domain/`, contexto ou feature sem teste correspondente.
- **SEMPRE** rode `npm run test` e `npm run lint` antes de concluir uma task.

### 2. Domínio (`src/domain/`)

- Testes unitários puros — sem mocks de React.
- Cobrir avaliação de dia, `metaEfetiva`, streaks, índice incremental vs. recálculo.
- Casos de borda: semana de criação, dias sem `RegistroDia`, hábito arquivado.

### 3. Estado (`src/state/`)

- Testar contextos com `@testing-library/react` (`renderHook`/provider).
- Mockar `StorageRepository` (implementação fake em memória).
- Validar debounce de autosave (1000ms) com timers falsos.

### 4. UI (`src/features/`, `src/components/`)

- Widget tests para componentes críticos e fluxos de navegação.
- Verificar estados loading/success/error e acessibilidade básica (roles/labels).

### Exemplo Aceito (domínio)

```ts
test('dia com obrigatório não concluído → perdido (×0.99)', () => {
  const av = avaliarDia(diaSemObrigatorio, [habitoEmRisco]);
  expect(av).toBe('perdido');
});
```

### Exemplo Recusado

> "Adicionei `semana.ts` com `metaEfetiva`." (sem `semana.test.ts`)
> "Nova tela de hábitos." (sem widget test validando render dos campos)

Caminho: testes ao lado do alvo (`*.test.ts(x)`); setup em `src/test/setup.ts`.
