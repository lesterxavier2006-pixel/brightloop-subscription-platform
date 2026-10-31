import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { CustomerDrawer } from './components/CustomerDrawer';
import { NewSubscriptionModal } from './components/NewSubscriptionModal';
import { NewInvoiceModal } from './components/NewInvoiceModal';
import { NotificationsPopover } from './components/NotificationsPopover';
import { SupabaseConnectionModal } from './components/SupabaseConnectionModal';
import { AuthModal } from './components/AuthModal';

import { OverviewView } from './views/OverviewView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { InvoicesView } from './views/InvoicesView';
import { QuotationsView } from './views/QuotationsView';
import { PaymentsView } from './views/PaymentsView';
import { CustomersView } from './views/CustomersView';
import { PlansView } from './views/PlansView';
import { CohortsView } from './views/CohortsView';
import { DunningView } from './views/DunningView';
import { WebhooksView } from './views/WebhooksView';
import { SettingsView } from './views/SettingsView';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  fetchCustomers,
  fetchProducts,
  fetchPlans,
  fetchQuotations,
  fetchSubscriptions,
  fetchInvoices,
  fetchPayments,
  createCustomer,
  deleteCustomer,
  createProduct,
  createPlan,
  createQuotation,
  updateQuotationStatus,
  deleteQuotation,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  createPayment,
  refundPayment,
  runRecurringBillingCycle,
} from './services/databaseService';

