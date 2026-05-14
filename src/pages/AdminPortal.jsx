import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '@/lib/productUtils';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboardView from '@/components/admin/AdminDashboardView';
import AdminClientsView from '@/components/admin/AdminClientsView';
import AdminAnalyticsView from '@/components/admin/AdminAnalyticsView';
import AdminSubscriptionsView from '@/components/admin/AdminSubscriptionsView';
import AdminSupportView from '@/components/admin/AdminSupportView';
import AdminSettingsView from '@/components/admin/AdminSettingsView';
import AdminPinGate from '@/components/admin/AdminPinGate';

export default function AdminPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);

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