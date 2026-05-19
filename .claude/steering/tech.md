# Steering — Stack e Padrões

| Camada | Tecnologia |
|---|---|
| Build / Dev | Vite |
| UI | React 18 (function components + hooks) · TypeScript |
| Estilo | Tailwind CSS (tokens em `src/theme/`) |
| Roteamento | React Router v6 |
| Estado | React Context **separado por domínio** + hooks |
| Persistência | `StorageRepository` (abstração) + `LocalStorageRepo` |
| Datas | `date-fns` — **hora local**, semana ISO seg→dom, **sem UTC** |
| Gráficos | `recharts` |
| Ícones | `lucide-react` (lista curada em `theme/icones.ts`) |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Validação | `zod` (usado no `importar()`) |
| Testes | Vitest + React Testing Library |
| Lint/Format | ESLint (`--max-warnings 0`) + Prettier |

## Comandos

`npm run dev` · `npm run build` (tsc --noEmit + vite) · `npm run test`
(vitest run) · `npm run test:watch` · `npm run lint` · `npm run format`.

## Padrões de código

- Function components + hooks. Sem class components.
- TypeScript estrito — tipar props, retornos e entidades de domínio.
- Sem `any` exceto fronteira de migração (`migrations.ts`).
- Imports absolutos a partir de `src/` quando configurado; senão relativos limpos.
- Tailwind: classes via tokens (`classesCor`), sem `style={{}}` com hex.
- Datas: sempre `new Date()` do dispositivo; chaves `'YYYY-MM-DD'` locais.
