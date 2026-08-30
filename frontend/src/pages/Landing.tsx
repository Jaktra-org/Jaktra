import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Menu, X, ChevronDown } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import "../styles/jaktra-theme.css";
import { StackedCardsDeck } from "../components/landing/StackedCardsDeck";
import { PLATFORM_CARDS } from "../components/landing/platformCards";

/* ─── Jaktra brand logo as SVG mark ──────────────────────────────── */
function JaktraMark({ size = 22 }: { size?: number }) {
  return (
    <img src={jaktraLogo} alt="Jaktra" style={{ height: size, width: "auto" }} />
  );
}

/* ─── Authentic integrations & infrastructure brand marks ─────────── */
function SendGridMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 2H2v9h9V2zm11 0h-9v9h9V2zm-11 11H2v9h9v-9zm11 0h-9v9h9v-9z" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>SENDGRID</span>
    </div>
  );
}

function ResendMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm4 4v10l10-5L7 7z" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>RESEND</span>
    </div>
  );
}

function SmtpMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 7L2 7" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>CUSTOM SMTP</span>
    </div>
  );
}

function RazorpayMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="m14.5 2-8 14h5.5L10 22l9.5-14h-5.5L14.5 2z" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>RAZORPAY</span>
    </div>
  );
}

function PostgresMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>POSTGRESQL</span>
    </div>
  );
}

function AesMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>AES-256 GCM</span>
    </div>
  );
}

function WebhookMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>HMAC WEBHOOKS</span>
    </div>
  );
}

function CsvSyncMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.5, flexShrink: 0 }}>
      <svg height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.08em" }}>CSV INVOICE SYNC</span>
    </div>
  );
}

/* ─── Animated count-up number ───────────────────────────────────── */
function CountUp({ to, suffix, active }: { to: number; suffix: string; active: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = 1400;
    const start = performance.now();
    const decimal = !Number.isInteger(to);
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(decimal ? Math.round(e * to * 10) / 10 : Math.round(e * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, to]);
  return <>{val}{suffix}</>;
}

/* ─── Cycling metric text ─────────────────────────────────────────── */
const METRICS = ["Days Sales Outstanding", "Collection Velocity", "Dispute Resolution Rate", "Cash Recovery Rate"];

function CyclingMetric() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % METRICS.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={METRICS[idx]}
        style={{
          color: "#b7d2f8",
          textShadow: "0 0 18px rgba(183, 210, 248, 0.45)",
          display: "inline-block",
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      >
        {METRICS[idx]}
      </motion.span>
    </AnimatePresence>
  );
}

/* ─── Decrypt text animation (scramble → resolve) ────────────────── */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function DecryptText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState(() => text.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]));
  const [done, setDone] = useState(false);

  useEffect(() => {
    const totalDuration = 1200; // ms to fully resolve
    const startDelay = delay;
    const chars = text.split("");

    let raf: number;
    let startTime: number | null = null;

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      if (elapsed < startDelay * 1000) { raf = requestAnimationFrame(animate); return; }
      const adjusted = elapsed - startDelay * 1000;
      const progress = Math.min(adjusted / totalDuration, 1);

      setDisplayed(chars.map((ch, i) => {
        if (ch === " ") return " ";
        const revealAt = i / chars.length;
        if (progress >= revealAt + 0.15) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }));

      if (progress < 1) raf = requestAnimationFrame(animate);
      else setDone(true);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [text, delay]);

  return (
    <span aria-label={text}>
      {done
        ? text
        : displayed.map((ch, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: ch === text[i] ? "inherit" : "rgba(255,255,255,0.35)",
              }}
            >
              {ch}
            </span>
          ))}
    </span>
  );
}

/* ─── Real-Time Live Graph (Sequential Point Reveal Matching Frames 1-4) ── */
interface ExperimentMark {
  x: number;
  y: number;
  id: string;
  tag: string;
  threshold: number; // progress (0..1) when line passes this point
  badge?: string;
  adopted?: boolean;
  textPosition?: "above" | "below";
}

const EXPERIMENT_MARKS: ExperimentMark[] = [
  {
    x: 380,
    y: 240,
    id: "310103",
    tag: "CADENCE 310103",
    badge: "SETTLED",
    threshold: 0.26,
    adopted: true,
    textPosition: "below",
  },
  {
    x: 720,
    y: 205,
    id: "630200",
    tag: "ESCALATION 630200",
    threshold: 0.50,
    adopted: false,
    textPosition: "below",
  },
  {
    x: 1120,
    y: 110,
    id: "303015",
    tag: "DISPUTE ROUTE 303015",
    threshold: 0.78,
    adopted: false,
    textPosition: "above",
  },
];

const CURVE_PATH =
  "M 0,190 C 120,192 250,225 380,240 C 450,245 510,190 560,190 C 620,190 660,205 720,205 C 780,205 830,165 880,165 C 930,165 950,175 980,175 C 1040,175 1070,110 1120,110 C 1160,110 1180,120 1200,120 C 1250,120 1310,68 1380,68";

