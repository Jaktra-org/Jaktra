import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../../services/settings';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/error-utils';

export function IntegrationsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
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
        <Loader2 className="w-6 h-6 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  const razorpay = integrations?.razorpay;
  const isConfigured = razorpay?.isConfigured;

  const handleSave = () => {
    if (!formData.keyId || !formData.keySecret || !formData.webhookSecret) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 text-[#f7f8f8]">
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="text-base text-[#f7f8f8]">Payment Gateways</CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">Connect payment providers to automatically generate payment links and reconcile payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-[#23252a] rounded-md p-5 bg-[#010102]">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#f7f8f8] flex items-center">
                  Razorpay
                  {isConfigured && <CheckCircle2 className="w-4 h-4 text-[#27a644] ml-2" />}
                </h3>
                <p className="text-xs text-[#8a8f98] mt-0.5">Accept payments via cards, UPI, and netbanking in India.</p>
              </div>
              {isConfigured && !isEditing && (
                <div className="flex space-x-3">
                  <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-[#5e6ad2] hover:text-[#828fff]">Update</button>
                  <button onClick={() => disconnectMutation.mutate()} className="text-xs font-medium text-red-400 hover:text-red-300">Disconnect</button>
                </div>
              )}
            </div>

            {isConfigured && !isEditing ? (
              <div className="bg-[#0f1011] p-4 rounded-md border border-[#23252a] flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#f7f8f8]">Connected Account</p>
                  <p className="text-[11px] text-[#8a8f98] mt-0.5">Key ID: •••••••••••{razorpay.maskedKeyId?.slice(-4)}</p>
                  <div className="mt-2.5">
                    <p className="text-[11px] text-[#8a8f98] font-medium">Webhook URL for Razorpay:</p>
                    <code className="text-[10px] bg-[#141516] text-[#d0d6e0] px-1.5 py-0.5 rounded block mt-1 break-all select-all border border-[#23252a] font-mono">
                      https://&lt;your-ngrok-url&gt;/api/webhooks/payments/{user?.tenantId}/razorpay
                    </code>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-[#f7f8f8]">Webhook Status</p>
                  <div className="flex items-center mt-1 text-xs">
                    {razorpay.lastWebhookReceivedAt ? (
                      <span className="text-[#27a644] flex items-center text-[11px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Last received: {new Date(razorpay.lastWebhookReceivedAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center text-[11px]">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Waiting for first webhook
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8a8f98]">Key ID</label>
                    <input
                      type="text"
                      value={formData.keyId}
                      onChange={(e) => setFormData(prev => ({ ...prev, keyId: e.target.value }))}
                      className="w-full p-2 border border-[#23252a] bg-[#0f1011] rounded-md focus:ring-1 focus:ring-[#5e69d1] text-xs text-[#f7f8f8]"
                      placeholder="rzp_live_xxxxxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8a8f98]">Key Secret</label>
                    <input
                      type="password"
                      value={formData.keySecret}
                      onChange={(e) => setFormData(prev => ({ ...prev, keySecret: e.target.value }))}
                      className="w-full p-2 border border-[#23252a] bg-[#0f1011] rounded-md focus:ring-1 focus:ring-[#5e69d1] text-xs text-[#f7f8f8]"
                      placeholder="••••••••••••••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8a8f98]">Webhook Secret</label>
                  <input
                    type="password"
                    value={formData.webhookSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookSecret: e.target.value }))}
                    className="w-full p-2 border border-[#23252a] bg-[#0f1011] rounded-md focus:ring-1 focus:ring-[#5e69d1] text-xs text-[#f7f8f8]"
                    placeholder="Your webhook secret"
                  />
                  <p className="text-[11px] text-[#8a8f98]">
                    Configure your Razorpay webhook to send `payment.captured` events to: <br/>
                    <code className="text-[10px] bg-[#141516] text-[#d0d6e0] px-1.5 py-0.5 rounded inline-block mt-1 break-all select-all border border-[#23252a] font-mono">
                      https://&lt;your-ngrok-url&gt;/api/webhooks/payments/{user?.tenantId}/razorpay
                    </code>
                  </p>
                </div>

                {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

                <div className="flex justify-end pt-2 space-x-3">
                  {isConfigured && (
                    <button 
                      onClick={() => { setIsEditing(false); setErrorMsg(''); }}
                      className="px-3.5 py-1.5 text-[#f7f8f8] bg-[#0f1011] border border-[#23252a] hover:bg-[#141516] rounded-md text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className="px-3.5 py-1.5 bg-[#5e6ad2] hover:bg-[#828fff] text-white rounded-md text-xs font-medium transition-colors disabled:opacity-40 flex items-center"
                  >
                    {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
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

