# GPMS - Casa do Frango

Sistema de gerenciamento e pedidos para o restaurante **Casa do Frango**, desenvolvido para a disciplina de **Gerência de Projetos e Manutenção de Software (GPMS)**.

O projeto conta com uma arquitetura separada em **Frontend (Angular)** e **Backend (FastAPI)**, integrando autenticação e persistência de dados.

>  **Documentação complementar:**
> [Documento de Visão do Projeto](https://docs.google.com/document/d/1UHm79fuCZcW5FyAKFuGu_YoaHxD7NzMgEA6u6IE4RR8/)

---

## Principais Funcionalidades

- **Autenticação e Perfis:**
  - Cadastro e login de usuários (clientes e administradores) com validação via Supabase / JWT.
  - Gerenciamento de perfil e dados de usuário.
- **Cardápio Interativo:**
  - Visualização de itens e pratos disponíveis para pedido.
  - Filtros e listagem detalhada.
- **Pedidos e Carrinho de Compras:**
  - Adição e remoção de itens no carrinho.
  - Acompanhamento de pedidos em andamento.
  - Histórico de pedidos realizados.
- **Painel Administrativo (Admin / Dashboard):**
  - Gestão de pedidos e fluxo de atendimento.
  - Controle administrativo do sistema e relatórios básicos.
- **Notificações:**
  - Central de notificações sobre o status dos pedidos.

---

## Tecnologias Utilizadas

- **Frontend:** [Angular 21](https://angular.dev/) + [Angular Material](https://material.angular.io/) + TypeScript + SCSS
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) + [SQLAlchemy](https://www.sqlalchemy.org/) + [Pydantic](https://docs.pydantic.dev/) + Python 3.10+
- **Banco de Dados / Auth:** PostgreSQL / Supabase
- **Testes:** Pytest (Backend) / Vitest (Frontend)

---

## Como Rodar o Projeto

### Pré-requisitos
- **Node.js** (versão 20+ recomendada) e **npm**
- **Python** (versão 3.10+)
- Banco de dados PostgreSQL configurado (ou projeto Supabase)

---

### 1. Configurando e Rodando o Backend

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv .venv
   source .venv/bin/activate    # Linux / macOS
   # ou: .venv\Scripts\activate # Windows
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` baseado no [.env.exemple](file:///home/vinicius/Documents/programs/GPMS-Casa-Do-Frango/backend/.env.exemple):
     ```bash
     cp .env.exemple .env
     ```
   - Preencha os campos `DATABASE_URL` e `SUPABASE_JWKS_URL`.

5. Execute o servidor de desenvolvimento:
   ```bash
   python run.py
   # ou: uvicorn app.main:app --reload
   ```
   O backend estará disponível em `http://localhost:8000` (documentação Swagger interativa em `http://localhost:8000/docs`).

#### Banco de dados: migrações e dados de exemplo

> **Atenção:** desenvolvimento e o site publicado usam o **mesmo** banco Supabase. Tudo que for criado localmente aparece em produção.

- As migrações ficam em `backend/migrations/` e são aplicadas à mão, em ordem, no SQL Editor da Supabase. Todas podem ser executadas mais de uma vez sem efeito colateral.
- Pedidos de demonstração para o dashboard (cria ~40 pedidos dos últimos 30 dias na conta informada):
  ```bash
  python -m seeds.seed_pedidos email-do-cliente@exemplo.com
  python -m seeds.seed_pedidos email-do-cliente@exemplo.com --limpar   # apaga todos os pedidos dessa conta
  ```

---

### 2. Configurando e Rodando o Frontend

1. Acesse o diretório do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências do Node:
   ```bash
   npm install
   ```

3. Inicie a aplicação Angular:
   ```bash
   npm start
   ```
   Acesse a aplicação no navegador em `http://localhost:4200`.

---

## Executando Testes

- **Backend:**
  ```bash
  cd backend
  pytest
  ```

- **Frontend:**
  ```bash
  cd frontend
  npm test
  ```
