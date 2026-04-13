# JusDashboard

Sistema de gerenciamento de processos jurídicos para escritórios de advocacia. Permite controlar clientes, processos, prazos e andamentos em um único painel centralizado.

## Funcionalidades

- **Autenticação** — Login com JWT, rotas protegidas
- **Clientes** — Cadastro completo com CPF/CNPJ, contato e endereço
- **Processos** — Controle de casos jurídicos por área (cível, trabalhista, criminal etc.), vara/tribunal e status
- **Prazos** — Acompanhamento de datas críticas com indicadores visuais de vencimento
- **Andamentos** — Histórico cronológico de movimentações processuais
- **Home** — Painel com resumo de métricas e acesso rápido

## Tecnologias

**Frontend**
- React 19 + React Router v7
- Vite
- TailwindCSS 4 + shadcn/ui
- Axios, date-fns, lucide-react

**Backend**
- Node.js + Express 5
- MySQL2
- JWT (jsonwebtoken) + bcryptjs

**Banco de dados**
- MySQL

## Estrutura do Projeto

```
jusdashboard/
├── frontend/          # Aplicação React (Vite)
│   └── src/
│       ├── pages/     # Páginas (Home, Login, Clientes, Processos, Prazos, Andamentos)
│       ├── components/ # Componentes reutilizáveis (formulários, modais, layout)
│       ├── api/       # Chamadas à API (axios)
│       └── context/   # AuthContext
│
└── backend/           # API REST (Express)
    └── src/
        ├── routes/    # Rotas por recurso
        ├── controllers/ # Lógica de negócio
        ├── middleware/ # Verificação de token JWT
        ├── config/    # Conexão com o banco
        └── database/  # Schema SQL, seeds e scripts
```

## Configuração

### Pré-requisitos

- Node.js 18+
- MySQL 8+

### Variáveis de Ambiente

Crie um arquivo `.env` dentro de `backend/` com base em `.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=jusdashboard
JWT_SECRET=chave_secreta_longa
ADMIN_EMAIL=admin@exemplo.com
ADMIN_SENHA=senha_admin
```

### Banco de Dados

```bash
# Criar o schema
mysql -u seu_usuario -p < backend/src/database/schema.sql

# Inserir dados de exemplo (opcional)
mysql -u seu_usuario -p jusdashboard < backend/src/database/seed.sql

# Criar o usuário administrador
node backend/src/database/criar_admin.js
```

### Instalação e Execução

```bash
# Backend
cd backend
npm install
npm run dev      # porta 3000

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev      # porta 5173
```

### Build para Produção

```bash
cd frontend
npm run build    # gera dist/
```

## API

Todas as rotas (exceto autenticação) exigem o header:

```
Authorization: Bearer <token>
```

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Autenticação |
| GET | `/api/health` | Status da API |
| GET/POST | `/api/clientes` | Listar/criar clientes |
| GET/PUT/DELETE | `/api/clientes/:id` | Detalhar/editar/remover cliente |
| GET/POST | `/api/processos` | Listar/criar processos |
| GET/PUT/DELETE | `/api/processos/:id` | Detalhar/editar/remover processo |
| GET/POST | `/api/prazos` | Listar/criar prazos |
| GET/PUT/DELETE | `/api/prazos/:id` | Detalhar/editar/remover prazo |
| GET/POST | `/api/andamentos` | Listar/criar andamentos |
| GET/PUT/DELETE | `/api/andamentos/:id` | Detalhar/editar/remover andamento |
