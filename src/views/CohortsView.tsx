import React, { useState } from 'react';
import { Database, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { INITIAL_COHORTS } from '../data/mockData';
import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CohortsViewProps {
  currency: CurrencyCode;
}

export const CohortsView: React.FC<CohortsViewProps> = ({ currency }) => {
  const [metricType, setMetricType] = useState<'revenue' | 'subscribers'>('revenue');

  const getHeatmapColor = (val: number | null) => {
    if (val === null) return 'bg-[#F8FAFC] text-[#CBD5E1]';
    if (val >= 105) return 'bg-[#DCFCE7] text-[#15803D] font-bold'; // >105% net negative churn / massive expansion
    if (val >= 100) return 'bg-[#ECFDF5] text-[#16A34A] font-semibold'; // 100-104%
    if (val >= 96) return 'bg-[#EEF2FF] text-[#3457D5] font-semibold'; // 96-99%
    if (val >= 92) return 'bg-[#F1F5F9] text-[#475569] font-medium'; // 92-95%
    if (val >= 88) return 'bg-[#FFFBEB] text-[#D97706] font-medium'; // 88-91%
    return 'bg-[#FEF2F2] text-[#DC2626] font-medium'; // <88%
  };

  return (
    <div className="space-y-6">
      {/* Title & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Cohort Retention & NRR Matrix
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Vintage month cohort retention heatmaps showing customer lifetime value and expansion.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-[6px]">
          <button
            onClick={() => setMetricType('revenue')}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${
              metricType === 'revenue'
                ? 'bg-white text-[#3457D5] font-semibold shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Net Revenue Retention (NRR)
          </button>
          <button
            onClick={() => setMetricType('subscribers')}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors ${
              metricType === 'subscribers'
                ? 'bg-white text-[#3457D5] font-semibold shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Logo / Account Retention
          </button>
        </div>
      </div>

      {/* Cohort Heatmap Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
          <div>
            <div className="text-[15px] font-bold text-[#0F172A] font-display">
              12-Month Vintage Retention Matrix
            </div>
            <div className="text-[12px] text-[#64748B]">
              Values &gt; 100% indicate net negative churn (seat and usage expansion outweighing downgrades).
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#DCFCE7] border border-[#BBF7D0]" />
              &gt;105% Expansion
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#ECFDF5] border border-[#BBF7D0]" />
              100–104%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#EEF2FF] border border-[#C7D2FE]" />
              96–99%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#FEF2F2] border border-[#FECACA]" />
              &lt;88%
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="h-[38px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase font-body">
                <th className="px-3 py-2 sticky left-0 bg-[#F8FAFC] z-10">Cohort</th>
                <th className="px-3 py-2 text-right">Accounts</th>
                <th className="px-3 py-2 text-right">Starting MRR</th>
                <th className="px-2 py-2 text-center">M0</th>
                <th className="px-2 py-2 text-center">M1</th>
                <th className="px-2 py-2 text-center">M2</th>
                <th className="px-2 py-2 text-center">M3</th>
                <th className="px-2 py-2 text-center">M4</th>
                <th className="px-2 py-2 text-center">M5</th>
                <th className="px-2 py-2 text-center">M6</th>
                <th className="px-2 py-2 text-center">M7</th>
                <th className="px-2 py-2 text-center">M8</th>
                <th className="px-2 py-2 text-center">M9</th>
                <th className="px-2 py-2 text-center">M10</th>
                <th className="px-2 py-2 text-center">M11</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {INITIAL_COHORTS.map((c) => {
                return (
                  <tr key={c.vintage} className="h-[44px] hover:bg-[#F8FAFC]/50">
                    <td className="px-3 font-semibold text-[#0F172A] sticky left-0 bg-white z-10 whitespace-nowrap">
                      {c.vintage}
                    </td>
                    <td className="px-3 text-right font-mono-numbers text-[#64748B]">
                      {c.subscribersCount}
                    </td>
                    <td className="px-3 text-right font-mono-numbers font-semibold text-[#0F172A]">
                      {formatCurrency(c.mrrUSD, currency, { hideDecimals: true })}
                    </td>

                    {c.retentionMonths.map((rate, mIdx) => {
                      return (
                        <td key={mIdx} className="px-1.5 py-1 text-center font-mono-numbers">
                          <div
                            className={`py-1.5 px-2 rounded-[4px] text-[11px] transition-colors ${getHeatmapColor(
                              rate
                            )}`}
                          >
                            {rate !== null ? `${rate.toFixed(1)}%` : '—'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Insights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#E2E8F0] rounded-[8px] pm-shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-[#16A34A] uppercase tracking-wider">
            Net Negative Churn Velocity
          </div>
          <div className="text-[14px] font-bold text-[#0F172A]">
            Expansion surpasses logo attrition by Month 4
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            Customer cohorts cross the 100% threshold around Month 4 as engineering teams expand developer seats and API compute tiers.
          </p>
        </div>

        <div className="p-4 bg-white border border-[#E2E8F0] rounded-[8px] pm-shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-[#3457D5] uppercase tracking-wider">
            Average Customer Lifetime
          </div>
          <div className="text-[14px] font-bold text-[#0F172A] font-mono-numbers">
            41.2 Months
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            B2B infrastructure stickiness and multi-region tokenization yield minimal voluntary cancellations.
          </p>
        </div>

        <div className="p-4 bg-white border border-[#E2E8F0] rounded-[8px] pm-shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">
            Payback Period
          </div>
          <div className="text-[14px] font-bold text-[#0F172A] font-mono-numbers">
            4.8 Months (CAC Recovered)
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            High organic inbound velocity and low sales friction maintain top-quartile RevOps capital efficiency.
          </p>
        </div>
      </div>
    </div>
  );
};
