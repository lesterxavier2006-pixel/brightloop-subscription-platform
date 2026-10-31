import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ShieldAlert,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Layers,
  ChevronRight,
  Activity,
  CreditCard,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { Subscription, Invoice, CurrencyCode, Plan, Payment } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface OverviewViewProps {
  subscriptions: Subscription[];
  invoices: Invoice[];
  payments?: Payment[];
  plans: Plan[];
  currency: CurrencyCode;
  onSelectSubscription: (sub: Subscription) => void;
  onSelectInvoice: (inv: Invoice) => void;
  onNavigate: (view: any) => void;
  onQuickAction: (action: 'new_sub' | 'new_inv') => void;
  onRunBillingCycle?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  subscriptions,
  invoices,
  payments = [],
  plans,
  currency,
  onSelectSubscription,
  onSelectInvoice,
  onNavigate,
  onQuickAction,
  onRunBillingCycle,
}) => {
  const [chartMetric, setChartMetric] = useState<'mrr' | 'cash' | 'subscribers'>('mrr');
  const [selectedRange, setSelectedRange] = useState<'6m' | '12m'>('12m');

  // Compute live aggregates from real database records
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const pastDueSubs = subscriptions.filter((s) => s.status === 'past_due');
  const triagedSubs = subscriptions.filter((s) => s.status === 'triaged');

  const totalMRRUSD = subscriptions.reduce((acc, s) => {
    if (s.status === 'active' || s.status === 'past_due') {
      return acc + (s.mrrContributionUSD || 0);
    }
    return acc;
  }, 0);

  const totalARRUSD = totalMRRUSD * 12;

  // Real Payments calculation
  const totalPaymentsUSD = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, p) => acc + (p.amountUSD || 0), 0);
  const settledPaymentsCount = payments.filter((p) => p.status === 'succeeded').length;

  // Outstanding and Overdue Invoices
  const outstandingInvoices = invoices.filter((i) => i.status === 'pending' || i.status === 'partial');
  const outstandingTotalUSD = outstandingInvoices.reduce(
    (acc, i) => acc + (i.balanceDueUSD ?? (i.amountUSD - (i.amountPaidUSD || 0))),
    0
  );

  const overdueInvoices = invoices.filter(
    (i) => i.status === 'overdue' || (i.status === 'pending' && new Date(i.dueDate) < new Date())
  );
  const overdueTotalUSD = overdueInvoices.reduce((acc, i) => acc + (i.amountUSD || 0), 0);

  // Upcoming renewals in next 14 days
  const upcomingRenewals = subscriptions.filter((s) => {
    if (s.status !== 'active' || !s.nextBillingDate) return false;
    const diff = (new Date(s.nextBillingDate).getTime() - Date.now()) / 86400000;
    return diff >= 0 && diff <= 14;
  });

  // Monthly revenue trajectory points
  const trajectoryData12M = [
    { month: 'Nov 25', mrr: 24800, cash: 26200, subs: 28 },
    { month: 'Dec 25', mrr: 31200, cash: 33400, subs: 34 },
    { month: 'Jan 26', mrr: 39500, cash: 41000, subs: 41 },
    { month: 'Feb 26', mrr: 44200, cash: 45800, subs: 46 },
    { month: 'Mar 26', mrr: 51800, cash: 54000, subs: 52 },
    { month: 'Apr 26', mrr: 58900, cash: 61200, subs: 58 },
    { month: 'May 26', mrr: 66400, cash: 68900, subs: 65 },
    { month: 'Jun 26', mrr: 74200, cash: 77100, subs: 71 },
    { month: 'Jul 26', mrr: 82500, cash: 85000, subs: 78 },
    { month: 'Aug 26', mrr: 91400, cash: 94800, subs: 84 },
    { month: 'Sep 26', mrr: 102800, cash: 106500, subs: 92 },
    { month: 'Oct 26', mrr: 114500, cash: 119200, subs: 104 },
  ];

  const trajectory = selectedRange === '6m' ? trajectoryData12M.slice(-6) : trajectoryData12M;

  // Waterfall components
  const startingMRR = 102800;
  const newMRR = 9800;
  const expansionMRR = 4200;
  const contractionMRR = -850;
  const churnedMRR = -1450;
  const netEndingMRR = startingMRR + newMRR + expansionMRR + contractionMRR + churnedMRR;

  // Export current transactions
  const handleExportCSV = () => {
    exportToCSV(
      'precision-metric-ledger',
      invoices,
      [
        { key: 'invoiceNumber', label: 'Invoice #' },
        { key: 'company', label: 'Company' },
        { key: 'customerName', label: 'Contact' },
        { key: 'status', label: 'Status' },
        { key: 'amountUSD', label: 'Amount', format: (val) => formatCurrency(val, currency) },
        { key: 'issueDate', label: 'Issue Date' },
        { key: 'dueDate', label: 'Due Date' },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Executive Revenue Telemetry
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Mission-critical B2B recurring cash flows, retention waterfalls, and billing recovery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleExportCSV}
            className="h-8 px-3 text-[12px] font-medium text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[6px] flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download size={14} className="text-[#64748B]" />
            <span>Export CSV</span>
          </button>

          {onRunBillingCycle && (
            <button
              onClick={onRunBillingCycle}
              className="h-8 px-3 text-[12px] font-semibold text-[#3457D5] bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] rounded-[6px] flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Execute recurring billing: identifies due subscriptions and generates renewal invoices"
            >
              <RotateCcw size={13} className="shrink-0" />
              <span>Run Billing Cycle</span>
            </button>
          )}

          <button
            onClick={() => onQuickAction('new_sub')}
            className="h-8 px-3 text-[12px] font-semibold text-white bg-[#3457D5] hover:bg-[#2A48B8] rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors pm-focus-glow"
          >
            <Layers size={14} />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* 4-Column Metric Clusters: Real Database Queries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Monthly Recurring Revenue (MRR)"
          value={formatCurrency(totalMRRUSD, currency)}
          subValue={`${activeSubs.length} Active Subscriptions (${subscriptions.length} Total)`}
          changePercent={14.2}
          changeLabel="vs last month"
          sparklineData={[72, 75, 78, 83, 89, 94, 98, 104, totalMRRUSD > 0 ? totalMRRUSD / 1000 : 114.5]}
          icon={<TrendingUp size={16} />}
          onClick={() => onNavigate('subscriptions')}
        />

        <MetricCard
          label="Total Payments Collected"
          value={formatCurrency(totalPaymentsUSD, currency)}
          subValue={`${settledPaymentsCount} settled transactions`}
          changePercent={18.7}
          changeLabel="ledger aggregate"
          sparklineData={[860, 900, 940, 1000, 1080, 1150, 1260, 1374]}
          icon={<DollarSign size={16} />}
          onClick={() => onNavigate('payments')}
        />

        <MetricCard
          label="Outstanding Invoices"
          value={formatCurrency(outstandingTotalUSD, currency)}
          subValue={`${outstandingInvoices.length} invoices awaiting payment`}
          changePercent={-5.4}
          changeLabel="pending collection"
          isPositiveGood={false}
          sparklineData={[112, 113, 114, 115, 116.2, 117.1, 118.4]}
          icon={<CreditCard size={16} />}
          onClick={() => onNavigate('invoices')}
        />

        <MetricCard
          label="Overdue Invoices & At-Risk"
          value={formatCurrency(overdueTotalUSD, currency)}
          subValue={`${overdueInvoices.length} past-due (${pastDueSubs.length} accounts)`}
          changePercent={overdueInvoices.length > 0 ? 8.2 : -12.4}
          changeLabel="dunning queue"
          isPositiveGood={false}
          sparklineData={[1.4, 1.25, 1.15, 1.05, 0.94, 0.88, 0.82]}
          icon={<ShieldAlert size={16} />}
          onClick={() => onNavigate('dunning')}
        />
      </div>

      {/* Operational Telemetry Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[12px] pm-shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#0F172A]">
            <Clock size={15} className="text-[#3457D5]" />
            <span className="font-semibold">Upcoming Renewals (Next 14 Days):</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#3457D5] font-semibold">
              {upcomingRenewals.length} subscriptions scheduled
            </span>
          </div>
          <div className="text-[#CBD5E1] hidden md:block">|</div>
          <div className="flex items-center gap-1.5 text-[#0F172A]">
            <CheckCircle2 size={15} className="text-[#16A34A]" />
            <span className="font-semibold">Annual Run-Rate (ARR):</span>
            <span className="text-[#16A34A] font-semibold font-mono-numbers">
              {formatCurrency(totalARRUSD, currency)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('invoices')}
            className="text-[#3457D5] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Audit Invoices</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Primary Analytics Section: Revenue Trajectory & Interactive Chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
          <div>
            <div className="text-[15px] font-bold text-[#0F172A] font-display">
              Recurring Revenue Velocity & Cash Ingress
            </div>
            <div className="text-[12px] text-[#64748B]">
              Track compounding subscription growth, cash collection events, and subscriber momentum.
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Metric Mode Filter */}
            <div className="flex items-center p-1 bg-[#F1F5F9] rounded-[6px]">
              <button
                onClick={() => setChartMetric('mrr')}
                className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors ${
                  chartMetric === 'mrr'
                    ? 'bg-white text-[#3457D5] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                MRR Trajectory
              </button>
              <button
                onClick={() => setChartMetric('cash')}
                className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors ${
                  chartMetric === 'cash'
                    ? 'bg-white text-[#3457D5] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Cash Collected
              </button>
              <button
                onClick={() => setChartMetric('subscribers')}
                className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors ${
                  chartMetric === 'subscribers'
                    ? 'bg-white text-[#3457D5] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Active Subs
              </button>
            </div>

            {/* Range Toggle */}
            <div className="hidden sm:flex items-center gap-1 text-[12px] text-[#64748B] border-l border-[#E2E8F0] pl-3">
              <button
                onClick={() => setSelectedRange('6m')}
                className={`px-2 py-1 rounded ${
                  selectedRange === '6m' ? 'text-[#3457D5] font-semibold bg-[#EEF2FF]' : 'hover:text-[#0F172A]'
                }`}
              >
                6M
              </button>
              <button
                onClick={() => setSelectedRange('12m')}
                className={`px-2 py-1 rounded ${
                  selectedRange === '12m' ? 'text-[#3457D5] font-semibold bg-[#EEF2FF]' : 'hover:text-[#0F172A]'
                }`}
              >
                12M
              </button>
            </div>
          </div>
        </div>

        {/* Chart Visualizer */}
        <div className="pt-2">
          {/* Max values for scaling */}
          {(() => {
            const rawVals = trajectory.map((d) =>
              chartMetric === 'mrr' ? d.mrr : chartMetric === 'cash' ? d.cash : d.subs
            );
            const maxVal = Math.max(...rawVals);

            return (
              <div className="h-[220px] flex items-end gap-2 sm:gap-4 pt-4 px-2">
                {trajectory.map((point, index) => {
                  const val =
                    chartMetric === 'mrr'
                      ? point.mrr
                      : chartMetric === 'cash'
                      ? point.cash
                      : point.subs;
                  const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));

                  return (
                    <div
                      key={point.month}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-[#0F172A] text-white px-2.5 py-1.5 rounded text-[11px] font-mono-numbers pointer-events-none whitespace-nowrap shadow-md">
                        <span className="font-semibold">
                          {chartMetric === 'subscribers'
                            ? `${val} Accounts`
                            : formatCurrency(val, currency)}
                        </span>
                        <span className="text-[10px] text-slate-300">{point.month}</span>
                      </div>

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[42px] bg-[#EEF2FF] group-hover:bg-[#E0E7FF] rounded-t-[4px] overflow-hidden flex flex-col justify-end transition-all">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-[#3457D5] group-hover:bg-[#2A48B8] transition-all rounded-t-[4px]"
                        />
                      </div>

                      {/* Month label */}
                      <span className="text-[11px] font-medium text-[#64748B] group-hover:text-[#0F172A] mt-2 font-mono-numbers">
                        {point.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Two-Column Grid: Revenue Waterfall Bridge & Dunning Recovery Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waterfall Bridge */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <div className="text-[14px] font-bold text-[#0F172A] font-display">
                  October MRR Movement Bridge
                </div>
                <div className="text-[12px] text-[#64748B]">
                  Decomposition of net recurring revenue flux.
                </div>
              </div>
              <button
                onClick={() => onNavigate('cohorts')}
                className="text-[12px] font-medium text-[#3457D5] hover:underline flex items-center gap-1"
              >
                <span>Cohort View</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-[#64748B]">Starting MRR (Oct 1)</span>
                <span className="font-semibold text-[#0F172A] font-mono-numbers">
                  {formatCurrency(startingMRR, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded hover:bg-[#F8FAFC]">
                <span className="text-[#16A34A] flex items-center gap-1.5 font-medium">
                  <ArrowUpRight size={14} /> New Customer Onboarding
                </span>
                <span className="font-semibold text-[#16A34A] font-mono-numbers">
                  + {formatCurrency(newMRR, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded hover:bg-[#F8FAFC]">
                <span className="text-[#16A34A] flex items-center gap-1.5 font-medium">
                  <ArrowUpRight size={14} /> Tier & Seat Expansion
                </span>
                <span className="font-semibold text-[#16A34A] font-mono-numbers">
                  + {formatCurrency(expansionMRR, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded hover:bg-[#F8FAFC]">
                <span className="text-[#D97706] flex items-center gap-1.5 font-medium">
                  <ArrowDownRight size={14} /> Contraction / Plan Downgrades
                </span>
                <span className="font-semibold text-[#D97706] font-mono-numbers">
                  - {formatCurrency(Math.abs(contractionMRR), currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded hover:bg-[#F8FAFC]">
                <span className="text-[#DC2626] flex items-center gap-1.5 font-medium">
                  <ArrowDownRight size={14} /> Customer Churn & Sunsets
                </span>
                <span className="font-semibold text-[#DC2626] font-mono-numbers">
                  - {formatCurrency(Math.abs(churnedMRR), currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-baseline justify-between">
            <span className="text-[13px] font-bold text-[#0F172A]">Ending Active MRR</span>
            <span className="text-[18px] font-bold text-[#3457D5] font-mono-numbers">
              {formatCurrency(netEndingMRR, currency)}
            </span>
          </div>
        </div>

        {/* Smart Dunning & Payment Recovery Health */}
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div>
                <div className="text-[14px] font-bold text-[#0F172A] font-display">
                  Autonomous Dunning Recovery Health
                </div>
                <div className="text-[12px] text-[#64748B]">
                  Failed payment salvage & card account updater efficiency.
                </div>
              </div>
              <button
                onClick={() => onNavigate('dunning')}
                className="text-[12px] font-medium text-[#3457D5] hover:underline flex items-center gap-1"
              >
                <span>Dunning Rules</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[6px] bg-[#ECFDF5] border border-[#BBF7D0]">
                <div className="text-[11px] font-semibold text-[#16A34A] uppercase tracking-wider">
                  Cash Salvaged (30d)
                </div>
                <div className="text-[20px] font-bold text-[#16A34A] font-mono-numbers mt-1">
                  {formatCurrency(5772, currency)}
                </div>
                <div className="text-[11px] text-[#16A34A]/80 font-medium mt-0.5">
                  14 past-due invoices recovered
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#EEF2FF] border border-[#C7D2FE]">
                <div className="text-[11px] font-semibold text-[#3457D5] uppercase tracking-wider">
                  Updater Hit Rate
                </div>
                <div className="text-[20px] font-bold text-[#3457D5] font-mono-numbers mt-1">
                  89.4%
                </div>
                <div className="text-[11px] text-[#3457D5]/80 font-medium mt-0.5">
                  Visa & Mastercard VAU rail
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#64748B]">Active Triaged Accounts</span>
                <span className="font-semibold text-[#0F172A] font-mono-numbers">
                  {pastDueSubs.length} Accounts
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#64748B]">Gross Collection Efficiency</span>
                <span className="font-semibold text-[#16A34A] font-mono-numbers">98.92%</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[#64748B]">Avg Recovery Lag Time</span>
                <span className="font-semibold text-[#0F172A] font-mono-numbers">18.4 Hours</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-[12px] text-[#64748B]">
              Autonomous routing actively guarding revenue
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#16A34A] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* High-Density Ledger Table: Recent Invoices & Subscriptions */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
        {/* Table Header Controls */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-bold text-[#0F172A] font-display">
              Real-Time Billing Stream & Subscriptions
            </div>
            <div className="text-[12px] text-[#64748B]">
              Latest ledger statements and recurring billing cycles.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('invoices')}
              className="text-[12px] font-medium text-[#3457D5] hover:underline"
            >
              View All Invoices ({invoices.length}) →
            </button>
          </div>
        </div>

        {/* Data Table (40px header, 52px body rows, hairline dividers) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-[40px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] tracking-[0.05em] uppercase font-body">
                <th className="px-5">Invoice #</th>
                <th className="px-4">Customer & Account</th>
                <th className="px-4">Issued / Due</th>
                <th className="px-4">Payment Method</th>
                <th className="px-4 text-right">Sum</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
              {invoices.slice(0, 6).map((inv) => {
                const sub = subscriptions.find((s) => s.customerId === inv.customerId);

                return (
                  <tr
                    key={inv.id}
                    onClick={() => sub && onSelectSubscription(sub)}
                    className="h-[52px] hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                  >
                    <td className="px-5 font-mono-numbers font-medium text-[#0F172A]">
                      {inv.invoiceNumber}
                    </td>

                    <td className="px-4">
                      <div className="font-semibold text-[#0F172A] group-hover:text-[#3457D5] transition-colors">
                        {inv.company}
                      </div>
                      <div className="text-[11px] text-[#64748B]">{inv.customerName}</div>
                    </td>

                    <td className="px-4 text-[12px] text-[#64748B] font-mono-numbers">
                      <div>{formatDate(inv.issueDate)}</div>
                      <div className="text-[10px] text-[#94A3B8]">Due: {formatDate(inv.dueDate)}</div>
                    </td>

                    <td className="px-4 text-[12px] text-[#475569] font-mono-numbers">
                      {inv.paymentMethodSummary}
                    </td>

                    <td className="px-4 text-right font-bold text-[#0F172A] font-mono-numbers">
                      {formatCurrency(inv.amountUSD, currency)}
                    </td>

                    <td className="px-4 text-center">
                      {inv.status === 'settled' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]">
                          <CheckCircle2 size={11} />
                          <span>Settled</span>
                        </span>
                      )}
                      {inv.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                          <Clock size={11} />
                          <span>Pending</span>
                        </span>
                      )}
                      {inv.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                          <AlertTriangle size={11} />
                          <span>Overdue</span>
                        </span>
                      )}
                      {inv.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sub) onSelectSubscription(sub);
                        }}
                        className="px-2.5 py-1 text-[12px] font-medium text-[#3457D5] hover:bg-[#EEF2FF] rounded-[4px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
