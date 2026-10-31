-- ==============================================================================
-- Brightloop Subscription Management System - Complete Supabase PostgreSQL Schema
-- Covering all 19 Entities, Foreign Keys, Indexes, Constraints, and RLS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE billing_interval AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'past_due', 'canceled', 'expired', 'trialing');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'settled', 'partial', 'overdue', 'failed', 'void');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('succeeded', 'pending', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 2. PROFILES (Linked with auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    company TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. STAFF (Internal RevOps, Support, and Admin Operators)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    department TEXT NOT NULL DEFAULT 'RevOps',
    title TEXT NOT NULL,
    permissions JSONB DEFAULT '["read", "write"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. CUSTOMERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    billing_address TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    tax_identifier TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'lead')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PRODUCTS (e.g. Brightloop CRM, Brightloop Analytics, Brightloop Support)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. PRODUCT_VARIANTS (Seat-based, Storage-based, High-RPS Nodes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Starter', 'Growth', 'Enterprise', 'Custom')),
    base_price_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_name TEXT NOT NULL DEFAULT 'seat',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. PLANS (Daily, Weekly, Monthly, Yearly Billing Schedules)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('Starter', 'Growth', 'Enterprise', 'Custom')),
    billing_interval billing_interval NOT NULL DEFAULT 'monthly',
    price_usd NUMERIC(12, 2) NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    max_seats TEXT DEFAULT '10',
    trial_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. TAXES (Standard, GST, VAT, Sales Tax)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.taxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    rate_percent NUMERIC(5, 2) NOT NULL,
    country_code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. DISCOUNTS (Fixed or Percentage Coupons and Enterprise Concessions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type discount_type NOT NULL DEFAULT 'percentage',
    value NUMERIC(12, 2) NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. QUOTATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    subtotal_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_id UUID REFERENCES public.taxes(id) ON DELETE SET NULL,
    tax_amount_usd NUMERIC(12, 2) DEFAULT 0,
    discount_id UUID REFERENCES public.discounts(id) ON DELETE SET NULL,
    discount_amount_usd NUMERIC(12, 2) DEFAULT 0,
    total_amount_usd NUMERIC(12, 2) NOT NULL,
    billing_interval billing_interval NOT NULL DEFAULT 'monthly',
    seat_count INTEGER NOT NULL DEFAULT 1,
    status quotation_status NOT NULL DEFAULT 'sent',
    valid_until DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. QUOTATION_ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_usd NUMERIC(12, 2) NOT NULL,
    total_price_usd NUMERIC(12, 2) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 12. SUBSCRIPTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_number TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    company TEXT NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'Growth',
    billing_interval billing_interval NOT NULL DEFAULT 'monthly',
    status subscription_status NOT NULL DEFAULT 'active',
    amount_usd NUMERIC(12, 2) NOT NULL,
    mrr_contribution_usd NUMERIC(12, 2) NOT NULL,
    seat_count INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    current_period_end DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    trial_end_date DATE,
    canceled_at TIMESTAMPTZ,
    payment_method JSONB DEFAULT '{"type": "card", "brand": "Visa", "last4": "4242"}'::jsonb,
    dunning_attempts INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. SUBSCRIPTION_ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_usd NUMERIC(12, 2) NOT NULL,
    total_price_usd NUMERIC(12, 2) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 14. INVOICES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    company TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status invoice_status NOT NULL DEFAULT 'pending',
    billing_period_start DATE,
    billing_period_end DATE,
    subtotal_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_id UUID REFERENCES public.taxes(id) ON DELETE SET NULL,
    tax_rate_percent NUMERIC(5, 2) DEFAULT 0,
    tax_amount_usd NUMERIC(12, 2) DEFAULT 0,
    discount_id UUID REFERENCES public.discounts(id) ON DELETE SET NULL,
    discount_amount_usd NUMERIC(12, 2) DEFAULT 0,
    amount_usd NUMERIC(12, 2) NOT NULL,
    amount_paid_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance_due_usd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    settled_at TIMESTAMPTZ,
    payment_method_summary TEXT DEFAULT 'Primary Rail',
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate invoices for the same subscription and period
    CONSTRAINT unique_sub_billing_period UNIQUE (subscription_id, billing_period_start, billing_period_end)
);

