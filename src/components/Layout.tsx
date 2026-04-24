
import React, { ReactNode } from 'react';
import { useLanguage } from './LanguageContext';
import { useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { Navbar } from './Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Bug, Eye, Activity, X, Megaphone } from 'lucide-react';
import { useMatrix } from '../context/MatrixContext';
import DebugPanel from './DebugPanel';

export const ModeBanner = () => {
  const { accountMode, systemConfig } = useMatrix();

  if (accountMode === 'production') return null;

  return (
    <div className={`
      w-full h-8 flex items-center justify-center gap-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] z-[60] relative
      ${accountMode === 'test' ? 'bg-[#CCFF00] text-black' : 'bg-[#0038FF] text-white'}
    `}>
      <div className="flex items-center gap-2">
        {accountMode === 'test' ? <Bug className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        <span>{accountMode === 'test' ? 'Simulation Test Mode' : 'Presentation Demo Mode'} Active</span>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <span className="w-px h-3 bg-current/20" />
        <div className="flex items-center gap-1 opacity-70">
          <Activity className="w-3 h-3" />
          <span>Config: {systemConfig?.version || 'Loading...'}</span>
        </div>
        <span className="w-px h-3 bg-current/20" />
        <span>Last Sync: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export const BackgroundParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5
          }}
          animate={{
            y: ["0%", "100%"],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}
      {/* Matrix Horizontal Lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute left-0 right-0 h-px bg-white/[0.03]"
          style={{ top: (i + 1) * 20 + "%" }}
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export const CookieConsent = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  const cancelCookies = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96 bg-white border-4 border-black p-6 rounded-3xl shadow-[10px_10px_0_0_#000] z-[100] flex flex-col gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="bg-[#CCFF00] p-2 rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000]">
              <Info className="w-5 h-5 text-black" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-black leading-[0.8] mb-1">Configuration detection</p>
              <p className="text-[9px] font-bold text-black/50 uppercase leading-tight italic">
                {t.cookieText} We verify your transaction history and detect proxy nodes to maintain {t.badgeText1}.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={acceptCookies}
              className="flex-1 bg-[#0038FF] text-white font-black py-3 rounded-xl border-2 border-black uppercase tracking-widest text-[10px] hover:bg-[#CCFF00] hover:text-black transition-all active:scale-95 cursor-pointer shadow-[4px_4px_0_0_#000]"
            >
              {t.accept}
            </button>
            <button
              onClick={cancelCookies}
              className="flex-1 bg-white text-black font-black py-3 rounded-xl border-2 border-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all active:scale-95 cursor-pointer shadow-[4px_4px_0_0_#000]"
            >
              {t.cancel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export const GlobalAnnouncement = () => {
  const { systemConfig } = useMatrix();
  const [isDismissed, setIsDismissed] = React.useState(true);

  React.useEffect(() => {
    if (systemConfig?.globalBanner?.active) {
      const dismissed = localStorage.getItem(`banner-dismissed-${systemConfig.globalBanner.id || 'current'}`);
      setIsDismissed(!!dismissed);
    }
  }, [systemConfig]);

  if (!systemConfig?.globalBanner?.active || isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(`banner-dismissed-${systemConfig.globalBanner.id || 'current'}`, 'true');
    setIsDismissed(true);
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-24 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-[100]"
    >
      <div className="bg-[#CCFF00] border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-[8px_8px_0_0_#000] flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-black/10" />
        
        <div className="bg-black p-3 rounded-xl shrink-0 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
          <Megaphone className="w-5 h-5 text-[#CCFF00]" />
        </div>
        
        <div className="flex-1">
          <h4 className="text-[10px] font-black uppercase text-black/40 tracking-[0.2em] mb-0.5">Global Announcement</h4>
          <p className="text-xs md:text-sm font-black text-black uppercase italic leading-tight">
            {systemConfig.globalBanner.text}
          </p>
        </div>

        <button 
          onClick={handleDismiss}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>
    </motion.div>
  );
};

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  const bgColor = theme === 'blue' ? 'bg-[#0038FF]' : 'bg-[#050505]';

  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative w-full">
        <main className="flex-1 relative z-10 w-full">
          <GlobalAnnouncement />
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-x-hidden w-full transition-colors duration-700`}>
      {/* Background Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:2rem_2rem] md:bg-[size:4rem_4rem] pointer-events-none z-0"
        style={{
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 90%)'
        }}
      ></div>

      <BackgroundParticles />
      <Navbar />
      <ModeBanner />

      <main className="flex-1 relative z-10 w-full">
        <GlobalAnnouncement />
        {children}
      </main>

      <DebugPanel />
      <CookieConsent />
    </div>
  );
};
