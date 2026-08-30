import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { authService } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../utils/error-utils";
import { AuthLayout } from "../layouts/AuthLayout";
import { useIsInsideAuthLayout } from "../contexts/AuthLayoutContext";

type ResetStep = "email" | "verify" | "reset";

export function ForgotPassword() {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: boolean;
    code?: boolean;
    newPassword?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const isInsideAuthLayout = useIsInsideAuthLayout();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setStep("verify");
      setResendCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors({ email: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authService.resetPasswordVerify(email, code);
      setResetToken(response.resetToken);
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors({ code: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setFieldErrors({ newPassword: true, confirmPassword: true });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPasswordConfirm(resetToken, newPassword);
      login(response.token, response.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors({ newPassword: true, confirmPassword: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendSuccess("");
    setIsLoading(true);

    try {
      await authService.resetPasswordResend(email);
      setResendSuccess("A new reset code has been sent.");
      setResendCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <>
      {/* Step 1: Request Email */}
      {step === "email" && (
        <>
          <div>
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl text-white">
              Forgot password?
            </h1>
            <p className="text-xs text-white/50 mt-1.5">
              Enter your email address to request a password reset code
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

          <form onSubmit={handleEmailSubmit} className="mt-7 space-y-4">
            {/* Email address */}
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

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white text-sm font-semibold text-black transition-all hover:bg-[#b7d2f8] hover:border-[#b7d2f8] hover:shadow-[0_0_24px_rgba(183,210,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Sending code..." : "Send Reset Code"}
            </button>

            <p className="text-center text-xs text-white/50 pt-2">
              Remember your password?{" "}
              <Link to="/login" className="font-semibold text-white hover:underline transition-colors">
                Back to login
              </Link>
            </p>
          </form>
        </>
      )}

      {/* Step 2: Verification Code */}
      {step === "verify" && (
        <div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#b7d2f8] mb-5">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl text-white">
            Verify reset code
          </h1>
          <p className="text-xs text-white/50 mt-1.5">
            If an account exists with <span className="text-white font-semibold">{email}</span>, a 6-digit code has been sent.
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

          {resendSuccess && (
            <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 font-medium">
              {resendSuccess}
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5 text-left w-full">
              <label className="text-xs font-semibold text-white/70">
                6-Digit Code
              </label>
              <div className="relative flex h-12 items-center rounded-lg border border-white/10 bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8]">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: false }));
                  }}
                  placeholder="000000"
                  disabled={isLoading}
                  autoFocus
                  className="w-full bg-transparent text-center text-xl tracking-widest font-mono text-white outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="flex h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white text-sm font-semibold text-black transition-all hover:bg-[#b7d2f8] hover:border-[#b7d2f8] hover:shadow-[0_0_24px_rgba(183,210,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="flex flex-col space-y-3 text-center text-xs pt-3">
              <div>
                {resendCooldown > 0 ? (
                  <span className="text-white/40">Resend code in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="font-semibold text-[#b7d2f8] hover:underline cursor-pointer transition-colors"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setResendSuccess("");
                  setCode("");
                  setFieldErrors({});
                }}
                className="inline-flex items-center justify-center font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Use a different email address
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Set New Password */}
      {step === "reset" && (
        <div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#b7d2f8] mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl text-white">
            Reset password
          </h1>
          <p className="text-xs text-white/50 mt-1.5">
            Please choose a secure new password for your account
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

          <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
            {/* New Password */}
            <div className="space-y-1.5 text-left w-full">
              <label className="text-xs font-semibold text-white/70">
                New password <span className="text-red-400">*</span>
              </label>
              <div
                className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${
                  fieldErrors.newPassword ? "border-red-500/70" : "border-white/10"
                }`}
              >
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: false }));
                  }}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30 pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-white/40 hover:text-white cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5 text-left w-full">
              <label className="text-xs font-semibold text-white/70">
                Confirm new password <span className="text-red-400">*</span>
              </label>
              <div
                className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${
                  fieldErrors.confirmPassword ? "border-red-500/70" : "border-white/10"
                }`}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: false }));
                  }}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30 pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-white/40 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white text-sm font-semibold text-black transition-all hover:bg-[#b7d2f8] hover:border-[#b7d2f8] hover:shadow-[0_0_24px_rgba(183,210,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center text-xs text-white/50 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-semibold text-white/70 hover:text-white hover:underline transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back to login
              </Link>
            </p>
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
