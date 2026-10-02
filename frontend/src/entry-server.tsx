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
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
// SEO & Content Pages (43 programmatic marketing pages)
import {
  HighRadiusCompare,
  UpflowCompare,
  ChaserCompare,
  FiveStageEscalation,
  DisputeTriage,
  InstallmentPlans,
  DSOGuide,
  SaasUseCase,
  AgencyUseCase,
  ManufacturingUseCase,
  ToneEscalationPlaybook,
  ZeroLoginPortal,
  EmailDeliverability,
  RiskScoring,
  PaidNiceCompare,
  ProfessionalServicesUseCase,
  HighRadiusAlternatives,
  UpflowAlternatives,
  ChaserAlternatives,
  PaidNiceAlternatives,
  KollenoAlternatives,
  GavitiAlternatives,
  InvoicedAlternatives,
  VersapayAlternatives,
  YayPayAlternatives,
  TesorioAlternatives,
  DunningTemplatesResource,
  ConstructionUseCase,
  LogisticsFreightUseCase,
  StaffingRecruitingUseCase,
  WholesaleDistributionUseCase,
  ArRoiCalculatorResource,
  KollenoCompare,
  CompareHub,
  UseCasesHub,
  FeaturesHub,
  ResourcesHub,
  BestFinanceAutomationGuide,
  InvoiceDisputeTemplatesResource,
  ArQueryManagementResource,
  ClientQuestioningBillableHoursArticle,
  ClientDisputedInvoiceArticle,
  ManageArEmailsArticle,
} from "./seo/pages";

// Auth utility pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";

// Error / 404 page
import { NotFound } from "./pages/NotFound";

export const ROUTE_COMPONENTS: Record<string, React.ComponentType> = {
  "/": Landing,
  "/privacy": Privacy,
  "/terms": Terms,
  "/docs": DocsMock,
  "/pricing": Pricing,
  "/about": About,
  "/contact": Contact,
  "/compare/jaktra-vs-highradius": HighRadiusCompare,
  "/compare/jaktra-vs-upflow": UpflowCompare,
  "/features/5-stage-escalation": FiveStageEscalation,
  "/features/dispute-triage": DisputeTriage,
  "/features/installment-plans": InstallmentPlans,
  "/resources/how-to-reduce-dso": DSOGuide,
  "/compare/jaktra-vs-chaser": ChaserCompare,
  "/compare/jaktra-vs-paidnice": PaidNiceCompare,
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
  "/compare/jaktra-vs-kolleno": KollenoCompare,
  "/compare/highradius-alternatives": HighRadiusAlternatives,
  "/compare/upflow-alternatives": UpflowAlternatives,
  "/compare/chaser-alternatives": ChaserAlternatives,
  "/compare/paidnice-alternatives": PaidNiceAlternatives,
  "/compare/kolleno-alternatives": KollenoAlternatives,
  "/compare/gaviti-alternatives": GavitiAlternatives,
  "/compare/invoiced-alternatives": InvoicedAlternatives,
  "/compare/versapay-alternatives": VersapayAlternatives,
  "/compare/yaypay-alternatives": YayPayAlternatives,
  "/compare/tesorio-alternatives": TesorioAlternatives,
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
  // 404 Not Found page
  "/404": NotFound,
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
