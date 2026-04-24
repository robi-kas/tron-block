import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export const CookieConsent = () => {
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96 bg-white border-4 border-black p-6 rounded-[2rem] shadow-[10px_10px_0_0_#0038FF] z-[100] flex flex-col gap-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 bg-[#CCFF00] rounded-xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#000]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <button onClick={() => setShow(false)} className="text-black/20 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div>
            <h4 className="text-lg font-black text-black uppercase italic leading-none mb-2">Cookie Configuration</h4>
            <p className="text-[10px] font-bold text-black/50 uppercase tracking-tight leading-relaxed">
              {t.cookieText} We detect high-risk transactions and proxy connections to maintain the BLOCK MATRIX integrity.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={accept}
              className="flex-1 bg-black text-[#CCFF00] py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              {t.accept}
            </button>
            <button 
              onClick={() => setShow(false)}
              className="px-6 border-2 border-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black/5 transition-colors"
            >
              Decline
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
