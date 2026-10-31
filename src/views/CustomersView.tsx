import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Building,
  Mail,
  Phone,
  Trash2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Customer, CurrencyCode, UserRole } from '../types';
import { formatDate, exportToCSV } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  currency: CurrencyCode;
  role: UserRole;
  onCreateCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  currency,
  role,
  onCreateCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [taxIdentifier, setTaxIdentifier] = useState('');

  const filtered = customers.filter((c) => {
    const term = searchQuery.toLowerCase().trim();
    return (
      !term ||
      c.companyName.toLowerCase().includes(term) ||
      c.contactName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !email) return;

    await onCreateCustomer({
      companyName,
      contactName,
      email,
      phone,
      billingAddress,
      currency: 'USD',
      taxIdentifier,
      status: 'active',
    });

    setIsAddModalOpen(false);
    setCompanyName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setBillingAddress('');
    setTaxIdentifier('');
    setNotice('Customer account successfully enrolled into Supabase database!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Confirm deletion of customer account "${name}"?`)) {
      await onDeleteCustomer(id);
      setNotice('Customer record removed.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleExportCSV = () => {
    exportToCSV('customers-directory', filtered, [
      { key: 'companyName', label: 'Company Name' },
      { key: 'contactName', label: 'Contact Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'billingAddress', label: 'Billing Address' },
      { key: 'taxIdentifier', label: 'Tax ID / GST' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] lg:text-[24px] font-bold text-[#0F172A] tracking-[-0.02em] font-display">
            Customer Directory & Accounts
          </h1>
          <p className="text-[13px] text-[#64748B] mt-0.5">
            Verified B2B accounts, tax identifiers, billing contacts, and security identifiers.
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
              onClick={() => setIsAddModalOpen(true)}
              className="h-8 px-3 text-[12px] font-semibold text-white bg-[#3457D5] hover:bg-[#2A48B8] rounded-[6px] flex items-center gap-1.5 shadow-xs transition-colors pm-focus-glow"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Customer</span>
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

      {/* Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-4 pm-shadow-sm">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search customers by company name, contact, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#3457D5] rounded-[6px] text-[#0F172A] placeholder-[#94A3B8] outline-none pm-focus-glow"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden pm-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="h-[40px] bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase font-body">
                <th className="px-5">Company / Entity</th>
                <th className="px-4">Contact Person</th>
                <th className="px-4">Billing Email</th>
                <th className="px-4">Phone</th>
                <th className="px-4">Tax / GST ID</th>
                <th className="px-4">Billing Location</th>
                <th className="px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    <div className="text-[14px] font-medium">No customer accounts found</div>
                    <div className="text-[12px] text-[#94A3B8] mt-1">
                      Add a customer to begin provisioning subscriptions.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="h-[52px] hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5">
                      <div className="font-semibold text-[#0F172A] flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#EEF2FF] text-[#3457D5] font-bold text-[11px] flex items-center justify-center">
                          {c.companyName.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{c.companyName}</span>
                      </div>
                    </td>

                    <td className="px-4 text-[#0F172A] font-medium">{c.contactName}</td>

                    <td className="px-4 text-[#64748B] font-mono-numbers text-[12px]">
                      {c.email}
                    </td>

                    <td className="px-4 text-[#64748B] text-[12px] font-mono-numbers">
                      {c.phone || '—'}
                    </td>

                    <td className="px-4 text-[12px] font-mono text-[#475569]">
                      {c.taxIdentifier || '—'}
                    </td>

                    <td className="px-4 text-[12px] text-[#64748B] truncate max-w-[200px]">
                      {c.billingAddress || 'Standard Global'}
                    </td>

                    <td className="px-5 text-right">
                      {role === 'admin' && (
                        <button
                          onClick={() => handleDelete(c.id, c.companyName)}
                          className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors"
                          title="Delete Customer Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs">
          <div className="w-full max-w-[480px] bg-white border border-[#E2E8F0] rounded-[12px] pm-shadow-modal p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-[15px] font-bold text-[#0F172A] font-display">
                Add Customer Account
              </span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Company Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Cloud Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Primary Contact Person <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Email Address <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="billing@acme.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Tax / GST Identifier
                </label>
                <input
                  type="text"
                  placeholder="US-EIN-12345 or IN-GSTIN-..."
                  value={taxIdentifier}
                  onChange={(e) => setTaxIdentifier(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  placeholder="Street, City, Postal Code, Country"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-[12px] text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3457D5] text-white text-[12px] font-semibold rounded-[6px]"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
