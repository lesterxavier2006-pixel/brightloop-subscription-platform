import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  CreditCard,
  Building,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Subscription, CurrencyCode, Plan } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  plans: Plan[];
  currency: CurrencyCode;
  onSelectSubscription: (sub: Subscription) => void;
  onQuickAction: (action: 'new_sub') => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  plans,
  currency,
  onSelectSubscription,
  onQuickAction,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Filter subscriptions
  const filtered = subscriptions.filter((sub) => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesTier = selectedTier === 'all' || sub.tier === selectedTier;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      sub.customerName.toLowerCase().includes(q) ||
      sub.company.toLowerCase().includes(q) ||
      sub.subscriptionNumber.toLowerCase().includes(q) ||
      sub.customerEmail.toLowerCase().includes(q) ||
      sub.planName.toLowerCase().includes(q);

    return matchesStatus && matchesTier && matchesQuery;
  });

  const counts = {
    all: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    past_due: subscriptions.filter((s) => s.status === 'past_due').length,
    paused: subscriptions.filter((s) => s.status === 'paused' || s.status === 'triaged').length,
    canceled: subscriptions.filter((s) => s.status === 'canceled').length,
  };

  const handleExportCSV = () => {
    exportToCSV('subscriptions-ledger', filtered, [
      { key: 'subscriptionNumber', label: 'Subscription ID' },
      { key: 'company', label: 'Company' },
      { key: 'customerName', label: 'Contact Name' },
      { key: 'customerEmail', label: 'Email' },
      { key: 'planName', label: 'Plan' },
      { key: 'tier', label: 'Tier' },
      { key: 'status', label: 'Status' },
      { key: 'billingCycle', label: 'Cadence' },
      { key: 'mrrContributionUSD', label: 'MRR', format: (val) => formatCurrency(val, currency) },
      { key: 'nextBillingDate', label: 'Next Billing' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Subscriptions Ledger
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Active customer contracts, seat allocations, recurring billing cycles, and payment rails.
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

          <button
            onClick={() => onQuickAction('new_sub')}
            className="h-8 px-3 text-[12px] font-semibold text-white bg-[#3457D5] hover:bg-[#2A48B8] rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors pm-focus-glow"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm space-y-3">
        {/* Status Segmented Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-[6px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Contracts', count: counts.all },
              { id: 'active', label: 'Active', count: counts.active },
              { id: 'past_due', label: 'Past Due / Dunning', count: counts.past_due, alert: true },
              { id: 'triaged', label: 'Paused / Trials', count: counts.paused },
              { id: 'canceled', label: 'Canceled', count: counts.canceled },
            ].map((tab) => {
              const isSelected = filterStatus === tab.id;
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
                      tab.alert && tab.count > 0
                        ? 'bg-[#FEF2F2] text-[#DC2626]'
                        : isSelected
                        ? 'bg-[#EEF2FF] text-[#3457D5]'
                        : 'bg-white/80 text-[#64748B]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#64748B] hidden sm:inline">Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="h-8 px-2.5 text-[12px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Custom">Custom Sovereign</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by company, customer name, subscription ID (e.g. SUB-9821-X), or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3457D5] rounded-[6px] text-[#0F172A] placeholder-[#94A3B8] outline-none pm-focus-glow"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-[40px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] tracking-[0.05em] uppercase font-body">
                <th className="px-5">Subscription ID</th>
                <th className="px-4">Account & Entity</th>
                <th className="px-4">Plan & Tier</th>
                <th className="px-4">Seats</th>
                <th className="px-4">Cadence</th>
                <th className="px-4 text-right">Normalized MRR</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-4">Next Renewal</th>
                <th className="px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748B]">
                    <div className="text-[14px] font-medium">No subscriptions match your query</div>
                    <div className="text-[12px] text-[#94A3B8] mt-1">
                      Try clearing search parameters or filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => {
                  return (
                    <tr
                      key={sub.id}
                      onClick={() => onSelectSubscription(sub)}
                      className="h-[52px] hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      <td className="px-5 font-mono-numbers font-medium text-[#0F172A]">
                        {sub.subscriptionNumber}
                      </td>

                      <td className="px-4">
                        <div className="font-semibold text-[#0F172A] group-hover:text-[#3457D5] transition-colors">
                          {sub.company}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate max-w-[180px]">
                          {sub.customerName} · {sub.customerEmail}
                        </div>
                      </td>

                      <td className="px-4">
                        <div className="font-medium text-[#0F172A]">{sub.planName}</div>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {sub.tier}
                        </span>
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#475569]">
                        {sub.seatCount} seats
                      </td>

                      <td className="px-4 text-[12px] text-[#64748B] capitalize">
                        {sub.billingCycle}
                      </td>

                      <td className="px-4 text-right font-bold text-[#0F172A] font-mono-numbers">
                        {formatCurrency(sub.mrrContributionUSD, currency)}
                        <span className="text-[11px] font-normal text-[#64748B]">/mo</span>
                      </td>

                      <td className="px-4 text-center">
                        {sub.status === 'active' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]">
                            <CheckCircle2 size={11} />
                            <span>Active</span>
                          </span>
                        )}
                        {sub.status === 'past_due' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                            <AlertTriangle size={11} />
                            <span>Past Due</span>
                          </span>
                        )}
                        {(sub.status === 'paused' || sub.status === 'triaged') && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                            <Clock size={11} />
                            <span>{sub.status === 'paused' ? 'Paused' : 'Trial'}</span>
                          </span>
                        )}
                        {sub.status === 'canceled' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                            <span>Canceled</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#64748B]">
                        {formatDate(sub.nextBillingDate)}
                      </td>

                      <td className="px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubscription(sub);
                          }}
                          className="px-2.5 py-1 text-[12px] font-medium text-[#3457D5] hover:bg-[#EEF2FF] rounded-[4px] transition-colors"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Telemetry */}
        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[#64748B]">
          <div>
            Showing <span className="font-semibold text-[#0F172A]">{filtered.length}</span> of{' '}
            <span className="font-semibold text-[#0F172A]">{subscriptions.length}</span> recorded subscriptions
          </div>
          <div className="flex items-center gap-4">
            <span>
              Total Filtered MRR:{' '}
              <strong className="font-mono-numbers text-[#0F172A]">
                {formatCurrency(
                  filtered.reduce((a, b) => a + (b.status !== 'canceled' ? b.mrrContributionUSD : 0), 0),
                  currency
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
