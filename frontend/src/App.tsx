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
const HighRadiusCompare = lazy(() => import("./pages/HighRadiusCompare").then(m => ({ default: m.HighRadiusCompare })));
const UpflowCompare = lazy(() => import("./pages/UpflowCompare").then(m => ({ default: m.UpflowCompare })));
const ChaserCompare = lazy(() => import("./pages/ChaserCompare").then(m => ({ default: m.ChaserCompare })));
const FiveStageEscalation = lazy(() => import("./pages/FiveStageEscalation").then(m => ({ default: m.FiveStageEscalation })));
const DisputeTriage = lazy(() => import("./pages/DisputeTriage").then(m => ({ default: m.DisputeTriage })));
const InstallmentPlans = lazy(() => import("./pages/InstallmentPlans").then(m => ({ default: m.InstallmentPlans })));
const DSOGuide = lazy(() => import("./pages/DSOGuide").then(m => ({ default: m.DSOGuide })));
const SaasUseCase = lazy(() => import("./pages/SaasUseCase").then(m => ({ default: m.SaasUseCase })));
const AgencyUseCase = lazy(() => import("./pages/AgencyUseCase").then(m => ({ default: m.AgencyUseCase })));
const ManufacturingUseCase = lazy(() => import("./pages/ManufacturingUseCase").then(m => ({ default: m.ManufacturingUseCase })));
const ToneEscalationPlaybook = lazy(() => import("./pages/ToneEscalationPlaybook").then(m => ({ default: m.ToneEscalationPlaybook })));
const ZeroLoginPortal = lazy(() => import("./pages/ZeroLoginPortal").then(m => ({ default: m.ZeroLoginPortal })));
const EmailDeliverability = lazy(() => import("./pages/EmailDeliverability").then(m => ({ default: m.EmailDeliverability })));
const RiskScoring = lazy(() => import("./pages/RiskScoring").then(m => ({ default: m.RiskScoring })));
const PaidNiceCompare = lazy(() => import("./pages/PaidNiceCompare").then(m => ({ default: m.PaidNiceCompare })));
const ProfessionalServicesUseCase = lazy(() => import("./pages/ProfessionalServicesUseCase").then(m => ({ default: m.ProfessionalServicesUseCase })));
const DunningTemplatesResource = lazy(() => import("./pages/DunningTemplatesResource"));
const ConstructionUseCase = lazy(() => import("./pages/ConstructionUseCase"));
const LogisticsFreightUseCase = lazy(() => import("./pages/LogisticsFreightUseCase"));
const StaffingRecruitingUseCase = lazy(() => import("./pages/StaffingRecruitingUseCase"));
const WholesaleDistributionUseCase = lazy(() => import("./pages/WholesaleDistributionUseCase"));
const ArRoiCalculatorResource = lazy(() => import("./pages/ArRoiCalculatorResource"));
const KollenoCompare = lazy(() => import("./pages/KollenoCompare"));
const CompareHub = lazy(() => import("./pages/CompareHub"));
const UseCasesHub = lazy(() => import("./pages/UseCasesHub"));
const FeaturesHub = lazy(() => import("./pages/FeaturesHub"));
const ResourcesHub = lazy(() => import("./pages/ResourcesHub"));
const BestFinanceAutomationGuide = lazy(() => import("./pages/BestFinanceAutomationGuide"));
const InvoiceDisputeTemplatesResource = lazy(() => import("./pages/InvoiceDisputeTemplatesResource"));
const ArQueryManagementResource = lazy(() => import("./pages/ArQueryManagementResource"));
const ClientQuestioningBillableHoursArticle = lazy(() => import("./pages/ClientQuestioningBillableHoursArticle"));
const ClientDisputedInvoiceArticle = lazy(() => import("./pages/ClientDisputedInvoiceArticle"));
const ManageArEmailsArticle = lazy(() => import("./pages/ManageArEmailsArticle"));

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
          <Route path="/features/5-stage-escalation" element={<FiveStageEscalation />} />
          <Route path="/features/dispute-triage" element={<DisputeTriage />} />
          <Route path="/features/installment-plans" element={<InstallmentPlans />} />
          <Route path="/resources/how-to-reduce-dso" element={<DSOGuide />} />
          <Route path="/compare/highradius-vs-jaktra" element={<HighRadiusCompare />} />
          <Route path="/compare/highradius-alternative" element={<HighRadiusCompare />} />
          <Route path="/compare/upflow-alternative" element={<UpflowCompare />} />
          <Route path="/compare/chaser-alternative" element={<ChaserCompare />} />
          <Route path="/compare/paidnice-alternative" element={<PaidNiceCompare />} />
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
          <Route path="/compare/kolleno-alternative" element={<KollenoCompare />} />
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
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
