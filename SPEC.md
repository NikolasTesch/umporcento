# Spec — Projeto "1%"

> Sistema de rotina e melhoria diária. Filosofia: melhorar **1% todos os dias**
> (efeito composto), inspirado em *Hábitos Atômicos*, *365 Hábitos* e afins.
> Versão da Spec: 1.3 — Data: 2026-05-18

---

## Changelog

| Versão | Data | Alterações |
|---|---|---|
| 1.0 | 2026-05-18 | Versão inicial |
| 1.1 | 2026-05-18 | Decisões validadas com o usuário (§12) |
| 1.2 | 2026-05-18 | Meta proporcional mid-week; migrations de schema; fuso horário; cálculo incremental; validação no `importar()`; dias sem RegistroDia; Configurações como modal; onboarding 4 telas; DoD com checklist |
| 1.3 | 2026-05-18 | Validação de inputs (§4.2); paleta de 8 cores (§4.3); drag-and-drop de hábitos (§4.1, §6.2); `melhorStreak` derivado (§5.3); debounce autosave 1000ms (§6.1); onboarding completo ao reabrir (§6.5); contextos separados por domínio (§8.4); error boundaries (§8.5); nome do arquivo exportado (§6.5); PWA em M6 (§10); abas simultâneas como limitação conhecida (§11); `@dnd-kit/core` na stack (§3) |

---

## 1. Visão Geral

Um **planner pessoal** em forma de aplicação web React, onde o usuário define
hábitos organizados por período do dia, marca o que cumpriu, escreve uma
reflexão diária e acompanha seu progresso através do **Índice 1%** — uma
métrica de crescimento composto que recompensa consistência e penaliza falhas.

**Objetivo central:** tornar visível e motivador o efeito do esforço diário
acumulado ao longo do tempo.

### 1.1 Princípios

1. **Simplicidade primeiro** — MVP enxuto, sem feature creep.
2. **Local-first** — funciona 100% offline; nuvem é evolução futura.
3. **Feedback imediato** — toda ação tem retorno visual claro.
4. **Motivação por composição** — o gráfico do Índice 1% é o coração emocional.

### 1.2 Não-objetivos (fora do MVP)

- Conta de usuário, login, sincronização em nuvem (arquitetado, não implementado).
- Multiusuário / compartilhamento social.
- Notificações push / lembretes do sistema operacional.
- App mobile nativo (é web responsiva).
- Integrações externas (calendário, wearables).

---

## 2. Decisões Fechadas

| Tema | Decisão |
|---|---|
| Persistência | **Local agora** (`localStorage`), arquitetado para nuvem futura |
| Funcionalidades MVP | Checklist diário · Streaks + Índice 1% · Reflexão diária · Estatísticas/gráficos |
| Stack | **Vite + React + Tailwind CSS** |
| Organização de hábitos | Por **período do dia**: Manhã / Tarde / Noite |
| Frequência do hábito | **Meta semanal** (X vezes por semana) |
| Métrica 1% | **Composto com decaimento**: dia cumprido `×1.01`, dia perdido `×0.99` |
| Idioma / Tema | **Português (PT-BR)** · alternância tema **claro/escuro** |
| Hábito criado no meio da semana | **Meta proporcional** aos dias restantes da semana de criação (ver §5.1) |
| Migração de schema | **Migrations automáticas** ao carregar, por versão (ver §8.3) |
| Fuso horário | **Hora local do dispositivo** — `date-fns` sem conversão UTC |
| Validação de inputs | Nome do hábito ≤ 40 chars · Reflexão ≤ 1000 chars |
| Paleta de cores | **8 cores fixas** com tokens nomeados (ver §4.3) |
| Ordenação de hábitos | **Drag-and-drop** dentro de cada período |
| `melhorStreak` | **Derivado na hora** — varre `dias`, sem persistir |
| Debounce autosave | **1000ms** após última tecla na reflexão |
| Onboarding reaberto | Reabre as **4 telas completas** |
| Arquitetura de estado | **Contextos separados** por domínio: Hábitos, Dia, Preferências |

---

## 3. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Build / Dev | Vite |
| UI | React 18 (function components + hooks) |
| Estilo | Tailwind CSS |
| Roteamento | React Router v6 |
| Estado | React Context separado por domínio + hooks (ver §8.4) |
| Persistência | Camada de repositório com `localStorage` (abstração trocável) |
| Datas | `date-fns` — **hora local do dispositivo**, sem conversão UTC |
| Gráficos | `recharts` |
| Ícones | `lucide-react` |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Testes | Vitest + React Testing Library |
| Lint/Format | ESLint + Prettier |
| Validação de schema | Validação manual ou `zod` (para `importar()` — ver §8.1) |

