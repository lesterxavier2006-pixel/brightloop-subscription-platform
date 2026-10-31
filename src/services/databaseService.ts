import { getSupabase, getSupabaseCredentials } from '../lib/supabase';
import {
  Product,
  ProductVariant,
  Customer,
  Plan,
  Tax,
  Discount,
  DiscountUsage,
  Quotation,
  QuotationItem,
  Subscription,
  SubscriptionItem,
  Invoice,
  InvoiceItem,
  Payment,
  BillingEvent,
  ActivityLog,
  NotificationItem,
  UserRole,
  BillingInterval,
} from '../types';
import {
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

// Initial Mock Seed for Customers
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    companyName: 'Linear Dynamics Labs',
    contactName: 'Aravind Swaminathan',
    email: 'aravind@lineardynamics.io',
    phone: '+1 (555) 349-8812',
    billingAddress: '440 Brannan St, San Francisco, CA',
    currency: 'USD',
    taxIdentifier: 'US-EIN-992182',
    createdAt: '2025-11-14T10:00:00Z',
  },
  {
    id: 'cust_02',
    companyName: 'Prism Cloud Systems',
    contactName: 'Elena Rostova',
    email: 'e.rostova@prismcloud.tech',
    phone: '+44 20 7946 0912',
    billingAddress: '100 Bishopsgate, London, UK',
    currency: 'USD',
    taxIdentifier: 'GB-VAT-884129',
    createdAt: '2025-08-01T09:30:00Z',
  },
  {
    id: 'cust_03',
    companyName: 'Vertex Financial AI',
    contactName: 'Vikramaditya Roy',
    email: 'v.roy@vertexfin.ai',
    phone: '+91 98200 11234',
    billingAddress: 'Bandra-Kurla Complex, Mumbai, India',
    currency: 'USD',
    taxIdentifier: 'IN-GSTIN-27AAACV1298L1Z5',
    createdAt: '2026-01-10T14:15:00Z',
  },
  {
    id: 'cust_04',
    companyName: 'Retool Nexus Software',
    contactName: 'Kavita Menon',
    email: 'kavita@retoolnexus.dev',
    phone: '+1 (415) 890-4411',
    billingAddress: '789 Mission St, San Francisco, CA',
    currency: 'USD',
    taxIdentifier: 'US-EIN-772109',
    createdAt: '2026-03-22T11:00:00Z',
  },
  {
    id: 'cust_05',
    companyName: 'Krypton Security Ops',
    contactName: 'Devon Vance',
    email: 'dvance@kryptonsec.com',
    phone: '+1 (212) 555-0199',
    billingAddress: '1 Wall St, New York, NY',
    currency: 'USD',
    createdAt: '2026-10-18T16:20:00Z',
  },
  {
    id: 'cust_06',
    companyName: 'Dataship Telemetry',
    contactName: 'Ananya Sharma',
    email: 'ananya@dataship.io',
    phone: '+91 80 4123 9000',
    billingAddress: 'Indiranagar, Bangalore, India',
    currency: 'USD',
    taxIdentifier: 'IN-GSTIN-29AABBD8821K1Z2',
    createdAt: '2025-06-12T08:45:00Z',
  },
];

// Initial Mock Seed for Products (Brightloop CRM, Brightloop Analytics, Brightloop Support)
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    code: 'PROD-BL-CRM',
    name: 'Brightloop CRM',
    category: 'Customer Relationship Management',
    description: 'Unified sales pipeline, omni-channel customer records, deal velocity telemetry, and contract automation.',
    isActive: true,
  },
  {
    id: 'prod_02',
    code: 'PROD-BL-ANA',
    name: 'Brightloop Analytics',
    category: 'Revenue & Event Intelligence',
    description: 'Real-time cohort retention modeling, MRR/ARR waterfall telemetry, and subscription health diagnostics.',
    isActive: true,
  },
  {
    id: 'prod_03',
    code: 'PROD-BL-SUP',
    name: 'Brightloop Support',
    category: 'Customer Success & Ticketing',
    description: 'Autonomous ticket triage, omnichannel SLA escalation matrix, and dedicated RevOps concierge desk.',
    isActive: true,
  },
];

// Product Variants for Brightloop Suite
export const INITIAL_PRODUCT_VARIANTS: ProductVariant[] = [
  {
    id: 'var_crm_starter',
    productId: 'prod_01',
    sku: 'SKU-CRM-STR-SEAT',
    name: 'CRM Starter Seat',
    tier: 'Starter',
    basePriceUSD: 49,
    unitName: 'seat',
    description: 'Standard CRM seat with contact timeline and deal stage tracking.',
    isActive: true,
  },
  {
    id: 'var_crm_growth',
    productId: 'prod_01',
    sku: 'SKU-CRM-GRW-SEAT',
    name: 'CRM Growth Seat',
    tier: 'Growth',
    basePriceUSD: 99,
    unitName: 'seat',
    description: 'Advanced pipeline automation, forecasting AI, and custom field matrix.',
    isActive: true,
  },
  {
    id: 'var_crm_ent',
    productId: 'prod_01',
    sku: 'SKU-CRM-ENT-VAULT',
    name: 'CRM Enterprise Vault & SSO',
    tier: 'Enterprise',
    basePriceUSD: 499,
    unitName: 'instance',
    description: 'SAML 2.0 / Okta SSO, custom role permissions, and immutable audit log exports.',
    isActive: true,
  },
  {
    id: 'var_ana_ingest',
    productId: 'prod_02',
    sku: 'SKU-ANA-1M-EVENTS',
    name: 'Event Ingestion (1M Events/Mo)',
    tier: 'Starter',
    basePriceUSD: 150,
    unitName: 'pack',
    description: 'High-throughput sub-second telemetry ingestion pipeline.',
    isActive: true,
  },
  {
    id: 'var_ana_pipeline',
    productId: 'prod_02',
    sku: 'SKU-ANA-DED-PIPE',
    name: 'Dedicated Real-Time Pipeline Node',
    tier: 'Growth',
    basePriceUSD: 350,
    unitName: 'node',
    description: 'Sub-10ms event processing with Snowflake and BigQuery data push.',
    isActive: true,
  },
  {
    id: 'var_sup_seat',
    productId: 'prod_03',
    sku: 'SKU-SUP-PRO-AGENT',
    name: 'Support Pro Agent Seat',
    tier: 'Starter',
    basePriceUSD: 65,
    unitName: 'seat',
    description: 'Omnichannel desk ticket management with live customer chat widget.',
    isActive: true,
  },
  {
    id: 'var_sup_sla',
    productId: 'prod_03',
    sku: 'SKU-SUP-15MIN-SLA',
    name: '15-Minute Critical SLA Line',
    tier: 'Enterprise',
    basePriceUSD: 500,
    unitName: 'line',
    description: '24/7 pager escalation route with dedicated RevOps solution engineers.',
    isActive: true,
  },
];

