-- Create discount_coupons table
CREATE TABLE public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percentage NUMERIC NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  applicable_product_ids UUID[] NOT NULL DEFAULT '{}',
  usage_limit INTEGER NOT NULL DEFAULT 0,
  times_used INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (valid_to > valid_from)
);

-- Enable Row Level Security
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for discount_coupons
CREATE POLICY "Admins can manage discount coupons" 
ON public.discount_coupons 
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active coupons" 
ON public.discount_coupons 
FOR SELECT 
USING (active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_discount_coupons_updated_at
BEFORE UPDATE ON public.discount_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();