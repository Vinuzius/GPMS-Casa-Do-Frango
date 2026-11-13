-- Pedidos: retirada no local, endereço e tamanho como snapshot da compra
-- e numeração começando em 1001. Pode ser executada mais de uma vez.

DO $$
BEGIN
  IF (SELECT count(*) FROM public.pedidos) > 0
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'tipo_atendimento'
     ) THEN
    RAISE EXCEPTION 'A tabela pedidos já tem dados; revise a migração 003 antes de aplicá-la.';
  END IF;
END $$;

ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS tipo_atendimento VARCHAR(10) NOT NULL DEFAULT 'entrega';
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_tipo_atendimento_check;
ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_tipo_atendimento_check
  CHECK (tipo_atendimento IN ('entrega', 'retirada'));

-- O endereço é copiado para o pedido; o cliente pode apagar endereços já usados.
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS endereco_snapshot JSONB;
ALTER TABLE public.pedidos ALTER COLUMN endereco_id DROP NOT NULL;
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_endereco_id_fkey;
ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_endereco_id_fkey
  FOREIGN KEY (endereco_id) REFERENCES public.enderecos(id) ON DELETE SET NULL;

ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS tamanho_item VARCHAR(60);

CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em ON public.pedidos (criado_em);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_item ON public.pedido_itens (item_cardapio_id);

-- Primeiro pedido é o #1001 (só ajusta se ainda não houver pedido acima disso).
SELECT setval('public.pedidos_id_seq', GREATEST(1000, (SELECT COALESCE(MAX(id), 0) FROM public.pedidos)));