// Initial Taxes
export const INITIAL_TAXES: Tax[] = [
  {
    id: 'tax_us_ca',
    name: 'US State & Local Sales Tax',
    code: 'US-ST',
    ratePercent: 8.25,
    countryCode: 'US',
    isActive: true,
  },
  {
    id: 'tax_eu_vat',
    name: 'European Union Standard VAT',
    code: 'EU-VAT',
    ratePercent: 20.0,
    countryCode: 'EU',
    isActive: true,
  },
  {
    id: 'tax_in_gst',
    name: 'India Goods & Services Tax (GST)',
    code: 'IN-GST',
    ratePercent: 18.0,
    countryCode: 'IN',
    isActive: true,
  },
];

// Initial Discounts
export const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'disc_launch',
    code: 'LAUNCH20',
    name: 'Brightloop Launch Promotion (20% Off)',
    type: 'percentage',
    value: 20,
    maxUses: 100,
    usedCount: 24,
    validUntil: '2026-12-31',
    isActive: true,
  },
  {
    id: 'disc_scale',
    code: 'GROWTH15',
    name: 'Growth Scale Discount (15% Off)',
    type: 'percentage',
    value: 15,
    maxUses: 250,
    usedCount: 52,
    validUntil: '2026-12-31',
    isActive: true,
  },
  {
    id: 'disc_ent',
    code: 'ENTERPRISE500',
    name: 'Enterprise VIP Concession ($500 Off)',
    type: 'fixed_amount',
    value: 500,
    maxUses: 20,
    usedCount: 6,
    validUntil: '2027-01-01',
    isActive: true,
  },
];

// Initial Mock Seed for Quotations
export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'quote_01',
    quotationNumber: 'Q-2026-0041',
    customerId: 'cust_01',
    customerName: 'Aravind Swaminathan',
    company: 'Linear Dynamics Labs',
    email: 'aravind@lineardynamics.io',
    planId: 'plan_growth',
    planName: 'Growth Infrastructure',
    amountUSD: 10680,
    billingCycle: 'annual',
    seatCount: 25,
    status: 'accepted',
    validUntil: '2026-11-30',
    lineItems: [
      {
        id: 'li_q1',
        description: 'Growth Infrastructure Annual Contract (25 seats included)',
        quantity: 1,
        unitPriceUSD: 8640,
        totalUSD: 8640,
      },
      {
        id: 'li_q2',
        description: 'Dedicated Reverse ETL Integration Connector',
        quantity: 1,
        unitPriceUSD: 2040,
        totalUSD: 2040,
      },
    ],
    notes: '20% prepay discount applied. Accepted by CTO.',
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'quote_02',
    quotationNumber: 'Q-2026-0042',
    customerId: 'cust_03',
    customerName: 'Vikramaditya Roy',
    company: 'Vertex Financial AI',
    email: 'v.roy@vertexfin.ai',
    planId: 'plan_scale',
    planName: 'Global Sovereign',
    amountUSD: 62400,
    billingCycle: 'annual',
    seatCount: 150,
    status: 'sent',
    validUntil: '2026-12-15',
    lineItems: [
      {
        id: 'li_q3',
        description: 'Global Sovereign Tier — Dedicated VPC Node Deployment',
        quantity: 1,
        unitPriceUSD: 62400,
        totalUSD: 62400,
      },
    ],
    notes: 'Under review by Risk & RevOps Committee.',
    createdAt: '2026-10-24T14:30:00Z',
  },
  {
    id: 'quote_03',
    quotationNumber: 'Q-2026-0043',
    customerId: 'cust_05',
    customerName: 'Devon Vance',
    company: 'Krypton Security Ops',
    email: 'dvance@kryptonsec.com',
    planId: 'plan_starter',
    planName: 'Standard Pro',
    amountUSD: 2900,
    billingCycle: 'annual',
    seatCount: 8,
    status: 'draft',
    validUntil: '2026-11-20',
    lineItems: [
      {
        id: 'li_q4',
        description: 'Standard Pro — Annual Contract with 8 developer seats',
        quantity: 1,
        unitPriceUSD: 2900,
        totalUSD: 2900,
      },
    ],
    createdAt: '2026-10-29T17:00:00Z',
  },
];

