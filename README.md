# 📈 1% — O Sistema Definitivo de Evolução Composta Diária

> **Por que 92% das resoluções de ano novo falham?** Porque trackers tradicionais exigem consistência perfeita imediata, levando ao esgotamento. O **1%** é o antídoto psicológico a esse problema: um planner digital focado em **micro-hábitos, metas flexíveis e o poder dos juros compostos** na sua rotina.

---

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

---

## 💡 A Filosofia 1%

Inspirado nos conceitos científicos de *Hábitos Atômicos* (James Clear), o **1%** tangibiliza o efeito acumulado das suas ações diárias. Se você melhorar **1% todos os dias**, ao final de um ano você estará **37 vezes melhor**. Se piorar 1% a cada dia, seu progresso cairá quase a zero.

O coração da nossa plataforma é o **Índice 1%**, um indicador dinâmico que premia a constância estratégica e desencoraja a procrastinação crônica, permitindo flexibilidade sem sentimento de culpa.

---

## 🎯 Diferenciais Comerciais

### ⚡ Checklist Inteligente por Períodos
*   **Divisão Ergonômica:** Seus hábitos organizados de forma natural (Manhã, Tarde e Noite) para respeitar o ritmo do seu dia.
*   **Status de Urgência:** Sistema automático que identifica hábitos "Em Risco" e os destaca para que você saiba exatamente onde focar sua energia diária.

### 📊 Painel Analítico & Efeito Composto
*   **Visualização de Gráficos:** Um histórico limpo do seu Índice 1% gerado com gráficos altamente responsivos.
*   **Heatmap de Consistência:** Um mapa de calor visual que permite rastrear, de relance, seus padrões de comportamento e identificar dias de maior performance.

### ✍️ Diário de Reflexão Integrado
*   **Autosave Silencioso:** Escreva suas reflexões diárias sem se preocupar em perder dados.
*   **Linha do Tempo Inteligente:** Recupere seus pensamentos e aprendizados do passado com uma ferramenta de busca instantânea de texto.

### 🔒 Privacidade Absoluta (Local-First)
*   **Zero Contas, Zero Nuvem:** Seus dados pertencem a você. Toda a persistência é feita localmente em seu navegador (`localStorage`).
*   **Portabilidade de Dados:** Exporte e importe suas informações em `JSON` a qualquer momento para backups físicos simples.

---

## 🧮 A Ciência por Trás: A Regra do Índice

Nosso algoritmo calcula dinamicamente a urgência dos seus hábitos baseando-se em suas **metas semanais** (ex: praticar inglês 3x por semana). No fechamento de cada dia (meia-noite local), o Índice reage ao seu comportamento:

```
Índice Acumulado = Valor Base (1.0) × Fatores Diários Acumulados
```

| Resultado do Dia | Regra de Ativação | Fator Aplicado | Impacto no Índice | Efeito na Sequência (Streak) |
| :--- | :--- | :---: | :---: | :---: |
| **🟢 Cumprido** | Concluiu todos os hábitos que estavam *Em Risco* na data. | `× 1.01` | **+1.0% composto** | Incrementa sequência |
| **🟡 Neutro** | Sem obrigações (*Em Risco*) e nenhuma marcação (Dia de folga planejado). | `× 1.00` | **Mantém estável** | Zera o streak (Exige constância) |
| **🔴 Perdido** | Negligenciou algum hábito *Em Risco* ou inviabilizou a meta semanal. | `× 0.99` | **-1.0% composto** | Zera o streak |

> 💡 **Flexibilidade Consciente:** O dia **Neutro** é o segredo para evitar o burnout. Ele permite que você descanse sem que seu índice caia, mas resguarda a chama da disciplina ao zerar o *streak* diário.

---

## 🏗️ Engenharia de Software: Arquitetura Enterprise-Ready

Embora funcione como um MVP Local-First, o projeto foi arquitetado sob os mais rigorosos padrões da indústria para facilitar o escalonamento comercial imediato (SaaS).