> **Idioma das datas:** semana ISO começa na **segunda-feira**.
>
> **Fuso horário:** toda lógica de "dia atual" e chaves `YYYY-MM-DD` usa
> `new Date()` do dispositivo, sem normalização UTC.

---

## 4. Modelo de Dados

Tudo persistido em `localStorage` sob a chave raiz `umporcento:v1`, através de
uma interface `StorageRepository` (ver §8) para permitir migração futura.

### 4.1 Entidades

```ts
type Periodo = 'manha' | 'tarde' | 'noite';

// Tokens de cor disponíveis — ver §4.3
type CorHabito = 'azul' | 'roxo' | 'ciano' | 'verde' | 'lima' | 'amarelo' | 'laranja' | 'rosa';

interface Habito {
  id: string;              // uuid (crypto.randomUUID)
  nome: string;            // ≤ 40 chars (ver §4.2)
  periodo: Periodo;
  metaSemanal: number;     // 1..7 — quantas vezes por semana
  ordem: number;           // posição dentro do período (drag-and-drop)
  cor?: CorHabito;         // token de cor opcional (ver §4.3)
  icone?: string;          // nome de ícone lucide opcional (ver §4.4)
  arquivado: boolean;      // soft-delete
  criadoEm: string;        // ISO datetime (hora local)
}

interface RegistroDia {
  data: string;                  // 'YYYY-MM-DD' (hora local)
  habitosConcluidos: string[];   // ids de Habito marcados nesse dia
  reflexao: string;              // texto livre ≤ 1000 chars (ver §4.2)
  avaliacao?: 'cumprido' | 'perdido' | 'neutro';  // congelada ao fechar o dia
  indiceFechado?: number;        // snapshot incremental do índice (ver §5.2)
}

interface EstadoApp {
  versao: number;                          // incrementado a cada mudança de schema
  habitos: Habito[];
  dias: Record<string, RegistroDia>;       // chave = 'YYYY-MM-DD'
  indiceBase: number;                      // começa em 1.0 (= 100%)
  preferencias: {
    tema: 'claro' | 'escuro';
    onboardingConcluido: boolean;
  };
  criadoEm: string;
}
```

> `melhorStreak` **não** é persistido — derivado varrendo `dias` em ordem
> cronológica quando necessário (ver §5.3).

### 4.2 Regras de integridade

- `nome` do hábito: obrigatório, 1–40 caracteres (validado no modal, §6.2).
- `reflexao`: opcional, máximo 1000 caracteres. Counter visível a partir
  de 900 chars.
- `metaSemanal` ∈ [1, 7].
- `ordem`: inteiro ≥ 0; atribuído na criação como `max(ordem do período) + 1`.
  Reordenado via drag-and-drop somente dentro do mesmo período.
- Arquivar hábito = `arquivado: true` (nunca deletar).
- Um `RegistroDia` só é criado quando o usuário interage com aquele dia.
- A `avaliacao` é **congelada** ao fechar e não muda retroativamente,
  exceto recálculo explícito (§5.4).
- **Hábito criado no meio da semana:** na semana de criação,
  `metaEfetiva = max(1, round(metaSemanal × diasRestantesDesdaCriacao / 7))`.
  A partir da semana seguinte usa-se `metaSemanal` integral.
- Dias sem `RegistroDia` são **ignorados** no cálculo do índice.

### 4.3 Paleta de cores dos hábitos

8 tokens fixos, mapeados para classes Tailwind em `src/theme/cores.ts`.
Proibido usar hex diretamente nos componentes.

| Token | Tailwind (fundo / texto) |
|---|---|
| `azul` | `bg-blue-100 text-blue-700` |
| `roxo` | `bg-purple-100 text-purple-700` |
| `ciano` | `bg-cyan-100 text-cyan-700` |
| `verde` | `bg-emerald-100 text-emerald-700` |
| `lima` | `bg-lime-100 text-lime-700` |
| `amarelo` | `bg-yellow-100 text-yellow-700` |
| `laranja` | `bg-orange-100 text-orange-700` |
| `rosa` | `bg-pink-100 text-pink-700` |