// Initial Mock Seed for Payments
export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_01',
    paymentNumber: 'PAY-2026-901',
    invoiceId: 'inv_801',
    customerId: 'cust_01',
    customerName: 'Aravind Swaminathan',
    company: 'Linear Dynamics Labs',
    customerEmail: 'aravind@lineardynamics.io',
    amountUSD: 890,
    currency: 'USD',
    status: 'succeeded',
    paymentRail: 'Mastercard Corporate (VAU)',
    transactionRef: 'txn_stripe_984129a',
    settledAt: '2026-10-14T14:22:10Z',
  },
  {
    id: 'pay_02',
    paymentNumber: 'PAY-2026-902',
    invoiceId: 'inv_802',
    customerId: 'cust_02',
    customerName: 'Elena Rostova',
    company: 'Prism Cloud Systems',
    customerEmail: 'e.rostova@prismcloud.tech',
    amountUSD: 23760,
    currency: 'USD',
    status: 'succeeded',
    paymentRail: 'Fedwire / Direct ACH',
    transactionRef: 'ach_wire_781293x',
    settledAt: '2026-08-03T09:12:00Z',
  },
  {
    id: 'pay_03',
    paymentNumber: 'PAY-2026-903',
    invoiceId: 'inv_803',
    customerId: 'cust_03',
    customerName: 'Vikramaditya Roy',
    company: 'Vertex Financial AI',
    customerEmail: 'v.roy@vertexfin.ai',
    amountUSD: 5200,
    currency: 'USD',
    status: 'succeeded',
    paymentRail: 'Visa Signature 3DS',
    transactionRef: 'txn_visa_339182b',
    settledAt: '2026-10-10T18:04:19Z',
  },
  {
    id: 'pay_04',
    paymentNumber: 'PAY-2026-904',
    invoiceId: 'inv_805',
    customerId: 'cust_06',
    customerName: 'Ananya Sharma',
    company: 'Dataship Telemetry',
    customerEmail: 'ananya@dataship.io',
    amountUSD: 2450,
    currency: 'USD',
    status: 'succeeded',
    paymentRail: 'UPI Autopay Mandate',
    transactionRef: 'upi_icici_991204',
    settledAt: '2026-10-12T11:45:00Z',
  },
  {
    id: 'pay_05',
    paymentNumber: 'PAY-2026-905',
    invoiceId: 'inv_804',
    customerId: 'cust_04',
    customerName: 'Kavita Menon',
    company: 'Retool Nexus Software',
    customerEmail: 'kavita@retoolnexus.dev',
    amountUSD: 890,
    currency: 'USD',
    status: 'failed',
    paymentRail: 'Visa Corporate',
    transactionRef: 'decline_exp_7721',
    settledAt: '2026-10-22T08:10:00Z',
  },
];

// Persistent Local Fallback Store
const LOCAL_STORE_KEY = 'brightloop_local_db_v1';

interface LocalDatabaseStore {
  products: Product[];
  variants: ProductVariant[];
  customers: Customer[];
  plans: Plan[];
  taxes: Tax[];
  discounts: Discount[];
  quotations: Quotation[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments: Payment[];
  billingEvents: BillingEvent[];
  notifications: NotificationItem[];
}

function getLocalStore(): LocalDatabaseStore {
  const getDefault = (): LocalDatabaseStore => ({
    products: INITIAL_PRODUCTS,
    variants: INITIAL_PRODUCT_VARIANTS,
    customers: INITIAL_CUSTOMERS,
    plans: INITIAL_PLANS,
    taxes: INITIAL_TAXES,
    discounts: INITIAL_DISCOUNTS,
    quotations: INITIAL_QUOTATIONS,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    invoices: INITIAL_INVOICES,
    payments: INITIAL_PAYMENTS,
    billingEvents: [],
    notifications: INITIAL_NOTIFICATIONS,
  });

  if (typeof window === 'undefined') {
    return getDefault();
  }

  const raw = localStorage.getItem(LOCAL_STORE_KEY);
  if (!raw) {
    const initial = getDefault();
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      products: parsed.products || INITIAL_PRODUCTS,
      variants: parsed.variants || INITIAL_PRODUCT_VARIANTS,
      customers: parsed.customers || INITIAL_CUSTOMERS,
      plans: parsed.plans || INITIAL_PLANS,
      taxes: parsed.taxes || INITIAL_TAXES,
      discounts: parsed.discounts || INITIAL_DISCOUNTS,
      quotations: parsed.quotations || INITIAL_QUOTATIONS,
      subscriptions: parsed.subscriptions || INITIAL_SUBSCRIPTIONS,
      invoices: parsed.invoices || INITIAL_INVOICES,
      payments: parsed.payments || INITIAL_PAYMENTS,
      billingEvents: parsed.billingEvents || [],
      notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
    };
  } catch {
    return getDefault();
  }
}

function saveLocalStore(store: LocalDatabaseStore) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(store));
  }
}

// ==============================================================================
// 1. PRODUCTS CRUD
// ==============================================================================
export async function fetchProducts(): Promise<Product[]> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          category: d.category,
          description: d.description,
          isActive: d.is_active,
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local products:', e);
    }
  }
  return getLocalStore().products;
}

