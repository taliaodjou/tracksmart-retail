import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart2, ShoppingCart, Package } from 'lucide-react';

const baseTabs = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Produits', icon: Package },
  { to: '/stock', label: 'Stock', icon: ShoppingCart },
  { to: '/analytics', label: 'Analytique', icon: BarChart2 },
];

export default function BottomTabBar() {
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const tabs = baseTabs;

  if (hidden) return null;

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
              onClick={() => setHidden(true)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 transition-colors ${
                active ? 'text-primary' : 'text-gray-600'
              }`}
              style={{ minHeight: '50px' }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}