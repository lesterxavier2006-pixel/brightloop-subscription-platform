import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  changePercent: number;
  changeLabel?: string;
  isPositiveGood?: boolean;
  sparklineData: number[];
  icon?: React.ReactNode;
  infoTooltip?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  changePercent,
  changeLabel = 'vs prev month',
  isPositiveGood = true,
  sparklineData,
  icon,
  onClick,
}) => {
  const isPositive = changePercent >= 0;
  const isFavorable = isPositiveGood ? isPositive : !isPositive;

  // Generate SVG Sparkline coordinates
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const height = 36;
  const width = 110;
  const step = width / (sparklineData.length - 1);

  const points = sparklineData.map((d, i) => {
    const x = i * step;
    const y = height - ((d - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const strokeColor = isFavorable ? '#16A34A' : '#DC2626';
  const gradientId = `sparkline-grad-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      onClick={onClick}
      className={`bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[8px] p-5 pm-shadow-sm transition-all duration-150 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:pm-shadow-md' : ''
      }`}
    >
      {/* Top Section: 13px label (#64748B) paired with mini action icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-[#64748B] tracking-[-0.005em]">
          {label}
        </span>
        {icon && <div className="text-[#64748B]">{icon}</div>}
      </div>

      {/* Mid Section: Large KPI Metric formatted in metric-xl (#0F172A) */}
      <div className="my-1">
        <div className="text-[28px] lg:text-[32px] font-bold text-[#0F172A] tracking-[-0.03em] leading-tight font-display font-mono-numbers">
          {value}
        </div>
        {subValue && (
          <div className="text-[12px] text-[#64748B] font-mono-numbers mt-0.5">
            {subValue}
          </div>
        )}
      </div>

      {/* Bottom Section: Positive / Negative Delta Tag paired with 48px inline vector sparkline */}
      <div className="flex items-end justify-between mt-3 pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full font-mono-numbers ${
              isFavorable
                ? 'bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]'
                : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
            }`}
          >
            {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{isPositive ? `+${changePercent}%` : `${changePercent}%`}</span>
          </span>
          <span className="text-[11px] text-[#64748B] hidden sm:inline">{changeLabel}</span>
        </div>

        {/* Inline Vector Sparkline */}
        <div className="w-[100px] h-[36px] shrink-0">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#${gradientId})`} />
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
