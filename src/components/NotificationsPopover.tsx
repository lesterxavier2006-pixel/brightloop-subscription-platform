import React, { useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem, CurrencyCode } from '../types';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currency: CurrencyCode;
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  currency,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'dunning_failed':
        return <AlertTriangle size={15} className="text-[#DC2626]" />;
      case 'invoice_settled':
        return <CheckCircle2 size={15} className="text-[#16A34A]" />;
      case 'plan_upgrade':
        return <TrendingUp size={15} className="text-[#3457D5]" />;
      case 'renewal_pending':
        return <Clock size={15} className="text-[#D97706]" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-4 top-[58px] z-50 w-80 sm:w-96 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[8px] pm-shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FFFFFF]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#0F172A] font-display">
            Operational Alerts
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] font-medium text-[#3457D5] hover:text-[#2A48B8]"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#0F172A] rounded hover:bg-[#F8FAFC]"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F1F5F9]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-[#64748B] text-[13px]">
            No pending operational alerts
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onSelectNotification(notif)}
              className={`p-3.5 flex items-start gap-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                !notif.read ? 'bg-[#EEF2FF]/20' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0 p-1.5 rounded bg-white border border-[#E2E8F0]">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[12px] truncate ${
                      !notif.read ? 'font-semibold text-[#0F172A]' : 'font-medium text-[#475569]'
                    }`}
                  >
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] shrink-0 font-mono-numbers">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.description}
                </p>
                {notif.actionLink && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#3457D5] hover:underline">
                    <span>Inspect event telemetry</span>
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
        <span className="text-[11px] text-[#64748B]">
          Syncing with Stripe, Razorpay & ACH webhook streams
        </span>
      </div>
    </div>
  );
};