const AREA_PATH =
  "M 0,190 C 120,192 250,225 380,240 C 450,245 510,190 560,190 C 620,190 660,205 720,205 C 780,205 830,165 880,165 C 930,165 950,175 980,175 C 1040,175 1070,110 1120,110 C 1160,110 1180,120 1200,120 C 1250,120 1310,68 1380,68 L 1380,320 L 0,320 Z";

function HeroLiveGraph() {
  const [progress, setProgress] = useState(0);
  const [isAdopted, setIsAdopted] = useState(false);
  const [chartOpacity, setChartOpacity] = useState(1);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(1520);

  useEffect(() => {
    if (pathRef.current && typeof pathRef.current.getTotalLength === "function") {
      const len = pathRef.current.getTotalLength();
      if (len > 100) setPathLength(len);
    }
  }, []);

  useEffect(() => {
    let animId: number;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let running = true;

    const startDrawCycle = () => {
      setProgress(0);
      setIsAdopted(false);
      setChartOpacity(1);

      const drawDuration = 2600; // 2.6s smooth draw
      const startTime = performance.now();

      const step = (now: number) => {
        if (!running) return;
        const elapsed = now - startTime;
        const raw = Math.min(1, elapsed / drawDuration);
        // Smooth sine ease-in-out
        const eased = 0.5 - Math.cos(raw * Math.PI) / 2;
        setProgress(eased);

        if (raw < 1) {
          animId = requestAnimationFrame(step);
        } else {
          // Line arrived at tip! Trigger adoption highlight
          setIsAdopted(true);

          // Hold full visualization for 4.5s
          timerId = setTimeout(() => {
            if (!running) return;
            // Graceful fade out
            setChartOpacity(0);

            timerId = setTimeout(() => {
              if (!running) return;
              startDrawCycle();
            }, 600);
          }, 4500);
        }
      };

      animId = requestAnimationFrame(step);
    };

    startDrawCycle();

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      clearTimeout(timerId);
    };
  }, []);

  // Stroke color: luminous ice-blue (#b7d2f8)
  const strokeColor = "#b7d2f8";
  const strokeDashoffset = pathLength * (1 - progress);
  const areaOpacity = progress > 0.65 ? Math.min(0.24, ((progress - 0.65) / 0.35) * 0.24) : 0;

  return (
    <div
      className="gl-hero-chart"
      style={{
        opacity: chartOpacity,
        transition: "opacity 0.6s ease",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 320"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="liveAreaGrad" x1="0" y1="70" x2="0" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#b7d2f8" stopOpacity="0.26" />
            <stop offset="0.5" stopColor="#b7d2f8" stopOpacity="0.08" />
            <stop offset="1" stopColor="#071551" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill - fades in smoothly as line draws */}
        <path
          opacity={areaOpacity}
          fill="url(#liveAreaGrad)"
          d={AREA_PATH}
          style={{ transition: "opacity 0.3s ease" }}
        />

        {/* The Animated Line (Electric Cyan → Ice Blue) */}
        <path
          ref={pathRef}
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          d={CURVE_PATH}
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: strokeDashoffset,
            transition: "stroke 0.4s ease",
          }}
        />

        {/* Points appear dynamically as the line head reaches each threshold */}
        {EXPERIMENT_MARKS.map((m) => {
          const isRevealed = progress >= m.threshold;
          if (!isRevealed) return null;

          // When adopted, the winning experiment stays bright, others dim to 0.30
          const itemOpacity = isAdopted ? (m.adopted ? 1 : 0.30) : 0.90;

          return (
            <g
              key={m.id}
              style={{
                opacity: itemOpacity,
                transition: "opacity 0.4s ease",
              }}
            >
              {/* Target Crosshair (+) */}
              <line x1={m.x - 12} y1={m.y} x2={m.x + 12} y2={m.y} stroke="#ffffff" strokeWidth="1.3" />
              <line x1={m.x} y1={m.y - 12} x2={m.x} y2={m.y + 12} stroke="#ffffff" strokeWidth="1.3" />
              <circle cx={m.x} cy={m.y} r="2.5" fill={m.adopted && isAdopted ? "#b7d2f8" : "#ffffff"} />

              {/* Fintech Tag */}
              <text
                x={m.x}
                y={m.textPosition === "above" ? m.y - 18 : m.y + 20}
                textAnchor="middle"
                fontSize="9.5"
                fill="rgba(255,255,255,0.75)"
                fontFamily="'geistMono', monospace"
                letterSpacing="0.08em"
              >
                + {m.tag}
              </text>

              {/* SETTLED Badge lights up upon cycle completion */}
              {m.adopted && isAdopted && (
                <g transform={`translate(${m.x - 28}, ${m.y + 28})`}>
                  <rect
                    width="56"
                    height="17"
                    rx="3.5"
                    fill="rgba(183, 210, 248, 0.18)"
                    stroke="#b7d2f8"
                    strokeWidth="0.9"
                  />
                  <text
                    x="28"
                    y="12"
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#b7d2f8"
                    fontWeight="700"
                    fontFamily="'geistMono', monospace"
                    letterSpacing="0.06em"
                  >
                    {m.badge || "SETTLED"}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Tip pulsing ice-blue dot — positioned exactly at the stroke terminus */}
        {progress >= 0.96 && (
          <g>
            <circle
              className="gl-chart-tip-glow"
              cx="1380"
              cy="68"
              r="13"
              fill="#b7d2f8"
              opacity=".32"
            />
            <circle cx="1380" cy="68" r="4.5" fill="#b7d2f8" />
          </g>
        )}
      </svg>
    </div>
  );
}

/* ─── Hero section ───────────────────────────────────────────────── */
function HeroSection() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 320], [1, 0]);
  const heroY = useTransform(scrollY, [0, 320], [0, -45]);
  const heroScale = useTransform(scrollY, [0, 320], [1, 0.95]);
  const logoBarOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const glowMeshOpacity = useTransform(scrollY, [0, 400], [0.95, 0.15]);
  const chartScrollOpacity = useTransform(scrollY, [80, 340], [1, 0]);

  return (
    <section className="gl-hero">
      {/* Ambient warm glow — vertical beam of light */}
      <motion.div className="gl-glow-mesh" style={{ opacity: glowMeshOpacity }} />

      {/* Repeating 128px column grid */}
      <div className="gl-colgrid" />

      {/* Content */}
      <motion.div
        className="gl-hero-inner"
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
      >
        {/* Headline — scanline pixel-line font + scramble decrypt */}
        <motion.h1
          className="gl-hero-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: 0.1 }}
        >
          <span className="title-line">
            <DecryptText text="Life's too short to waste on" delay={0.1} />
          </span>
          <span className="title-line">
            <DecryptText text="manually moving invoices." delay={0.35} />
          </span>
        </motion.h1>

        {/* Sub-heading & controls */}
        <div className="gl-hero-sub-wrap">
          <motion.h2
            className="gl-hero-sub-h2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          >
            <span className="sub-line">AI-native AR automation that autonomously</span>
            <span className="sub-line">
              improves <span className="gl-metric-highlight"><CyclingMetric /></span>
            </span>
          </motion.h2>

          {/* Body copy */}
          <motion.p
            className="gl-hero-body"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.95, ease: "easeOut" }}
          >
            Put your accounts receivable on autopilot. Jaktra orchestrates intelligent collection cadences,
            triages debtor disputes with AI, and accelerates overdue cash recovery.
          </motion.p>

          {/* Hero CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 1.1 }}
          >
            <Link to="/register" className="gl-btn-demo">
              Get started
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* SVG hero chart — animated with dynamic point reveals */}
      <motion.div style={{ opacity: chartScrollOpacity }}>
        <HeroLiveGraph />
      </motion.div>

      {/* Integrations marquee pinned across bottom */}
      <motion.div className="gl-logo-bar" style={{ opacity: logoBarOpacity }}>
        <div className="gl-logo-track">
          {[1, 2, 3].flatMap((iter) => [
            <SendGridMark key={`sg-${iter}`} />,
            <RazorpayMark key={`rz-${iter}`} />,
            <ResendMark key={`rs-${iter}`} />,
            <SmtpMark key={`smtp-${iter}`} />,
            <PostgresMark key={`pg-${iter}`} />,
            <AesMark key={`aes-${iter}`} />,
            <WebhookMark key={`wh-${iter}`} />,
            <CsvSyncMark key={`csv-${iter}`} />,
          ])}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Stats band ─────────────────────────────────────────────────── */
function StatBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const stats = [
    { val: 3.1, suf: "×", label: "Faster collection cycle", note: "vs manual AR process" },
    { val: 68, suf: "%", label: "Less manual follow-up time", note: "for AR teams weekly" },
    { val: 94, suf: "%", label: "Email delivery success", note: "across all providers" },
    { val: 4, suf: " min", label: "Dispute classification time", note: "reply received → draft" },
  ];

  return (
    <section style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="gl-section" ref={ref}>
        <p style={{ fontSize: 11, color: "var(--fg-faint)", fontFamily: "var(--mono)", marginBottom: 24, letterSpacing: "0.05em" }}>
          * Estimated performance benchmarks based on internal modelling. Individual results may vary.
        </p>
        <div className="gl-stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} className={`gl-stat-cell gl-reveal${inView ? " visible" : ""}`} style={{ transitionDelay: `${i * 0.10}s` }}>
              <div className="gl-stat-val">
                <CountUp to={s.val} suffix={s.suf} active={inView} />
              </div>
              <div className="gl-stat-label">{s.label}</div>
              <div className="gl-stat-note">{s.note}*</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Platform console / 3D Stacked Card Showcase ────────────────── */
function PlatformConsole() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const sectionOpacity = useTransform(scrollYProgress, [0.05, 0.7], [0.2, 1]);

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      ref={containerRef}
      id="features-section"
      style={{
        position: "relative",
        backgroundColor: "var(--bg)",
        borderTop: "1px solid var(--border)",
        padding: "44px 44px 72px",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%" }}>
        <motion.div
          style={{
            opacity: sectionOpacity,
            display: "grid",
            gridTemplateColumns: "0.95fr 1.35fr",
            gap: "56px",
            alignItems: "center",
          }}
          className="gl-features-split"
        >
          {/* Left Column: Text & Interactive Feature Pills */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <span className="gl-eye">
                <span className="gl-eye-dot" />
                The platform
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--mono)",
                fontSize: "clamp(28px, 3.4vw, 42px)",
                fontWeight: 400,
                lineHeight: 1.16,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                margin: 0,
              }}
            >
              Autonomous invoice recovery, built for finance teams
            </h2>

            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.65,
                color: "rgba(255, 255, 255, 0.65)",
                margin: "20px 0 0 0",
                fontFamily: "var(--sans)",
                maxWidth: 480,
              }}
            >
              Every collection cycle runs automatically. Invoices escalate on scheduled cadences,
              debtor replies are triaged with AI, and payment plans close overdue balances — all monitored from a single console.
            </p>

            {/* Interactive Feature Pills for 4 Core Pages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 28, maxWidth: 480 }}>
              {PLATFORM_CARDS.map((card, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={card.id}
                    onClick={() => setActiveIndex(idx)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: isActive ? "1px solid rgba(255, 255, 255, 0.22)" : "1px solid rgba(255, 255, 255, 0.06)",
                      background: isActive ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.02)",
                      boxShadow: isActive ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)" }}>
                      {card.tabTitle}
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.45)", marginTop: 2 }}>
                      {card.tabSub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Right Column: 3D Stacked Cards Deck (Shared Component) */}
          <StackedCardsDeck
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            autoCycle={true}
            cycleInterval={5000}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── How it works — 3 steps ──────────────────────────────────────── */
