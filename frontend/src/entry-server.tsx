import React from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";

// Named page exports
import { Landing } from "./pages/Landing";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { DocsMock } from "./pages/DocsMock";
import { Pricing } from "./pages/Pricing";
import { HighRadiusCompare } from "./pages/HighRadiusCompare";
import { UpflowCompare } from "./pages/UpflowCompare";
import { ChaserCompare } from "./pages/ChaserCompare";
import { FiveStageEscalation } from "./pages/FiveStageEscalation";
import { DisputeTriage } from "./pages/DisputeTriage";
import { InstallmentPlans } from "./pages/InstallmentPlans";
import { DSOGuide } from "./pages/DSOGuide";
import { SaasUseCase } from "./pages/SaasUseCase";
import { AgencyUseCase } from "./pages/AgencyUseCase";
import { ManufacturingUseCase } from "./pages/ManufacturingUseCase";
import { ToneEscalationPlaybook } from "./pages/ToneEscalationPlaybook";
import { ZeroLoginPortal } from "./pages/ZeroLoginPortal";
import { EmailDeliverability } from "./pages/EmailDeliverability";
import { RiskScoring } from "./pages/RiskScoring";
import { PaidNiceCompare } from "./pages/PaidNiceCompare";
import { ProfessionalServicesUseCase } from "./pages/ProfessionalServicesUseCase";

// Default page exports
import DunningTemplatesResource from "./pages/DunningTemplatesResource";
import ConstructionUseCase from "./pages/ConstructionUseCase";
import LogisticsFreightUseCase from "./pages/LogisticsFreightUseCase";
import StaffingRecruitingUseCase from "./pages/StaffingRecruitingUseCase";
import WholesaleDistributionUseCase from "./pages/WholesaleDistributionUseCase";
import ArRoiCalculatorResource from "./pages/ArRoiCalculatorResource";
import KollenoCompare from "./pages/KollenoCompare";
import CompareHub from "./pages/CompareHub";
import UseCasesHub from "./pages/UseCasesHub";
import FeaturesHub from "./pages/FeaturesHub";
import ResourcesHub from "./pages/ResourcesHub";
import BestFinanceAutomationGuide from "./pages/BestFinanceAutomationGuide";
import InvoiceDisputeTemplatesResource from "./pages/InvoiceDisputeTemplatesResource";
import ArQueryManagementResource from "./pages/ArQueryManagementResource";
import ClientQuestioningBillableHoursArticle from "./pages/ClientQuestioningBillableHoursArticle";
import ClientDisputedInvoiceArticle from "./pages/ClientDisputedInvoiceArticle";
import ManageArEmailsArticle from "./pages/ManageArEmailsArticle";

// Auth utility pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";

export const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  "/": Landing,
  "/privacy": Privacy,
  "/terms": Terms,
  "/docs": DocsMock,
  "/pricing": Pricing,
  "/compare/highradius-vs-jaktra": HighRadiusCompare,
  "/compare/upflow-alternative": UpflowCompare,
  "/features/5-stage-escalation": FiveStageEscalation,
  "/features/dispute-triage": DisputeTriage,
  "/features/installment-plans": InstallmentPlans,
  "/resources/how-to-reduce-dso": DSOGuide,
  "/compare/chaser-alternative": ChaserCompare,
  "/compare/paidnice-alternative": PaidNiceCompare,
  "/use-cases/saas": SaasUseCase,
  "/use-cases/agencies": AgencyUseCase,
  "/use-cases/manufacturing": ManufacturingUseCase,
  "/resources/5-stage-ar-tone-escalation": ToneEscalationPlaybook,
  "/use-cases/professional-services": ProfessionalServicesUseCase,
  "/features/zero-login-portal": ZeroLoginPortal,
  "/features/email-deliverability": EmailDeliverability,
  "/features/risk-scoring": RiskScoring,
  "/resources/b2b-dunning-email-templates": DunningTemplatesResource,
  "/use-cases/construction": ConstructionUseCase,
  "/use-cases/logistics-freight": LogisticsFreightUseCase,
  "/use-cases/staffing-recruiting": StaffingRecruitingUseCase,
  "/use-cases/wholesale-distribution": WholesaleDistributionUseCase,
  "/resources/best-b2b-finance-automation-tools": BestFinanceAutomationGuide,
  "/resources/ar-automation-roi-calculator": ArRoiCalculatorResource,
  "/compare/kolleno-alternative": KollenoCompare,
  "/compare": CompareHub,
  "/use-cases": UseCasesHub,
  "/features": FeaturesHub,
  "/resources": ResourcesHub,
  "/resources/invoice-dispute-response-templates": InvoiceDisputeTemplatesResource,
  "/resources/accounts-receivable-query-management": ArQueryManagementResource,
  "/resources/client-questioning-billable-hours": ClientQuestioningBillableHoursArticle,
  "/resources/client-disputed-invoice-what-to-do": ClientDisputedInvoiceArticle,
  "/resources/how-to-manage-accounts-receivable-emails": ManageArEmailsArticle,
  // Auth utility pages
  "/login": Login,
  "/register": Register,
  "/forgot-password": ForgotPassword,
};

export interface RenderResult {
  html: string;
  helmet?: HelmetServerState | null;
}

export function render(url: string): RenderResult {
  const Component = ROUTE_COMPONENTS[url];
  if (!Component) {
    throw new Error(`Route not configured for SSR prerender: ${url}`);
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  const helmetContext: { helmet?: HelmetServerState | null } = {};

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[url]}>
          <AuthProvider>
            <Component />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );

  return {
    html: appHtml,
    helmet: helmetContext.helmet,
  };
}
