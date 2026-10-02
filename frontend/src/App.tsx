import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { Landing } from "./pages/Landing";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { Spinner } from "./components/ui/Spinner";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";

const Pricing = lazy(() => import("./pages/Pricing").then(m => ({ default: m.Pricing })));
// Direct Comparisons
const HighRadiusCompare = lazy(() => import("./seo/pages/compare/HighRadiusCompare").then(m => ({ default: m.HighRadiusCompare })));
const UpflowCompare = lazy(() => import("./seo/pages/compare/UpflowCompare").then(m => ({ default: m.UpflowCompare })));
const ChaserCompare = lazy(() => import("./seo/pages/compare/ChaserCompare").then(m => ({ default: m.ChaserCompare })));
const PaidNiceCompare = lazy(() => import("./seo/pages/compare/PaidNiceCompare").then(m => ({ default: m.PaidNiceCompare })));
const KollenoCompare = lazy(() => import("./seo/pages/compare/KollenoCompare"));

// Feature Deep Dives
const FiveStageEscalation = lazy(() => import("./seo/pages/features/FiveStageEscalation").then(m => ({ default: m.FiveStageEscalation })));
const DisputeTriage = lazy(() => import("./seo/pages/features/DisputeTriage").then(m => ({ default: m.DisputeTriage })));
const InstallmentPlans = lazy(() => import("./seo/pages/features/InstallmentPlans").then(m => ({ default: m.InstallmentPlans })));
const ZeroLoginPortal = lazy(() => import("./seo/pages/features/ZeroLoginPortal").then(m => ({ default: m.ZeroLoginPortal })));
const EmailDeliverability = lazy(() => import("./seo/pages/features/EmailDeliverability").then(m => ({ default: m.EmailDeliverability })));
const RiskScoring = lazy(() => import("./seo/pages/features/RiskScoring").then(m => ({ default: m.RiskScoring })));

// Resources, Playbooks, and Guides
const DSOGuide = lazy(() => import("./seo/pages/resources/DSOGuide").then(m => ({ default: m.DSOGuide })));
const ToneEscalationPlaybook = lazy(() => import("./seo/pages/resources/ToneEscalationPlaybook").then(m => ({ default: m.ToneEscalationPlaybook })));
const DunningTemplatesResource = lazy(() => import("./seo/pages/resources/DunningTemplatesResource"));
const BestFinanceAutomationGuide = lazy(() => import("./seo/pages/resources/BestFinanceAutomationGuide"));
const ArRoiCalculatorResource = lazy(() => import("./seo/pages/resources/ArRoiCalculatorResource"));
const InvoiceDisputeTemplatesResource = lazy(() => import("./seo/pages/resources/InvoiceDisputeTemplatesResource"));
const ArQueryManagementResource = lazy(() => import("./seo/pages/resources/ArQueryManagementResource"));
const ClientQuestioningBillableHoursArticle = lazy(() => import("./seo/pages/resources/ClientQuestioningBillableHoursArticle"));
const ClientDisputedInvoiceArticle = lazy(() => import("./seo/pages/resources/ClientDisputedInvoiceArticle"));
const ManageArEmailsArticle = lazy(() => import("./seo/pages/resources/ManageArEmailsArticle"));

// Industry Use Cases
const SaasUseCase = lazy(() => import("./seo/pages/use-cases/SaasUseCase").then(m => ({ default: m.SaasUseCase })));
const AgencyUseCase = lazy(() => import("./seo/pages/use-cases/AgencyUseCase").then(m => ({ default: m.AgencyUseCase })));
const ManufacturingUseCase = lazy(() => import("./seo/pages/use-cases/ManufacturingUseCase").then(m => ({ default: m.ManufacturingUseCase })));
const ProfessionalServicesUseCase = lazy(() => import("./seo/pages/use-cases/ProfessionalServicesUseCase").then(m => ({ default: m.ProfessionalServicesUseCase })));
const ConstructionUseCase = lazy(() => import("./seo/pages/use-cases/ConstructionUseCase"));
const LogisticsFreightUseCase = lazy(() => import("./seo/pages/use-cases/LogisticsFreightUseCase"));
const StaffingRecruitingUseCase = lazy(() => import("./seo/pages/use-cases/StaffingRecruitingUseCase"));
const WholesaleDistributionUseCase = lazy(() => import("./seo/pages/use-cases/WholesaleDistributionUseCase"));

// Topic Hubs
const CompareHub = lazy(() => import("./seo/pages/hubs/CompareHub"));
const UseCasesHub = lazy(() => import("./seo/pages/hubs/UseCasesHub"));
const FeaturesHub = lazy(() => import("./seo/pages/hubs/FeaturesHub"));
const ResourcesHub = lazy(() => import("./seo/pages/hubs/ResourcesHub"));

