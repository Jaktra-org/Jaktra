import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { authService } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { getErrorMessage } from "../utils/error-utils";

type LoginStep = "credentials" | "mfa";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean; mfaCode?: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<LoginStep>("credentials");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      if ('token' in response) {
        login(response.token, response.user);
        navigate(from, { replace: true });
      } else {
        setStep("mfa");
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors({ email: true, password: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authService.mfaVerify(mfaCode.trim());
      login(response.token, response.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors({ mfaCode: true });
      const msg = getErrorMessage(err).toLowerCase();
      if (msg.includes("session") || msg.includes("expired")) {
        setStep("credentials");
        setMfaCode("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setMfaCode("");
    setError("");
    setFieldErrors({});
    sessionStorage.removeItem("mfa_pending_token");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#010102] text-[#f7f8f8] p-4">
      <Card className="w-full max-w-md border border-[#23252a] bg-[#0f1011] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#010102] border border-[#23252a] shadow-xl">
            {step === "mfa" ? (
              <ShieldCheck className="h-6 w-6 text-[#f7f8f8]" />
            ) : (
              <img src={jaktraLogo} alt="Jaktra Logo" className="h-7 w-7 object-contain" />
            )}
          </div>
          <div>
            {step === "credentials" ? (
              <>
                <CardTitle className="text-xl font-bold tracking-tight text-[#f7f8f8]">Welcome back</CardTitle>
                <p className="text-xs text-[#8a8f98] mt-1.5">Sign in to your Jaktra account</p>
              </>
            ) : (
              <>
                <CardTitle className="text-xl font-bold tracking-tight text-[#f7f8f8]">Two-factor authentication</CardTitle>
                <p className="text-xs text-[#8a8f98] mt-1.5">
                  {useBackupCode
                    ? "Enter one of your backup codes"
                    : "Enter the 6-digit code from your authenticator app"}
                </p>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  required
                  error={fieldErrors.email}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: false }));
                  }}
                  placeholder="you@company.com"
                  disabled={isLoading}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type="password"
                    required
                    error={fieldErrors.password}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: false }));
                    }}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <div className="text-right mt-1.5">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full font-bold rounded-xl py-2.5" size="lg" isLoading={isLoading}>
                Sign in
              </Button>
              <p className="text-center text-xs text-[#8a8f98]">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-[#f7f8f8] hover:underline transition-colors">
                  Sign up
                </Link>
              </p>
            </form>
          )}

          {step === "mfa" && (
            <form onSubmit={handleMfaSubmit} className="space-y-5">
              <div className="space-y-4">
                <Input
                  label={useBackupCode ? "Backup code" : "Authenticator code"}
                  type="text"
                  inputMode={useBackupCode ? "text" : "numeric"}
                  required
                  error={fieldErrors.mfaCode}
                  value={mfaCode}
                  onChange={(e) => {
                    setMfaCode(e.target.value);
                    if (fieldErrors.mfaCode) setFieldErrors(prev => ({ ...prev, mfaCode: false }));
                  }}
                  placeholder={useBackupCode ? "XXXXXXXXXX" : "000000"}
                  maxLength={useBackupCode ? 10 : 6}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full font-bold rounded-xl py-2.5" size="lg" isLoading={isLoading}>
                Verify
              </Button>

              <div className="space-y-2 text-center">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#8a8f98] hover:text-[#f7f8f8] transition-colors cursor-pointer"
                  onClick={() => {
                    setUseBackupCode((v) => !v);
                    setMfaCode("");
                    setError("");
                    setFieldErrors({});
                  }}
                >
                  {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
                </button>
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-[#8a8f98] hover:text-[#f7f8f8] mx-auto transition-colors cursor-pointer"
                    onClick={handleBackToCredentials}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to login
                  </button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
