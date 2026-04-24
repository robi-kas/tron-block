
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Settings as SettingsIcon, 
  History, 
  TrendingUp, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  RefreshCw,
  Search,
  ChevronRight,
  ArrowUpRight,
  Save,
  Lock,
  Zap,
  ExternalLink,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'config' | 'banner'>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [editableConfig, setEditableConfig] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalVolume: 0,
    activeNodes: 0,
    newNodes24h: 0,
    systemHealth: '100%'
  });
  const [bannerText, setBannerText] = useState('');
  const [bannerActive, setBannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem('admin_session');
    if (admin) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } else if (activeTab === 'dashboard') {
        const res = await fetch('/api/matrix/stats');
        if (res.ok) {
          const data = await res.json();
          if (data && data.totalVolume !== undefined) {
             setDashboardStats(data);
          }
        }
      } else if (activeTab === 'config') {
        const res = await fetch('/api/matrix/config');
        if (res.ok) {
          const data = await res.json();
          setSystemConfig(data);
          setEditableConfig(data);
        }
      } else if (activeTab === 'banner') {
        const res = await fetch('/api/matrix/config');
        if (res.ok) {
          const data = await res.json();
          if (data.globalBanner) {
            setBannerText(data.globalBanner.text);
            setBannerActive(data.globalBanner.active);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_session', JSON.stringify(data.admin));
        setIsLoggedIn(true);
        setError('');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Server error.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert(`Order #${orderId} status updated to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableConfig)
      });
      if (res.ok) {
        alert('System configuration updated successfully!');
        setSystemConfig(editableConfig);
      } else {
        alert('Failed to save configuration.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black border-4 border-white/10 p-10 md:p-16 rounded-[4rem] shadow-[20px_20px_0_0_#CCFF00] max-w-xl w-full relative overflow-hidden"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none z-0"></div>
          
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[5px_5px_0_0_#0038FF] border-2 border-white/20">
                <Lock className="w-10 h-10 text-[#CCFF00]" />
              </div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Admin Portal</h1>
              <p className="text-[10px] font-black uppercase text-[#CCFF00] tracking-widest mt-2">{process.env.NODE_ENV === 'development' ? 'Default: admin / admin123' : 'Secure Authorization Required'}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/20 p-4 rounded-2xl font-black text-white focus:outline-none focus:border-[#CCFF00] focus:ring-4 ring-[#CCFF00]/20 transition-all placeholder:text-white/20"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/20 p-4 rounded-2xl font-black text-white focus:outline-none focus:border-[#CCFF00] focus:ring-4 ring-[#CCFF00]/20 transition-all placeholder:text-white/20"
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && <p className="text-red-500 font-bold text-xs uppercase text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-[#CCFF00] text-black font-black py-5 rounded-2xl border-4 border-[#CCFF00] uppercase tracking-widest shadow-[8px_8px_0_0_#0038FF] hover:bg-white hover:border-white transition-all active:translate-y-1 active:shadow-none mt-4"
              >
                Authorize Access
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex text-white font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Sidebar */}
      <div className="w-20 md:w-80 bg-black border-r-4 border-white/10 flex flex-col justify-between p-4 md:p-8 shrink-0 relative z-40">
        <div className="space-y-12">
          <div className="flex items-center gap-3">
             <div className="bg-[#CCFF00] text-black font-black text-xs px-2 py-1 rounded-sm hidden md:block border border-[#CCFF00]">ADMIN</div>
             <div className="bg-white text-black font-black text-xs px-2 py-1 rounded-sm border border-white">BLOCK</div>
          </div>

          <nav className="space-y-4">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'users', icon: Users, label: 'User Directory' },
              { id: 'orders', icon: History, label: 'Order History' },
              { id: 'config', icon: SettingsIcon, label: 'System Rules' },
              { id: 'banner', icon: Zap, label: 'Announcements' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group relative
                  ${activeTab === item.id 
                    ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-[6px_6px_0_0_#0038FF]' 
                    : 'bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon className={`w-6 h-6 md:w-5 md:h-5 ${activeTab === item.id ? 'stroke-[3px]' : ''}`} />
                <span className="hidden md:block font-black uppercase text-xs tracking-widest">{item.label}</span>
                {activeTab === item.id && <div className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 w-2 h-8 bg-[#0038FF] rounded-r-full shadow-[2px_0_10px_#0038FF]" />}
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-red-500 text-white/40 hover:text-white transition-all border-2 border-transparent hover:border-red-500 shadow-none hover:shadow-[6px_6px_0_0_#ff000030]"
        >
          <LogOut className="w-5 h-5 ml-1 md:ml-0" />
          <span className="hidden md:block font-black uppercase text-xs tracking-widest">Sign Out</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {/* Background Grid for Content Area */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none z-0"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 90%)'
          }}
        ></div>

        <header className="bg-black/80 backdrop-blur-md border-b-4 border-white/10 p-8 md:p-12 sticky top-0 z-30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase text-[#CCFF00] tracking-[0.3em] mb-1">Matrix Management / v2.1</p>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter" style={{ textShadow: '4px 4px 0 #0038FF' }}>
                {activeTab === 'dashboard' && 'Protocol Overview'}
                {activeTab === 'users' && 'Node Network'}
                {activeTab === 'orders' && 'Transactional Flow'}
                {activeTab === 'config' && 'Rule Engine'}
                {activeTab === 'banner' && 'Global Announcements'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border-2 border-white/10">
                  <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_10px_#CCFF00]"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Master Node: Online</span>
               </div>
               <button 
                 onClick={fetchData}
                 className="p-3 bg-[#CCFF00] border-2 border-[#CCFF00] text-black rounded-xl hover:bg-white transition-colors shadow-[4px_4px_0_0_#0038FF] active:translate-y-1 active:shadow-none"
               >
                 <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
               </button>
            </div>
          </div>
        </header>

        <main className="p-8 md:p-12 relative z-10">
           {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {[
                  { label: 'Total Volume', val: dashboardStats.totalVolume ? `${dashboardStats.totalVolume.toLocaleString()} USDT` : '0', icon: TrendingUp, color: 'bg-[#CCFF00] text-black', border: 'border-[#CCFF00]', shadow: 'shadow-[10px_10px_0_0_#0038FF]' },
                  { label: 'Active Nodes', val: dashboardStats.activeNodes ? dashboardStats.activeNodes.toLocaleString() : '0', icon: Users, color: 'bg-black text-white', border: 'border-white/20', shadow: 'shadow-[10px_10px_0_0_#CCFF00]' },
                  { label: 'New Nodes (24h)', val: dashboardStats.newNodes24h ? dashboardStats.newNodes24h.toLocaleString() : '0', icon: Zap, color: 'bg-[#0038FF] text-white', border: 'border-[#0038FF]', shadow: 'shadow-[10px_10px_0_0_#CCFF00]' },
                  { label: 'System Health', val: dashboardStats.systemHealth || '100%', icon: ShieldCheck, color: 'bg-black text-white', border: 'border-white/20', shadow: 'shadow-[10px_10px_0_0_#0038FF]' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`${stat.color} border-4 ${stat.border} p-8 rounded-[2.5rem] ${stat.shadow} flex flex-col gap-4 group transition-all`}
                  >
                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${stat.color.includes('bg-black') ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'}`}>
                       <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase mb-1 ${stat.color.includes('bg-black') ? 'text-white/40' : 'text-current/60'}`}>{stat.label}</p>
                      <p className="text-3xl font-black italic tracking-tighter">{stat.val}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
           )}

           {activeTab === 'users' && (
             <div className="space-y-6">
                <div className="bg-black border-4 border-white/20 rounded-[2.5rem] p-6 shadow-[10px_10px_0_0_#CCFF00] flex items-center gap-4">
                   <Search className="w-6 h-6 text-[#CCFF00]" />
                   <input 
                     type="text" 
                     placeholder="Filter by address or ID..." 
                     className="flex-1 bg-transparent border-none text-white font-black uppercase text-xs tracking-widest focus:outline-none placeholder:text-white/20"
                   />
                </div>

                <div className="bg-black border-4 border-white/20 rounded-[3rem] shadow-[15px_15px_0_0_#0038FF] overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5 border-b-4 border-white/20">
                         <tr>
                            {['ID', 'Address', 'Level', 'Balance', 'History'].map(h => (
                              <th key={h} className="p-6 text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">{h}</th>
                            ))}
                         </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-white/5 font-black text-xs text-white">
                         {users.map(u => (
                           <tr key={u.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-6">#{u.id}</td>
                              <td className="p-6 font-mono text-[#CCFF00]">{u.address}</td>
                              <td className="p-6 italic text-lg text-white">V{u.level}</td>
                              <td className="p-6">{u.balance.toLocaleString()} USDT</td>
                              <td className="p-6">
                                 <button className="p-2 border-2 border-white/20 rounded-lg hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] transition-all">
                                    <ArrowUpRight className="w-4 h-4" />
                                 </button>
                              </td>
                           </tr>
                         ))}
                         {users.length === 0 && !loading && (
                            <tr>
                               <td colSpan={6} className="p-12 text-center text-white/40 uppercase italic tracking-widest">No nodes found in the network.</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'orders' && (
             <div className="space-y-6">
                <div className="bg-black border-4 border-white/20 rounded-[2.5rem] p-6 shadow-[10px_10px_0_0_#CCFF00] flex items-center gap-4">
                   <Search className="w-6 h-6 text-[#CCFF00]" />
                   <input 
                     type="text" 
                     placeholder="Search by Order ID or Transaction Hash..." 
                     className="flex-1 bg-transparent border-none text-white font-black uppercase text-xs tracking-widest focus:outline-none placeholder:text-white/20"
                   />
                </div>

                <div className="bg-black border-4 border-white/20 rounded-[3rem] shadow-[15px_15px_0_0_#0038FF] overflow-hidden overflow-x-auto">
                   <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-white/5 border-b-4 border-white/20">
                         <tr>
                            {['Order ID', 'Type', 'Amount', 'Status', 'Timestamp', 'Explorer', 'Actions'].map(h => (
                              <th key={h} className="p-6 text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">{h}</th>
                            ))}
                         </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-white/5 font-black text-xs text-white">
                         {orders.map(o => (
                           <tr key={o.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-6">#{o.id}</td>
                              <td className="p-6 uppercase">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${o.type === 'deposit' ? 'bg-[#CCFF00]' : 'bg-[#0038FF]'}`}></div>
                                    {o.type}
                                 </div>
                              </td>
                              <td className="p-6 text-lg">
                                {o.amount.toLocaleString()} <span className="text-[10px] text-white/40 italic">USDT</span>
                              </td>
                              <td className="p-6">
                                 <span className={`text-[10px] px-3 py-1 rounded-full border ${
                                   o.status === 'completed' ? 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20' : 
                                   o.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                   'bg-red-500/10 text-red-500 border-red-500/20'
                                 }`}>
                                    {o.status}
                                 </span>
                              </td>
                              <td className="p-6 text-white/40 font-mono text-[10px]">{new Date(o.created_at).toLocaleString()}</td>
                              <td className="p-6">
                                <a 
                                  href={`https://tronscan.org/#/transaction/${o.tx_hash}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="font-mono text-white/30 hover:text-[#CCFF00] transition-colors flex items-center gap-1 group"
                                >
                                  {o.tx_hash?.slice(0, 6)}...{o.tx_hash?.slice(-4)} <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                </a>
                              </td>
                              <td className="p-6">
                                <div className="flex gap-2">
                                  {o.status === 'pending' && (
                                    <button 
                                      onClick={() => handleUpdateOrderStatus(o.id, 'completed')}
                                      className="bg-[#CCFF00] text-black p-2 rounded-lg hover:bg-white transition-colors"
                                      title="Complete Order"
                                    >
                                      <ShieldCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                                    className="bg-white/5 text-white/40 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    title="Cancel Order"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                           </tr>
                         ))}
                         {orders.length === 0 && !loading && (
                            <tr>
                               <td colSpan={7} className="p-12 text-center text-white/40 uppercase italic tracking-widest">No transactional flow detected in the protocol.</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'config' && editableConfig && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="bg-black border-4 border-white/20 p-10 rounded-[3rem] shadow-[12px_12px_0_0_#0038FF]">
                      <h4 className="text-2xl font-black text-white uppercase italic mb-8">Base Parameters</h4>
                      <div className="space-y-6">
                         <div>
                            <label className="text-[10px] font-black uppercase text-[#CCFF00] mb-2 block">Protocol Name</label>
                            <input 
                              type="text" 
                              value={editableConfig.protocolName} 
                              onChange={(e) => setEditableConfig({ ...editableConfig, protocolName: e.target.value })}
                              className="w-full bg-white/5 border-2 border-white/20 p-4 rounded-xl font-black uppercase text-xs text-white focus:outline-none focus:border-[#CCFF00] focus:ring-2 ring-[#CCFF00]/20 transition-all" 
                            />
                         </div>
                         <div>
                            <label className="text-[10px] font-black uppercase text-[#CCFF00] mb-2 block">Activation Fee (USDT)</label>
                            <input 
                              type="number" 
                              value={editableConfig.activationFee} 
                              onChange={(e) => setEditableConfig({ ...editableConfig, activationFee: Number(e.target.value) })}
                              className="w-full bg-white/5 border-2 border-white/20 p-4 rounded-xl font-black text-lg text-white focus:outline-none focus:border-[#CCFF00] focus:ring-2 ring-[#CCFF00]/20 transition-all" 
                            />
                         </div>
                         <button 
                           onClick={handleSaveConfig}
                           disabled={loading}
                           className="w-full bg-[#CCFF00] text-black font-black py-5 rounded-2xl border-4 border-[#CCFF00] uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[6px_6px_0_0_#0038FF] hover:bg-white hover:border-white transition-all active:translate-y-1 active:shadow-none disabled:opacity-50"
                         >
                            <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Core Config'}
                         </button>
                      </div>
                   </div>

                   <div className="bg-black border-4 border-white/20 p-10 rounded-[3rem] shadow-[12px_12px_0_0_#CCFF00]">
                      <h4 className="text-2xl font-black text-white uppercase italic mb-8">Matrix Rules</h4>
                      <div className="space-y-4">
                         {Object.entries(editableConfig.matrixRules).map(([key, val]: [string, any]) => (
                           <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border-2 border-white/10">
                              <span className="text-[10px] font-black uppercase text-white/60">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <div 
                                onClick={() => {
                                  const newRules = { ...editableConfig.matrixRules, [key]: !val };
                                  setEditableConfig({ ...editableConfig, matrixRules: newRules });
                                }}
                                className={`w-12 h-6 rounded-full relative cursor-pointer border-2 transition-colors ${val ? 'bg-[#CCFF00] border-[#CCFF00]' : 'bg-black border-white/40'}`}>
                                 <div className={`absolute top-0.5 w-4 h-4 rounded-full border-2 transition-all ${val ? 'right-0.5 bg-black border-black' : 'left-0.5 bg-white/40 border-transparent'}`} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="bg-black border-4 border-white/20 p-10 rounded-[3rem] shadow-[12px_12px_0_0_#0038FF]">
                   <h4 className="text-2xl font-black text-white uppercase italic mb-8 flex items-center justify-between">
                     Rank Distribution
                     <span className="text-xs text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/30">{editableConfig.levels.length} Levels</span>
                   </h4>
                   <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                      {editableConfig.levels.map((lvl: any, i: number) => (
                        <div key={lvl.rank} className="p-6 border-2 border-white/20 rounded-[2rem] hover:bg-white/5 hover:border-[#CCFF00]/50 transition-colors group">
                           <div className="flex items-center justify-between mb-6">
                              <span className="text-3xl font-black italic text-white group-hover:text-[#CCFF00] transition-colors">{lvl.name}</span>
                              <span className="text-xs font-black uppercase text-white/40">Rank {lvl.rank}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                 <p className="text-[8px] font-black text-[#CCFF00] uppercase tracking-widest mb-1">Upgrade Cost</p>
                                 <input 
                                   type="number" 
                                   value={lvl.upgradeCost} 
                                   onChange={(e) => {
                                     const newLevels = [...editableConfig.levels];
                                     newLevels[i] = { ...lvl, upgradeCost: Number(e.target.value) };
                                     setEditableConfig({ ...editableConfig, levels: newLevels });
                                   }}
                                   className="bg-transparent border-none text-sm font-black text-white w-full focus:outline-none"
                                 />
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                 <p className="text-[8px] font-black text-[#CCFF00] uppercase tracking-widest mb-1">Reward Ratio</p>
                                 <input 
                                   type="number" 
                                   step="0.01"
                                   value={lvl.rewardRatio} 
                                   onChange={(e) => {
                                     const newLevels = [...editableConfig.levels];
                                     newLevels[i] = { ...lvl, rewardRatio: Number(e.target.value) };
                                     setEditableConfig({ ...editableConfig, levels: newLevels });
                                   }}
                                   className="bg-transparent border-none text-sm font-black text-white w-full focus:outline-none"
                                 />
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                   <button 
                     onClick={handleSaveConfig}
                     disabled={loading}
                     className="w-full mt-8 bg-[#0038FF] text-white font-black py-5 rounded-2xl border-4 border-[#0038FF] uppercase tracking-widest text-xs shadow-[6px_6px_0_0_#CCFF00] hover:bg-white hover:text-black hover:border-white transition-all active:translate-y-1 active:shadow-none"
                   >
                     Apply Distribution Changes
                   </button>
                </div>
             </div>
           )}

           {activeTab === 'banner' && (
             <div className="max-w-2xl mx-auto bg-black border-4 border-white/20 p-10 rounded-[3rem] shadow-[12px_12px_0_0_#CCFF00]">
                <h4 className="text-3xl font-black text-white uppercase italic mb-8">Broadcast Announcement</h4>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase text-[#CCFF00] mb-2 block">Announcement Message</label>
                      <textarea 
                        value={bannerText}
                        onChange={(e) => setBannerText(e.target.value)}
                        placeholder="Enter the message to broadcast to all users..."
                        className="w-full bg-white/5 border-2 border-white/20 p-4 rounded-xl font-bold text-sm text-white focus:outline-none focus:border-[#CCFF00] focus:ring-2 ring-[#CCFF00]/20 transition-all min-h-[120px]" 
                      />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border-2 border-white/10">
                      <div>
                        <span className="text-xs font-black uppercase text-white block">Banner Status</span>
                        <span className="text-[10px] font-bold text-white/40">Toggle to enable or disable global broadcast</span>
                      </div>
                      <div 
                        onClick={() => setBannerActive(!bannerActive)}
                        className={`w-14 h-8 rounded-full relative cursor-pointer border-2 transition-colors ${bannerActive ? 'bg-[#CCFF00] border-[#CCFF00]' : 'bg-black border-white/40'}`}
                      >
                         <div className={`absolute top-1 w-5 h-5 rounded-full border-2 transition-all ${bannerActive ? 'right-1 bg-black border-black' : 'left-1 bg-white/40 border-transparent'}`} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-4">
                     <button 
                       onClick={async () => {
                         try {
                           const res = await fetch('/api/admin/config', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ 
                               globalBanner: { 
                                 text: bannerText, 
                                 active: bannerActive,
                                 id: Date.now().toString() // New ID to force re-show for users
                               } 
                             })
                           });
                           if (res.ok) alert('Announcement published to all users!');
                           else alert('Failed to publish announcement.');
                         } catch (err) {
                           alert('Network error while publishing.');
                         }
                       }}
                       className="bg-[#0038FF] text-white font-black py-5 rounded-2xl border-4 border-[#0038FF] uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-[6px_6px_0_0_#CCFF00] hover:bg-white hover:text-black hover:border-white transition-all active:translate-y-1 active:shadow-none"
                     >
                        <Save className="w-5 h-5" /> Publish
                     </button>
                     <button 
                       onClick={async () => {
                         setBannerText('');
                         setBannerActive(false);
                         try {
                           await fetch('/api/admin/config', {
                             method: 'POST',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ 
                               globalBanner: { text: '', active: false } 
                             })
                           });
                           alert('Announcement cleared.');
                         } catch (err) {}
                       }}
                       className="bg-black text-white/40 font-black py-5 rounded-2xl border-4 border-white/10 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:translate-y-1"
                     >
                        <LogOut className="rotate-90 w-5 h-5" /> Clear / Delete
                     </button>
                   </div>
                </div>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
