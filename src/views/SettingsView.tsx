import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Check,
  Save,
  Landmark,
  Percent,
  Tag,
  Plus,
  Trash2,
  RotateCcw,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { CurrencyCode, Tax, Discount } from '../types';
import {
  fetchTaxes,
  createTax,
  deleteTax,
  fetchDiscounts,
  createDiscount,
  deleteDiscount,
  runRecurringBillingCycle,
} from '../services/databaseService';

interface SettingsViewProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentCurrency,
  onCurrencyChange,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'taxes' | 'discounts' | 'billing'>('general');
  const [saved, setSaved] = useState(false);
  const [gracePeriodDays, setGracePeriodDays] = useState(14);
  const [autoDunningEnabled, setAutoDunningEnabled] = useState(true);
  const [cardUpdaterEnabled, setCardUpdaterEnabled] = useState(true);

  // Taxes State
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isAddingTax, setIsAddingTax] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxCode, setNewTaxCode] = useState('');
  const [newTaxRate, setNewTaxRate] = useState(18);
  const [newTaxCountry, setNewTaxCountry] = useState('US');

  // Discounts State
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountName, setNewDiscountName] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [newDiscountValue, setNewDiscountValue] = useState(15);
  const [newDiscountMaxUses, setNewDiscountMaxUses] = useState(100);

  // Billing Engine State
  const [billingResult, setBillingResult] = useState<string | null>(null);
  const [isExecutingBilling, setIsExecutingBilling] = useState(false);

  useEffect(() => {
    loadTaxesAndDiscounts();
  }, []);

  const loadTaxesAndDiscounts = async () => {
    const [tList, dList] = await Promise.all([fetchTaxes(), fetchDiscounts()]);
    setTaxes(tList);
    setDiscounts(dList);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName || !newTaxCode) return;
    const created = await createTax({
      name: newTaxName,
      code: newTaxCode.toUpperCase(),
      ratePercent: Number(newTaxRate),
      countryCode: newTaxCountry,
      isActive: true,
    });
    setTaxes((prev) => [...prev, created]);
    setIsAddingTax(false);
    setNewTaxName('');
    setNewTaxCode('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteTax = async (id: string) => {
    await deleteTax(id);
    setTaxes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscountCode || !newDiscountName) return;
    const created = await createDiscount({
      code: newDiscountCode.toUpperCase().trim(),
      name: newDiscountName,
      type: newDiscountType,
      value: Number(newDiscountValue),
      maxUses: Number(newDiscountMaxUses),
      isActive: true,
      validUntil: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
    });
    setDiscounts((prev) => [created, ...prev]);
    setIsAddingDiscount(false);
    setNewDiscountCode('');
    setNewDiscountName('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteDiscount = async (id: string) => {
    await deleteDiscount(id);
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleRunBillingEngine = async () => {
    setIsExecutingBilling(true);
    setBillingResult(null);
    try {
      const res = await runRecurringBillingCycle();
      setBillingResult(res.message);
    } catch (e: any) {
      setBillingResult('Billing engine cycle encountered an error.');
    } finally {
      setIsExecutingBilling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
          RevOps & Billing Environment Settings
        </h1>
        <p className="text-[13px] text-[#64748B] mt-0.5">
          Configure default settlement rails, automated retry schedules, and tax reporting rules.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0] gap-2 text-[13px] font-medium">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-[#3457D5] text-[#3457D5] font-semibold'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Sliders size={15} />
          <span>General & Settlement</span>
        </button>
        <button
          onClick={() => setActiveTab('taxes')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'taxes'
              ? 'border-[#3457D5] text-[#3457D5] font-semibold'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Percent size={15} />
          <span>Taxes ({taxes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'discounts'
              ? 'border-[#3457D5] text-[#3457D5] font-semibold'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Tag size={15} />
          <span>Discounts & Coupons ({discounts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'border-[#3457D5] text-[#3457D5] font-semibold'
              : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <RotateCcw size={15} />
          <span>Automated Billing Engine</span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-[6px] text-[#16A34A] text-[13px] font-medium flex items-center gap-2">
          <Check size={16} />
          <span>Operational configuration successfully saved and synchronized.</span>
        </div>
      )}

      {/* Tab: General */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
              <Landmark size={18} className="text-[#3457D5]" />
              <span className="text-[14px] font-bold text-[#0F172A] font-display">
                Reporting & Settlement Baseline
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Primary Dashboard Display Currency
                </label>
                <select
                  value={currentCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none"
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="EUR">Euro (€ EUR)</option>
                  <option value="GBP">British Pound (£ GBP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Grace Period Prior to Service Intercept (Days)
                </label>
                <input
                  type="number"
                  min="3"
                  max="45"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 14)}
                  className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] font-mono-numbers outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
              <Sliders size={18} className="text-[#16A34A]" />
              <span className="text-[14px] font-bold text-[#0F172A] font-display">
                Autonomous Dunning Automation
              </span>
            </div>

            <div className="space-y-3 pt-1 text-[13px]">
              <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <div className="font-semibold text-[#0F172A]">Intelligent Routing Retry Engine</div>
                  <div className="text-[12px] text-[#64748B]">
                    Automatically re-route soft decline codes through alternate network rails.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoDunningEnabled}
                  onChange={(e) => setAutoDunningEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#3457D5] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <div className="font-semibold text-[#0F172A]">
                    Visa & Mastercard Account Updater (VAU)
                  </div>
                  <div className="text-[12px] text-[#64748B]">
                    Query card networks automatically to refresh expired and re-issued tokens.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={cardUpdaterEnabled}
                  onChange={(e) => setCardUpdaterEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#3457D5] rounded"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#3457D5] hover:bg-[#2A48B8] text-white text-[13px] font-semibold rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors pm-focus-glow"
            >
              <Save size={14} />
              <span>Save RevOps Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab: Taxes */}
      {activeTab === 'taxes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#0F172A]">Tax Jurisdiction Rates</h2>
              <p className="text-[12px] text-[#64748B]">
                Configure GST, VAT, and Sales Tax applied automatically to subscription invoices.
              </p>
            </div>
            <button
              onClick={() => setIsAddingTax(true)}
              className="h-8 px-3 text-[12px] font-semibold text-white bg-[#3457D5] hover:bg-[#2A48B8] rounded-[6px] flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Add Tax Rule</span>
            </button>
          </div>

          {isAddingTax && (
            <form
              onSubmit={handleCreateTax}
              className="p-4 bg-white border border-[#3457D5]/40 rounded-[8px] space-y-3"
            >
              <div className="text-[13px] font-bold text-[#0F172A]">Add New Tax Jurisdiction</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[12px]">
                <div>
                  <label className="block font-semibold mb-1">Tax Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. India GST"
                    value={newTaxName}
                    onChange={(e) => setNewTaxName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IN-GST"
                    value={newTaxCode}
                    onChange={(e) => setNewTaxCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="50"
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={newTaxCountry}
                    onChange={(e) => setNewTaxCountry(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTax(false)}
                  className="px-3 py-1.5 text-[12px] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3457D5] text-white rounded-[6px] text-[12px] font-semibold"
                >
                  Save Tax
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-[#E2E8F0] rounded-[8px] divide-y divide-[#E2E8F0]">
            {taxes.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-[#0F172A]">{t.name}</div>
                  <div className="text-[11px] text-[#64748B]">
                    Code: <span className="font-mono text-[#3457D5] font-semibold">{t.code}</span> · Jurisdiction: {t.countryCode || 'Global'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold text-[#0F172A] font-mono-numbers">
                    {t.ratePercent}%
                  </span>
                  <button
                    onClick={() => handleDeleteTax(t.id)}
                    className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] rounded hover:bg-[#FEF2F2]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Discounts */}
      {activeTab === 'discounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-[#0F172A]">Coupons & Concessions</h2>
              <p className="text-[12px] text-[#64748B]">
                Configure fixed or percentage promotional discounts with quota and expiry rules.
              </p>
            </div>
            <button
              onClick={() => setIsAddingDiscount(true)}
              className="h-8 px-3 text-[12px] font-semibold text-white bg-[#3457D5] hover:bg-[#2A48B8] rounded-[6px] flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Create Coupon</span>
            </button>
          </div>

          {isAddingDiscount && (
            <form
              onSubmit={handleCreateDiscount}
              className="p-4 bg-white border border-[#3457D5]/40 rounded-[8px] space-y-3"
            >
              <div className="text-[13px] font-bold text-[#0F172A]">New Promotional Discount</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[12px]">
                <div>
                  <label className="block font-semibold mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP50"
                    value={newDiscountCode}
                    onChange={(e) => setNewDiscountCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px] font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring Promo"
                    value={newDiscountName}
                    onChange={(e) => setNewDiscountName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Discount Type</label>
                  <select
                    value={newDiscountType}
                    onChange={(e) => setNewDiscountType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Value ({newDiscountType === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDiscountValue}
                    onChange={(e) => setNewDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-[6px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDiscount(false)}
                  className="px-3 py-1.5 text-[12px] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3457D5] text-white rounded-[6px] text-[12px] font-semibold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-[#E2E8F0] rounded-[8px] divide-y divide-[#E2E8F0]">
            {discounts.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#0F172A] font-mono px-2 py-0.5 rounded bg-[#EEF2FF] text-[#3457D5]">
                      {d.code}
                    </span>
                    <span className="text-[13px] font-semibold text-[#0F172A]">{d.name}</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-1">
                    Used: {d.usedCount} of {d.maxUses || '∞'} · Expires: {d.validUntil || 'Never'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold text-[#16A34A] font-mono-numbers">
                    {d.type === 'percentage' ? `${d.value}% OFF` : `$${d.value} OFF`}
                  </span>
                  <button
                    onClick={() => handleDeleteDiscount(d.id)}
                    className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] rounded hover:bg-[#FEF2F2]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Automated Billing Engine */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 pm-shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
              <RotateCcw size={18} className="text-[#3457D5]" />
              <span className="text-[14px] font-bold text-[#0F172A] font-display">
                Automated Recurring Billing Execution
              </span>
            </div>
            <p className="text-[13px] text-[#64748B]">
              The billing process scans all active subscriptions, identifies cycles due for renewal, emits
              itemized invoices with taxes and discounts, advances renewal dates according to interval (daily,
              weekly, monthly, yearly), and prevents duplicate invoices for the same period.
            </p>

            {billingResult && (
              <div className="p-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[6px] text-[#3457D5] text-[13px] flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-[#16A34A]" />
                <span>{billingResult}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunBillingEngine}
                disabled={isExecutingBilling}
                className="px-5 py-2.5 bg-[#3457D5] hover:bg-[#2A48B8] text-white text-[13px] font-semibold rounded-[6px] flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
              >
                <RotateCcw size={15} className={isExecutingBilling ? 'animate-spin' : ''} />
                <span>{isExecutingBilling ? 'Executing Billing Cycle...' : 'Run Billing Engine Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
