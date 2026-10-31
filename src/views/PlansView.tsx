import React, { useState } from 'react';
import { CreditCard, Check, Plus, Users, Zap, Shield, Sparkles, Building2 } from 'lucide-react';
import { Plan, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PlansViewProps {
  plans: Plan[];
  currency: CurrencyCode;
  onQuickAction: (action: 'new_sub') => void;
  onAddCustomPlan: (plan: Plan) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({
  plans,
  currency,
  onQuickAction,
  onAddCustomPlan,
}) => {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);

  // New plan form state
  const [planName, setPlanName] = useState('');
  const [planTier, setPlanTier] = useState<Plan['tier']>('Growth');
  const [monthlyPriceUSD, setMonthlyPriceUSD] = useState(650);
  const [maxSeats, setMaxSeats] = useState<number | 'Unlimited'>(15);
  const [description, setDescription] = useState('');

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    const newPlan: Plan = {
      id: `plan_${Date.now()}`,
      code: `PLN-${planName.slice(0, 3).toUpperCase()}-0${plans.length + 1}`,
      name: planName,
      tier: planTier,
      description: description || 'Custom enterprise subscription tier configured by RevOps.',
      monthlyPriceUSD,
      annualPriceUSD: Math.round(monthlyPriceUSD * 0.8),
      features: [
        'Custom compute allocation',
        'Standard multi-currency settlement',
        'Automated dunning retry sequence',
        'API & Webhook integration',
      ],
      maxSeats,
      activeSubscribers: 1,
    };

    onAddCustomPlan(newPlan);
    setIsNewPlanModalOpen(false);
    setPlanName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Plans & Pricing Catalog
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Configure recurring subscriptions, seat limits, multi-currency price schedules, and tier economics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cadence Switcher */}
          <div className="flex items-center p-1 bg-[#F1F5F9] rounded-[6px]">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-[#0F172A] font-semibold shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 ${
                billingInterval === 'annual'
                  ? 'bg-white text-[#3457D5] font-semibold shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <span>Annual Contract</span>
              <span className="text-[10px] bg-[#ECFDF5] text-[#16A34A] px-1.5 py-0.2 rounded font-semibold border border-[#BBF7D0]">
                -20%
              </span>
            </button>
          </div>

          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="h-8 px-3 text-[12px] font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[6px] flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>Add Plan Tier</span>
          </button>
        </div>
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const price = (billingInterval === 'annual' ? p.annualPriceUSD : p.monthlyPriceUSD) || p.priceUSD || 0;
          const totalPlanMRR = (p.activeSubscribers || 0) * (p.monthlyPriceUSD || p.priceUSD || 0);

          return (
            <div
              key={p.id}
              className={`bg-white border rounded-[8px] p-5 pm-shadow-sm flex flex-col justify-between transition-all relative ${
                p.popular ? 'border-[#3457D5] ring-1 ring-[#3457D5]' : 'border-[#E2E8F0]'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-2.5 right-4 bg-[#3457D5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Most Deployed
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium text-[#64748B]">{p.code}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                    {p.tier}
                  </span>
                </div>

                <div className="text-[16px] font-bold text-[#0F172A] mt-2 font-display">
                  {p.name}
                </div>
                <div className="text-[12px] text-[#64748B] mt-1 min-h-[36px] line-clamp-2 leading-relaxed">
                  {p.description}
                </div>

                {/* Price Display */}
                <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-[#0F172A] font-display font-mono-numbers">
                      {formatCurrency(price, currency)}
                    </span>
                    <span className="text-[12px] text-[#64748B]">/mo per cluster</span>
                  </div>
                  {billingInterval === 'annual' && (
                    <div className="text-[11px] text-[#16A34A] font-medium mt-0.5">
                      Billed annually ({formatCurrency(price * 12, currency)}/yr)
                    </div>
                  )}
                </div>

                {/* Subscriber & MRR Telemetry */}
                <div className="mt-3 p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 text-[11px]">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Active Contracts:</span>
                    <span className="font-semibold text-[#0F172A] font-mono-numbers">
                      {p.activeSubscribers} teams
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Current Pool MRR:</span>
                    <span className="font-semibold text-[#3457D5] font-mono-numbers">
                      {formatCurrency(totalPlanMRR, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Seats Quota:</span>
                    <span className="font-medium text-[#0F172A]">
                      {p.maxSeats === 'Unlimited' ? 'Unlimited' : `Up to ${p.maxSeats} seats`}
                    </span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Tier Inclusions
                  </div>
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-[12px] text-[#475569]">
                      <Check size={14} className="text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-3 border-t border-[#F1F5F9]">
                <button
                  onClick={() => onQuickAction('new_sub')}
                  className={`w-full py-2 text-[12px] font-semibold rounded-[6px] transition-colors ${
                    p.popular
                      ? 'bg-[#3457D5] hover:bg-[#2A48B8] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]'
                  }`}
                >
                  Onboard Customer to Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Custom Plan */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs">
          <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-[12px] pm-shadow-modal p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-[15px] font-bold text-[#0F172A] font-display">
                Create Catalog Pricing Tier
              </span>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Plan Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sovereign AI Scale"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Monthly Base (USD)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={monthlyPriceUSD}
                    onChange={(e) => setMonthlyPriceUSD(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Classification Tier
                  </label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Tier Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of included telemetry and compute..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-3 py-1.5 text-[12px] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3457D5] text-white text-[12px] font-semibold rounded-[6px]"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
