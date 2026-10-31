import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  Check,
  Building,
  UserCheck,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { profile, role, signIn, signUp, signOut, resetPasswordForEmail, updatePassword, switchDemoRole, isSupabaseConnected } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'demo' | 'forgot' | 'reset'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signin') {
      const res = await signIn(email, password);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Check email and password.');
      }
    } else if (mode === 'signup') {
      const res = await signUp(email, password, fullName, selectedRole, company);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Registration complete! User profile synchronized.');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'Failed to sign up.');
      }
    } else if (mode === 'forgot') {
      const res = await resetPasswordForEmail(email);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Password recovery link transmitted! Check your inbox.');
      } else {
        setErrorMsg(res.error || 'Failed to send recovery link.');
      }
    } else if (mode === 'reset') {
      const res = await updatePassword(newPassword);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Password updated successfully! You can now sign in.');
        setTimeout(() => setMode('signin'), 1000);
      } else {
        setErrorMsg(res.error || 'Failed to update password.');
      }
    }
  };

  const handleDemoSwitch = (r: UserRole) => {
    switchDemoRole(r);
    setSuccessMsg(`Switched role to ${r.toUpperCase()} (${r === 'customer' ? 'Customer Isolated View' : 'Management View'})`);
    setTimeout(() => onClose(), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[480px] bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] pm-shadow-modal overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[60px] px-6 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#3457D5]/10 text-[#3457D5] flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#0F172A] font-display">
                Authentication & Role Access
              </div>
              <div className="text-[11px] text-[#64748B]">
                Current Role: <span className="font-semibold text-[#3457D5] uppercase">{role}</span> ({profile.email})
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

        {/* Tab switch */}
        <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC] p-1 text-[12px] font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setMode('demo')}
            className={`flex-1 min-w-[90px] py-1.5 rounded-[4px] transition-colors ${
              mode === 'demo' ? 'bg-white text-[#3457D5] font-semibold shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            Role Switcher
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 min-w-[90px] py-1.5 rounded-[4px] transition-colors ${
              mode === 'signin' ? 'bg-white text-[#3457D5] font-semibold shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 min-w-[90px] py-1.5 rounded-[4px] transition-colors ${
              mode === 'signup' ? 'bg-white text-[#3457D5] font-semibold shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setMode('forgot')}
            className={`flex-1 min-w-[90px] py-1.5 rounded-[4px] transition-colors ${
              mode === 'forgot' || mode === 'reset' ? 'bg-white text-[#3457D5] font-semibold shadow-2xs' : 'text-[#64748B]'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[6px] text-[#DC2626] text-[12px] flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#ECFDF5] border border-[#BBF7D0] rounded-[6px] text-[#16A34A] text-[12px] flex items-center gap-2">
              <Check size={15} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'demo' ? (
            <div className="space-y-3">
              <div className="text-[12px] text-[#64748B]">
                Switch persona instantly to verify Role-Based Access Control (RBAC) and customer data isolation:
              </div>

              {/* Admin Persona */}
              <button
                type="button"
                onClick={() => handleDemoSwitch('admin')}
                className={`w-full p-3 rounded-[8px] border text-left flex items-start gap-3 transition-colors ${
                  role === 'admin'
                    ? 'border-[#3457D5] bg-[#EEF2FF]/40 ring-1 ring-[#3457D5]'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="p-2 rounded bg-[#3457D5] text-white">
                  <Shield size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0F172A]">Administrator</span>
                    {role === 'admin' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A]">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    admin@brightloop.io · Full management, quotations, customer triage, settings & dunning
                  </div>
                </div>
              </button>

              {/* Staff Persona */}
              <button
                type="button"
                onClick={() => handleDemoSwitch('staff')}
                className={`w-full p-3 rounded-[8px] border text-left flex items-start gap-3 transition-colors ${
                  role === 'staff'
                    ? 'border-[#3457D5] bg-[#EEF2FF]/40 ring-1 ring-[#3457D5]'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="p-2 rounded bg-[#00875A] text-white">
                  <Briefcase size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0F172A]">Staff / RevOps Operator</span>
                    {role === 'staff' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A]">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    sarah.revops@brightloop.io · Operational access, issue invoices, quotations, payments
                  </div>
                </div>
              </button>

              {/* Customer Persona */}
              <button
                type="button"
                onClick={() => handleDemoSwitch('customer')}
                className={`w-full p-3 rounded-[8px] border text-left flex items-start gap-3 transition-colors ${
                  role === 'customer'
                    ? 'border-[#3457D5] bg-[#EEF2FF]/40 ring-1 ring-[#3457D5]'
                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="p-2 rounded bg-[#D97706] text-white">
                  <UserCheck size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#0F172A]">Customer (Linear Dynamics)</span>
                    {role === 'customer' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A]">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    aravind@lineardynamics.io · Isolated private view (sees only Linear Dynamics records)
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                      Account Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                    >
                      <option value="customer">Customer (Access own records only)</option>
                      <option value="staff">Staff (Operational management)</option>
                      <option value="admin">Admin (Full system access)</option>
                    </select>
                  </div>
                </>
              )}

              {mode !== 'reset' && (
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                  />
                </div>
              )}

              {(mode === 'signin' || mode === 'signup') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[12px] font-semibold text-[#0F172A]">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-[#3457D5] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                  />
                </div>
              )}

              {mode === 'reset' && (
                <div>
                  <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[6px] outline-none"
                  />
                </div>
              )}

              {mode === 'forgot' && (
                <div className="text-[11px] text-[#64748B]">
                  We will transmit a secure password reset link to your email through Supabase Authentication. Already have a reset token?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[#3457D5] font-semibold hover:underline"
                  >
                    Set new password
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-[#3457D5] hover:bg-[#2A48B8] text-white text-[13px] font-semibold rounded-[6px] transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : mode === 'signin'
                    ? 'Sign In with Supabase'
                    : mode === 'signup'
                    ? 'Create Account with RLS Role'
                    : mode === 'forgot'
                    ? 'Send Password Reset Email'
                    : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* Sign Out Button if active */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[12px]">
            <span className="text-[#64748B]">
              {isSupabaseConnected ? 'Connected to Supabase Auth' : 'Local Auth Simulation'}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="text-[#DC2626] hover:underline font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
