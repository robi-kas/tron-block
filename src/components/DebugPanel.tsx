
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  X, 
  Database, 
  Activity, 
  Terminal, 
  Cpu, 
  RefreshCcw, 
  Globe,
  Bug
} from 'lucide-react';
import { useMatrix } from '../context/MatrixContext';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { accountMode, systemConfig, stats } = useMatrix();

  // Only show for internal users (for now we check mode)
  if (accountMode === 'production') return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-red-600 text-white rounded-full border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center hover:bg-black transition-colors group"
      >
        <Bug className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#CCFF00] rounded-full border-2 border-black animate-pulse"></div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-0 right-0 bottom-0 w-80 z-[1000] bg-black border-l-4 border-black shadow-2xl flex flex-col"
          >
            <div className="p-6 bg-red-600 border-b-4 border-black flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-white" />
                  <span className="font-black text-white uppercase tracking-widest text-xs">Diagnostic Panel</span>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-white hover:rotate-90 transition-transform">
                  <X className="w-6 h-6" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               {/* Mode Info */}
               <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <Globe className="w-3 h-3" /> System Environment
                  </p>
                  <div className="space-y-3">
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/50 uppercase">Account Mode</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${accountMode === 'test' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}>
                           {accountMode}
                        </span>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/50 uppercase">Config Version</span>
                        <span className="text-xs font-black text-[#CCFF00]">{systemConfig?.version || 'V1.0.0'}</span>
                     </div>
                  </div>
               </div>

               {/* Metrics */}
               <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <Activity className="w-3 h-3" /> Live Metrics
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-[8px] font-bold text-white/30 uppercase mb-1">Users</p>
                        <p className="text-lg font-black text-white">{stats.totalUsers}</p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-[8px] font-bold text-white/30 uppercase mb-1">Volume</p>
                        <p className="text-lg font-black text-white">{stats.totalTurnover}</p>
                     </div>
                  </div>
               </div>

               {/* Logic Status */}
               <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <Database className="w-3 h-3" /> Logic Status
                  </p>
                  <div className="space-y-2">
                     {[
                        { label: 'Matrix Rebuild', status: 'Healthy', color: 'text-green-500' },
                        { label: 'Differential Sync', status: 'Active', color: 'text-green-500' },
                        { label: 'Simulation Engine', status: accountMode === 'test' ? 'Running' : 'Standby', color: accountMode === 'test' ? 'text-[#CCFF00]' : 'text-white/40' },
                        { label: 'Order Sync', status: 'Delayed (3s)', color: 'text-yellow-500' },
                     ].map(item => (
                        <div key={item.label} className="flex items-center justify-between text-[10px] font-bold">
                           <span className="text-white/50">{item.label}</span>
                           <span className={item.color}>{item.status}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Actions */}
               <div className="pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                     <Cpu className="w-3 h-3" /> Quick Actions
                  </p>
                  <div className="space-y-3">
                     <button className="w-full bg-white/10 text-white py-3 rounded-xl font-black uppercase text-[10px] hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                        <RefreshCcw className="w-3 h-3" /> Clear Local Cache
                     </button>
                     <button className="w-full bg-red-600/20 text-red-500 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-red-600/30 transition-all">
                        Force Recalculation
                     </button>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/10">
               <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest text-center">
                  Internal Diagnostic Tool v2.4.0 <br/>
                  Session ID: {Math.random().toString(36).substring(7).toUpperCase()}
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DebugPanel;
