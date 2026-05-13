import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Mail, ArrowLeft } from "lucide-react";
import { authService } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { getErrorMessage } from "../utils/error-utils";

export function Register() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.onboard({ name, companyName, email, password });
      if ("pendingVerification" in response && response.pendingVerification) {
        setStep("verify");
        setResendCooldown(60);
      } else if ("token" in response && response.token) {
        // Fallback for direct logins (if any)
        login(response.token, response.user);
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");
    setIsLoading(true);

    try {
      const response = await authService.verifyEmail(email, code);
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
      await authService.resendVerification(email);
      setResendSuccess("A new code has been sent to your email.");
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
        {step === "register" ? (
          <>
            <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20">
                <Bot className="h-6 w-6 text-[#5e6ad2]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-[#f7f8f8]">Create an account</CardTitle>
                <p className="text-xs text-[#8a8f98] mt-1.5">
                  Start automating your credit operations
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 transition-all duration-200">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={isLoading}
                  />
                  <Input
                    label="Company Name"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    disabled={isLoading}
                  />
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
                  <Input
                    label="Confirm password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Register
                </Button>
                <p className="text-center text-xs text-[#8a8f98]">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-[#5e6ad2] hover:text-[#828fff] transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]/60">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5e6ad2]/10 border border-[#5e6ad2]/20">
                <Mail className="h-6 w-6 text-[#5e6ad2]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-[#f7f8f8]">Verify your email</CardTitle>
                <p className="text-xs text-[#8a8f98] mt-1.5 px-4">
                  We sent a 6-digit verification code to <span className="font-semibold text-[#f7f8f8]">{email}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleVerify} className="space-y-5">
                {error && (
                  <div className="rounded-md bg-red-950/40 border border-red-900/50 p-3 text-xs text-red-400 transition-all duration-200">
                    {error}
                  </div>
                )}
                {resendSuccess && (
                  <div className="rounded-md bg-[#27a644]/10 border border-[#27a644]/30 p-3 text-xs text-[#27a644] transition-all duration-200">
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
                    placeholder="123456"
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
                      setStep("register");
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
      </Card>
    </div>
  );
}

