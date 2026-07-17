import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import Login from '@/pages/Login'
import StaffDashboard from '@/pages/StaffDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import AddCustomer from '@/pages/AddCustomer'
import MyLeads from '@/pages/MyLeads'
import StaffManagement from '@/pages/StaffManagement'
import CustomerLeads from '@/pages/CustomerLeads'
import Reports from '@/pages/Reports'
import NotFound from '@/pages/NotFound'
import AppLayout from '@/components/layout/AppLayout'

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />
        <Route path="/add-customer" element={<ProtectedRoute><AddCustomer /></ProtectedRoute>} />
        <Route path="/my-leads" element={<ProtectedRoute><MyLeads /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute requireAdmin><StaffManagement /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute requireAdmin><CustomerLeads /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute requireAdmin><Reports /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function RoleBasedDashboard() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <StaffDashboard />;
}
