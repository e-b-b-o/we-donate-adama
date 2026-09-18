import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { cn } from './lib/utils';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import LoadingScreen from './components/ui/LoadingScreen';

// Layouts (Eagerly Loaded)
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DonatePage = lazy(() => import('./pages/DonatePage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));

// Dashboard Pages (Lazy Loaded)
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const MyDonationsPage = lazy(() => import('./pages/dashboard/MyDonationsPage'));
const SupportRequestsPage = lazy(() => import('./pages/dashboard/SupportRequestsPage'));
const MyCampaignsPage = lazy(() => import('./pages/dashboard/MyCampaignsPage'));
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const UserVerificationPage = lazy(() => import('./pages/dashboard/UserVerificationPage'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const AdminDonationsPage = lazy(() => import('./pages/admin/AdminDonationsPage'));
const KebeleDonationsPage = lazy(() => import('./pages/admin/KebeleDonationsPage'));
const ManageKebelesPage = lazy(() => import('./pages/admin/ManageKebelesPage'));
const AdminRequestsPage = lazy(() => import('./pages/admin/AdminRequestsPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage'));
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage'));
const AdminHeroImagesPage = lazy(() => import('./pages/admin/AdminHeroImagesPage'));
const PaymentReconciliationPage = lazy(() => import('./pages/admin/PaymentReconciliationPage'));
const VerificationPage = lazy(() => import('./pages/admin/VerificationPage'));
const IndividualVerificationPage = lazy(() => import('./pages/admin/IndividualVerificationPage'));
const InspectionsPage = lazy(() => import('./pages/admin/InspectionsPage'));
const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage'));
const AdminFaqsPage = lazy(() => import('./pages/admin/AdminFaqsPage'));
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));

const ALL_ADMINS = ['KEBELE_ADMIN', 'CITY_ADMIN', 'SYSTEM_ADMIN'];
const KEBELE_ONLY = ['KEBELE_ADMIN'];
const CITY_AND_SYSTEM = ['CITY_ADMIN', 'SYSTEM_ADMIN'];
const SYSTEM_ONLY = ['SYSTEM_ADMIN'];
const ORG_AND_ADMINS = ['ORGANIZATION', 'KEBELE_ADMIN', 'CITY_ADMIN', 'SYSTEM_ADMIN'];

function Error403() {
  const { isDark } = useTheme();
  return (
    <MainLayout>
      <div className={cn('min-h-screen flex items-center justify-center p-4', isDark ? 'bg-slate-900' : 'bg-gray-50')}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-amber-500 flex justify-center items-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className={cn('text-3xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>403 - Access Denied</h1>
          <p className={cn('mb-6', isDark ? 'text-slate-400' : 'text-gray-600')}>You do not have permission to access this page.</p>
          <Link to="/" className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Return to Dashboard</Link>
        </div>
      </div>
    </MainLayout>
  );
}

function Error404() {
  const { isDark } = useTheme();
  return (
    <MainLayout>
      <div className={cn('min-h-screen flex items-center justify-center p-4', isDark ? 'bg-slate-900' : 'bg-gray-50')}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500 flex justify-center items-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h1 className={cn('text-3xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>404 - Not Found</h1>
          <p className={cn('mb-6', isDark ? 'text-slate-400' : 'text-gray-600')}>The page you are looking for does not exist.</p>
          <Link to="/" className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">Return Home</Link>
        </div>
      </div>
    </MainLayout>
  );
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isDark } = useTheme();

  if (isLoading) return (
    <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-900' : 'bg-gray-50')}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-gray-500')}>Loading...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Error403 />;
  return <>{children}</>;
}

const HIGH_ADMIN_ROLES = ['KEBELE_ADMIN', 'CITY_ADMIN', 'SYSTEM_ADMIN'];

function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isDark } = useTheme();
  const isHighAdmin = user && HIGH_ADMIN_ROLES.includes(user.role);

  if (isLoading) return (
    <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-900' : 'bg-gray-50')}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-gray-500')}>Loading...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isHighAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function PublicDonateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isDark } = useTheme();
  const isHighAdmin = user && HIGH_ADMIN_ROLES.includes(user.role);

  if (isLoading) return (
    <div className={cn('min-h-screen flex items-center justify-center', isDark ? 'bg-slate-900' : 'bg-gray-50')}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-gray-500')}>Loading...</p>
      </div>
    </div>
  );

  if (isHighAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

const DR = (children: React.ReactNode) => (
  <ProtectedRoute><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>
);

function withLayout(children: React.ReactNode, roles?: string[]) {
  return <ProtectedRoute roles={roles}><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>;
}

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public — but /donate is hidden from admins */}
        <Route path="/"               element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/about"          element={<MainLayout><AboutPage /></MainLayout>} />
        <Route path="/donate"         element={<PublicDonateRoute><MainLayout><DonatePage /></MainLayout></PublicDonateRoute>} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/payment/success" element={<MainLayout><PaymentSuccessPage /></MainLayout>} />
        <Route path="/payment/verify"  element={<MainLayout><PaymentSuccessPage /></MainLayout>} />

        {/* User Dashboard — hidden from admins */}
        <Route path="/dashboard"                  element={<AdminOnlyRoute>{DR(<DashboardHome />)}</AdminOnlyRoute>} />
        <Route path="/dashboard/donate"           element={<AdminOnlyRoute>{DR(<DonatePage />)}</AdminOnlyRoute>} />
        <Route path="/dashboard/donations"        element={<AdminOnlyRoute>{DR(<MyDonationsPage />)}</AdminOnlyRoute>} />
        <Route path="/dashboard/requests"         element={<ProtectedRoute>{DR(<SupportRequestsPage />)}</ProtectedRoute>} />
        <Route path="/dashboard/verification"     element={<ProtectedRoute>{DR(<UserVerificationPage />)}</ProtectedRoute>} />
        <Route path="/dashboard/campaigns"        element={<AdminOnlyRoute>{DR(<MyCampaignsPage />)}</AdminOnlyRoute>} />
        <Route path="/dashboard/notifications"    element={DR(<NotificationsPage />)} />
        <Route path="/dashboard/profile"          element={DR(<ProfilePage />)} />

        {/* Admin Panel */}
        <Route path="/admin"                element={withLayout(<AdminDashboard />, ALL_ADMINS)} />
        <Route path="/admin/users"          element={withLayout(<ManageUsersPage />, ALL_ADMINS)} />
        <Route path="/admin/requests"       element={withLayout(<AdminRequestsPage />, ALL_ADMINS)} />
        <Route path="/admin/campaigns"      element={withLayout(<AdminRequestsPage />, CITY_AND_SYSTEM)} />
        <Route path="/admin/inspections"    element={withLayout(<InspectionsPage />, ALL_ADMINS)} />
        
        {/* City & System Admins */}
        <Route path="/admin/verification"   element={withLayout(<VerificationPage />, CITY_AND_SYSTEM)} />
        
        {/* Kebele, City, System Admins */}
        <Route path="/admin/user-verification" element={withLayout(<IndividualVerificationPage />, ALL_ADMINS)} />
        <Route path="/admin/kebele-donations"  element={withLayout(<KebeleDonationsPage />, KEBELE_ONLY)} />
        <Route path="/admin/donations"         element={withLayout(<AdminDonationsPage />, CITY_AND_SYSTEM)} />

        <Route path="/admin/kebeles"        element={withLayout(<ManageKebelesPage />, CITY_AND_SYSTEM)} />

        <Route path="/admin/news"           element={withLayout(<AdminNewsPage />, CITY_AND_SYSTEM)} />
        <Route path="/admin/events"         element={withLayout(<AdminEventsPage />, CITY_AND_SYSTEM)} />

        {/* System Admin Only */}
        <Route path="/admin/reconciliation" element={withLayout(<PaymentReconciliationPage />, SYSTEM_ONLY)} />
        <Route path="/admin/audit-logs"     element={withLayout(<AuditLogsPage />, SYSTEM_ONLY)} />
        <Route path="/admin/settings"       element={withLayout(<AdminSettingsPage />, SYSTEM_ONLY)} />
        <Route path="/admin/faqs"           element={withLayout(<AdminFaqsPage />, SYSTEM_ONLY)} />
        <Route path="/admin/messages"       element={withLayout(<AdminMessagesPage />, SYSTEM_ONLY)} />
        <Route path="/admin/gallery"        element={withLayout(<AdminGalleryPage />, SYSTEM_ONLY)} />
        <Route path="/admin/testimonials"   element={withLayout(<AdminTestimonialsPage />, SYSTEM_ONLY)} />
        <Route path="/admin/hero-images"    element={withLayout(<AdminHeroImagesPage />, SYSTEM_ONLY)} />

        {/* Fallback */}
        <Route path="*" element={<Error404 />} />
        </Routes>
      </Suspense>
      <ChatbotWidget />
    </>
  );
}
