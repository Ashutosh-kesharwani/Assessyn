/**
 * App.jsx — Route definitions only
 *
 * No UI, no components — just routing structure.
 * Auth state comes from Zustand (authStore) via useAuth().
 *
 * Route categories:
 *  - Public      → accessible to everyone
 *  - GuestOnly   → redirect to /dashboard if already logged in
 *  - Protected   → redirect to /login if not authenticated
 *  - AdminOnly   → redirect to /dashboard if not admin
 */

import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { useAdminAuth } from '@/context';

import ErrorBoundary from '@/components/admin/ErrorBoundary';
import SuspenseLoader from '@/components/admin/SuspenseLoader';

// ─── Layouts ─────────────────────────────────────────────────────
import AuthLayout      from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout     from '@/layouts/AdminLayout';

// ─── Pages ───────────────────────────────────────────────────────
import LandingPage          from '@/pages/LandingPage';
import LoginPage            from '@/pages/auth/LoginPage';
import RegisterPage         from '@/pages/auth/RegisterPage';
import DashboardPage        from '@/pages/dashboard/DashboardPage';
import NewInterviewPage     from '@/pages/interview/NewInterviewPage';
import InterviewListPage    from '@/pages/interview/InterviewListPage';
import InterviewSessionPage from '@/pages/interview/InterviewSessionPage';
import SessionResultPage    from '@/pages/interview/SessionResultPage';
import SessionHistoryPage   from '@/pages/session/SessionHistoryPage';
import ResumesPage          from '@/pages/resume/ResumesPage';
import ResumeBuilderPage    from '@/pages/resume/ResumeBuilderPage';
import PortfolioBuilderPage from '@/pages/portfolio/PortfolioBuilderPage';
import ProfilePage          from '@/pages/profile/ProfilePage';
import Jobs                 from '@/pages/Jobs';
import PricingPage          from '@/pages/subscription/PricingPage';
import ProCareerSuitePage   from '@/pages/pro/ProCareerSuitePage';
import RateLimitPage        from '@/pages/RateLimitPage';
import NotFoundPage         from '@/pages/NotFoundPage';
import ShinobiSoundOrb      from '@/components/common/ShinobiSoundOrb';

