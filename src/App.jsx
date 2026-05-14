import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import { SupportModeProvider } from '@/lib/SupportModeContext';
import { isAdmin } from '@/lib/productUtils';
import Landing from '@/pages/Landing';
import ClientSupportView from '@/pages/ClientSupportView';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import Welcome from '@/pages/Welcome';
import Analytics from '@/pages/Analytics';
import Orders from '@/pages/Orders';
import BarcodeDatabase from '@/pages/BarcodeDatabase';
import AdminPortal from '@/pages/AdminPortal';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, isAuthenticated } = useAuth();

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

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
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

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Client-only routes */}
      <Route path="/welcome" element={<AdminGuard><Welcome /></AdminGuard>} />
      <Route path="/dashboard" element={<AdminGuard><Dashboard /></AdminGuard>} />
      <Route path="/profile" element={<AdminGuard><Profile /></AdminGuard>} />
      <Route path="/analytics" element={<AdminGuard><Analytics /></AdminGuard>} />
      <Route path="/orders" element={<AdminGuard><Orders /></AdminGuard>} />
      <Route path="/barcode-db" element={<AdminGuard><BarcodeDatabase /></AdminGuard>} />
      <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />

      {/* Admin-only routes */}
      <Route path="/admin-portal" element={<ClientGuard><AdminPortal /></ClientGuard>} />
      <Route path="/support-view" element={<ClientSupportView />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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