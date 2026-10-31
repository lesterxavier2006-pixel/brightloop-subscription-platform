import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, DollarSign } from 'lucide-react';
import { Invoice, Subscription, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  currency: CurrencyCode;
  initialCustomer?: Subscription | null;
  onCreateInvoice: (newInv: Omit<Invoice, 'id' | 'invoiceNumber'>) => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  currency,
  initialCustomer,
  onCreateInvoice,
}) => {
  const [selectedSubId, setSelectedSubId] = useState(initialCustomer?.id || subscriptions[0]?.id || '');
  const [company, setCompany] = useState(initialCustomer?.company || subscriptions[0]?.company || '');
  const [customerName, setCustomerName] = useState(initialCustomer?.customerName || subscriptions[0]?.customerName || '');
  const [email, setEmail] = useState(initialCustomer?.customerEmail || subscriptions[0]?.customerEmail || '');

  const [lineItems, setLineItems] = useState([
    {
      id: 'li_init',
      description: 'API Compute & Ingress Overage Usage (Tier 1)',
      quantity: 1,
      unitPriceUSD: 750,
    },
  ]);
  const [taxRatePercent, setTaxRatePercent] = useState(18);
  const [discountUSD, setDiscountUSD] = useState(0);
  const [dueDateDays, setDueDateDays] = useState(14);
  const [status, setStatus] = useState<Invoice['status']>('pending');

  if (!isOpen) return null;

  const handleSubChange = (subId: string) => {
    setSelectedSubId(subId);
    const sub = subscriptions.find((s) => s.id === subId);
    if (sub) {
      setCompany(sub.company);
      setCustomerName(sub.customerName);
      setEmail(sub.customerEmail);
    }
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `li_${Date.now()}`,
        description: 'Professional Services / Dedicated RevOps Consultation',
        quantity: 1,
        unitPriceUSD: 400,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, val: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const subtotalUSD = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPriceUSD, 0);
  const afterDiscount = Math.max(0, subtotalUSD - discountUSD);
  const taxAmountUSD = (afterDiscount * taxRatePercent) / 100;
  const totalUSD = afterDiscount + taxAmountUSD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !customerName || lineItems.length === 0) return;

    const issueDate = new Date().toISOString().slice(0, 10);
    const dueDate = new Date(Date.now() + dueDateDays * 86400000).toISOString().slice(0, 10);

    onCreateInvoice({
      customerId: selectedSubId || `cust_custom_${Date.now()}`,
      customerName,
      company,
      customerEmail: email,
      status,
      amountUSD: totalUSD,
      subtotalUSD,
      taxRatePercent,
      taxAmountUSD,
      discountUSD,
      issueDate,
      dueDate,
      settledAt: status === 'settled' ? `${issueDate} 12:00:00 UTC` : undefined,
      paymentMethodSummary: 'Primary Account Billing Rail',
      lineItems: lineItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPriceUSD: item.unitPriceUSD,
        totalUSD: item.quantity * item.unitPriceUSD,
      })),
      memo: 'Manual invoice issued by RevOps operations desk.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[620px] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] pm-shadow-modal overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[60px] px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#EEF2FF] text-[#3457D5] flex items-center justify-center">
              <FileText size={16} />
            </div>
            <div className="text-[15px] font-bold text-[#0F172A] font-display">
              Issue Commercial Invoice
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-md hover:bg-[#F8FAFC]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Customer Selection */}
          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
              Select Customer Account
            </label>
            <select
              value={selectedSubId}
              onChange={(e) => handleSubChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] text-[13px] text-[#0F172A] outline-none focus:border-[#3457D5]"
            >
              {subscriptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.company} ({s.customerName}) — {s.subscriptionNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-1.5 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-semibold text-[#0F172A]">
                Line Items
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-[12px] font-medium text-[#3457D5] hover:text-[#2A48B8] flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="Description..."
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="flex-1 px-2.5 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)
                    }
                    className="w-14 px-2 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded text-center font-mono-numbers outline-none"
                  />
                  <div className="flex items-center w-28">
                    <span className="text-[12px] text-[#64748B] mr-1">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      placeholder="Price"
                      value={item.unitPriceUSD}
                      onChange={(e) =>
                        updateLineItem(index, 'unitPriceUSD', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 text-[12px] bg-white border border-[#CBD5E1] rounded text-right font-mono-numbers outline-none"
                    />
                  </div>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tax, Discount & Due */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Tax Rate (%)
              </label>
              <select
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#CBD5E1] rounded outline-none"
              >
                <option value={0}>0% (Tax Exempt)</option>
                <option value={5}>5% Standard</option>
                <option value={12}>12% VAT</option>
                <option value={18}>18% GST / VAT</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Discount (USD)
              </label>
              <input
                type="number"
                min="0"
                value={discountUSD}
                onChange={(e) => setDiscountUSD(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#CBD5E1] rounded font-mono-numbers outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Due Terms
              </label>
              <select
                value={dueDateDays}
                onChange={(e) => setDueDateDays(parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 text-[12px] bg-white border border-[#CBD5E1] rounded outline-none"
              >
                <option value={7}>Net 7 Days</option>
                <option value={14}>Net 14 Days</option>
                <option value={30}>Net 30 Days</option>
              </select>
            </div>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
              Initial Invoice State
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`flex-1 py-1.5 text-[12px] font-medium rounded border ${
                  status === 'pending'
                    ? 'border-[#3457D5] bg-[#EEF2FF] text-[#3457D5] font-semibold'
                    : 'border-[#E2E8F0] text-[#64748B]'
                }`}
              >
                Pending Collection
              </button>
              <button
                type="button"
                onClick={() => setStatus('settled')}
                className={`flex-1 py-1.5 text-[12px] font-medium rounded border ${
                  status === 'settled'
                    ? 'border-[#16A34A] bg-[#ECFDF5] text-[#16A34A] font-semibold'
                    : 'border-[#E2E8F0] text-[#64748B]'
                }`}
              >
                Mark as Settled
              </button>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-[12px]">
            <div className="flex justify-between text-[#64748B]">
              <span>Subtotal:</span>
              <span className="font-mono-numbers">{formatCurrency(subtotalUSD, currency)}</span>
            </div>
            {discountUSD > 0 && (
              <div className="flex justify-between text-[#DC2626]">
                <span>Discount Applied:</span>
                <span className="font-mono-numbers">
                  - {formatCurrency(discountUSD, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#64748B]">
              <span>Tax ({taxRatePercent}%):</span>
              <span className="font-mono-numbers">{formatCurrency(taxAmountUSD, currency)}</span>
            </div>
            <div className="flex justify-between text-[14px] font-bold text-[#0F172A] pt-1 border-t border-[#E2E8F0]">
              <span>Total Payable:</span>
              <span className="font-mono-numbers">{formatCurrency(totalUSD, currency)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#64748B] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-[13px] font-semibold rounded-[6px] shadow-xs transition-all"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
