import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAdmin } from '@/lib/productUtils';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboardView from '@/components/admin/AdminDashboardView';
import AdminClientsView from '@/components/admin/AdminClientsView';
import AdminAnalyticsView from '@/components/admin/AdminAnalyticsView';
import AdminSubscriptionsView from '@/components/admin/AdminSubscriptionsView';
import AdminSupportView from '@/components/admin/AdminSupportView';
import AdminSettingsView from '@/components/admin/AdminSettingsView';
import AdminPinGate from '@/components/admin/AdminPinGate';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AdminPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [approvalState, setApprovalState] = useState(null); // 'loading' | 'done' | null

  useEffect(() => {
    if (location.pathname.includes('/admin-portal/clients')) {
      const parts = location.pathname.split('/').filter(Boolean);
      setSelectedClientId(parts[2] || null);
      setActiveSection('clients');
    } else if (location.pathname.includes('/admin-portal/subscriptions')) {
      setActiveSection('subscriptions');
    } else if (location.pathname.includes('/admin-portal/analytics')) {
      setActiveSection('analytics');
    }
  }, [location.pathname]);

  // Handle approve/reject links from email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const uid = params.get('uid');
    if ((action === 'approve' || action === 'reject') && uid && user && isAdmin(user)) {
      setApprovalState('loading');
      base44.functions.invoke('handleUserApproval', { userId: uid, action })
        .then(() => {
          setApprovalState('done');
          if (action === 'approve') {
            toast.success('✓ Accès accordé — l\'utilisateur a été notifié par email.');
          } else {
            toast.error('Accès refusé — l\'utilisateur a été notifié.');
          }
          // Clean URL params
          window.history.replaceState({}, '', '/admin-portal');
        })
        .catch(err => {
          setApprovalState(null);
          toast.error('Erreur : ' + err.message);
        });
    }
  }, [user]);

  if (user && !isAdmin(user)) {
    navigate('/dashboard');
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <AdminDashboardView onNavigate={setActiveSection} onSelectClient={(id) => { setSelectedClientId(id); setActiveSection('clients'); }} />;
      case 'clients': return <AdminClientsView selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} />;
      case 'analytics': return <AdminAnalyticsView />;
      case 'subscriptions': return <AdminSubscriptionsView />;
      case 'support': return <AdminSupportView />;
      case 'settings': return <AdminSettingsView />;
      default: return <AdminDashboardView onNavigate={setActiveSection} onSelectClient={(id) => { setSelectedClientId(id); setActiveSection('clients'); }} />;
    }
  };

  return (
    <AdminPinGate>
      <div className="min-h-screen bg-[#0f0f0f] flex">
        <AdminSidebar activeSection={activeSection} onNavigate={setActiveSection} />
        <main className="flex-1 min-w-0 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </AdminPinGate>
  );
}