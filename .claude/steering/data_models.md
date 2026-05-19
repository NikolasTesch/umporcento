# Steering — Entidades e Schemas

Raiz persistida em `localStorage` sob a chave `umporcento:v1`, via
`StorageRepository`. Detalhe completo: [SPEC.md §4](../../SPEC.md).

```ts
type Periodo = 'manha' | 'tarde' | 'noite';
type CorHabito = 'azul' | 'roxo' | 'ciano' | 'verde'
               | 'lima' | 'amarelo' | 'laranja' | 'rosa';

interface Habito {
  id: string;            // crypto.randomUUID()
  nome: string;          // 1–40 chars
  periodo: Periodo;
  metaSemanal: number;   // 1..7
  ordem: number;         // posição no período (drag-and-drop)
  cor?: CorHabito;
  icone?: string;        // nome de ícone lucide
  arquivado: boolean;    // soft-delete
  criadoEm: string;      // ISO datetime (hora local)
}

interface RegistroDia {
  data: string;                 // 'YYYY-MM-DD' (hora local)
  habitosConcluidos: string[];  // ids de Habito
  reflexao: string;             // ≤ 1000 chars
  avaliacao?: 'cumprido' | 'perdido' | 'neutro';  // congela ao fechar
  indiceFechado?: number;       // snapshot incremental do índice
}

interface EstadoApp {
  versao: number;               // VERSAO_SCHEMA — incrementa a cada mudança
  habitos: Habito[];
  dias: Record<string, RegistroDia>;  // chave 'YYYY-MM-DD'
  indiceBase: number;           // 1.0 = 100%
  preferencias: { tema: 'claro' | 'escuro'; onboardingConcluido: boolean };
  criadoEm: string;
}
```

## Regras de integridade

- `nome` obrigatório 1–40. `reflexao` ≤ 1000 (counter visível ≥ 900).
- `metaSemanal` ∈ [1,7]. `ordem` inteiro ≥ 0 = `max(ordem do período)+1`.
- Reorder só dentro do mesmo período (drag-and-drop).
- `RegistroDia` só nasce quando o usuário interage com o dia.
- `avaliacao` congela ao fechar; só muda em recálculo explícito.
- `melhorStreak` **não** é persistido — derivado varrendo `dias`.
- Dias sem `RegistroDia` são ignorados no cálculo do índice.

## Contrato de persistência

```ts
interface StorageRepository {
  carregar(): Promise<EstadoApp | null>;
  salvar(estado: EstadoApp): Promise<void>;
  exportar(): Promise<string>;                 // JSON
  importar(json: string): Promise<EstadoApp>;  // valida + migra antes de aceitar
}
```

`importar()`: validar campos/tipos, aplicar `migrar()` se `versao` <
`VERSAO_SCHEMA`, rejeitar com erro descritivo — **nunca** sobrescrever estado
com JSON inválido.
