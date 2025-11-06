-- Add order_token column for secure guest order lookup
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL;

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_orders_order_token ON public.orders(order_token);

-- Drop the insecure guest order policy
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new secure policy - only authenticated users can see their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for guest order lookup via token (handled by edge function)
CREATE POLICY "Service role can access all orders"
ON public.orders
FOR SELECT
TO service_role
USING (true);

-- Update order_items policy to match
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;

CREATE POLICY "Users can view their order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Create table for rate limiting email sends
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  recipient_email text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_send_log_order_id ON public.email_send_log(order_id, sent_at);