function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      n: "01", title: "Connect your email & payment stack",
      body: "Link your SendGrid, SMTP, or Resend credentials and add a Razorpay key. No code required — takes under 10 minutes.",
      meta: "SendGrid · Any SMTP · Resend · Razorpay",
    },
    {
      n: "02", title: "Create or upload your invoices",
      body: "Create invoices directly or import via CSV. Jaktra reads debtor details, amounts, and due dates, mapping each invoice to the correct escalation stage immediately.",
      meta: "Manual creation · CSV import · QuickBooks/Xero coming soon",
    },
    {
      n: "03", title: "Let the closed loop run the cycle",
      body: "Outbound emails go on schedule. Replies are classified. Disputes are queued with AI-drafted responses. You intervene only when a human decision is needed.",
      meta: "Automated scheduling · AI triage · Full audit trail",
    },
  ];

  return (
    <section style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="gl-section">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }} ref={ref}>
          {/* Left: sticky heading */}
          <div style={{ position: "sticky", top: 72 }}>
            <div className={`gl-reveal${inView ? " visible" : ""}`}>
              <span className="gl-eye"><span className="gl-eye-dot" />Setup to collections</span>
            </div>
            <h2 className={`gl-h2 gl-reveal${inView ? " visible" : ""}`} style={{ transitionDelay: "0.08s", marginBottom: 20 }}>
              Connect.<br />Create.<br />Collect.
            </h2>
            <p className={`gl-body gl-reveal${inView ? " visible" : ""}`} style={{ maxWidth: 340, transitionDelay: "0.16s", marginBottom: 28 }}>
              Jaktra is operational in under a day. Your first automated collection cycle runs before your next stand-up.
            </p>
            <Link to="/register" className="gl-btn-demo">
              Start for free <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right: steps */}
          <div>
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                style={{ display: "flex", gap: 20, paddingBottom: i < steps.length - 1 ? 36 : 0 }}
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Step node */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      border: "1px solid var(--accent)",
                      background: "rgba(183, 210, 248, 0.10)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontFamily: "var(--mono)", color: "var(--accent)",
                    }}
                  >
                    {step.n}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, width: 1, background: "var(--border)", marginTop: 8, minHeight: 36 }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: i < steps.length - 1 ? 0 : 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8, marginTop: 5, letterSpacing: "-0.2px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--fg-muted)", marginBottom: 8 }}>{step.body}</p>
                  <span style={{ fontSize: 11, color: "var(--fg-faint)", fontFamily: "var(--mono)" }}>{step.meta}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Security section ───────────────────────────────────────────── */
function SecuritySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const items = [
    {
      title: "End-to-End Data Encryption",
      body: "All invoice records, debtor details, and financial credentials are encrypted at rest with AES-256 and in transit via TLS 1.3. Zero plaintext key storage.",
    },
    {
      title: "Role-Based Team Access",
      body: "Invite team members with distinct Admin and Member roles. Protect email settings, payment keys, and collection cadences with least-privilege access.",
    },
    {
      title: "Cryptographic Tenant Isolation",
      body: "Your organization's accounts receivable, invoices, and debtor ledgers are strictly partitioned by tenant ID. Zero cross-tenant data access.",
    },
    {
      title: "Cryptographic Webhook Verification",
      body: "Inbound debtor email replies and payment provider webhooks are authenticated via cryptographic signatures to reject unauthorized payloads.",
    },
    {
      title: "Comprehensive Audit Logs",
      body: "Tamper-evident logs recording every automated email dispatch, debtor reply, dispute review, and operator action with timestamps and actor IDs.",
    },
    {
      title: "Dead Letter Queue (DLQ) Recovery",
      body: "Failed email deliveries and bounces are automatically captured in the DLQ with exponential retry logic and operator controls so no message is lost.",
    },
  ];

  return (
    <section style={{ borderTop: "1px solid var(--border)", backgroundColor: "#0c0c0e" }}>
      <div className="gl-section" ref={ref} style={{ paddingTop: 20 }}>
        <div className={`gl-reveal${inView ? " visible" : ""}`} style={{ marginBottom: 16 }}>
          <span className="gl-eye"><span className="gl-eye-dot" />Security & compliance by design</span>
        </div>
        <h2 className={`gl-h2 gl-reveal${inView ? " visible" : ""}`} style={{ maxWidth: 520, marginBottom: 16, transitionDelay: "0.08s" }}>
          Built for the controls your IT team will ask about.
        </h2>
        <p className={`gl-body gl-reveal${inView ? " visible" : ""}`} style={{ maxWidth: 520, marginBottom: 40, transitionDelay: "0.16s" }}>
          Financial-grade governance, strict tenant isolation, and auditability engineered into the platform core.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              className="gl-kpi-feature"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.24 + i * 0.07, ease: [0.4, 0, 0.2, 1] }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 7, letterSpacing: "-0.2px" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--fg-muted)" }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Industries bento ────────────────────────────────────────────── */
function IndustriesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const industries = [
    { label: "B2B SaaS", copy: "Automate overdue subscription and license reminders. Debtors can pay instantly via the portal or request structured payment plans." },
    { label: "Agencies & Consulting", copy: "Collect unpaid project milestone and client invoices on time. Polite, staged cadences keep cash moving without awkward manual follow-ups." },
    { label: "IT & Managed Services", copy: "Send automated follow-ups for recurring service invoices. When clients send payment confirmation, AI detects it and pauses reminders immediately." },
    { label: "Wholesale & Trade", copy: "Track net-30 and net-60 commercial accounts across aging buckets. Automatically escalate overdue accounts through 5 progressive notice stages." },
    { label: "Staffing & Recruiting", copy: "Protect working capital when clients delay payment. Direct debtors to a branded self-service portal where they can view and settle invoices online." },
  ];

  return (
    <section style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="gl-section" ref={ref}>
        <div style={{ marginBottom: 36 }}>
          <div className={`gl-reveal${inView ? " visible" : ""}`}>
            <span className="gl-eye"><span className="gl-eye-dot" />Industries</span>
          </div>
          <h2 className={`gl-h2 gl-reveal${inView ? " visible" : ""}`} style={{ transitionDelay: "0.08s" }}>
            Automated recovery for every B2B billing cycle
          </h2>
          <p className={`gl-body gl-reveal${inView ? " visible" : ""}`} style={{ maxWidth: 520, paddingTop: 6, transitionDelay: "0.14s" }}>
            Whether you bill monthly subscriptions, consulting fees, or commercial orders, Jaktra automates follow-ups, payment plans, and dispute triage.
          </p>
        </div>

        <div className="gl-bento">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.label}
              className="gl-bento-cell"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.38, delay: 0.15 + i * 0.05, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="gl-bento-label">
                {ind.label}
                <ArrowRight size={13} style={{ color: "var(--fg-faint)" }} />
              </div>
              <div className="gl-bento-copy">{ind.copy}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Platform Spotlight (Autonomous Autopilot Recovery Engine) ──── */
function CustomerSpotlightSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section style={{ borderTop: "1px solid var(--border)", backgroundColor: "#0b0b0e" }}>
      <div className="gl-section" ref={ref}>
        <div className={`gl-reveal${inView ? " visible" : ""}`} style={{ marginBottom: 20 }}>
          <span className="gl-eye">
            <span className="gl-eye-dot" />
            Autopilot Spotlight
          </span>
        </div>

        <motion.div
          className="gl-spotlight"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Left Column: Visual with Crosshair & Stat Badge */}
          <div className="gl-spotlight-img-wrap">
            <svg
              className="gl-spotlight-crosshair"
              viewBox="0 0 100 100"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            >
              <line x1="20" y1="50" x2="40" y2="50" />
              <line x1="60" y1="50" x2="80" y2="50" />
              <line x1="50" y1="20" x2="50" y2="40" />
              <line x1="50" y1="60" x2="50" y2="80" />
              <circle cx="50" cy="50" r="14" strokeDasharray="3 3" />
            </svg>

            {/* Ambient Jaktra ice-blue & navy glow overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle at 60% 45%, rgba(183, 210, 248, 0.25) 0%, rgba(7, 21, 81, 0.45) 45%, transparent 70%)",
              }}
            />

            {/* Stat in bottom right */}
            <div className="gl-spotlight-stat">
              <div className="gl-spotlight-stat-lbl">Autonomous Cadence</div>
              <div className="gl-spotlight-stat-num">24/7</div>
            </div>
          </div>

          {/* Right Column: Engine spotlight content */}
          <div className="gl-spotlight-content">
            <div className="gl-spotlight-logo-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <JaktraMark size={20} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.12em", fontFamily: "var(--mono)", textTransform: "uppercase" }}>
                  Jaktra Autopilot Engine
                </span>
              </div>
            </div>

            <h3 className="gl-spotlight-h3">
              How the autonomous collection engine recovers overdue invoices without manual chasing
            </h3>

            <div>
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                Explore autopilot <ArrowRight size={13} style={{ color: "var(--accent)" }} />
              </Link>
            </div>

            <p className="gl-spotlight-quote" style={{ fontStyle: "normal" }}>
              Manual AR follow-ups are time-consuming and uncomfortable for finance teams. Jaktra runs as a continuous background engine — tracking due dates across aging buckets, dispatching multi-stage escalation notices, and immediately holding cadences the second a debtor pays or opens a dispute.
            </p>

            <div className="gl-spotlight-author">
              <div className="gl-spotlight-avatar" style={{ background: "rgba(183, 210, 248, 0.12)", border: "1px solid rgba(183, 210, 248, 0.30)", color: "#b7d2f8" }}>
                AR
              </div>
              <div>
                <div className="gl-spotlight-author-name">Closed-Loop Recovery Cadence</div>
                <div className="gl-spotlight-author-role">Gentle Reminder → Due Date Alert → Overdue Notice → Escalated Demand</div>
              </div>
            </div>

            <p style={{ fontSize: 11, color: "var(--fg-faint)", fontFamily: "var(--mono)", margin: 0 }}>
              * Cadence timers pause instantly when debtors view links, submit installment requests, or initiate dispute reviews.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Pricing section ─────────────────────────────────────────────── */
