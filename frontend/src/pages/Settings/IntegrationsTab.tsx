import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../services/settings';
import { Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/error-utils';
import { CustomSelect } from '../../components/ui/CustomSelect';

export function IntegrationsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState('razorpay');
  const [isEditing, setIsEditing] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [formData, setFormData] = useState({
    keyId: '',
    keySecret: '',
    webhookSecret: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ keyId?: boolean; keySecret?: boolean; webhookSecret?: boolean }>({});

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => settingsService.getIntegrations(),
    retry: false,
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
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-[#8a8f98]" />
      </div>
    );
  }

  const razorpay = integrations?.razorpay;
  const isConfigured = razorpay?.isConfigured;

  const handleSave = () => {
    const errors: typeof fieldErrors = {};
    if (!formData.keyId.trim()) errors.keyId = true;
    if (!formData.keySecret.trim()) errors.keySecret = true;
    if (!formData.webhookSecret.trim()) errors.webhookSecret = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please fill in all required payment integration fields.');
      return;
    }
    setFieldErrors({});
    setErrorMsg('');
    saveMutation.mutate(formData);
  };

  const originUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : 'https://www.jaktra.site';
  const webhookUrl = `${originUrl}/api/webhooks/payments/${user?.tenantId || 'tenant'}/razorpay`;

  return (
    <div className="space-y-5 text-[#f7f8f8]">
      {/* Provider Selection */}
      <div className="space-y-1.5 max-w-xs">
        <label className="text-xs font-semibold text-[#8a8f98]">Payment Provider</label>
        <CustomSelect
          value={selectedProvider}
          onChange={(val) => setSelectedProvider(val)}
          options={[
            { label: 'Razorpay (Active)', value: 'razorpay' },
            { label: 'Stripe (Coming Soon)', value: 'stripe', disabled: true },
            { label: 'PayPal (Coming Soon)', value: 'paypal', disabled: true },
          ]}
        />
      </div>

      {/* Razorpay Configuration Panel */}
      {selectedProvider === 'razorpay' && (
        <div className="border border-[#23252a] rounded-xl p-4 bg-[#010102] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#23252a]">
            <div>
              <h4 className="text-xs font-semibold text-[#f7f8f8] flex items-center">
                Razorpay
                {isConfigured && <CheckCircle2 className="w-4 h-4 text-[#27a644] ml-2" />}
              </h4>
              <p className="text-[11px] text-[#8a8f98] mt-0.5">Accept payments via cards, UPI, and netbanking in India.</p>
            </div>
            {isConfigured && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs font-medium text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-xl transition-all cursor-pointer"
                >
                  Update Keys
                </button>
                <button
                  onClick={() => disconnectMutation.mutate()}
                  className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/40 hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {isConfigured && !isEditing ? (
            <div className="bg-[#0f1011] p-4 rounded-xl border border-[#23252a] flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#f7f8f8]">Connected Account</p>
                <p className="text-[11px] text-[#8a8f98] mt-0.5">Key ID: •••••••••••{razorpay.maskedKeyId?.slice(-4)}</p>
                <div className="mt-2.5 max-w-full">
                  <p className="text-[11px] text-[#8a8f98] font-medium">Webhook Endpoint URL:</p>
                  <div className="flex items-center gap-2 mt-1 max-w-full">
                    <code className="text-[10px] bg-[#010102] text-[#d0d6e0] px-2.5 py-1.5 rounded-lg block flex-1 break-all select-all border border-[#23252a] font-mono overflow-x-auto">
                      {webhookUrl}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        setCopiedWebhook(true);
                        setTimeout(() => setCopiedWebhook(false), 2000);
                      }}
                      className="p-1.5 text-xs text-[#8a8f98] hover:text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-lg transition-all flex-shrink-0 cursor-pointer"
                      title="Copy Webhook URL"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#27a644]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right flex-shrink-0">
                <p className="text-xs font-medium text-[#f7f8f8]">Webhook Status</p>
                <div className="flex items-center mt-1 text-xs justify-start md:justify-end">
                  {razorpay.lastWebhookReceivedAt ? (
                    <span className="text-[#27a644] flex items-center text-[11px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Last received: {new Date(razorpay.lastWebhookReceivedAt).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center text-[11px]">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Waiting for webhooks
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8a8f98]">Key ID</label>
                  <input
                    type="text"
                    value={formData.keyId}
                    onChange={(e) => setFormData(prev => ({ ...prev, keyId: e.target.value }))}
                    className={`w-full p-2.5 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] ${
                      fieldErrors.keyId
                        ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                        : 'border-[#23252a] bg-[#0f1011] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                    }`}
                    placeholder="rzp_live_xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8a8f98]">Key Secret</label>
                  <div className="relative">
                    <input
                      type={showKeySecret ? 'text' : 'password'}
                      value={formData.keySecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, keySecret: e.target.value }))}
                      className={`w-full p-2.5 pr-9 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] ${
                        fieldErrors.keySecret
                          ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                          : 'border-[#23252a] bg-[#0f1011] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                      }`}
                      placeholder="••••••••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8f98] hover:text-[#f7f8f8] cursor-pointer p-1 transition-colors"
                      tabIndex={-1}
                      title={showKeySecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8a8f98]">Webhook Secret</label>
                <div className="relative">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={formData.webhookSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    className={`w-full p-2.5 pr-9 border rounded-xl text-xs text-[#f7f8f8] placeholder-[#62666d] ${
                      fieldErrors.webhookSecret
                        ? 'border-red-500 bg-red-950/20 text-red-300 ring-1 ring-red-500/50'
                        : 'border-[#23252a] bg-[#0f1011] focus:border-[#40434d] focus:ring-1 focus:ring-[#555761] focus:outline-none'
                    }`}
                    placeholder="Your webhook secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8f98] hover:text-[#f7f8f8] cursor-pointer p-1 transition-colors"
                    tabIndex={-1}
                    title={showWebhookSecret ? 'Hide secret' : 'Show secret'}
                  >
                    {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="pt-1 max-w-full">
                  <p className="text-[11px] text-[#8a8f98]">
                    Configure your Razorpay webhook to send <code className="text-[10px] text-[#f7f8f8] bg-[#18191c] px-1 py-0.5 rounded border border-[#34343a]">payment.captured</code> events to:
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 max-w-full">
                    <code className="text-[10px] bg-[#010102] text-[#d0d6e0] px-2.5 py-1.5 rounded-lg block flex-1 break-all select-all border border-[#23252a] font-mono overflow-x-auto">
                      {webhookUrl}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        setCopiedWebhook(true);
                        setTimeout(() => setCopiedWebhook(false), 2000);
                      }}
                      className="p-1.5 text-xs text-[#8a8f98] hover:text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-lg transition-all flex-shrink-0 cursor-pointer"
                      title="Copy Webhook URL"
                    >
                      {copiedWebhook ? <Check className="w-3.5 h-3.5 text-[#27a644]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

              <div className="flex justify-end pt-2 space-x-3">
                {isConfigured && (
                  <button 
                    onClick={() => { setIsEditing(false); setErrorMsg(''); }}
                    className="px-4 py-2 text-[#f7f8f8] bg-[#18191c] border border-[#34343a] hover:bg-[#23252a] rounded-xl text-xs font-medium transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 bg-[#f7f8f8] text-[#010102] hover:bg-[#e1e4e8] active:bg-[#d0d6e0] rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-xs"
                >
                  {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  <span>Connect Razorpay</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