> `verde` usa `emerald` (distinto do verde semântico `green-500` de `cumprido`).
> Garantir distinção visual entre os dois contextos.

### 4.4 Ícones dos hábitos

Lista curada de ~24 ícones `lucide-react` definida em `src/theme/icones.ts`
durante M2. Critério: ícones reconhecíveis para rotinas diárias
(ex: `Dumbbell`, `Book`, `Droplets`, `Apple`, `Moon`, `Sun`, `Brain`,
`Music`, `Pen`, `Heart`, `Bike`, `Coffee`, `Salad`, `Bed`, `Smile`, etc.).

---

## 5. Regras de Negócio — Índice 1%

O **Índice 1%** materializa o efeito composto. Inicia em `1.0` (`100%` / `1.00x`).

### 5.1 Avaliação diária

Para cada hábito ativo (não arquivado) com `criadoEm` ≤ D:

- `metaEfetiva(D)` = `metaSemanal` integral, exceto na semana de criação
  (proporção conforme §4.2).
- `feitasNaSemanaAteD` = conclusões do hábito de segunda até D (incl.).
- `diasRestantesIncluindoD` = dias de D até domingo (incl.).
- `faltam` = `max(0, metaEfetiva(D) − feitasNaSemanaAteD)`.

Estados de um hábito no dia D:
- **Em dia:** `faltam == 0` → não pressiona o dia.
- **Em risco:** `faltam == diasRestantesIncluindoD` → **obrigatório hoje**.
- **Perdido na semana:** `faltam > diasRestantesIncluindoD` → impossível recuperar.

**Avaliação do dia D:**
- **`perdido`** (`×0.99`) — ≥ 1 hábito *Perdido na semana* **ou** algum
  obrigatório não foi concluído.
- **`cumprido`** (`×1.01`) — todos os obrigatórios concluídos e nenhum perdido
  na semana. (Inclui o caso sem obrigatórios mas com ≥ 1 hábito concluído.)
- **`neutro`** (`×1.00`) — sem obrigatórios e nenhum hábito marcado.

### 5.2 Cálculo do Índice

```
indice = indiceBase × Π (fator_d) para todo d fechado com RegistroDia
fator_d ∈ { 1.01, 0.99, 1.00 }
```

**Cálculo incremental:** ao fechar um dia, salvar
`indiceFechado = indiceFechadoDiaAnterior × fator_d`. O índice atual é o
`indiceFechado` do último dia fechado — sem iterar sobre todos os dias.
Em recálculo (§5.4), reprocessar a cadeia inteira.

