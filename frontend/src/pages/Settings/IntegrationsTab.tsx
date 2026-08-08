import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../services/settings';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Loader2, CheckCircle2, AlertTriangle, Copy, Check, ExternalLink, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/error-utils';

export function IntegrationsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [testInboundMsg, setTestInboundMsg] = useState('');
  const [formData, setFormData] = useState({
    keyId: '',
    keySecret: '',
    webhookSecret: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => settingsService.getIntegrations(),
    retry: false,
  });

  const rotateMutation = useMutation({
    mutationFn: () => settingsService.rotateWebhookToken(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setTestInboundMsg('Webhook secret token rotated successfully. Update the URL in SendGrid Inbound Parse settings.');
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) => settingsService.saveRazorpayKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setIsEditing(false);
      setFormData({ keyId: '', keySecret: '', webhookSecret: '' });
      setErrorMsg('');
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err));
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: () => settingsService.disconnectRazorpay(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setIsEditing(true);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const razorpay = integrations?.razorpay;
  const isConfigured = razorpay?.isConfigured;
  const inbound = integrations?.inboundParse;
  const webhookUrl = inbound?.webhookUrl || `${window.location.origin}/api/webhooks/sendgrid/inbound/${user?.tenantId}`;
  const sendgridSettingsUrl = inbound?.sendgridSettingsUrl || 'https://app.sendgrid.com/settings/parse';
  const isInboundVerified = inbound?.isVerified ?? false;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleTestInbound = () => {
    setTestInboundMsg('Inbound webhook endpoint is active on Jaktra. Enter the copied Webhook URL into your SendGrid Inbound Parse settings and reply to an invoice email to complete setup.');
  };

  const handleSave = () => {
    if (!formData.keyId || !formData.keySecret || !formData.webhookSecret) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* SendGrid Inbound Parse Webhook Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              Inbound Email Webhook (SendGrid Inbound Parse)
            </span>
            {isInboundVerified ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Active & Verified (Green Signal)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Awaiting Setup
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Forward customer email replies automatically into Jaktra for AI-driven intent classification and dispute processing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-slate-200 rounded-md p-6 bg-white space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Your Copyable Inbound Webhook URL
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-mono text-slate-800 break-all select-all">
                  {webhookUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium flex items-center shrink-0 transition-colors"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy URL
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => rotateMutation.mutate()}
                  disabled={rotateMutation.isPending}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-xs font-medium flex items-center shrink-0 transition-colors disabled:opacity-50"
                  title="Rotate Webhook Token"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${rotateMutation.isPending ? 'animate-spin' : ''}`} />
                  Rotate Token
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">How to configure in SendGrid:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-500">
                  <li>Click <strong>Open SendGrid Inbound Parse Settings</strong> below.</li>
                  <li>Click the blue <strong>Add Host & URL</strong> button.</li>
                  <li>Select your email domain and paste your copied Webhook URL into the <strong>URL</strong> field.</li>
                </ol>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleTestInbound}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md text-xs font-medium inline-flex items-center transition-colors"
                >
                  Test Webhook Instructions
                </button>
                <a
                  href={sendgridSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium inline-flex items-center shadow-sm transition-colors"
                >
                  Open SendGrid Settings
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </a>
              </div>
            </div>

            {testInboundMsg && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-xs">
                {testInboundMsg}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateways Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>Connect payment providers to automatically generate payment links and reconcile payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 rounded-md p-6 bg-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 flex items-center">
                  Razorpay
                  {isConfigured && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2" />}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Accept payments via cards, UPI, and netbanking in India.</p>
              </div>
              {isConfigured && !isEditing && (
                <div className="flex space-x-3">
                  <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700">Update</button>
                  <button onClick={() => disconnectMutation.mutate()} className="text-sm font-medium text-red-600 hover:text-red-700">Disconnect</button>
                </div>
              )}
            </div>

            {isConfigured && !isEditing ? (
              <div className="bg-slate-50 p-4 rounded-md border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Connected Account</p>
                  <p className="text-xs text-slate-500 mt-1">Key ID: •••••••••••{razorpay.maskedKeyId?.slice(-4)}</p>
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 font-medium">Webhook URL for Razorpay:</p>
                    <code className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded block mt-1 break-all select-all border border-slate-300">
                      https://&lt;your-ngrok-url&gt;/api/webhooks/payments/{user?.tenantId}/razorpay
                    </code>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">Webhook Status</p>
                  <div className="flex items-center mt-1 text-xs">
                    {razorpay.lastWebhookReceivedAt ? (
                      <span className="text-emerald-600 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Last received: {new Date(razorpay.lastWebhookReceivedAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Waiting for first webhook
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Key ID</label>
                    <input
                      type="text"
                      value={formData.keyId}
                      onChange={(e) => setFormData(prev => ({ ...prev, keyId: e.target.value }))}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="rzp_live_xxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Key Secret</label>
                    <input
                      type="password"
                      value={formData.keySecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, keySecret: e.target.value }))}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="••••••••••••••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Webhook Secret</label>
                  <input
                    type="password"
                    value={formData.webhookSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Your webhook secret"
                  />
                  <p className="text-xs text-slate-500">
                    Configure your Razorpay webhook to send `payment.captured` events to: <br/>
                    <code className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded inline-block mt-1 break-all select-all border border-slate-300">
                      https://&lt;your-ngrok-url&gt;/api/webhooks/payments/{user?.tenantId}/razorpay
                    </code>
                  </p>
                </div>

                {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}

                <div className="flex justify-end pt-2 space-x-3">
                  {isConfigured && (
                    <button 
                      onClick={() => { setIsEditing(false); setErrorMsg(''); }}
                      className="px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                  >
                    {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Connect Razorpay
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
