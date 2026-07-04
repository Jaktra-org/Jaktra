import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { authService } from '../services/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { 
  Loader2, Building, Clock, DollarSign, 
  Mail, Link as LinkIcon, Users, CreditCard, User as UserIcon, Trash2, 
  X, ChevronRight, Check, LogOut, Zap, ShieldCheck, HelpCircle, Copy, AlertTriangle, Eye, EyeOff
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
import { CustomSelect } from '../components/ui/CustomSelect';
import { MultiStepForm } from '../components/ui/multi-step-form';

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'general' | 'integrations' | 'customization' | 'team' | 'security' | 'billing' | 'support'
  >('general');

  return (
    <div className="w-full text-[#f7f8f8] space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#1e2025] pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#f7f8f8]">Settings</h1>
        <p className="text-[#8a8f98] text-xs mt-1">
          Manage your organization profile, email &amp; payment integrations, automation rules, security, and support.
        </p>
      </div>

      <div className="border border-[#23252a] bg-[#0f1011] rounded-2xl flex flex-col md:flex-row overflow-hidden min-h-[550px]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-[#23252a] p-3 space-y-1 flex-shrink-0 bg-[#0f1011]">
          <TabButton 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')} 
            icon={<Building className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
            label="General" 
          />
          {user?.role === 'admin' && (
            <>
              <TabButton 
                active={activeTab === 'integrations'} 
                onClick={() => setActiveTab('integrations')} 
                icon={<LinkIcon className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
                label="Integrations" 
              />
              <TabButton 
                active={activeTab === 'customization'} 
                onClick={() => setActiveTab('customization')} 
                icon={<Zap className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
                label="Preferences & Automation" 
              />
            </>
          )}
          <TabButton 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')} 
            icon={<Users className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
            label="Team & Access" 
          />
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
            icon={<ShieldCheck className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
            label="Profile & Security" 
          />
          {user?.role === 'admin' && (
            <TabButton 
              active={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')} 
              icon={<CreditCard className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
              label="Billing & Plans" 
            />
          )}
          <TabButton 
            active={activeTab === 'support'} 
            onClick={() => setActiveTab('support')} 
            icon={<HelpCircle className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
            label="Support" 
          />
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 w-full p-6 min-w-0 overflow-y-auto">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'integrations' && user?.role === 'admin' && <IntegrationsSection />}
          {activeTab === 'customization' && user?.role === 'admin' && <CustomizationSettings />}
          {activeTab === 'team' && <TeamSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'billing' && user?.role === 'admin' && <BillingSection />}
          {activeTab === 'support' && <SupportSection />}
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
      className={`w-full flex items-center px-3.5 py-2.5 text-xs rounded-xl transition-all cursor-pointer ${
        active 
          ? 'bg-[#18191a] text-[#f7f8f8] border border-[#34343a] font-bold shadow-xs' 
          : 'text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] border border-transparent font-medium'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ============================================================================
 * 1. GENERAL SETTINGS (Email, Display Name, Company Name, Timezone)
 * ============================================================================ */
function GeneralSettings() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  
  // Profile Display Name State
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [profileSaveStatus, setProfileSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profileError, setProfileError] = useState('');

  // Tenant General Settings State (Company Name & Timezone)
  const [formData, setFormData] = useState<Partial<TenantSettings>>({});
  const [tenantSaveStatus, setTenantSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      queueMicrotask(() => {
        setFormData(settings);
      });
    }
  }, [settings]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: (newName: string) => authService.updateProfile(newName),
    onMutate: () => {
      setProfileSaveStatus('saving');
      setProfileError('');
    },
    onSuccess: (updatedUser) => {
      setProfileSaveStatus('saved');
      updateUser(updatedUser);
      setTimeout(() => setProfileSaveStatus('idle'), 2000);
    },
    onError: (err: unknown) => {
      setProfileSaveStatus('error');
      setProfileError(getErrorMessage(err));
    },
  });

  // Tenant settings auto-save mutation
  const tenantMutation = useMutation({
    mutationFn: (newSettings: Partial<TenantSettings>) => settingsService.updateSettings(newSettings),
    onMutate: () => setTenantSaveStatus('saving'),
    onError: () => {
      setTenantSaveStatus('idle');
    },
    onSuccess: () => {
      setTenantSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setTenantSaveStatus('idle'), 2000);
    },
  });

  const isSaving = profileSaveStatus === 'saving' || tenantSaveStatus === 'saving';

  const handleTenantChange = (field: keyof TenantSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCombinedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileError('Display name cannot be empty.');
      return;
    }
    if (displayName.trim() !== user?.name) {
      profileMutation.mutate(displayName.trim());
    }
    tenantMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#8a8f98]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleCombinedSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
          <Mail className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
          Email Address
        </label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full p-2.5 border border-[#23252a] rounded-xl bg-[#010102]/60 text-[#8a8f98] text-xs cursor-not-allowed"
        />
      </div>

      {/* 2x2 Grid: Name & Company Name, Timezone & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1 Left: Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
            <UserIcon className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none"
            placeholder="e.g. John Doe"
            required
          />
        </div>

        {/* Row 1 Right: Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
            <Building className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => handleTenantChange('companyName', e.target.value)}
            className="w-full p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none"
            placeholder="e.g. Acme Corp"
          />
        </div>

        {/* Row 2 Left: Timezone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
            Timezone
          </label>
          <CustomSelect
            value={formData.timezone || 'UTC'}
            onChange={(val) => handleTenantChange('timezone', val)}
            options={[
              { label: 'UTC', value: 'UTC' },
              { label: 'Eastern Time (ET)', value: 'America/New_York' },
              { label: 'Central Time (CT)', value: 'America/Chicago' },
              { label: 'Mountain Time (MT)', value: 'America/Denver' },
              { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
              { label: 'London (GMT)', value: 'Europe/London' },
              { label: 'Central Europe (CET)', value: 'Europe/Paris' },
              { label: 'Dubai (GST)', value: 'Asia/Dubai' },
              { label: 'India (IST)', value: 'Asia/Kolkata' },
              { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
              { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
            ]}
          />
        </div>

        {/* Row 2 Right: Currency */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8a8f98] flex items-center">
            <DollarSign className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
            Currency
          </label>
          <CustomSelect
            value={formData.currency || 'USD'}
            onChange={(val) => handleTenantChange('currency', val)}
            options={[
              { label: 'USD ($)', value: 'USD' },
              { label: 'EUR (€)', value: 'EUR' },
              { label: 'GBP (£)', value: 'GBP' },
              { label: 'INR (₹)', value: 'INR' },
              { label: 'CAD ($)', value: 'CAD' },
              { label: 'AUD ($)', value: 'AUD' },
            ]}
          />
        </div>
      </div>

      {profileError && <p className="text-xs text-red-400 font-medium">{profileError}</p>}

      {/* Combined Save Option for All 4 Fields */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center h-8">
          {isSaving && (
            <span className="text-xs text-[#8a8f98] flex items-center"><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#8a8f98]" /> Saving...</span>
          )}
          {(tenantSaveStatus === 'saved' || profileSaveStatus === 'saved') && (
            <span className="text-xs text-[#27a644] flex items-center"><Check className="w-3.5 h-3.5 mr-1.5" /> Saved</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-xs"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </form>
  );
}

/* ============================================================================
 * 2. INTEGRATIONS SECTION (Payment Gateways & Email Providers)
 * ============================================================================ */
function IntegrationsSection() {
  const [openSection, setOpenSection] = useState<'payment' | 'email' | null>(null);

  return (
    <div className="space-y-4 text-[#f7f8f8]">
      {/* Payment Integration Category */}
      <div className="border border-[#23252a] rounded-2xl bg-[#010102] overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 'payment' ? null : 'payment')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#141516] transition-all cursor-pointer text-left select-none"
        >
          <div>
            <h3 className="text-sm font-bold text-[#f7f8f8] flex items-center">
              <CreditCard className="w-4 h-4 mr-2.5 text-[#8a8f98]" />
              Payment Integration
            </h3>
            <p className="text-xs text-[#8a8f98] mt-0.5">
              Connect payment providers to automatically generate payment links and reconcile payments.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#8a8f98] flex-shrink-0 ml-4">
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openSection === 'payment' ? 'rotate-90 text-[#f7f8f8]' : ''}`} />
          </div>
        </button>

        {openSection === 'payment' && (
          <div className="p-5 border-t border-[#23252a] bg-[#0f1011]">
            <IntegrationsTab />
          </div>
        )}
      </div>

      {/* Email Integration Category */}
      <div className="border border-[#23252a] rounded-2xl bg-[#010102] overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenSection(openSection === 'email' ? null : 'email')}
          className="w-full flex items-center justify-between p-4 hover:bg-[#141516] transition-all cursor-pointer text-left select-none"
        >
          <div>
            <h3 className="text-sm font-bold text-[#f7f8f8] flex items-center">
              <Mail className="w-4 h-4 mr-2.5 text-[#8a8f98]" />
              Email Integration
            </h3>
            <p className="text-xs text-[#8a8f98] mt-0.5">
              Connect SendGrid API or custom outbound SMTP server for automated collection emails.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[#8a8f98] flex-shrink-0 ml-4">
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openSection === 'email' ? 'rotate-90 text-[#f7f8f8]' : ''}`} />
          </div>
        </button>

        {openSection === 'email' && (
          <div className="p-5 border-t border-[#23252a] bg-[#0f1011]">
            <EmailSettings />
          </div>
        )}
      </div>
    </div>
  );
}

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
        <Loader2 className="w-6 h-6 animate-spin text-[#8a8f98]" />
      </div>
    );
  }

  const smtp = integrations?.smtp;
  const sendgrid = integrations?.sendgrid;
  const sendgridProgress = integrations?.sendgridProgress;
  const smtpProgress = integrations?.smtpProgress;

  return (
    <div className="space-y-6 text-[#f7f8f8]">

      {/* Default Provider Selector */}
      <div className="border border-[#23252a] rounded-xl p-4 bg-[#010102] space-y-3">
        <label className="text-xs font-semibold text-[#f7f8f8]">Active Default Email Provider</label>
        <p className="text-[11px] text-[#8a8f98]">Select which provider should be used for automated collection emails.</p>
        <div className="flex items-center space-x-6 pt-1">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="radio"
              name="defaultProvider"
              value="sendgrid"
              checked={sendgridProgress?.isActive || settings?.defaultEmailProvider === 'sendgrid'}
              onChange={() => activateProviderMutation.mutate('sendgrid')}
              disabled={sendgridProgress?.overallStatus !== 'active' && (!sendgrid?.isConfigured || sendgrid?.lastValidationResult !== 'valid')}
              className="w-4 h-4 accent-[#f7f8f8] bg-[#0f1011] border-[#23252a] cursor-pointer"
            />
            <span className="text-xs font-medium text-[#f7f8f8]">SendGrid API</span>
          </label>
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="radio"
              name="defaultProvider"
              value="smtp"
              checked={smtpProgress?.isActive || settings?.defaultEmailProvider === 'smtp'}
              onChange={() => activateProviderMutation.mutate('smtp')}
              disabled={smtpProgress?.overallStatus !== 'active' && (!smtp?.isConfigured || smtp?.lastValidationResult !== 'valid')}
              className="w-4 h-4 accent-[#f7f8f8] bg-[#0f1011] border-[#23252a] cursor-pointer"
            />
            <span className="text-xs font-medium text-[#f7f8f8]">Custom SMTP</span>
          </label>
        </div>
      </div>

      {/* Configured Email Providers List */}
      <div className="space-y-4">
        {/* Custom SMTP Provider */}
        <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${smtpProgress?.isActive ? 'bg-[#27a644]' : smtpProgress?.overallStatus === 'partially_configured' ? 'bg-amber-400' : smtp?.isConfigured ? (smtp.lastValidationResult === 'valid' ? 'bg-[#27a644]' : 'bg-red-400') : 'bg-[#34343a]'}`} />
            <div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] flex items-center">
                Custom SMTP Server
                {smtpProgress?.isActive && (
                  <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-[#27a644] bg-[#27a644]/10 px-2 py-0.5 rounded-full border border-[#27a644]/20">Active</span>
                )}
                {!smtpProgress?.isActive && smtpProgress?.overallStatus === 'active' && (
                  <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-[#8a8f98] bg-[#8a8f98]/10 px-2 py-0.5 rounded-full border border-[#8a8f98]/20">Ready to Activate</span>
                )}
              </h4>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">
                {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured
                  ? `Connected to ${smtpProgress?.step1ConnectionDetails.host || smtp?.displayHost}:${smtpProgress?.step1ConnectionDetails.port || smtp?.port} • Outbound SMTP mail server active`
                  : 'Send automated collection emails through your organization\'s custom SMTP host and credentials.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSmtpModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-xl transition-all cursor-pointer"
            >
              {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured ? 'Configure Settings' : 'Set Up SMTP'}
            </button>
            {(smtpProgress?.overallStatus !== 'not_configured' || smtp?.isConfigured) && (
              <button
                type="button"
                onClick={() => disconnectSmtpMutation.mutate()}
                className="px-3.5 py-1.5 text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
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
            <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    isSendgridFullyActive
                      ? 'bg-[#27a644]'
                      : sendgrid?.isConfigured && sendgrid.lastValidationResult !== 'valid'
                      ? 'bg-red-400'
                      : isSendgridPartial
                      ? 'bg-amber-400'
                      : 'bg-[#34343a]'
                  }`}
                />
                <div>
                  <h4 className="text-xs font-semibold text-[#f7f8f8] flex items-center">
                    SendGrid API Integration
                    {isSendgridFullyActive && (
                      <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-[#27a644] bg-[#27a644]/10 px-2 py-0.5 rounded-full border border-[#27a644]/20">
                        Active
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
                      ? `Connected (${sendgrid?.senderEmail || settings?.senderEmail || 'Sender Configured'}) • High-speed API delivery & inbound webhook active`
                      : isSendgridPartial
                      ? `Setup in progress • Step ${nextStep} pending: ${nextStep === 2 ? 'Sender Identity & Mode' : 'Inbound Webhook Verification'}`
                      : 'High-speed API email delivery with bounce tracking, verified sender identity, and inbound reply parsing.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSendgridModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-xl transition-all cursor-pointer"
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
                    className="px-3.5 py-1.5 text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>

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
 * 3. PREFERENCES & AUTOMATION (Currency, Autopilot Rules, Safeguards, Data Retention)
 * ============================================================================ */
function CustomizationSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<TenantSettings>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      queueMicrotask(() => {
        setFormData(settings);
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<TenantSettings>) => settingsService.updateSettings(newSettings),
    onMutate: () => setSaveStatus('saving'),
    onError: (err: unknown) => {
      setSaveStatus('idle');
      setGeneralError(getErrorMessage(err));
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setGeneralError('');
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setSaveStatus('idle'), 2500);
    },
  });

  const handleChange = (field: keyof TenantSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (generalError) setGeneralError('');
  };

  const validateAndSave = () => {
    const errors: Record<string, string> = {};

    const windowHours = formData.idempotencyWindowHours;
    if (windowHours === undefined || windowHours === null || isNaN(windowHours) || windowHours < 1 || windowHours > 168) {
      errors.idempotencyWindowHours = "Idempotency window must be between 1 and 168 hours.";
    }

    if (formData.autoPurgeEnabled) {
      const purgeDays = formData.autoPurgeDays;
      if (purgeDays === undefined || purgeDays === null || isNaN(purgeDays) || purgeDays < 7) {
        errors.autoPurgeDays = "Invoice retention period must be at least 7 days.";
      }
    }

    const disputeDays = formData.autoPurgeArchivedDisputesDays;
    if (disputeDays === undefined || disputeDays === null || isNaN(disputeDays) || disputeDays < 1) {
      errors.autoPurgeArchivedDisputesDays = "Archived disputes cleanup must be at least 1 day.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError("Please fix the invalid inputs highlighted below before saving.");
      return;
    }

    setFieldErrors({});
    setGeneralError('');
    
    // Construct clean payload to prevent extra fields or invalid strings from failing backend Zod validation
    const payload: Partial<TenantSettings> = {
      scheduleHour: formData.scheduleHour ?? 9,
      idempotencyWindowHours: formData.idempotencyWindowHours ?? 24,
      skipPaymentWarning: !!formData.skipPaymentWarning,
      autoPurgeEnabled: !!formData.autoPurgeEnabled,
      autoPurgeDays: formData.autoPurgeDays ?? 30,
      autoPurgeArchivedDisputesDays: formData.autoPurgeArchivedDisputesDays ?? 30,
    };
    mutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#8a8f98]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#f7f8f8]">
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="border-b border-[#23252a] pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
                <Zap className="w-4 h-4 mr-2 text-[#8a8f98]" />
                Preferences &amp; Automation
              </CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">
                Configure currency defaults, autopilot execution rules, safety warnings, and data retention policies.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {generalError && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Section 1: System Currency & Payment Link Warning in ONE line (2-column grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Currency Selection */}
            <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
                  Default System Currency
                </h4>
                <p className="text-[11px] text-[#8a8f98] mt-0.5">
                  Multi-currency billing supported per invoice.
                </p>
              </div>
              <CustomSelect
                value="USD"
                onChange={() => {}}
                options={[
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR', disabled: true },
                  { label: 'GBP (£)', value: 'GBP', disabled: true },
                  { label: 'INR (₹)', value: 'INR', disabled: true },
                ]}
                disabled
              />
            </div>

            {/* Payment Link Enforcement Warning */}
            <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  Payment Link Warning
                </h4>
                <p className="text-[11px] text-[#8a8f98] mt-1 leading-relaxed">
                  Warn before queueing emails for invoices without a payment link.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!formData.skipPaymentWarning}
                onClick={() => handleChange('skipPaymentWarning', !formData.skipPaymentWarning)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  !formData.skipPaymentWarning ? 'bg-[#27a644]' : 'bg-[#23252a]'
                }`}
                title={!formData.skipPaymentWarning ? 'Warning Active' : 'Warning Disabled'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    !formData.skipPaymentWarning ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 2: Autopilot & Execution Rules */}
          <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] space-y-4">
            <div>
              <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
                Autopilot &amp; Execution Rules
              </h4>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">
                Manage automated workflow run schedules and duplicate message throttling safeguards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-[#23252a]/60">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8a8f98]">Daily Execution Schedule</label>
                <CustomSelect
                  value={String(formData.scheduleHour ?? 9)}
                  onChange={(val) => handleChange('scheduleHour', Number(val))}
                  options={Array.from({ length: 24 }).map((_, i) => ({
                    label: `${i.toString().padStart(2, '0')}:00 ${i < 12 ? 'AM' : 'PM'}`,
                    value: String(i)
                  }))}
                />
                <p className="text-[10px] text-[#8a8f98]">Runs automatically every day at this hour in your configured timezone.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8a8f98]">Idempotency Window (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={formData.idempotencyWindowHours ?? 24}
                  onChange={(e) => handleChange('idempotencyWindowHours', Number(e.target.value))}
                  className={`w-full p-2.5 border rounded-xl text-xs ${
                    fieldErrors.idempotencyWindowHours
                      ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                      : 'border-[#23252a] bg-[#0f1011] text-[#f7f8f8] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                  }`}
                />
                {fieldErrors.idempotencyWindowHours ? (
                  <p className="text-[10px] text-red-400 font-medium flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0 text-red-400" />
                    {fieldErrors.idempotencyWindowHours}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#8a8f98]">Prevents duplicate follow-ups for the same invoice within this window.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Data Retention & Cleanup Policies */}
          <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#f7f8f8] flex items-center">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
                  Automatic Invoice Trash Purge
                </h4>
                <p className="text-[11px] text-[#8a8f98] mt-0.5 leading-relaxed">
                  Permanently delete invoices that have remained in the Trash past the retention threshold.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.autoPurgeEnabled}
                onClick={() => handleChange('autoPurgeEnabled', !formData.autoPurgeEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.autoPurgeEnabled ? 'bg-[#27a644]' : 'bg-[#23252a]'
                }`}
                title={formData.autoPurgeEnabled ? 'Auto-Purge Enabled' : 'Auto-Purge Disabled'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.autoPurgeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#23252a]/60">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8a8f98]">
                  Invoice Retention Period (Days)
                </label>
                <input
                  type="number"
                  min="7"
                  disabled={!formData.autoPurgeEnabled}
                  value={formData.autoPurgeDays || 30}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleChange('autoPurgeDays', isNaN(val) ? 7 : val);
                  }}
                  className={`w-full p-2.5 border rounded-xl text-xs font-medium ${
                    !formData.autoPurgeEnabled
                      ? 'bg-[#0f1011]/50 border-[#23252a] text-[#62666d] cursor-not-allowed'
                      : fieldErrors.autoPurgeDays
                      ? 'bg-red-950/20 border-red-500 text-red-300 ring-1 ring-red-500/50'
                      : 'bg-[#0f1011] border-[#23252a] text-[#f7f8f8] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                  }`}
                />
                {fieldErrors.autoPurgeDays ? (
                  <p className="text-[10px] text-red-400 font-medium flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0 text-red-400" />
                    {fieldErrors.autoPurgeDays}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#8a8f98]">Minimum retention period is 7 days.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8a8f98]">
                  Archived Disputes Cleanup (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.autoPurgeArchivedDisputesDays ?? 30}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleChange('autoPurgeArchivedDisputesDays', isNaN(val) ? 30 : val);
                  }}
                  className={`w-full p-2.5 border rounded-xl text-xs font-medium ${
                    fieldErrors.autoPurgeArchivedDisputesDays
                      ? 'bg-red-950/20 border-red-500 text-red-300 ring-1 ring-red-500/50'
                      : 'bg-[#0f1011] border-[#23252a] text-[#f7f8f8] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                  }`}
                />
                {fieldErrors.autoPurgeArchivedDisputesDays ? (
                  <p className="text-[10px] text-red-400 font-medium flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0 text-red-400" />
                    {fieldErrors.autoPurgeArchivedDisputesDays}
                  </p>
                ) : (
                  <p className="text-[10px] text-[#8a8f98]">Archived disputes older than this will be purged automatically.</p>
                )}
              </div>
            </div>
          </div>

          {/* Explicit Save Preferences Footer Button */}
          <div className="flex items-center justify-end pt-3 border-t border-[#23252a]">
            <button
              type="button"
              onClick={validateAndSave}
              disabled={saveStatus === 'saving'}
              className="px-5 py-2.5 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center cursor-pointer shadow-sm"
            >
              {saveStatus === 'saving'
                ? 'Saving Preferences...'
                : saveStatus === 'saved'
                ? 'Preferences Saved'
                : 'Save Preferences'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
 * 4. SECURITY & ACCOUNT SETTINGS (2FA & Sign Out)
 * ============================================================================ */
function SecuritySettings() {
  const { user, updateUser, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="space-y-6">
      {/* 1. Account Session & Authentication FIRST */}
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="border-b border-[#23252a] pb-4">
          <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
            <UserIcon className="w-4 h-4 mr-2 text-[#8a8f98]" />
            Account Session &amp; Authentication
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            Manage your current active user session and sign out of your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#18191c] border border-[#23252a] text-[#f7f8f8] font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-[#f7f8f8] truncate">{user?.name || 'User'}</span>
                  {user?.role && (
                    <span className="text-[10px] bg-[#18191c] text-[#8a8f98] border border-[#34343a] px-2 py-0.5 rounded-full capitalize font-medium flex-shrink-0">
                      {user.role}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#8a8f98] truncate block mt-0.5">{user?.email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="px-4 py-2 bg-[#18191c] text-red-400 hover:text-red-300 border border-red-900/40 hover:bg-red-950/40 rounded-xl text-xs font-semibold transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Log Out
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. MFA Setup SECOND */}
      <MfaSetup
        mfaEnabled={user?.mfaEnabled ?? false}
        onMfaChange={(enabled) => {
          if (user) {
            updateUser({ ...user, mfaEnabled: enabled });
          }
        }}
      />
    </div>
  );
}

/* ============================================================================
 * 5. BILLING & SUBSCRIPTIONS
 * ============================================================================ */
function BillingSection() {
  return (
    <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
      <CardHeader className="border-b border-[#23252a] pb-4">
        <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-[#8a8f98]" />
          Billing &amp; Subscription Plans
        </CardTitle>
        <CardDescription className="text-xs text-[#8a8f98]">View your current tier and billing information.</CardDescription>
      </CardHeader>
      <CardContent className="py-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#18191c] border border-[#23252a] text-[#f7f8f8] mx-auto">
          <Check className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#f7f8f8]">Free Early Access Tier</h3>
          <p className="text-xs text-[#8a8f98] max-w-md mx-auto mt-1 leading-relaxed">
            Jaktra Enterprise is completely free during Early Access. All automated workflows, AI dispute resolutions, and payment link integrations are fully included without operational limits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================================
 * 6. SUPPORT
 * ============================================================================ */
function SupportSection() {
  const [copied, setCopied] = useState(false);
  const supportEmail = "support@jaktra.site";

  const handleCopy = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
      <CardHeader className="border-b border-[#23252a] pb-4">
        <CardTitle className="text-base font-bold text-[#f7f8f8] flex items-center">
          <HelpCircle className="w-4 h-4 mr-2 text-[#8a8f98]" />
          Contact Support
        </CardTitle>
        <CardDescription className="text-xs text-[#8a8f98]">Get dedicated technical support and assistance for your tenant configuration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="p-5 border border-[#23252a] rounded-xl bg-[#010102] space-y-4">
          <div>
            <h4 className="text-xs font-bold text-[#f7f8f8]">Dedicated Technical Assistance</h4>
            <p className="text-xs text-[#8a8f98] mt-1 leading-relaxed">
              If you have any questions regarding email provider setup, domain webhooks, payment reconciliation, or custom AI agent rules, reach out directly to our engineering support team.
            </p>
          </div>

          <div className="p-3 bg-[#0f1011] border border-[#23252a] rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-[#8a8f98] flex-shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider block">Official Support Email</span>
                <span className="text-xs font-mono font-bold text-[#f7f8f8] select-all">{supportEmail}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#18191c] hover:bg-[#23252a] text-[#8a8f98] hover:text-[#f7f8f8] border border-[#34343a] rounded-xl text-xs font-medium transition-all flex items-center cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1 text-[#27a644]" /> : <Copy className="w-3.5 h-3.5 mr-1 text-[#8a8f98]" />}
                {copied ? 'Copied' : 'Copy Email'}
              </button>
              <a
                href={`mailto:${supportEmail}`}
                className="px-3.5 py-1.5 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all inline-flex items-center shadow-xs"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================================
 * 7. CUSTOM SMTP SETUP MODAL
 * ============================================================================ */
interface SmtpSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration?: IntegrationsResponse['smtp'];
  settings?: TenantSettings;
  userEmail: string;
}

function SmtpSetupModal({ isOpen, onClose, integration, settings, userEmail }: SmtpSetupModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    senderName: settings?.senderName || 'Finance Team',
    host: integration?.displayHost || '',
    port: integration?.port || 587,
    securityMode: integration?.securityMode || 'starttls',
    username: settings?.senderEmail || userEmail || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ senderName?: boolean; host?: boolean; username?: boolean; password?: boolean }>({});
  const [testEmailInput, setTestEmailInput] = useState(userEmail);
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const saveMutation = useMutation({
    mutationFn: (config: SmtpConfig & { senderName: string }) => settingsService.saveSmtpConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setErrorMsg('');
      setFieldErrors({});
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
    const errors: typeof fieldErrors = {};
    if (!formData.senderName.trim()) errors.senderName = true;
    if (!formData.host.trim()) errors.host = true;
    if (!formData.username.trim()) errors.username = true;
    if (!integration?.isConfigured && !formData.password.trim()) errors.password = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please fill in all required SMTP server fields highlighted below.');
      return;
    }
    setFieldErrors({});
    setErrorMsg('');
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
      <div className="bg-[#010102] rounded-2xl max-w-2xl w-full border border-[#23252a] overflow-hidden flex flex-col text-[#f7f8f8] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23252a] bg-[#0f1011]">
          <div>
            <h3 className="text-sm font-bold text-[#f7f8f8]">Custom SMTP Configuration</h3>
            <p className="text-[11px] text-[#8a8f98]">Configure your outbound email server credentials.</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8a8f98] hover:text-[#f7f8f8] rounded-md transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-[#0f1011]">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8a8f98]">Sender Name</label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              className={`w-full p-2.5 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] ${
                fieldErrors.senderName
                  ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                  : 'border-[#23252a] bg-[#010102] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
              }`}
              placeholder="e.g. Finance Team"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8a8f98]">SMTP Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] ${
                  fieldErrors.host
                    ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                    : 'border-[#23252a] bg-[#010102] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                }`}
                placeholder="smtp.example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8a8f98]">Port</label>
                <CustomSelect
                  value={String(formData.port)}
                  onChange={(val) => setFormData({ ...formData, port: Number(val) })}
                  options={[
                    { label: '587 (STARTTLS)', value: '587' },
                    { label: '465 (Implicit TLS)', value: '465' },
                    { label: '2525 (Alternative)', value: '2525' },
                  ]}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8a8f98]">Security</label>
                <CustomSelect
                  value={formData.securityMode}
                  onChange={(val) => setFormData({ ...formData, securityMode: val })}
                  options={[
                    { label: 'STARTTLS', value: 'starttls' },
                    { label: 'Implicit TLS', value: 'implicit_tls' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8a8f98]">Username (Sender Email)</label>
              <input
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full p-2.5 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] ${
                  fieldErrors.username
                    ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                    : 'border-[#23252a] bg-[#010102] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                }`}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8a8f98]">
                Password {integration?.isConfigured && '(Leave blank to keep)'}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full p-2.5 pr-10 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] font-mono ${
                    fieldErrors.password
                      ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                      : 'border-[#23252a] bg-[#010102] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                  }`}
                  placeholder={integration?.isConfigured ? '••••••••' : 'Your SMTP password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors cursor-pointer"
                  title={showPassword ? "Hide Password" : "View Password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {integration?.isConfigured && (
            <div className="pt-4 border-t border-[#23252a]">
              <h4 className="text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider mb-2">Send Test Email</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  className="flex-1 p-2.5 border border-[#23252a] bg-[#010102] rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none"
                  placeholder="recipient@example.com"
                />
                <button
                  type="button"
                  onClick={() => testEmailInput && testEmailMutation.mutate(testEmailInput)}
                  disabled={testEmailStatus === 'sending' || !testEmailInput}
                  className="px-4 py-2 bg-[#18191c] text-[#f7f8f8] border border-[#34343a] hover:bg-[#23252a] rounded-xl text-xs font-medium transition-all flex items-center disabled:opacity-40 cursor-pointer"
                >
                  {testEmailStatus === 'sending' ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                  ) : testEmailStatus === 'success' ? (
                    'Sent'
                  ) : testEmailStatus === 'error' ? (
                    'Failed'
                  ) : (
                    <><Mail className="w-3.5 h-3.5 mr-1.5" /> Send Test</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#23252a] bg-[#0f1011]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center cursor-pointer shadow-xs"
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

  const getStepTitle = () => {
    return "SendGrid Setup";
  };

  const getStepDescription = () => {
    switch (wizardStep) {
      case 1: return "Save and validate your SendGrid API key with Mail Send permissions.";
      case 2: return "Configure your outbound sender identity and reply copy forwarding preferences.";
      case 3: return "Set up MX records and verify inbound email reply webhook parsing.";
      default: return "Complete all steps to activate automated email delivery.";
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010102]/80 backdrop-blur-sm p-4">
        <MultiStepForm
          size="lg"
          currentStep={wizardStep}
          totalSteps={3}
          title={getStepTitle()}
          description={getStepDescription()}
          onBack={() => {
            if (wizardStep > 1) goToStep((wizardStep - 1) as 1 | 2 | 3);
          }}
          onNext={() => {
            if (wizardStep < 3) goToStep((wizardStep + 1) as 1 | 2 | 3);
          }}
          onClose={handleAttemptClose}
          showBackButton={false}
          showNextButton={false}
        >
          {!sendgridProgress ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-[#18191c] rounded w-1/2" />
              <div className="h-4 bg-[#18191c] rounded w-full" />
              <div className="h-4 bg-[#18191c] rounded w-3/4" />
              <div className="h-20 bg-[#18191c] rounded w-full" />
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
        </MultiStepForm>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010102]/85 backdrop-blur-md p-4">
          <div className="bg-[#0f1011] border border-[#23252a] rounded-2xl max-w-md w-full p-6 space-y-5 text-[#f7f8f8] shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f7f8f8]">Incomplete Setup</h3>
                <p className="text-xs text-[#8a8f98]">Your SendGrid integration is not fully configured.</p>
              </div>
            </div>

            <p className="text-xs text-[#8a8f98] leading-relaxed">
              SendGrid setup is incomplete. Exit before completing all 3 steps?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#23252a]">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Continue Setup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 bg-[#18191c] text-[#8a8f98] hover:text-[#f7f8f8] border border-[#34343a] hover:bg-[#23252a] rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                Exit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
