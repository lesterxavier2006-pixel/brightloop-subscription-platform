import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Layers,
  FileText,
  CreditCard,
  RotateCcw,
  TrendingUp,
  Database,
  Sliders,
  DollarSign,
  ArrowRight,
  Download,
  PlusCircle,
  X,
  Users,
  FileCheck,
  Coins,
  Shield,
} from 'lucide-react';
import { Subscription, Invoice, CurrencyCode, Quotation, Customer } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  subscriptions: Subscription[];
  invoices: Invoice[];
  quotations?: Quotation[];
  customers?: Customer[];
  onSelectSubscription: (sub: Subscription) => void;
  onSelectInvoice: (inv: Invoice) => void;
  onQuickAction: (action: 'new_sub' | 'new_inv' | 'new_plan' | 'new_quote' | 'new_customer') => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onExportCSV: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  subscriptions,
  invoices,
  quotations = [],
  customers = [],
  onSelectSubscription,
  onSelectInvoice,
  onQuickAction,
  onCurrencyChange,
  onExportCSV,
  onOpenSupabaseModal,
  onOpenAuthModal,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  const staticCommands = [
    {
      category: 'NAVIGATION',
      id: 'nav_overview',
      label: 'Go to Executive Overview',
      icon: TrendingUp,
      action: () => {
        onNavigate('overview');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_subscriptions',
      label: 'Go to Subscriptions Ledger',
      icon: Layers,
      action: () => {
        onNavigate('subscriptions');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_invoices',
      label: 'Go to Invoices & Billing Operations',
      icon: FileText,
      action: () => {
        onNavigate('invoices');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_customers',
      label: 'Go to Customers Directory',
      icon: Users,
      action: () => {
        onNavigate('customers');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_quotations',
      label: 'Go to Quotations & Proposals',
      icon: FileCheck,
      action: () => {
        onNavigate('quotations');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_payments',
      label: 'Go to Payments Ledger',
      icon: Coins,
      action: () => {
        onNavigate('payments');
        onClose();
      },
    },
    {
      category: 'DATABASE',
      id: 'act_supabase',
      label: 'Open Supabase Connection & RLS Settings',
      icon: Database,
      action: () => {
        onClose();
        if (onOpenSupabaseModal) onOpenSupabaseModal();
      },
    },
    {
      category: 'AUTH',
      id: 'act_auth',
      label: 'Switch User Role / Supabase Auth',
      icon: Shield,
      action: () => {
        onClose();
        if (onOpenAuthModal) onOpenAuthModal();
      },
    },
    {
      category: 'ACTIONS',
      id: 'act_new_sub',
      label: 'Create New Subscription',
      icon: PlusCircle,
      action: () => {
        onClose();
        onQuickAction('new_sub');
      },
    },
    {
      category: 'ACTIONS',
      id: 'act_new_inv',
      label: 'Issue New Invoice',
      icon: FileText,
      action: () => {
        onClose();
        onQuickAction('new_inv');
      },
    },
    {
      category: 'ACTIONS',
      id: 'act_new_quote',
      label: 'Create Commercial Quotation',
      icon: FileCheck,
      action: () => {
        onClose();
        onQuickAction('new_quote');
      },
    },
    {
      category: 'ACTIONS',
      id: 'act_export_csv',
      label: 'Export Complete Ledger to CSV',
      icon: Download,
      action: () => {
        onClose();
        onExportCSV();
      },
    },
  ];

  const matchedStatic = staticCommands.filter((c) =>
    c.label.toLowerCase().includes(cleanQ) || c.category.toLowerCase().includes(cleanQ)
  );

  const matchedSubs = subscriptions
    .filter(
      (s) =>
        s.customerName.toLowerCase().includes(cleanQ) ||
        s.company.toLowerCase().includes(cleanQ) ||
        s.subscriptionNumber.toLowerCase().includes(cleanQ) ||
        s.planName.toLowerCase().includes(cleanQ)
    )
    .slice(0, 3);

  const matchedInvs = invoices
    .filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(cleanQ) ||
        inv.customerName.toLowerCase().includes(cleanQ) ||
        inv.company.toLowerCase().includes(cleanQ)
    )
    .slice(0, 3);

  const matchedCustomers = customers
    .filter(
      (c) =>
        c.companyName.toLowerCase().includes(cleanQ) ||
        c.contactName.toLowerCase().includes(cleanQ) ||
        c.email.toLowerCase().includes(cleanQ)
    )
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[580px] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] pm-shadow-modal overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#E2E8F0] gap-3">
          <Search size={18} className="text-[#94A3B8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, customer, subscription, or quote..."
            className="flex-1 bg-transparent text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none font-body"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#0F172A] rounded hover:bg-[#F8FAFC]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#F1F5F9]">
          {matchedCustomers.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Customers
              </div>
              {matchedCustomers.map((cust) => (
                <button
                  key={cust.id}
                  onClick={() => {
                    onNavigate('customers');
                    onClose();
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left rounded-[6px] hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users size={16} className="text-[#3457D5]" />
                    <div>
                      <div className="text-[13px] font-medium text-[#0F172A]">{cust.companyName}</div>
                      <div className="text-[11px] text-[#64748B]">{cust.contactName} · {cust.email}</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#94A3B8]" />
                </button>
              ))}
            </div>
          )}

          {matchedSubs.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Subscriptions
              </div>
              {matchedSubs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    onSelectSubscription(sub);
                    onClose();
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left rounded-[6px] hover:bg-[#F8FAFC] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Layers size={16} className="text-[#3457D5] shrink-0" />
                    <div className="truncate">
                      <div className="text-[13px] font-medium text-[#0F172A]">
                        {sub.company} <span className="text-[#64748B] font-normal">({sub.customerName})</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono-numbers">
                        {sub.subscriptionNumber} · {sub.planName} · Status: {sub.status}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#94A3B8] group-hover:text-[#3457D5] shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {matchedInvs.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Invoices
              </div>
              {matchedInvs.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    onSelectInvoice(inv);
                    onClose();
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-left rounded-[6px] hover:bg-[#F8FAFC] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-[#16A34A] shrink-0" />
                    <div className="truncate">
                      <div className="text-[13px] font-medium text-[#0F172A]">
                        {inv.invoiceNumber} — {inv.company}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-mono-numbers">
                        Status: {inv.status} · Issued {inv.issueDate}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[#94A3B8] group-hover:text-[#16A34A] shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {matchedStatic.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                System Commands
              </div>
              {matchedStatic.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full px-3 py-2 flex items-center justify-between text-left rounded-[6px] hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className="text-[#64748B] group-hover:text-[#3457D5]" />
                      <span className="text-[13px] font-medium text-[#0F172A]">{cmd.label}</span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">
                      {cmd.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Brightloop Subscription OS</span>
          <span>ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
