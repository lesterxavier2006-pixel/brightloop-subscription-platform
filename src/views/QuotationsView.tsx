import React, { useState } from 'react';
import {
  FileCheck,
  Search,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Layers,
  Trash2,
  X,
} from 'lucide-react';
import { Quotation, Customer, Plan, CurrencyCode, UserRole } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface QuotationsViewProps {
  quotations: Quotation[];
  customers: Customer[];
  plans: Plan[];
  currency: CurrencyCode;
  role: UserRole;
  onCreateQuotation: (quote: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => Promise<void>;
  onUpdateQuotationStatus: (id: string, status: Quotation['status']) => Promise<void>;
  onConvertToSubscription: (quote: Quotation) => Promise<void>;
  onDeleteQuotation: (id: string) => Promise<void>;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  customers,
  plans,
  currency,
  role,
  onCreateQuotation,
  onUpdateQuotationStatus,
  onConvertToSubscription,
  onDeleteQuotation,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // New Quote form state
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [seatCount, setSeatCount] = useState(10);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState('');

  const filtered = quotations.filter((q) => {
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      q.quotationNumber.toLowerCase().includes(term) ||
      q.company.toLowerCase().includes(term) ||
      q.customerName.toLowerCase().includes(term) ||
      q.email.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId) || customers[0];
    const plan = plans.find((p) => p.id === selectedPlanId) || plans[0];

    const isAnnual = billingCycle === 'annual';
    const unitPrice = (isAnnual ? plan.annualPriceUSD : plan.monthlyPriceUSD) || plan.priceUSD || 0;
    const totalAmount = isAnnual ? unitPrice * 12 : unitPrice;

    const validUntil = new Date(Date.now() + validDays * 86400000).toISOString().slice(0, 10);

    await onCreateQuotation({
      customerId: cust.id,
      customerName: cust.contactName,
      company: cust.companyName,
      email: cust.email,
      planId: plan.id,
      planName: plan.name,
      amountUSD: totalAmount,
      billingCycle,
      seatCount,
      status: 'sent',
      validUntil,
      lineItems: [
        {
          id: `li_${Date.now()}`,
          description: `${plan.name} Tier Commitment (${seatCount} seats included)`,
          quantity: 1,
          unitPriceUSD: totalAmount,
          totalUSD: totalAmount,
        },
      ],
      notes,
    });

    setIsNewQuoteModalOpen(false);
    setActionSuccessNotice('Commercial quotation created and dispatched successfully!');
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  const handleConvert = async (quote: Quotation) => {
    await onConvertToSubscription(quote);
    setActionSuccessNotice(`Quote ${quote.quotationNumber} accepted & converted into active subscription!`);
    setTimeout(() => setActionSuccessNotice(null), 3500);
  };

  const handleExportCSV = () => {
    exportToCSV('quotations-ledger', filtered, [
      { key: 'quotationNumber', label: 'Quote #' },
      { key: 'company', label: 'Company' },
      { key: 'customerName', label: 'Contact' },
      { key: 'email', label: 'Email' },
      { key: 'planName', label: 'Plan' },
      { key: 'billingCycle', label: 'Cycle' },
      { key: 'amountUSD', label: 'Sum', format: (v) => formatCurrency(v, currency) },
      { key: 'status', label: 'Status' },
      { key: 'validUntil', label: 'Valid Until' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Quotations & Contract Proposals
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            B2B proposal lifecycle, term negotiations, and 1-click subscription conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="h-8 px-3 text-[12px] font-medium text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[6px] flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download size={14} className="text-[#64748B]" />
            <span>Export CSV</span>
          </button>

          {role !== 'customer' && (
            <button
              onClick={() => setIsNewQuoteModalOpen(true)}
              className="h-8 px-3 text-[12px] font-semibold text-white bg-[#3457D5] hover:bg-[#2A48B8] rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors pm-focus-glow"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-[6px] text-[#16A34A] text-[13px] font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-[6px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Quotations' },
              { id: 'sent', label: 'Under Review / Sent' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'draft', label: 'Drafts' },
              { id: 'expired', label: 'Expired' },
            ].map((tab) => {
              const isSelected = filterStatus === tab.id;
              const count =
                tab.id === 'all'
                  ? quotations.length
                  : quotations.filter((q) => q.status === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] flex items-center gap-2 whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-white text-[#0F172A] font-semibold shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-[#EEF2FF] text-[#3457D5]' : 'bg-white/80 text-[#64748B]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search quotations by quote #, company, customer or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3457D5] rounded-[6px] text-[#0F172A] placeholder-[#94A3B8] outline-none pm-focus-glow"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="h-[40px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase font-body">
                <th className="px-5">Quote #</th>
                <th className="px-4">Prospect & Company</th>
                <th className="px-4">Plan & Seats</th>
                <th className="px-4">Cadence</th>
                <th className="px-4 text-right">Quoted Value</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-4">Valid Until</th>
                <th className="px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    <div className="text-[14px] font-medium">No quotations match your criteria</div>
                    <div className="text-[12px] text-[#94A3B8] mt-1">
                      Create a commercial quotation to start onboarding.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((quote) => {
                  return (
                    <tr key={quote.id} className="h-[52px] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 font-mono-numbers font-medium text-[#0F172A]">
                        {quote.quotationNumber}
                      </td>

                      <td className="px-4">
                        <div className="font-semibold text-[#0F172A]">{quote.company}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {quote.customerName} · {quote.email}
                        </div>
                      </td>

                      <td className="px-4">
                        <div className="font-medium text-[#0F172A]">{quote.planName}</div>
                        <div className="text-[11px] text-[#64748B]">{quote.seatCount} Seats</div>
                      </td>

                      <td className="px-4 text-[12px] text-[#64748B] capitalize">
                        {quote.billingCycle}
                      </td>

                      <td className="px-4 text-right font-bold text-[#0F172A] font-mono-numbers">
                        {formatCurrency(quote.amountUSD, currency)}
                      </td>

                      <td className="px-4 text-center">
                        {quote.status === 'accepted' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]">
                            <CheckCircle2 size={11} />
                            <span>Accepted</span>
                          </span>
                        )}
                        {quote.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#3457D5] border border-[#C7D2FE]">
                            <Clock size={11} />
                            <span>Sent / In Review</span>
                          </span>
                        )}
                        {quote.status === 'draft' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                            <span>Draft</span>
                          </span>
                        )}
                        {quote.status === 'expired' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                            <span>Expired</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#64748B]">
                        {formatDate(quote.validUntil)}
                      </td>

                      <td className="px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {quote.status !== 'accepted' && (
                            <button
                              onClick={() => handleConvert(quote)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-[4px] flex items-center gap-1 transition-colors shadow-2xs"
                              title="Accept & Convert into Active Subscription"
                            >
                              <span>Convert to Sub</span>
                              <ArrowRight size={12} />
                            </button>
                          )}

                          {quote.status === 'sent' && (
                            <button
                              onClick={() => onUpdateQuotationStatus(quote.id, 'accepted')}
                              className="px-2 py-1 text-[11px] font-medium text-[#3457D5] hover:bg-[#EEF2FF] rounded transition-colors"
                            >
                              Mark Accepted
                            </button>
                          )}

                          {role !== 'customer' && (
                            <button
                              onClick={() => onDeleteQuotation(quote.id)}
                              className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                              title="Delete Quotation"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Quotation */}
      {isNewQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs">
          <div className="w-full max-w-[520px] bg-white border border-[#E2E8F0] rounded-[12px] pm-shadow-modal p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-[15px] font-bold text-[#0F172A] font-display">
                Create Commercial Proposal Quotation
              </span>
              <button
                onClick={() => setIsNewQuoteModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Customer / Prospect Account
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Plan Tier
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tier}) — {formatCurrency(p.monthlyPriceUSD || p.priceUSD || 0, currency)}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Cadence
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual (-20% discount)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={seatCount}
                    onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Terms & Proposal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Payment within Net 30, includes dedicated solution engineer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsNewQuoteModalOpen(false)}
                  className="px-3 py-1.5 text-[12px] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3457D5] text-white text-[12px] font-semibold rounded-[6px]"
                >
                  Create & Send Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
