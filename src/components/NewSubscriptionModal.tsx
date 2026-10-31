import React, { useState } from 'react';
import { X, Layers, CreditCard, Check, Building, Mail, User } from 'lucide-react';
import { Plan, Subscription, CurrencyCode, BillingCycle } from '../types';
import { formatCurrency } from '../utils/formatters';

interface NewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: Plan[];
  currency: CurrencyCode;
  onCreateSubscription: (newSub: Omit<Subscription, 'id' | 'subscriptionNumber' | 'startDate'>) => void;
}

export const NewSubscriptionModal: React.FC<NewSubscriptionModalProps> = ({
  isOpen,
  onClose,
  plans,
  currency,
  onCreateSubscription,
}) => {
  const [company, setCompany] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[1]?.id || plans[0]?.id || '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [seatCount, setSeatCount] = useState(10);
  const [paymentType, setPaymentType] = useState<'card' | 'bank_transfer' | 'upi'>('card');
  const [cardLast4, setCardLast4] = useState('4242');
  const [upiId, setUpiId] = useState('corp@axisbank');

  if (!isOpen) return null;

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  // Calculate pricing
  const isAnnual = billingCycle === 'annual';
  const monthlyUnit = (isAnnual ? currentPlan?.annualPriceUSD : currentPlan?.monthlyPriceUSD) || currentPlan?.priceUSD || 0;
  const totalAmountUSD = isAnnual ? monthlyUnit * 12 : monthlyUnit;
  const mrrContributionUSD = monthlyUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !customerName || !email) return;

    onCreateSubscription({
      customerId: `cust_${Date.now().toString().slice(-6)}`,
      customerName,
      company,
      customerEmail: email,
      planId: currentPlan.id,
      planName: currentPlan.name,
      tier: currentPlan.tier,
      status: 'active',
      amountUSD: totalAmountUSD,
      billingCycle,
      seatCount,
      nextBillingDate: new Date(Date.now() + (isAnnual ? 365 : 30) * 86400000)
        .toISOString()
        .slice(0, 10),
      paymentMethod: {
        type: paymentType,
        brand: paymentType === 'card' ? 'Visa Business' : paymentType === 'upi' ? 'UPI Autopay' : 'ACH Direct',
        last4: paymentType === 'card' ? cardLast4 : '1092',
        expiry: '12/29',
        upiId: paymentType === 'upi' ? upiId : undefined,
      },
      mrrContributionUSD,
      notes: 'Direct onboarding via RevOps console.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[560px] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] pm-shadow-modal overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[60px] px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#EEF2FF] text-[#3457D5] flex items-center justify-center">
              <Layers size={16} />
            </div>
            <div className="text-[15px] font-bold text-[#0F172A] font-display">
              New Customer Subscription
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-md hover:bg-[#F8FAFC]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Company & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Company / Organization <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Hypercloud"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none focus:border-[#3457D5] pm-focus-glow"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Primary Contact Person <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none focus:border-[#3457D5] pm-focus-glow"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
              Billing Email Address <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="billing@acmehypercloud.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none focus:border-[#3457D5] pm-focus-glow"
            />
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
              Subscription Plan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {plans.map((p) => {
                const isSelected = p.id === selectedPlanId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-3 rounded-[6px] border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3457D5] bg-[#EEF2FF]/40 ring-1 ring-[#3457D5]'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[#0F172A]">{p.name}</span>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {p.tier}
                      </span>
                    </div>
                    <div className="text-[14px] font-bold text-[#3457D5] font-mono-numbers mt-1">
                      {formatCurrency(p.monthlyPriceUSD || p.priceUSD || 0, currency)}
                      <span className="text-[11px] font-normal text-[#64748B]">/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cadence & Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Billing Cadence
              </label>
              <div className="flex items-center p-1 bg-[#F1F5F9] rounded-[6px]">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`flex-1 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Annual (-20%)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Developer Seats
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={seatCount}
                onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] font-mono-numbers outline-none focus:border-[#3457D5]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
              Payment Rail & Mandate
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('card')}
                className={`py-2 px-2.5 rounded-[6px] border text-[12px] font-medium transition-colors text-center ${
                  paymentType === 'card'
                    ? 'border-[#3457D5] bg-[#EEF2FF] text-[#3457D5]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('upi')}
                className={`py-2 px-2.5 rounded-[6px] border text-[12px] font-medium transition-colors text-center ${
                  paymentType === 'upi'
                    ? 'border-[#3457D5] bg-[#EEF2FF] text-[#3457D5]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                UPI Autopay
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('bank_transfer')}
                className={`py-2 px-2.5 rounded-[6px] border text-[12px] font-medium transition-colors text-center ${
                  paymentType === 'bank_transfer'
                    ? 'border-[#3457D5] bg-[#EEF2FF] text-[#3457D5]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                Wire / ACH Mandate
              </button>
            </div>

            {paymentType === 'card' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[12px] text-[#64748B]">Simulated Card: Visa Ending in</span>
                <input
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  className="w-16 px-2 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded text-center font-mono-numbers"
                />
              </div>
            )}
            {paymentType === 'upi' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="customer@upi"
                  className="w-full px-3 py-1.5 text-[12px] bg-white border border-[#CBD5E1] rounded font-mono-numbers"
                />
              </div>
            )}
          </div>

          {/* Pricing Summary Box */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-[#64748B] uppercase">
                Contract Billing Summary
              </div>
              <div className="text-[12px] text-[#0F172A] mt-0.5">
                {currentPlan.name} · {seatCount} Seats · {billingCycle}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[18px] font-bold text-[#0F172A] font-display font-mono-numbers">
                {formatCurrency(totalAmountUSD, currency)}
              </div>
              <div className="text-[11px] text-[#16A34A] font-mono-numbers">
                + {formatCurrency(mrrContributionUSD, currency)} MRR
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3457D5] hover:bg-[#2A48B8] active:bg-[#1E3A8A] text-white text-[13px] font-semibold rounded-[6px] shadow-xs transition-all pm-focus-glow"
            >
              Activate Subscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
