import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Menu,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  Layers,
  FilePlus,
  CreditCard,
  Check,
  Database,
  FileCheck,
  Coins,
  Users,
  Shield,
  UserCheck,
} from 'lucide-react';
import { CurrencyCode, UserRole } from '../types';
import { CURRENCIES } from '../utils/formatters';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onQuickAction: (action: 'new_sub' | 'new_inv' | 'new_plan' | 'new_quote' | 'new_customer') => void;
  activeViewTitle: string;
  role: UserRole;
  userEmail: string;
  isSupabaseConnected: boolean;
  onOpenAuthModal: () => void;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenCommandPalette,
  currentCurrency,
  onCurrencyChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onQuickAction,
  activeViewTitle,
  role,
  userEmail,
  isSupabaseConnected,
  onOpenAuthModal,
  onOpenSupabaseModal,
}) => {
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isQuickActionMenuOpen, setIsQuickActionMenuOpen] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setIsCurrencyMenuOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) {
        setIsQuickActionMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-[#FFFFFF] border-b border-[#E2E8F0] backdrop-blur-md px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-md hover:bg-[#F8FAFC] lg:hidden"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-[13px] truncate">
          <span className="text-[#64748B] hidden sm:inline">Brightloop</span>
          <span className="text-[#CBD5E1] hidden sm:inline">/</span>
          <span className="font-semibold text-[#0F172A] font-display truncate">
            {activeViewTitle}
          </span>
        </div>
      </div>

      {/* Center: Global Command Search (⌘K) */}
      <div className="flex-1 max-w-[380px] hidden md:block">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between h-9 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[6px] text-[13px] text-[#94A3B8] transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search size={15} className="text-[#94A3B8] group-hover:text-[#64748B]" />
            <span className="text-[#64748B] group-hover:text-[#0F172A]">
              Search tables, quotes, customers...
            </span>
          </div>
          <kbd className="h-5 px-1.5 inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-[#64748B] bg-[#FFFFFF] border border-[#CBD5E1] rounded shadow-2xs">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right: Supabase Badge + Role Pill + Currency Toggle + Notifications + Quick Action */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Supabase Indicator Button */}
        <button
          onClick={onOpenSupabaseModal}
          className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-[6px] border text-[11px] font-semibold transition-colors bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]"
          title="Supabase Database Connection & RLS Policies"
        >
          <Database size={13} className={isSupabaseConnected ? 'text-[#16A34A]' : 'text-[#D97706]'} />
          <span className="text-[#0F172A]">
            {isSupabaseConnected ? 'Supabase Live' : 'Supabase Config'}
          </span>
        </button>

        {/* User Role Badge */}
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-[6px] bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#C7D2FE] text-[#3457D5] text-[11px] font-semibold transition-colors"
          title="Switch Role or Sign In with Supabase Auth"
        >
          <Shield size={13} />
          <span className="uppercase">{role}</span>
        </button>

        {/* Currency Switcher */}
        <div className="relative" ref={currencyMenuRef}>
          <button
            onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
            className="h-8 px-2.5 flex items-center gap-1.5 text-[12px] font-medium text-[#0F172A] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-[6px] transition-colors"
            title="Switch Active Reporting Currency"
          >
            <span className="font-mono font-bold text-[#3457D5]">
              {CURRENCIES[currentCurrency].symbol}
            </span>
            <span className="hidden sm:inline">{currentCurrency}</span>
            <ChevronDown size={13} className="text-[#64748B]" />
          </button>

          {isCurrencyMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px] pm-shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase border-b border-[#F1F5F9]">
                Reporting Currency
              </div>
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                const isSelected = code === currentCurrency;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      onCurrencyChange(code);
                      setIsCurrencyMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between text-[13px] text-left hover:bg-[#F8FAFC] transition-colors ${
                      isSelected ? 'font-semibold text-[#3457D5] bg-[#EEF2FF]/60' : 'text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono w-4 font-bold text-[#3457D5]">
                        {CURRENCIES[code].symbol}
                      </span>
                      <span>{code}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-[#3457D5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-[#64748B] hover:text-[#0F172A] rounded-[6px] hover:bg-[#F8FAFC] transition-colors"
          title="Audit & Revenue Alerts"
        >
          <Bell size={18} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-[#EF4444] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Quick Action Trigger Button (+ New) */}
        {role !== 'customer' && (
          <div className="relative" ref={quickActionRef}>
            <button
              onClick={() => setIsQuickActionMenuOpen(!isQuickActionMenuOpen)}
              className="h-8 px-3 bg-[#3457D5] hover:bg-[#2A48B8] active:bg-[#1E3A8A] text-white text-[12px] font-semibold rounded-[6px] flex items-center gap-1.5 transition-all shadow-xs pm-focus-glow"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New</span>
              <ChevronDown size={13} className="text-white/80" />
            </button>

            {isQuickActionMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px] pm-shadow-lg py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase border-b border-[#F1F5F9]">
                  Quick Create
                </div>

                <button
                  onClick={() => {
                    setIsQuickActionMenuOpen(false);
                    onQuickAction('new_sub');
                  }}
                  className="w-full px-3 py-2 text-[13px] text-left text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2.5 transition-colors"
                >
                  <Layers size={15} className="text-[#3457D5]" />
                  <div>
                    <div className="font-medium">New Subscription</div>
                    <div className="text-[11px] text-[#64748B]">Enroll customer contract</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionMenuOpen(false);
                    onQuickAction('new_inv');
                  }}
                  className="w-full px-3 py-2 text-[13px] text-left text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2.5 transition-colors"
                >
                  <FilePlus size={15} className="text-[#16A34A]" />
                  <div>
                    <div className="font-medium">Issue Invoice</div>
                    <div className="text-[11px] text-[#64748B]">Generate billable statement</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionMenuOpen(false);
                    onQuickAction('new_quote');
                  }}
                  className="w-full px-3 py-2 text-[13px] text-left text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2.5 transition-colors"
                >
                  <FileCheck size={15} className="text-[#D97706]" />
                  <div>
                    <div className="font-medium">Create Quotation</div>
                    <div className="text-[11px] text-[#64748B]">Issue commercial proposal</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionMenuOpen(false);
                    onQuickAction('new_customer');
                  }}
                  className="w-full px-3 py-2 text-[13px] text-left text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2.5 transition-colors"
                >
                  <Users size={15} className="text-[#4F46E5]" />
                  <div>
                    <div className="font-medium">Add Customer</div>
                    <div className="text-[11px] text-[#64748B]">Register verified entity</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
