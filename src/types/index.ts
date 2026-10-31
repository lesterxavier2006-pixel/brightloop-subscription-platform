export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // For dynamic conversion
  locale: string;
}

export type UserRole = 'admin' | 'staff' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  company?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Staff {
  id: string;
  userId: string;
  department: string;
  title: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
}

export type BillingInterval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'paused' | 'past_due' | 'canceled' | 'expired' | 'trialing' | 'triaged';
export type InvoiceStatus = 'draft' | 'pending' | 'settled' | 'partial' | 'overdue' | 'failed' | 'void';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';
export type DiscountType = 'percentage' | 'fixed_amount';

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'upi';
  brand: string;
  last4: string;
  expiry?: string;
  upiId?: string;
}

export interface Customer {
  id: string;
  userId?: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  billingAddress?: string;
  currency: string;
  taxIdentifier?: string;
  status?: 'active' | 'archived' | 'lead';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  tier: 'Starter' | 'Growth' | 'Enterprise' | 'Custom';
  basePriceUSD: number;
  unitName: string; // e.g. 'seat', 'GB', 'node'
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Plan {
  id: string;
  productId?: string;
  code: string;
  name: string;
  tier: 'Starter' | 'Growth' | 'Enterprise' | 'Custom';
  billingInterval?: BillingInterval;
  priceUSD?: number;
  monthlyPriceUSD?: number; // Normalized convenience
  annualPriceUSD?: number; // Annual convenience
  description: string;
  features: string[];
  maxSeats: number | 'Unlimited';
  trialDays?: number;
  activeSubscribers?: number;
  popular?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tax {
  id: string;
  name: string;
  code: string;
  ratePercent: number;
  countryCode?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number; // percentage (e.g. 20) or fixed USD amount (e.g. 100)
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface DiscountUsage {
  id: string;
  discountId: string;
  customerId: string;
  invoiceId?: string;
  appliedAmountUSD: number;
  usedAt: string;
}

export interface QuotationItem {
  id: string;
  quotationId?: string;
  productVariantId?: string;
  description: string;
  quantity: number;
  unitPriceUSD: number;
  totalPriceUSD?: number;
  totalUSD?: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  company: string;
  email: string;
  planId?: string;
  planName: string;
  subtotalUSD?: number;
  taxId?: string;
  taxAmountUSD?: number;
  discountId?: string;
  discountAmountUSD?: number;
  totalAmountUSD?: number;
  amountUSD: number; // for backward-compatibility
  billingInterval?: BillingInterval;
  billingCycle?: string; // alias
  seatCount: number;
  status: QuotationStatus;
  validUntil: string;
  lineItems: QuotationItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionItem {
  id: string;
  subscriptionId?: string;
  productVariantId?: string;
  description: string;
  quantity: number;
  unitPriceUSD: number;
  totalPriceUSD?: number;
  totalUSD?: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  company: string;
  planId?: string;
  planName: string;
  tier: 'Starter' | 'Growth' | 'Enterprise' | 'Custom';
  billingInterval?: BillingInterval;
  billingCycle: string; // for UI display alias
  status: SubscriptionStatus;
  amountUSD: number;
  mrrContributionUSD: number;
  seatCount: number;
  startDate: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextBillingDate: string;
  trialEndDate?: string;
  canceledAt?: string;
  paymentMethod: PaymentMethod;
  dunningAttempts?: number;
  items?: SubscriptionItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitPriceUSD: number;
  totalPriceUSD?: number;
  totalUSD?: number; // alias
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string;
  customerId: string;
  customerName: string;
  company: string;
  customerEmail: string;
  status: InvoiceStatus;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  subtotalUSD: number;
  taxId?: string;
  taxRatePercent?: number;
  taxAmountUSD?: number;
  discountId?: string;
  discountUSD?: number; // alias
  discountAmountUSD?: number;
  amountUSD: number;
  amountPaidUSD?: number;
  balanceDueUSD?: number;
  issueDate: string;
  dueDate: string;
  settledAt?: string;
  paymentMethodSummary?: string;
  lineItems: InvoiceItem[];
  memo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId?: string;
  customerId: string;
  customerName: string;
  company: string;
  customerEmail: string;
  amountUSD: number;
  currency: string;
  status: PaymentStatus;
  paymentRail: string;
  transactionRef: string;
  settledAt: string;
  notes?: string;
  createdAt?: string;
}

export interface BillingEvent {
  id: string;
  subscriptionId?: string;
  invoiceId?: string;
  eventType: 'renewal_generated' | 'payment_charged' | 'payment_failed' | 'retry_scheduled';
  status: 'success' | 'failed' | 'pending';
  amountUSD?: number;
  details: Record<string, any>;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  type: 'dunning_failed' | 'invoice_settled' | 'plan_upgrade' | 'renewal_pending' | 'quote_accepted' | 'payment_received' | 'subscription_renewed';
  title: string;
  description: string;
  amountUSD?: number;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLink?: {
    view: 'invoices' | 'subscriptions' | 'dunning' | 'quotations' | 'payments' | 'customers' | 'plans';
    targetId?: string;
  };
}

export interface DunningStep {
  step: number;
  title: string;
  triggerCondition: string;
  timing: string;
  action: string;
  recoveryRatePercent: number;
  successfulRecoveriesCount: number;
  activeQueueCount: number;
}

export interface CohortRow {
  vintage: string;
  subscribersCount: number;
  mrrUSD: number;
  retentionMonths: (number | null)[];
}
