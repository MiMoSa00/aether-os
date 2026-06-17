-- 1. Create Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_ngn INTEGER NOT NULL,
    features JSONB
);

-- 2. Create User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES public.plans(id),
    status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled'
    paystack_customer_code TEXT,
    paystack_subscription_code TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_ngn INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    paystack_reference TEXT UNIQUE,
    plan_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS Policies (Idempotent: drops old policies if they exist)
DROP POLICY IF EXISTS "Allow public read access to plans" ON public.plans;
CREATE POLICY "Allow public read access to plans" 
ON public.plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to read their own subscription" ON public.subscriptions;
CREATE POLICY "Allow users to read their own subscription" 
ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to read their own payments" ON public.payments;
CREATE POLICY "Allow users to read their own payments" 
ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- 6. Insert default subscription plans
INSERT INTO public.plans (id, name, price_ngn, features) VALUES
('free', 'Free Starter', 0, '["5 Clients maximum", "10 Invoices total", "Basic dashboard reports", "Community support"]'),
('pro', 'Agency Pro', 5000, '["Unlimited Clients", "Unlimited Invoices", "Full AI Agent access", "Priority support", "Metrics and growth curves"]'),
('agency', 'Agency Enterprise', 15000, '["Everything in Pro", "Private Developer Console", "Client performance reports", "Advanced API integrations", "24/7 dedicated support"]')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, price_ngn = EXCLUDED.price_ngn, features = EXCLUDED.features;

-- 7. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
