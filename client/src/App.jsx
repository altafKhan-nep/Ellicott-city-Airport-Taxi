import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Home from './pages/marketing/Home.jsx';
import Services from './pages/marketing/Services.jsx';
import ServiceDetail from './pages/marketing/ServiceDetail.jsx';
import About from './pages/marketing/About.jsx';
import Fleet from './pages/marketing/Fleet.jsx';
import Contact from './pages/marketing/Contact.jsx';
import Careers from './pages/marketing/Careers.jsx';
import Reservations from './pages/passenger/Reservations.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import SocialCallback from './pages/SocialCallback.jsx';
import RideHistory from './pages/passenger/RideHistory.jsx';
import RideTracking from './pages/passenger/RideTracking.jsx';
import DriverDashboard from './pages/driver/Dashboard.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import { Spinner } from './components/ui/Spinner.jsx';
import VerifyEmailBanner from './components/auth/VerifyEmailBanner.jsx';
import CrmShell from './modules/crm/layout/CrmShell.tsx';
import OverviewPage from './modules/crm/features/overview/OverviewPage.tsx';
import DispatchBoard from './modules/crm/features/dispatch/DispatchBoard.tsx';
import LiveMapPage from './modules/crm/features/operations/LiveMapPage.tsx';
import ReservationsPage from './modules/crm/features/reservations/ReservationsPage.tsx';
import DriversPage from './modules/crm/features/drivers/DriversPage.tsx';
import PassengersPage from './modules/crm/features/passengers/PassengersPage.tsx';
import FleetPage from './modules/crm/features/fleet/FleetPage.tsx';
import FinancePage from './modules/crm/features/finance/FinancePage.tsx';
import AnalyticsPage from './modules/crm/features/analytics/AnalyticsPage.tsx';
import SupportPage from './modules/crm/features/support/SupportPage.tsx';
import NotificationsPage from './modules/crm/features/notifications/NotificationsPage.tsx';
import AuditPage from './modules/crm/features/audit/AuditPage.tsx';
import SettingsPage from './modules/crm/features/settings/SettingsPage.tsx';
import DriverShell from './modules/driver/layout/DriverShell.tsx';
import DriverDashboardPage from './modules/driver/features/dashboard/DashboardPage.tsx';
import DriverRequestsPage from './modules/driver/features/requests/RequestsPage.tsx';
import DriverCurrentPage from './modules/driver/features/current/CurrentRidePage.tsx';
import DriverHistoryPage from './modules/driver/features/history/HistoryPage.tsx';
import DriverEarningsPage from './modules/driver/features/earnings/EarningsPage.tsx';
import DriverWalletPage from './modules/driver/features/wallet/WalletPage.tsx';
import DriverVehiclePage from './modules/driver/features/vehicle/VehiclePage.tsx';
import DriverDocumentsPage from './modules/driver/features/documents/DocumentsPage.tsx';
import DriverRatingsPage from './modules/driver/features/ratings/RatingsPage.tsx';
import DriverPerformancePage from './modules/driver/features/performance/PerformancePage.tsx';
import DriverNotificationsPage from './modules/driver/features/notifications/NotificationsPage.tsx';
import DriverSupportPage from './modules/driver/features/support/SupportPage.tsx';
import DriverSettingsPage from './modules/driver/features/settings/SettingsPage.tsx';
import DriverMapPage from './modules/driver/features/map/MapPage.tsx';

const RequireRole = ({ role, roles, children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const allowed = roles || (role ? [role] : null);
  if (allowed) {
    const effective = user.role === 'admin' ? ['admin','super_admin'] : [user.role];
    if (!allowed.some(r=> effective.includes(r) || r===user.role)) return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isDriver = location.pathname.startsWith('/driver');
  if (isAdmin) {
    if (location.pathname.startsWith('/admin/legacy')) {
      return (
        <Routes>
          <Route path="/admin/legacy" element={<RequireRole roles={['admin','super_admin']}><div className="min-h-screen bg-paper"><div className="mx-auto max-w-7xl px-4 py-6"><p className="mb-4 rounded-xl bg-gold-50 border border-gold-200 px-4 py-3 text-sm text-gold-700">Legacy CRM — <a href="/admin" className="underline font-medium">Go to new Admin</a></p><AdminDashboard /></div></div></RequireRole>} />
          <Route path="*" element={<Navigate to="/admin/legacy" replace />} />
        </Routes>
      );
    }
    return (
      <Routes>
        <Route path="/admin" element={<RequireRole roles={['admin','super_admin','dispatcher','manager','finance','support']}><CrmShell /></RequireRole>}>
          <Route index element={<OverviewPage />} />
          <Route path="dispatch" element={<DispatchBoard />} />
          <Route path="operations" element={<LiveMapPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="passengers" element={<PassengersPage />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/crm" element={<Navigate to="/admin" replace />} />
        <Route path="/crm/*" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }
  if (isDriver) {
    if (location.pathname.startsWith('/driver/legacy')) {
      return (
        <Routes>
          <Route path="/driver/legacy" element={<RequireRole role="driver"><div className="min-h-screen bg-paper"><div className="mx-auto max-w-5xl px-4 py-6"><p className="mb-4 rounded-xl bg-gold-50 border border-gold-200 px-4 py-3 text-sm">Legacy Driver — <a href="/driver" className="underline font-medium text-brand-700">Go to new Portal</a></p><DriverDashboard /></div></div></RequireRole>} />
          <Route path="*" element={<Navigate to="/driver/legacy" replace />} />
        </Routes>
      );
    }
    return (
      <Routes>
        <Route path="/driver" element={<RequireRole role="driver"><DriverShell /></RequireRole>}>
          <Route index element={<DriverDashboardPage />} />
          <Route path="requests" element={<DriverRequestsPage />} />
          <Route path="current" element={<DriverCurrentPage />} />
          <Route path="upcoming" element={<DriverHistoryPage />} />
          <Route path="history" element={<DriverHistoryPage />} />
          <Route path="earnings" element={<DriverEarningsPage />} />
          <Route path="wallet" element={<DriverWalletPage />} />
          <Route path="vehicle" element={<DriverVehiclePage />} />
          <Route path="documents" element={<DriverDocumentsPage />} />
          <Route path="ratings" element={<DriverRatingsPage />} />
          <Route path="performance" element={<DriverPerformancePage />} />
          <Route path="notifications" element={<DriverNotificationsPage />} />
          <Route path="support" element={<DriverSupportPage />} />
          <Route path="settings" element={<DriverSettingsPage />} />
          <Route path="map" element={<DriverMapPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/driver" replace />} />
      </Routes>
    );
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <VerifyEmailBanner />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/social" element={<SocialCallback />} />

          <Route path="/rides/history" element={<RequireRole role="passenger"><RideHistory /></RequireRole>} />
          <Route path="/rides/track/:id" element={<RequireRole role="passenger"><RideTracking /></RequireRole>} />

          <Route path="/profile" element={<RequireRole><Profile /></RequireRole>} />

          <Route path="/driver/legacy" element={<Navigate to="/driver" replace />} />
          <Route path="/crm" element={<Navigate to="/admin" replace />} />
          <Route path="/crm/*" element={<Navigate to="/admin" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
