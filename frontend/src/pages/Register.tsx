import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { StackedCardsDeck } from "../components/landing/StackedCardsDeck";
import { authService } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../utils/error-utils";

export function Register() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(true);
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
    window.scrollTo(0, 0);
  }, []);

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

    if (!name.trim()) {
      setError("Please enter your full name");
      setFieldErrors({ name: true });
      return;
    }

    if (!companyName.trim()) {
      setError("Please enter your company name");
      setFieldErrors({ companyName: true });
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid work email address");
      setFieldErrors({ email: true });
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setFieldErrors({ password: true });
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setFieldErrors({ password: true, confirmPassword: true });
      return;
    }

    if (!acceptTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.onboard({
        name: name.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        password,
      });

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
    <section className="min-h-screen bg-[#050505] text-white antialiased [font-synthesis:none]">
      <div className="grid min-h-screen lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Side - SignUp Form */}
        <div className="flex min-h-[760px] items-center justify-center bg-[#0a0a0c] border-b lg:border-b-0 lg:border-r border-white/10 px-6 py-10 sm:px-10 lg:min-h-screen lg:px-14 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-[460px]">
            {step === "register" ? (
              <>
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-7">
                  <Link to="/" className="inline-flex items-center gap-2.5 text-white no-underline">
                    <img src={jaktraLogo} alt="Jaktra Logo" className="h-6 w-auto object-contain" />
                    <span className="font-semibold text-lg tracking-tight">Jaktra</span>
                  </Link>
                  <Link
                    to="/"
                    className="text-xs text-white/50 hover:text-white transition-colors no-underline inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Home
                  </Link>
                </div>

                <div>
                  <h1 className="text-3xl font-medium tracking-tight sm:text-4xl text-white">
                    Create an account
                  </h1>
                  <p className="text-xs text-white/50 mt-1.5">
                    Start automating your credit operations and recover cash on autopilot.
                  </p>
                </div>


                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5 text-left w-full">
                    <label className="text-xs font-semibold text-white/70">
                      Full name <span className="text-red-400">*</span>
                    </label>
                    <div className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${fieldErrors.name ? 'border-red-500/70' : 'border-white/10'}`}>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: false }));
                        }}
                        placeholder="Jane Doe"
                        disabled={isLoading}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5 text-left w-full">
                    <label className="text-xs font-semibold text-white/70">
                      Company name <span className="text-red-400">*</span>
                    </label>
                    <div className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${fieldErrors.companyName ? 'border-red-500/70' : 'border-white/10'}`}>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (fieldErrors.companyName) setFieldErrors((prev) => ({ ...prev, companyName: false }));
                        }}
                        placeholder="Acme Corp"
                        disabled={isLoading}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1.5 text-left w-full">
                    <label className="text-xs font-semibold text-white/70">
                      Work email <span className="text-red-400">*</span>
                    </label>
                    <div className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${fieldErrors.email ? 'border-red-500/70' : 'border-white/10'}`}>
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

                  {/* Password & Confirm Password */}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left w-full">
                      <label className="text-xs font-semibold text-white/70">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${fieldErrors.password ? 'border-red-500/70' : 'border-white/10'}`}>
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

                    <div className="space-y-1.5 text-left w-full">
                      <label className="text-xs font-semibold text-white/70">
                        Confirm password <span className="text-red-400">*</span>
                      </label>
                      <div className={`relative flex h-11 items-center rounded-lg border bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8] ${fieldErrors.confirmPassword ? 'border-red-500/70' : 'border-white/10'}`}>
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
                  </div>

                  {/* Terms Checkbox */}
                  <div className="pt-2 text-xs leading-5 text-white/50 sm:text-[13px]">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <span className="relative mt-0.5 size-4 shrink-0">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="peer size-full cursor-pointer appearance-none rounded-[4px] border border-white/20 bg-white/5 checked:border-[#b7d2f8] checked:bg-[#b7d2f8]"
                        />
                        <svg
                          viewBox="0 0 12 12"
                          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-[#050505] peer-checked:block"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="M3 6.2 5 8.1 9 3.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>
                        By creating an account, you agree to our{" "}
                        <Link to="/terms" target="_blank" className="font-medium text-[#b7d2f8] underline underline-offset-2 hover:text-white transition-colors">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" target="_blank" className="font-medium text-[#b7d2f8] underline underline-offset-2 hover:text-white transition-colors">
                          Privacy Policy
                        </Link>.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 flex h-11 w-full items-center justify-center rounded-lg border border-white/20 bg-white text-sm font-semibold text-black transition-all hover:bg-[#b7d2f8] hover:border-[#b7d2f8] hover:shadow-[0_0_24px_rgba(183,210,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>

                  <p className="text-center text-xs text-white/50 pt-2">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-white hover:underline transition-colors">
                      Sign in
                    </Link>
                  </p>
                </form>
              </>
            ) : (
              /* Email Verification Step */
              <div>
                <div className="flex items-center justify-between mb-7">
                  <Link to="/" className="inline-flex items-center gap-2.5 text-white no-underline">
                    <img src={jaktraLogo} alt="Jaktra Logo" className="h-6 w-auto object-contain" />
                    <span className="font-semibold text-lg tracking-tight">Jaktra</span>
                  </Link>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#b7d2f8] mb-5">
                  <Mail className="w-6 h-6" />
                </div>

                <h1 className="text-2xl font-medium tracking-tight sm:text-3xl text-white">
                  Verify your email
                </h1>
                <p className="text-xs text-white/50 mt-1.5">
                  We sent a 6-digit verification code to{" "}
                  <span className="text-white font-semibold">{email}</span>
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400 font-medium">{error}</p>
                  </motion.div>
                )}

                {resendSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 font-medium"
                  >
                    {resendSuccess}
                  </motion.div>
                )}

                <form onSubmit={handleVerify} className="mt-6 space-y-4">
                  <div className="space-y-1.5 text-left w-full">
                    <label className="text-xs font-semibold text-white/70">6-Digit Code</label>
                    <div className="relative flex h-12 items-center rounded-lg border border-white/10 bg-white/5 px-3.5 transition-colors focus-within:border-[#b7d2f8]">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value.replace(/\D/g, ""));
                          if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: false }));
                        }}
                        placeholder="123456"
                        disabled={isLoading}
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
                        setStep("register");
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
          </div>
        </div>

        {/* Right Side - Marketing Testimonial and Jaktra Mockup with Fluted Glass Aesthetics */}
        <div className="relative flex min-h-[720px] flex-col overflow-hidden bg-gradient-to-b from-[#071551] via-[#060913] to-[#040507] p-8 text-white sm:p-12 lg:min-h-screen lg:p-16">
          {/* Fluted Glass Shader Effect (pure high-performance CSS pattern) */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 24px)",
              backgroundSize: "24px 100%",
            }}
          />

          {/* Prismatic ambient reflection overlay */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 75% 20%, rgba(183, 210, 248, 0.22) 0%, rgba(7, 21, 81, 0.35) 45%, transparent 70%)",
            }}
          />

          <div className="relative z-10 h-full w-full flex flex-col justify-between">
            <div className="max-w-[500px] pt-2 lg:pt-4">
              {/* Core Value Proposition Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.7,
                  delay: 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-2xl font-light leading-tight tracking-[-0.035em] text-white/95 sm:text-3xl lg:text-[34px]"
              >
                Turn overdue receivables into collected cash — on autopilot.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.7,
                  delay: 0.14,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-3 text-xs leading-relaxed text-white/60 sm:text-sm max-w-[460px]"
              >
                Self-driving reminder cadences, AI debtor reply triage, and real-time ledger reconciliation across your entire invoice portfolio.
              </motion.p>
            </div>

            {/* Tilted 3D Stacked Cards Deck (Authentic Jaktra Invoices & Aging Ledger) */}
            <motion.div
              initial={{ opacity: 0, y: 65 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 1,
                delay: 0.22,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 w-full select-none sm:translate-y-[2%] lg:absolute lg:left-[4%] lg:-bottom-20 lg:mt-0 lg:w-[115%] lg:max-w-none lg:origin-bottom-left lg:-rotate-3 xl:left-[6%] xl:-bottom-[105px] xl:w-[118%] 2xl:-bottom-[125px] 2xl:w-[122%]"
            >
              <div className="origin-bottom-left scale-[0.78] sm:scale-[0.84] lg:scale-[0.82] xl:scale-[0.90] 2xl:scale-100 transition-transform">
                <StackedCardsDeck autoCycle={true} cycleInterval={6500} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


