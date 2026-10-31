import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Shield,
  Key,
  Globe,
  Sparkles,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveRuntimeSupabaseCredentials,
  testSupabaseConnection,
} from '../lib/supabase';
import { seedSupabaseFromMock } from '../services/databaseService';

interface SupabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionSuccess: () => void;
}

export const SupabaseConnectionModal: React.FC<SupabaseConnectionModalProps> = ({
  isOpen,
  onClose,
  onConnectionSuccess,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    error?: string;
  } | null>(null);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url || (creds.urlIsKey ? '' : creds.rawUrl));
      setAnonKey(creds.anonKey || (creds.urlIsKey ? creds.rawUrl : ''));
      setTestResult(null);
      setSeedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    // Temporarily save before test
    saveRuntimeSupabaseCredentials(url, anonKey);

    const res = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);
    if (res.connected) {
      onConnectionSuccess();
    }
  };

  const handleSaveAndClose = () => {
    saveRuntimeSupabaseCredentials(url, anonKey);
    onConnectionSuccess();
    onClose();
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    const res = await seedSupabaseFromMock();
    setIsSeeding(false);
    setSeedResult(res.message);
  };

  const copySchemaSQL = () => {
    fetch('/supabase_schema.sql')
      .then((r) => r.text())
      .then((sql) => {
        navigator.clipboard.writeText(sql);
        setCopiedSQL(true);
        setTimeout(() => setCopiedSQL(false), 2500);
      })
      .catch(() => {
        setCopiedSQL(true);
        setTimeout(() => setCopiedSQL(false), 2500);
      });
  };

  const creds = getSupabaseCredentials();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[560px] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] pm-shadow-modal overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[60px] px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#3ECF8E]/15 text-[#00875A] flex items-center justify-center font-bold">
              <Database size={18} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#0F172A] font-display flex items-center gap-2">
                <span>Supabase PostgreSQL Integration</span>
                {creds.isConfigured ? (
                  <span className="text-[10px] font-semibold bg-[#ECFDF5] text-[#16A34A] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                    Configured
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                    Local Fallback Active
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#64748B]">
                Official @supabase/supabase-js client & Row Level Security (RLS)
              </div>
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
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Security note */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] flex items-start gap-2.5 text-[12px] text-[#64748B]">
            <Shield size={16} className="text-[#3457D5] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F172A]">Client-Safe Anonymous Key:</strong> Connects using your Supabase Project URL and public anon key. Secret / service_role keys are strictly never exposed to the frontend.
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-[6px] border text-[12px] flex items-start gap-2 ${
                testResult.connected
                  ? 'bg-[#ECFDF5] border-[#BBF7D0] text-[#16A34A]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
              }`}
            >
              {testResult.connected ? (
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{testResult.message}</div>
                {testResult.error && (
                  <div className="text-[11px] opacity-80 font-mono mt-0.5">{testResult.error}</div>
                )}
              </div>
            </div>
          )}

          {seedResult && (
            <div className="p-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[6px] text-[#3457D5] text-[12px] flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{seedResult}</span>
            </div>
          )}

          {creds.urlIsKey && (
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[6px] text-[#D97706] text-[12px] flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> An API key (<code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded">{creds.rawUrl.slice(0, 16)}...</code>) was detected in the URL parameter instead of a Supabase project URL.
                <div className="mt-1">
                  Please enter your Supabase Project URL below (e.g. <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded">https://xyzcompany.supabase.co</code>). Your key has been placed in the Anon Key field.
                </div>
              </div>
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1 flex items-center justify-between">
              <span>Supabase Project URL</span>
              <span className="text-[10px] text-[#64748B] font-normal">
                from Supabase Dashboard &gt; Settings &gt; API
              </span>
            </label>
            <div className="relative">
              <Globe size={15} className="absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none font-mono focus:border-[#3457D5]"
              />
            </div>
          </div>

          {/* Anon Key Input */}
          <div>
            <label className="block text-[12px] font-semibold text-[#0F172A] mb-1 flex items-center justify-between">
              <span>Supabase Anon (Publishable) Key</span>
              <span className="text-[10px] text-[#64748B] font-normal">
                public anon key only
              </span>
            </label>
            <div className="relative">
              <Key size={15} className="absolute left-3 top-2.5 text-[#94A3B8]" />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-[#CBD5E1] rounded-[6px] text-[#0F172A] outline-none font-mono focus:border-[#3457D5]"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !url || !anonKey}
              className="px-3.5 py-1.5 text-[12px] font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
              <span>{isTesting ? 'Testing Connection...' : 'Test Database Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSeed}
              disabled={isSeeding || !testResult?.connected}
              className="px-3.5 py-1.5 text-[12px] font-semibold text-[#3457D5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-[6px] flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Populates Supabase tables with initial product catalog and test data"
            >
              <Sparkles size={13} />
              <span>{isSeeding ? 'Seeding...' : 'Seed Test Data to Supabase'}</span>
            </button>
          </div>

          {/* Database Schema & RLS Helper */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#0F172A]">
                PostgreSQL Schema & RLS Script
              </span>
              <button
                type="button"
                onClick={copySchemaSQL}
                className="text-[11px] font-medium text-[#3457D5] hover:underline flex items-center gap-1"
              >
                {copiedSQL ? <Check size={12} className="text-[#16A34A]" /> : <Copy size={12} />}
                <span>{copiedSQL ? 'Schema SQL Copied!' : 'Copy supabase_schema.sql'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Run this script inside your Supabase <strong>SQL Editor</strong> to create the tables for Products, Customers, Plans, Quotations, Subscriptions, Invoices, Payments, and Row Level Security policies.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] font-medium text-[#64748B] hover:text-[#0F172A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-4 py-1.5 bg-[#3457D5] hover:bg-[#2A48B8] text-white text-[12px] font-semibold rounded-[6px] shadow-xs"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
