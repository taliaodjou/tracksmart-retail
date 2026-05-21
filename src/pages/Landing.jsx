import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { isAdmin } from '@/lib/productUtils';
import { Store, Shield, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const floatingOrbs = [
  { size: 350, x: '5%',  y: '10%', delay: 0,   duration: 9  },
  { size: 220, x: '72%', y: '5%',  delay: 1.5, duration: 11 },
  { size: 160, x: '55%', y: '65%', delay: 0.8, duration: 8  },
  { size: 120, x: '15%', y: '60%', delay: 2.5, duration: 10 },
];

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBoutique = () => {
    if (isAuthenticated && user && !isAdmin(user)) {
      navigate('/welcome');
    } else {
      base44.auth.redirectToLogin('/welcome');
    }
  };

  const handleAdmin = () => {
    if (isAuthenticated && user) {
      navigate('/admin-portal');
    } else {
      base44.auth.redirectToLogin('/admin-portal');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ colorScheme: 'light', backgroundColor: '#fafaf8', color: '#1a1a1a', backgroundImage: 'linear-gradient(135deg, #fafaf8 0%, #ffffff 50%, #f5f0e8 100%)' }}>

      {/* Floating background orbs */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, #C9A64620 0%, transparent 70%)`,
          }}
          animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: orb.duration, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 sm:px-10 py-5 relative z-10"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Clock className="w-5 h-5 text-white" />
          </motion.div>
          <span className="font-bold text-lg tracking-tight" style={{ color: '#1a1a1a' }}>TrackSmart</span>
        </div>
        <div className="text-xs text-gray-400 hidden sm:block">by TNO Studio</div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-12 relative z-10">

        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="relative w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-7 shadow-lg shadow-primary/10"
        >
          <Clock className="w-12 h-12 text-primary" />
          <motion.div
            className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md"
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight" style={{ color: '#1a1a1a' }}>
            Bienvenue sur{' '}
            <span className="text-primary">TrackSmart</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-lg leading-relaxed">
            Votre plateforme intelligente de gestion des produits et DLC
          </p>
        </motion.div>

        {/* Entry cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">

          {/* Boutique card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBoutique}
            className="group flex-1 rounded-2xl p-8 text-center transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col items-center gap-5" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Store className="w-8 h-8 text-primary" />
            </motion.div>
            <div>
              <div className="text-base font-bold mb-1.5" style={{ color: '#1a1a1a' }}>Je suis une boutique</div>
              <div className="text-gray-500 text-xs leading-relaxed">
                Accédez à votre espace de gestion des produits et des pertes.
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary text-sm font-semibold mt-auto">
              Accéder à mon espace
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </div>
          </motion.button>

          {/* Admin card */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAdmin}
            className="group flex-1 rounded-2xl p-8 text-center transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col items-center gap-5" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center"
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Shield className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            <div>
              <div className="text-base font-bold mb-1.5" style={{ color: '#1a1a1a' }}>Je suis administrateur</div>
              <div className="text-gray-500 text-xs leading-relaxed">
                Espace privé de gestion TrackSmart.
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mt-auto group-hover:text-gray-900 transition-colors">
              Portail administrateur
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </div>
          </motion.button>

        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-5 px-4 text-xs text-gray-400 relative z-10"
      >
        TrackSmart · TNO Studio · support@tracksmart.com
      </motion.footer>
    </div>
  );
}