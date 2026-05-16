import React, { useState, useEffect } from "react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Lock } from "lucide-react";
import { authService } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { getErrorMessage } from "../utils/error-utils";

type ResetStep = "email" | "verify" | "reset";

export function ForgotPassword() {
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

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
    setIsLoading(true);

    try {
      // Regardless of email existence, backend returns the generic response.
      await authService.forgotPassword(email);
      setStep("verify");
      setResendCooldown(60);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");
    setIsLoading(true);

    try {
      const response = await authService.resetPasswordVerify(email, code);
      setResetToken(response.resetToken);
      setStep("reset");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPasswordConfirm(resetToken, newPassword);
      // Auto-login on success
      login(response.token, response.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#010102] text-[#f7f8f8] p-4">
      <Card className="w-full max-w-md border border-[#23252a] bg-[#0f1011] shadow-2xl transition-all duration-300">
        {step === "email" && (
          <>
            <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20">
                <img src={jaktraLogo} alt="Jaktra Logo" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-[#f7f8f8]">Forgot password?</CardTitle>
                <p className="text-xs text-[#8a8f98] mt-1.5">
                  Enter your email address to request a password reset code
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}
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
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Send Reset Code
                </Button>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Back to login
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "verify" && (
          <>
            <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20">
                <Mail className="h-6 w-6 text-[#5e6ad2]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-[#f7f8f8]">Verify reset code</CardTitle>
                <p className="text-xs text-[#8a8f98] mt-1.5 px-4">
                  If an account exists with <span className="font-semibold text-[#f7f8f8]">{email}</span>, a 6-digit code has been sent.
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleVerifySubmit} className="space-y-5">
                {error && (
                  <div className="rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}
                {resendSuccess && (
                  <div className="rounded-md bg-[#27a644]/10 border border-[#27a644]/30 p-3 text-xs text-[#27a644]">
                    {resendSuccess}
                  </div>
                )}
                <div className="space-y-4">
                  <Input
                    label="Verification Code"
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    disabled={isLoading}
                    className="text-center text-xl tracking-widest font-mono"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={code.length !== 6}>
                  Verify Code
                </Button>

                <div className="flex flex-col space-y-3 text-center text-xs">
                  <div>
                    {resendCooldown > 0 ? (
                      <span className="text-[#8a8f98]">
                        Resend code in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isLoading}
                        className="font-semibold text-[#5e6ad2] hover:text-[#828fff] disabled:opacity-40 transition-colors"
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
                    }}
                    className="inline-flex items-center justify-center font-medium text-[#8a8f98] hover:text-[#f7f8f8] mt-2 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Use a different email address
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "reset" && (
          <>
            <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20">
                <Lock className="h-6 w-6 text-[#5e6ad2]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-[#f7f8f8]">Reset password</CardTitle>
                <p className="text-xs text-[#8a8f98] mt-1.5">
                  Please choose a secure new password for your account
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleResetSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Reset Password
                </Button>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Back to login
                  </Link>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

