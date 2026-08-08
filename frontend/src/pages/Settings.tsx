import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { authService } from '../services/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Loader2, Save, Building, Clock, DollarSign, Settings as SettingsIcon, Mail, Link as LinkIcon, Users, CreditCard, User as UserIcon, Trash2, X, RefreshCw, ExternalLink, Key } from 'lucide-react';
import type { TenantSettings, IntegrationsResponse, SmtpConfig } from '../types/api';
import { getErrorMessage } from '../utils/error-utils';
import { useAuth } from '../contexts/AuthContext';
import { TeamSettings } from './Settings/TeamSettings';
import { IntegrationsTab } from './Settings/IntegrationsTab';
import { MfaSetup } from './Settings/MfaSetup';

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
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
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
              {formData.autoPurgeEnabled ? '✓ Auto-Purge Enabled' : 'Auto-Purge Disabled'}
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

  const { data: integrations } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const smtp = integrations?.smtp;
  const sendgrid = integrations?.sendgrid;

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
                  checked={settings?.defaultEmailProvider === 'sendgrid'}
                  onChange={() => settingsService.setDefaultProvider('sendgrid').then(() => queryClient.invalidateQueries({ queryKey: ['settings'] }))}
                  disabled={!sendgrid?.isConfigured || sendgrid?.lastValidationResult !== 'valid'}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">SendGrid API</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultProvider"
                  value="smtp"
                  checked={settings?.defaultEmailProvider === 'smtp'}
                  onChange={() => settingsService.setDefaultProvider('smtp').then(() => queryClient.invalidateQueries({ queryKey: ['settings'] }))}
                  disabled={!smtp?.isConfigured || smtp?.lastValidationResult !== 'valid'}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Custom SMTP</span>
              </label>
            </div>
            {!settings?.defaultEmailProvider && (
              <p className="text-xs text-red-500 font-medium mt-1">No default provider selected. Please configure a provider below.</p>
            )}
          </div>

          {/* Line 2: Custom SMTP Row */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${smtp?.isConfigured ? (smtp.lastValidationResult === 'valid' ? 'bg-emerald-500' : 'bg-red-500') : 'bg-slate-300'}`} />
              <div>
                <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                  Custom SMTP
                  {smtp?.isConfigured && smtp.lastValidationResult === 'valid' && (
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Active</span>
                  )}
                  {smtp?.isConfigured && smtp.lastValidationResult !== 'valid' && (
                    <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">Invalid</span>
                  )}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {smtp?.isConfigured
                    ? `${smtp.displayHost}:${smtp.port} (${smtp.maskedUsername})`
                    : 'Not configured — connect your SMTP server credentials.'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setSmtpModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-sm transition-colors"
              >
                {smtp?.isConfigured ? 'Configure Settings' : 'Set Up SMTP'}
              </button>
              {smtp?.isConfigured && (
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
                          Active ✓
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
                        ? `API Key validated — Complete Step ${nextStep} to activate email sending.`
                        : 'Not configured — connect your SendGrid API key and sender identity.'}
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
          integration={sendgrid}
          settings={settings}
          userEmail={user?.email || ''}
          inboundParse={integrations?.inboundParse}
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
                    <><span className="text-emerald-400 font-bold mr-1.5">✓</span> Sent</>
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
  integration: IntegrationsResponse['sendgrid'] | undefined;
  settings: TenantSettings | undefined;
  userEmail: string;
  inboundParse?: IntegrationsResponse['inboundParse'];
}

function SendGridSetupModal({ isOpen, onClose, integration, settings, userEmail, inboundParse }: SendGridSetupModalProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [senderName, setSenderName] = useState(settings?.senderName || 'Finance Team');
  const [senderEmail, setSenderEmail] = useState(settings?.senderEmail || userEmail || '');
  const [replyTo, setReplyTo] = useState(settings?.replyTo || '');

  const [replyMode, setReplyMode] = useState<'real_mailbox' | 'webhook_only'>(inboundParse?.replyMode || 'webhook_only');
  const [replyMailboxEmail, setReplyMailboxEmail] = useState(inboundParse?.replyMailboxEmail || '');
  const [inboundOtpInput, setInboundOtpInput] = useState('');
  const [inboundOtpMsg, setInboundOtpMsg] = useState('');
  const [inboundOtpErr, setInboundOtpErr] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isVerifiedLocal, setIsVerifiedLocal] = useState<boolean | null>(null);

  const isVerified = isVerifiedLocal !== null ? isVerifiedLocal : !!inboundParse?.isVerified;

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => setOtpCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(
    !integration?.isConfigured ? 1 : (!integration?.isSenderConfigured ? 2 : 3)
  );
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isStep2SavedLocally, setIsStep2SavedLocally] = useState<boolean>(false);

  const goToStep = (step: 1 | 2 | 3) => {
    setErrorMsg('');
    setInboundOtpErr('');
    setInboundOtpMsg('');
    setShowExitConfirm(false);
    setWizardStep(step);
  };

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setErrorMsg('');
      setInboundOtpErr('');
      setInboundOtpMsg('');
      setShowExitConfirm(false);
    }
  }

  const saveKeyOnlyMutation = useMutation({
    mutationFn: (apiKey: string) =>
      settingsService.saveSendgridKey({
        apiKey,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['sendgrid-health'] });
      setErrorMsg('');
      setInboundOtpMsg('Step 1 Complete: API Key saved and verified.');
      setInboundOtpErr('');
      setIsStep2SavedLocally(false);
      goToStep(2);
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const saveSenderDetailsMutation = useMutation({
    mutationFn: () =>
      settingsService.saveSendgridKey({
        apiKey: apiKeyInput.trim() || 'SG.placeholder',
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        replyTo: replyTo.trim() || null,
        replyMode: replyMode,
        replyMailboxEmail: replyMode === 'real_mailbox' ? replyMailboxEmail.trim() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['sendgrid-health'] });
      setErrorMsg('');
      setInboundOtpMsg('Step 2 Complete: Outbound Sender identity & reply mode saved successfully!');
      setInboundOtpErr('');
      setIsStep2SavedLocally(true);
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    },
  });

  const sendInboundOtpMutation = useMutation({
    mutationFn: () => settingsService.sendReplyMailboxOtp(),
    onSuccess: (data) => {
      setInboundOtpMsg(data.message);
      setInboundOtpErr('');
      setOtpCooldown(60);
    },
    onError: (err: unknown) => {
      setInboundOtpErr(getErrorMessage(err));
    },
  });

  const verifyInboundOtpMutation = useMutation({
    mutationFn: (otp: string) => settingsService.verifyReplyMailboxOtp(otp),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setInboundOtpMsg(data.message);
      setInboundOtpErr('');
      setInboundOtpInput('');
    },
    onError: (err: unknown) => {
      setInboundOtpErr(getErrorMessage(err));
    },
  });

  const verifyInboundWebhookMutation = useMutation({
    mutationFn: () => settingsService.verifyInboundWebhook(),
    onSuccess: (data) => {
      setIsVerifiedLocal(true);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setInboundOtpMsg(data.message);
      setInboundOtpErr('');
    },
    onError: (err: unknown) => {
      setIsVerifiedLocal(false);
      setInboundOtpErr(getErrorMessage(err));
      setInboundOtpMsg('');
    },
  });

  const rotateTokenMutation = useMutation({
    mutationFn: () => settingsService.rotateWebhookToken(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setInboundOtpMsg('Webhook secret token rotated successfully. Update the URL in SendGrid Inbound Parse settings.');
    },
  });



  const checkSendGridKeyConfigured = () => {
    if (!integration?.isConfigured && !apiKeyInput.trim()) {
      setInboundOtpErr('Please enter and save your SendGrid API Key in Section 1 first.');
      setInboundOtpMsg('');
      return false;
    }
    return true;
  };

  const handleCopyWebhookUrl = () => {
    const url = inboundParse?.webhookUrl || 'https://www.jaktra.site/api/webhooks/sendgrid/inbound/webhook-token';
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };





  const isConfigured = integration?.isConfigured;
  const webhookUrl = inboundParse?.webhookUrl || 'https://www.jaktra.site/api/webhooks/sendgrid/inbound/webhook-token';
  const sendgridSettingsUrl = inboundParse?.sendgridSettingsUrl || 'https://app.sendgrid.com/settings/parse';

  const isStep1Done = !!isConfigured;

  const isSenderSavedOnServer = !!integration?.isSenderConfigured;

  const isStep2Done =
    isStep1Done &&
    (isStep2SavedLocally || isSenderSavedOnServer) &&
    (replyMode === 'real_mailbox' ? !!inboundParse?.replyMailboxVerified : true);
  const isStep3Done = isStep1Done && isStep2Done && isVerified;
  const isAllDone = isStep1Done && isStep2Done && isStep3Done;

  const handleAttemptClose = () => {
    if (isAllDone) {
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">SendGrid Integration Setup</h3>
            <p className="text-xs text-slate-500">
              Step {wizardStep} of 3 — Complete all 3 steps to activate outbound email & inbound webhook.
            </p>
          </div>
          <button onClick={handleAttemptClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Navigation Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => goToStep(1)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                wizardStep === 1
                  ? 'bg-blue-600 text-white font-bold'
                  : isStep1Done
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <span>1. API Key</span>
              {isStep1Done && <span>✓</span>}
            </button>

            <span className="text-slate-400">→</span>

            <button
              type="button"
              disabled={!isStep1Done}
              onClick={() => isStep1Done && goToStep(2)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                wizardStep === 2
                  ? 'bg-blue-600 text-white font-bold'
                  : isStep2Done
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : !isStep1Done
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span>2. Sender & Mode</span>
              {isStep2Done && <span>✓</span>}
            </button>

            <span className="text-slate-400">→</span>

            <button
              type="button"
              disabled={!isStep2Done}
              onClick={() => isStep2Done && goToStep(3)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${
                wizardStep === 3
                  ? 'bg-blue-600 text-white font-bold'
                  : isStep3Done
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : !isStep2Done
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span>3. Webhook</span>
              {isStep3Done && <span>✓</span>}
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500">Step {wizardStep} of 3</span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {showExitConfirm && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-2">
              <p className="text-xs text-amber-900 font-semibold">
                ⚠️ SendGrid setup is incomplete. Are you sure you want to exit before completing all 3 steps?
              </p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-700 transition-colors"
                >
                  Continue Setup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded hover:bg-slate-300 transition-colors"
                >
                  Exit Anyway
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium space-y-1.5">
              <div>{errorMsg}</div>
              {(errorMsg.toLowerCase().includes('sender identity') || errorMsg.includes('sender_auth') || errorMsg.toLowerCase().includes('sendgrid')) && (
                <div className="pt-1 flex items-center">
                  <a
                    href="https://app.sendgrid.com/settings/sender_auth/senders"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-bold text-red-800 hover:text-red-900 underline bg-red-100/80 hover:bg-red-200 px-2.5 py-1 rounded border border-red-300 transition-colors shadow-sm"
                  >
                    <span>Create & Verify Sender in SendGrid Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 VIEW */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <Key className="w-4 h-4 mr-2 text-blue-600" />
                  Step 1 of 3: Save SendGrid API Key
                </h4>
                {isStep1Done && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    API Key Configured & Valid ✓
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                Enter your SendGrid API Key to connect your account. Must be a restricted API Key starting with <code>SG.</code> containing <strong>Mail Send</strong> permissions.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">SendGrid API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder={isConfigured ? '•••••••••••••••••••••••••••• (Key Saved)' : 'SG.xxxxxxxxxxxxxxxxxx'}
                />
              </div>

              {inboundOtpMsg && <p className="text-[11px] text-emerald-600 font-medium">{inboundOtpMsg}</p>}

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const key = apiKeyInput.trim();
                    if (!key && isConfigured) {
                      setWizardStep(2);
                      return;
                    }
                    if (!key || !key.startsWith('SG.')) {
                      setErrorMsg('SendGrid API Key must start with SG.');
                      return;
                    }
                    saveKeyOnlyMutation.mutate(key);
                  }}
                  disabled={saveKeyOnlyMutation.isPending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  {saveKeyOnlyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {saveKeyOnlyMutation.isPending ? 'Validating Key...' : 'Save Key & Continue to Step 2 →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 VIEW */}
          {wizardStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-blue-600" />
                  Step 2 of 3: Sender Identity & Reply Handling Mode
                </h4>
                {isStep2Done ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Step 2 Completed ✓
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
                    Step 2 Awaiting Action ⏳
                  </span>
                )}
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Reply Handling Mode (Mandatory)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setReplyMode('real_mailbox')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      replyMode === 'real_mailbox'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <input
                        type="radio"
                        name="wizardReplyMode"
                        checked={replyMode === 'real_mailbox'}
                        onChange={() => setReplyMode('real_mailbox')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-900 text-xs">Mode 1: Real Mailbox</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-5 leading-tight">
                      Replies go to Jaktra AI <strong>AND</strong> get auto-forwarded to your verified mailbox. Requires 6-digit OTP verification.
                    </p>
                  </div>

                  <div
                    onClick={() => setReplyMode('webhook_only')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      replyMode === 'webhook_only'
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <input
                        type="radio"
                        name="wizardReplyMode"
                        checked={replyMode === 'webhook_only'}
                        onChange={() => setReplyMode('webhook_only')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-900 text-xs">Mode 2: Virtual Sub-Address</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-5 leading-tight">
                      Replies flow directly into Jaktra AI Dispute Engine via sub-addressing. No mailbox or OTP verification required.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sender Details */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Outbound Sender Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="e.g. Acme Billing"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Outbound Sender Email</label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="billing@acme.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Reply-To Email (Optional Override)</label>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="support@acme.com"
                  />
                </div>
              </div>

              {/* Mode 2 Info Notice */}
              {replyMode === 'webhook_only' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 font-medium">
                  ✓ <strong>Mode 2 Selected:</strong> Customer replies flow directly into Jaktra AI Dispute Engine via Webhook. No real mailbox or OTP verification required.
                </div>
              )}

              {/* Mode 1 Real Mailbox OTP Section */}
              {replyMode === 'real_mailbox' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Real Mailbox Email Address
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          value={replyMailboxEmail}
                          onChange={(e) => setReplyMailboxEmail(e.target.value)}
                          placeholder="support@company.com"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      {inboundParse?.replyMailboxVerified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Verified ✅
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          Unverified OTP
                        </span>
                      )}
                    </div>
                  </div>

                  {!inboundParse?.replyMailboxVerified && (
                    <div className="p-2.5 bg-white border border-amber-200 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-800 font-semibold">
                          Verify ownership of {replyMailboxEmail || 'your mailbox'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (checkSendGridKeyConfigured()) {
                              sendInboundOtpMutation.mutate();
                            }
                          }}
                          disabled={sendInboundOtpMutation.isPending || !replyMailboxEmail || otpCooldown > 0}
                          className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded font-semibold transition-colors disabled:opacity-50"
                        >
                          {sendInboundOtpMutation.isPending
                            ? 'Sending...'
                            : otpCooldown > 0
                            ? `Send OTP (${otpCooldown}s)`
                            : 'Send 6-Digit OTP'}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={inboundOtpInput}
                          onChange={(e) => setInboundOtpInput(e.target.value)}
                          placeholder="6-digit OTP"
                          className="w-32 px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono text-center tracking-widest focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (checkSendGridKeyConfigured()) {
                              verifyInboundOtpMutation.mutate(inboundOtpInput);
                            }
                          }}
                          disabled={verifyInboundOtpMutation.isPending || inboundOtpInput.trim().length !== 6}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
                        >
                          {verifyInboundOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {inboundOtpMsg && <p className="text-[11px] text-emerald-600 font-medium">{inboundOtpMsg}</p>}
              {inboundOtpErr && <p className="text-[11px] text-red-600 font-medium">{inboundOtpErr}</p>}

              {/* Navigation */}
              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                >
                  ← Back to Step 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!senderName || !senderName.trim()) {
                      setErrorMsg('Outbound Sender Name is required for Step 2.');
                      return;
                    }
                    if (!senderEmail || !senderEmail.includes('@')) {
                      setErrorMsg('Valid Outbound Sender Email is required for Step 2.');
                      return;
                    }
                    saveSenderDetailsMutation.mutate(undefined, {
                      onSuccess: () => {
                        if (replyMode === 'real_mailbox' && !inboundParse?.replyMailboxVerified) {
                          setErrorMsg('Please verify your real mailbox OTP before continuing to Step 3.');
                          return;
                        }
                        goToStep(3);
                      },
                    });
                  }}
                  disabled={saveSenderDetailsMutation.isPending}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  {saveSenderDetailsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {saveSenderDetailsMutation.isPending ? 'Saving Sender Details...' : 'Save & Continue to Step 3 →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 VIEW */}
          {wizardStep === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 text-blue-600" />
                  Step 3 of 3: Inbound Webhook Parse Setup
                </h4>
                {isStep3Done ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Inbound Webhook Verified ✅
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
                    Awaiting Webhook Setup ⏳
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Your Copyable Inbound Webhook URL</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono text-slate-800 break-all select-all">
                    {webhookUrl}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium shrink-0 transition-colors"
                  >
                    {copiedWebhook ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => verifyInboundWebhookMutation.mutate()}
                    disabled={verifyInboundWebhookMutation.isPending || isVerified}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
                  >
                    {verifyInboundWebhookMutation.isPending ? 'Verifying...' : isVerified ? 'Verified ✅' : 'Verify Webhook'}
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateTokenMutation.mutate()}
                    disabled={rotateTokenMutation.isPending}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-xs font-medium shrink-0 transition-colors disabled:opacity-50"
                    title="Rotate Token"
                  >
                    Rotate
                  </button>
                </div>
              </div>

              {/* Instructions */}
              {!isVerified && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">SendGrid Parse Instructions:</span>
                    <a
                      href={sendgridSettingsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center"
                    >
                      Open SendGrid Parse Settings <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                    <li>Click the link above to open SendGrid Inbound Parse settings in a new tab.</li>
                    <li>Click <strong>Add Host & URL</strong>.</li>
                    <li>Select your domain (e.g. <code>jaktra.site</code>) and paste your copied Webhook URL into the <strong>URL</strong> field.</li>
                    <li>Return here and click <strong>Verify Webhook</strong>.</li>
                  </ol>
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                >
                  ← Back to Step 2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isAllDone) {
                      onClose();
                    } else {
                      setErrorMsg('Please click Verify Webhook above to confirm inbound parse setup.');
                    }
                  }}
                  className={`px-5 py-2.5 rounded-md text-xs font-bold transition-all shadow-sm ${
                    isAllDone
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isAllDone ? 'Setup Complete & Connected ✓' : 'Verify Webhook To Finish'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
            <span>Overall Progress:</span>
            <span className={isStep1Done ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
              Step 1 {isStep1Done ? '✓' : '⏳'}
            </span>
            <span>|</span>
            <span className={isStep2Done ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
              Step 2 {isStep2Done ? '✓' : '⏳'}
            </span>
            <span>|</span>
            <span className={isStep3Done ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
              Step 3 {isStep3Done ? '✓' : '⏳'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAttemptClose}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
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
