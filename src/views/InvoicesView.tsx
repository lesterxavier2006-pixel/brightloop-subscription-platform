import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Mail,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Invoice, CurrencyCode, Subscription } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface InvoicesViewProps {
  invoices: Invoice[];
  subscriptions: Subscription[];
  currency: CurrencyCode;
  onSelectInvoice: (inv: Invoice) => void;
  onQuickAction: (action: 'new_inv') => void;
  onUpdateInvoiceStatus: (invId: string, newStatus: Invoice['status']) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  subscriptions,
  currency,
  onSelectInvoice,
  onQuickAction,
  onUpdateInvoiceStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter invoices
  const filtered = invoices.filter((inv) => {
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.company.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerEmail.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  // Calculate summary metrics
  const totalInvoicedUSD = invoices.reduce((acc, i) => acc + i.amountUSD, 0);
  const settledUSD = invoices
    .filter((i) => i.status === 'settled')
    .reduce((acc, i) => acc + i.amountUSD, 0);
  const pendingUSD = invoices
    .filter((i) => i.status === 'pending')
    .reduce((acc, i) => acc + i.amountUSD, 0);
  const overdueUSD = invoices
    .filter((i) => i.status === 'overdue' || i.status === 'failed')
    .reduce((acc, i) => acc + i.amountUSD, 0);

  const handleExportCSV = () => {
    exportToCSV('invoices-ledger', filtered, [
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'company', label: 'Company' },
      { key: 'customerName', label: 'Contact' },
      { key: 'status', label: 'Status' },
      { key: 'amountUSD', label: 'Total', format: (val) => formatCurrency(val, currency) },
      { key: 'subtotalUSD', label: 'Subtotal', format: (val) => formatCurrency(val, currency) },
      { key: 'taxAmountUSD', label: 'Tax', format: (val) => formatCurrency(val, currency) },
      { key: 'issueDate', label: 'Issue Date' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'paymentMethodSummary', label: 'Payment Method' },
    ]);
  };

  const handleSendReminder = (inv: Invoice) => {
    setActionNotice(`Payment reminder dispatched to ${inv.customerEmail}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePrintReceipt = (inv: Invoice) => {
    // Generate a clean printable receipt in a new tab or trigger window print
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>${inv.invoiceNumber} — Precision Metric Statement</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0F172A; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; }
              .num { font-size: 24px; font-weight: bold; }
              .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
              .table th { background: #F8FAFC; text-align: left; padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
              .table td { padding: 12px 10px; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
              .totals { margin-top: 30px; margin-left: auto; width: 300px; text-align: right; }
              .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
              .grand-total { font-size: 18px; font-weight: bold; border-top: 1px solid #E2E8F0; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="num">Precision Metric</div>
                <div>Billing & RevOps Infrastructure</div>
              </div>
              <div style="text-align: right;">
                <div class="num">${inv.invoiceNumber}</div>
                <div>Issued: ${formatDate(inv.issueDate)}</div>
                <div>Status: ${inv.status.toUpperCase()}</div>
              </div>
            </div>
            <div style="margin-top: 25px;">
              <strong>Billed To:</strong><br />
              ${inv.company}<br />
              Attn: ${inv.customerName}<br />
              ${inv.customerEmail}
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.lineItems
                  .map(
                    (li) => `
                  <tr>
                    <td>${li.description}</td>
                    <td>${li.quantity}</td>
                    <td>${formatCurrency(li.unitPriceUSD || 0, currency)}</td>
                    <td>${formatCurrency(li.totalUSD ?? li.totalPriceUSD ?? (li.quantity * li.unitPriceUSD), currency)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            <div class="totals">
              <div class="total-row"><span>Subtotal:</span><span>${formatCurrency(inv.subtotalUSD || inv.amountUSD, currency)}</span></div>
              <div class="total-row"><span>Tax (${inv.taxRatePercent || 0}%):</span><span>${formatCurrency(inv.taxAmountUSD || 0, currency)}</span></div>
              <div class="total-row grand-total"><span>Total:</span><span>${formatCurrency(inv.amountUSD, currency)}</span></div>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Invoices & Commercial Billing
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Accounts receivable ledger, itemized tax invoices, and dunning collection rails.
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
            onClick={() => onQuickAction('new_inv')}
            className="h-8 px-3 text-[12px] font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* Action Notice Toast */}
      {actionNotice && (
        <div className="p-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-[6px] text-[#16A34A] text-[13px] font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#64748B]">Total Invoiced (YTD)</span>
          <div className="text-[22px] font-bold text-[#0F172A] font-display font-mono-numbers mt-1">
            {formatCurrency(totalInvoicedUSD, currency)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-0.5">{invoices.length} invoices emitted</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#16A34A]">Settled Collections</span>
          <div className="text-[22px] font-bold text-[#16A34A] font-display font-mono-numbers mt-1">
            {formatCurrency(settledUSD, currency)}
          </div>
          <div className="text-[11px] text-[#16A34A]/80 mt-0.5">
            {Math.round((settledUSD / (totalInvoicedUSD || 1)) * 100)}% collection rate
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#D97706]">Pending Due</span>
          <div className="text-[22px] font-bold text-[#D97706] font-display font-mono-numbers mt-1">
            {formatCurrency(pendingUSD, currency)}
          </div>
          <div className="text-[11px] text-[#D97706]/80 mt-0.5">Within standard payment terms</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#DC2626]">Overdue / Failed</span>
          <div className="text-[22px] font-bold text-[#DC2626] font-display font-mono-numbers mt-1">
            {formatCurrency(overdueUSD, currency)}
          </div>
          <div className="text-[11px] text-[#DC2626]/80 mt-0.5">Dunning smart retry active</div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-[6px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Invoices' },
              { id: 'settled', label: 'Settled' },
              { id: 'pending', label: 'Pending' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'failed', label: 'Failed' },
            ].map((tab) => {
              const isSelected = filterStatus === tab.id;
              const count =
                tab.id === 'all'
                  ? invoices.length
                  : invoices.filter((i) => i.status === tab.id).length;

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
            placeholder="Search by invoice number (e.g. INV-2026-0891), customer name, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3457D5] rounded-[6px] text-[#0F172A] placeholder-[#94A3B8] outline-none pm-focus-glow"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-[40px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] tracking-[0.05em] uppercase font-body">
                <th className="px-5">Invoice #</th>
                <th className="px-4">Entity & Billed Party</th>
                <th className="px-4">Issued</th>
                <th className="px-4">Due Date</th>
                <th className="px-4">Payment Rail</th>
                <th className="px-4 text-right">Sum</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    <div className="text-[14px] font-medium">No invoices match your query</div>
                    <div className="text-[12px] text-[#94A3B8] mt-1">
                      Check filters or issue a new commercial statement.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  return (
                    <tr
                      key={inv.id}
                      className="h-[52px] hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <td className="px-5 font-mono-numbers font-medium text-[#0F172A]">
                        {inv.invoiceNumber}
                      </td>

                      <td className="px-4">
                        <div className="font-semibold text-[#0F172A]">{inv.company}</div>
                        <div className="text-[11px] text-[#64748B]">{inv.customerName}</div>
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#64748B]">
                        {formatDate(inv.issueDate)}
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#64748B]">
                        {formatDate(inv.dueDate)}
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#475569]">
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
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status !== 'settled' && (
                            <button
                              onClick={() => {
                                onUpdateInvoiceStatus(inv.id, 'settled');
                                setActionNotice(`Invoice ${inv.invoiceNumber} marked as settled.`);
                                setTimeout(() => setActionNotice(null), 3000);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-[#16A34A] bg-[#ECFDF5] hover:bg-[#D1FAE5] rounded border border-[#BBF7D0] transition-colors"
                              title="Mark Settled"
                            >
                              Settle
                            </button>
                          )}

                          <button
                            onClick={() => handleSendReminder(inv)}
                            className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded transition-colors"
                            title="Email Reminder"
                          >
                            <Mail size={14} />
                          </button>

                          <button
                            onClick={() => handlePrintReceipt(inv)}
                            className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded transition-colors"
                            title="Print / PDF Statement"
                          >
                            <Printer size={14} />
                          </button>
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
    </div>
  );
};
