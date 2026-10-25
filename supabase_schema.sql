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

-- 4. Create Client Projects Table
CREATE TABLE IF NOT EXISTS public.client_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    director_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'in-progress', -- 'in-progress', 'completed', 'paused'
    phase TEXT,
    progress_percentage INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Project Deliverables Table
CREATE TABLE IF NOT EXISTS public.project_deliverables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'ready-for-review', -- 'ready-for-review', 'reviewed', 'approved'
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Client Invoices Table
CREATE TABLE IF NOT EXISTS public.client_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    director_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    description TEXT,
    amount_ngn INTEGER NOT NULL,
    status TEXT DEFAULT 'unpaid', -- 'paid', 'unpaid', 'overdue'
    paystack_reference TEXT,
    due_date TIMESTAMPTZ,
    paid_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Client Contracts Table
CREATE TABLE IF NOT EXISTS public.client_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    director_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    contract_name TEXT NOT NULL,
    contract_type TEXT, -- 'nda', 'msa', 'service-agreement', etc.
    file_url TEXT,
    is_signed BOOLEAN DEFAULT FALSE,
    signed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Client Profile Table
CREATE TABLE IF NOT EXISTS public.client_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT,
    company_logo_url TEXT,
    primary_contact_name TEXT,
    primary_contact_email TEXT,
    phone_number TEXT,
    industry TEXT,
    company_size TEXT, -- 'startup', 'small', 'medium', 'enterprise'
    location TEXT,
    website TEXT,
    services_description TEXT,
    billing_address TEXT,
    company_registration TEXT,
    tax_id TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_sort_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- 10. Set up RLS Policies (Idempotent: drops old policies if they exist)
DROP POLICY IF EXISTS "Allow public read access to plans" ON public.plans;
CREATE POLICY "Allow public read access to plans" 
ON public.plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users to read their own subscription" ON public.subscriptions;
CREATE POLICY "Allow users to read their own subscription" 
ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to read their own payments" ON public.payments;
CREATE POLICY "Allow users to read their own payments" 
ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Client Projects RLS
DROP POLICY IF EXISTS "Clients can view their own projects" ON public.client_projects;
CREATE POLICY "Clients can view their own projects" 
ON public.client_projects FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Directors can view their own projects" ON public.client_projects;
CREATE POLICY "Directors can view their own projects" 
ON public.client_projects FOR SELECT USING (auth.uid() = director_id);

DROP POLICY IF EXISTS "Directors can create projects" ON public.client_projects;
CREATE POLICY "Directors can create projects" 
ON public.client_projects FOR INSERT WITH CHECK (auth.uid() = director_id);

DROP POLICY IF EXISTS "Directors can update their projects" ON public.client_projects;
CREATE POLICY "Directors can update their projects" 
ON public.client_projects FOR UPDATE USING (auth.uid() = director_id) WITH CHECK (auth.uid() = director_id);

-- Client Invoices RLS
DROP POLICY IF EXISTS "Clients can view their own invoices" ON public.client_invoices;
CREATE POLICY "Clients can view their own invoices" 
ON public.client_invoices FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Directors can view their invoices" ON public.client_invoices;
CREATE POLICY "Directors can view their invoices" 
ON public.client_invoices FOR SELECT USING (auth.uid() = director_id);

DROP POLICY IF EXISTS "Directors can create invoices" ON public.client_invoices;
CREATE POLICY "Directors can create invoices" 
ON public.client_invoices FOR INSERT WITH CHECK (auth.uid() = director_id);

DROP POLICY IF EXISTS "Directors can update their invoices" ON public.client_invoices;
CREATE POLICY "Directors can update their invoices" 
ON public.client_invoices FOR UPDATE USING (auth.uid() = director_id) WITH CHECK (auth.uid() = director_id);

DROP POLICY IF EXISTS "Clients can update invoice status" ON public.client_invoices;
CREATE POLICY "Clients can update invoice status" 
ON public.client_invoices FOR UPDATE USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);

-- Project Deliverables RLS
DROP POLICY IF EXISTS "Directors can create deliverables" ON public.project_deliverables;
CREATE POLICY "Directors can create deliverables" 
ON public.project_deliverables FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_projects 
    WHERE id = project_id AND auth.uid() = director_id
  )
);

DROP POLICY IF EXISTS "Directors can view deliverables for their projects" ON public.project_deliverables;
CREATE POLICY "Directors can view deliverables for their projects" 
ON public.project_deliverables FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.client_projects 
    WHERE id = project_id AND auth.uid() = director_id
  )
);

DROP POLICY IF EXISTS "Clients can view deliverables for their projects" ON public.project_deliverables;
CREATE POLICY "Clients can view deliverables for their projects" 
ON public.project_deliverables FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.client_projects 
    WHERE id = project_id AND auth.uid() = client_id
  )
);

-- Client Contracts RLS
DROP POLICY IF EXISTS "Clients can view their own contracts" ON public.client_contracts;
CREATE POLICY "Clients can view their own contracts" 
ON public.client_contracts FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Clients can update their own contracts" ON public.client_contracts;
CREATE POLICY "Clients can update their own contracts" 
ON public.client_contracts FOR UPDATE USING (auth.uid() = client_id);

-- Client Profiles RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.client_profiles;
CREATE POLICY "Users can view their own profile" 
ON public.client_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.client_profiles;
CREATE POLICY "Users can update their own profile" 
ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.client_profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Insert default subscription plans
INSERT INTO public.plans (id, name, price_ngn, features) VALUES
('free', 'Free Starter', 0, '["5 Clients maximum", "10 Invoices total", "Basic dashboard reports", "Community support"]'),
('test', 'Test Plan', 200, '["Access to payment routing tests", "Holds live payments", "Ideal for developer system checks"]'),
('pro', 'Agency Pro', 5000, '["Unlimited Clients", "Unlimited Invoices", "Full AI Agent access", "Priority support", "Metrics and growth curves"]'),
('agency', 'Agency Enterprise', 15000, '["Everything in Pro", "Private Developer Console", "Client performance reports", "Advanced API integrations", "24/7 dedicated support"]')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, price_ngn = EXCLUDED.price_ngn, features = EXCLUDED.features;

-- 7. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