// Alternatives Roundup Guides
const HighRadiusAlternatives = lazy(() => import("./seo/pages/alternatives/HighRadiusAlternatives").then(m => ({ default: m.HighRadiusAlternatives })));
const UpflowAlternatives = lazy(() => import("./seo/pages/alternatives/UpflowAlternatives").then(m => ({ default: m.UpflowAlternatives })));
const ChaserAlternatives = lazy(() => import("./seo/pages/alternatives/ChaserAlternatives").then(m => ({ default: m.ChaserAlternatives })));
const PaidNiceAlternatives = lazy(() => import("./seo/pages/alternatives/PaidNiceAlternatives").then(m => ({ default: m.PaidNiceAlternatives })));
const KollenoAlternatives = lazy(() => import("./seo/pages/alternatives/KollenoAlternatives").then(m => ({ default: m.KollenoAlternatives })));
const GavitiAlternatives = lazy(() => import("./seo/pages/alternatives/GavitiAlternatives").then(m => ({ default: m.GavitiAlternatives })));
const InvoicedAlternatives = lazy(() => import("./seo/pages/alternatives/InvoicedAlternatives").then(m => ({ default: m.InvoicedAlternatives })));
const VersapayAlternatives = lazy(() => import("./seo/pages/alternatives/VersapayAlternatives").then(m => ({ default: m.VersapayAlternatives })));
const YayPayAlternatives = lazy(() => import("./seo/pages/alternatives/YayPayAlternatives").then(m => ({ default: m.YayPayAlternatives })));
const TesorioAlternatives = lazy(() => import("./seo/pages/alternatives/TesorioAlternatives").then(m => ({ default: m.TesorioAlternatives })));

// Lazy-loaded heavy dashboard, analytics, settings, and secondary routes
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));

const Invoices = lazy(() => import("./pages/Invoices").then(m => ({ default: m.Invoices })));
const InvoiceDetail = lazy(() => import("./pages/InvoiceDetail").then(m => ({ default: m.InvoiceDetail })));
const Agent = lazy(() => import("./pages/Agent").then(m => ({ default: m.Agent })));
const Analytics = lazy(() => import("./pages/Analytics").then(m => ({ default: m.Analytics })));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const ActivityLog = lazy(() => import("./pages/ActivityLog").then(m => ({ default: m.ActivityLog })));
const Disputes = lazy(() => import("./pages/Disputes").then(m => ({ default: m.Disputes })));
const PaymentPlans = lazy(() => import("./pages/PaymentPlans").then(m => ({ default: m.PaymentPlans })));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation").then(m => ({ default: m.AcceptInvitation })));
const DebtorPortal = lazy(() => import("./pages/DebtorPortal").then(m => ({ default: m.DebtorPortal })));
const Privacy = lazy(() => import("./pages/Privacy").then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import("./pages/Terms").then(m => ({ default: m.Terms })));
const DocsMock = lazy(() => import("./pages/DocsMock").then(m => ({ default: m.DocsMock })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.Contact })));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));

function RouteFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#010102]">
      <Spinner className="h-7 w-7 text-[#f7f8f8]" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteFallback />;
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    );
  }

  return <Landing />;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth routes sharing persistent right-side art */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="/register" element={<Register />} />
          <Route path="/invite" element={<AcceptInvitation />} />
          <Route path="/i/:token" element={<DebtorPortal />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/docs" element={<DocsMock />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features/5-stage-escalation" element={<FiveStageEscalation />} />
          <Route path="/features/dispute-triage" element={<DisputeTriage />} />
          <Route path="/features/installment-plans" element={<InstallmentPlans />} />
          <Route path="/resources/how-to-reduce-dso" element={<DSOGuide />} />
          {/* Comparison Routes */}
          <Route path="/compare/jaktra-vs-highradius" element={<HighRadiusCompare />} />
          <Route path="/compare/jaktra-vs-upflow" element={<UpflowCompare />} />
          <Route path="/compare/jaktra-vs-chaser" element={<ChaserCompare />} />
          <Route path="/compare/jaktra-vs-paidnice" element={<PaidNiceCompare />} />
          <Route path="/compare/jaktra-vs-kolleno" element={<KollenoCompare />} />

          {/* Alternatives Roundup Guides */}
          <Route path="/compare/highradius-alternatives" element={<HighRadiusAlternatives />} />
          <Route path="/compare/upflow-alternatives" element={<UpflowAlternatives />} />
          <Route path="/compare/chaser-alternatives" element={<ChaserAlternatives />} />
          <Route path="/compare/paidnice-alternatives" element={<PaidNiceAlternatives />} />
          <Route path="/compare/kolleno-alternatives" element={<KollenoAlternatives />} />
          <Route path="/compare/gaviti-alternatives" element={<GavitiAlternatives />} />
          <Route path="/compare/invoiced-alternatives" element={<InvoicedAlternatives />} />
          <Route path="/compare/versapay-alternatives" element={<VersapayAlternatives />} />
          <Route path="/compare/yaypay-alternatives" element={<YayPayAlternatives />} />
          <Route path="/compare/tesorio-alternatives" element={<TesorioAlternatives />} />

          {/* Backward compatibility redirects */}
          <Route path="/compare/highradius-vs-jaktra" element={<Navigate to="/compare/jaktra-vs-highradius" replace />} />
          <Route path="/compare/highradius-alternative" element={<Navigate to="/compare/highradius-alternatives" replace />} />
          <Route path="/compare/upflow-alternative" element={<Navigate to="/compare/upflow-alternatives" replace />} />
          <Route path="/compare/upflow-vs-jaktra" element={<Navigate to="/compare/jaktra-vs-upflow" replace />} />
          <Route path="/compare/chaser-alternative" element={<Navigate to="/compare/chaser-alternatives" replace />} />
          <Route path="/compare/chaser-vs-jaktra" element={<Navigate to="/compare/jaktra-vs-chaser" replace />} />
          <Route path="/compare/paidnice-alternative" element={<Navigate to="/compare/paidnice-alternatives" replace />} />
          <Route path="/compare/paidnice-vs-jaktra" element={<Navigate to="/compare/jaktra-vs-paidnice" replace />} />
          <Route path="/compare/kolleno-alternative" element={<Navigate to="/compare/kolleno-alternatives" replace />} />
          <Route path="/compare/kolleno-vs-jaktra" element={<Navigate to="/compare/jaktra-vs-kolleno" replace />} />

          <Route path="/use-cases/saas" element={<SaasUseCase />} />
          <Route path="/use-cases/agencies" element={<AgencyUseCase />} />
          <Route path="/use-cases/manufacturing" element={<ManufacturingUseCase />} />
          <Route path="/use-cases/professional-services" element={<ProfessionalServicesUseCase />} />
          <Route path="/features/zero-login-portal" element={<ZeroLoginPortal />} />
          <Route path="/features/email-deliverability" element={<EmailDeliverability />} />
          <Route path="/features/risk-scoring" element={<RiskScoring />} />
          <Route path="/resources/5-stage-ar-tone-escalation" element={<ToneEscalationPlaybook />} />
          <Route path="/resources/b2b-dunning-email-templates" element={<DunningTemplatesResource />} />
          <Route path="/use-cases/construction" element={<ConstructionUseCase />} />
          <Route path="/use-cases/logistics-freight" element={<LogisticsFreightUseCase />} />
          <Route path="/use-cases/staffing-recruiting" element={<StaffingRecruitingUseCase />} />
          <Route path="/use-cases/wholesale-distribution" element={<WholesaleDistributionUseCase />} />
          <Route path="/resources/ar-automation-roi-calculator" element={<ArRoiCalculatorResource />} />
          <Route path="/resources/best-b2b-finance-automation-tools" element={<BestFinanceAutomationGuide />} />
          <Route path="/compare" element={<CompareHub />} />
          <Route path="/use-cases" element={<UseCasesHub />} />
          <Route path="/features" element={<FeaturesHub />} />
          <Route path="/resources/invoice-dispute-response-templates" element={<InvoiceDisputeTemplatesResource />} />
          <Route path="/resources/accounts-receivable-query-management" element={<ArQueryManagementResource />} />
          <Route path="/resources/client-questioning-billable-hours" element={<ClientQuestioningBillableHoursArticle />} />
          <Route path="/resources/client-disputed-invoice-what-to-do" element={<ClientDisputedInvoiceArticle />} />
          <Route path="/resources/how-to-manage-accounts-receivable-emails" element={<ManageArEmailsArticle />} />
          <Route path="/resources" element={<ResourcesHub />} />


          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:id/trashed" element={<InvoiceDetail />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/analytics" element={<Analytics />} />
              
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/dlq" element={<Navigate to="/agent?tab=dlq" replace />} />
                <Route path="/disputes" element={<Disputes />} />
                <Route path="/payment-plans" element={<PaymentPlans />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/activity-log" element={<ActivityLog />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all 404 Not Found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
