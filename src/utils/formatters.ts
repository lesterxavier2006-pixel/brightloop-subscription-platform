import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateAgainstUSD: 83.5, // 1 USD = 83.5 INR
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateAgainstUSD: 1.0,
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateAgainstUSD: 0.92,
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateAgainstUSD: 0.79,
    locale: 'en-GB',
  },
};

/**
 * Formats currency enforcing strict baseline alignment without whitespace between symbol and number,
 * respecting Indian numbering (Lakhs/Crores) when INR is chosen, e.g. ₹12,48,200.00.
 */
export function formatCurrency(
  amountUSD: number,
  currencyCode: CurrencyCode = 'INR',
  options: { compact?: boolean; hideDecimals?: boolean } = {}
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const convertedAmount = amountUSD * config.rateAgainstUSD;

  if (options.compact) {
    if (currencyCode === 'INR') {
      if (Math.abs(convertedAmount) >= 10000000) {
        return `${config.symbol}${(convertedAmount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(convertedAmount) >= 100000) {
        return `${config.symbol}${(convertedAmount / 100000).toFixed(2)} L`;
      }
      if (Math.abs(convertedAmount) >= 1000) {
        return `${config.symbol}${(convertedAmount / 1000).toFixed(1)}k`;
      }
    } else {
      if (Math.abs(convertedAmount) >= 1000000) {
        return `${config.symbol}${(convertedAmount / 1000000).toFixed(2)}M`;
      }
      if (Math.abs(convertedAmount) >= 1000) {
        return `${config.symbol}${(convertedAmount / 1000).toFixed(1)}k`;
      }
    }
  }

  const fractionDigits = options.hideDecimals ? 0 : 2;

  // Format numerical string according to country locale
  const formattedNumber = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    useGrouping: true,
  }).format(convertedAmount);

  // Return directly adjacent symbol without spaces: e.g. ₹12,48,200.00 or $12,450.00
  return `${config.symbol}${formattedNumber}`;
}

export function formatPercent(value: number, signed: boolean = true): string {
  const prefix = signed && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Real CSV exporter that downloads data immediately in browser
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columnHeaders: { key: keyof T; label: string; format?: (val: any) => string }[]
): void {
  if (!rows || rows.length === 0) return;

  const headerRow = columnHeaders.map((col) => `"${col.label}"`).join(',');
  const dataRows = rows.map((row) =>
    columnHeaders
      .map((col) => {
        const val = row[col.key];
        const formatted = col.format ? col.format(val) : String(val ?? '');
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
