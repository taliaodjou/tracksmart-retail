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
import { getDefaultRouteForUser, isAdmin, isConsumer, isMerchantUser } from '@/lib/productUtils';
import ConsumerPage from '@/pages/consumer/ConsumerPage';
import BottomTabBar from '@/components/mobile/BottomTabBar';
import PageTransition from '@/components/mobile/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect } from 'react';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Demo from '@/pages/Demo';
import Offers from '@/pages/Offers';
import LegalNotice from '@/pages/LegalNotice';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import ClientSupportView from '@/pages/ClientSupportView';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Stock from '@/pages/Stock';
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

  // Force light mode always — TrackSmart Retail uses fixed light theme
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

  const MerchantGuard = ({ children }) => {
    if (isAuthenticated && user && !isMerchantUser(user)) {
      return <Navigate to={getDefaultRouteForUser(user)} replace />;
    }
    return children;
  };

  const ConsumerGuard = ({ children }) => {
    if (isAuthenticated && user && !isConsumer(user)) {
      return <Navigate to={getDefaultRouteForUser(user)} replace />;
    }
    return children;
  };

  const AdminOnlyGuard = ({ children }) => {
    if (isAuthenticated && user && !isAdmin(user)) {
      return <Navigate to={getDefaultRouteForUser(user)} replace />;
    }
    return children;
  };

  const showBottomBar = isAuthenticated && user && isMerchantUser(user) && location.pathname !== '/' && !location.pathname.startsWith('/consumer') && !location.pathname.startsWith('/admin-portal') && !(location.pathname === '/welcome' && !user.onboarding_complete);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public pages — accessible to everyone */}
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/demo" element={<PageTransition><Demo /></PageTransition>} />
          <Route path="/offres" element={<PageTransition><Offers /></PageTransition>} />
          <Route path="/mentions-legales" element={<PageTransition><LegalNotice /></PageTransition>} />
          <Route path="/politique-confidentialite" element={<PageTransition><PrivacyPolicy /></PageTransition>} />

          {/* Public auth routes */}
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/" replace />} />}>

            {/* Consumer routes */}
            <Route path="/consumer" element={<PageTransition><ConsumerGuard><ConsumerPage title="Accueil consumer" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/explore" element={<PageTransition><ConsumerGuard><ConsumerPage section="explore" title="Explorer" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/stores" element={<PageTransition><ConsumerGuard><ConsumerPage section="stores" title="Boutiques" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/stores/:id" element={<PageTransition><ConsumerGuard><ConsumerPage section="storeDetail" title="Boutique" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/offers" element={<PageTransition><ConsumerGuard><ConsumerPage section="offers" title="Offres" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/offers/:id" element={<PageTransition><ConsumerGuard><ConsumerPage section="offerDetail" title="Offre" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/cart" element={<PageTransition><ConsumerGuard><ConsumerPage section="cart" title="Panier" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/orders" element={<PageTransition><ConsumerGuard><ConsumerPage section="orders" title="Réservations" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/favorites" element={<PageTransition><ConsumerGuard><ConsumerPage section="favorites" title="Favoris" /></ConsumerGuard></PageTransition>} />
            <Route path="/consumer/profile" element={<PageTransition><ConsumerGuard><ConsumerPage section="profile" title="Profil" /></ConsumerGuard></PageTransition>} />

            {/* Espace Boutique routes */}
            <Route path="/welcome" element={<PageTransition><MerchantGuard><Welcome /></MerchantGuard></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><MerchantGuard><Dashboard /></MerchantGuard></PageTransition>} />
            <Route path="/products" element={<PageTransition><MerchantGuard><Products /></MerchantGuard></PageTransition>} />
            <Route path="/stock" element={<PageTransition><MerchantGuard><Stock /></MerchantGuard></PageTransition>} />
            <Route path="/profile" element={<PageTransition><MerchantGuard><Profile /></MerchantGuard></PageTransition>} />
            <Route path="/analytics" element={<PageTransition><MerchantGuard><Analytics /></MerchantGuard></PageTransition>} />
            <Route path="/orders" element={<PageTransition><MerchantGuard><Orders /></MerchantGuard></PageTransition>} />
            <Route path="/reports" element={<PageTransition><MerchantGuard><Reports /></MerchantGuard></PageTransition>} />
            <Route path="/documents" element={<PageTransition><MerchantGuard><Documents /></MerchantGuard></PageTransition>} />
            <Route path="/team" element={<PageTransition><MerchantGuard><TeamManagement /></MerchantGuard></PageTransition>} />
            <Route path="/activity" element={<PageTransition><MerchantGuard><ActivityLogs /></MerchantGuard></PageTransition>} />
            <Route path="/admin" element={<PageTransition><MerchantGuard><Admin /></MerchantGuard></PageTransition>} />
            <Route path="/support-view" element={<PageTransition><MerchantGuard><ClientSupportView /></MerchantGuard></PageTransition>} />
            <Route path="/email-preferences" element={<PageTransition><MerchantGuard><EmailPreferences /></MerchantGuard></PageTransition>} />

            {/* Admin-only routes */}
            <Route path="/admin-portal" element={<PageTransition><AdminOnlyGuard><AdminPortal /></AdminOnlyGuard></PageTransition>} />
            <Route path="/admin-portal/clients" element={<PageTransition><AdminOnlyGuard><AdminPortal /></AdminOnlyGuard></PageTransition>} />
            <Route path="/admin-portal/clients/:id" element={<PageTransition><AdminOnlyGuard><AdminPortal /></AdminOnlyGuard></PageTransition>} />
            <Route path="/admin-portal/subscriptions" element={<PageTransition><AdminOnlyGuard><AdminPortal /></AdminOnlyGuard></PageTransition>} />
            <Route path="/admin-portal/analytics" element={<PageTransition><AdminOnlyGuard><AdminPortal /></AdminOnlyGuard></PageTransition>} />

            <Route path="*" element={<PageTransition><PageNotFound /></PageTransition>} />
          </Route>
        </Routes>
      </AnimatePresence>
      {showBottomBar && <BottomTabBar userEmail={user?.email} />}
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