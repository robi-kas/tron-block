
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { useTheme } from '../components/ThemeContext';
import { useAccount } from 'wagmi';
import { useMatrix } from '../context/MatrixContext';
import { 
  Wallet, 
  Copy, 
  Check, 
  ChevronRight, 
  LayoutGrid, 
  History, 
  Users, 
  Zap, 
  TrendingUp, 
  ShieldCheck,
  Package,
  Clock,
  Link as LinkIcon,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  RefreshCw
} from 'lucide-react';

const OverviewCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -5 }}
    className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0_0_#000] flex flex-col gap-4 group transition-all"
  >
    <div className={`w-12 h-12 ${color} rounded-xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#000]`}>
      <Icon className="w-6 h-6 text-black" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-black/40 tracking-widest leading-none mb-1">{title}</p>
      <p className="text-3xl font-black text-black tracking-tighter leading-none">{value}</p>
    </div>
  </motion.div>
);

interface SeatCardProps {
  seat: any;
  t: any;
}

const SeatCard: React.FC<SeatCardProps> = ({ seat, t }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-[10px_10px_0_0_#000] hover:shadow-[15px_15px_0_0_#CCFF00] hover:-translate-y-2 transition-all group flex flex-col gap-6"
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-[#CCFF00] rounded-2xl border-2 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
          <span className="font-black text-2xl italic text-black">#{seat.id}</span>
        </div>
        <div>
          <p className="text-black font-black text-xl italic leading-none">{seat.level}</p>
          <div className="mt-1 flex items-center gap-1.5 ">
            <div className={`w-2 h-2 rounded-full ${seat.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[9px] font-black uppercase text-black/50 tracking-widest">{seat.active ? t.active : t.inactive}</span>
          </div>
        </div>
      </div>
      <div className="bg-black/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-black/5">
        <Clock className="w-3 h-3" />
        {seat.time}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#F1F3F5] p-4 rounded-2xl border border-black/5">
        <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">{t.origin}</p>
        <p className="text-xs font-black text-black uppercase italic">{seat.origin}</p>
      </div>
      <div className="bg-[#F1F3F5] p-4 rounded-2xl border border-black/5">
        <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">{t.participation}</p>
        <p className="text-xs font-black text-black uppercase italic">{seat.participation}</p>
      </div>
    </div>

    <div className="bg-[#0038FF] p-5 rounded-2xl border-2 border-black flex items-center justify-between shadow-[4px_4px_0_0_#000]">
      <div>
        <p className="text-[8px] font-black text-[#CCFF00] uppercase tracking-widest leading-none mb-1">{t.triggeredRewards}</p>
        <p className="text-2xl font-black text-white italic leading-none">{seat.rewards} USDT</p>
      </div>
      <div className="w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform">
        <Zap className="w-5 h-5 text-black" fill="currentColor" />
      </div>
    </div>

    <div className="flex items-center justify-between pt-2">
       <div className="flex items-center gap-2 text-black/40 hover:text-black transition-colors cursor-pointer group/hash">
         <LinkIcon className="w-3 h-3" />
         <span className="text-[9px] font-bold uppercase tracking-widest">{seat.hash}</span>
       </div>
       <button className="p-2 rounded-lg hover:bg-black/5 transition-colors">
         <ChevronRight className="w-4 h-4 text-black" />
       </button>
    </div>
  </motion.div>
);

const Account = () => {
  const { lang, t, tr } = useLanguage();
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const { 
    isRegistered, 
    userId, 
    uplineId, 
    balance, 
    totalRewards, 
    currentLevel, 
    seats, 
    activities, 
    upgradeLevel,
    withdraw,
    register,
    systemConfig,
    accountMode,
    loading: contextLoading,
    refreshData,
    executeUSDTTransfer
  } = useMatrix();

  const [activeTab, setActiveTab] = React.useState<'seats' | 'history'>('seats');
  const [copied, setCopied] = React.useState(false);
  const [uplinkInput, setUplinkInput] = React.useState('');
  
  const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState('100');

  const handleDeposit = async () => {
    try {
      const txHash = await executeUSDTTransfer(parseFloat(depositAmount));
      
      const res = await fetch('/api/matrix/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount: parseFloat(depositAmount), mode: accountMode, txHash })
      });
      const data = await res.json();
      if (data.success) {
        if (refreshData) await refreshData();
        setIsDepositModalOpen(false);
      }
    } catch (err) {
      console.error("Deposit failed", err);
    }
  };

  const handleBuyback = async () => {
    try {
      const res = await fetch('/api/matrix/buyback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      if (data.success && refreshData) {
        await refreshData();
      }
    } catch (err) {
      console.error("Buyback failed", err);
    }
  };

  const walletAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected";
  const fullAddress = address || "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected && !isRegistered) {
    return (
      <div className="w-full min-h-screen py-32 px-6 md:px-10 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white border-4 border-black p-10 md:p-16 rounded-[4rem] shadow-[20px_20px_0_0_#CCFF00] max-w-xl w-full"
         >
            <h2 className="text-4xl md:text-5xl font-black text-black uppercase italic tracking-tighter mb-6">{t.joinBlock}</h2>
            <p className="text-black/60 font-bold uppercase tracking-widest text-xs mb-10 italic">{tr(t.enterUplink, { amount: systemConfig?.activationFee || 80 })}</p>
            
            <div className="space-y-6">
               <div className="relative">
                  <input 
                    type="text"
                    placeholder={t.uplinkPlaceholder}
                    value={uplinkInput}
                    onChange={(e) => setUplinkInput(e.target.value)}
                    className="w-full bg-gray-100 border-4 border-black p-6 rounded-2xl font-black text-xl placeholder:text-black/10 focus:outline-none focus:ring-4 ring-[#0038FF]/20 transition-all pr-44"
                  />
                   <button 
                     onClick={() => setUplinkInput((Math.floor(Math.random() * 90000) + 100000).toString())}
                     className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-[#CCFF00] px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0038FF] transition-colors shadow-[3px_3px_0_0_#000]"
                   >
                     Auto-Generate
                   </button>
               </div>
               
               <button 
                 onClick={() => register(uplinkInput)}
                 className="w-full bg-[#0038FF] text-white font-black py-6 rounded-2xl border-4 border-black uppercase tracking-widest shadow-[8px_8px_0_0_#000] hover:bg-[#CCFF00] hover:text-black transition-all active:translate-y-1 active:shadow-none"
               >
                 {tr(t.registerBtn, { amount: systemConfig?.activationFee || 80 })}
               </button>
               
               <div className="flex items-center gap-3 justify-center text-black/40 text-[10px] font-black uppercase tracking-widest mt-4">
                  <ShieldCheck className="w-4 h-4" /> {t.secureContract}
               </div>
            </div>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full pb-32">
      {/* Header Section */}
      <section className="px-6 md:px-10 pt-32 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-12">
          <div className="w-full lg:w-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 bg-[#CCFF00] px-4 py-1.5 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] mb-8"
            >
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black uppercase text-black tracking-[0.2em]">{t.connectedWallet}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[clamp(3.5rem,10vw,120px)] font-black text-white leading-[0.8] uppercase tracking-tighter mb-8"
              style={{ textShadow: 'clamp(4px, 0.8vw, 10px) clamp(4px, 0.8vw, 10px) 0 #0038FF' }}
            >
              {t.myAccountTitle}
            </motion.h1>

            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white border-4 border-black px-6 py-3 rounded-2xl shadow-[6px_6px_0_0_#000] flex items-center gap-4 group">
                <Wallet className="w-6 h-6 text-[#0038FF]" />
                <span className="text-xl font-black text-black tracking-tight">{walletAddress}</span>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-black/5 rounded-lg transition-all active:scale-90 relative"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                        <Check className="w-5 h-5 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                        <Copy className="w-5 h-5 text-black/30 group-hover:text-black" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <div className="bg-[#CCFF00] border-4 border-black px-8 py-3 rounded-2xl shadow-[6px_6px_0_0_#0038FF] flex items-center gap-4 italic">
                 <span className="font-black text-2xl text-black">V{currentLevel}</span>
                 <div className="bg-black text-[#CCFF00] px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">ID: {userId}</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-max">
             <OverviewCard title={t.balance} value={`${balance.toFixed(2)}`} icon={Zap} color="bg-[#CCFF00]" />
             <OverviewCard title={t.totalRewards} value={`${totalRewards.toFixed(2)}`} icon={TrendingUp} color="bg-white" />
             
             {totalRewards > 0 && (
               <motion.button 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={async () => {
                   const success = await withdraw(totalRewards);
                   if (success) {
                     alert('Withdrawal Successful! Funds have been sent to your wallet.');
                   }
                 }}
                 className="col-span-2 bg-black text-[#CCFF00] border-4 border-black py-4 rounded-2xl shadow-[8px_8px_0_0_#0038FF] font-black uppercase text-xs tracking-widest hover:bg-[#CCFF00] hover:text-black transition-all cursor-pointer flex items-center justify-center gap-3 group"
               >
                 <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                 {t.availableWithdraw || 'Withdraw to Wallet'}
               </motion.button>
             )}

             <motion.button 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsDepositModalOpen(true)}
               className="col-span-2 bg-white text-black border-4 border-black py-4 rounded-2xl shadow-[8px_8px_0_0_#CCFF00] font-black uppercase text-xs tracking-widest hover:bg-black hover:text-[#CCFF00] transition-all cursor-pointer flex items-center justify-center gap-3 group"
             >
               <ArrowDownLeft className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
               {t.deposit || 'Deposit USDT'}
             </motion.button>

             <div className="col-span-2 bg-[#0038FF] border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0_0_#000] flex items-center justify-between group cursor-pointer hover:shadow-[12px_12px_0_0_#CCFF00] transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000]">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-[#CCFF00] text-[9px] font-black uppercase tracking-widest">{t.uplinkId}</p>
                    <p className="text-white text-xl font-black italic">{uplineId || t.none}</p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-[#CCFF00] group-hover:translate-x-2 transition-transform" strokeWidth={3} />
             </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Seat List */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter" style={{ textShadow: '4px 4px 0 #0038FF' }}>{t.mySeats}</h2>
              <p className="text-[#CCFF00] font-bold mt-4 uppercase tracking-widest text-sm">{t.managePositions}</p>
            </div>
            <button 
              onClick={upgradeLevel}
              className="hidden md:flex items-center gap-3 bg-white border-4 border-black px-8 py-4 rounded-full shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#CCFF00] hover:-translate-y-1 transition-all group"
            >
               <PlusCircle className="w-6 h-6 text-[#0038FF]" />
               <span className="font-black uppercase tracking-widest text-xs">{t.upgradeLevel}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {seats.length > 0 ? (
              seats.map((seat) => (
                <SeatCard key={seat.id} seat={seat} t={t} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-white/20 rounded-[3rem]">
                <p className="text-white/40 font-black uppercase tracking-widest italic">{t.noActiveSeats}</p>
              </div>
            )}
          </div>
        </section>

        {/* Team Summary & Activity Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Team Summary */}
          <div className="lg:col-span-2 space-y-12">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter" style={{ textShadow: '4px 4px 0 #0038FF' }}>{t.teamSummary}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: t.directMembers, val: isRegistered ? (systemConfig?.stats?.directMembers || '0').toString() : '0', icon: Users, color: 'bg-white' },
                { label: t.validSeats, val: seats.length.toString(), icon: ShieldCheck, color: 'bg-[#CCFF00]' },
                { label: t.totalTeamSeats, val: (systemConfig?.stats?.teamSeats || '0').toString(), icon: LayoutGrid, color: 'bg-white' },
                { label: t.teamVolume, val: (systemConfig?.stats?.teamVolume || '0.00').toString(), icon: TrendingUp, color: 'bg-[#0038FF] text-white' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`${item.color.includes('white') ? 'bg-white text-black' : item.color} border-4 border-black p-8 rounded-[3rem] shadow-[10px_10px_0_0_#000] flex items-center justify-between group hover:rotate-1 transition-all`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl border-2 border-black/10 flex items-center justify-center">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-1`}>{item.label}</p>
                      <p className="text-3xl font-black italic tracking-tighter leading-none">{item.val}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 opacity-20 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter" style={{ textShadow: '4px 4px 0 #0038FF' }}>{t.recentActivity}</h2>
            <div className="bg-white border-4 border-black rounded-[3rem] p-4 shadow-[10px_10px_0_0_#000] relative overflow-hidden flex flex-col gap-2">
               <div className="flex p-4 border-b-2 border-black/5 items-center justify-between mb-4">
                  <div className="flex gap-4">
                    <button className="bg-[#CCFF00] border-2 border-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0_0_#000]">{t.upgrades}</button>
                  </div>
               </div>
               
               <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {activities.length > 0 ? (
                    activities.map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-[#F1F3F5] rounded-2xl border border-black/5 hover:border-black transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-10 ${act.color} rounded-full`}></div>
                          <div>
                            <p className="text-xs font-black text-black uppercase italic leading-none mb-1">{act.desc}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-black/30">{act.type}</p>
                          </div>
                        </div>
                        <div className="text-[8px] font-black text-black/20 uppercase tracking-widest">{act.time}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-10 text-[10px] font-black uppercase text-black/20">No recent activity</p>
                  )}
               </div>
               
               <Link to="/transactions" className="p-6 mt-4 bg-gray-50 rounded-2xl border border-black/5 flex items-center justify-between group cursor-pointer">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black">{t.viewAllLogs}</span>
                  <History className="w-5 h-5 text-black/20 group-hover:text-black group-hover:rotate-45 transition-all" />
               </Link>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isDepositModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white border-4 border-black rounded-[2.5rem] p-6 md:p-10 max-w-sm w-full shadow-[10px_10px_0_0_#CCFF00] relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
               <button 
                 onClick={() => setIsDepositModalOpen(false)}
                 className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-xl border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000] active:translate-y-1 active:shadow-none"
               >
                 <X className="w-5 h-5" />
               </button>

               <div className="mb-8 text-center sm:text-left">
                  <div className="w-14 h-14 bg-[#CCFF00] rounded-2xl border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#000] mx-auto sm:mx-0">
                     <ArrowDownLeft className="w-7 h-7 text-black" />
                  </div>
                  <h2 className="text-3xl font-black text-black uppercase italic leading-none mb-3">{t.deposit || 'Deposit USDT'}</h2>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-tight max-w-[200px] sm:max-w-none mx-auto sm:mx-0">Add funds to your internal balance for activation and system fees.</p>
               </div>

               <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-[2rem] border-2 border-black flex flex-col items-center sm:items-start text-center sm:text-left">
                     <p className="text-[8px] font-black uppercase text-black/40 tracking-widest mb-2">Internal USDT Balance</p>
                     <p className="text-3xl font-black text-black">{balance.toFixed(2)} USDT</p>
                  </div>

                   <div>
                    <label className="text-[9px] font-black uppercase text-black/40 tracking-widest mb-3 block text-center sm:text-left">
                      Real USDT Deposit
                    </label>
                    <div className="relative">
                       <input 
                         type="number"
                         value={depositAmount}
                         onChange={(e) => setDepositAmount(e.target.value)}
                         className="w-full bg-white border-2 border-black p-4 rounded-xl font-black text-xl focus:outline-none focus:ring-4 ring-[#CCFF00]/20 transition-all pr-24"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-black/20 text-sm tracking-tighter">USDT</div>
                    </div>
                    <p className="mt-3 text-[9px] font-black uppercase text-black/30 tracking-widest leading-relaxed text-center sm:text-left">
                      Transfer USDT from your connected wallet to the system.
                    </p>
                  </div>

                  <button 
                    onClick={handleDeposit}
                    className="w-full bg-black text-[#CCFF00] font-black py-5 rounded-2xl border-4 border-black uppercase tracking-[0.2em] shadow-[6px_6px_0_0_#0038FF] hover:bg-[#0038FF] hover:text-white transition-all active:translate-y-1 active:shadow-none"
                  >
                    {t.deposit || 'Confirm Deposit'}
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky bottom-0 z-10 p-10 flex justify-center lg:justify-end pointer-events-none">
         <motion.button 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           onClick={handleBuyback}
           className="bg-[#0038FF] text-white border-4 border-black px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[10px_10px_0_0_#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all active:scale-95 pointer-events-auto flex items-center gap-4"
         >
           <RefreshCw className="w-5 h-5" /> {t.buyback || 'Trigger Buyback'}
         </motion.button>
      </div>

    </div>
  );
};

export default Account;
