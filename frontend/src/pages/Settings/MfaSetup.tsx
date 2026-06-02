import React, { useState } from "react";
import { QrCode, Copy, Check, AlertTriangle, Key } from "lucide-react";
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
  const [codeError, setCodeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const clearError = () => {
    setError("");
    setCodeError(false);
  };

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
      setCodeError(true);
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
      setCodeError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "idle") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#23252a] pb-4">
          <div>
            <CardTitle className="text-base font-bold text-[#f7f8f8]">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-xs text-[#8a8f98] mt-0.5">
              Add an extra layer of security to your account using an authenticator app (Google Authenticator, Authy, etc.)
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#18191c] border border-[#34343a] px-2.5 py-1 text-[10px] font-bold text-[#8a8f98] flex-shrink-0">
            Disabled
          </span>
        </CardHeader>
        <CardContent className="pt-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium mb-4">{error}</div>
          )}

          <Button onClick={handleStartSetup} isLoading={isLoading} size="sm" className="font-bold rounded-xl">
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "qr") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="border-b border-[#23252a] pb-4">
          <CardTitle className="flex items-center text-base font-bold text-[#f7f8f8]">
            <QrCode className="w-4 h-4 mr-2 text-[#8a8f98]" />
            Set up Authenticator
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98] mt-0.5">
            Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">{error}</div>
          )}

          <div className="p-5 border border-[#23252a] rounded-xl bg-[#010102] flex flex-col md:flex-row items-center gap-6">
            {qrCodeDataUrl && (
              <div className="flex-shrink-0">
                <img
                  src={qrCodeDataUrl}
                  alt="QR code for authenticator app setup"
                  className="w-40 h-40 rounded-xl border border-[#23252a] bg-white p-2.5 shadow-md"
                />
              </div>
            )}

            <div className="flex-1 space-y-4 w-full">
              <div>
                <h4 className="text-xs font-bold text-[#f7f8f8]">Enter 6-Digit Code</h4>
                <p className="text-[11px] text-[#8a8f98] mt-0.5">
                  After scanning the QR code, type the 6-digit security code generated by your app below.
                </p>
              </div>

              <form onSubmit={handleConfirmSetup} className="space-y-4">
                <Input
                  label="Verification code"
                  type="text"
                  inputMode="numeric"
                  required
                  error={codeError}
                  value={confirmCode}
                  onChange={(e) => {
                    setConfirmCode(e.target.value);
                    if (codeError) setCodeError(false);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="font-mono text-center tracking-widest text-lg max-w-xs"
                />
                <div className="flex gap-3 pt-1">
                  <Button type="submit" size="sm" isLoading={isLoading} className="font-bold rounded-xl">
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { setStep("idle"); clearError(); }}
                    disabled={isLoading}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "backup_codes") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="border-b border-[#23252a] pb-4">
          <CardTitle className="flex items-center text-base font-bold text-[#f7f8f8]">
            <Key className="w-4 h-4 mr-2 text-[#27a644]" />
            Save your backup codes
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98] mt-0.5">
            Store these codes somewhere safe. Each code can only be used once. You will not be able to see them again.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/40 flex gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
            <span>If you lose your authenticator app and run out of backup codes, an admin must reset your 2FA credentials manually.</span>
          </div>

          <div className="p-4 border border-[#23252a] rounded-xl bg-[#010102] space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {backupCodes.map((code, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-[#0f1011] border border-[#23252a] px-3.5 py-2 font-mono text-xs text-[#f7f8f8]"
                >
                  <span>{code}</span>
                  <button
                    type="button"
                    className="ml-2 text-[#8a8f98] hover:text-[#f7f8f8] transition-colors cursor-pointer"
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

            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="mfa-saved-confirm"
                checked={savedConfirmed}
                onChange={(e) => setSavedConfirmed(e.target.checked)}
                className="h-4 w-4 rounded border-[#23252a] bg-[#0f1011] text-[#f7f8f8] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="mfa-saved-confirm" className="text-xs text-[#8a8f98] cursor-pointer">
                I've saved all backup codes in a secure location
              </label>
            </div>
          </div>

          <Button
            onClick={handleSavedConfirmation}
            disabled={!savedConfirmed}
            size="sm"
            className="font-bold rounded-xl"
          >
            Done — Enable 2FA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "enrolled") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#23252a] pb-4">
          <div>
            <CardTitle className="text-base font-bold text-[#f7f8f8]">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-xs text-[#8a8f98] mt-0.5">
              Your account is currently protected by time-based authenticator codes.
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-full bg-[#27a644]/10 border border-[#27a644]/20 px-2.5 py-1 text-[10px] font-bold text-[#27a644] flex-shrink-0">
            Active
          </span>
        </CardHeader>
        <CardContent className="pt-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-xs text-red-400 font-medium mb-4">{error}</div>
          )}
          
          <Button
            onClick={handleStartDisable}
            size="sm"
            variant="outline"
            className="text-red-400 border-red-900/50 bg-[#0f1011] hover:bg-red-950/40 rounded-xl font-medium"
          >
            Disable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "disable") {
    return (
      <Card className="border border-[#23252a] bg-[#0f1011] rounded-2xl">
        <CardHeader className="border-b border-[#23252a] pb-4">
          <CardTitle className="text-base font-bold text-red-400">
            Disable Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-xs text-[#8a8f98] mt-0.5">
            Enter your current authenticator code to confirm. This will remove 2FA security from your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleDisable} className="space-y-4 max-w-sm">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-xs text-red-400 font-medium">{error}</div>
            )}
            <Input
              label="Authenticator code"
              type="text"
              inputMode="numeric"
              required
              error={codeError}
              value={disableCode}
              onChange={(e) => {
                setDisableCode(e.target.value);
                if (codeError) setCodeError(false);
              }}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className="font-mono text-center tracking-widest text-lg"
            />
            <div className="flex gap-3 pt-1">
              <Button type="submit" size="sm" isLoading={isLoading} className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/60 font-bold rounded-xl">
                Disable 2FA
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setStep("enrolled"); clearError(); }}
                disabled={isLoading}
                className="rounded-xl"
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