### Estrutura de Pastas Modular (DDD & Clean Arch)
```
src/
├── main.tsx
├── App.tsx                 # Rotas, Providers Globais e inicialização de temas
├── theme/                  # Design System Centralizado e gerenciamento de Dark/Light mode
├── domain/                 # Camada de Negócio Pura (Algoritmos puramente matemáticos e isolados)
│   ├── types.ts            # Entidades de Domínio
│   └── indice.ts           # Cálculo puro do Índice 1% e Streaks (100% testado)
├── data/                   # Infraestrutura e Persistência
│   ├── StorageRepository.ts# Interface/Contrato de Persistência
│   └── LocalStorageRepo.ts # Implementação localStorage (Plug-and-play)
├── state/                  # Orquestração de Estado do React
│   └── AppContext.tsx      # Contexto que conecta domínio e telas
└── features/               # Módulos Visuais Funcionais (Hoje, Hábitos, Estatísticas, Reflexões)
```

### Pronto para Nuvem (Cloud Migration)
Toda a comunicação de dados é isolada pela interface `StorageRepository`. Caso a plataforma evolua para um modelo SaaS baseado em nuvem com sincronização em tempo real e banco de dados remoto (ex: Postgres/Supabase), basta plugar uma nova implementação (`ApiRepository`) sem tocar em uma única linha de código da interface do usuário (UI) ou das regras matemáticas.

---

## 🛠️ Stack Tecnológica de Alta Performance

*   **Fast Build:** [Vite](https://vitejs.dev/) + React 18 & TypeScript para um ciclo de feedback de desenvolvimento ultrarrápido (DX).
*   **Design System:** [Tailwind CSS](https://tailwindcss.com/) com tokens semânticos e suporte a Dark/Light Mode.
*   **Data Visualization:** [Recharts](https://recharts.org/) para carregamento assíncrono de estatísticas interativas.
*   **Data Operations:** [date-fns](https://date-fns.org/) para a consistência das regras ISO de semanas (Segunda a Domingo).
*   **Testing Automation:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) para testes unitários e de integração confiáveis.

---

## 🚀 Como Executar o Projeto

Prepare o ambiente de desenvolvimento em menos de 2 minutos.

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (Versão 18 ou superior recomendada)

### Instalação
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/1-por-cento.git

# 2. Acesse a pasta do projeto
cd 1-por-cento

# 3. Instale as dependências
npm install
```

### Comandos Disponíveis
*   **Modo de Desenvolvimento:** `npm run dev`
*   **Executar Suíte de Testes:** `npm run test`
*   **Visualizar Suíte de Testes (UI):** `npm run test:ui`
*   **Build para Produção:** `npm run build`

---

## 🗺️ Roadmap Estratégico de Lançamento

- [x] **Setup & Design System (M0):** Integração técnica base, ESLint/Prettier, Vitest e arquitetura modular de cores.
- [ ] **Core Lógico (M1):** Validação matemática do algoritmo do Índice 1% com 100% de cobertura de testes automatizados.
- [ ] **Mapeamento de Hábitos (M2):** UX refinada de cadastro, edição e arquivamento de metas por turno.
- [ ] **Dashboard Hoje (M3):** Centro de controle dinâmico, checklists ergonômicos e módulo de diário com autosave.
- [ ] **Onboarding Gamificado (M3.5):** Fluxo imersivo de apresentação do modelo matemático ao novo usuário.
- [ ] **Painel de Análises (M4):** Heatmaps, estatísticas Recharts e tracking inteligente de evolução de hábitos.
- [ ] **Backup & Histórico (M5):** Gerenciador de reflexões históricas e exportação/importação de dados.
- [ ] **Refinamento Final (M6):** Otimizações de SEO, responsividade extrema para mobile e acessibilidade W3C AA.

---

## 🔒 Licença & Contato

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---
*Melhore 1% a cada commit. Faça parte do efeito composto.* 📈
