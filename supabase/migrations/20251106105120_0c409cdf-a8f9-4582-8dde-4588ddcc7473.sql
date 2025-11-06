-- Ensure no invalid product references before adding FK
UPDATE public.order_items oi
SET product_id = NULL
WHERE product_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.id = oi.product_id);

-- Add FK: order_items.order_id -> orders.id (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_order_id_fkey'
  ) THEN
    ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id)
    REFERENCES public.orders(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add FK: order_items.product_id -> products.id (nullable, if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_fkey'
  ) THEN
    ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES public.products(id)
    ON DELETE SET NULL;
  END IF;
END $$;