import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Loader2, Save, Building, Clock, DollarSign, Settings as SettingsIcon, Mail, Link as LinkIcon, Users, CreditCard } from 'lucide-react';
import type { TenantSettings } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'integrations' | 'team' | 'billing'>('general');

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
          <TabButton 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')} 
            icon={<Users className="w-4 h-4 mr-3" />} 
            label="Team" 
          />
          <TabButton 
            active={activeTab === 'billing'} 
            onClick={() => setActiveTab('billing')} 
            icon={<CreditCard className="w-4 h-4 mr-3" />} 
            label="Billing" 
          />
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'email' && <EmailSettings />}
          {activeTab === 'integrations' && <PlaceholderTab title="Integrations" description="Manage connections to Stripe, Razorpay, and other third-party services." />}
          {activeTab === 'team' && <PlaceholderTab title="Team Management" description="Invite users and manage role-based access control. (Phase B19)" />}
          {activeTab === 'billing' && <PlaceholderTab title="Billing" description="Manage your subscription, view invoices, and update payment methods." />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
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
      setFormData(settings);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<TenantSettings>) => settingsService.updateSettings(newSettings),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  // Debounced save
  useEffect(() => {
    if (!settings) return;
    
    // Check if there are actual changes
    const hasChanges = Object.keys(formData).some(
      key => formData[key as keyof TenantSettings] !== settings[key as keyof TenantSettings]
    );

    if (hasChanges) {
      const timer = setTimeout(() => {
        mutation.mutate(formData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, settings]);

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
  const [provider, setProvider] = useState<'sendgrid' | 'smtp'>('sendgrid');
  const [apiKey, setApiKey] = useState('********************************');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (newSettings: Partial<TenantSettings>) => settingsService.updateSettings(newSettings),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: () => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
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

  // Debounced save
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
  }, [formData, settings]);

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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Provider</CardTitle>
          <CardDescription>Configure your sending infrastructure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Provider Type</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="provider" 
                  value="sendgrid" 
                  checked={provider === 'sendgrid'} 
                  onChange={() => setProvider('sendgrid')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">SendGrid API</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="provider" 
                  value="smtp" 
                  checked={provider === 'smtp'} 
                  onChange={() => setProvider('smtp')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Custom SMTP</span>
              </label>
            </div>
          </div>

          {provider === 'sendgrid' && (
            <SendGridConfig 
              testEmailMutation={testEmailMutation} 
              testEmailStatus={testEmailStatus} 
              userEmail={user?.email || ''} 
            />
          )}

          {provider === 'smtp' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 flex items-center">
              <span className="font-semibold mr-2">Coming Soon:</span> Custom SMTP is currently disabled. Please use SendGrid.
            </div>
          )}
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
    </div>
  );
}



function SendGridConfig({ testEmailMutation, testEmailStatus, userEmail }: any) {
  const queryClient = useQueryClient();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [testEmailInput, setTestEmailInput] = useState(userEmail || '');

  const { data: integration, isLoading } = useQuery({
    queryKey: ['integrations', 'sendgrid'],
    queryFn: () => settingsService.getIntegrations(),
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (key: string) => settingsService.saveSendgridKey(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'sendgrid'] });
      setIsEditing(false);
      setApiKeyInput('');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to validate SendGrid key.');
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: () => settingsService.disconnectSendgrid(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', 'sendgrid'] });
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

  return (
    <div className="space-y-4 pt-2">
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
