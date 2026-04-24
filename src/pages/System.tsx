
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../components/LanguageContext';
import { useMatrix } from '../context/MatrixContext';
import { 
  ShieldCheck, 
  ChevronRight, 
  Calculator, 
  ArrowUpRight, 
  Layers, 
  Settings, 
  Users, 
  Zap, 
  BarChart3,
  ArrowRightLeft
} from 'lucide-react';

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-12">
    <motion.h2 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter"
      style={{ textShadow: '4px 4px 0 #0038FF' }}
    >
      {title}
    </motion.h2>
    {subtitle && <p className="text-[#CCFF00] font-bold mt-4 uppercase tracking-widest text-sm">{subtitle}</p>}
  </div>
);

const System = () => {
  const { t, tr } = useLanguage();
  const { currentLevel, upgradeLevel, isRegistered, systemConfig } = useMatrix();

  const levelDataFromConfig = systemConfig?.levels || [];
  const descriptions = systemConfig?.descriptions || {};
  const [calcInput, setCalcInput] = React.useState('');
  const [calcResult, setCalcResult] = React.useState<number | null>(null);

  const [calculatorState, setCalculatorState] = React.useState({ current: '1', target: '2' });
  const [upgradeResult, setUpgradeResult] = React.useState<{ totalCost: number, potentialRewards: number, estimatedDays: number } | null>(null);

  const calculateEarnings = () => {
    const val = parseFloat(calcInput);
    if (!isNaN(val)) {
      const currentRankData = levelDataFromConfig.find((l: any) => l.rank === (currentLevel || 1));
      const ratio = currentRankData ? currentRankData.rewardRatio : 0.1;
      // Differential simulation: assume user at current level, source at V1
      const spread = ratio - 0.1; 
      const profit = val * (spread > 0 ? spread : ratio);
      setCalcResult(profit);
    }
  };

  const calculateUpgradePath = () => {
    const start = parseInt(calculatorState.current);
    const end = parseInt(calculatorState.target);
    if (end <= start) return;

    let totalCost = 0;
    let startRatio = 0;
    let endRatio = 0;

    levelDataFromConfig.forEach((l: any) => {
      if (l.rank > start && l.rank <= end) totalCost += l.upgradeCost;
      if (l.rank === start) startRatio = l.rewardRatio;
      if (l.rank === end) endRatio = l.rewardRatio;
    });

    setUpgradeResult({
      totalCost,
      potentialRewards: Math.round((endRatio - startRatio) * 1000) / 10,
      estimatedDays: (end - start) * 14 // Mock: 2 weeks per level average
    });
  };

  const navItems = [
    { name: t.ruleEngine || 'Rule Engine', id: 'rule-version' },
    { name: t.vStructure || 'V-Structure', id: 'level-structure' },
    { name: t.ecosystem || 'Ecosystem', id: 'upgrade-conditions' },
    { name: t.calculators || 'Calculators', id: 'calculators' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full pb-32">
      {/* Hero Section */}
      <section className="px-6 md:px-10 pt-32 pb-20 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-20"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-[#CCFF00] px-6 py-2 rounded-full border-4 border-black shadow-[8px_8px_0_0_#000] mb-8"
          >
            <Settings className="w-6 h-6 text-black animate-spin-slow" />
            <span className="text-sm font-black uppercase text-black tracking-[0.2em]">{t.configCenter}</span>
          </motion.div>
          
          <h1 
            className="text-[clamp(3rem,10vw,140px)] font-black text-white leading-[0.8] uppercase tracking-tighter mb-8"
            style={{ textShadow: 'clamp(4px, 0.8vw, 12px) clamp(4px, 0.8vw, 12px) 0 #0038FF' }}
          >
            {t.systemRulesTitle.split(' & ').map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br className="hidden md:block"/>}
                <span className={i === 1 ? 'text-[#CCFF00]' : ''}>{part}</span>
                {i === 0 && <span className="text-[#CCFF00]"> & </span>}
              </React.Fragment>
            ))}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 font-bold italic max-w-3xl">
            {t.rulesConfigCenter} • Run-time Engine: {systemConfig?.protocolName || 'TRON BLOCK'}
          </p>
        </motion.div>
      </section>

      {/* Sticky Redirector */}
      <div className="sticky top-20 z-40 w-full bg-black/50 backdrop-blur-xl border-y-4 border-black mb-20">
        <div className="max-w-7xl mx-auto flex items-center overflow-x-auto no-scrollbar px-6 py-4 gap-4">
           {navItems.map((item) => (
             <button 
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="whitespace-nowrap px-6 py-2 rounded-full bg-white border-2 border-black text-black font-black text-[10px] uppercase tracking-widest hover:bg-[#CCFF00] transition-colors shadow-[4px_4px_0_0_#000]"
             >
               {item.name}
             </button>
           ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Rule Version Card */}
        <section id="rule-version" className="mb-32">
          <SectionHeader title={t.currentActiveVersion} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#CCFF00] border-4 border-black rounded-[3rem] p-8 md:p-12 shadow-[15px_15px_0_0_#0038FF] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <ShieldCheck className="w-48 h-48 text-black" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="flex flex-col items-center md:items-start">
                 <p className="text-black font-bold uppercase tracking-widest text-xs opacity-50 mb-2">Version String</p>
                 <h3 className="text-6xl md:text-8xl font-black text-black italic tracking-tighter">{systemConfig?.version || 'V2.1.0-STABLE'}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full md:w-auto">
                <div className="bg-black/5 p-6 rounded-2xl border-2 border-black/10">
                   <p className="text-black font-black uppercase text-[10px] tracking-widest mb-1">{t.effectiveDate}</p>
                   <p className="text-2xl font-black text-black">{systemConfig?.lastUpdated ? new Date(systemConfig.lastUpdated).toLocaleDateString() : 'REAL-TIME'}</p>
                </div>
                <div className="bg-black/5 p-6 rounded-2xl border-2 border-black/10">
                   <p className="text-black font-black uppercase text-[10px] tracking-widest mb-1">{t.lastUpdated}</p>
                   <p className="text-2xl font-black text-black">AUTOMATED SYNC</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Level Structure */}
        <section id="level-structure" className="mb-32">
          <SectionHeader title={t.levelStructure} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {levelDataFromConfig.map((lvl: any, i: number) => (
              <motion.div 
                key={lvl.rank}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border-4 border-black rounded-[2rem] p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#CCFF00] hover:-translate-y-2 transition-all group flex flex-col justify-between aspect-square"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-5xl font-black text-[#0038FF] italic group-hover:text-black transition-colors">{lvl.name}</span>
                  {lvl.rewardRatio > 0 && (
                    <div className="bg-[#CCFF00] px-3 py-1 rounded-full border-2 border-black font-black text-[10px] shadow-[2px_2px_0_0_#000]">
                      {(lvl.rewardRatio * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-1">Revenue</p>
                      <p className="text-xs font-black text-black">{lvl.revenue ? lvl.revenue.toLocaleString() : '0'} USDT</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-1">Min Orders</p>
                      <p className="text-xs font-black text-black">{lvl.minOrders || '0'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-1">Reward (Single)</p>
                    <p className="text-sm font-black text-black group-hover:text-[#0038FF] transition-colors">{lvl.reward ? lvl.reward.toLocaleString() : '0'} USDT</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-1">Total Requirement</p>
                    <p className="text-xs font-black text-black italic">{lvl.directReq || 0} Direct + {lvl.teamReq || 0} Team</p>
                  </div>
                  {isRegistered && i + 1 > currentLevel && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => upgradeLevel()}
                      className="w-full mt-4 bg-black text-[#CCFF00] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_0_#0038FF] hover:bg-[#0038FF] hover:text-white transition-all"
                    >
                      {t.upgrade?.toUpperCase() || 'UPGRADE'}
                    </motion.button>
                  )}
                  {isRegistered && i + 1 <= currentLevel && (
                    <div className="w-full mt-4 bg-[#CCFF00] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0_0_#000] flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> {t.active?.toUpperCase() || 'ACTIVE'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Systems */}
        <section id="upgrade-conditions" className="mb-32">
          <SectionHeader title={t.coreEcosystemLogic || 'Ecosystem Core'} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: t.activateSeat || 'Activate Seat', 
                desc: descriptions.activation || tr(t.activateSeatWithAmount, { amount: systemConfig?.activationFee || 80 }),
                icon: Zap,
                color: 'bg-[#CCFF00]'
              },
              { 
                title: t.publicMatrix || 'Public Matrix', 
                desc: descriptions.matrix || `Automated global spillover system. Earn rewards from the total volume.`,
                icon: Layers,
                color: 'bg-white'
              },
              { 
                title: t.teamPerformance || 'Team Performance', 
                desc: descriptions.differential || `Differential bonus logic based on Rank Spread. Team development triggers rewards.`,
                icon: Users,
                color: 'bg-[#0038FF] text-white'
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`${item.color} border-4 border-black p-10 rounded-[3rem] shadow-[10px_10px_0_0_#000] flex flex-col gap-6 group hover:shadow-[15px_15px_0_0_#CCFF00] transition-all`}
              >
                <div className="w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_#000] bg-white group-hover:rotate-12 transition-transform">
                  <item.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">{item.title}</h3>
                <p className={`text-sm font-bold uppercase tracking-tight ${item.color.includes('white') ? 'text-black/50' : 'opacity-70'}`}>
                  {item.desc}
                </p>
                <button className="mt-4 flex items-center gap-2 font-black uppercase text-xs tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                  {t.learnMore} <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Calculators */}
        <section id="calculators" className="mb-32">
          <SectionHeader title={t.calculators} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Upgrade Path Calculator */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border-4 border-black rounded-[4rem] p-10 md:p-16 shadow-[15px_15px_0_0_#000] relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                  <Calculator className="w-64 h-64 text-black" />
               </div>
               <div className="relative z-10">
                 <h4 className="text-3xl font-black text-black uppercase italic italic mb-8 flex items-center gap-4">
                   <div className="w-10 h-10 bg-[#CCFF00] rounded-xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#000]">
                      <BarChart3 className="w-5 h-5 text-black" />
                   </div>
                   {t.upgradeCalculator}
                 </h4>
                 <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-2 block">{t.selectCurrentRank}</label>
                      <select 
                        value={calculatorState.current}
                        onChange={(e) => setCalculatorState(prev => ({ ...prev, current: e.target.value }))}
                        className="w-full bg-gray-100 border-2 border-black p-4 rounded-2xl font-black uppercase text-sm focus:outline-none focus:ring-4 ring-[#CCFF00]/50 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        {levelDataFromConfig.map((l: any) => <option key={l.rank} value={l.rank}>{l.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-2 block">{t.targetRank}</label>
                      <select 
                        value={calculatorState.target}
                        onChange={(e) => setCalculatorState(prev => ({ ...prev, target: e.target.value }))}
                        className="w-full bg-gray-100 border-2 border-black p-4 rounded-2xl font-black uppercase text-sm focus:outline-none focus:ring-4 ring-[#0038FF]/30 active:scale-[0.99] transition-all cursor-pointer"
                      >
                        {levelDataFromConfig.map((l: any) => <option key={l.rank} value={l.rank}>{l.name}</option>)}
                      </select>
                    </div>
                    <button 
                      onClick={calculateUpgradePath}
                      className="w-full bg-[#0038FF] text-white font-black py-5 rounded-2xl border-4 border-black uppercase tracking-widest shadow-[5px_5px_0_0_#000] hover:bg-[#CCFF00] hover:text-black transition-all active:translate-y-1 active:shadow-none"
                    >
                      {t.analyzeStrategy}
                    </button>

                    <AnimatePresence>
                      {upgradeResult && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-8 p-6 bg-gray-50 rounded-3xl border-2 border-black/5 space-y-4"
                        >
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-black/40">Total Upgrade Cost</span>
                              <span className="text-xl font-black text-black">{upgradeResult.totalCost} USDT</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-black/40">Potential Rewards increase</span>
                              <span className="text-xl font-black text-green-600">+{upgradeResult.potentialRewards}%</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-black/40">Estimated Time</span>
                              <span className="text-xl font-black text-[#0038FF]">{upgradeResult.estimatedDays} Days</span>
                           </div>
                           <p className="text-[8px] font-bold text-black/30 uppercase tracking-widest italic pt-2">Based on current network growth and 15% team activation rate.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               </div>
            </motion.div>

            {/* Earnings Simulator */}
            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-black border-4 border-[#CCFF00] rounded-[4rem] p-10 md:p-16 shadow-[20px_20px_0_0_#CCFF00]"
            >
               <h4 className="text-3xl font-black text-[#CCFF00] uppercase italic mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#000]">
                    <ArrowRightLeft className="w-5 h-5 text-black" />
                  </div>
                  {t.earningsSimulator}
               </h4>
               <div className="space-y-8">
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2 block">{t.amountToInvest}</label>
                    <input 
                      type="number" 
                      value={calcInput}
                      onChange={(e) => setCalcInput(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-white/5 border-2 border-[#CCFF00] p-6 pr-20 rounded-2xl font-black text-white text-2xl focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/10"
                    />
                    <div className="absolute right-6 bottom-6 font-black text-white/30 text-lg">USDT</div>
                  </div>
                  
                  <button 
                    onClick={calculateEarnings}
                    className="w-full bg-[#CCFF00] text-black font-black py-6 rounded-2xl border-4 border-white uppercase tracking-widest shadow-[0_0_30px_rgba(204,255,0,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 group"
                  >
                    {t.calculate} <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  </button>

                  <AnimatePresence>
                    {calcResult !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-white/10 rounded-3xl border-2 border-white/20 text-center"
                      >
                         <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2">{t.estimatedEarnings}</p>
                         <p className="text-5xl font-black text-[#CCFF00] tracking-tighter">~ {calcResult.toLocaleString()} USDT</p>
                         <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-4 italic">{t.earningsDisclaimer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </motion.div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default System;
