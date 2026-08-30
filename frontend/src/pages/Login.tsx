import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../utils/error-utils";
import { AuthLayout } from "../layouts/AuthLayout";
import { useIsInsideAuthLayout } from "../contexts/AuthLayoutContext";

type LoginStep = "credentials" | "mfa";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean; mfaCode?: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<LoginStep>("credentials");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const isInsideAuthLayout = useIsInsideAuthLayout();

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });

      if ("token" in response && response.token) {
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

  const content = (
    <>
      {step === "credentials" ? (
        <>
          <div>
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl text-white">
              Welcome back
            </h1>
            <p className="text-xs text-white/50 mt-1.5">
              Sign in to access your autonomous credit operations console.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="mt-7 space-y-4">
            {/* Work Email */}
            <div className="space-y-1.5 text-left w-full">
              <label className="text-xs font-semibold text-white/70">
                Work email <span className="text-red-400">*</span>
              </label>
              <div
                className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${
                  fieldErrors.email ? "border-red-500/70" : "border-white/10"
                }`}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: false }));
                  }}
                  placeholder="you@company.com"
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left w-full">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/70">
                  Password <span className="text-red-400">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#b7d2f8] hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div
                className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${
                  fieldErrors.password ? "border-red-500/70" : "border-white/10"
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: false }));
                  }}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30 pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-white/40 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white text-sm font-semibold text-black transition-all hover:bg-[#b7d2f8] hover:border-[#b7d2f8] hover:shadow-[0_0_24px_rgba(183,210,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-xs text-white/50 pt-2">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-white hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </>
      ) : (
        /* MFA Screen */
        <div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#b7d2f8] mb-5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl text-white">
            Two-factor authentication
          </h1>
          <p className="text-xs text-white/50 mt-1.5">
            {useBackupCode
              ? "Enter one of your emergency recovery backup codes"
              : "Enter the 6-digit code from your authenticator app"}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleMfaSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5 text-left w-full">
              <label className="text-xs font-semibold text-white/70">
                {useBackupCode ? "Backup Code" : "Authenticator Code"}
              </label>
              <div className="relative flex h-12 items-center rounded-lg border border-white/10 bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8]">
                <input
                  type="text"
                  inputMode={useBackupCode ? "text" : "numeric"}
                  maxLength={useBackupCode ? 10 : 6}
                  required
                  value={mfaCode}
                  onChange={(e) => {
                    setMfaCode(e.target.value);
                    if (fieldErrors.mfaCode) setFieldErrors((prev) => ({ ...prev, mfaCode: false }));
                  }}
                  placeholder={useBackupCode ? "XXXXXXXXXX" : "000000"}
                  disabled={isLoading}
                  autoFocus
                  className="w-full bg-transparent text-center text-xl tracking-widest font-mono text-white outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white text-sm font-semibold text-black transition-all hover:bg-[#b7d2f8] hover:border-[#b7d2f8] hover:shadow-[0_0_24px_rgba(183,210,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="flex flex-col space-y-3 text-center text-xs pt-3">
              <button
                type="button"
                className="font-medium text-[#b7d2f8] hover:underline cursor-pointer transition-colors"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setMfaCode("");
                  setError("");
                }}
              >
                {useBackupCode ? "Use authenticator app instead" : "Use a backup code instead"}
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                onClick={handleBackToCredentials}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to login
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );

  if (!isInsideAuthLayout) {
    return <AuthLayout>{content}</AuthLayout>;
  }

  return content;
}
