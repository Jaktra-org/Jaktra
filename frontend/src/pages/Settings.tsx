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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
          <SettingsIcon className="w-8 h-8 text-blue-600 mr-3" />
          Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage your tenant configuration and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-1">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon className="w-4 h-4 mr-3" />} 
            label="Profile" 
          />
          {user?.role === 'admin' && (
            <>
              <TabButton 
                active={activeTab === 'general'} 
                onClick={() => setActiveTab('general')} 
                icon={<Building className="w-4 h-4 mr-3" />} 
                label="General" 
              />
              <TabButton 
                active={activeTab === 'email'} 
                onClick={() => setActiveTab('email')} 
                icon={<Mail className="w-4 h-4 mr-3" />} 
                label="Email Config" 
              />
              <TabButton 
                active={activeTab === 'integrations'} 
                onClick={() => setActiveTab('integrations')} 
                icon={<LinkIcon className="w-4 h-4 mr-3" />} 
                label="Integrations" 
              />
            </>
          )}
          <TabButton 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')} 
            icon={<Users className="w-4 h-4 mr-3" />} 
            label="Team" 
          />
          {user?.role === 'admin' && (
            <TabButton 
              active={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')} 
              icon={<CreditCard className="w-4 h-4 mr-3" />} 
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
      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your company profile and localization.</CardDescription>
          </div>
          <div className="flex items-center h-8">
            {saveStatus === 'saving' && <span className="text-sm text-slate-500 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-2" /> Saving...</span>}
            {saveStatus === 'saved' && <span className="text-sm text-emerald-600 flex items-center"><Save className="w-3 h-3 mr-2" /> Saved</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center">
            <Building className="w-4 h-4 mr-2 text-slate-400" />
            Company Name
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Acme Corp"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            Timezone
          </label>
          <select
            value={formData.timezone || 'UTC'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <p className="text-xs text-slate-500">This timezone is used for agent scheduling and dashboard reporting.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
            Default Currency
          </label>
          <select
            value="USD"
            disabled
            className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (â‚¬)</option>
            <option value="GBP">GBP (Â£)</option>
            <option value="INR">INR (â‚¹)</option>
          </select>
          <p className="text-xs text-slate-500">Multi-currency support is planned for a future update.</p>
        </div>

        {/* Invoice Trash Retention (Auto-Purge) */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 flex items-center">
              <Trash2 className="w-4 h-4 mr-2 text-slate-400" />
              Invoice Trash Retention
            </h4>
            <p className="text-xs text-slate-500 mt-1">Configure automatic permanent deletion of trashed invoices.</p>
          </div>
          
          <div className="flex items-start justify-between gap-6 pt-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">Automatic invoice purge</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
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
              className={`flex-shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer shadow-sm ${
                formData.autoPurgeEnabled
                  ? 'bg-amber-50 text-amber-700 border-amber-250 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {formData.autoPurgeEnabled ? 'âœ“ Auto-Purge Enabled' : 'Auto-Purge Disabled'}
            </button>
          </div>

          {formData.autoPurgeEnabled && (
            <div className="space-y-2 max-w-xs animate-timeline-fade-in pt-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
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
                className={`w-full p-2 border rounded-md text-sm font-medium transition-colors ${
                  localError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {localError ? (
                <p className="text-xs text-red-650 font-semibold">{localError}</p>
              ) : (
                <p className="text-[10px] text-slate-400 font-medium">Minimum retention is 7 days. Changes are saved automatically.</p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200/80 space-y-2 max-w-xs">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
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
              className="w-full p-2 border border-slate-300 rounded-md text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-400 font-medium">Archived disputes older than this number of days will be automatically deleted.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed border-2 bg-slate-50">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <SettingsIcon className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-xl font-medium text-slate-700">{title}</h3>
        <p className="text-slate-500 mt-2 max-w-sm">{description}</p>
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const smtp = integrations?.smtp;
  const sendgrid = integrations?.sendgrid;
  const sendgridProgress = integrations?.sendgridProgress;
  const smtpProgress = integrations?.smtpProgress;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Configure your email delivery providers and sender settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Line 1: Default Provider Selector */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <label className="text-sm font-semibold text-slate-800">Default Email Provider</label>
            <p className="text-xs text-slate-500">Select which provider should be used to send outgoing collection emails.</p>
            <div className="flex items-center space-x-6 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultProvider"
                  value="sendgrid"
                  checked={sendgridProgress?.isActive || settings?.defaultEmailProvider === 'sendgrid'}
                  onChange={() => activateProviderMutation.mutate('sendgrid')}
                  disabled={sendgridProgress?.overallStatus !== 'active' && (!sendgrid?.isConfigured || sendgrid?.lastValidationResult !== 'valid')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">SendGrid API</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultProvider"
                  value="smtp"
                  checked={smtpProgress?.isActive || settings?.defaultEmailProvider === 'smtp'}
                  onChange={() => activateProviderMutation.mutate('smtp')}
                  disabled={smtpProgress?.overallStatus !== 'active' && (!smtp?.isConfigured || smtp?.lastValidationResult !== 'valid')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Custom SMTP</span>
              </label>
            </div>
            {!sendgridProgress?.isActive && !smtpProgress?.isActive && !settings?.defaultEmailProvider && (
              <p className="text-xs text-red-500 font-medium mt-1">No default provider selected. Please configure a provider below.</p>
            )}
          </div>

          {/* Line 2: Custom SMTP Row */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${smtpProgress?.isActive ? 'bg-emerald-500' : smtpProgress?.overallStatus === 'partially_configured' ? 'bg-amber-500' : smtp?.isConfigured ? (smtp.lastValidationResult === 'valid' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-slate-300'}`} />
              <div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                  Custom SMTP
                  {smtpProgress?.isActive && (
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Active âœ“</span>
                  )}
                  {!smtpProgress?.isActive && smtpProgress?.overallStatus === 'active' && (
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">Ready to Activate</span>
                  )}
                  {smtpProgress?.overallStatus === 'partially_configured' && (
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Incomplete Setup</span>
                  )}
                  {smtp?.isConfigured && smtp.lastValidationResult !== 'valid' && !smtpProgress && (
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">Invalid</span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured
                    ? `${smtpProgress?.step1ConnectionDetails.host || smtp?.displayHost}:${smtpProgress?.step1ConnectionDetails.port || smtp?.port} (${smtpProgress?.step1ConnectionDetails.username || smtp?.maskedUsername})`
                    : 'Not configured â€” connect your SMTP server credentials.'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {smtpProgress?.overallStatus === 'active' && !smtpProgress?.isActive && (
                <button
                  onClick={() => activateProviderMutation.mutate('smtp')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-md shadow-sm transition-colors"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => setSmtpModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-sm transition-colors"
              >
                {smtpProgress?.overallStatus === 'active' || smtp?.isConfigured ? 'Configure Settings' : 'Set Up SMTP'}
              </button>
              {(smtpProgress?.overallStatus !== 'not_configured' || smtp?.isConfigured) && (
                <button
                  onClick={() => disconnectSmtpMutation.mutate()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-white border border-slate-300 hover:bg-red-50 rounded-md shadow-sm transition-colors"
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
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isSendgridFullyActive
                        ? 'bg-emerald-500'
                        : sendgrid?.isConfigured && sendgrid.lastValidationResult !== 'valid'
                        ? 'bg-red-500'
                        : isSendgridPartial
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                      SendGrid API
                      {isSendgridFullyActive && (
                        <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active âœ“
                        </span>
                      )}
                      {isSendgridPartial && (
                        <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          Incomplete Setup (Step {nextStep} of 3)
                        </span>
                      )}
                      {sendgrid?.isConfigured && sendgrid.lastValidationResult !== 'valid' && (
                        <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                          Invalid Key
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isSendgridFullyActive
                        ? `Connected (${sendgrid?.senderEmail || settings?.senderEmail || 'Sender set'})`
                        : isSendgridPartial
                        ? `API Key validated â€” Complete Step ${nextStep} to activate email sending.`
                        : 'Not configured â€” connect your SendGrid API key and sender identity.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setSendgridModalOpen(true)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors ${
                      isSendgridFullyActive
                        ? 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                        : isSendgridPartial
                        ? 'text-white bg-blue-600 hover:bg-blue-700 border border-blue-600'
                        : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
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
                      className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-white border border-slate-300 hover:bg-red-50 rounded-md shadow-sm transition-colors"
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
      <Card>
        <CardHeader>
          <CardTitle>Agent Preferences</CardTitle>
          <CardDescription>Control how the AI agent behaves when sending follow-up emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">Payment link warning</p>
              <p className="text-xs text-slate-500 mt-1">
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
              className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                settings?.skipPaymentWarning
                  ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
              }`}
            >
              {settings?.skipPaymentWarning ? 'Re-enable Warning' : 'âœ“ Warning Active'}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Custom SMTP Configuration</h3>
            <p className="text-xs text-slate-500">Configure your outbound email server credentials.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Sender Name</label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Acme Billing"
            />
            <p className="text-[11px] text-slate-500">The display name that customers will see on emails.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">SMTP Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="smtp.example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Port</label>
                <select
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="587">587 (STARTTLS)</option>
                  <option value="465">465 (Implicit TLS)</option>
                  <option value="2525">2525 (Alternative)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Security</label>
                <select
                  value={formData.securityMode}
                  onChange={(e) => setFormData({ ...formData, securityMode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="starttls">STARTTLS</option>
                  <option value="implicit_tls">Implicit TLS</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Username (Sender Email)</label>
              <input
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
              />
              <p className="text-[11px] text-slate-500">Emails will be sent from this authenticated account.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Password {integration?.isConfigured && '(Leave blank to keep)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={integration?.isConfigured ? '********' : 'Your SMTP password'}
              />
            </div>
          </div>

          {integration?.isConfigured && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Send Test Email</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  className="flex-1 p-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500"
                  placeholder="recipient@example.com"
                />
                <button
                  onClick={() => testEmailInput && testEmailMutation.mutate(testEmailInput)}
                  disabled={testEmailStatus === 'sending' || !testEmailInput}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors flex items-center disabled:opacity-50"
                >
                  {testEmailStatus === 'sending' ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                  ) : testEmailStatus === 'success' ? (
                    <><span className="text-emerald-400 font-bold mr-1.5">âœ“</span> Sent</>
                  ) : testEmailStatus === 'error' ? (
                    <><span className="text-red-400 font-bold mr-1.5">âœ•</span> Failed</>
                  ) : (
                    <><Mail className="w-3.5 h-3.5 mr-1.5" /> Send Test</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:opacity-50 flex items-center"
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

/**
 * SendGrid Setup Wizard Modal
 *
 * ARCHITECTURE INVARIANTS (do not violate):
 *
 * 1. LOADING GATE: Modal body does NOT render until `sendgridProgress` has resolved.
 *    A loading skeleton is shown until then. This is the load-bearing guarantee that
 *    allows child step components to safely seed `mode` via `useState` initializer.
 *
 * 2. SINGLE SOURCE OF STEP NAVIGATION: `wizardStep` is set ONCE on first load via a
 *    `useRef` guard. After that, ONLY explicit `goToStep()` calls move `wizardStep`.
 *    Background refetches do NOT re-trigger the init effect and do NOT re-navigate.
 *
 * 3. FULL UNMOUNT ON CLOSE: `if (!isOpen) return null` guarantees step components
 *    fully unmount. Their `mode` state cannot persist across a close/reopen cycle.
 *
 * 4. NO VERIFICATION LOGIC IN PARENT: Step completion status (`isStep1Done` etc.) is
 *    read directly from `sendgridProgress.stepX.isDone` â€” never derived or compared.
 */
function SendGridSetupModal({ isOpen, onClose, sendgridProgress, refetch }: SendGridSetupModalProps) {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // One-time initialization guard: set step ONCE when progress first resolves.
  // After the ref is set, background refetches will NOT re-trigger navigation.
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
    // Reset ref on close so next open re-initializes correctly
    if (!isOpen) {
      hasInitializedStep.current = false;
    }
  }, [isOpen, sendgridProgress]);

  // Full unmount on close â€” prevents stale state in child components
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

  // Read step completion purely from server data â€” no derived comparisons
  const isStep1Done = sendgridProgress?.step1ApiKey.isDone ?? false;
  const isStep2Done = sendgridProgress?.step2SenderAndMode.isDone ?? false;
  const isStep3Done = sendgridProgress?.step3InboundWebhook.isDone ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">SendGrid Integration Setup</h3>
            <p className="text-xs text-slate-500">
              Step {wizardStep} of 3 - Complete all 3 steps to activate outbound email &amp; inbound webhook.
            </p>
          </div>
          <button onClick={handleAttemptClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step navigation bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <button type="button" onClick={() => goToStep(1)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                wizardStep === 1 ? 'bg-blue-600 text-white font-bold'
                  : isStep1Done ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-200 text-slate-600'
              }`}>
              <span>1. API Key</span>
              {isStep1Done && <Check className="w-3 h-3" />}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

            <button type="button" disabled={!isStep1Done} onClick={() => isStep1Done && goToStep(2)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                wizardStep === 2 ? 'bg-blue-600 text-white font-bold'
                  : isStep2Done ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : !isStep1Done ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}>
              <span>2. Sender &amp; Mode</span>
              {isStep2Done && <Check className="w-3 h-3" />}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

            <button type="button" disabled={!isStep2Done} onClick={() => isStep2Done && goToStep(3)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                wizardStep === 3 ? 'bg-blue-600 text-white font-bold'
                  : isStep3Done ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : !isStep2Done ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}>
              <span>3. Webhook</span>
              {isStep3Done && <Check className="w-3 h-3" />}
            </button>
          </div>
          <span className="text-xs font-bold text-slate-500">Step {wizardStep} of 3</span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {showExitConfirm && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-2">
              <p className="text-xs text-amber-900 font-semibold">
                SendGrid setup is incomplete. Exit before completing all 3 steps?
              </p>
              <div className="flex space-x-2">
                <button type="button" onClick={() => setShowExitConfirm(false)}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors">
                  Continue Setup
                </button>
                <button type="button" onClick={() => { setShowExitConfirm(false); onClose(); }}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded hover:bg-slate-300 transition-colors">
                  Exit Anyway
                </button>
              </div>
            </div>
          )}

          {/* LOADING GATE: block all step rendering until progress is resolved.
              This is load-bearing â€” child components rely on progress being non-null
              to safely seed their `mode` via useState initializer. */}
          {!sendgridProgress ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-20 bg-slate-100 rounded w-full" />
              <div className="h-10 bg-slate-100 rounded w-1/3 ml-auto" />
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
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
            <span>Overall Progress:</span>
            <span className={isStep1Done ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
              Step 1 {isStep1Done ? '(done)' : '(pending)'}
            </span>
            <span>|</span>
            <span className={isStep2Done ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
              Step 2 {isStep2Done ? '(done)' : '(pending)'}
            </span>
            <span>|</span>
            <span className={isStep3Done ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
              Step 3 {isStep3Done ? '(done)' : '(pending)'}
            </span>
          </div>
          <button type="button" onClick={handleAttemptClose}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors">
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal profile and display settings.</CardDescription>
            </div>
            <div className="flex items-center h-8">
              {saveStatus === 'saving' && <span className="text-sm text-slate-500 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-2" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-sm text-emerald-600 flex items-center"><Save className="w-3 h-3 mr-2" /> Saved</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">Your email address is managed by your administrator and cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saveStatus === 'saving' || name.trim() === user?.name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
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