- Hoje não entra até fechar. A UI mostra **projeção** ("se fechar agora:
  cumprido/perdido").
- Dias sem `RegistroDia` são ignorados.
- Exibições: `2.34x` em destaque · `+134%` como legenda · gráfico de linha.

### 5.3 Streak (sequência)

- `streakAtual` = dias consecutivos mais recentes com avaliação `cumprido`.
  **Derivado na hora** varrendo `dias` do mais recente ao mais antigo.
- `melhorStreak` = maior sequência histórica de `cumprido`.
  **Derivado na hora** com uma única passagem cronológica por `dias`.
- Nenhum dos dois é persistido.
- `neutro` e `perdido` **zeram** o streak.
- `neutro` **não** regride o índice (`×1.00`).

### 5.4 Fechamento de dia & recálculo

- Ao abrir o app, dias anteriores com `RegistroDia` mas sem `avaliacao`
  são avaliados e congelados em ordem cronológica, atualizando `indiceFechado`.
- "Recalcular histórico" (Configurações) reprocessa tudo do zero. Requer
  confirmação do usuário.

---

## 6. Telas & Fluxos

Navegação por **barra inferior** (mobile) / **barra lateral** (desktop).
4 rotas + onboarding + Configurações como modal.

| Rota | Tela |
|---|---|
| `/` | Hoje |
| `/habitos` | Hábitos |
| `/estatisticas` | Estatísticas |
| `/reflexoes` | Reflexões |
| — | Configurações (modal via ícone na nav) |

### 6.0 Onboarding (primeiro uso)

- Exibido apenas no primeiro acesso (`onboardingConcluido: false`).
- **4 telas curtas:**
  1. A filosofia 1% e o efeito composto.
  2. Como funciona o índice (`×1.01` / `×0.99` / `×1.00`) com exemplo numérico
     (ex: 30 dias cumpridos → `1.01^30 ≈ 1.35x`).
  3. O que é "cumprido/perdido/neutro" e o streak.
  4. CTA para criar o primeiro hábito (abre o modal de criar hábito).
- Skippable em qualquer tela.

### 6.1 Hoje (rota `/`)

- Cabeçalho: data, Índice 1% (`2.34x` em destaque + `+134%` legenda), streak.
- Badge de projeção: "Hoje: a caminho de **cumprido** / **perdido**".
- Hábitos em 3 seções colapsáveis: **Manhã · Tarde · Noite**.
  - Cada hábito: checkbox grande, nome, ícone (se definido), cor de fundo
    (se definida), progresso semanal `2/4`.
  - Hábitos obrigatórios hoje: badge "hoje".
  - Hábitos com meta semanal já batida: estilo "concluído na semana".
- **Reflexão do dia:** textarea com autosave após **1000ms** de inatividade.
  Counter de caracteres visível a partir de 900/1000. Toast/check ao salvar.
- Estados: vazio (sem hábitos → CTA criar), loading inicial.

### 6.2 Hábitos (rota `/habitos`)

- Lista de hábitos ativos agrupados por período, na ordem definida pelo usuário.
- **Drag-and-drop** para reordenar dentro de cada período (`@dnd-kit/sortable`).
  - Handle visual: ícone `GripVertical`.
  - Arrastar entre períodos não é permitido.
  - Nova `ordem` persistida imediatamente ao soltar.
- Criar/editar hábito (modal):
  - Nome (obrigatório, ≤ 40 chars com contador).
  - Período (Manhã / Tarde / Noite).
  - Meta semanal (1–7, seletor visual).
  - Cor (grid de 8 swatches — §4.3).
  - Ícone (grid dos ~24 ícones curados — §4.4).
- Arquivar com confirmação. Seção "Arquivados" recolhível.

### 6.3 Estatísticas (rota `/estatisticas`)

- Gráfico de linha do Índice 1% com filtros: 7d / 30d / tudo.
- Cartões: streak atual · melhor streak · taxa de dias `cumprido` ·
  total de conclusões.
- Heatmap: verde=`cumprido`, vermelho=`perdido`, cinza=`neutro`,
  vazio=sem `RegistroDia`.
- Desempenho por hábito: % da meta semanal média.

### 6.4 Reflexões (rota `/reflexoes`)

- Linha do tempo (mais recente primeiro) das reflexões preenchidas.
- Busca por texto. Clicar abre o dia em modo leitura.

### 6.5 Configurações (modal — sem rota)

- Alternância tema claro/escuro (persistida).
- Exportar dados: download `1porcento-backup-YYYY-MM-DD.json`.
- Importar dados: seletor de arquivo JSON com validação antes de aceitar
  (ver §8.1). Confirmação de sobrescrita.
- Recalcular histórico (com confirmação).
- Resetar tudo (dupla confirmação — ação destrutiva).
- "Como funciona o Índice 1%" → reabre as **4 telas completas** do onboarding.

---

## 7. Identidade Visual

- Estética **minimalista de planner**, foco em legibilidade e calma.
- Tema **claro** e **escuro**, alternável; preferência persistida.
- Tokens centralizados em `src/theme/` — proibido hex hardcoded nos componentes.
- Tipografia: Inter (ou fonte sans do sistema).
- Paleta semântica:
  - `cumprido` → `green-500` · `perdido` → `red-500` · `neutro` → `gray-400`.
  - Acento principal: token `--cor-acento`.
  - Cores de hábitos: tokens §4.3 (tons `*-100` fundo, `*-700` texto —
    distintos das cores semânticas).
- Acessibilidade: contraste AA, alvos de toque ≥ 44px, navegação por teclado
  em checkboxes e modais, `aria-label` nos controles, `aria-grabbed` nos
  elementos drag-and-drop.

---

## 8. Arquitetura

```
src/
  main.tsx
  App.tsx                   # rotas + composição de providers + tema
  theme/
    cores.ts                # mapa CorHabito → classes Tailwind
    icones.ts               # lista curada de ícones lucide
    ThemeProvider.tsx
  domain/
    types.ts                # entidades + VERSAO_SCHEMA
    indice.ts               # regras do Índice 1% — puro, testável
    semana.ts               # helpers de semana ISO, metaEfetiva, streaks
  data/
    StorageRepository.ts    # interface (contrato)
    LocalStorageRepo.ts     # implementação localStorage
    migrations.ts           # funções de migração por versão
  state/
    HabitosContext.tsx      # habitos[] + CRUD + reordenar
    DiaContext.tsx          # dias{} + marcar + reflexão + fechamento
    PreferenciasContext.tsx # tema + onboarding + toggle
  features/
    hoje/
    habitos/
    estatisticas/
    reflexoes/
    configuracoes/
  components/               # UI compartilhada (Checkbox, Card, Modal, Toast…)
  test/
```

### 8.1 Contrato de persistência

```ts
interface StorageRepository {
  carregar(): Promise<EstadoApp | null>;
  salvar(estado: EstadoApp): Promise<void>;
  exportar(): Promise<string>;                  // JSON
  importar(json: string): Promise<EstadoApp>;  // valida + migra antes de aceitar
}
```

**Validação no `importar()`:** verificar campos obrigatórios e tipos; aplicar
`migrar()` se `versao` < `VERSAO_SCHEMA`; rejeitar com erro descritivo se
inválido — nunca sobrescrever estado atual com JSON inválido.

### 8.2 Regras de domínio são puras

`domain/indice.ts` e `domain/semana.ts` são funções puras (sem React, sem
storage). Incluem: avaliação de dia (§5.1), `metaEfetiva`, derivação de
`streakAtual` e `melhorStreak`.

### 8.3 Estratégia de migração de schema

```ts
// data/migrations.ts
const migrations: Record<number, (e: any) => any> = {
  1: (e) => e,   // versão base
  // 2: (e) => ({ ...e, novoCampo: valorDefault }),
};

export function migrar(raw: unknown): EstadoApp {
  let estado = raw as any;
  while (estado.versao < VERSAO_SCHEMA) {
    estado = migrations[estado.versao + 1](estado);
    estado.versao += 1;
  }
  return estado as EstadoApp;
}
```

- `carregar()` e `importar()` sempre passam o dado por `migrar()`.
- Nunca remover uma migration do histórico.

### 8.4 Contextos separados por domínio

| Contexto | Responsabilidade |
|---|---|
| `HabitosContext` | `habitos[]`, criar, editar, arquivar, reordenar |
| `DiaContext` | `dias{}`, marcar/desmarcar hábito, salvar reflexão (debounce 1000ms), fechar dia, projeção |
| `PreferenciasContext` | `tema`, `onboardingConcluido`, toggle de tema, abrir onboarding |

`App.tsx` compõe os três providers. Cada feature importa apenas o contexto
necessário. Usar `useMemo` nos values e `useCallback` nas actions para
estabilidade de referência e minimizar re-renders.

### 8.5 Error Boundaries

Envolver as rotas principais com `ErrorBoundary` para isolar falhas:

```tsx
<ErrorBoundary fallback={<ErroTela />}>
  <Routes>...</Routes>
</ErrorBoundary>
```

`ErroTela` exibe mensagem amigável + botão "Recarregar" + link para exportar
dados (quando o estado ainda é parcialmente acessível). O `LocalStorageRepo`
já tem fallback para dados corrompidos (`carregar()` retorna `null`), mas o
`ErrorBoundary` cobre erros de runtime nos componentes.

---

## 9. Estratégia de Testes

Toda lógica de negócio entregue **com** seus testes (Vitest). Testes escritos
junto com a feature.

### 9.1 Obrigatórios

- **`domain/indice.ts`** — dia cumprido/perdido/neutro; meta batida cedo;
  hábito em risco; hábito perdido na semana; produto composto;
  cálculo incremental via `indiceFechado`; hábito criado mid-week.
- **`domain/semana.ts`** — limites ISO (seg/dom), virada de ano, dias restantes,
  `metaEfetiva` para hábitos criados em diferentes dias da semana.
- **`domain/semana.ts` (streaks)** — `streakAtual` e `melhorStreak` derivados
  corretamente; zeram no `neutro` e `perdido`; incrementam só no `cumprido`.
- **`data/LocalStorageRepo.ts`** — salvar/carregar/round-trip; exportar/importar;
  estado corrompido → fallback; migração de versão anterior.
- **`data/migrations.ts`** — cada função transforma corretamente de N para N+1.
- **Componentes críticos (RTL):** Hoje renderiza grupos por período; marcar
  hábito atualiza progresso; reflexão faz autosave após 1000ms; toggle de
  tema; drag-and-drop persiste nova ordem.

### 9.2 Definição de Pronto (DoD)

Uma feature está pronta quando:

- [ ] Funciona em dev sem erros de console.
- [ ] Testes Vitest passando.
- [ ] Sem erro de lint nem de formatação.
- [ ] Feedback visual: loading, sucesso e erro onde aplicável.
- [ ] Acessibilidade mínima:
  - [ ] Navegação por teclado (Tab, Enter, Escape nos modais).
  - [ ] `aria-label` descritivo em checkboxes e botões.
  - [ ] `aria-grabbed` / instruções de teclado nos elementos drag-and-drop.
  - [ ] Contraste AA nos tokens de cor.
  - [ ] Alvos de toque ≥ 44px.
- [ ] Validada visualmente pelo usuário (Nikolas) em mobile e desktop.

---

## 10. Roadmap (Marcos)

| Marco | Entrega |
|---|---|
| **M0 — Setup** | Vite+React+TS+Tailwind, ESLint/Prettier, Vitest, `@dnd-kit/core`, estrutura de pastas, `ThemeProvider`, `cores.ts` |
| **M1 — Domínio** | `types.ts` + `VERSAO_SCHEMA`; `semana.ts` (incl. `metaEfetiva`, streaks derivados); `indice.ts` + testes completos; `LocalStorageRepo` + `migrations.ts` + testes |
| **M2 — Hábitos** | `HabitosContext`; CRUD com validação de inputs; drag-and-drop; `icones.ts` |
| **M3 — Hoje** | `DiaContext`; checklist; progresso semanal; reflexão com autosave 1000ms + counter; projeção do dia |
| **M3.5 — Onboarding** | 4 telas; flag `onboardingConcluido`; reabertura via Configurações |
| **M4 — Índice & Estatísticas** | Gráfico (cálculo incremental); streaks derivados; heatmap; cartões |
| **M5 — Reflexões & Config** | Timeline + busca; exportar/importar (validação + nome do arquivo); recalcular; reset |
| **M6 — Polimento** | Responsividade; acessibilidade completa; `ErrorBoundary`; estados vazios; microinterações; PWA (`manifest.json` + service worker básico); QA final |

---

## 11. Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| Regra do Índice 1% confusa | Onboarding + projeção clara do dia |
| `localStorage` apagado | Exportar/importar JSON; nuvem futura |
| Lógica de meta semanal complexa | Domínio puro 100% testado |
| Mudança de regra altera índices passados | Recálculo explícito e confirmado |
| Feature creep | Não-objetivos (§1.2) fixos |
| Schema corrompido / importado inválido | Validação em `importar()` (§8.1); fallback em `carregar()` |
| Performance com muitos dias | Cálculo incremental via `indiceFechado` (§5.2) |
| Hábito mid-week distorce índice | `metaEfetiva` proporcional (§4.2) |
| **Abas simultâneas (limitação conhecida)** | Duas abas podem dessincronizar o `localStorage`. Mitigação parcial: escutar `window.storage` para recarregar o estado quando outra aba salvar. Não é bloqueante para MVP. |
| Drag-and-drop inacessível por teclado | `@dnd-kit` suporta teclado nativamente; coberto no DoD (§9.2) |

---

## 12. Decisões Validadas com o Usuário

1. ✅ Regra de avaliação diária (§5.1).
2. ✅ Dia neutro zera o streak; índice usa `×1.00` (§5.3).
3. ✅ Índice em `2.34x` + `+134%` (§5.2 / §6.1).
4. ✅ Onboarding em **4 telas** (§6.0).
5. ✅ Hábito mid-week usa **meta proporcional** (§4.2 / §5.1).
6. ✅ Migração de schema via **migrations automáticas** (§8.3).
7. ✅ Fuso horário = **hora local do dispositivo** (§3 / §5.2).
8. ✅ Validação: **nome ≤ 40 chars · reflexão ≤ 1000 chars** (§4.2).
9. ✅ Paleta de **8 cores fixas** com tokens nomeados (§4.3).
10. ✅ Ordenação por **drag-and-drop** dentro de cada período (§4.1 / §6.2).
11. ✅ `melhorStreak` **derivado na hora**, sem persistir (§5.3).
12. ✅ Debounce autosave **1000ms** (§6.1).
13. ✅ Onboarding reaberto = **4 telas completas** (§6.5).
14. ✅ Arquitetura de estado = **contextos separados** por domínio (§8.4).

---

*Fim da Spec v1.3. Próximo passo: iniciar M0 (setup do projeto).*