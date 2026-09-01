import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Invoices } from "./pages/Invoices";
import { InvoiceDetail } from "./pages/InvoiceDetail";
import { Agent } from "./pages/Agent";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { ActivityLog } from "./pages/ActivityLog";
import { Disputes } from "./pages/Disputes";
import { PaymentPlans } from "./pages/PaymentPlans";
import { AcceptInvitation } from "./pages/AcceptInvitation";
import { DebtorPortal } from "./pages/DebtorPortal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { Spinner } from "./components/ui/Spinner";

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#010102]">
        <Spinner className="h-7 w-7 text-[#f7f8f8]" />
      </div>
    );
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
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/invite" element={<AcceptInvitation />} />
      <Route path="/i/:token" element={<DebtorPortal />} />


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
  );
}

export default App;
