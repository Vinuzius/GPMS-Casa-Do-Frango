-- =========================================================
-- CASA DO FRANGO — Schema adaptado para Postgres (Supabase)
-- Usa auth.users nativo do Supabase em vez de tabela própria
-- de usuários/senhas.
-- =========================================================

-- ---------------------------------------------------------
-- 0. TIPOS ENUM (Postgres não aceita ENUM inline como MySQL)
-- ---------------------------------------------------------

CREATE TYPE forma_pagamento_enum AS ENUM ('dinheiro', 'cartao', 'pix');

CREATE TYPE status_pedido_enum AS ENUM (
  'recebido', 'confirmado', 'em_preparo', 'saiu_para_entrega', 'entregue', 'cancelado'
);

CREATE TYPE remetente_tipo_enum AS ENUM ('cliente', 'admin');

-- ---------------------------------------------------------
-- 1. PERFIL DO USUÁRIO
-- auth.users já cuida de: email, senha (hash), confirmação de
-- e-mail, recuperação de senha, tokens de sessão/refresh.
-- Aqui guardamos só os dados extras que o app precisa.
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(30),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enderecos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  apelido VARCHAR(50),
  logradouro VARCHAR(150) NOT NULL,
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(80),
  cidade VARCHAR(80),
  estado VARCHAR(2),
  cep VARCHAR(15),
  is_padrao BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------
-- 2. CARDÁPIO
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(60) NOT NULL,
  ordem INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS itens_cardapio (
  id SERIAL PRIMARY KEY,
  categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  imagem_url VARCHAR(255),   -- URL pública de um bucket do Supabase Storage
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------
-- 3. CARRINHO
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS carrinhos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carrinho_itens (
  id SERIAL PRIMARY KEY,
  carrinho_id INT NOT NULL REFERENCES carrinhos(id) ON DELETE CASCADE,
  item_cardapio_id INT NOT NULL REFERENCES itens_cardapio(id) ON DELETE CASCADE,
  quantidade INT NOT NULL DEFAULT 1,
  UNIQUE (carrinho_id, item_cardapio_id)
);

-- ---------------------------------------------------------
-- 4. PEDIDOS
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endereco_id INT NOT NULL REFERENCES enderecos(id) ON DELETE RESTRICT,
  forma_pagamento forma_pagamento_enum NOT NULL DEFAULT 'dinheiro',
  status status_pedido_enum NOT NULL DEFAULT 'recebido',
  total NUMERIC(10,2) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);

-- Snapshot dos itens no momento da compra
CREATE TABLE IF NOT EXISTS pedido_itens (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  item_cardapio_id INT NOT NULL REFERENCES itens_cardapio(id) ON DELETE RESTRICT,
  nome_item VARCHAR(120) NOT NULL,
  categoria_item VARCHAR(60) NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedido_status_historico (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  status_anterior status_pedido_enum,
  status_novo status_pedido_enum NOT NULL,
  alterado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  alterado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- 5. CHAT COM A LOJA
-- ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS conversas (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mensagens (
  id SERIAL PRIMARY KEY,
  conversa_id INT NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  remetente_tipo remetente_tipo_enum NOT NULL,
  texto TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  enviada_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- 6. TRIGGER PARA atualizado_em (Postgres não tem
-- "ON UPDATE CURRENT_TIMESTAMP" nativo como o MySQL)
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_carrinhos_atualizado_em
  BEFORE UPDATE ON carrinhos
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_pedidos_atualizado_em
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();