import {
  Subscription,
  Invoice,
  Customer,
  Product,
  Quotation,
  Payment,
  Plan,
  NotificationItem,
  CurrencyCode,
} from './types';
import { INITIAL_NOTIFICATIONS } from './data/mockData';
import { exportToCSV, formatCurrency } from './utils/formatters';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function MainApp() {
  const { role, profile, isSupabaseConnected } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Database Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Loading & Global Notifications
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals & Drawers
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isNewSubModalOpen, setIsNewSubModalOpen] = useState(false);
  const [isNewInvModalOpen, setIsNewInvModalOpen] = useState(false);
  const [initialCustomerForInvoice, setInitialCustomerForInvoice] = useState<Subscription | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load real data from Supabase/databaseService
  const loadDatabaseData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [
        fetchedCustomers,
        fetchedProducts,
        fetchedPlans,
        fetchedQuotations,
        fetchedSubscriptions,
        fetchedInvoices,
        fetchedPayments,
      ] = await Promise.all([
        fetchCustomers(role, profile.email),
        fetchProducts(),
        fetchPlans(),
        fetchQuotations(role, profile.email),
        fetchSubscriptions(role, profile.email),
        fetchInvoices(role, profile.email),
        fetchPayments(role, profile.email),
      ]);

      setCustomers(fetchedCustomers);
      setProducts(fetchedProducts);
      setPlans(fetchedPlans);
      setQuotations(fetchedQuotations);
      setSubscriptions(fetchedSubscriptions);
      setInvoices(fetchedInvoices);
      setPayments(fetchedPayments);
    } catch (err: any) {
      console.error('Failed to load database information:', err);
      showToast('Error syncing with database. Check credentials.', 'error');
    } finally {
      setIsDataLoading(false);
    }
  }, [role, profile.email]);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Global Keyboard shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CRUD Handler: Customer
  const handleCreateCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    try {
      const created = await createCustomer(newCustomer);
      setCustomers((prev) => [created, ...prev]);
      showToast(`Customer "${created.companyName}" successfully enrolled.`);
    } catch (e: any) {
      showToast(e.message || 'Failed to create customer.', 'error');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast('Customer record removed.');
    } catch (e: any) {
      showToast('Failed to delete customer.', 'error');
    }
  };

  // CRUD Handler: Quotations
  const handleCreateQuotation = async (newQuote: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => {
    try {
      const created = await createQuotation(newQuote);
      setQuotations((prev) => [created, ...prev]);
      showToast(`Quotation ${created.quotationNumber} issued.`);
    } catch (e: any) {
      showToast('Failed to issue quotation.', 'error');
    }
  };

  const handleUpdateQuotationStatus = async (id: string, status: Quotation['status']) => {
    try {
      await updateQuotationStatus(id, status);
      setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
      showToast(`Quotation status updated to ${status}.`);
    } catch (e: any) {
      showToast('Failed to update quotation.', 'error');
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    try {
      await deleteQuotation(id);
      setQuotations((prev) => prev.filter((q) => q.id !== id));
      showToast('Quotation proposal deleted.');
    } catch (e: any) {
      showToast('Failed to delete quotation.', 'error');
    }
  };

  const handleConvertQuotationToSubscription = async (quote: Quotation) => {
    try {
      await updateQuotationStatus(quote.id, 'accepted');
      setQuotations((prev) => prev.map((q) => (q.id === quote.id ? { ...q, status: 'accepted' } : q)));

      const targetPlan = plans.find((p) => p.id === quote.planId) || plans[0];
      const isAnnual = quote.billingCycle === 'annual';
      const mrr = isAnnual ? quote.amountUSD / 12 : quote.amountUSD;

      const newSub = await createSubscription({
        customerId: quote.customerId,
        customerName: quote.customerName,
        customerEmail: quote.email,
        company: quote.company,
        planId: targetPlan.id,
        planName: quote.planName,
        tier: targetPlan.tier,
        status: 'active',
        amountUSD: quote.amountUSD,
        billingCycle: quote.billingCycle || 'annual',
        seatCount: quote.seatCount,
        nextBillingDate: new Date(Date.now() + (isAnnual ? 365 : 30) * 86400000).toISOString().slice(0, 10),
        paymentMethod: { type: 'card', brand: 'Mastercard VAU', last4: '8821' },
        mrrContributionUSD: mrr,
        notes: `Converted from Quotation ${quote.quotationNumber}`,
      });

      setSubscriptions((prev) => [newSub, ...prev]);

      // Emit invoice
      const newInv = await createInvoice({
        subscriptionId: newSub.id,
        customerId: newSub.customerId,
        customerName: newSub.customerName,
        company: newSub.company,
        customerEmail: newSub.customerEmail,
        status: 'settled',
        amountUSD: newSub.amountUSD,
        subtotalUSD: newSub.amountUSD,
        taxRatePercent: 18,
        taxAmountUSD: (newSub.amountUSD * 18) / 100,
        discountUSD: 0,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        settledAt: new Date().toISOString(),
        paymentMethodSummary: 'Mastercard VAU ···· 8821',
        lineItems: quote.lineItems,
        memo: `Commercial invoice for Proposal ${quote.quotationNumber}`,
      });

      setInvoices((prev) => [newInv, ...prev]);

      showToast(`Quotation ${quote.quotationNumber} successfully activated into subscription!`);
    } catch (e: any) {
      showToast('Error converting quotation.', 'error');
    }
  };

  // CRUD Handler: Subscriptions
  const handleCreateSubscription = async (
    newSubData: Omit<Subscription, 'id' | 'subscriptionNumber' | 'startDate'>
  ) => {
    try {
      const created = await createSubscription(newSubData);
      setSubscriptions((prev) => [created, ...prev]);

      // Also create invoice
      const newInv = await createInvoice({
        subscriptionId: created.id,
        customerId: created.customerId,
        customerName: created.customerName,
        company: created.company,
        customerEmail: created.customerEmail,
        status: 'settled',
        amountUSD: created.amountUSD,
        subtotalUSD: created.amountUSD,
        taxRatePercent: 18,
        taxAmountUSD: (created.amountUSD * 18) / 100,
        discountUSD: 0,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        settledAt: new Date().toISOString(),
        paymentMethodSummary: `${created.paymentMethod.brand} ···· ${created.paymentMethod.last4}`,
        lineItems: [
          {
            id: `li_${Date.now()}`,
            description: `${created.planName} — Subscription Cycle (${created.billingCycle})`,
            quantity: 1,
            unitPriceUSD: created.amountUSD,
            totalUSD: created.amountUSD,
          },
        ],
        memo: 'Automatic charge settled upon subscription activation.',
      });

      setInvoices((prev) => [newInv, ...prev]);

      showToast(`Subscription ${created.subscriptionNumber} activated.`);
    } catch (e: any) {
      showToast('Failed to create subscription.', 'error');
    }
  };

  const handleUpdateSubStatus = async (subId: string, newStatus: Subscription['status']) => {
    try {
      await updateSubscription(subId, { status: newStatus });
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: newStatus } : s))
      );
      if (selectedSubscription?.id === subId) {
        setSelectedSubscription((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Subscription status updated to ${newStatus}.`);
    } catch (e: any) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleUpdateSubPlan = async (subId: string, newPlanId: string) => {
    const targetPlan = plans.find((p) => p.id === newPlanId);
    if (!targetPlan) return;

    try {
      const isAnnual = selectedSubscription?.billingCycle === 'annual';
      const newMRR = (isAnnual ? targetPlan.annualPriceUSD : targetPlan.monthlyPriceUSD) || targetPlan.priceUSD || 0;

      await updateSubscription(subId, {
        planId: targetPlan.id,
        planName: targetPlan.name,
        tier: targetPlan.tier,
        amountUSD: isAnnual ? newMRR * 12 : newMRR,
        mrrContributionUSD: newMRR,
      });

      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subId
            ? {
                ...s,
                planId: targetPlan.id,
                planName: targetPlan.name,
                tier: targetPlan.tier,
                amountUSD: isAnnual ? newMRR * 12 : newMRR,
                mrrContributionUSD: newMRR,
              }
            : s
        )
      );

      if (selectedSubscription?.id === subId) {
        setSelectedSubscription((prev) =>
          prev
            ? {
                ...prev,
                planId: targetPlan.id,
                planName: targetPlan.name,
                tier: targetPlan.tier,
                mrrContributionUSD: newMRR,
              }
            : null
        );
      }

      showToast(`Subscription upgraded to ${targetPlan.name}.`);
    } catch (e: any) {
      showToast('Failed to change plan.', 'error');
    }
  };

  const handleRetryDunning = async (subId: string) => {
    try {
      await updateSubscription(subId, { status: 'active', dunningAttempts: 0 });
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: 'active', dunningAttempts: 0 } : s))
      );
      showToast('Payment rail authorized! Subscription restored to active.');
    } catch (e: any) {
      showToast('Dunning retry failed.', 'error');
    }
  };

  // CRUD Handler: Invoices
  const handleCreateInvoice = async (newInvData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    try {
      const created = await createInvoice(newInvData);
      setInvoices((prev) => [created, ...prev]);
      showToast(`Invoice ${created.invoiceNumber} emitted.`);
    } catch (e: any) {
      showToast('Failed to emit invoice.', 'error');
    }
  };

  const handleUpdateInvoiceStatus = async (invId: string, newStatus: Invoice['status']) => {
    try {
      await updateInvoiceStatus(invId, newStatus);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invId ? { ...inv, status: newStatus } : inv))
      );
      showToast(`Invoice marked as ${newStatus}.`);
    } catch (e: any) {
      showToast('Failed to update invoice.', 'error');
    }
  };

  const handleRecoverInvoice = async (invId: string) => {
    await handleUpdateInvoiceStatus(invId, 'settled');
  };

  // CRUD Handler: Payments
  const handleCreatePayment = async (
    paymentData: Omit<Payment, 'id' | 'paymentNumber' | 'settledAt' | 'createdAt'>
  ) => {
    try {
      const created = await createPayment(paymentData);
      setPayments((prev) => [created, ...prev]);
      if (created.invoiceId) {
        await updateInvoiceStatus(created.invoiceId, 'settled');
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === created.invoiceId ? { ...inv, status: 'settled' } : inv))
        );
      }
      showToast(`Payment ${created.paymentNumber} settled and recorded.`);
    } catch (e: any) {
      showToast('Failed to record payment.', 'error');
    }
  };

  const handleRefundPayment = async (id: string) => {
    try {
      await refundPayment(id);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'refunded' } : p)));
      showToast('Payment transaction refunded.');
    } catch (e: any) {
      showToast('Failed to refund payment.', 'error');
    }
  };

  // CRUD Handler: Plans
  const handleAddCustomPlan = async (planData: Plan) => {
    try {
      const created = await createPlan(planData);
      setPlans((prev) => [...prev, created]);
      showToast(`Plan tier "${created.name}" configured.`);
    } catch (e: any) {
      showToast('Failed to add plan tier.', 'error');
    }
  };

  const handleRunBillingCycle = async () => {
    try {
      setIsDataLoading(true);
      const res = await runRecurringBillingCycle();
      await loadDatabaseData();
      showToast(res.message);
    } catch (e: any) {
      showToast('Billing cycle execution failed.', 'error');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleQuickAction = (action: 'new_sub' | 'new_inv' | 'new_plan' | 'new_quote' | 'new_customer') => {
    if (action === 'new_sub') {
      setIsNewSubModalOpen(true);
    } else if (action === 'new_inv') {
      setInitialCustomerForInvoice(null);
      setIsNewInvModalOpen(true);
    } else if (action === 'new_plan') {
      setActiveTab('plans');
    } else if (action === 'new_quote') {
      setActiveTab('quotations');
    } else if (action === 'new_customer') {
      setActiveTab('customers');
    }
  };

  const handleOpenInvoiceForCustomer = (sub: Subscription) => {
    setInitialCustomerForInvoice(sub);
    setIsNewInvModalOpen(true);
  };

  const handleExportAllCSV = () => {
    exportToCSV('brightloop-ledger', invoices, [
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'company', label: 'Company' },
      { key: 'customerName', label: 'Contact' },
      { key: 'status', label: 'Status' },
      { key: 'amountUSD', label: 'Amount', format: (v) => formatCurrency(v, currency) },
      { key: 'issueDate', label: 'Issue Date' },
      { key: 'dueDate', label: 'Due Date' },
    ]);
  };

  const getActiveViewTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Executive Overview';
      case 'subscriptions':
        return 'Subscriptions Ledger';
      case 'invoices':
        return 'Invoices & Billing';
      case 'customers':
        return 'Customers Directory';
      case 'quotations':
        return 'Quotations & Proposals';
      case 'payments':
        return 'Payments Ledger';
      case 'plans':
        return 'Plans & Catalog';
      case 'cohorts':
        return 'Retention Cohorts';
      case 'dunning':
        return 'Smart Dunning Recovery';
      case 'webhooks':
        return 'Webhooks & Events';
      case 'settings':
        return 'RevOps & RLS Settings';
    }
  };

  const pastDueCount = subscriptions.filter((s) => s.status === 'past_due').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-body antialiased">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-[8px] pm-shadow-lg flex items-center gap-2.5 text-[13px] font-medium animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-[#0F172A] text-white border border-slate-700'
              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-[#DC2626] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 256px Fixed Sidebar Navigation Rail */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        subscriptionsCount={subscriptions.length}
        invoicesCount={invoices.length}
        customersCount={customers.length}
        quotationsCount={quotations.length}
        paymentsCount={payments.length}
        pastDueCount={pastDueCount}
        currentCurrency={currency}
        role={role}
        userEmail={profile.email}
        isSupabaseConnected={isSupabaseConnected}
        onQuickAction={handleQuickAction}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[256px]">
        {/* Sticky 60px Operational Utility Bar */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          currentCurrency={currency}
          onCurrencyChange={setCurrency}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onQuickAction={handleQuickAction}
          activeViewTitle={getActiveViewTitle()}
          role={role}
          userEmail={profile.email}
          isSupabaseConnected={isSupabaseConnected}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        {/* Notifications Popover Dropdown */}
        <NotificationsPopover
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          currency={currency}
          onMarkAllAsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onSelectNotification={(n) => {
            setIsNotificationsOpen(false);
            if (n.actionLink?.view) setActiveTab(n.actionLink.view as ActiveTab);
          }}
        />

        {/* Workspace Canvas (Max 1600px width constraint) */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Loading indicator if loading data */}
          {isDataLoading && (
            <div className="mb-4 p-2.5 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[6px] text-[#3457D5] text-[12px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span>Synchronizing database records from Supabase PostgreSQL...</span>
              </div>
              <span className="font-mono text-[11px]">RLS: Active</span>
            </div>
          )}

          {/* Customer Role Alert Banner */}
          {role === 'customer' && (
            <div className="mb-4 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] text-[#D97706] text-[12px] flex items-center justify-between">
              <span>
                <strong>Customer Isolated View:</strong> Showing private records matching your customer email ({profile.email}).
              </span>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="underline font-semibold text-[#B45309]"
              >
                Switch Role
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewView
              subscriptions={subscriptions}
              invoices={invoices}
              payments={payments}
              plans={plans}
              currency={currency}
              onSelectSubscription={(sub) => setSelectedSubscription(sub)}
              onSelectInvoice={(inv) => {
                const sub = subscriptions.find((s) => s.customerId === inv.customerId);
                if (sub) setSelectedSubscription(sub);
              }}
              onNavigate={(tab) => setActiveTab(tab)}
              onQuickAction={handleQuickAction}
              onRunBillingCycle={handleRunBillingCycle}
            />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              subscriptions={subscriptions}
              plans={plans}
              currency={currency}
              onSelectSubscription={(sub) => setSelectedSubscription(sub)}
              onQuickAction={handleQuickAction}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              subscriptions={subscriptions}
              currency={currency}
              onSelectInvoice={(inv) => {
                const sub = subscriptions.find((s) => s.customerId === inv.customerId);
                if (sub) setSelectedSubscription(sub);
              }}
              onQuickAction={handleQuickAction}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              currency={currency}
              role={role}
              onCreateCustomer={handleCreateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationsView
              quotations={quotations}
              customers={customers}
              plans={plans}
              currency={currency}
              role={role}
              onCreateQuotation={handleCreateQuotation}
              onUpdateQuotationStatus={handleUpdateQuotationStatus}
              onConvertToSubscription={handleConvertQuotationToSubscription}
              onDeleteQuotation={handleDeleteQuotation}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              invoices={invoices}
              customers={customers}
              currency={currency}
              role={role}
              onCreatePayment={handleCreatePayment}
              onRefundPayment={handleRefundPayment}
            />
          )}

          {activeTab === 'plans' && (
            <PlansView
              plans={plans}
              currency={currency}
              onQuickAction={handleQuickAction}
              onAddCustomPlan={handleAddCustomPlan}
            />
          )}

          {activeTab === 'cohorts' && <CohortsView currency={currency} />}

          {activeTab === 'dunning' && (
            <DunningView
              invoices={invoices}
              subscriptions={subscriptions}
              currency={currency}
              onRecoverInvoice={handleRecoverInvoice}
            />
          )}

          {activeTab === 'webhooks' && <WebhooksView />}

          {activeTab === 'settings' && (
            <SettingsView currentCurrency={currency} onCurrencyChange={setCurrency} />
          )}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => setActiveTab(view as ActiveTab)}
        subscriptions={subscriptions}
        invoices={invoices}
        quotations={quotations}
        customers={customers}
        onSelectSubscription={(sub) => setSelectedSubscription(sub)}
        onSelectInvoice={(inv) => {
          const sub = subscriptions.find((s) => s.customerId === inv.customerId);
          if (sub) setSelectedSubscription(sub);
        }}
        onQuickAction={handleQuickAction}
        onCurrencyChange={setCurrency}
        onExportCSV={handleExportAllCSV}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Customer & Subscription Detail Drawer */}
      <CustomerDrawer
        subscription={selectedSubscription}
        onClose={() => setSelectedSubscription(null)}
        currency={currency}
        customerInvoices={invoices.filter(
          (inv) =>
            inv.customerId === selectedSubscription?.customerId ||
            inv.customerEmail === selectedSubscription?.customerEmail
        )}
        plans={plans}
        onUpdateStatus={handleUpdateSubStatus}
        onUpdatePlan={handleUpdateSubPlan}
        onRetryDunning={handleRetryDunning}
        onIssueInvoice={handleOpenInvoiceForCustomer}
      />

      {/* New Subscription Modal */}
      <NewSubscriptionModal
        isOpen={isNewSubModalOpen}
        onClose={() => setIsNewSubModalOpen(false)}
        plans={plans}
        currency={currency}
        onCreateSubscription={handleCreateSubscription}
      />

      {/* New Invoice Modal */}
      <NewInvoiceModal
        isOpen={isNewInvModalOpen}
        onClose={() => setIsNewInvModalOpen(false)}
        subscriptions={subscriptions}
        currency={currency}
        initialCustomer={initialCustomerForInvoice}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* Supabase Connection & RLS Modal */}
      <SupabaseConnectionModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionSuccess={loadDatabaseData}
      />

      {/* Supabase Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
