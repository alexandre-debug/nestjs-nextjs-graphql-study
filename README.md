# 🔍 nestjs-nextjs-graphql-study Study Project

**Projeto de estudo fullstack para preparação de entrevista técnica.**
Domínio: monitoramento de atividades de funcionários (contextualizado para o produto nestjs-nextjs-graphql-study).

---

## 🏗️ Arquitetura

```
nestjs-nextjs-graphql-study/
├── backend/          # NestJS + GraphQL + PostgreSQL + CQRS
├── frontend/         # Next.js 14 + Apollo Client + React Patterns
└── docker-compose.yml
```

### Stack

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Backend | NestJS | Framework opinionado com injeção de dependência, módulos, decorators |
| API | GraphQL (code-first) | Type-safe, subscriptions nativas, um endpoint para tudo |
| Banco | PostgreSQL + TypeORM | Relacional, ACID, ORM maduro com suporte a migrações |
| Patterns | CQRS + EventEmitter | Separação clara de leitura/escrita, baixo acoplamento |
| Frontend | Next.js 14 (App Router) | SSR/SSG, performance, otimizações automáticas |
| State | Apollo Client + Context | Cache normalizado + estado global leve |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose

### 1. Suba o banco de dados

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

O servidor GraphQL estará em: `http://localhost:3001/graphql`
O GraphQL Playground (Apollo Sandbox) estará disponível nesse endereço.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

O dashboard estará em: `http://localhost:3000`

---

## 📚 Conceitos Implementados

### CQRS (Command Query Responsibility Segregation)

Separação entre operações de escrita (Commands) e leitura (Queries).

```
Mutation createUser → CommandBus → CreateUserHandler → DB Write
Query users         → QueryBus  → GetUsersHandler   → DB Read
```

**Localização:** `backend/src/modules/users/commands/` e `queries/`

**Por que usar:**
- Permite otimizar leitura e escrita independentemente
- Cada handler tem uma responsabilidade única
- Base para Event Sourcing se necessário

**Em entrevistas:** Explique os trade-offs — CQRS adiciona complexidade. Justifique
com escala ou complexidade de domínio. Não use em CRUDs simples.

---

### GraphQL: Queries, Mutations e Subscriptions

```graphql
# Query — leitura
query { users { id name email role } }

# Mutation — escrita
mutation { createUser(input: { name: "João", email: "joao@co.com", role: EMPLOYEE }) { id } }

# Subscription — tempo real via WebSocket
subscription { activityLogCreated { id action timestamp user { name } } }
```

**Localização:** `backend/src/modules/*/**.resolver.ts`

**Em entrevistas:**
- Explique a diferença entre SDL-first (schema-first) e code-first
- Explique o **N+1 Problem** e como o **DataLoader** resolve
- Saiba quando usar REST vs GraphQL

---

### Event-Driven com EventEmitter (simulando Kafka)

Quando uma atividade é criada:
1. É salva no banco
2. Publicada no GraphQL PubSub → Subscriptions recebem em tempo real
3. Emitida via EventEmitter → `ActivityCreatedListener` detecta ações suspeitas

**Localização:** `backend/src/modules/activity-logs/events/`

**Em entrevistas:**
- EventEmitter: in-process, sem garantias de entrega
- Kafka: distribuído, persistente, replay, ideal para microsserviços
- RabbitMQ: routing complexo, dead-letter queues, acknowledgment

---

### Guards e Interceptors no NestJS

**Guards** (`AuthGuard`): determinam SE a requisição pode prosseguir (autorização).
**Interceptors** (`LoggingInterceptor`): transformam/monitoram a requisição E a resposta.

```
Request → Middleware → Guards → Interceptors → Pipes → Handler → Interceptors → Response
```

**Localização:** `backend/src/common/guards/` e `interceptors/`

---

### Controlled vs Uncontrolled Components

**Controlled:** O React controla o valor via `useState`. Permite validação em tempo real.
```tsx
<input value={formData.name} onChange={handleChange} />
```

**Uncontrolled:** O DOM controla o valor. Acessado via `useRef` no submit.
```tsx
<input ref={nameRef} defaultValue="" />
const value = nameRef.current?.value
```

**Localização:** `frontend/src/components/Users/UserForm.tsx`

**Em entrevistas:**
- React Hook Form usa Uncontrolled internamente para performance
- Use Controlled quando precisar de validação em tempo real ou dependência entre campos
- Use Uncontrolled para forms grandes onde performance é crítica

---

### useMemo e useCallback

**useMemo:** memoiza o resultado de uma computação cara.
```tsx
// Sem memo: chartData seria recalculado a cada render
const chartData = useMemo(() => groupByHour(activities), [activities]);
```

**useCallback:** memoiza a referência de uma função.
```tsx
// Sem callback: nova função a cada render → filho com React.memo rerenderia
const handleSelectUser = useCallback((user) => selectUser(user), [selectUser]);
```

**Regra de ouro:**
- `useMemo`: quando a computação é cara (>1ms) OU o resultado é passado para componente memoizado
- `useCallback`: quando a função é passada como prop para componente com `React.memo`
- **Não use prematuramente** — a memoização tem custo

**Localização:** `frontend/src/hooks/useActivityData.ts` e `components/Users/UsersList.tsx`

