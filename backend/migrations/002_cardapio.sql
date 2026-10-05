-- Cardápio: várias categorias por produto, tamanhos com acréscimo de preço
-- e categorias identificadas por slug. Pode ser executada mais de uma vez.

ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS slug VARCHAR(60);
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.categorias ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS categorias_slug_key ON public.categorias (slug);

-- A categoria única dá lugar à tabela de ligação item_categorias.
ALTER TABLE public.itens_cardapio DROP COLUMN IF EXISTS categoria_id;
ALTER TABLE public.itens_cardapio ALTER COLUMN imagem_url TYPE TEXT;

CREATE TABLE IF NOT EXISTS public.item_categorias (
  item_id INT NOT NULL REFERENCES public.itens_cardapio(id) ON DELETE CASCADE,
  categoria_id INT NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, categoria_id)
);

CREATE TABLE IF NOT EXISTS public.item_tamanhos (
  id SERIAL PRIMARY KEY,
  item_id INT NOT NULL REFERENCES public.itens_cardapio(id) ON DELETE CASCADE,
  rotulo VARCHAR(60) NOT NULL,
  acrescimo NUMERIC(10,2) NOT NULL DEFAULT 0,  -- somado ao preço base do item
  ordem INT NOT NULL DEFAULT 0,
  UNIQUE (item_id, rotulo)
);

ALTER TABLE public.item_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_tamanhos ENABLE ROW LEVEL SECURITY;
