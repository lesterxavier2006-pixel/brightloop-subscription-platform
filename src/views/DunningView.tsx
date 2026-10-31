import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  ShieldCheck,
  Send,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DunningStep, Invoice, Subscription, CurrencyCode } from '../types';
import { INITIAL_DUNNING_STEPS } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';

interface DunningViewProps {
  invoices: Invoice[];
  subscriptions: Subscription[];
  currency: CurrencyCode;
  onRecoverInvoice: (invoiceId: string) => void;
}

export const DunningView: React.FC<DunningViewProps> = ({
  invoices,
  subscriptions,
  currency,
  onRecoverInvoice,
}) => {
  const [dunningSteps, setDunningSteps] = useState<DunningStep[]>(INITIAL_DUNNING_STEPS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Filter at-risk invoices
  const atRiskInvoices = invoices.filter(
    (inv) => inv.status === 'overdue' || inv.status === 'failed'
  );

  const totalAtRiskUSD = atRiskInvoices.reduce((acc, inv) => acc + inv.amountUSD, 0);

  // Run automated smart retry simulation
  const handleRunSimulation = () => {
    if (atRiskInvoices.length === 0) {
      setSimulationResult('No overdue invoices currently queued for retry.');
      return;
    }

    setIsSimulating(true);
    setSimulationResult(null);

    const target = atRiskInvoices[0];

    setTimeout(() => {
      onRecoverInvoice(target.id);
      setIsSimulating(false);
      setSimulationResult(
        `Smart Recovery Executed: ${target.company} (${target.invoiceNumber}) charge of ${formatCurrency(
          target.amountUSD,
          currency
        )} successfully authorized via Alternate Network Token routing!`
      );
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Smart Dunning & Payment Recovery Engine
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Autonomous multi-tier decline mitigation, network token routing, and involuntary churn defense.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="h-8 px-3 text-[12px] font-semibold text-white bg-[#3457D5] hover:bg-[#2A48B8] rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60 pm-focus-glow"
        >
          <Zap size={14} className={isSimulating ? 'animate-bounce' : ''} />
          <span>{isSimulating ? 'Executing Smart Rail...' : 'Simulate Automated Retry'}</span>
        </button>
      </div>

      {/* Simulation Result Alert */}
      {simulationResult && (
        <div className="p-3.5 bg-[#ECFDF5] border border-[#BBF7D0] rounded-[8px] text-[#16A34A] text-[13px] font-medium flex items-center gap-2.5 pm-shadow-sm">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{simulationResult}</span>
        </div>
      )}

      {/* High-Level Recovery Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#64748B]">
            Autonomous Recovery Efficiency
          </span>
          <div className="text-[24px] font-bold text-[#16A34A] font-display font-mono-numbers mt-1">
            97.5%
          </div>
          <div className="text-[11px] text-[#16A34A] mt-0.5 font-medium">
            216 of 222 failed card events salvaged
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#64748B]">Revenue At Risk (Active)</span>
          <div className="text-[24px] font-bold text-[#DC2626] font-display font-mono-numbers mt-1">
            {formatCurrency(totalAtRiskUSD, currency)}
          </div>
          <div className="text-[11px] text-[#DC2626] mt-0.5 font-medium">
            {atRiskInvoices.length} invoices undergoing retry cycles
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#64748B]">
            Card Account Updater (VAU)
          </span>
          <div className="text-[24px] font-bold text-[#3457D5] font-display font-mono-numbers mt-1">
            Active · Real-time
          </div>
          <div className="text-[11px] text-[#3457D5] mt-0.5 font-medium">
            Card expiration re-sync with issuing banks
          </div>
        </div>
      </div>

      {/* Visual 4-Step Recovery Pipeline */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm space-y-4">
        <div>
          <div className="text-[15px] font-bold text-[#0F172A] font-display">
            Active Multi-Tier Recovery Sequence
          </div>
          <div className="text-[12px] text-[#64748B]">
            Automated escalation schedule configured to maximize recovery while minimizing customer disruption.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {dunningSteps.map((step) => {
            return (
              <div
                key={step.step}
                className="p-4 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#3457D5]/60" />

                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
                    <span>STAGE 0{step.step}</span>
                    <span className="font-mono text-[#3457D5]">{step.timing}</span>
                  </div>

                  <div className="text-[14px] font-bold text-[#0F172A] mt-1.5 font-display">
                    {step.title}
                  </div>

                  <div className="text-[11px] text-[#475569] mt-2 leading-relaxed">
                    {step.action}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] flex items-baseline justify-between text-[11px]">
                  <span className="text-[#64748B]">Recovery Rate:</span>
                  <span className="font-bold text-[#16A34A] font-mono-numbers">
                    {step.recoveryRatePercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Currently Queued at-Risk Invoices */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-[#0F172A] font-display">
              Queued Accounts Under Recovery ({atRiskInvoices.length})
            </div>
            <div className="text-[12px] text-[#64748B]">
              Real-time audit log of declined recurring charges and pending retry actions.
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="h-[40px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase font-body">
                <th className="px-5">Invoice #</th>
                <th className="px-4">Customer Account</th>
                <th className="px-4">Decline Diagnostic</th>
                <th className="px-4">Payment Method</th>
                <th className="px-4 text-right">Sum</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-5 text-right">Manual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {atRiskInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    <div className="text-[14px] font-medium text-[#16A34A] flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} />
                      <span>Zero accounts currently past-due</span>
                    </div>
                    <div className="text-[12px] text-[#94A3B8] mt-1">
                      All subscription billing runs successfully settled.
                    </div>
                  </td>
                </tr>
              ) : (
                atRiskInvoices.map((inv) => (
                  <tr key={inv.id} className="h-[52px] hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 font-mono-numbers font-medium text-[#0F172A]">
                      {inv.invoiceNumber}
                    </td>

                    <td className="px-4">
                      <div className="font-semibold text-[#0F172A]">{inv.company}</div>
                      <div className="text-[11px] text-[#64748B]">{inv.customerEmail}</div>
                    </td>

                    <td className="px-4 text-[12px] text-[#DC2626]">
                      {inv.memo || 'Soft card decline code returned.'}
                    </td>

                    <td className="px-4 font-mono-numbers text-[12px] text-[#475569]">
                      {inv.paymentMethodSummary}
                    </td>

                    <td className="px-4 text-right font-bold text-[#0F172A] font-mono-numbers">
                      {formatCurrency(inv.amountUSD, currency)}
                    </td>

                    <td className="px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                        <AlertTriangle size={11} />
                        <span>{inv.status}</span>
                      </span>
                    </td>

                    <td className="px-5 text-right">
                      <button
                        onClick={() => {
                          onRecoverInvoice(inv.id);
                          setSimulationResult(
                            `Payment successfully salvaged for ${inv.company}! Invoice marked settled.`
                          );
                        }}
                        className="px-2.5 py-1 text-[12px] font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-[4px] transition-colors shadow-2xs"
                      >
                        Force Authorize
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