---

### Error Boundaries

Capturam erros de render em sub-árvores de componentes.

```tsx
<WithErrorBoundary fallback={<FallbackUI />}>
  <ComponenteThatMightFail />
</WithErrorBoundary>
```

**Atenção:** Error Boundaries precisam ser **componentes de classe**.
Não capturam: erros assíncronos, event handlers, Server Components.

**Localização:** `frontend/src/components/common/ErrorBoundary.tsx`

---

### Context API com useReducer

Padrão Redux-like usando Context nativo do React.

```
AppProvider
  ├── AppStateContext  (leitura)
  └── AppDispatchContext (escrita)
```

Dois contextos separados evitam rerenders desnecessários em componentes
que só precisam do dispatch (que nunca muda).

**Localização:** `frontend/src/context/AppContext.tsx`

---

## 🎯 Dicas para a Entrevista

### Sobre NestJS
- **Módulos:** unidade de organização, definem o escopo de injeção de dependência
- **Decorators:** `@Injectable`, `@Controller`, `@Resolver` — metadados que o framework usa em runtime
- **Lifecycle hooks:** `OnModuleInit`, `OnApplicationShutdown` — para inicialização e cleanup

### Sobre GraphQL
- Saiba explicar o N+1 Problem e a solução com DataLoader
- Entenda a diferença entre `@ObjectType` (saída) e `@InputType` (entrada)
- Subscriptions usam WebSocket — cuide com escala (cada cliente mantém conexão aberta)
- Em produção, PubSub em memória → Redis PubSub para múltiplas instâncias

### Sobre React
- **Re-renders:** ocorrem quando state, props ou context muda
- **`React.memo`:** evita rerender se props não mudaram (compara por referência)
- **`useMemo`/`useCallback`:** só valem a pena com componentes memorizados ou computações caras
- **Error Boundaries:** `getDerivedStateFromError` atualiza estado; `componentDidCatch` loga

### Sobre TypeScript
- Saiba usar `Partial<T>`, `Pick<T>`, `Omit<T>`, `Record<K,V>`
- Entenda `type` vs `interface` (interfaces são extensíveis, types são mais flexíveis)
- Decorators requerem `experimentalDecorators: true` no tsconfig

### Sobre Arquitetura
- **CQRS:** quando escala de leitura ≠ escala de escrita, ou domínio complexo
- **Event-driven:** desacoplamento entre módulos, mas complexidade de debugging
- **GraphQL vs REST:** GraphQL elimina over/under-fetching, REST é mais simples e cacheável

---

## 📁 Estrutura de Arquivos Chave

```
backend/src/
├── app.module.ts              # Configuração global (TypeORM, GraphQL, EventEmitter)
├── main.ts                    # Bootstrap + ValidationPipe global
├── common/
│   ├── exceptions/            # Exceções de domínio (BusinessException)
│   ├── filters/               # Formatação de erros GraphQL
│   ├── guards/                # Autorização (AuthGuard + @Roles)
│   └── interceptors/          # Logging de tempo (LoggingInterceptor)
└── modules/
    ├── users/
    │   ├── commands/           # CQRS: CreateUser (Command + Handler)
    │   ├── queries/            # CQRS: GetUsers, GetUser (Query + Handler)
    │   ├── dto/                # Validação com class-validator
    │   ├── entities/           # User (TypeORM + GraphQL ObjectType)
    │   ├── users.resolver.ts   # GraphQL: Queries, Mutations, @ResolveField
    │   └── users.service.ts    # Orquestra via CommandBus/QueryBus
    └── activity-logs/
        ├── commands/           # CreateActivityLog → PubSub + EventEmitter
        ├── queries/            # GetActivityLogs com filtros
        ├── events/             # ActivityCreatedListener (detecção de suspeitos)
        ├── entities/           # ActivityLog (TypeORM + GraphQL)
        └── activity-logs.resolver.ts  # Inclui Subscriptions em tempo real

frontend/src/
├── app/
│   ├── layout.tsx             # RootLayout (Server Component) + Sidebar
│   ├── providers.tsx          # Client providers (Apollo + Context)
│   ├── page.tsx               # Dashboard (stats + chart + feed ao vivo)
│   ├── users/page.tsx         # Controlled vs Uncontrolled + UsersList
│   └── activities/page.tsx    # Feed com subscription + Simulador de eventos
├── components/
│   ├── common/ErrorBoundary.tsx       # Error Boundary (classe React)
│   ├── Dashboard/ActivityChart.tsx    # Recharts + useMemo
│   ├── Dashboard/StatsCard.tsx        # React.memo
│   ├── Users/UserForm.tsx             # Controlled vs Uncontrolled LADO A LADO
│   ├── Users/UsersList.tsx            # useCallback para handlers
│   └── ActivityLog/ActivityLogList.tsx # Subscription ao vivo
├── context/AppContext.tsx             # Context + useReducer (padrão Redux-like)
├── hooks/
│   ├── useActivityData.ts             # Custom hook com useMemo + useCallback
│   └── useRealTimeSubscription.ts     # Subscription GraphQL + useDebounce
└── lib/apollo-client.ts               # Apollo com HTTP + WebSocket split link
```
