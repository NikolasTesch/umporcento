# Regra de Comportamento: Estado / Contextos — "1%"

## Contexto

O estado é orquestrado por **Contextos separados por domínio**. Cada contexto
isola uma responsabilidade e conversa com `domain/` (puro) e `data/` (storage).

## Instruções

### Regra 1 — Um contexto por domínio

| Contexto | Responsabilidade |
|---|---|
| `HabitosContext` | `habitos[]`, criar, editar, arquivar, reordenar |
| `DiaContext` | `dias{}`, marcar/desmarcar, reflexão (debounce 1000ms), fechar dia, projeção |
| `PreferenciasContext` | `tema`, `onboardingConcluido`, toggle tema, abrir onboarding |

Nunca misture responsabilidades num único contexto "AppContext".

### Regra 2 — Contexto não contém regra de negócio

Cálculo do índice/streak/avaliação fica em `domain/`. O contexto orquestra:
chama domínio, persiste via repositório, expõe estado para a UI.

### Regra 3 — Persistência só via StorageRepository

✅ `await repo.salvar(estado)`
❌ `localStorage.setItem('umporcento:v1', JSON.stringify(estado))` num contexto

### Regra 4 — Autosave da reflexão com debounce 1000ms

Salvar reflexão somente 1000ms após a última tecla. Não salvar a cada caractere.

### Regra 5 — Estado expõe loading/erro

Contextos que carregam/persistem expõem flags para a UI dar feedback
(loading/success/error). Nunca falhar em silêncio.

### Regra 6 — Error boundaries

Falha de contexto não derruba o app inteiro: usar error boundary por área de
feature (ver SPEC §8.5).
