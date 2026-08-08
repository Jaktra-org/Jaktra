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

  const [replyMode, setReplyModeState] = useState<'real_mailbox' | 'webhook_only'>('webhook_only');
  const [replyMailboxEmail, setReplyMailboxEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  const [otpErr, setOtpErr] = useState('');

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const res = await settingsService.getIntegrations();
      if (res.inboundParse?.replyMode) {
        setReplyModeState(res.inboundParse.replyMode);
      }
      if (res.inboundParse?.replyMailboxEmail) {
        setReplyMailboxEmail(res.inboundParse.replyMailboxEmail);
      }
      return res;
    },
    retry: false,
  });

  const replyModeMutation = useMutation({
    mutationFn: (data: { replyMode: 'real_mailbox' | 'webhook_only'; replyMailboxEmail?: string }) =>
      settingsService.setReplyMode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setOtpMsg('Reply mode saved. If real mailbox mode was selected, please verify ownership with an OTP.');
      setOtpErr('');
    },
    onError: (err: unknown) => {
      setOtpErr(getErrorMessage(err));
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: () => settingsService.sendReplyMailboxOtp(),
    onSuccess: (data) => {
      setOtpMsg(data.message);
      setOtpErr('');
    },
    onError: (err: unknown) => {
      setOtpErr(getErrorMessage(err));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => settingsService.verifyReplyMailboxOtp(otp),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setOtpMsg(data.message);
      setOtpErr('');
      setOtpInput('');
    },
    onError: (err: unknown) => {
      setOtpErr(getErrorMessage(err));
    },
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
  const webhookUrl = inbound?.webhookUrl || `https://www.jaktra.site/api/webhooks/sendgrid/inbound/${user?.tenantId || ''}`;
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

  const handleSaveReplyMode = (mode: 'real_mailbox' | 'webhook_only') => {
    setReplyModeState(mode);
    replyModeMutation.mutate({
      replyMode: mode,
      replyMailboxEmail: mode === 'real_mailbox' ? replyMailboxEmail : undefined,
    });
  };

  const handleSaveMailboxEmail = () => {
    if (!replyMailboxEmail.trim()) {
      setOtpErr('Please enter a valid mailbox email address.');
      return;
    }
    replyModeMutation.mutate({
      replyMode: 'real_mailbox',
      replyMailboxEmail: replyMailboxEmail.trim(),
    });
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
        <CardContent className="space-y-6">
          <div className="border border-slate-200 rounded-md p-6 bg-white space-y-6">
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

            {/* Dual Reply Mode Configuration */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Select Reply Handling Mode (Mandatory)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose whether customer replies should go to a real mailbox (with auto-forwarding) or stay strictly inside Jaktra AI Dispute Engine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Real Mailbox */}
                <div
                  onClick={() => handleSaveReplyMode('real_mailbox')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    replyMode === 'real_mailbox'
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <input
                      type="radio"
                      name="replyMode"
                      checked={replyMode === 'real_mailbox'}
                      onChange={() => handleSaveReplyMode('real_mailbox')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-900 text-sm">Mode 1: Real Mailbox</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                    Customer replies go to Jaktra AI <strong>AND</strong> get auto-forwarded to your verified mailbox (e.g. <code>support@company.com</code>). Requires 6-digit OTP email verification.
                  </p>
                </div>

                {/* Option 2: Virtual / Webhook Only */}
                <div
                  onClick={() => handleSaveReplyMode('webhook_only')}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    replyMode === 'webhook_only'
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <input
                      type="radio"
                      name="replyMode"
                      checked={replyMode === 'webhook_only'}
                      onChange={() => handleSaveReplyMode('webhook_only')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-900 text-sm">Mode 2: Virtual Sub-Address (No Mailbox)</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                    Customer replies flow directly into Jaktra AI Dispute Engine. No real mailbox or OTP verification required.
                  </p>
                </div>
              </div>

              {/* Real Mailbox OTP Section */}
              {replyMode === 'real_mailbox' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Enter Real Mailbox Address
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="email"
                          value={replyMailboxEmail}
                          onChange={(e) => setReplyMailboxEmail(e.target.value)}
                          placeholder="support@company.com"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleSaveMailboxEmail}
                          disabled={replyModeMutation.isPending}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Save Mailbox
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1 md:pt-5">
                      {inbound?.replyMailboxVerified ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                          Mailbox Verified ✅
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
                          Unverified (OTP Required)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* OTP Input Card if Unverified */}
                  {!inbound?.replyMailboxVerified && (
                    <div className="p-4 bg-white border border-amber-200 rounded-md space-y-3 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs text-slate-800 font-semibold">
                          Step 2: Verify ownership of {replyMailboxEmail || 'your mailbox'}
                        </span>
                        <button
                          type="button"
                          onClick={() => sendOtpMutation.mutate()}
                          disabled={sendOtpMutation.isPending || !replyMailboxEmail}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md font-semibold inline-flex items-center transition-colors disabled:opacity-50"
                        >
                          {sendOtpMutation.isPending ? 'Sending Code...' : 'Send 6-Digit OTP'}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="6-digit OTP"
                          className="w-36 px-3 py-2 border border-slate-300 rounded-md text-sm font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => verifyOtpMutation.mutate(otpInput)}
                          disabled={verifyOtpMutation.isPending || otpInput.trim().length !== 6}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP Code'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {otpMsg && <p className="text-xs text-emerald-600 font-medium">{otpMsg}</p>}
              {otpErr && <p className="text-xs text-red-600 font-medium">{otpErr}</p>}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
