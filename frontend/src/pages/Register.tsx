import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
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
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    companyName?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
    code?: boolean;
  }>({});
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
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setFieldErrors({ password: true, confirmPassword: true });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.onboard({ name, companyName, email, password });
      if ("pendingVerification" in response && response.pendingVerification) {
        setStep("verify");
        setResendCooldown(60);
      } else if ("token" in response && response.token) {
        login(response.token, response.user);
        navigate("/", { replace: true });
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      setFieldErrors({ email: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await authService.verifyEmail(email, code);
      login(response.token, response.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors({ code: true });
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
      <Card className="w-full max-w-md border border-[#23252a] bg-[#0f1011] rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden">
        {step === "register" ? (
          <>
            <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#010102] border border-[#23252a] shadow-xl">
                <img src={jaktraLogo} alt="Jaktra Logo" className="h-7 w-7 object-contain" />
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
                  <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-400 mr-2 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    required
                    error={fieldErrors.name}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false }));
                    }}
                    placeholder="Jane Doe"
                    disabled={isLoading}
                  />
                  <Input
                    label="Company Name"
                    type="text"
                    required
                    error={fieldErrors.companyName}
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (fieldErrors.companyName) setFieldErrors(prev => ({ ...prev, companyName: false }));
                    }}
                    placeholder="Acme Corp"
                    disabled={isLoading}
                  />
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
                  <Input
                    label="Confirm password"
                    type="password"
                    required
                    error={fieldErrors.confirmPassword}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: false }));
                    }}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full font-bold rounded-xl py-2.5" size="lg" isLoading={isLoading}>
                  Register
                </Button>
                <p className="text-center text-xs text-[#8a8f98]">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-[#f7f8f8] hover:underline transition-colors">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-4 text-center pb-6 border-b border-[#23252a]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#010102] border border-[#23252a] shadow-xl">
                <Mail className="h-6 w-6 text-[#f7f8f8]" />
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
                  <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-400 mr-2 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </div>
                )}
                {resendSuccess && (
                  <div className="p-3 bg-[#27a644]/10 border border-[#27a644]/30 rounded-xl text-xs text-[#27a644] font-medium">
                    {resendSuccess}
                  </div>
                )}
                <div className="space-y-4">
                  <Input
                    label="Verification Code"
                    type="text"
                    required
                    maxLength={6}
                    error={fieldErrors.code}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ''));
                      if (fieldErrors.code) setFieldErrors(prev => ({ ...prev, code: false }));
                    }}
                    placeholder="123456"
                    disabled={isLoading}
                    className="text-center text-xl tracking-widest font-mono"
                  />
                </div>
                <Button type="submit" className="w-full font-bold rounded-xl py-2.5" size="lg" isLoading={isLoading} disabled={code.length !== 6}>
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
                        className="font-semibold text-[#f7f8f8] hover:underline disabled:opacity-40 transition-colors cursor-pointer"
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
                      setFieldErrors({});
                    }}
                    className="inline-flex items-center justify-center font-medium text-[#8a8f98] hover:text-[#f7f8f8] mt-2 transition-colors cursor-pointer"
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
