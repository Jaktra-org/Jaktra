import { useState } from "react";
import { ShieldCheck, ShieldOff, QrCode, Copy, Check, AlertTriangle } from "lucide-react";
import { authService } from "../../services/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { getErrorMessage } from "../../utils/error-utils";

type SetupStep =
  | "idle"          
  | "qr"            
  | "backup_codes"  
  | "enrolled"      
  | "disable"       
  | "loading";

interface MfaSetupProps {
  mfaEnabled: boolean;
  onMfaChange: (enabled: boolean) => void; 
}

export function MfaSetup({ mfaEnabled, onMfaChange }: MfaSetupProps) {
  const [step, setStep] = useState<SetupStep>(mfaEnabled ? "enrolled" : "idle");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [confirmCode, setConfirmCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const clearError = () => setError("");

  const handleStartSetup = async () => {
    clearError();
    setIsLoading(true);
    try {
      const result = await authService.mfaSetupInitiate();
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setConfirmCode("");
      setStep("qr");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);
    try {
      const result = await authService.mfaSetupConfirm(confirmCode.trim());
      setBackupCodes(result.backupCodes);
      setSavedConfirmed(false);
      setStep("backup_codes");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Ignore clipboard copy failure
    }
  };

  const handleSavedConfirmation = () => {
    setBackupCodes([]);
    setStep("enrolled");
    onMfaChange(true);
  };

  const handleStartDisable = () => {
    setDisableCode("");
    clearError();
    setStep("disable");
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);
    try {
      await authService.mfaDisable(disableCode.trim());
      setStep("idle");
      onMfaChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "idle") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-[#f7f8f8]">
            <ShieldOff className="w-4 h-4 text-[#8a8f98]" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            Add an extra layer of security to your account using an authenticator app (Google Authenticator, Authy, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 font-medium">{error}</div>
          )}
          <Button onClick={handleStartSetup} isLoading={isLoading} size="sm">
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "qr") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-[#f7f8f8]">
            <QrCode className="w-4 h-4 text-[#5e6ad2]" />
            Set up Authenticator
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 font-medium">{error}</div>
          )}

          {qrCodeDataUrl && (
            <div className="flex justify-center">
              <img
                src={qrCodeDataUrl}
                alt="QR code for authenticator app setup"
                className="w-44 h-44 rounded-lg border border-[#23252a] bg-white p-2"
              />
            </div>
          )}

          <form onSubmit={handleConfirmSetup} className="space-y-4">
            <Input
              label="Verification code"
              type="text"
              inputMode="numeric"
              required
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            <div className="flex gap-3">
              <Button type="submit" size="sm" isLoading={isLoading}>
                Confirm
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setStep("idle"); clearError(); }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "backup_codes") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-[#f7f8f8]">
            <ShieldCheck className="w-4 h-4 text-[#27a644]" />
            Save your backup codes
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            Store these codes somewhere safe. Each code can only be used once. You will not be able to see them again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-amber-950/40 border border-amber-900/50 p-3 flex gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
            <span>If you lose your authenticator and run out of backup codes, an admin must reset your MFA manually.</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md bg-[#010102] border border-[#23252a] px-3 py-1.5 font-mono text-xs text-[#f7f8f8]"
              >
                <span>{code}</span>
                <button
                  type="button"
                  className="ml-2 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                  onClick={() => handleCopyCode(code, i)}
                  title="Copy code"
                >
                  {copiedIndex === i ? (
                    <Check className="w-3.5 h-3.5 text-[#27a644]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="mfa-saved-confirm"
              checked={savedConfirmed}
              onChange={(e) => setSavedConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-[#23252a] bg-[#010102] text-[#5e6ad2] focus:ring-[#5e69d1]"
            />
            <label htmlFor="mfa-saved-confirm" className="text-xs text-[#8a8f98]">
              I've saved all backup codes in a secure location
            </label>
          </div>

          <Button
            onClick={handleSavedConfirmation}
            disabled={!savedConfirmed}
            size="sm"
          >
            Done — Enable 2FA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "enrolled") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-[#f7f8f8]">
            <ShieldCheck className="w-4 h-4 text-[#27a644]" />
            Two-Factor Authentication
            <span className="ml-auto inline-flex items-center rounded-full bg-[#27a644]/10 border border-[#27a644]/20 px-2 py-0.5 text-[10px] font-bold text-[#27a644]">
              Active
            </span>
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            Your account is protected by an authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 font-medium">{error}</div>
          )}
          <Button
            onClick={handleStartDisable}
            size="sm"
            variant="outline"
            className="text-red-400 border-red-900/50 bg-[#0f1011] hover:bg-red-950/40"
          >
            Disable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "disable") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-red-400">
            <ShieldOff className="w-4 h-4" />
            Disable Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98]">
            Enter your current authenticator code to confirm. This will remove MFA from your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDisable} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 font-medium">{error}</div>
            )}
            <Input
              label="Authenticator code"
              type="text"
              inputMode="numeric"
              required
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            <div className="flex gap-3">
              <Button type="submit" size="sm" isLoading={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
                Disable MFA
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setStep("enrolled"); clearError(); }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return null;
}

