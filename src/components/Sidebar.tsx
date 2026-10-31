import React from 'react';
import {
  Layers,
  FileText,
  CreditCard,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Webhook,
  Sliders,
  DollarSign,
  ChevronRight,
  Database,
  RefreshCw,
  X,
  Users,
  FileCheck,
  Coins,
  Shield,
  Zap,
} from 'lucide-react';
import { CurrencyCode, UserRole } from '../types';

export type ActiveTab =
  | 'overview'
  | 'subscriptions'
  | 'invoices'
  | 'customers'
  | 'quotations'
  | 'payments'
  | 'plans'
  | 'cohorts'
  | 'dunning'
  | 'webhooks'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  subscriptionsCount: number;
  invoicesCount: number;
  customersCount: number;
  quotationsCount: number;
  paymentsCount: number;
  pastDueCount: number;
  currentCurrency: CurrencyCode;
  role: UserRole;
  userEmail: string;
  isSupabaseConnected: boolean;
  onQuickAction: (action: 'new_sub' | 'new_inv') => void;
  onOpenAuthModal: () => void;
  onOpenSupabaseModal: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number | null;
  badgeColor?: string;
  adminOnly?: boolean;
  staffOnly?: boolean;
}

interface NavSection {
  category: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  subscriptionsCount,
  invoicesCount,
  customersCount,
  quotationsCount,
  paymentsCount,
  pastDueCount,
  currentCurrency,
  role,
  userEmail,
  isSupabaseConnected,
  onOpenAuthModal,
  onOpenSupabaseModal,
}) => {
  const navSections: NavSection[] = [
    {
      category: 'REVENUE & OPS',
      items: [
        {
          id: 'overview',
          label: 'Executive Overview',
          icon: TrendingUp,
          badge: null,
        },
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          icon: Layers,
          badge: subscriptionsCount,
        },
        {
          id: 'invoices',
          label: 'Invoices & Billing',
          icon: FileText,
          badge: invoicesCount,
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: Users,
          badge: customersCount,
        },
        {
          id: 'quotations',
          label: 'Quotations',
          icon: FileCheck,
          badge: quotationsCount,
        },
        {
          id: 'payments',
          label: 'Payments Ledger',
          icon: Coins,
          badge: paymentsCount,
        },
        {
          id: 'plans',
          label: 'Plans & Catalog',
          icon: CreditCard,
          badge: null,
        },
      ],
    },
    {
      category: 'ANALYTICS & RETENTION',
      items: [
        {
          id: 'cohorts',
          label: 'Retention Cohorts',
          icon: Database,
          badge: 'M1–M12',
          adminOnly: true,
        },
        {
          id: 'dunning',
          label: 'Smart Dunning Recovery',
          icon: RotateCcw,
          badge: pastDueCount > 0 ? `${pastDueCount} Alert` : null,
          badgeColor: pastDueCount > 0 ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]' : undefined,
          adminOnly: true,
        },
      ],
    },
    {
      category: 'DEVELOPER SYSTEM',
      items: [
        {
          id: 'webhooks',
          label: 'Webhooks & Events',
          icon: Webhook,
          badge: 'Live',
          adminOnly: true,
        },
        {
          id: 'settings',
          label: 'RevOps & RLS Settings',
          icon: Sliders,
          badge: null,
          adminOnly: true,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#0F172A]/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* 256px Fixed Sidebar Rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[256px] flex flex-col bg-[#FFFFFF] border-r border-[#E2E8F0] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup: Brightloop Subscription Management */}
        <div className="h-[60px] px-5 flex items-center justify-between border-b border-[#E2E8F0] shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#3457D5] flex items-center justify-center text-white shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-bold tracking-tight text-[#0F172A] leading-tight font-display">
                Brightloop
              </div>
              <div className="text-[11px] text-[#64748B] font-medium leading-none">
                Subscription Management
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-md hover:bg-[#F8FAFC] lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((sec) => {
            // Filter out admin-only sections if role is customer
            const visibleItems = sec.items.filter((item) => {
              if (role === 'customer') {
                return !item.adminOnly && item.id !== 'customers';
              }
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={sec.category}>
                <div className="px-3 mb-1.5 text-[11px] font-semibold text-[#94A3B8] tracking-[0.05em] uppercase font-body">
                  {sec.category}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded-[6px] transition-all group relative ${
                          isActive
                            ? 'bg-[#EEF2FF] text-[#3457D5] font-semibold'
                            : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#3457D5] rounded-r-full" />
                        )}

                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            size={16}
                            className={`shrink-0 transition-colors ${
                              isActive ? 'text-[#3457D5]' : 'text-[#64748B] group-hover:text-[#0F172A]'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge !== null && item.badge !== undefined && (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              item.badgeColor || 'bg-[#F1F5F9] text-[#475569]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Rail: Supabase Connection & Current Role */}
        <div className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF] shrink-0 space-y-2">
          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            className="w-full p-2 rounded-[6px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isSupabaseConnected ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D97706]'
                }`}
              />
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-[#0F172A] truncate">
                  {isSupabaseConnected ? 'Supabase Postgres' : 'Local Fallback Sync'}
                </div>
                <div className="text-[10px] text-[#64748B] truncate">
                  {isSupabaseConnected ? 'Connected & RLS Active' : 'Click to Configure URL'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-medium text-[#3457D5] bg-[#EEF2FF] px-1.5 py-0.5 rounded border border-[#C7D2FE]">
              {currentCurrency}
            </span>
          </button>

          {/* User Profile & Role Switcher */}
          <div
            onClick={onOpenAuthModal}
            className="p-2 rounded-[6px] hover:bg-[#F8FAFC] cursor-pointer border border-transparent hover:border-[#E2E8F0] transition-colors flex items-center justify-between"
          >
            <div className="min-w-0 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#3457D5]/10 text-[#3457D5] flex items-center justify-center font-bold text-[11px] shrink-0">
                {role === 'admin' ? 'AD' : role === 'staff' ? 'ST' : 'CU'}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-[#0F172A] truncate leading-tight">
                  {userEmail}
                </div>
                <div className="text-[10px] text-[#64748B] uppercase font-semibold">
                  Role: <span className="text-[#3457D5]">{role}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-[#3457D5] hover:underline shrink-0">
              Switch
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
