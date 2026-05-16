import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { authService } from '../services/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Loader2, Save, Building, Clock, DollarSign, Settings as SettingsIcon, Mail, Link as LinkIcon, Users, CreditCard, User as UserIcon, Trash2, X, ChevronRight, Check } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'email' | 'integrations' | 'team' | 'billing'>(
    'profile'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-[#f7f8f8]">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#f7f8f8] flex items-center">
          <SettingsIcon className="w-6 h-6 text-[#5e6ad2] mr-2.5" />
          Settings
        </h1>
        <p className="text-[#8a8f98] text-xs mt-1">Manage your tenant configuration and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
            label="Profile" 
          />
          {user?.role === 'admin' && (
            <>
              <TabButton 
                active={activeTab === 'general'} 
                onClick={() => setActiveTab('general')} 
                icon={<Building className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
                label="General" 
              />
              <TabButton 
                active={activeTab === 'email'} 
                onClick={() => setActiveTab('email')} 
                icon={<Mail className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
                label="Email Config" 
              />
              <TabButton 
                active={activeTab === 'integrations'} 
                onClick={() => setActiveTab('integrations')} 
                icon={<LinkIcon className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
                label="Integrations" 
              />
            </>
          )}
          <TabButton 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')} 
            icon={<Users className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
            label="Team" 
          />
          {user?.role === 'admin' && (
            <TabButton 
              active={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')} 
              icon={<CreditCard className="w-4 h-4 mr-2.5 text-[#8a8f98]" />} 
              label="Billing" 
            />
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'general' && user?.role === 'admin' && <GeneralSettings />}
          {activeTab === 'email' && user?.role === 'admin' && <EmailSettings />}
          {activeTab === 'integrations' && user?.role === 'admin' && <IntegrationsTab />}
          {activeTab === 'team' && <TeamSettings />}
          {activeTab === 'billing' && user?.role === 'admin' && <PlaceholderTab title="Billing" description="Manage your subscription, view invoices, and update payment methods." />}
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
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-md transition-all ${
        active 
          ? 'bg-[#141516] text-[#f7f8f8] border border-[#23252a]' 
          : 'text-[#8a8f98] hover:bg-[#0f1011] hover:text-[#f7f8f8]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

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

  const handleChange = (field: keyof TenantSettings, value: string) => {
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
    <Card className="border border-[#23252a] bg-[#0f1011]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-[#f7f8f8]">General Settings</CardTitle>
            <CardDescription className="text-xs text-[#8a8f98]">Manage your company profile and localization.</CardDescription>
          </div>
          <div className="flex items-center h-8">
            {saveStatus === 'saving' && <span className="text-xs text-[#8a8f98] flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Saving...</span>}
            {saveStatus === 'saved' && <span className="text-xs text-[#27a644] flex items-center"><Save className="w-3 h-3 mr-1.5" /> Saved</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#8a8f98] flex items-center">
            <Building className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1] focus:outline-none"
            placeholder="e.g. Acme Corp"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#8a8f98] flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
            Timezone
          </label>
          <select
            value={formData.timezone || 'UTC'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1] focus:outline-none"
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
          <p className="text-[11px] text-[#8a8f98]">This timezone is used for agent scheduling and dashboard reporting.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#8a8f98] flex items-center">
            <DollarSign className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
            Default Currency
          </label>
          <select
            value="USD"
            disabled
            className="w-full p-2 border border-[#23252a] bg-[#141516] text-[#8a8f98] rounded-md text-xs cursor-not-allowed"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
          <p className="text-[11px] text-[#8a8f98]">Multi-currency support is planned for a future update.</p>
        </div>

        {/* Invoice Trash Retention (Auto-Purge) */}
        <div className="pt-5 border-t border-[#23252a] space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-[#f7f8f8] flex items-center">
              <Trash2 className="w-3.5 h-3.5 mr-1.5 text-[#8a8f98]" />
              Invoice Trash Retention
            </h4>
            <p className="text-[11px] text-[#8a8f98] mt-0.5">Configure automatic permanent deletion of trashed invoices.</p>
          </div>
          
          <div className="flex items-start justify-between gap-6 pt-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#f7f8f8]">Automatic invoice purge</p>
              <p className="text-[11px] text-[#8a8f98] mt-0.5 leading-relaxed">
                When enabled, Jaktra will automatically and permanently delete invoices that have been in the Trash for more than the specified number of days.
              </p>
            </div>
            <button
              onClick={() => {
                setFormData(prev => ({ 
                  ...prev, 
                  autoPurgeEnabled: !prev.autoPurgeEnabled 
                }));
              }}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer shadow-none ${
                formData.autoPurgeEnabled
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-[#0f1011] text-[#8a8f98] border-[#23252a] hover:bg-[#141516]'
              }`}
            >
              {formData.autoPurgeEnabled ? '✓ Auto-Purge Enabled' : 'Auto-Purge Disabled'}
            </button>
          </div>

          {formData.autoPurgeEnabled && (
            <div className="space-y-1.5 max-w-xs pt-1">
              <label className="text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider">
                Retention Period (Days)
              </label>
              <input
                type="number"
                min="7"
                value={formData.autoPurgeDays || 30}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setFormData(prev => ({ 
                    ...prev, 
                    autoPurgeDays: isNaN(val) ? 7 : val 
                  }));
                }}
                className={`w-full p-2 border rounded-md text-xs font-medium transition-colors bg-[#010102] text-[#f7f8f8] ${
                  localError ? 'border-red-900/50 text-red-400' : 'border-[#23252a] focus:ring-1 focus:ring-[#5e69d1]'
                }`}
              />
              {localError ? (
                <p className="text-[11px] text-red-400 font-medium">{localError}</p>
              ) : (
                <p className="text-[10px] text-[#8a8f98]">Minimum retention is 7 days. Changes are saved automatically.</p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#23252a] space-y-1.5 max-w-xs">
            <label className="text-[10px] font-bold text-[#8a8f98] uppercase tracking-wider">
              Auto-delete Archived Disputes (Days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.autoPurgeArchivedDisputesDays ?? 30}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData(prev => ({ 
                  ...prev, 
                  autoPurgeArchivedDisputesDays: isNaN(val) ? 30 : val 
                }));
              }}
              className="w-full p-2 border border-[#23252a] bg-[#010102] text-[#f7f8f8] rounded-md text-xs font-medium focus:ring-1 focus:ring-[#5e69d1]"
            />
            <p className="text-[10px] text-[#8a8f98]">Archived disputes older than this number of days will be automatically deleted.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed border border-[#23252a] bg-[#0f1011]">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <SettingsIcon className="w-10 h-10 text-[#3e3e44] mb-3" />
        <h3 className="text-base font-medium text-[#f7f8f8]">{title}</h3>
        <p className="text-[#8a8f98] text-xs mt-1 max-w-sm">{description}</p>
      </CardContent>
    </Card>
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
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="text-base text-[#f7f8f8]">Email Configuration</CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">Configure your email delivery providers and sender settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Line 1: Default Provider Selector */}
          <div className="space-y-2 pb-4 border-b border-[#23252a]">
            <label className="text-xs font-semibold text-[#f7f8f8]">Default Email Provider</label>
            <p className="text-[11px] text-[#8a8f98]">Select which provider should be used to send outgoing collection emails.</p>
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
            {!sendgridProgress?.isActive && !smtpProgress?.isActive && !settings?.defaultEmailProvider && (
              <p className="text-xs text-red-400 font-medium mt-1">No default provider selected. Please configure a provider below.</p>
            )}
          </div>

          {/* Line 2: Custom SMTP Row */}
          <div className="p-3.5 border border-[#23252a] rounded-lg bg-[#010102] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                  {smtpProgress?.overallStatus === 'partially_configured' && (
                    <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Incomplete Setup</span>
                  )}
                  {smtp?.isConfigured && smtp.lastValidationResult !== 'valid' && !smtpProgress && (
                    <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-900/50">Invalid</span>
                  )}
                </h4>
                <p className="text-[11px] text-[#8a8f98] mt-0.5">
                  {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured
                    ? `${smtpProgress?.step1ConnectionDetails.host || smtp?.displayHost}:${smtpProgress?.step1ConnectionDetails.port || smtp?.port} (${smtpProgress?.step1ConnectionDetails.username || smtp?.maskedUsername})`
                    : 'Not configured — connect your SMTP server credentials.'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {smtpProgress?.overallStatus === 'active' && !smtpProgress?.isActive && (
                <button
                  onClick={() => activateProviderMutation.mutate('smtp')}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#5e6ad2] hover:bg-[#828fff] rounded-md transition-colors"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => setSmtpModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] hover:bg-[#141516] rounded-md transition-colors"
              >
                {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured ? 'Configure Settings' : 'Set Up SMTP'}
              </button>
              {(smtpProgress?.overallStatus !== 'not_configured' || smtp?.isConfigured) && (
                <button
                  onClick={() => disconnectSmtpMutation.mutate()}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 bg-[#0f1011] border border-red-900/50 hover:bg-red-950/40 rounded-md transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Line 3: SendGrid API Row */}
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
              <div className="p-[#010102] p-3.5 border border-[#23252a] rounded-lg bg-[#010102] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                      {sendgrid?.isConfigured && sendgrid.lastValidationResult !== 'valid' && (
                        <span className="ml-2 text-[9px] uppercase font-bold tracking-wider text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-900/50">
                          Invalid Key
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#8a8f98] mt-0.5">
                      {isSendgridFullyActive
                        ? `Connected (${sendgrid?.senderEmail || settings?.senderEmail || 'Sender set'})`
                        : isSendgridPartial
                        ? `API Key validated — Complete Step ${nextStep} to activate email sending.`
                        : 'Not configured — connect your SendGrid API key and sender identity.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setSendgridModalOpen(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isSendgridFullyActive
                        ? 'text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] hover:bg-[#141516]'
                        : isSendgridPartial
                        ? 'text-white bg-[#5e6ad2] hover:bg-[#828fff]'
                        : 'text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] hover:bg-[#141516]'
                    }`}
                  >
                    {isSendgridFullyActive
                      ? 'Configure Settings'
                      : isSendgridPartial
                      ? `Continue Setup (Step ${nextStep})`
                      : 'Set Up SendGrid'}
                  </button>
                  {sendgrid?.isConfigured && (
                    <button
                      onClick={() => disconnectSendgridMutation.mutate()}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 bg-[#0f1011] border border-red-900/50 hover:bg-red-950/40 rounded-md transition-colors"
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

      {/* Agent Preferences */}
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="text-base text-[#f7f8f8]">Agent Preferences</CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">Control how the AI agent behaves when sending follow-up emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#f7f8f8]">Payment link warning</p>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">
                When enabled, the agent will warn you before sending emails without a payment link.
              </p>
            </div>
            <button
              onClick={() => {
                if (settings?.skipPaymentWarning) {
                  settingsService.updateSettings({ skipPaymentWarning: false }).then(() => queryClient.invalidateQueries({ queryKey: ['settings'] }));
                }
              }}
              disabled={!settings?.skipPaymentWarning}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                settings?.skipPaymentWarning
                  ? 'bg-[#0f1011] text-[#f7f8f8] border-[#23252a] hover:bg-[#141516]'
                  : 'bg-[#27a644]/10 text-[#27a644] border-[#27a644]/20 cursor-default'
              }`}
            >
              {settings?.skipPaymentWarning ? 'Re-enable Warning' : '✓ Warning Active'}
            </button>
          </div>
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
      <div className="bg-[#0f1011] rounded-xl shadow-none max-w-xl w-full border border-[#23252a] overflow-hidden flex flex-col max-h-[90vh] text-[#f7f8f8]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23252a] bg-[#010102]">
          <div>
            <h3 className="text-sm font-bold text-[#f7f8f8]">Custom SMTP Configuration</h3>
            <p className="text-[11px] text-[#8a8f98]">Configure your outbound email server credentials.</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8a8f98] hover:text-[#f7f8f8] rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-md text-xs text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8a8f98]">Sender Name</label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
              placeholder="e.g. Acme Billing"
            />
            <p className="text-[10px] text-[#8a8f98]">The display name that customers will see on emails.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8a8f98]">SMTP Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
                placeholder="smtp.example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#8a8f98]">Port</label>
                <select
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                  className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
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
                  className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
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
                className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
                placeholder="admin@example.com"
              />
              <p className="text-[10px] text-[#8a8f98]">Emails will be sent from this authenticated account.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8a8f98]">
                Password {integration?.isConfigured && '(Leave blank to keep)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
                placeholder={integration?.isConfigured ? '********' : 'Your SMTP password'}
              />
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
                  className="flex-1 p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
                  placeholder="recipient@example.com"
                />
                <button
                  onClick={() => testEmailInput && testEmailMutation.mutate(testEmailInput)}
                  disabled={testEmailStatus === 'sending' || !testEmailInput}
                  className="px-3.5 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-colors flex items-center disabled:opacity-40"
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

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#23252a] bg-[#010102]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] hover:bg-[#141516] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="px-3.5 py-1.5 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-colors disabled:opacity-40 flex items-center"
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
      <div className="bg-[#0f1011] rounded-xl shadow-none max-w-2xl w-full border border-[#23252a] overflow-hidden flex flex-col max-h-[90vh] text-[#f7f8f8]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23252a] bg-[#010102]">
          <div>
            <h3 className="text-sm font-bold text-[#f7f8f8]">SendGrid Integration Setup</h3>
            <p className="text-[11px] text-[#8a8f98]">
              Step {wizardStep} of 3 - Complete all 3 steps to activate outbound email &amp; inbound webhook.
            </p>
          </div>
          <button onClick={handleAttemptClose} className="p-1 text-[#8a8f98] hover:text-[#f7f8f8] rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step navigation bar */}
        <div className="px-6 py-3 bg-[#010102] border-b border-[#23252a] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium">
            <button type="button" onClick={() => goToStep(1)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors ${
                wizardStep === 1 ? 'bg-[#5e6ad2] text-white font-bold'
                  : isStep1Done ? 'bg-[#27a644]/10 text-[#27a644] hover:bg-[#27a644]/20 border border-[#27a644]/20'
                  : 'bg-[#141516] text-[#8a8f98]'
              }`}>
              <span>1. API Key</span>
              {isStep1Done && <Check className="w-3 h-3 text-[#27a644]" />}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-[#3e3e44]" />

            <button type="button" disabled={!isStep1Done} onClick={() => isStep1Done && goToStep(2)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors ${
                wizardStep === 2 ? 'bg-[#5e6ad2] text-white font-bold'
                  : isStep2Done ? 'bg-[#27a644]/10 text-[#27a644] hover:bg-[#27a644]/20 border border-[#27a644]/20'
                  : !isStep1Done ? 'bg-[#141516] text-[#8a8f98]/40 cursor-not-allowed'
                  : 'bg-[#141516] text-[#8a8f98] hover:bg-[#18191a]'
              }`}>
              <span>2. Sender &amp; Mode</span>
              {isStep2Done && <Check className="w-3 h-3 text-[#27a644]" />}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-[#3e3e44]" />

            <button type="button" disabled={!isStep2Done} onClick={() => isStep2Done && goToStep(3)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-colors ${
                wizardStep === 3 ? 'bg-[#5e6ad2] text-white font-bold'
                  : isStep3Done ? 'bg-[#27a644]/10 text-[#27a644] hover:bg-[#27a644]/20 border border-[#27a644]/20'
                  : !isStep2Done ? 'bg-[#141516] text-[#8a8f98]/40 cursor-not-allowed'
                  : 'bg-[#141516] text-[#8a8f98] hover:bg-[#18191a]'
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
            <div className="p-3.5 bg-amber-950/40 border border-amber-900/50 rounded-lg space-y-2">
              <p className="text-xs text-amber-300 font-semibold">
                SendGrid setup is incomplete. Exit before completing all 3 steps?
              </p>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setShowExitConfirm(false)}
                  className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium rounded hover:bg-amber-500/30 transition-colors">
                  Continue Setup
                </button>
                <button type="button" onClick={() => { setShowExitConfirm(false); onClose(); }}
                  className="px-3 py-1 bg-[#141516] text-[#8a8f98] border border-[#23252a] text-xs font-medium rounded hover:bg-[#18191a] transition-colors">
                  Exit Anyway
                </button>
              </div>
            </div>
          )}

          {!sendgridProgress ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-[#141516] rounded w-1/2" />
              <div className="h-4 bg-[#141516] rounded w-full" />
              <div className="h-4 bg-[#141516] rounded w-3/4" />
              <div className="h-20 bg-[#141516] rounded w-full" />
              <div className="h-10 bg-[#141516] rounded w-1/3 ml-auto" />
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
        <div className="px-6 py-4 border-t border-[#23252a] bg-[#010102] flex items-center justify-between">
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
            className="px-3.5 py-1.5 border border-[#23252a] rounded-md text-[#f7f8f8] bg-[#0f1011] hover:bg-[#141516] text-xs font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuth();
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
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-[#f7f8f8]">Profile Settings</CardTitle>
              <CardDescription className="text-xs text-[#8a8f98]">Manage your personal profile and display settings.</CardDescription>
            </div>
            <div className="flex items-center h-8">
              {saveStatus === 'saving' && <span className="text-xs text-[#8a8f98] flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1.5" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-xs text-[#27a644] flex items-center"><Save className="w-3 h-3 mr-1.5" /> Saved</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8a8f98]">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-2 border border-[#23252a] rounded-md bg-[#141516] text-[#8a8f98] text-xs cursor-not-allowed"
              />
              <p className="text-[10px] text-[#8a8f98]">Your email address is managed by your administrator and cannot be changed.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8a8f98]">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-[#23252a] bg-[#010102] rounded-md text-xs text-[#f7f8f8] focus:ring-1 focus:ring-[#5e69d1]"
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
                className="px-4 py-2 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-colors disabled:opacity-40 flex items-center justify-center"
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
    </div>
  );
}