function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const freeTier = {
    name: "Free",
    price: "$0",
    period: "forever",
    limit: "10 invoices · 1 user",
    features: [
      "5-stage autonomous escalation cadence",
      "SendGrid & custom SMTP email delivery",
      "Debtor self-service payment portal",
      "CSV invoice import & sync",
      "Basic dispute classification & hold",
      "Full activity audit trail & event history",
    ],
  };

  return (
    <section style={{ borderTop: "1px solid var(--border)", backgroundColor: "#0c0c0e" }}>
      <div className="gl-section" ref={ref}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className={`gl-reveal${inView ? " visible" : ""}`} style={{ justifyContent: "center", display: "flex", marginBottom: 16 }}>
            <span className="gl-eye"><span className="gl-eye-dot" />Pricing</span>
          </div>
          <h2 className={`gl-h2 gl-reveal${inView ? " visible" : ""}`} style={{ textAlign: "center", transitionDelay: "0.08s" }}>
            Priced for your AR volume.
          </h2>
          <p className={`gl-body gl-reveal${inView ? " visible" : ""}`} style={{ maxWidth: 420, margin: "14px auto 0", transitionDelay: "0.14s" }}>
            Start free. No credit card required.
          </p>
        </div>

        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.15 }}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 14,
              padding: "32px 28px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{freeTier.name}</h3>
                <p style={{ fontSize: 12, color: "var(--fg-faint)", fontFamily: "var(--mono)" }}>{freeTier.limit}</p>
              </div>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--border)",
                  fontSize: 11,
                  fontFamily: "var(--mono)",
                  color: "var(--accent)",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                FOREVER FREE
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 600, color: "#fff", letterSpacing: "-1.5px" }}>{freeTier.price}</span>
              <span style={{ fontSize: 13, color: "var(--fg-faint)", marginLeft: 8, fontFamily: "var(--mono)" }}>{freeTier.period}</span>
            </div>

            <Link
              to="/register"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 18px",
                borderRadius: 9999,
                background: "#fff",
                color: "#000",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                marginBottom: 24,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#000";
              }}
            >
              Start for free
            </Link>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {freeTier.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ accordion (Two-column layout matching reference design) ─── */
interface FAQItem {
  question: string;
  answer: string;
}

const FAQS_LEFT: FAQItem[] = [
  {
    question: "How does the autonomous 5-stage cadence work?",
    answer: "Jaktra continuously monitors invoice due dates and aging buckets. Based on your schedule configuration, it automatically advances accounts through 5 staged notices: from courteous pre-due reminders to firm overdue follow-ups and final demand notices. You configure the delay between stages and can require manual approval before any stage dispatches.",
  },
  {
    question: "What happens when a debtor disputes an invoice?",
    answer: "The moment a debtor replies or submits a dispute through the self-service portal, Jaktra immediately pauses all cadence timers for that invoice. This prevents inappropriate automated collection notices while an issue is under review. Disputes are categorized with reason and notes, and an AI-drafted reply proposal is prepared for your team.",
  },
  {
    question: "Does Jaktra send emails from my own domain?",
    answer: "Yes. Jaktra integrates directly with your SendGrid, Resend, or custom SMTP server. All outbound reminders and escalation notices originate from your verified business address (e.g., billing@yourcompany.com) with full SPF, DKIM, and DMARC alignment.",
  },
  {
    question: "Can debtors set up installment payment plans?",
    answer: "Yes. When debtors access their secure portal, they can request structured multi-part payment plans. Once approved, Jaktra generates individual installment schedules and tracks partial settlements, keeping collection cadences paused as long as installments remain on track.",
  },
  {
    question: "How do debtors pay invoices through the portal?",
    answer: "Every notification includes a tokenized, zero-friction link to a branded Debtor Portal. Debtors require no password or login. They can view line items, download PDF copies, submit notes, and settle immediately via integrated online checkout (e.g., Razorpay).",
  },
  {
    question: "Can we control escalation tones and copy?",
    answer: "Absolutely. Each of the 5 escalation stages has customizable subject lines, email templates, and AI tone prompts (from courteous reminders to firm formal demand letters). You retain complete authority over your brand voice.",
  },
];

const FAQS_RIGHT: FAQItem[] = [
  {
    question: "How do I import existing invoices into Jaktra?",
    answer: "You can bulk-import invoices via CSV upload or synchronize them via our REST API. Jaktra automatically parses customer details, line items, currency, issue dates, and due dates, instantly slotting each account into its correct aging bucket.",
  },
  {
    question: "How is debtor data isolated and secured?",
    answer: "Jaktra enforces strict tenant isolation at the database layer. All sensitive credentials—such as SMTP passwords and payment gateway secrets—are encrypted with AES-256 at rest. Webhook payloads are cryptographically signed using HMAC SHA-256, and data in transit is protected by TLS 1.3.",
  },
  {
    question: "Is there an audit log of all communications?",
    answer: "Yes. Jaktra maintains an immutable, tenant-scoped Activity Log recording every event: email dispatch and delivery status, debtor payment link views, dispute submissions, installment agreements, and manual cadence overrides.",
  },
  {
    question: "What is included in the Free plan?",
    answer: "The Free plan includes up to 10 active invoices and 1 user seat with full access to the 5-stage cadence engine, debtor portal, CSV import, dispute detection, and SendGrid/SMTP delivery. It is permanently free with no credit card required.",
  },
  {
    question: "Can multiple team members access the workspace?",
    answer: "Yes. Jaktra supports role-based team management (Admin, Member, and Auditor). You can invite finance colleagues with specific permissions, allowing AR specialists to manage cadences while safeguarding tenant configuration.",
  },
  {
    question: "What happens if an email bounces or delivery fails?",
    answer: "Jaktra captures webhook delivery events and tracks bounces or drops. Unrecoverable failures are routed to a built-in Dead-Letter Queue (DLQ) with diagnostics, ensuring your team can inspect issues without losing track of overdue accounts.",
  },
];

function FAQSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const columns = [FAQS_LEFT, FAQS_RIGHT];

  return (
    <section
      style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--bg)",
        minHeight: "calc(100vh - var(--nav-h))",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxSizing: "border-box",
        padding: "44px 0",
      }}
    >
      <div className="gl-section" ref={ref} style={{ width: "100%", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className={`gl-reveal${inView ? " visible" : ""}`} style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <span className="gl-eye"><span className="gl-eye-dot" />FAQ</span>
          </div>
          <h2 className={`gl-h2 gl-reveal${inView ? " visible" : ""}`} style={{ textAlign: "center", fontSize: "clamp(28px, 2.8vw, 38px)", transitionDelay: "0.08s", marginBottom: 8 }}>
            Product & account help
          </h2>
          <p className={`gl-body gl-reveal${inView ? " visible" : ""}`} style={{ maxWidth: 680, margin: "0 auto 18px", textAlign: "center", fontSize: 15, lineHeight: 1.6, color: "var(--fg-muted)", transitionDelay: "0.14s" }}>
            Everything you need to know about how our platform works, from setup and customization to integrations and updates.
          </p>
          <div className={`gl-reveal${inView ? " visible" : ""}`} style={{ display: "flex", justifyContent: "center", transitionDelay: "0.18s" }}>
            <Link
              to="/docs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 22px",
                borderRadius: 9999,
                background: "#fff",
                color: "#000",
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "#000";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#000";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              See full center <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Two-column grid matching reference layout */}
        <div className={`gl-faq-grid gl-reveal${inView ? " visible" : ""}`} style={{ transitionDelay: "0.22s" }}>
          {columns.map((faqColumn, colIndex) => (
            <div key={colIndex} className="gl-faq-column">
              {faqColumn.map((faq, i) => {
                const key = `col-${colIndex}-item-${i}`;
                const isOpen = !!openItems[key];
                return (
                  <div key={key} className={`gl-faq-card${isOpen ? " open" : ""}`}>
                    <button
                      type="button"
                      className="gl-faq-trigger"
                      onClick={() => toggleItem(key)}
                      aria-expanded={isOpen}
                    >
                      <span className="gl-faq-q">
                        {faq.question}
                      </span>
                      <span className="gl-faq-icon">
                        <ChevronDown size={17} />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="gl-faq-answer">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────── */
function FinalCTA() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/register?email=${encodeURIComponent(email.trim())}`);
    } else {
      navigate("/register");
    }
  };

  return (
    <section style={{ borderTop: "1px solid var(--border)" }}>
      <div className="gl-cta-section">
        <div className="gl-cta-particles" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <span className="gl-eye"><span className="gl-eye-dot gl-eye-dot-teal" />Start Recovering Cash</span>
          </div>
          <h2
            style={{
              fontFamily: "var(--mono)",
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#fff",
              marginBottom: 16,
              maxWidth: 720,
              marginInline: "auto",
              textAlign: "center",
            }}
          >
            Start recovering overdue invoices today
          </h2>
          <p style={{ fontSize: 15, color: "var(--fg-muted)", marginBottom: 32, maxWidth: 560, marginInline: "auto", lineHeight: 1.6 }}>
            Upload your first batch of invoices, configure your email and payment providers, and recover cash on autopilot. Free for up to 10 invoices with no credit card required.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <form onSubmit={handleStart} className="gl-email-pill" style={{ width: "100%", maxWidth: 440 }}>
              <input
                type="email"
                placeholder="Enter your work email..."
                className="gl-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="gl-submit-btn" aria-label="Get started for free">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, color: "var(--fg-faint)", fontFamily: "var(--mono)" }}>
            <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
              Already registered? Sign in →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    {
      head: "Product",
      links: [
        { label: "Features", to: "#features" },
        { label: "How It Works", to: "#how-it-works" },
        { label: "Security", to: "#security" },
        { label: "Pricing", to: "#pricing" },
        { label: "FAQ", to: "#faq" },
      ],
    },
    {
      head: "Integrations",
      links: [
        { label: "SendGrid", to: "#security" },
        { label: "Resend", to: "#security" },
        { label: "SMTP", to: "#security" },
        { label: "Razorpay", to: "#security" },
      ],
    },
    {
      head: "Company",
      links: [
        { label: "Sign In", to: "/login" },
        { label: "Register", to: "/register" },
        { label: "Documentation", to: "/docs" },
      ],
    },
    {
      head: "Legal",
      links: [
        { label: "Privacy Policy", to: "/privacy" },
        { label: "Terms of Service", to: "/terms" },
      ],
    },
  ];

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      const nav = document.querySelector(".gl-nav");
      const navH = nav ? nav.getBoundingClientRect().height : 54;
      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, Math.round(elementTop - navH)),
        behavior: "smooth",
      });
    }
  };

  return (
    <footer className="gl-footer">
      <div className="gl-footer-grid">
        {/* Brand column */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <JaktraMark size={24} />
          </div>
          <p style={{ fontSize: 12, color: "var(--fg-faint)", lineHeight: 1.6, maxWidth: 200 }}>
            AI-native accounts-receivable automation for B2B finance teams.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 20, alignItems: "center" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b7d2f8" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
              AES-256 & Strict Tenant Isolation
            </span>
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.head}>
            <p className="gl-footer-col-head">{col.head}</p>
            {col.links.map((link) =>
              link.to.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={(e) => handleHashClick(e, link.to)}
                  className="gl-footer-link"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.to} className="gl-footer-link">
                  {link.label}
                </Link>
              )
            )}
          </div>
        ))}
      </div>

      <div className="gl-footer-bottom">
        <span>© {new Date().getFullYear()} Jaktra. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link to="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy</Link>
          <Link to="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms</Link>
        </div>
      </div>
    </footer>
  );
}

const NAV_ITEMS = [
  { label: "Features", target: "features" },
  { label: "How It Works", target: "how-it-works" },
  { label: "Security", target: "security" },
  { label: "Pricing", target: "pricing" },
  { label: "FAQ", target: "faq" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);

      // Scroll-spy active section indicator
      const scrollPos = window.scrollY + 200;
      let current = "";
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.target);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = item.target;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (target: string) => {
    const el = document.getElementById(target);
    if (el) {
      const nav = document.querySelector(".gl-nav");
      const navH = nav ? nav.getBoundingClientRect().height : 54;
      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, Math.round(elementTop - navH)),
        behavior: "smooth",
      });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header className={`gl-nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="gl-nav-logo">
          <JaktraMark size={22} />
          <span className="gl-nav-logo-text">Jaktra</span>
        </a>

        <nav className="gl-nav-links" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.target;
            return (
              <button
                key={item.label}
                className={`gl-nav-link${isActive ? " active" : ""}`}
                onClick={() => scrollTo(item.target)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="gl-nav-actions">
          <Link to="/login" className="gl-btn-ghost">Sign in</Link>
          <Link to="/register" className="gl-btn-primary">Get started</Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "none" }}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed", top: "var(--nav-h)", left: 0, right: 0,
              background: "rgba(10,10,11,0.96)", backdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--border)", zIndex: 49,
              padding: "16px 24px 24px",
              display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button key={item.label} onClick={() => scrollTo(item.target)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 15, textAlign: "left", padding: "10px 0", cursor: "pointer", fontFamily: "var(--sans)" }}>
                {item.label}
              </button>
            ))}
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <Link to="/login" className="gl-btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Sign in</Link>
              <Link to="/register" className="gl-btn-primary" style={{ flex: 1, justifyContent: "center" }}>Get started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── ROOT: Landing page ──────────────────────────────────────────── */
export function Landing() {
  return (
    <div className="gl-root">
      <Nav />
      <main>
        <HeroSection />
        <StatBand />
        <div id="features" style={{ scrollMarginTop: "var(--nav-h)" }}><PlatformConsole /></div>
        <div id="how-it-works" style={{ scrollMarginTop: "var(--nav-h)" }}><HowItWorks /></div>
        <CustomerSpotlightSection />
        <IndustriesSection />
        <div id="security" style={{ scrollMarginTop: "var(--nav-h)" }}><SecuritySection /></div>
        <div id="pricing" style={{ scrollMarginTop: "var(--nav-h)" }}><PricingSection /></div>
        <div id="faq" style={{ scrollMarginTop: "var(--nav-h)" }}><FAQSection /></div>
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
