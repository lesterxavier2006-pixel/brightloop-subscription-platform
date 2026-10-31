import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Download,
  Building,
  Mail,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Subscription, Invoice, CurrencyCode, Plan } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CustomerDrawerProps {
  subscription: Subscription | null;
  onClose: () => void;
  currency: CurrencyCode;
  customerInvoices: Invoice[];
  plans: Plan[];
  onUpdateStatus: (subId: string, newStatus: Subscription['status']) => void;
  onUpdatePlan: (subId: string, newPlanId: string) => void;
  onRetryDunning: (subId: string) => void;
  onIssueInvoice: (sub: Subscription) => void;
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  subscription,
  onClose,
  currency,
  customerInvoices,
  plans,
  onUpdateStatus,
  onUpdatePlan,
  onRetryDunning,
  onIssueInvoice,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!subscription) return null;

  const currentPlan = plans.find((p) => p.id === subscription.planId);

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]">
            <CheckCircle2 size={12} />
            <span>Active</span>
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            <AlertTriangle size={12} />
            <span>Past Due (Dunning)</span>
          </span>
        );
      case 'triaged':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <Clock size={12} />
            <span>Triaged / Trial</span>
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
            <span>Canceled</span>
          </span>
        );
    }
  };

  const handlePlanChangeSubmit = () => {
    if (!selectedPlanId || selectedPlanId === subscription.planId) {
      setIsChangingPlan(false);
      return;
    }
    onUpdatePlan(subscription.id, selectedPlanId);
    setIsChangingPlan(false);
    setActionSuccessMsg('Subscription tier upgraded successfully.');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleManualRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      onRetryDunning(subscription.id);
      setIsRetrying(false);
      setActionSuccessMsg('Payment successfully authorized via secondary routing rail!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[540px] bg-[#FFFFFF] border-l border-[#E2E8F0] pm-shadow-modal h-full overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[64px] px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#EEF2FF] text-[#3457D5] flex items-center justify-center font-bold text-[13px] border border-[#C7D2FE]">
              {subscription.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#0F172A] font-display">
                {subscription.company}
              </div>
              <div className="text-[12px] text-[#64748B] font-mono-numbers">
                {subscription.subscriptionNumber}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-md hover:bg-[#F8FAFC]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Success Toast if any */}
        {actionSuccessMsg && (
          <div className="px-6 py-2.5 bg-[#ECFDF5] border-b border-[#BBF7D0] text-[#16A34A] text-[13px] font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6">
          {/* Top Status & MRR Card */}
          <div className="p-4 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wider">
                Subscription State
              </span>
              {getStatusBadge(subscription.status)}
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-[12px] text-[#64748B]">Monthly Normalized Value</div>
                <div className="text-[26px] font-bold text-[#0F172A] font-display font-mono-numbers">
                  {formatCurrency(subscription.mrrContributionUSD, currency)}
                  <span className="text-[12px] font-normal text-[#64748B]"> / mo</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12px] text-[#64748B]">Cadence</div>
                <div className="text-[14px] font-semibold text-[#0F172A] capitalize">
                  {subscription.billingCycle}
                </div>
              </div>
            </div>

            {/* Dunning Notice if Past Due */}
            {subscription.status === 'past_due' && (
              <div className="mt-3 p-3 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-[#DC2626] shrink-0 mt-0.5" />
                  <div className="text-[12px] text-[#DC2626] leading-relaxed">
                    Recurring payment failed twice. Dunning Step 2 active (soft email issued + automated card updater queue).
                  </div>
                </div>
                <button
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                  className="w-full mt-1 px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[12px] font-semibold rounded-[6px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  <RotateCcw size={14} className={isRetrying ? 'animate-spin' : ''} />
                  <span>{isRetrying ? 'Authorizing Rail...' : 'Execute Immediate Retry'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Customer Metadata Grid */}
          <div className="space-y-3">
            <div className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Account Attributes
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="p-3 rounded-[6px] border border-[#E2E8F0] bg-white">
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-1">
                  <Mail size={13} />
                  <span>Primary RevOps Contact</span>
                </div>
                <div className="font-medium text-[#0F172A]">{subscription.customerName}</div>
                <div className="text-[11px] text-[#64748B] truncate">{subscription.customerEmail}</div>
              </div>

              <div className="p-3 rounded-[6px] border border-[#E2E8F0] bg-white">
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-1">
                  <Building size={13} />
                  <span>Assigned Seats</span>
                </div>
                <div className="font-semibold text-[#0F172A] font-mono-numbers">
                  {subscription.seatCount} Developer Seats
                </div>
                <div className="text-[11px] text-[#16A34A] font-medium">SSO & SAML Enabled</div>
              </div>

              <div className="p-3 rounded-[6px] border border-[#E2E8F0] bg-white">
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-1">
                  <CreditCard size={13} />
                  <span>Payment Gateway Rail</span>
                </div>
                <div className="font-semibold text-[#0F172A]">
                  {subscription.paymentMethod.brand} ···· {subscription.paymentMethod.last4}
                </div>
                {subscription.paymentMethod.expiry && (
                  <div className="text-[11px] text-[#64748B] font-mono-numbers">
                    Exp: {subscription.paymentMethod.expiry}
                  </div>
                )}
                {subscription.paymentMethod.upiId && (
                  <div className="text-[11px] text-[#3457D5] font-mono-numbers">
                    {subscription.paymentMethod.upiId}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-[6px] border border-[#E2E8F0] bg-white">
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-1">
                  <Calendar size={13} />
                  <span>Next Renewal Cycle</span>
                </div>
                <div className="font-semibold text-[#0F172A] font-mono-numbers">
                  {formatDate(subscription.nextBillingDate)}
                </div>
                <div className="text-[11px] text-[#64748B]">Auto-Renew Active</div>
              </div>
            </div>
          </div>

          {/* Plan Management Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Current Plan Tier
              </span>
              {!isChangingPlan && (
                <button
                  onClick={() => {
                    setSelectedPlanId(subscription.planId || (plans[0]?.id || ''));
                    setIsChangingPlan(true);
                  }}
                  className="text-[12px] font-medium text-[#3457D5] hover:text-[#2A48B8]"
                >
                  Change Plan Tier
                </button>
              )}
            </div>

            {isChangingPlan ? (
              <div className="p-4 rounded-[8px] border border-[#3457D5]/40 bg-[#EEF2FF]/30 space-y-3">
                <div className="text-[13px] font-medium text-[#0F172A]">
                  Select new subscription plan:
                </div>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] text-[13px] text-[#0F172A] outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tier}) — {formatCurrency(p.monthlyPriceUSD || p.priceUSD || 0, currency)}/mo
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsChangingPlan(false)}
                    className="px-3 py-1.5 text-[12px] font-medium text-[#64748B] hover:text-[#0F172A]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlanChangeSubmit}
                    className="px-3 py-1.5 bg-[#3457D5] hover:bg-[#2A48B8] text-white text-[12px] font-semibold rounded-[6px]"
                  >
                    Confirm Upgrade
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-[8px] border border-[#E2E8F0] bg-white flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-bold text-[#0F172A]">
                    {subscription.planName}
                  </div>
                  <div className="text-[12px] text-[#64748B]">
                    {currentPlan?.description || 'Standard enterprise recurring allocation.'}
                  </div>
                </div>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#3457D5] border border-[#C7D2FE]">
                  {subscription.tier}
                </span>
              </div>
            )}
          </div>

          {/* Invoices History for this Account */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Billing Invoices ({customerInvoices.length})
              </span>
              <button
                onClick={() => onIssueInvoice(subscription)}
                className="text-[12px] font-medium text-[#16A34A] hover:underline"
              >
                + Issue New Invoice
              </button>
            </div>

            <div className="border border-[#E2E8F0] rounded-[6px] overflow-hidden divide-y divide-[#F1F5F9]">
              {customerInvoices.length === 0 ? (
                <div className="p-4 text-center text-[12px] text-[#64748B]">
                  No prior statements on record for this customer.
                </div>
              ) : (
                customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 bg-white hover:bg-[#F8FAFC] flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#0F172A] font-mono-numbers">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        Due {formatDate(inv.dueDate)} · {inv.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-bold text-[#0F172A] font-mono-numbers">
                        {formatCurrency(inv.amountUSD, currency)}
                      </div>
                      <span className="text-[11px] text-[#3457D5] hover:underline cursor-pointer">
                        View Receipt
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Lifecycle Actions */}
          <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
            <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Subscription Lifecycle
            </div>
            <div className="grid grid-cols-2 gap-2">
              {subscription.status === 'active' ? (
                <button
                  onClick={() => onUpdateStatus(subscription.id, 'paused')}
                  className="px-3 py-2 text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[6px] transition-colors"
                >
                  Pause Subscription
                </button>
              ) : (
                <button
                  onClick={() => onUpdateStatus(subscription.id, 'active')}
                  className="px-3 py-2 text-[12px] font-semibold text-[#16A34A] bg-[#ECFDF5] border border-[#BBF7D0] rounded-[6px] hover:bg-[#D1FAE5] transition-colors"
                >
                  Reactivate Subscription
                </button>
              )}

              {subscription.status !== 'canceled' && (
                <button
                  onClick={() => {
                    if (confirm(`Confirm cancellation of ${subscription.company}'s subscription?`)) {
                      onUpdateStatus(subscription.id, 'canceled');
                    }
                  }}
                  className="px-3 py-2 text-[12px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] border border-[#FECACA] rounded-[6px] transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
