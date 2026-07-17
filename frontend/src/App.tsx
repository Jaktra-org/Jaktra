import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Invoices } from "./pages/Invoices";
import { InvoiceDetail } from "./pages/InvoiceDetail";
import { TrashedInvoiceDetail } from "./pages/TrashedInvoiceDetail";
import { Agent } from "./pages/Agent";
import { DLQ } from "./pages/DLQ";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { ActivityLog } from "./pages/ActivityLog";
import { Disputes } from "./pages/Disputes";
import { AcceptInvitation } from "./pages/AcceptInvitation";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/invite" element={<AcceptInvitation />} />


      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id/trashed" element={<TrashedInvoiceDetail />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/analytics" element={<Analytics />} />
          
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/dlq" element={<DLQ />} />
            <Route path="/disputes" element={<Disputes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/activity-log" element={<ActivityLog />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
