import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { authService } from '../services/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { 
  Loader2, Save, Building, Clock, DollarSign, Settings as SettingsIcon, 
  Mail, Link as LinkIcon, Users, CreditCard, User as UserIcon, Trash2, 
  X, ChevronRight, Check, LogOut, Zap, FileText 
} from 'lucide-react';
import type { TenantSettings, IntegrationsResponse, SmtpConfig, SendgridSetupProgress } from '../types/api';

import { getErrorMessage } from '../utils/error-utils';
import { useAuth } from '../contexts/AuthContext';
import { TeamSettings } from './Settings/TeamSettings';
import { IntegrationsTab } from './Settings/IntegrationsTab';
import { MfaSetup } from './Settings/MfaSetup';
import { SendGridWizardStep1 } from './Settings/SendGridWizardStep1';
import { SendGridWizardStep2 } from './Settings/SendGridWizardStep2';
import { SendGridWizardStep3 } from './Settings/SendGridWizardStep3';

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'general' | 'autopilot' | 'retention' | 'email' | 'integrations' | 'team' | 'billing'
  >('profile');

  return (
    <div className="w-full text-[#f7f8f8] space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#1e2025] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">Settings</h1>
        <p className="text-[#8a8f98] text-xs mt-1">
          Manage your organization profile, autopilot automation rules, email delivery, data retention, and team preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-[#13161c]/40 border border-[#1e2025]/80 rounded-2xl p-2 space-y-1 flex-shrink-0">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon className="w-4 h-4 mr-2.5 text-[#5e6ad2]" />} 
            label="Profile & Security" 
          />
          {user?.role === 'admin' && (
            <>
              <TabButton 
                active={activeTab === 'general'} 
                onClick={() => setActiveTab('general')} 
                icon={<Building className="w-4 h-4 mr-2.5 text-[#5e6ad2]" />} 
                label="General" 
              />
              <TabButton 
                active={activeTab === 'autopilot'} 
                onClick={() => setActiveTab('autopilot')} 
                icon={<Zap className="w-4 h-4 mr-2.5 text-amber-400" />} 
                label="Autopilot & Rules" 
              />
              <TabButton 
                active={activeTab === 'retention'} 
                onClick={() => setActiveTab('retention')} 
                icon={<Trash2 className="w-4 h-4 mr-2.5 text-rose-400" />} 
                label="Data Retention" 
              />
              <TabButton 
                active={activeTab === 'email'} 
                onClick={() => setActiveTab('email')} 
                icon={<Mail className="w-4 h-4 mr-2.5 text-[#5e6ad2]" />} 
                label="Email Config" 
              />
              <TabButton 
                active={activeTab === 'integrations'} 
                onClick={() => setActiveTab('integrations')} 
                icon={<LinkIcon className="w-4 h-4 mr-2.5 text-emerald-400" />} 
                label="Integrations" 
              />
            </>
          )}
          <TabButton 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')} 
            icon={<Users className="w-4 h-4 mr-2.5 text-[#5e6ad2]" />} 
            label="Team & Access" 
          />
          {user?.role === 'admin' && (
            <TabButton 
              active={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')} 
              icon={<CreditCard className="w-4 h-4 mr-2.5 text-cyan-400" />} 
              label="Billing & Plans" 
            />
          )}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'general' && user?.role === 'admin' && <GeneralSettings />}
          {activeTab === 'autopilot' && user?.role === 'admin' && <AutopilotSettings />}
          {activeTab === 'retention' && user?.role === 'admin' && <RetentionSettings />}
          {activeTab === 'email' && user?.role === 'admin' && <EmailSettings />}
          {activeTab === 'integrations' && user?.role === 'admin' && <IntegrationsTab />}
          {activeTab === 'team' && <TeamSettings />}
          {activeTab === 'billing' && user?.role === 'admin' && (
            <PlaceholderTab 
              title="Billing & Subscription Plans" 
              description="Manage your subscription tier, view invoices, and update default billing payment methods." 
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
        active 
          ? 'bg-[#5e6ad2] text-white font-semibold shadow-none' 
          : 'text-[#8a8f98] hover:bg-[#1e2025]/60 hover:text-[#f7f8f8]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ============================================================================
 * 1. GENERAL / ORGANIZATION SETTINGS
 * ============================================================================ */
function GeneralSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<TenantSettings>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      Promise.resolve().then(() => {
        setFormData(settings);
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<TenantSettings>) => settingsService.updateSettings(newSettings),
    onMutate: () => setSaveStatus('saving'),
    onError: () => {
      setSaveStatus('idle');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  useEffect(() => {
    if (!settings) return;

    const hasChanges = Object.keys(formData).some(
      key => formData[key as keyof TenantSettings] !== settings[key as keyof TenantSettings]
    );

    if (hasChanges) {
      const timer = setTimeout(() => {
        mutation.mutate(formData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, settings, mutation]);

  const handleChange = (field: keyof TenantSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#1e2025]/80 bg-[#13161c]/40 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#f7f8f8]">General Settings</CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">Manage your organization profile, timezone, and payment link details.</CardDescription>
            </div>
            <div className="flex items-center h-8">
              {saveStatus === 'saving' && <span className="text-xs text-[#8a8f98] flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#5e6ad2]" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-xs text-[#27a644] flex items-center"><Save className="w-3.5 h-3.5 mr-1.5" /> Saved</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
              <Building className="w-3.5 h-3.5 mr-1.5 text-[#5e6ad2]" />
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-[#5e6ad2]" />
              Timezone
            </label>
            <select
              value={formData.timezone || 'UTC'}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none cursor-pointer"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Central Europe (CET)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Asia/Singapore">Singapore (SGT)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
            <p className="text-[11px] text-[#8a8f98]">Used for scheduled autopilot execution and reporting timelines.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
              Default Currency
            </label>
            <select
              value="USD"
              disabled
              className="w-full p-2.5 border border-[#1e2025] bg-[#1e2025]/40 text-[#8a8f98] rounded-xl text-xs cursor-not-allowed"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
            <p className="text-[11px] text-[#8a8f98]">Multi-currency support is enabled per invoice.</p>
          </div>

          <div className="pt-4 border-t border-[#1e2025] space-y-4">
            <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
              <LinkIcon className="w-3.5 h-3.5 mr-1.5 text-[#5e6ad2]" />
              Payment & Branding Links
            </h4>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8a8f98]">Default Payment Link URL</label>
              <input
                type="text"
                value={formData.paymentLink || ''}
                onChange={(e) => handleChange('paymentLink', e.target.value)}
                className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                placeholder="https://razorpay.me/@yourcompany"
              />
              <p className="text-[11px] text-[#8a8f98]">Used in collection email buttons when custom payment links are not attached to invoices.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8a8f98]">Bank Details for Emails &amp; Invoices</label>
              <textarea
                rows={3}
                value={formData.bankDetails || ''}
                onChange={(e) => handleChange('bankDetails', e.target.value)}
                className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                placeholder="Bank Name: HDFC Bank&#10;Account No: 502000XXXXXX&#10;IFSC: HDFC0001234"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
 * 2. AUTOPILOT & RULES SETTINGS
 * ============================================================================ */
function AutopilotSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<TenantSettings>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      Promise.resolve().then(() => {
        setFormData(settings);
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<TenantSettings>) => settingsService.updateSettings(newSettings),
    onMutate: () => setSaveStatus('saving'),
    onError: () => {
      setSaveStatus('idle');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  useEffect(() => {
    if (!settings) return;

    const hasChanges = Object.keys(formData).some(
      key => formData[key as keyof TenantSettings] !== settings[key as keyof TenantSettings]
    );

    if (hasChanges) {
      const timer = setTimeout(() => {
        mutation.mutate(formData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, settings, mutation]);

  const handleChange = (field: keyof TenantSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#1e2025]/80 bg-[#13161c]/40 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-400" />
                Autopilot &amp; Execution Rules
              </CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">Configure execution schedules, safety limits, and payment link enforcement rules.</CardDescription>
            </div>
            <div className="flex items-center h-8">
              {saveStatus === 'saving' && <span className="text-xs text-[#8a8f98] flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#5e6ad2]" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-xs text-[#27a644] flex items-center"><Save className="w-3.5 h-3.5 mr-1.5" /> Saved</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Daily Execution Schedule (Hour)
            </label>
            <select
              value={formData.scheduleHour ?? 9}
              onChange={(e) => handleChange('scheduleHour', Number(e.target.value))}
              className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00 {i < 12 ? 'AM' : 'PM'}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#8a8f98]">Autopilot runs automatically every day at this hour in your configured timezone.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Idempotency Deduplication Window (Hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={formData.idempotencyWindowHours ?? 24}
              onChange={(e) => handleChange('idempotencyWindowHours', Number(e.target.value))}
              className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
            />
            <p className="text-[11px] text-[#8a8f98]">Prevents sending duplicate follow-up communications to the same invoice within this window.</p>
          </div>

          <div className="pt-4 border-t border-[#1e2025]">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#f7f8f8]">Payment Link Enforcement Warning</p>
                <p className="text-[11px] text-[#8a8f98] mt-0.5 leading-relaxed">
                  When active, Autopilot warns you before queueing emails for invoices that do not have a payment link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const val = !formData.skipPaymentWarning;
                  handleChange('skipPaymentWarning', val);
                }}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  formData.skipPaymentWarning
                    ? 'bg-[#1e2025]/40 text-[#8a8f98] border-[#1e2025] hover:bg-[#1e2025]'
                    : 'bg-[#27a644]/10 text-[#27a644] border-[#27a644]/30 font-semibold'
                }`}
              >
                {formData.skipPaymentWarning ? 'Warning Disabled' : '✓ Warning Active'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
 * 3. DATA RETENTION SETTINGS
 * ============================================================================ */
function RetentionSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<TenantSettings>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      Promise.resolve().then(() => {
        setFormData(settings);
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<TenantSettings>) => settingsService.updateSettings(newSettings),
    onMutate: () => setSaveStatus('saving'),
    onError: () => {
      setSaveStatus('idle');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const localError = formData.autoPurgeEnabled && formData.autoPurgeDays !== undefined && formData.autoPurgeDays < 7
    ? "Auto-purge retention period must be at least 7 days"
    : null;

  useEffect(() => {
    if (!settings || localError) return;

    const hasChanges = Object.keys(formData).some(
      key => formData[key as keyof TenantSettings] !== settings[key as keyof TenantSettings]
    );

    if (hasChanges) {
      const timer = setTimeout(() => {
        mutation.mutate(formData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, settings, localError, mutation]);

  const handleChange = (field: keyof TenantSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#1e2025]/80 bg-[#13161c]/40 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
                <Trash2 className="w-4 h-4 mr-2 text-rose-400" />
                Data Retention &amp; Cleanup Policies
              </CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">Configure automatic cleanup for trashed invoices and archived dispute records.</CardDescription>
            </div>
            <div className="flex items-center h-8">
              {saveStatus === 'saving' && <span className="text-xs text-[#8a8f98] flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#5e6ad2]" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-xs text-[#27a644] flex items-center"><Save className="w-3.5 h-3.5 mr-1.5" /> Saved</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Trash Retention (Auto-Purge) */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#f7f8f8]">Automatic Invoice Trash Purge</p>
                <p className="text-[11px] text-[#8a8f98] mt-0.5 leading-relaxed">
                  Permanently delete invoices that have remained in the Trash past the retention threshold.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleChange('autoPurgeEnabled', !formData.autoPurgeEnabled);
                }}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  formData.autoPurgeEnabled
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold'
                    : 'bg-[#1e2025]/40 text-[#8a8f98] border-[#1e2025] hover:bg-[#1e2025]'
                }`}
              >
                {formData.autoPurgeEnabled ? '✓ Auto-Purge Enabled' : 'Auto-Purge Disabled'}
              </button>
            </div>

            {formData.autoPurgeEnabled && (
              <div className="space-y-1.5 max-w-xs pt-1">
                <label className="text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider">
                  Invoice Retention Period (Days)
                </label>
                <input
                  type="number"
                  min="7"
                  value={formData.autoPurgeDays || 30}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleChange('autoPurgeDays', isNaN(val) ? 7 : val);
                  }}
                  className={`w-full p-2.5 border rounded-xl text-xs font-medium bg-[#0f1011] text-[#f7f8f8] ${
                    localError ? 'border-red-900/50 text-red-400' : 'border-[#1e2025] focus:border-[#5e6ad2]'
                  }`}
                />
                {localError ? (
                  <p className="text-[11px] text-red-400 font-medium">{localError}</p>
                ) : (
                  <p className="text-[10px] text-[#8a8f98]">Minimum retention period is 7 days.</p>
                )}
              </div>
            )}
          </div>

          {/* Archived Disputes Purge */}
          <div className="pt-5 border-t border-[#1e2025] space-y-2">
            <p className="text-xs font-bold text-[#f7f8f8]">Archived Disputes Cleanup</p>
            <div className="space-y-1.5 max-w-xs pt-1">
              <label className="text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider">
                Auto-delete Archived Disputes (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.autoPurgeArchivedDisputesDays ?? 30}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleChange('autoPurgeArchivedDisputesDays', isNaN(val) ? 30 : val);
                }}
                className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] text-[#f7f8f8] rounded-xl text-xs font-medium focus:border-[#5e6ad2]"
              />
              <p className="text-[10px] text-[#8a8f98]">Archived disputes older than this number of days will be purged automatically.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
 * 4. EMAIL DELIVERY CONFIGURATION
 * ============================================================================ */
function EmailSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [smtpModalOpen, setSmtpModalOpen] = useState(false);
  const [sendgridModalOpen, setSendgridModalOpen] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  const { data: integrations, refetch: refetchIntegrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => settingsService.getIntegrations(),
    retry: false,
  });

  const disconnectSmtpMutation = useMutation({
    mutationFn: () => settingsService.disconnectSmtp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const disconnectSendgridMutation = useMutation({
    mutationFn: () => settingsService.disconnectSendgrid(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['sendgrid-health'] });
    },
  });

  const activateProviderMutation = useMutation({
    mutationFn: (provider: 'sendgrid' | 'smtp') => settingsService.activateProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  const smtp = integrations?.smtp;
  const sendgrid = integrations?.sendgrid;
  const sendgridProgress = integrations?.sendgridProgress;
  const smtpProgress = integrations?.smtpProgress;

  return (
    <div className="space-y-6">
      <Card className="border border-[#1e2025]/80 bg-[#13161c]/40 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#f7f8f8]">Email Delivery Providers</CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">Configure outbound email delivery providers (SendGrid API or Custom SMTP).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Default Provider Selector */}
          <div className="space-y-2 pb-4 border-b border-[#1e2025]">
            <label className="text-xs font-semibold text-[#f7f8f8]">Active Default Email Provider</label>
            <p className="text-[11px] text-[#8a8f98]">Select which provider should be used for automated collection emails.</p>
            <div className="flex items-center space-x-6 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultProvider"
                  value="sendgrid"
                  checked={sendgridProgress?.isActive || settings?.defaultEmailProvider === 'sendgrid'}
                  onChange={() => activateProviderMutation.mutate('sendgrid')}
                  disabled={sendgridProgress?.overallStatus !== 'active' && (!sendgrid?.isConfigured || sendgrid?.lastValidationResult !== 'valid')}
                  className="text-[#5e6ad2] focus:ring-[#5e69d1]"
                />
                <span className="text-xs font-medium text-[#f7f8f8]">SendGrid API</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultProvider"
                  value="smtp"
                  checked={smtpProgress?.isActive || settings?.defaultEmailProvider === 'smtp'}
                  onChange={() => activateProviderMutation.mutate('smtp')}
                  disabled={smtpProgress?.overallStatus !== 'active' && (!smtp?.isConfigured || smtp?.lastValidationResult !== 'valid')}
                  className="text-[#5e6ad2] focus:ring-[#5e69d1]"
                />
                <span className="text-xs font-medium text-[#f7f8f8]">Custom SMTP</span>
              </label>
            </div>
          </div>

          {/* Custom SMTP Provider */}
          <div className="p-4 border border-[#1e2025] rounded-xl bg-[#0f1011] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${smtpProgress?.isActive ? 'bg-[#27a644]' : smtpProgress?.overallStatus === 'partially_configured' ? 'bg-amber-400' : smtp?.isConfigured ? (smtp.lastValidationResult === 'valid' ? 'bg-[#27a644]' : 'bg-red-400') : 'bg-[#3e3e44]'}`} />
              <div>
                <h4 className="text-xs font-semibold text-[#f7f8f8] flex items-center">
                  Custom SMTP
                  {smtpProgress?.isActive && (
                    <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-[#27a644] bg-[#27a644]/10 px-2 py-0.5 rounded-full border border-[#27a644]/20">Active ✓</span>
                  )}
                  {!smtpProgress?.isActive && smtpProgress?.overallStatus === 'active' && (
                    <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-[#5e6ad2] bg-[#5e6ad2]/10 px-2 py-0.5 rounded-full border border-[#5e6ad2]/20">Ready to Activate</span>
                  )}
                </h4>
                <p className="text-[11px] text-[#8a8f98] mt-0.5">
                  {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured
                    ? `${smtpProgress?.step1ConnectionDetails.host || smtp?.displayHost}:${smtpProgress?.step1ConnectionDetails.port || smtp?.port}`
                    : 'Not configured — connect your outbound SMTP mail server.'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSmtpModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#13161c] border border-[#1e2025] hover:bg-[#1e2025] rounded-xl transition-colors cursor-pointer"
              >
                {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured ? 'Configure Settings' : 'Set Up SMTP'}
              </button>
              {(smtpProgress?.overallStatus !== 'not_configured' || smtp?.isConfigured) && (
                <button
                  type="button"
                  onClick={() => disconnectSmtpMutation.mutate()}
                  className="px-3.5 py-1.5 text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* SendGrid API Provider */}
          {(() => {
            const isSendgridFullyActive =
              !!sendgrid?.isConfigured &&
              sendgrid.lastValidationResult === 'valid' &&
              !!sendgrid?.isSenderConfigured &&
              !!integrations?.inboundParse?.isVerified;

            const isSendgridPartial =
              !!sendgrid?.isConfigured && !isSendgridFullyActive;

            const nextStep = !sendgrid?.isSenderConfigured ? 2 : 3;

            return (
              <div className="p-4 border border-[#1e2025] rounded-xl bg-[#0f1011] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      isSendgridFullyActive
                        ? 'bg-[#27a644]'
                        : sendgrid?.isConfigured && sendgrid.lastValidationResult !== 'valid'
                        ? 'bg-red-400'
                        : isSendgridPartial
                        ? 'bg-amber-400'
                        : 'bg-[#3e3e44]'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-[#f7f8f8] flex items-center">
                      SendGrid API
                      {isSendgridFullyActive && (
                        <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-[#27a644] bg-[#27a644]/10 px-2 py-0.5 rounded-full border border-[#27a644]/20">
                          Active ✓
                        </span>
                      )}
                      {isSendgridPartial && (
                        <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Incomplete Setup (Step {nextStep} of 3)
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#8a8f98] mt-0.5">
                      {isSendgridFullyActive
                        ? `Connected (${sendgrid?.senderEmail || settings?.senderEmail || 'Sender set'})`
                        : 'Connect your SendGrid API key and sender identity for automated email delivery.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSendgridModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#13161c] border border-[#1e2025] hover:bg-[#1e2025] rounded-xl transition-colors cursor-pointer"
                  >
                    {isSendgridFullyActive
                      ? 'Configure Settings'
                      : isSendgridPartial
                      ? `Continue Setup (Step ${nextStep})`
                      : 'Set Up SendGrid'}
                  </button>
                  {sendgrid?.isConfigured && (
                    <button
                      type="button"
                      onClick={() => disconnectSendgridMutation.mutate()}
                      className="px-3.5 py-1.5 text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Setup Modals */}
      {smtpModalOpen && (
        <SmtpSetupModal
          isOpen={smtpModalOpen}
          onClose={() => setSmtpModalOpen(false)}
          integration={smtp}
          settings={settings}
          userEmail={user?.email || ''}
        />
      )}

      {sendgridModalOpen && (
        <SendGridSetupModal
          isOpen={sendgridModalOpen}
          onClose={() => setSendgridModalOpen(false)}
          sendgridProgress={sendgridProgress}
          refetch={refetchIntegrations}
        />
      )}
    </div>
  );
}

/* ============================================================================
 * 5. PROFILE & USER SECURITY SETTINGS
 * ============================================================================ */
function ProfileSettings() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const mutation = useMutation({
    mutationFn: (newName: string) => authService.updateProfile(newName),
    onMutate: () => {
      setSaveStatus('saving');
      setErrorMessage('');
    },
    onSuccess: (updatedUser) => {
      setSaveStatus('saved');
      updateUser(updatedUser);
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: (err: unknown) => {
      setSaveStatus('error');
      setErrorMessage(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }
    mutation.mutate(name.trim());
  };

  return (
    <div className="space-y-6">
      <Card className="border border-[#1e2025]/80 bg-[#13161c]/40 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#f7f8f8]">Profile Settings</CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">Manage your personal user profile and display details.</CardDescription>
            </div>
            <div className="flex items-center h-8">
              {saveStatus === 'saving' && <span className="text-xs text-[#8a8f98] flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#5e6ad2]" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-xs text-[#27a644] flex items-center"><Save className="w-3.5 h-3.5 mr-1.5" /> Saved</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8a8f98]">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-2.5 border border-[#1e2025] rounded-xl bg-[#1e2025]/40 text-[#8a8f98] text-xs cursor-not-allowed"
              />
              <p className="text-[10px] text-[#8a8f98]">Your login email is managed by your tenant administrator.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8a8f98]">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2] focus:outline-none"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveStatus === 'saving' || name.trim() === user?.name}
                className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-40 flex items-center justify-center cursor-pointer"
              >
                {saveStatus === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                Save Changes
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <MfaSetup
        mfaEnabled={user?.mfaEnabled ?? false}
        onMfaChange={(enabled) => {
          if (user) {
            updateUser({ ...user, mfaEnabled: enabled });
          }
        }}
      />

      <Card className="border border-[#1e2025]/80 bg-[#13161c]/40 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-[#f7f8f8]">Account Session</CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">Manage your current active user session.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-bold text-[#f7f8f8]">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#8a8f98]">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 rounded-xl text-xs font-medium transition-colors flex items-center justify-center cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Log Out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed border border-[#1e2025] bg-[#13161c]/40 rounded-2xl">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <SettingsIcon className="w-10 h-10 text-[#3e3e44] mb-3" />
        <h3 className="text-base font-semibold text-[#f7f8f8]">{title}</h3>
        <p className="text-[#8a8f98] text-xs mt-1 max-w-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

interface SmtpSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationsResponse['smtp'] | undefined;
  settings: TenantSettings | undefined;
  userEmail: string;
}

function SmtpSetupModal({ isOpen, onClose, integration, settings, userEmail }: SmtpSetupModalProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testEmailInput, setTestEmailInput] = useState(userEmail || '');

  const [formData, setFormData] = useState({
    senderName: settings?.senderName || 'Finance Team',
    host: integration?.displayHost || '',
    port: integration?.port || 587,
    securityMode: integration?.securityMode || 'starttls',
    username: settings?.senderEmail || userEmail || '',
    password: '',
  });

  const saveMutation = useMutation({
    mutationFn: (config: SmtpConfig & { senderName: string }) => settingsService.saveSmtpConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setErrorMsg('');
      onClose();
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: (to: string) => settingsService.testSmtpEmail(to),
    onMutate: () => setTestEmailStatus('sending'),
    onSuccess: () => {
      setTestEmailStatus('success');
      setTimeout(() => setTestEmailStatus('idle'), 5000);
    },
    onError: () => {
      setTestEmailStatus('error');
    },
  });

  const handleSave = () => {
    if (!formData.senderName.trim()) {
      setErrorMsg('Sender Name is required.');
      return;
    }
    if (!formData.host.trim() || !formData.port || !formData.username.trim()) {
      setErrorMsg('Please fill in all required SMTP fields.');
      return;
    }
    saveMutation.mutate({
      senderName: formData.senderName.trim(),
      host: formData.host.trim(),
      port: Number(formData.port),
      securityMode: formData.securityMode,
      username: formData.username.trim(),
      password: formData.password || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010102]/80 backdrop-blur-sm p-4">
      <div className="bg-[#13161c] rounded-2xl max-w-xl w-full border border-[#1e2025] overflow-hidden flex flex-col max-h-[90vh] text-[#f7f8f8]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2025] bg-[#0f1011]">
          <div>
            <h3 className="text-sm font-bold text-[#f7f8f8]">Custom SMTP Configuration</h3>
            <p className="text-[11px] text-[#8a8f98]">Configure your outbound email server credentials.</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8a8f98] hover:text-[#f7f8f8] rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8a8f98]">Sender Name</label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2]"
              placeholder="e.g. Acme Billing"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8a8f98]">SMTP Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2]"
                placeholder="smtp.example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8a8f98]">Port</label>
                <select
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                  className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2]"
                >
                  <option value="587">587 (STARTTLS)</option>
                  <option value="465">465 (Implicit TLS)</option>
                  <option value="2525">2525 (Alternative)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8a8f98]">Security</label>
                <select
                  value={formData.securityMode}
                  onChange={(e) => setFormData({ ...formData, securityMode: e.target.value })}
                  className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2]"
                >
                  <option value="starttls">STARTTLS</option>
                  <option value="implicit_tls">Implicit TLS</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8a8f98]">Username (Sender Email)</label>
              <input
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2]"
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8a8f98]">
                Password {integration?.isConfigured && '(Leave blank to keep)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2]"
                placeholder={integration?.isConfigured ? '********' : 'Your SMTP password'}
              />
            </div>
          </div>

          {integration?.isConfigured && (
            <div className="pt-4 border-t border-[#1e2025]">
              <h4 className="text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider mb-2">Send Test Email</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  className="flex-1 p-2.5 border border-[#1e2025] bg-[#0f1011] rounded-xl text-xs text-[#f7f8f8] focus:border-[#5e6ad2]"
                  placeholder="recipient@example.com"
                />
                <button
                  type="button"
                  onClick={() => testEmailInput && testEmailMutation.mutate(testEmailInput)}
                  disabled={testEmailStatus === 'sending' || !testEmailInput}
                  className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-xl text-xs font-medium transition-colors flex items-center disabled:opacity-40 cursor-pointer"
                >
                  {testEmailStatus === 'sending' ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                  ) : testEmailStatus === 'success' ? (
                    <><span className="text-[#27a644] font-bold mr-1.5">✓</span> Sent</>
                  ) : testEmailStatus === 'error' ? (
                    <><span className="text-red-400 font-bold mr-1.5">✕</span> Failed</>
                  ) : (
                    <><Mail className="w-3.5 h-3.5 mr-1.5" /> Send Test</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e2025] bg-[#0f1011]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#f7f8f8] bg-[#13161c] border border-[#1e2025] hover:bg-[#1e2025] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-40 flex items-center cursor-pointer"
          >
            {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            {saveMutation.isPending ? 'Verifying & Saving...' : 'Verify & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SendGridSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sendgridProgress?: SendgridSetupProgress;
  refetch: () => Promise<unknown>;
}

function SendGridSetupModal({ isOpen, onClose, sendgridProgress, refetch }: SendGridSetupModalProps) {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const hasInitializedStep = useRef(false);
  useEffect(() => {
    if (isOpen && sendgridProgress && !hasInitializedStep.current) {
      const step = !sendgridProgress.step1ApiKey.isDone
        ? 1
        : !sendgridProgress.step2SenderAndMode.isDone
        ? 2
        : 3;
      setWizardStep(step);
      hasInitializedStep.current = true;
    }
    if (!isOpen) {
      hasInitializedStep.current = false;
    }
  }, [isOpen, sendgridProgress]);

  if (!isOpen) return null;

  const goToStep = (step: 1 | 2 | 3) => {
    setShowExitConfirm(false);
    setWizardStep(step);
  };

  const handleAttemptClose = () => {
    const allDone = sendgridProgress?.overallStatus === 'active';
    if (allDone) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const isStep1Done = sendgridProgress?.step1ApiKey.isDone ?? false;
  const isStep2Done = sendgridProgress?.step2SenderAndMode.isDone ?? false;
  const isStep3Done = sendgridProgress?.step3InboundWebhook.isDone ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010102]/80 backdrop-blur-sm p-4">
      <div className="bg-[#13161c] rounded-2xl max-w-2xl w-full border border-[#1e2025] overflow-hidden flex flex-col max-h-[90vh] text-[#f7f8f8]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2025] bg-[#0f1011]">
          <div>
            <h3 className="text-sm font-bold text-[#f7f8f8]">SendGrid Integration Setup</h3>
            <p className="text-[11px] text-[#8a8f98]">
              Step {wizardStep} of 3 - Complete all 3 steps to activate outbound email &amp; inbound webhook.
            </p>
          </div>
          <button type="button" onClick={handleAttemptClose} className="p-1 text-[#8a8f98] hover:text-[#f7f8f8] rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step navigation bar */}
        <div className="px-6 py-3 bg-[#0f1011] border-b border-[#1e2025] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium">
            <button type="button" onClick={() => goToStep(1)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors cursor-pointer ${
                wizardStep === 1 ? 'bg-[#5e6ad2] text-white font-bold'
                  : isStep1Done ? 'bg-[#27a644]/10 text-[#27a644] hover:bg-[#27a644]/20 border border-[#27a644]/20'
                  : 'bg-[#1e2025] text-[#8a8f98]'
              }`}>
              <span>1. API Key</span>
              {isStep1Done && <Check className="w-3 h-3 text-[#27a644]" />}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-[#3e3e44]" />

            <button type="button" disabled={!isStep1Done} onClick={() => isStep1Done && goToStep(2)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors ${
                wizardStep === 2 ? 'bg-[#5e6ad2] text-white font-bold'
                  : isStep2Done ? 'bg-[#27a644]/10 text-[#27a644] hover:bg-[#27a644]/20 border border-[#27a644]/20'
                  : !isStep1Done ? 'bg-[#1e2025] text-[#8a8f98]/40 cursor-not-allowed'
                  : 'bg-[#1e2025] text-[#8a8f98] hover:bg-[#1e2025]/80 cursor-pointer'
              }`}>
              <span>2. Sender &amp; Mode</span>
              {isStep2Done && <Check className="w-3 h-3 text-[#27a644]" />}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-[#3e3e44]" />

            <button type="button" disabled={!isStep2Done} onClick={() => isStep2Done && goToStep(3)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors ${
                wizardStep === 3 ? 'bg-[#5e6ad2] text-white font-bold'
                  : isStep3Done ? 'bg-[#27a644]/10 text-[#27a644] hover:bg-[#27a644]/20 border border-[#27a644]/20'
                  : !isStep2Done ? 'bg-[#1e2025] text-[#8a8f98]/40 cursor-not-allowed'
                  : 'bg-[#1e2025] text-[#8a8f98] hover:bg-[#1e2025]/80 cursor-pointer'
              }`}>
              <span>3. Webhook</span>
              {isStep3Done && <Check className="w-3 h-3 text-[#27a644]" />}
            </button>
          </div>
          <span className="text-[11px] font-bold text-[#8a8f98]">Step {wizardStep} of 3</span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {showExitConfirm && (
            <div className="p-4 bg-amber-950/30 border border-amber-900/40 rounded-xl space-y-2">
              <p className="text-xs text-amber-300 font-semibold">
                SendGrid setup is incomplete. Exit before completing all 3 steps?
              </p>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setShowExitConfirm(false)}
                  className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium rounded-lg hover:bg-amber-500/30 transition-colors cursor-pointer">
                  Continue Setup
                </button>
                <button type="button" onClick={() => { setShowExitConfirm(false); onClose(); }}
                  className="px-3 py-1 bg-[#1e2025] text-[#8a8f98] border border-[#1e2025] text-xs font-medium rounded-lg hover:bg-[#1e2025]/80 transition-colors cursor-pointer">
                  Exit Anyway
                </button>
              </div>
            </div>
          )}

          {!sendgridProgress ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-[#1e2025] rounded w-1/2" />
              <div className="h-4 bg-[#1e2025] rounded w-full" />
              <div className="h-4 bg-[#1e2025] rounded w-3/4" />
              <div className="h-20 bg-[#1e2025] rounded w-full" />
              <div className="h-10 bg-[#1e2025] rounded w-1/3 ml-auto" />
            </div>
          ) : (
            <>
              {wizardStep === 1 && (
                <SendGridWizardStep1
                  progress={sendgridProgress}
                  refetch={refetch}
                  onNext={() => goToStep(2)}
                />
              )}
              {wizardStep === 2 && (
                <SendGridWizardStep2
                  progress={sendgridProgress}
                  refetch={refetch}
                  onNext={() => goToStep(3)}
                  onBack={() => goToStep(1)}
                />
              )}
              {wizardStep === 3 && (
                <SendGridWizardStep3
                  progress={sendgridProgress}
                  refetch={refetch}
                  onBack={() => goToStep(2)}
                  onComplete={onClose}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1e2025] bg-[#0f1011] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] font-medium text-[#8a8f98]">
            <span>Overall Progress:</span>
            <span className={isStep1Done ? 'text-[#27a644] font-bold' : 'text-amber-400 font-semibold'}>
              Step 1 {isStep1Done ? '(done)' : '(pending)'}
            </span>
            <span>|</span>
            <span className={isStep2Done ? 'text-[#27a644] font-bold' : 'text-amber-400 font-semibold'}>
              Step 2 {isStep2Done ? '(done)' : '(pending)'}
            </span>
            <span>|</span>
            <span className={isStep3Done ? 'text-[#27a644] font-bold' : 'text-amber-400 font-semibold'}>
              Step 3 {isStep3Done ? '(done)' : '(pending)'}
            </span>
          </div>
          <button type="button" onClick={handleAttemptClose}
            className="px-4 py-2 border border-[#1e2025] rounded-xl text-[#f7f8f8] bg-[#13161c] hover:bg-[#1e2025] text-xs font-medium transition-colors cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
