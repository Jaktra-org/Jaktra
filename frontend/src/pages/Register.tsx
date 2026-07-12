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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl transition-all duration-300">
        {step === "register" ? (
          <>
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 animate-pulse">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                <p className="text-sm text-slate-500 mt-2">
                  Start automating your credit operations
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 transition-all duration-200">
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
                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-8 w-8 text-blue-600 animate-bounce" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">Verify your email</CardTitle>
                <p className="text-sm text-slate-500 mt-2 px-4">
                  We sent a 6-digit verification code to <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 transition-all duration-200">
                    {error}
                  </div>
                )}
                {resendSuccess && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 transition-all duration-200">
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

                <div className="flex flex-col space-y-4 text-center text-sm">
                  <div>
                    {resendCooldown > 0 ? (
                      <span className="text-slate-500">
                        Resend code in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isLoading}
                        className="font-semibold text-blue-600 hover:text-blue-500 disabled:opacity-50"
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
                    className="inline-flex items-center justify-center font-medium text-slate-600 hover:text-slate-800 mt-2"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
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
