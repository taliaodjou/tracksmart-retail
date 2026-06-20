import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { SupportModeProvider } from '@/lib/SupportModeContext';
import { isAdmin } from '@/lib/productUtils';
import BottomTabBar from '@/components/mobile/BottomTabBar';
import PageTransition from '@/components/mobile/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect } from 'react';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Landing from '@/pages/Landing';
import ClientSupportView from '@/pages/ClientSupportView';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import Welcome from '@/pages/Welcome';
import Analytics from '@/pages/Analytics';
import Orders from '@/pages/Orders';
import AdminPortal from '@/pages/AdminPortal';
import Reports from '@/pages/Reports';
import EmailPreferences from '@/pages/EmailPreferences';
import Documents from '@/pages/Documents';
import TeamManagement from '@/pages/TeamManagement';
import ActivityLogs from '@/pages/ActivityLogs';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Force light mode always — TrackSmart uses fixed light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f0e8]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">TS</span>
          </div>
          <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Admin guard: block admin from client pages, redirect to admin-portal
  const AdminGuard = ({ children }) => {
    if (isAuthenticated && user && isAdmin(user)) {
      return <Navigate to="/admin-portal" replace />;
    }
    return children;
  };

  // Client guard: block non-admin from admin portal
  const ClientGuard = ({ children }) => {
    if (isAuthenticated && user && !isAdmin(user)) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  const showBottomBar = isAuthenticated && user && !isAdmin(user) && location.pathname !== '/';

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public landing — accessible to everyone */}
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />

          {/* Public auth routes */}
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/" replace />} />}>

            {/* Client-facing routes */}
            <Route path="/welcome" element={<PageTransition><Welcome /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
            <Route path="/orders" element={<PageTransition><Orders /></PageTransition>} />
            <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
            <Route path="/documents" element={<PageTransition><Documents /></PageTransition>} />
            <Route path="/team" element={<PageTransition><TeamManagement /></PageTransition>} />
            <Route path="/activity" element={<PageTransition><ActivityLogs /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />

            {/* Admin-only routes */}
            <Route path="/admin-portal" element={<PageTransition><ClientGuard><AdminPortal /></ClientGuard></PageTransition>} />
            <Route path="/support-view" element={<PageTransition><ClientSupportView /></PageTransition>} />
            <Route path="/email-preferences" element={<PageTransition><EmailPreferences /></PageTransition>} />

            <Route path="*" element={<PageTransition><PageNotFound /></PageTransition>} />
          </Route>
        </Routes>
      </AnimatePresence>
      {showBottomBar && <BottomTabBar />}
    </>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SupportModeProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </SupportModeProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;