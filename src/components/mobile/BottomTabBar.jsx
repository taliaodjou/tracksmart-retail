import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart2, ShoppingCart, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytique', icon: BarChart2 },
  { to: '/orders', label: 'Commandes', icon: ShoppingCart },
  { to: '/profile', label: 'Profil', icon: User },
];

export default function BottomTabBar() {
  const location = useLocation();

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 no-select shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? 'text-primary' : 'text-gray-600'
              }`}
              style={{ minHeight: '56px' }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}