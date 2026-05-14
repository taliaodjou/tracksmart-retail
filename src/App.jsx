import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/LanguageContext';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Admin from '@/pages/Admin';
import Welcome from '@/pages/Welcome';
import Analytics from '@/pages/Analytics';
import Orders from '@/pages/Orders';
import BarcodeDatabase from '@/pages/BarcodeDatabase';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminClients from '@/pages/admin/AdminClients';
import AdminClientDetail from '@/pages/admin/AdminClientDetail';
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSupport from '@/pages/admin/AdminSupport';
import AdminSettings from '@/pages/admin/AdminSettings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold">TS</span>
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

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/barcode-db" element={<BarcodeDatabase />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin-portal" element={<AdminDashboard />} />
      <Route path="/admin-portal/clients" element={<AdminClients />} />
      <Route path="/admin-portal/clients/:id" element={<AdminClientDetail />} />
      <Route path="/admin-portal/subscriptions" element={<AdminSubscriptions />} />
      <Route path="/admin-portal/analytics" element={<AdminAnalytics />} />
      <Route path="/admin-portal/support" element={<AdminSupport />} />
      <Route path="/admin-portal/settings" element={<AdminSettings />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;