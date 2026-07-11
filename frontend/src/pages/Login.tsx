import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bot, ShieldCheck, ArrowLeft } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<LoginStep>("credentials");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.mfaVerify(mfaCode.trim());
      login(response.token, response.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
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
    sessionStorage.removeItem("mfa_pending_token");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            {step === "mfa" ? (
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            ) : (
              <Bot className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <div>
            {step === "credentials" ? (
              <>
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <p className="text-sm text-slate-500 mt-2">Sign in to your Jaktra account</p>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold tracking-tight">Two-factor authentication</CardTitle>
                <p className="text-sm text-slate-500 mt-2">
                  {useBackupCode
                    ? "Enter one of your backup codes"
                    : "Enter the 6-digit code from your authenticator app"}
                </p>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 mb-4">
              {error}
            </div>
          )}

          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  disabled={isLoading}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Sign in
              </Button>
              <p className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                  Register
                </Link>
              </p>
            </form>
          )}

          {step === "mfa" && (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label={useBackupCode ? "Backup code" : "Authenticator code"}
                  type="text"
                  inputMode={useBackupCode ? "text" : "numeric"}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder={useBackupCode ? "XXXXXXXXXX" : "000000"}
                  maxLength={useBackupCode ? 10 : 6}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Verify
              </Button>

              <div className="space-y-2 text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 underline"
                  onClick={() => {
                    setUseBackupCode((v) => !v);
                    setMfaCode("");
                    setError("");
                  }}
                >
                  {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
                </button>
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mx-auto"
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