// ─── Admin Pages ──────────────────────────────────────────────────
const AdminLoginPage       = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboardPage   = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage       = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminInterviewsPage  = lazy(() => import('@/pages/admin/AdminInterviewsPage'));
const AdminSessionsPage    = lazy(() => import('@/pages/admin/AdminSessionsPage'));
const AdminResumesPage     = lazy(() => import('@/pages/admin/AdminResumesPage'));
const AdminJobsPage        = lazy(() => import('@/pages/admin/AdminJobsPage'));
const AdminAtsPage         = lazy(() => import('@/pages/admin/AdminAtsPage'));
const AdminSubscriptionPage = lazy(() => import('@/pages/admin/AdminSubscriptionPage'));
const AdminPaymentsPage    = lazy(() => import('@/pages/admin/AdminPaymentsPage'));
const AdminAnalyticsPage   = lazy(() => import('@/pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage    = lazy(() => import('@/pages/admin/AdminSettingsPage'));
const AdminScraperPage     = lazy(() => import('@/pages/admin/AdminScraperPage'));
const AdminPromptsPage     = lazy(() => import('@/pages/admin/AdminPromptsPage'));
const AdminLogsPage        = lazy(() => import('@/pages/admin/AdminLogsPage'));
const AdminNotificationsPage = lazy(() => import('@/pages/admin/AdminNotificationsPage'));
import RecommendedJobs     from '@/pages/RecommendedJobs';

// ─── Route Guards ─────────────────────────────────────────────────

/**
 * ProtectedRoute — Requires authentication.
 * Redirects to /login if user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * GuestRoute — Only for non-authenticated users.
 * Redirects to /dashboard if already logged in as a user.
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return children;
  return <Navigate to="/dashboard" replace />;
};

/**
 * AdminRoute — Only for authenticated admins (via AdminAuthContext).
 * Redirects to /admin/login if not authenticated.
 * Redirects to /dashboard if authenticated but not admin.
 */
const AdminRoute = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return null; // wait for session restore
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

const AdminPermissionRoute = ({ permission, children }) => {
  const { hasPermission, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!hasPermission(permission)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

/**
 * AdminGuestRoute — /admin/login page.
 * If already authenticated as admin, redirect to /admin.
 */
const AdminGuestRoute = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (isAdminAuthenticated) return <Navigate to="/admin" replace />;
  return children;
};

// ─── App ──────────────────────────────────────────────────────────
export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    restoreSession();

    const handleLogoutEvent = () => {
      clearAuth();
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    window.addEventListener('auth:session-expired', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
      window.removeEventListener('auth:session-expired', handleLogoutEvent);
    };
  }, [restoreSession, clearAuth]);

  return (
    <>
      <Routes>
        {/* ── Public ──────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/rate-limited" element={<RateLimitPage />} />

      {/* ── Guest-only (auth) ────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<GuestRoute><LoginPage /></GuestRoute>}
        />
        <Route
          path="/register"
          element={<GuestRoute><RegisterPage /></GuestRoute>}
        />
      </Route>

      {/* ── Admin Login (guest-only for admins) ──── */}
      <Route
        path="/admin/login"
        element={
          <ErrorBoundary>
            <Suspense fallback={<SuspenseLoader />}>
              <AdminGuestRoute>
                <AdminLoginPage />
              </AdminGuestRoute>
            </Suspense>
          </ErrorBoundary>
        }
      />

      {/* ── Admin protected routes ────────────────── */}
      <Route
        element={
          <AdminRoute>
            <ErrorBoundary>
              <Suspense fallback={<SuspenseLoader />}>
                <AdminLayout />
              </Suspense>
            </ErrorBoundary>
          </AdminRoute>
        }
      >
        <Route path="/admin"             element={<AdminDashboardPage />} />
        <Route path="/admin/users"       element={<AdminUsersPage />} />
        <Route path="/admin/jobs"        element={<AdminJobsPage />} />
        <Route path="/admin/interviews"  element={<AdminInterviewsPage />} />
        <Route path="/admin/resumes"     element={<AdminResumesPage />} />
        <Route path="/admin/sessions"    element={<AdminSessionsPage />} />
        <Route path="/admin/ats"         element={<AdminAtsPage />} />
        <Route path="/admin/subscription" element={<AdminPermissionRoute permission="view:settings"><AdminSubscriptionPage /></AdminPermissionRoute>} />
        <Route path="/admin/payments"     element={<AdminPermissionRoute permission="view:payments"><AdminPaymentsPage /></AdminPermissionRoute>} />
        <Route path="/admin/analytics"    element={<AdminPermissionRoute permission="view:analytics"><AdminAnalyticsPage /></AdminPermissionRoute>} />
        <Route path="/admin/settings"     element={<AdminPermissionRoute permission="view:settings"><AdminSettingsPage /></AdminPermissionRoute>} />
        <Route path="/admin/notifications" element={<AdminPermissionRoute permission="view:settings"><AdminNotificationsPage /></AdminPermissionRoute>} />
        <Route path="/admin/scraper"      element={<AdminPermissionRoute permission="view:scraper"><AdminScraperPage /></AdminPermissionRoute>} />
        <Route path="/admin/prompts"      element={<AdminPermissionRoute permission="view:prompts"><AdminPromptsPage /></AdminPermissionRoute>} />
        <Route path="/admin/logs"         element={<AdminPermissionRoute permission="view:logs"><AdminLogsPage /></AdminPermissionRoute>} />
      </Route>

      {/* ── Protected (dashboard) ────────────────── */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"                    element={<DashboardPage />} />
        <Route path="/interviews"                   element={<InterviewListPage />} />
        <Route path="/interviews/new"               element={<NewInterviewPage />} />
        <Route path="/interviews/:id/session"       element={<InterviewSessionPage />} />
        <Route path="/sessions/:id/results"         element={<SessionResultPage />} />
        <Route path="/sessions"                     element={<SessionHistoryPage />} />
        <Route path="/resumes"                      element={<ResumesPage />} />
        <Route path="/resume-builder"              element={<ResumeBuilderPage />} />
        <Route path="/portfolio-builder"           element={<PortfolioBuilderPage />} />
        <Route path="/jobs"                         element={<Jobs />} />
        <Route path="/jobs/recommended"             element={<RecommendedJobs />} />
        <Route path="/pro-suite"                    element={<ProCareerSuitePage />} />
        <Route path="/pricing"                      element={<PricingPage />} />
        <Route path="/profile"                      element={<ProfilePage />} />
      </Route>

      {/* ── 404 fallback ─────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>

    {/* ── Global Shinobi Ambient Soundscape Controller ── */}
    <ShinobiSoundOrb />
  </>
  );
}

