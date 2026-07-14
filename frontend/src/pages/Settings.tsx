import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { authService } from '../services/auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Loader2, Save, Building, Clock, DollarSign, Settings as SettingsIcon, Mail, Link as LinkIcon, Users, CreditCard, User as UserIcon, Trash2 } from 'lucide-react';
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
  const [formData, setFormData] = useState<Partial<TenantSettings>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  const { data: integrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => settingsService.getIntegrations(),
    retry: false,
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
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['sendgrid-health'] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: (to: string) => settingsService.testEmail(to),
    onMutate: () => setTestEmailStatus('sending'),
    onSuccess: () => {
      setTestEmailStatus('success');
      setTimeout(() => setTestEmailStatus('idle'), 5000);
    },
    onError: () => {
      setTestEmailStatus('error');
    }
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

  const { data: inboundStatus, refetch: refetchInboundStatus } = useQuery({
    queryKey: ['inboundVerificationStatus'],
    queryFn: settingsService.getInboundVerificationStatus,
  });

  const startTestMutation = useMutation({
    mutationFn: settingsService.startInboundVerificationTest,
    onSuccess: () => {
      refetchInboundStatus();
    },
  });

  useEffect(() => {
    if (inboundStatus?.latestTest?.status === 'pending') {
      const interval = setInterval(() => {
        refetchInboundStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [inboundStatus, refetchInboundStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sender Configuration</CardTitle>
              <CardDescription>Configure how emails appear to your customers. Note: Your Sender Email must be authenticated with your Email Provider (e.g., SendGrid).</CardDescription>
            </div>
            <div className="flex items-center h-8">
              {saveStatus === 'saving' && <span className="text-sm text-slate-500 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-2" /> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-sm text-emerald-600 flex items-center"><Save className="w-3 h-3 mr-2" /> Saved</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sender Name</label>
              <input
                type="text"
                value={formData.senderName || ''}
                onChange={(e) => handleChange('senderName', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Acme Billing"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sender Email</label>
              <input
                type="email"
                value={formData.senderEmail || ''}
                onChange={(e) => handleChange('senderEmail', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="billing@acme.com"
              />
              <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                <strong>Important:</strong> This email address must be configured as a Verified Sender in your SendGrid dashboard, otherwise emails will fail to send.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Reply-To Email</label>
            <input
              type="email"
              value={formData.replyTo || ''}
              onChange={(e) => handleChange('replyTo', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="support@acme.com"
            />
            <p className="text-xs text-slate-500">If left blank, replies will go to the Sender Email.</p>
            <p className="text-[11px] text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 mt-2">
              <strong>Notice:</strong> When automatic reply capture is active, replies are temporarily routed to tracking sub-addresses (e.g. <code>reply+invoice_id@replies.domain.com</code>) to link customer emails back to their invoices.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h5 className="text-sm font-semibold text-slate-800">Inbound Reply Capture Configuration</h5>
            <p className="text-xs text-slate-500">
              Dispute capture allows Jaktra to automatically intercept and process replies to your collection emails using AI.
            </p>
            
            {settings?.defaultEmailProvider !== 'sendgrid' ? (
              <div className="text-[11px] text-amber-600 bg-amber-50 p-3 rounded border border-amber-100">
                <strong>SMTP Active:</strong> Inbound reply capture is not supported for Custom SMTP. Switch to SendGrid as your Default Email Provider to enable this.
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Verification Status:</span>
                  {inboundStatus?.hasRealCapture ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
                      Verified (Real capture active)
                    </span>
                  ) : inboundStatus?.dnsVerifiedAt ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                      Not Verified
                    </span>
                  )}
                </div>

                {inboundStatus?.dnsVerifiedAt && (
                  <p className="text-[11px] text-slate-500">
                    Last verified: {new Date(inboundStatus.dnsVerifiedAt).toLocaleString()}
                  </p>
                )}

                <div className="pt-2 flex items-center space-x-3">
                  {inboundStatus?.latestTest?.status === 'pending' ? (
                    <div className="flex items-center text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
                      <span className="animate-pulse mr-2 w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      <span>Waiting for reply to test email... Check your inbox!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => startTestMutation.mutate()}
                      disabled={startTestMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                    >
                      {startTestMutation.isPending ? 'Sending Test...' : 'Run Verification Test'}
                    </button>
                  )}
                  {inboundStatus?.latestTest?.status === 'expired' && (
                    <span className="text-[11px] text-red-500">Test expired. Please try running it again.</span>
                  )}
                  {inboundStatus?.latestTest?.status === 'failed' && (
                    <span className="text-[11px] text-red-500">Test failed. Please check setup.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Provider</CardTitle>
          <CardDescription>Configure your sending infrastructure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-900">1. Default Provider</h4>
            <p className="text-xs text-slate-500">Select which configured provider should be used for outgoing emails.</p>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="defaultProvider" 
                  value="sendgrid" 
                  checked={settings?.defaultEmailProvider === 'sendgrid'} 
                  onChange={() => settingsService.setDefaultProvider('sendgrid').then(() => queryClient.invalidateQueries({ queryKey: ['settings'] }))}
                  disabled={!integrations?.sendgrid.isConfigured || integrations?.sendgrid.lastValidationResult !== 'valid'}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">SendGrid API</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="defaultProvider" 
                  value="smtp" 
                  checked={settings?.defaultEmailProvider === 'smtp'} 
                  onChange={() => settingsService.setDefaultProvider('smtp').then(() => queryClient.invalidateQueries({ queryKey: ['settings'] }))}
                  disabled={!integrations?.smtp.isConfigured || integrations?.smtp.lastValidationResult !== 'valid'}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Custom SMTP</span>
              </label>
            </div>
            {!settings?.defaultEmailProvider && (
               <p className="text-xs text-red-500 font-medium">No default provider is selected. Emails will not be sent.</p>
            )}
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-4">
             <h4 className="text-sm font-medium text-slate-900">2. Provider Configurations</h4>
             <div className="space-y-8">
               <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">SendGrid</h5>
                  <SendGridConfig 
                    integration={integrations?.sendgrid}
                    testEmailMutation={testEmailMutation} 
                    testEmailStatus={testEmailStatus} 
                    userEmail={user?.email || ''} 
                  />
               </div>
               
               <hr className="border-slate-100" />

               <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Custom SMTP</h5>
                  <SmtpConfigurator 
                    integration={integrations?.smtp}
                    userEmail={user?.email || ''}
                  />
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Email Preview</CardTitle>
          <CardDescription>How a Stage 1 email will appear to your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 space-y-1">
              <div className="text-sm">
                <span className="text-slate-500 w-16 inline-block">From:</span>
                <span className="font-medium text-slate-900">
                  {formData.senderName || 'Sender Name'} &lt;{formData.senderEmail || 'sender@example.com'}&gt;
                </span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 w-16 inline-block">Reply-To:</span>
                <span className="font-medium text-slate-900">{formData.replyTo || formData.senderEmail || 'sender@example.com'}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 w-16 inline-block">Subject:</span>
                <span className="font-medium text-slate-900">Action Required: Invoice #INV-12345 is due today</span>
              </div>
            </div>
            <div className="p-6 bg-white min-h-[200px] text-slate-800 space-y-4">
              <p>Hi John Doe,</p>
              <p>This is a friendly reminder that invoice <strong>#INV-12345</strong> for <strong>$1,250.00</strong> is due today.</p>
              <p>If you have already processed this payment, please disregard this message. Otherwise, you can easily pay via the link below.</p>
              <div className="pt-2 pb-2">
                <span className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">Pay Invoice</span>
              </div>
              <p>Thank you for your business!</p>
              <p className="text-slate-500 text-sm mt-6">
                {formData.companyName || 'Your Company Name'}
              </p>
            </div>
          </div>
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
                When enabled, the agent will warn you before sending emails without a payment link
                (i.e. when no payment integration is configured). You previously dismissed this warning
                — re-enable it here to see it again.
              </p>
            </div>
            <button
              onClick={() => {
                if (settings?.skipPaymentWarning) {
                  mutation.mutate({ ...formData, skipPaymentWarning: false });
                }
              }}
              disabled={!settings?.skipPaymentWarning || mutation.isPending}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
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
    </div>
  );
}




interface SendGridConfigProps {
  integration: IntegrationsResponse['sendgrid'] | undefined;
  testEmailMutation: { mutate: (to: string) => void; isPending: boolean };
  testEmailStatus: 'idle' | 'sending' | 'success' | 'error';
  userEmail: string;
}

function SendGridConfig({ integration, testEmailMutation, testEmailStatus, userEmail }: SendGridConfigProps) {
  const queryClient = useQueryClient();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [testEmailInput, setTestEmailInput] = useState(userEmail || '');

  const saveMutation = useMutation({
    mutationFn: (key: string) => settingsService.saveSendgridKey(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['sendgrid-health'] });
      setIsEditing(false);
      setApiKeyInput('');
      setErrorMsg('');
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: () => settingsService.disconnectSendgrid(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['sendgrid-health'] });
      setIsEditing(true);
    }
  });

  const handleSave = () => {
    if (!apiKeyInput.trim().startsWith('SG.')) {
      setErrorMsg('Invalid SendGrid key format. Must start with SG.');
      return;
    }
    saveMutation.mutate(apiKeyInput.trim());
  };

  const isConfigured = integration?.isConfigured;
  const isInvalid = isConfigured && integration?.lastValidationResult !== 'valid';

  const { data: health, isLoading: isHealthLoading, error: healthError } = useQuery({
    queryKey: ['sendgrid-health'],
    queryFn: () => settingsService.getSendgridHealth(),
    enabled: !!isConfigured && !isEditing,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return (
    <div className="space-y-4 pt-2">
      {isConfigured && !isEditing ? (
        <>
          <div className="p-4 border rounded-md bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center">
              {isInvalid ? (
                <span className="w-3 h-3 rounded-full bg-red-500 mr-3 flex-shrink-0"></span>
              ) : (
                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-3 flex-shrink-0"></span>
              )}
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center">
                  SendGrid API Key
                  {isInvalid && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">Invalid</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Last validated: {integration?.lastValidatedAt ? new Date(integration.lastValidatedAt).toLocaleString() : 'Unknown'}
                </p>
                {isInvalid && <p className="text-xs text-red-600 mt-1">This key was revoked or lacks required permissions.</p>}
              </div>
            </div>
            <div className="space-x-2 flex-shrink-0">
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-sm transition-colors">
                Update Key
              </button>
              <button onClick={() => disconnectMutation.mutate()} className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-slate-300 hover:bg-red-50 hover:border-red-200 rounded shadow-sm transition-colors">
                Remove
              </button>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-md bg-white space-y-4 mt-4">
            <h6 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Configuration Health</h6>
            {isHealthLoading ? (
              <div className="flex items-center text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                Checking configuration health...
              </div>
            ) : healthError ? (
              <div className="text-xs text-slate-500">
                Failed to load configuration health. Verify your settings manually.
              </div>
            ) : health ? (
              <div className="space-y-4">
                {/* Sender Verification Check */}
                <div className="flex items-start gap-3">
                  {health.senderVerified === true ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-emerald-200">✓</span>
                  ) : health.senderVerified === false ? (
                    <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-amber-200">!</span>
                  ) : health.senderVerified === 'insufficient_permissions' ? (
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-slate-200">?</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-slate-200">⟳</span>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Sender Identity Verification</p>
                      {health.senderVerified === true && <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Verified</span>}
                      {health.senderVerified === false && <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Unverified</span>}
                      {health.senderVerified === 'insufficient_permissions' && <span className="text-[11px] font-semibold text-slate-650 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Security Scoped</span>}
                      {health.senderVerified === 'check_failed' && <span className="text-[11px] font-semibold text-slate-650 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Check Failed</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {health.senderVerified === true && "Your sender email identity is verified. SendGrid will accept emails sent from this address."}
                      {health.senderVerified === false && (
                        <>
                          Your sender email identity is not verified in SendGrid. Emails sent from this address will fail to deliver.{" "}
                          <a href="https://app.sendgrid.com/settings/sender_auth" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline inline-flex items-center">
                            Fix this in SendGrid →
                          </a>
                        </>
                      )}
                      {health.senderVerified === 'insufficient_permissions' && (
                        <>
                          You've scoped this key narrowly for security, which is good. We can't check this automatically, so please verify sender status directly in{" "}
                          <a href="https://app.sendgrid.com/settings/sender_auth" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">
                            SendGrid
                          </a>.
                        </>
                      )}
                      {health.senderVerified === 'check_failed' && (
                        <>
                          We couldn't check this right now — try refreshing the page, or verify manually in{" "}
                          <a href="https://app.sendgrid.com/settings/sender_auth" target="_blank" rel="noopener noreferrer" className="text-blue-650 font-medium hover:underline">
                            SendGrid
                          </a>.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Domain Authentication Check */}
                <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                  {health.domainAuthenticated === true ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-emerald-200">✓</span>
                  ) : health.domainAuthenticated === false ? (
                    <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-amber-200">!</span>
                  ) : health.domainAuthenticated === 'insufficient_permissions' ? (
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-slate-200">?</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-slate-200">⟳</span>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Domain Authentication (SPF/DKIM)</p>
                      {health.domainAuthenticated === true && <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Authenticated</span>}
                      {health.domainAuthenticated === false && <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Not Configured</span>}
                      {health.domainAuthenticated === 'insufficient_permissions' && <span className="text-[11px] font-semibold text-slate-650 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Security Scoped</span>}
                      {health.domainAuthenticated === 'check_failed' && <span className="text-[11px] font-semibold text-slate-650 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Check Failed</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {health.domainAuthenticated === true && "Your sending domain has valid SPF/DKIM records authenticated. This ensures high deliverability."}
                      {health.domainAuthenticated === false && (
                        <>
                          Without domain authentication, your emails are more likely to be marked as spam by recipients' mail providers.{" "}
                          <a href="https://app.sendgrid.com/settings/sender_auth" target="_blank" rel="noopener noreferrer" className="text-blue-650 font-medium hover:underline inline-flex items-center">
                            Fix this in SendGrid →
                          </a>
                        </>
                      )}
                      {health.domainAuthenticated === 'insufficient_permissions' && (
                        <>
                          You've scoped this key narrowly for security, which is good. We can't check this automatically, so please verify domain authentication status directly in{" "}
                          <a href="https://app.sendgrid.com/settings/sender_auth" target="_blank" rel="noopener noreferrer" className="text-blue-650 font-medium hover:underline">
                            SendGrid
                          </a>.
                        </>
                      )}
                      {health.domainAuthenticated === 'check_failed' && (
                        <>
                          We couldn't check this right now — try refreshing the page, or verify manually in{" "}
                          <a href="https://app.sendgrid.com/settings/sender_auth" target="_blank" rel="noopener noreferrer" className="text-blue-650 font-medium hover:underline">
                            SendGrid
                          </a>.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Reasons box if there are any failures or notes */}
                {health.reasons && health.reasons.length > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 space-y-1 mt-2">
                    <span className="font-semibold text-slate-800">Validation details:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {health.reasons.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">SendGrid API Key</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="SG.xxxxxxxxxxxxxxxxxx"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                disabled={saveMutation.isPending || !apiKeyInput.trim()}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {saveMutation.isPending ? 'Validating...' : 'Validate & Save'}
              </button>
              {isConfigured && isEditing && (
                <button 
                  onClick={() => { setIsEditing(false); setErrorMsg(''); }} 
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}
          <p className="text-xs text-slate-500">
            Create a restricted API key in your SendGrid dashboard with <strong className="font-semibold text-slate-700">Mail Send</strong> permissions.
          </p>
        </div>
      )}

      {isConfigured && (
        <div className="pt-6 border-t border-slate-200 mt-6">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Test Configuration</h4>
          <p className="text-sm text-slate-500 mb-4">Send a test email to verify your settings are correct.</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-2 max-w-md">
            <input
              type="email"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="recipient@example.com"
            />
            <button
              onClick={() => testEmailInput && testEmailMutation.mutate(testEmailInput)}
              disabled={testEmailStatus === 'sending' || !testEmailInput}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors flex items-center shadow-sm disabled:opacity-50"
            >
              {testEmailStatus === 'sending' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : testEmailStatus === 'success' ? (
                <><span className="text-emerald-400 font-bold mr-2">✓</span> Sent</>
              ) : testEmailStatus === 'error' ? (
                <><span className="text-red-400 font-bold mr-2">✕</span> Failed</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" /> Send Test Email</>
              )}
            </button>
          </div>
          {testEmailStatus === 'error' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Failed to send test email.</p>
              <p className="text-sm text-red-700 mt-1">Check that your API key is valid and your sender identity is verified in SendGrid.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SmtpConfiguratorProps {
  integration: IntegrationsResponse['smtp'] | undefined;
  userEmail: string;
}

function SmtpConfigurator({ integration, userEmail }: SmtpConfiguratorProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testEmailInput, setTestEmailInput] = useState(userEmail || '');
  
  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    securityMode: 'starttls',
    username: '',
    password: ''
  });

  const saveMutation = useMutation({
    mutationFn: (config: SmtpConfig) => settingsService.saveSmtpConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setIsEditing(false);
      setFormData({ host: '', port: 587, securityMode: 'starttls', username: '', password: '' });
      setErrorMsg('');
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: () => settingsService.disconnectSmtp(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setIsEditing(true);
    }
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
    }
  });

  const handleSave = () => {
    if (!formData.host || !formData.port || !formData.username) {
       setErrorMsg('Please fill in all required fields.');
       return;
    }
    saveMutation.mutate({ ...formData, port: Number(formData.port) });
  };

  const isConfigured = integration?.isConfigured;
  const isInvalid = isConfigured && integration?.lastValidationResult !== 'valid';

  return (
    <div className="space-y-4">
      {isConfigured && !isEditing ? (
        <div className="p-4 border rounded-md bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center">
            {isInvalid ? (
              <span className="w-3 h-3 rounded-full bg-red-500 mr-3 flex-shrink-0"></span>
            ) : (
              <span className="w-3 h-3 rounded-full bg-emerald-500 mr-3 flex-shrink-0"></span>
            )}
            <div>
              <p className="text-sm font-medium text-slate-900 flex items-center">
                {integration.displayHost}:{integration.port}
                {isInvalid && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">Invalid</span>}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Username: {integration.maskedUsername} | Mode: {integration.securityMode}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Last validated: {integration?.lastValidatedAt ? new Date(integration.lastValidatedAt).toLocaleString() : 'Unknown'}
              </p>
              {isInvalid && <p className="text-xs text-red-600 mt-1">SMTP credentials failed verification or were revoked.</p>}
            </div>
          </div>
          <div className="space-x-2 flex-shrink-0">
            <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-sm transition-colors">
              Update
            </button>
            <button onClick={() => disconnectMutation.mutate()} className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-slate-300 hover:bg-red-50 hover:border-red-200 rounded shadow-sm transition-colors">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4 border border-slate-200 rounded-md bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">SMTP Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({...formData, host: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="smtp.example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-700">Port</label>
                 <select
                   value={formData.port}
                   onChange={(e) => setFormData({...formData, port: Number(e.target.value)})}
                   className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="587">587 (STARTTLS)</option>
                   <option value="465">465 (Implicit TLS)</option>
                   <option value="2525">2525 (Alternative)</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-700">Security</label>
                 <select
                   value={formData.securityMode}
                   onChange={(e) => setFormData({...formData, securityMode: e.target.value})}
                   className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                 >
                   <option value="starttls">STARTTLS</option>
                   <option value="implicit_tls">Implicit TLS</option>
                 </select>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Password {isConfigured && '(Leave blank to keep)'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={isConfigured ? '********' : 'Your SMTP password'}
              />
            </div>
          </div>

          {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}

          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saveMutation.isPending ? 'Validating Connection...' : 'Verify & Save'}
            </button>
            {isConfigured && isEditing && (
              <button 
                onClick={() => { setIsEditing(false); setErrorMsg(''); }} 
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {isConfigured && !isEditing && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Test SMTP Connection</h4>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              value={testEmailInput}
              onChange={(e) => setTestEmailInput(e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-blue-500 text-sm"
              placeholder="recipient@example.com"
            />
            <button
              onClick={() => testEmailInput && testEmailMutation.mutate(testEmailInput)}
              disabled={testEmailStatus === 'sending' || !testEmailInput}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors flex items-center shadow-sm disabled:opacity-50"
            >
              {testEmailStatus === 'sending' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : testEmailStatus === 'success' ? (
                <><span className="text-emerald-400 font-bold mr-2">✓</span> Sent</>
              ) : testEmailStatus === 'error' ? (
                <><span className="text-red-400 font-bold mr-2">✕</span> Failed</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" /> Test Email</>
              )}
            </button>
          </div>
          {testEmailStatus === 'error' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">Failed to send test email.</p>
              <p className="text-sm text-red-700 mt-1">Check your settings or view server logs for more details.</p>
            </div>
          )}
        </div>
      )}
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
