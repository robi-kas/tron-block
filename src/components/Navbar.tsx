
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from './Tooltip';
import { WalletButton } from './WalletConnect';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { lang, t, toggleLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { name: t.home, path: '/' },
    { name: t.system, path: '/system' },
    { name: t.myAccount, path: '/account' },
    { name: t.team, path: '/team' },
    { name: t.earnings, path: '/earnings' },
    { name: t.invite, path: '/invite' },
    { name: t.history, path: '/transactions' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-2 pb-2 md:px-10 max-w-7xl mx-auto w-full bg-[#0038FF]/80 backdrop-blur-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-4 group">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1"
        >
          <div className="bg-white text-black font-black tracking-tight text-sm px-3 py-1 rounded-xl rounded-bl-sm relative shadow-sm group-hover:scale-105 transition-transform flex items-center gap-1.5">
            BLOCK
            <div className="absolute -bottom-1.5 left-0 w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
          </div>
          <div className="bg-[#CCFF00] text-black font-black text-sm px-3 py-1 rounded-full border-[1.5px] border-white shadow-sm group-hover:scale-105 transition-transform">
            MATRIX
          </div>
        </motion.div>
      </Link>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center space-x-2">
        <Tooltip content={t.toggleTheme}>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all cursor-pointer mr-2"
          >
            {theme === 'blue' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#CCFF00]" />}
          </button>
        </Tooltip>

        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`px-4 py-1.5 rounded-full border ${location.pathname === link.path ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'border-white/30 text-white hover:bg-white/10'} text-[11px] font-bold transition-all uppercase tracking-wider`}
          >
            {link.name}
          </Link>
        ))}
        <div className="h-4 w-px bg-white/20 mx-2"></div>
        <Tooltip content={t.toggleLang}>
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-1.5 text-white/70 hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
          </button>
        </Tooltip>
        <WalletButton />
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors relative z-50"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 w-full h-screen bg-[#0038FF] pt-24 pb-12 px-6 shadow-2xl z-40 lg:hidden flex flex-col justify-between"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-3xl font-black ${location.pathname === link.path ? 'text-[#CCFF00]' : 'text-white'} hover:text-[#CCFF00] transition-colors uppercase`}
                >
                  {link.name}
                </Link>
              ))}
              <button 
                onClick={toggleLang}
                className="flex items-center gap-3 text-white/70 text-2xl font-black uppercase"
              >
                <Globe className="w-8 h-8" />
                {lang === 'en' ? 'EN / 中文' : '中文 / EN'}
              </button>
            </div>
            
            <div className="w-full" onClick={() => setIsMenuOpen(false)}>
              <WalletButton expanded />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