export async function createProduct(prod: Omit<Product, 'id'>): Promise<Product> {
  const { isConfigured } = getSupabaseCredentials();
  const newProduct: Product = { ...prod, id: `prod_${Date.now()}` };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('products').insert({
        code: prod.code,
        name: prod.name,
        category: prod.category,
        description: prod.description,
        is_active: prod.isActive,
      }).select().single();
      if (!error && data) {
        return {
          id: data.id,
          code: data.code,
          name: data.name,
          category: data.category,
          description: data.description,
          isActive: data.is_active,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Error creating product in Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.products.unshift(newProduct);
  saveLocalStore(store);
  return newProduct;
}

// ==============================================================================
// 2. CUSTOMERS CRUD
// ==============================================================================
export async function fetchCustomers(role: UserRole, userEmail?: string): Promise<Customer[]> {
  const { isConfigured } = getSupabaseCredentials();
  let list = getLocalStore().customers;

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (role === 'customer' && userEmail) {
        query = query.eq('email', userEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          companyName: c.company_name,
          contactName: c.contact_name,
          email: c.email,
          phone: c.phone,
          billingAddress: c.billing_address,
          currency: c.currency,
          taxIdentifier: c.tax_identifier,
          createdAt: c.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local customers:', e);
    }
  }

  // Enforce customer role-based access control filter
  if (role === 'customer' && userEmail) {
    return list.filter((c) => c.email.toLowerCase() === userEmail.toLowerCase());
  }
  return list;
}

export async function createCustomer(c: Omit<Customer, 'id'>): Promise<Customer> {
  const { isConfigured } = getSupabaseCredentials();
  const newCustomer: Customer = { ...c, id: `cust_${Date.now()}` };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('customers').insert({
        company_name: c.companyName,
        contact_name: c.contactName,
        email: c.email,
        phone: c.phone,
        billing_address: c.billingAddress,
        currency: c.currency || 'USD',
        tax_identifier: c.taxIdentifier,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          companyName: data.company_name,
          contactName: data.contact_name,
          email: data.email,
          phone: data.phone,
          billingAddress: data.billing_address,
          currency: data.currency,
          taxIdentifier: data.tax_identifier,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Error saving customer to Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.customers.unshift(newCustomer);
  saveLocalStore(store);
  return newCustomer;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('customers').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.customers = store.customers.filter((c) => c.id !== id);
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 3. PLANS CRUD
// ==============================================================================
export async function fetchPlans(): Promise<Plan[]> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('plans').select('*').order('monthly_price_usd', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          productId: p.product_id,
          code: p.code,
          name: p.name,
          tier: p.tier,
          description: p.description,
          monthlyPriceUSD: Number(p.monthly_price_usd),
          annualPriceUSD: Number(p.annual_price_usd),
          features: Array.isArray(p.features) ? p.features : [],
          maxSeats: p.max_seats === 'Unlimited' ? 'Unlimited' : Number(p.max_seats) || 10,
          activeSubscribers: 12, // Live computed
          popular: p.popular,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local plans:', e);
    }
  }
  return getLocalStore().plans;
}

export async function createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
  const { isConfigured } = getSupabaseCredentials();
  const newPlan: Plan = { ...plan, id: `plan_${Date.now()}` };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('plans').insert({
        code: plan.code,
        name: plan.name,
        tier: plan.tier,
        description: plan.description,
        monthly_price_usd: plan.monthlyPriceUSD,
        annual_price_usd: plan.annualPriceUSD,
        features: plan.features,
        max_seats: String(plan.maxSeats),
        popular: plan.popular || false,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          code: data.code,
          name: data.name,
          tier: data.tier,
          description: data.description,
          monthlyPriceUSD: Number(data.monthly_price_usd),
          annualPriceUSD: Number(data.annual_price_usd),
          features: data.features,
          maxSeats: data.max_seats,
          activeSubscribers: 0,
          popular: data.popular,
        };
      }
    } catch (e) {
      console.warn('Error creating plan in Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.plans.push(newPlan);
  saveLocalStore(store);
  return newPlan;
}

// ==============================================================================
// 4. QUOTATIONS CRUD
// ==============================================================================
export async function fetchQuotations(role: UserRole, userEmail?: string): Promise<Quotation[]> {
  const { isConfigured } = getSupabaseCredentials();
  let list = getLocalStore().quotations;

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('quotations').select('*').order('created_at', { ascending: false });
      if (role === 'customer' && userEmail) {
        query = query.eq('email', userEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data.map((q: any) => ({
          id: q.id,
          quotationNumber: q.quotation_number,
          customerId: q.customer_id,
          customerName: q.customer_name,
          company: q.company,
          email: q.email,
          planId: q.plan_id,
          planName: q.plan_name,
          amountUSD: Number(q.amount_usd),
          billingCycle: q.billing_cycle,
          seatCount: q.seat_count || 1,
          status: q.status,
          validUntil: q.valid_until,
          lineItems: Array.isArray(q.line_items) ? q.line_items : [],
          notes: q.notes,
          createdAt: q.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local quotations:', e);
    }
  }

  if (role === 'customer' && userEmail) {
    return list.filter((q) => q.email.toLowerCase() === userEmail.toLowerCase());
  }
  return list;
}

export async function createQuotation(quote: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>): Promise<Quotation> {
  const { isConfigured } = getSupabaseCredentials();
  const qNum = `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newQuote: Quotation = {
    ...quote,
    id: `quote_${Date.now()}`,
    quotationNumber: qNum,
    createdAt: new Date().toISOString(),
  };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('quotations').insert({
        quotation_number: qNum,
        customer_id: quote.customerId,
        customer_name: quote.customerName,
        company: quote.company,
        email: quote.email,
        plan_id: quote.planId,
        plan_name: quote.planName,
        amount_usd: quote.amountUSD,
        billing_cycle: quote.billingCycle,
        seat_count: quote.seatCount,
        status: quote.status,
        valid_until: quote.validUntil,
        line_items: quote.lineItems,
        notes: quote.notes,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          quotationNumber: data.quotation_number,
          customerId: data.customer_id,
          customerName: data.customer_name,
          company: data.company,
          email: data.email,
          planId: data.plan_id,
          planName: data.plan_name,
          amountUSD: Number(data.amount_usd),
          billingCycle: data.billing_cycle,
          seatCount: data.seat_count,
          status: data.status,
          validUntil: data.valid_until,
          lineItems: data.line_items,
          notes: data.notes,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Error saving quotation to Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.quotations.unshift(newQuote);
  saveLocalStore(store);
  return newQuote;
}

export async function updateQuotationStatus(id: string, status: Quotation['status']): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('quotations').update({ status }).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.quotations = store.quotations.map((q) => (q.id === id ? { ...q, status } : q));
  saveLocalStore(store);
  return true;
}

export async function deleteQuotation(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('quotations').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.quotations = store.quotations.filter((q) => q.id !== id);
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 5. SUBSCRIPTIONS CRUD
// ==============================================================================
export async function fetchSubscriptions(role: UserRole, userEmail?: string): Promise<Subscription[]> {
  const { isConfigured } = getSupabaseCredentials();
  let list = getLocalStore().subscriptions;

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
      if (role === 'customer' && userEmail) {
        query = query.eq('customer_email', userEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data.map((s: any) => ({
          id: s.id,
          subscriptionNumber: s.subscription_number,
          customerId: s.customer_id,
          customerName: s.customer_name,
          customerEmail: s.customer_email,
          company: s.company,
          planId: s.plan_id,
          planName: s.plan_name,
          tier: s.tier,
          status: s.status,
          amountUSD: Number(s.amount_usd),
          billingCycle: s.billing_cycle,
          seatCount: s.seat_count,
          startDate: s.start_date,
          nextBillingDate: s.next_billing_date,
          paymentMethod: s.payment_method,
          mrrContributionUSD: Number(s.mrr_contribution_usd),
          dunningAttempts: s.dunning_attempts,
          notes: s.notes,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local subscriptions:', e);
    }
  }

  if (role === 'customer' && userEmail) {
    return list.filter((s) => s.customerEmail.toLowerCase() === userEmail.toLowerCase());
  }
  return list;
}

export async function createSubscription(
  sub: Omit<Subscription, 'id' | 'subscriptionNumber' | 'startDate'>
): Promise<Subscription> {
  const { isConfigured } = getSupabaseCredentials();
  const subNum = `SUB-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(
    65 + Math.floor(Math.random() * 26)
  )}`;
  const startDate = new Date().toISOString().slice(0, 10);
  const newSub: Subscription = {
    ...sub,
    id: `sub_${Date.now()}`,
    subscriptionNumber: subNum,
    startDate,
  };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('subscriptions').insert({
        subscription_number: subNum,
        customer_id: sub.customerId,
        customer_name: sub.customerName,
        customer_email: sub.customerEmail,
        company: sub.company,
        plan_id: sub.planId,
        plan_name: sub.planName,
        tier: sub.tier,
        status: sub.status,
        amount_usd: sub.amountUSD,
        billing_cycle: sub.billingCycle,
        seat_count: sub.seatCount,
        start_date: startDate,
        next_billing_date: sub.nextBillingDate,
        payment_method: sub.paymentMethod,
        mrr_contribution_usd: sub.mrrContributionUSD,
        notes: sub.notes,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          subscriptionNumber: data.subscription_number,
          customerId: data.customer_id,
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          company: data.company,
          planId: data.plan_id,
          planName: data.plan_name,
          tier: data.tier,
          status: data.status,
          amountUSD: Number(data.amount_usd),
          billingCycle: data.billing_cycle,
          seatCount: data.seat_count,
          startDate: data.start_date,
          nextBillingDate: data.next_billing_date,
          paymentMethod: data.payment_method,
          mrrContributionUSD: Number(data.mrr_contribution_usd),
          dunningAttempts: data.dunning_attempts,
          notes: data.notes,
        };
      }
    } catch (e) {
      console.warn('Error saving subscription to Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.subscriptions.unshift(newSub);
  saveLocalStore(store);
  return newSub;
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.planId) dbUpdates.plan_id = updates.planId;
      if (updates.planName) dbUpdates.plan_name = updates.planName;
      if (updates.tier) dbUpdates.tier = updates.tier;
      if (updates.amountUSD !== undefined) dbUpdates.amount_usd = updates.amountUSD;
      if (updates.mrrContributionUSD !== undefined) dbUpdates.mrr_contribution_usd = updates.mrrContributionUSD;
      if (updates.seatCount !== undefined) dbUpdates.seat_count = updates.seatCount;
      if (updates.nextBillingDate) dbUpdates.next_billing_date = updates.nextBillingDate;

      await supabase.from('subscriptions').update(dbUpdates).eq('id', id);
    } catch (e) {
      console.warn('Error updating subscription in Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.subscriptions = store.subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s));
  saveLocalStore(store);
  return true;
}

export async function deleteSubscription(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('subscriptions').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.subscriptions = store.subscriptions.filter((s) => s.id !== id);
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 6. INVOICES CRUD
// ==============================================================================
export async function fetchInvoices(role: UserRole, userEmail?: string): Promise<Invoice[]> {
  const { isConfigured } = getSupabaseCredentials();
  let list = getLocalStore().invoices;

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (role === 'customer' && userEmail) {
        query = query.eq('customer_email', userEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          subscriptionId: inv.subscription_id,
          customerId: inv.customer_id,
          customerName: inv.customer_name,
          company: inv.company,
          customerEmail: inv.customer_email,
          status: inv.status,
          amountUSD: Number(inv.amount_usd),
          subtotalUSD: Number(inv.subtotal_usd),
          taxRatePercent: Number(inv.tax_rate_percent),
          taxAmountUSD: Number(inv.tax_amount_usd),
          discountUSD: Number(inv.discount_usd),
          issueDate: inv.issue_date,
          dueDate: inv.due_date,
          settledAt: inv.settled_at,
          paymentMethodSummary: inv.payment_method_summary,
          lineItems: Array.isArray(inv.line_items) ? inv.line_items : [],
          memo: inv.memo,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local invoices:', e);
    }
  }

  if (role === 'customer' && userEmail) {
    return list.filter((i) => i.customerEmail.toLowerCase() === userEmail.toLowerCase());
  }
  return list;
}

export async function createInvoice(inv: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
  const { isConfigured } = getSupabaseCredentials();
  const invNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInvoice: Invoice = {
    ...inv,
    id: `inv_${Date.now()}`,
    invoiceNumber: invNum,
  };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('invoices').insert({
        invoice_number: invNum,
        subscription_id: inv.subscriptionId,
        customer_id: inv.customerId,
        customer_name: inv.customerName,
        company: inv.company,
        customer_email: inv.customerEmail,
        status: inv.status,
        amount_usd: inv.amountUSD,
        subtotal_usd: inv.subtotalUSD,
        tax_rate_percent: inv.taxRatePercent,
        tax_amount_usd: inv.taxAmountUSD,
        discount_usd: inv.discountUSD,
        issue_date: inv.issueDate,
        due_date: inv.dueDate,
        settled_at: inv.settledAt,
        payment_method_summary: inv.paymentMethodSummary,
        line_items: inv.lineItems,
        memo: inv.memo,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          invoiceNumber: data.invoice_number,
          subscriptionId: data.subscription_id,
          customerId: data.customer_id,
          customerName: data.customer_name,
          company: data.company,
          customerEmail: data.customer_email,
          status: data.status,
          amountUSD: Number(data.amount_usd),
          subtotalUSD: Number(data.subtotal_usd),
          taxRatePercent: Number(data.tax_rate_percent),
          taxAmountUSD: Number(data.tax_amount_usd),
          discountUSD: Number(data.discount_usd),
          issueDate: data.issue_date,
          dueDate: data.due_date,
          settledAt: data.settled_at,
          paymentMethodSummary: data.payment_method_summary,
          lineItems: data.line_items,
          memo: data.memo,
        };
      }
    } catch (e) {
      console.warn('Error saving invoice to Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.invoices.unshift(newInvoice);
  saveLocalStore(store);
  return newInvoice;
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  const settledAt = status === 'settled' ? new Date().toISOString() : null;

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('invoices').update({ status, settled_at: settledAt }).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }

  const store = getLocalStore();
  store.invoices = store.invoices.map((i) =>
    i.id === id ? { ...i, status, settledAt: settledAt || undefined } : i
  );
  saveLocalStore(store);
  return true;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('invoices').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.invoices = store.invoices.filter((i) => i.id !== id);
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 7. PAYMENTS CRUD
// ==============================================================================
export async function fetchPayments(role: UserRole, userEmail?: string): Promise<Payment[]> {
  const { isConfigured } = getSupabaseCredentials();
  let list = getLocalStore().payments;

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (role === 'customer' && userEmail) {
        query = query.eq('customer_email', userEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data.map((p: any) => ({
          id: p.id,
          paymentNumber: p.payment_number,
          invoiceId: p.invoice_id,
          customerId: p.customer_id,
          customerName: p.customer_name,
          company: p.company,
          customerEmail: p.customer_email,
          amountUSD: Number(p.amount_usd),
          currency: p.currency,
          status: p.status,
          paymentRail: p.payment_rail,
          transactionRef: p.transaction_ref,
          settledAt: p.settled_at,
          createdAt: p.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local payments:', e);
    }
  }

  if (role === 'customer' && userEmail) {
    return list.filter((p) => p.customerEmail.toLowerCase() === userEmail.toLowerCase());
  }
  return list;
}

export async function createPayment(p: Omit<Payment, 'id' | 'paymentNumber' | 'settledAt' | 'createdAt'>): Promise<Payment> {
  const { isConfigured } = getSupabaseCredentials();
  const payNum = `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();
  const newPayment: Payment = {
    ...p,
    id: `pay_${Date.now()}`,
    paymentNumber: payNum,
    settledAt: now,
    createdAt: now,
  };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('payments').insert({
        payment_number: payNum,
        invoice_id: p.invoiceId,
        customer_id: p.customerId,
        customer_name: p.customerName,
        company: p.company,
        customer_email: p.customerEmail,
        amount_usd: p.amountUSD,
        currency: p.currency || 'USD',
        status: p.status,
        payment_rail: p.paymentRail,
        transaction_ref: p.transactionRef,
        settled_at: now,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          paymentNumber: data.payment_number,
          invoiceId: data.invoice_id,
          customerId: data.customer_id,
          customerName: data.customer_name,
          company: data.company,
          customerEmail: data.customer_email,
          amountUSD: Number(data.amount_usd),
          currency: data.currency,
          status: data.status,
          paymentRail: data.payment_rail,
          transactionRef: data.transaction_ref,
          settledAt: data.settled_at,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Error saving payment to Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.payments.unshift(newPayment);
  saveLocalStore(store);
  return newPayment;
}

export async function refundPayment(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('payments').update({ status: 'refunded' }).eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }

  const store = getLocalStore();
  store.payments = store.payments.map((p) => (p.id === id ? { ...p, status: 'refunded' } : p));
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 8. PRODUCT VARIANTS CRUD
// ==============================================================================
export async function fetchVariants(productId?: string): Promise<ProductVariant[]> {
  const { isConfigured } = getSupabaseCredentials();
  let list = getLocalStore().variants;

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      let query = supabase.from('product_variants').select('*').order('created_at', { ascending: true });
      if (productId) {
        query = query.eq('product_id', productId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data.map((v: any) => ({
          id: v.id,
          productId: v.product_id,
          sku: v.sku,
          name: v.name,
          tier: v.tier,
          basePriceUSD: Number(v.base_price_usd),
          unitName: v.unit_name,
          description: v.description,
          isActive: v.is_active,
          createdAt: v.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local variants:', e);
    }
  }

  if (productId) {
    return list.filter((v) => v.productId === productId);
  }
  return list;
}

export async function createVariant(v: Omit<ProductVariant, 'id' | 'createdAt'>): Promise<ProductVariant> {
  const { isConfigured } = getSupabaseCredentials();
  const newVariant: ProductVariant = {
    ...v,
    id: `var_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('product_variants').insert({
        product_id: v.productId,
        sku: v.sku,
        name: v.name,
        tier: v.tier,
        base_price_usd: v.basePriceUSD,
        unit_name: v.unitName,
        description: v.description,
        is_active: v.isActive,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          productId: data.product_id,
          sku: data.sku,
          name: data.name,
          tier: data.tier,
          basePriceUSD: Number(data.base_price_usd),
          unitName: data.unit_name,
          description: data.description,
          isActive: data.is_active,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Error saving variant to Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.variants.push(newVariant);
  saveLocalStore(store);
  return newVariant;
}

export async function deleteVariant(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('product_variants').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.variants = store.variants.filter((v) => v.id !== id);
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 9. TAXES CRUD
// ==============================================================================
export async function fetchTaxes(): Promise<Tax[]> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('taxes').select('*').order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id,
          name: t.name,
          code: t.code,
          ratePercent: Number(t.rate_percent),
          countryCode: t.country_code,
          isActive: t.is_active,
          createdAt: t.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local taxes:', e);
    }
  }
  return getLocalStore().taxes;
}

export async function createTax(tax: Omit<Tax, 'id' | 'createdAt'>): Promise<Tax> {
  const { isConfigured } = getSupabaseCredentials();
  const newTax: Tax = {
    ...tax,
    id: `tax_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('taxes').insert({
        name: tax.name,
        code: tax.code,
        rate_percent: tax.ratePercent,
        country_code: tax.countryCode,
        is_active: tax.isActive,
      }).select().single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          code: data.code,
          ratePercent: Number(data.rate_percent),
          countryCode: data.country_code,
          isActive: data.is_active,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Error saving tax in Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.taxes.push(newTax);
  saveLocalStore(store);
  return newTax;
}

export async function deleteTax(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('taxes').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.taxes = store.taxes.filter((t) => t.id !== id);
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 10. DISCOUNTS CRUD & APPLICATION
// ==============================================================================
export async function fetchDiscounts(): Promise<Discount[]> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          code: d.code,
          name: d.name,
          type: d.type,
          value: Number(d.value),
          maxUses: d.max_uses,
          usedCount: d.used_count || 0,
          validFrom: d.valid_from,
          validUntil: d.valid_until,
          isActive: d.is_active,
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn('Fallback to local discounts:', e);
    }
  }
  return getLocalStore().discounts;
}

export async function createDiscount(discount: Omit<Discount, 'id' | 'createdAt' | 'usedCount'>): Promise<Discount> {
  const { isConfigured } = getSupabaseCredentials();
  const newDiscount: Discount = {
    ...discount,
    id: `disc_${Date.now()}`,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (isConfigured) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('discounts').insert({
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        max_uses: discount.maxUses,
        valid_until: discount.validUntil,
        is_active: discount.isActive,
      }).select().single();

      if (!error && data) {
        return {
          id: data.id,
          code: data.code,
          name: data.name,
          type: data.type,
          value: Number(data.value),
          maxUses: data.max_uses,
          usedCount: data.used_count,
          validUntil: data.valid_until,
          isActive: data.is_active,
          createdAt: data.created_at,
        };
      }
    } catch (e) {
      console.warn('Error saving discount in Supabase:', e);
    }
  }

  const store = getLocalStore();
  store.discounts.push(newDiscount);
  saveLocalStore(store);
  return newDiscount;
}

export async function applyDiscount(
  code: string,
  subtotalUSD: number
): Promise<{ valid: boolean; discount?: Discount; discountAmountUSD: number; message: string }> {
  const discounts = await fetchDiscounts();
  const matched = discounts.find((d) => d.code.toUpperCase() === code.trim().toUpperCase() && d.isActive);

  if (!matched) {
    return { valid: false, discountAmountUSD: 0, message: 'Invalid or inactive promotional discount code.' };
  }

  if (matched.maxUses && matched.usedCount >= matched.maxUses) {
    return { valid: false, discountAmountUSD: 0, message: 'Discount quota exhausted.' };
  }

  if (matched.validUntil && new Date(matched.validUntil) < new Date()) {
    return { valid: false, discountAmountUSD: 0, message: 'Promotional discount coupon has expired.' };
  }

  let discountAmountUSD = 0;
  if (matched.type === 'percentage') {
    discountAmountUSD = Math.round(((subtotalUSD * matched.value) / 100) * 100) / 100;
  } else {
    discountAmountUSD = Math.min(matched.value, subtotalUSD);
  }

  return {
    valid: true,
    discount: matched,
    discountAmountUSD,
    message: `Applied ${matched.name}: -$${discountAmountUSD.toLocaleString()}`,
  };
}

export async function deleteDiscount(id: string): Promise<boolean> {
  const { isConfigured } = getSupabaseCredentials();
  if (isConfigured) {
    try {
      const supabase = getSupabase();
      await supabase.from('discounts').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
  }
  const store = getLocalStore();
  store.discounts = store.discounts.filter((d) => d.id !== id);
  saveLocalStore(store);
  return true;
}

// ==============================================================================
// 11. SUBSCRIPTION LIFECYCLE MANAGEMENT
// ==============================================================================
export async function pauseSubscription(id: string): Promise<boolean> {
  return updateSubscription(id, { status: 'paused' });
}

export async function resumeSubscription(id: string): Promise<boolean> {
  return updateSubscription(id, { status: 'active' });
}

export async function closeSubscription(id: string, reason?: string): Promise<boolean> {
  return updateSubscription(id, {
    status: 'canceled',
    notes: reason ? `Canceled: ${reason}` : 'Subscription terminated by user.',
  });
}

// Calculate next renewal date
export function computeNextBillingDate(startDate: string, interval: BillingInterval = 'monthly'): string {
  const d = new Date(startDate);
  switch (interval) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() + 3);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d.toISOString().slice(0, 10);
}

// ==============================================================================
// 12. RECURRING BILLING ENGINE
// ==============================================================================
export interface BillingCycleResult {
  processedCount: number;
  invoicesGenerated: Invoice[];
  skippedCount: number;
  message: string;
}

export async function runRecurringBillingCycle(): Promise<BillingCycleResult> {
  const store = getLocalStore();
  const today = new Date().toISOString().slice(0, 10);
  const { isConfigured } = getSupabaseCredentials();

  // Find active subscriptions due for billing
  const dueSubscriptions = store.subscriptions.filter(
    (s) => s.status === 'active' && s.nextBillingDate <= today
  );

  const generatedInvoices: Invoice[] = [];
  let skipped = 0;

  for (const sub of dueSubscriptions) {
    const periodStart = sub.nextBillingDate;
    const interval = (sub.billingInterval as BillingInterval) || (sub.billingCycle === 'annual' ? 'yearly' : 'monthly');
    const periodEnd = computeNextBillingDate(periodStart, interval);

    // Prevent duplicate invoices for the same subscription and period
    const alreadyBilled = store.invoices.some(
      (inv) =>
        inv.subscriptionId === sub.id &&
        inv.billingPeriodStart === periodStart &&
        inv.billingPeriodEnd === periodEnd
    );

    if (alreadyBilled) {
      skipped++;
      continue;
    }

    const subtotal = sub.amountUSD;
    const taxRate = 18; // Default 18% GST / VAT
    const taxAmount = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    // Create automatic recurring invoice
    const newInv = await createInvoice({
      subscriptionId: sub.id,
      customerId: sub.customerId,
      customerName: sub.customerName,
      company: sub.company,
      customerEmail: sub.customerEmail,
      status: 'pending',
      amountUSD: totalAmount,
      subtotalUSD: subtotal,
      taxRatePercent: taxRate,
      taxAmountUSD: taxAmount,
      discountUSD: 0,
      issueDate: today,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      paymentMethodSummary: `${sub.paymentMethod?.brand || 'Card'} ···· ${sub.paymentMethod?.last4 || '4242'}`,
      lineItems: [
        {
          id: `li_rec_${Date.now()}_${sub.id}`,
          description: `${sub.planName} (${interval.toUpperCase()}) — Billing Period: ${periodStart} to ${periodEnd}`,
          quantity: sub.seatCount || 1,
          unitPriceUSD: sub.amountUSD,
          totalUSD: sub.amountUSD,
          totalPriceUSD: sub.amountUSD,
        },
      ],
      memo: `Automated recurring cycle invoice generated for subscription ${sub.subscriptionNumber}.`,
    });

    generatedInvoices.push(newInv);

    // Advance subscription to next cycle
    const nextDate = computeNextBillingDate(periodEnd, interval);
    await updateSubscription(sub.id, {
      nextBillingDate: nextDate,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    });

    // Record billing event
    if (isConfigured) {
      try {
        const supabase = getSupabase();
        await supabase.from('billing_events').insert({
          subscription_id: sub.id,
          invoice_id: newInv.id,
          event_type: 'renewal_generated',
          status: 'success',
          amount_usd: totalAmount,
          details: { periodStart, periodEnd, interval, subscriptionNumber: sub.subscriptionNumber },
        });
      } catch (err) {
        console.warn('Error recording billing event in Supabase:', err);
      }
    }
  }

  const message = `Recurring billing cycle executed: ${generatedInvoices.length} invoices generated, ${skipped} duplicate periods safely skipped.`;
  return {
    processedCount: dueSubscriptions.length,
    invoicesGenerated: generatedInvoices,
    skippedCount: skipped,
    message,
  };
}

// ==============================================================================
// 13. COMPREHENSIVE DATABASE SEED / SYNC TOOL
// ==============================================================================
export async function seedSupabaseFromMock(): Promise<{ success: boolean; message: string }> {
  const { isConfigured } = getSupabaseCredentials();
  if (!isConfigured) {
    return { success: false, message: 'Supabase credentials not configured yet.' };
  }

  try {
    const supabase = getSupabase();

    // 1. Seed Products (Brightloop CRM, Brightloop Analytics, Brightloop Support)
    for (const prod of INITIAL_PRODUCTS) {
      await supabase.from('products').upsert({
        code: prod.code,
        name: prod.name,
        category: prod.category,
        description: prod.description,
        is_active: prod.isActive,
      }, { onConflict: 'code' });
    }

    // 2. Fetch created product IDs to link variants
    const { data: dbProducts } = await supabase.from('products').select('id, code');
    const prodMap = new Map((dbProducts || []).map((p: any) => [p.code, p.id]));

    // 3. Seed Product Variants
    for (const v of INITIAL_PRODUCT_VARIANTS) {
      let pId = v.productId;
      if (v.productId === 'prod_01') pId = prodMap.get('PROD-BL-CRM') || v.productId;
      if (v.productId === 'prod_02') pId = prodMap.get('PROD-BL-ANA') || v.productId;
      if (v.productId === 'prod_03') pId = prodMap.get('PROD-BL-SUP') || v.productId;

      await supabase.from('product_variants').upsert({
        product_id: pId,
        sku: v.sku,
        name: v.name,
        tier: v.tier,
        base_price_usd: v.basePriceUSD,
        unit_name: v.unitName,
        description: v.description,
        is_active: v.isActive,
      }, { onConflict: 'sku' });
    }

    // 4. Seed Taxes
    for (const t of INITIAL_TAXES) {
      await supabase.from('taxes').upsert({
        code: t.code,
        name: t.name,
        rate_percent: t.ratePercent,
        country_code: t.countryCode,
        is_active: t.isActive,
      }, { onConflict: 'code' });
    }

    // 5. Seed Discounts
    for (const d of INITIAL_DISCOUNTS) {
      await supabase.from('discounts').upsert({
        code: d.code,
        name: d.name,
        type: d.type,
        value: d.value,
        max_uses: d.maxUses,
        used_count: d.usedCount,
        valid_until: d.validUntil ? new Date(d.validUntil).toISOString() : null,
        is_active: d.isActive,
      }, { onConflict: 'code' });
    }

    // 6. Seed Plans
    for (const plan of INITIAL_PLANS) {
      await supabase.from('plans').upsert({
        code: plan.code,
        name: plan.name,
        tier: plan.tier,
        billing_interval: 'monthly',
        price_usd: plan.monthlyPriceUSD,
        description: plan.description,
        features: plan.features,
        max_seats: String(plan.maxSeats),
        popular: plan.popular || false,
      }, { onConflict: 'code' });
    }

    // 7. Seed Customers
    for (const c of INITIAL_CUSTOMERS) {
      await supabase.from('customers').upsert({
        company_name: c.companyName,
        contact_name: c.contactName,
        email: c.email,
        phone: c.phone,
        billing_address: c.billingAddress,
        currency: c.currency,
        tax_identifier: c.taxIdentifier,
      }, { onConflict: 'email' });
    }

    return {
      success: true,
      message: 'Successfully seeded database with Brightloop CRM, Analytics, Support, variants, taxes, discounts, plans, and customers!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Seeding failed. Ensure schema tables are created.',
    };
  }
}