-- ------------------------------------------------------------------------------
-- 15. INVOICE_ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_usd NUMERIC(12, 2) NOT NULL,
    total_price_usd NUMERIC(12, 2) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 16. PAYMENTS (Transactions & Receipts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT NOT NULL UNIQUE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    company TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status payment_status NOT NULL DEFAULT 'succeeded',
    payment_rail TEXT NOT NULL DEFAULT 'Stripe Card Rail',
    transaction_ref TEXT NOT NULL,
    settled_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 17. DISCOUNT_USAGE (Audit trail for coupons)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discount_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_id UUID NOT NULL REFERENCES public.discounts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    applied_amount_usd NUMERIC(12, 2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 18. BILLING_EVENTS (Recurring Billing & Dunning Engine Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'renewal_generated', 'payment_charged', 'payment_failed', 'retry_scheduled'
    status TEXT NOT NULL DEFAULT 'success',
    amount_usd NUMERIC(12, 2),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 19. ACTIVITY_LOGS (Audit Trail for RevOps Actions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 20. NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 21. INDEXES FOR HIGH-THROUGHPUT QUERIES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_sub_id ON public.billing_events(subscription_id);

-- ------------------------------------------------------------------------------
-- 22. AUTOMATIC BALANCE UPDATE TRIGGER ON PAYMENTS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    tot_paid NUMERIC(12, 2);
    inv_total NUMERIC(12, 2);
BEGIN
    IF (NEW.invoice_id IS NOT NULL AND NEW.status = 'succeeded') THEN
        -- Calculate total successful payments for this invoice
        SELECT COALESCE(SUM(amount_usd), 0) INTO tot_paid
        FROM public.payments
        WHERE invoice_id = NEW.invoice_id AND status = 'succeeded';

        SELECT amount_usd INTO inv_total
        FROM public.invoices
        WHERE id = NEW.invoice_id;

        UPDATE public.invoices
        SET
            amount_paid_usd = tot_paid,
            balance_due_usd = GREATEST(0, inv_total - tot_paid),
            status = CASE
                WHEN tot_paid >= inv_total THEN 'settled'::invoice_status
                WHEN tot_paid > 0 THEN 'partial'::invoice_status
                ELSE status
            END,
            settled_at = CASE WHEN tot_paid >= inv_total THEN NOW() ELSE settled_at END,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_invoice_on_payment ON public.payments;
CREATE TRIGGER trg_update_invoice_on_payment
    AFTER INSERT OR UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_invoice_on_payment();

-- ------------------------------------------------------------------------------
-- 23. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT COALESCE(
        (SELECT role FROM public.profiles WHERE id = auth.uid()),
        'customer'::user_role
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Admins can view/edit all; users view/edit own
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Catalog (Products, Variants, Plans, Taxes, Discounts): Publicly readable, Staff/Admin manageable
CREATE POLICY "Read products" ON public.products FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Manage products" ON public.products FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Read variants" ON public.product_variants FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Manage variants" ON public.product_variants FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Read plans" ON public.plans FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Manage plans" ON public.plans FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Read taxes" ON public.taxes FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Manage taxes" ON public.taxes FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Read discounts" ON public.discounts FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Manage discounts" ON public.discounts FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));

-- Customers: Admin/Staff manage all; Customers read own record only
CREATE POLICY "Admin/Staff manage customers" ON public.customers FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers view own record" ON public.customers FOR SELECT TO authenticated USING (user_id = auth.uid() OR email = auth.jwt() ->> 'email');

-- Subscriptions & Items: Admin/Staff manage all; Customers read own only
CREATE POLICY "Admin/Staff manage subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers view own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (
    customer_email = auth.jwt() ->> 'email' OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email')
);
CREATE POLICY "Admin/Staff manage sub_items" ON public.subscription_items FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers read own sub_items" ON public.subscription_items FOR SELECT TO authenticated USING (
    subscription_id IN (SELECT id FROM public.subscriptions WHERE customer_email = auth.jwt() ->> 'email')
);

-- Quotations & Items: Admin/Staff manage all; Customers read own
CREATE POLICY "Admin/Staff manage quotations" ON public.quotations FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers view own quotations" ON public.quotations FOR SELECT TO authenticated USING (
    email = auth.jwt() ->> 'email' OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email')
);
CREATE POLICY "Admin/Staff manage quote_items" ON public.quotation_items FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers read own quote_items" ON public.quotation_items FOR SELECT TO authenticated USING (
    quotation_id IN (SELECT id FROM public.quotations WHERE email = auth.jwt() ->> 'email')
);

-- Invoices & Items: Admin/Staff manage all; Customers read own
CREATE POLICY "Admin/Staff manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers view own invoices" ON public.invoices FOR SELECT TO authenticated USING (
    customer_email = auth.jwt() ->> 'email' OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email')
);
CREATE POLICY "Admin/Staff manage invoice_items" ON public.invoice_items FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers read own invoice_items" ON public.invoice_items FOR SELECT TO authenticated USING (
    invoice_id IN (SELECT id FROM public.invoices WHERE customer_email = auth.jwt() ->> 'email')
);

-- Payments: Admin/Staff manage all; Customers read own
CREATE POLICY "Admin/Staff manage payments" ON public.payments FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Customers view own payments" ON public.payments FOR SELECT TO authenticated USING (
    customer_email = auth.jwt() ->> 'email' OR customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email')
);

-- System Logs & Notifications
CREATE POLICY "Admin/Staff read billing_events" ON public.billing_events FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Admin/Staff read activity_logs" ON public.activity_logs FOR ALL TO authenticated USING (public.get_auth_role() IN ('admin', 'staff'));
CREATE POLICY "Users read own notifications" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 24. AUTH HOOK TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
