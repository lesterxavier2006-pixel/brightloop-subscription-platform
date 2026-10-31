import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  X,
  FileText,
} from 'lucide-react';
import { Payment, Invoice, Customer, CurrencyCode, UserRole } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface PaymentsViewProps {
  payments: Payment[];
  invoices: Invoice[];
  customers: Customer[];
  currency: CurrencyCode;
  role: UserRole;
  onCreatePayment: (payment: Omit<Payment, 'id' | 'paymentNumber' | 'settledAt' | 'createdAt'>) => Promise<void>;
  onRefundPayment: (id: string) => Promise<void>;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  invoices,
  customers,
  currency,
  role,
  onCreatePayment,
  onRefundPayment,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // New payment form
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || '');
  const [paymentRail, setPaymentRail] = useState('Stripe Card Rail');
  const [transactionRef, setTransactionRef] = useState(`txn_${Date.now().toString().slice(-6)}`);

  const filtered = payments.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.paymentNumber.toLowerCase().includes(term) ||
      p.company.toLowerCase().includes(term) ||
      p.customerName.toLowerCase().includes(term) ||
      p.transactionRef.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const totalCollectedUSD = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, p) => acc + p.amountUSD, 0);

  const totalRefundedUSD = payments
    .filter((p) => p.status === 'refunded')
    .reduce((acc, p) => acc + p.amountUSD, 0);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];

    await onCreatePayment({
      invoiceId: inv.id,
      customerId: inv.customerId,
      customerName: inv.customerName,
      company: inv.company,
      customerEmail: inv.customerEmail,
      amountUSD: inv.amountUSD,
      currency: 'USD',
      status: 'succeeded',
      paymentRail,
      transactionRef: transactionRef || `txn_${Date.now()}`,
    });

    setIsRecordModalOpen(false);
    setNotice('Payment successfully recorded and attributed to invoice!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRefund = async (paymentId: string) => {
    if (confirm('Authorize refund for this payment transaction?')) {
      await onRefundPayment(paymentId);
      setNotice('Payment transaction updated to Refunded.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleExportCSV = () => {
    exportToCSV('payments-ledger', filtered, [
      { key: 'paymentNumber', label: 'Payment #' },
      { key: 'company', label: 'Company' },
      { key: 'customerName', label: 'Contact' },
      { key: 'amountUSD', label: 'Amount', format: (v) => formatCurrency(v, currency) },
      { key: 'status', label: 'Status' },
      { key: 'paymentRail', label: 'Payment Rail' },
      { key: 'transactionRef', label: 'Txn Ref' },
      { key: 'settledAt', label: 'Settled At' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Payments & Collections Ledger
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Audit trail of settled gateway transactions, merchant card rail receipts, and refunds.
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
              onClick={() => setIsRecordModalOpen(true)}
              className="h-8 px-3 text-[12px] font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-[6px] text-[#16A34A] text-[13px] font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#16A34A]">Total Collections Settled</span>
          <div className="text-[24px] font-bold text-[#16A34A] font-display font-mono-numbers mt-1">
            {formatCurrency(totalCollectedUSD, currency)}
          </div>
          <div className="text-[11px] text-[#16A34A]/80 mt-0.5">
            {payments.filter((p) => p.status === 'succeeded').length} successful gateway capture events
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#DC2626]">Refunds & Chargebacks</span>
          <div className="text-[24px] font-bold text-[#DC2626] font-display font-mono-numbers mt-1">
            {formatCurrency(totalRefundedUSD, currency)}
          </div>
          <div className="text-[11px] text-[#DC2626]/80 mt-0.5">
            {payments.filter((p) => p.status === 'refunded').length} refunded items
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
          <span className="text-[12px] font-medium text-[#3457D5]">Success Authorization Ratio</span>
          <div className="text-[24px] font-bold text-[#3457D5] font-display font-mono-numbers mt-1">
            98.6%
          </div>
          <div className="text-[11px] text-[#3457D5]/80 mt-0.5">VAU Network Token routing active</div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-[6px] overflow-x-auto">
            {[
              { id: 'all', label: 'All Payments' },
              { id: 'succeeded', label: 'Succeeded' },
              { id: 'pending', label: 'Pending Settlement' },
              { id: 'failed', label: 'Declined' },
              { id: 'refunded', label: 'Refunded' },
            ].map((tab) => {
              const isSelected = filterStatus === tab.id;
              const count =
                tab.id === 'all'
                  ? payments.length
                  : payments.filter((p) => p.status === tab.id).length;

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
            placeholder="Search payments by payment #, company, customer or transaction ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3457D5] rounded-[6px] text-[#0F172A] placeholder-[#94A3B8] outline-none pm-focus-glow"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="h-[40px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase font-body">
                <th className="px-5">Payment #</th>
                <th className="px-4">Customer Account</th>
                <th className="px-4">Payment Rail</th>
                <th className="px-4">Transaction Ref</th>
                <th className="px-4 text-right">Settled Amount</th>
                <th className="px-4 text-center">Status</th>
                <th className="px-4">Settled At</th>
                <th className="px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    <div className="text-[14px] font-medium">No payment transactions found</div>
                    <div className="text-[12px] text-[#94A3B8] mt-1">
                      Check filters or record a new transaction.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => {
                  return (
                    <tr key={pay.id} className="h-[52px] hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 font-mono-numbers font-medium text-[#0F172A]">
                        {pay.paymentNumber}
                      </td>

                      <td className="px-4">
                        <div className="font-semibold text-[#0F172A]">{pay.company}</div>
                        <div className="text-[11px] text-[#64748B]">{pay.customerName}</div>
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#475569]">
                        {pay.paymentRail}
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#64748B]">
                        {pay.transactionRef}
                      </td>

                      <td className="px-4 text-right font-bold text-[#0F172A] font-mono-numbers">
                        {formatCurrency(pay.amountUSD, currency)}
                      </td>

                      <td className="px-4 text-center">
                        {pay.status === 'succeeded' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]">
                            <CheckCircle2 size={11} />
                            <span>Succeeded</span>
                          </span>
                        )}
                        {pay.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
                            <Clock size={11} />
                            <span>Pending</span>
                          </span>
                        )}
                        {pay.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                            <AlertTriangle size={11} />
                            <span>Failed</span>
                          </span>
                        )}
                        {pay.status === 'refunded' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                            <span>Refunded</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 font-mono-numbers text-[12px] text-[#64748B]">
                        {formatDate(pay.settledAt)}
                      </td>

                      <td className="px-5 text-right">
                        {role === 'admin' && pay.status === 'succeeded' && (
                          <button
                            onClick={() => handleRefund(pay.id)}
                            className="px-2 py-1 text-[11px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] rounded border border-[#FECACA] transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs">
          <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-[12px] pm-shadow-modal p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-[15px] font-bold text-[#0F172A] font-display">
                Record Inbound Payment
              </span>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Associate Invoice
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.company} ({formatCurrency(inv.amountUSD, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Payment Gateway / Settlement Rail
                </label>
                <select
                  value={paymentRail}
                  onChange={(e) => setPaymentRail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                >
                  <option value="Stripe Card Rail">Stripe Card Rail (Visa / Mastercard)</option>
                  <option value="Direct ACH / Wire Transfer">Direct ACH / Wire Transfer</option>
                  <option value="UPI Autopay Mandate">UPI Autopay Mandate</option>
                  <option value="SEPA Direct Debit">SEPA Direct Debit</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Gateway Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="txn_stripe_9941a8"
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-1.5 text-[12px] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#16A34A] text-white text-[12px] font-semibold rounded-[6px]"
                >
                  Confirm & Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
