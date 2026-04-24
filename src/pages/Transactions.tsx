
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../components/LanguageContext';
import { 
  History, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCcw, 
  Zap, 
  Wallet, 
  ExternalLink, 
  Filter, 
  Calendar, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown
} from 'lucide-react';

import { useAccount } from 'wagmi';
import { useMatrix } from '../context/MatrixContext';

const StatusBadge = ({ status, t }: { status: string, t: any }) => {
  const styles = {
    Success: 'bg-green-100 text-green-700 border-green-200',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Failed: 'bg-red-100 text-red-700 border-red-200',
  };

  const icons = {
    Success: <CheckCircle2 className="w-3 h-3" />,
    Pending: <Clock className="w-3 h-3" />,
    Failed: <XCircle className="w-3 h-3" />,
  };

  return (
    <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight ${styles[status as keyof typeof styles] || styles.Success}`}>
      {icons[status as keyof typeof icons] || icons.Success}
      {status === 'Success' ? t.success : status === 'Pending' ? t.pending : t.failed}
    </div>
  );
};

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const Transactions = () => {
  const { t } = useLanguage();
  const { address } = useAccount();
  const { accountMode } = useMatrix();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) return;
      try {
        const res = await fetch(`/api/matrix/transactions/${address}`);
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [address]);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit': return <ArrowDownCircle className="w-5 h-5 text-green-500" />;
      case 'withdrawal': return <ArrowUpCircle className="w-5 h-5 text-blue-500" />;
      case 'reinvestment': return <RefreshCcw className="w-5 h-5 text-purple-500" />;
      case 'upgrade': return <Zap className="w-5 h-5 text-[#CCFF00]" />;
      case 'activation': return <Zap className="w-5 h-5 text-[#CCFF00]" />;
      case 'matrix': return <RefreshCcw className="w-5 h-5 text-blue-500" />;
      case 'differential': return <TrendingUp className="w-5 h-5 text-green-500" />;
      default: return <History className="w-5 h-5 text-black" />;
    }
  };

  return (
    <div className="w-full pb-32">
      {/* Hero Section */}
      <section className="px-6 md:px-10 pt-32 pb-16 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-[#CCFF00] px-4 py-1.5 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] mb-8"
          >
            <History className="w-5 h-5 text-black" />
            <span className="text-xs font-black uppercase text-black tracking-[0.2em]">Activity Log</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(3.5rem,10vw,120px)] font-black text-white leading-[0.8] uppercase tracking-tighter mb-8"
            style={{ textShadow: 'clamp(4px, 0.8vw, 10px) clamp(4px, 0.8vw, 10px) 0 #0038FF' }}
          >
            {t.transactionHistoryTitle}
          </motion.h1>

          <p className="text-xl md:text-2xl text-[#CCFF00] font-bold italic max-w-3xl">
            {t.transactionHistorySubtitle}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        <div className="bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0_0_#000] mb-12">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-black">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <h3 className="font-black text-black uppercase italic tracking-tight">{t.realOnChain}</h3>
            </div>
            <p className="text-[10px] font-black text-black/40 uppercase leading-relaxed">All transactions are permanently recorded on the blockchain and require network confirmation.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-4 border-black rounded-[2.5rem] p-6 lg:p-10 shadow-[10px_10px_0_0_#0038FF] mb-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 items-end">
           <div>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-3 flex items-center gap-2"><Calendar className="w-3 h-3" /> {t.timeRange}</p>
              <select className="w-full bg-gray-100 border-2 border-black/5 p-3 rounded-2xl font-black uppercase text-[10px] transition-all focus:border-black outline-none cursor-pointer">
                 <option>{t.last7Days}</option>
                 <option>{t.last30Days}</option>
                 <option>{t.allTime}</option>
              </select>
           </div>

           <div>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-3 flex items-center gap-2"><Filter className="w-3 h-3" /> {t.txType}</p>
              <select className="w-full bg-gray-100 border-2 border-black/5 p-3 rounded-2xl font-black uppercase text-[10px] transition-all focus:border-black outline-none cursor-pointer">
                 <option>{t.all}</option>
                 <option>{t.deposit}</option>
                 <option>{t.withdrawal}</option>
                 <option>{t.reinvestment}</option>
                 <option>{t.upgrades}</option>
              </select>
           </div>

           <div>
              <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> {t.status}</p>
              <select className="w-full bg-gray-100 border-2 border-black/5 p-3 rounded-2xl font-black uppercase text-[10px] transition-all focus:border-black outline-none cursor-pointer">
                 <option>{t.all}</option>
                 <option>{t.success}</option>
                 <option>{t.pending}</option>
                 <option>{t.failed}</option>
              </select>
           </div>

           <div className="lg:col-span-1">
              <button className="w-full bg-black text-[#CCFF00] px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#0038FF] hover:text-white transition-all shadow-[4px_4px_0_0_#CCFF00]">
                 <Search className="w-4 h-4" />
                 Apply Filters
              </button>
           </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white border-4 border-black rounded-[3rem] shadow-[15px_15px_0_0_#000] overflow-hidden">
           {/* Desktop Header */}
           <div className="hidden lg:grid grid-cols-6 p-8 border-b-4 border-black bg-gray-50 text-[10px] font-black uppercase tracking-widest text-black/40 italic">
              <div>{t.txType}</div>
              <div>{t.amount} (USDT)</div>
              <div>{t.status}</div>
              <div>{t.history}</div>
              <div>{t.txHash}</div>
              <div className="text-right">{t.fromTo}</div>
           </div>

           <div className="divide-y-2 divide-black/5">
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-6 p-8 hover:bg-black/5 transition-colors items-center gap-4 lg:gap-0"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center">
                          {getTypeIcon(tx.type)}
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-black leading-none mb-1 capitalize">{tx.type}</p>
                            {(accountMode === 'test' || accountMode === 'demo') && (
                               <div className="px-1.5 py-0.5 rounded bg-black text-[#CCFF00] text-[7px] font-black uppercase tracking-tighter">Simulated</div>
                            )}
                          </div>
                          <span className={`text-[8px] font-black uppercase ${tx.category === 'income' ? 'text-green-600' : 'text-blue-600'} tracking-tighter flex items-center gap-1`}>
                            {tx.category === 'income' ? <TrendingUp className="w-2 h-2" /> : <RefreshCcw className="w-2 h-2" />} {tx.category}
                          </span>
                       </div>
                    </div>

                    <div className="lg:block">
                       <span className={`text-lg font-black ${tx.category === 'income' ? 'text-green-600' : 'text-black'} tracking-tighter font-mono`}>{tx.amount}</span>
                    </div>

                    <div>
                       <StatusBadge status={tx.status || 'Success'} t={t} />
                    </div>

                    <div>
                       <p className="text-[10px] font-black text-black leading-none mb-1 font-mono">{new Date(tx.timestamp).toLocaleDateString()}</p>
                       <p className="text-[9px] font-bold text-black/30 tracking-widest font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>

                    <div className="flex items-center gap-2 group cursor-pointer">
                       <span className="text-[10px] font-black text-black/40 group-hover:text-[#0038FF] font-mono">{(tx.id || '').toString().slice(0,10)}</span>
                       <ExternalLink className="w-3 h-3 text-black/20 group-hover:text-[#0038FF]" />
                    </div>

                    <div className="text-right lg:block">
                       <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">{tx.category === 'income' ? 'CONTRACT → USER' : 'USER → CONTRACT'}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-20 text-center text-black/20 font-black uppercase italic">
                   No transactions found
                </div>
              )}
           </div>

           <div className="p-8 bg-gray-50 border-t-2 border-black/5 flex justify-center">
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors flex items-center gap-2">
                 Load More Activity <ChevronDown className="w-4 h-4" />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Transactions;
