import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { RoleGuard } from './utils/roleGuard';
import Sidebar from './components/common/Sidebar';
import { useAuthStore } from './store/authStore';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import CommandPalette from './components/common/CommandPalette';
import OnboardingTutorial from './components/common/OnboardingTutorial';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import NewOrder         from './pages/student/NewOrder';
import MyOrders         from './pages/student/MyOrders';
import OrderDetail      from './pages/student/OrderDetail';
import SubscriptionBilling from './pages/student/SubscriptionBilling';

// Writer
import WriterDashboard   from './pages/writer/WriterDashboard';
import Assignments       from './pages/writer/Assignments';
import Earnings         from './pages/writer/Earnings';
import WriterOnboarding from './pages/writer/WriterOnboarding';

// Admin
import AdminDashboard  from './pages/admin/AdminDashboard';
import ManageOrders    from './pages/admin/ManageOrders';
import ManageUsers     from './pages/admin/ManageUsers';
import WriterApprovals from './pages/admin/WriterApprovals';
import Analytics       from './pages/admin/Analytics';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function DashboardLayout() {
  return (
    <div className="flex bg-void min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-60 transition-all duration-300 p-4 sm:p-6 lg:p-8 overflow-x-hidden relative z-10">
        <Outlet />
      </main>
    </div>
  );
}

function RedirectToDashboard() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}

export default function App() {
  const { user } = useAuthStore();

  return (
    <ThemeProvider>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={!user ? <Login />    : <Navigate to={`/${user.role.toLowerCase()}`} replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role.toLowerCase()}`} replace />} />
            <Route path="/"         element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<RedirectToDashboard />} />

            {/* Student */}
            <Route path="/student" element={<RoleGuard roles={['STUDENT']}><DashboardLayout /></RoleGuard>}>
              <Route index element={<StudentDashboard />} />
              <Route path="new-order" element={<NewOrder />} />
              <Route path="orders"    element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="billing"   element={<SubscriptionBilling />} />
            </Route>

            {/* Writer */}
            <Route path="/writer" element={<RoleGuard roles={['WRITER']}><DashboardLayout /></RoleGuard>}>
              <Route index element={<WriterDashboard />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="earnings"    element={<Earnings />} />
              <Route path="onboarding" element={<WriterOnboarding />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<RoleGuard roles={['ADMIN']}><DashboardLayout /></RoleGuard>}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders"    element={<ManageOrders />} />
              <Route path="users"     element={<ManageUsers />} />
              <Route path="approvals" element={<WriterApprovals />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="/unauthorized" element={<div className="min-h-screen bg-void flex items-center justify-center"><p className="font-orbitron text-alert text-glow-plasma">ACCESS DENIED</p></div>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          {/* Global overlays — must be inside BrowserRouter to use useNavigate */}
          <CommandPalette />
          <OnboardingTutorial />
        </SidebarProvider>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'DM Sans',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: 'var(--orbit)', secondary: 'var(--bg-void)' } },
          error:   { iconTheme: { primary: 'var(--alert)', secondary: 'var(--bg-void)' } },
        }}
      />
    </QueryClientProvider>
    </ThemeProvider>
  );
}