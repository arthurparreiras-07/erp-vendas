# ERP Gestão de Vendas

Sistema ERP de Gestão de Vendas desenvolvido para a disciplina **T.I Sistemas Integrados de Gestão Empresarial** — Grupo 3, PUC Minas Betim.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Roteamento | TanStack Router (file-based) |
| Data fetching | TanStack Query + Axios |
| Validação | Zod + React Hook Form |
| Backend | Fastify 4 + TypeScript |
| ORM | MikroORM 6 |
| Banco de dados | PostgreSQL 16 |
| Infraestrutura | Docker Compose |

---

## Estrutura do projeto

```
erp-vendas/
├── packages/
│   ├── api/                  # Backend — arquitetura DDD
│   │   └── src/
│   │       ├── modules/      # Bounded contexts (auth, clientes, pedidos…)
│   │       │   └── <modulo>/
│   │       │       ├── domain/       # Entidades e regras de negócio
│   │       │       ├── application/  # Use cases
│   │       │       └── http/         # Rotas Fastify
│   │       ├── plugins/      # db, swagger
│   │       └── shared/       # BaseEntity, seed
│   │
│   └── client/               # Frontend — arquitetura modular por features
│       └── src/
│           ├── features/     # Uma pasta por domínio (dashboard, vendas…)
│           ├── components/   # UI e layout reutilizáveis
│           ├── lib/          # axios, auth helpers
│           └── routes/       # Rotas file-based (gerado: routeTree.gen.ts)
│
├── docker-compose.yml
└── Makefile
```

---

## Pré-requisitos

- [Node.js 20 LTS](https://nodejs.org/)
- [Docker](https://docs.docker.com/engine/install/)

---

## Primeiros passos

Clone o repositório, configure as variáveis de ambiente e rode o setup completo:

```bash
cp packages/api/.env.example packages/api/.env
make setup
```

Depois inicie a aplicação:

```bash
make dev
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Swagger UI | http://localhost:3000/docs |

---

## Credenciais padrão (seed)

| Usuário | E-mail | Senha | Papel |
|---|---|---|---|
| Admin ERP | admin@erp.com | admin123 | admin |
| João Silva | joao@erp.com | senha123 | vendedor |
| Maria Santos | maria@erp.com | senha123 | vendedor |

---

## Requisitos funcionais cobertos

| RF | Descrição |
|---|---|
| RF01 | Autenticação com e-mail e senha |
| RF02 | Dashboard com KPIs e gráfico de vendas semanal |
| RF03 | Cadastro e listagem de clientes |
| RF04 | Registro de pedidos de venda com carrinho |
| RF05 | Cálculo automático de subtotal, desconto, imposto e total |
| RF06 | Cadastro e listagem de produtos |
| RF07 | Controle de estoque físico e reservado |
| RF08 | Alertas de estoque crítico (< 5 unidades) |
| RF09 | Relatório de vendas por vendedor com filtros de período |
| RF10 | Comparativo realizado vs. meta por vendedor |
| RF11 | Feed de atividades recentes |
