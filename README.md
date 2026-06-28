# AutoTrack — Sistema de Gestão para Oficina Mecânica

Sistema completo de gestão de oficina com **painel interno** (para a equipe) e **portal do cliente** (para os clientes acompanharem seus veículos).

## 🧱 Stack

- **Backend:** Node.js + Express
- **ORM:** Prisma
- **Banco de dados:** PostgreSQL
- **Frontend:** Vue.js 3 (Composition API) + Vue Router + Pinia
- **Autenticação:** JWT (dois sistemas separados — equipe e cliente)

## 📁 Estrutura do projeto

```
autotrack/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de negócio
│   │   ├── routes/           # Rotas Express
│   │   ├── middleware/       # Autenticação JWT
│   │   └── prisma/
│   │       ├── schema.prisma # Modelo do banco
│   │       ├── client.js     # Singleton do Prisma Client
│   │       └── seed.js       # Dados de exemplo
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── views/             # Páginas do painel interno
    │   ├── views/portal/      # Páginas do portal do cliente
    │   ├── router/            # Rotas (com guards de autenticação)
    │   ├── store/             # Pinia (auth)
    │   ├── services/          # Axios (api + portalApi)
    │   └── assets/main.css    # Design system (cores, componentes)
    └── package.json
```

## 🗄️ Modelo de dados (Prisma)

- **User** — usuários internos (admin/mecânico) que acessam o painel
- **Client** — clientes da oficina, com login próprio no portal
- **Vehicle** — veículos vinculados a um cliente
- **VehicleVisit** — registro simples de "o veículo passou aqui" (data, km, motivo)
- **ServiceOrder** — ordem de serviço (OS) com status, serviços e peças
- **Budget** — orçamento (mesma estrutura de OS, mas sem execução)
- **ServiceItem** — item de serviço (mão de obra) vinculado a OS ou orçamento
- **PartItem** — peça trocada, com **quantidade, valor e garantia** (meses + data de expiração calculada automaticamente)

A garantia é o ponto-chave pedido: cada peça tem `warrantyMonths` e `warrantyExpires` (calculado na criação). O portal do cliente mostra "✓ Válida até DD/MM" ou "✗ Expirada" automaticamente, comparando com a data atual.

## 🚀 Como rodar

### 1. Banco de dados

Crie um banco PostgreSQL (local ou serviço gerenciado, ex: Supabase, Neon, Railway):

```sql
CREATE DATABASE autotrack;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edite o .env com sua DATABASE_URL real e segredos JWT
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed   # cria usuários e dados de exemplo
npm run dev        # roda em http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev   # roda em http://localhost:5173
```

O Vite já está configurado com proxy de `/api` para `http://localhost:3000`.

## 🔑 Credenciais de teste (após `npm run db:seed`)

| Acesso | E-mail | Senha |
|---|---|---|
| Painel — Admin | admin@autotrack.com | admin123 |
| Painel — Mecânico | mecanico@autotrack.com | mecanico123 |
| Portal — Cliente | edvaldo@email.com | cliente123 |

- Painel interno: `http://localhost:5173/login`
- Portal do cliente: `http://localhost:5173/portal/login`

## 🧩 Funcionalidades

### Painel interno (equipe)
- **Dashboard** — OS em aberto, concluídas no mês, faturamento, a receber, lista de OS recentes
- **Clientes** — CRUD completo, cada cliente recebe login para o portal
- **Veículos** — CRUD + **botão "Registrar visita"** (data, km, motivo) — é o "o veículo passou aqui" que você pediu
- **Veículo (detalhe)** — histórico de visitas + OS desse veículo
- **Ordens de Serviço** — criação com múltiplos serviços e peças, cada peça com campo de garantia em meses; edição de status (pendente → em andamento → concluído)
- **Orçamentos** — mesma lógica de OS, mas com status pendente/aprovado/rejeitado/expirado e validade
- **Configurações** — criar novos usuários internos (admin/mecânico)

### Portal do cliente
- **Login próprio** (JWT separado do painel interno, rota `/portal/...`)
- **Início** — resumo (nº de veículos, OS, orçamentos pendentes)
- **Meus Veículos** — dados + últimas visitas
- **Histórico de Serviços** — para cada OS: o que foi feito, peças trocadas, e **status de garantia de cada peça** (válida/expirada/sem garantia), com data de expiração
- **Orçamentos** — orçamentos recebidos, com serviços/peças propostos e status

## 🎨 Design

O design segue fielmente as referências enviadas: sidebar escura (#1A1A2E) com destaque vinho (#9B1C2E), cards brancos com sombra leve, badges coloridos de status (verde/amarelo/vermelho com bolinha), tabelas com ações em botões coloridos (editar=azul, excluir=vermelho, ver=laranja). O portal do cliente usa os mesmos tokens visuais, mas em layout de cards/timeline (mais adequado a uma experiência simplificada e mobile-friendly) em vez da sidebar de gestão.

## 🔒 Segurança

- Senhas com bcrypt (10 rounds)
- Dois segredos JWT distintos (`JWT_SECRET` para equipe, `JWT_CLIENT_SECRET` para clientes) — um token de cliente nunca acessa rotas do painel e vice-versa
- Todas as rotas de dados exigem token válido via middleware
- CORS restrito ao domínio do frontend

## 📌 Próximos passos sugeridos

- Upload de fotos do veículo/peças nas OS
- Notificação por e-mail/WhatsApp quando uma OS é concluída ou um orçamento é criado
- Exportar OS/orçamento em PDF (a skill de PDF deste ambiente pode gerar isso)
- Página de "esqueci minha senha" para clientes
- Filtro de período no dashboard (hoje só olha o mês corrente)
