
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../components/LanguageContext';
import { QRCodeCanvas } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import { 
  Share2, 
  Copy, 
  Check, 
  ChevronRight,
  Lock, 
  Unlock, 
  QrCode, 
  Image as ImageIcon, 
  Send, 
  Twitter, 
  MessageCircle,
  HelpCircle,
  Users,
  Zap,
  TrendingUp,
  ArrowUpRight,
  X,
  Download,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';

import { useMatrix } from '../context/MatrixContext';

const PosterModal = ({ isOpen, onClose, referralLink, userId, t }: { isOpen: boolean, onClose: () => void, referralLink: string, userId: string | null, t: any }) => {
  const posterRef = React.useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);
  const [sharing, setSharing] = React.useState<string | null>(null);
  const [theme, setTheme] = React.useState<'cyber' | 'brutalist' | 'neon'>('cyber');

  const generateImageFile = async (): Promise<File | null> => {
    if (!posterRef.current) return null;
    try {
      // Use toCanvas as it's often more robust than toPng directly in complex cases
      const canvas = await htmlToImage.toCanvas(posterRef.current, {
        pixelRatio: 2,
        backgroundColor: theme === 'cyber' ? '#000000' : (theme === 'brutalist' ? '#CCFF00' : '#0038FF'),
      });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) return null;
      return new File([blob], `tron-block-${userId || '100001'}.png`, { type: 'image/png' });
    } catch (err) {
      console.error('Generation failed', err);
      return null;
    }
  };

  const handleAction = async (action: 'download' | 'share_native' | 'twitter' | 'telegram' | 'whatsapp') => {
    if (!posterRef.current) return;
    
    if (action === 'download') {
      setDownloading(true);
      try {
        const canvas = await htmlToImage.toCanvas(posterRef.current, {
          pixelRatio: 3,
          backgroundColor: theme === 'cyber' ? '#000000' : (theme === 'brutalist' ? '#CCFF00' : '#0038FF'),
        });
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `tron-block-invite-${userId || 'anon'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error(err);
      } finally {
        setDownloading(false);
      }
      return;
    }

    setSharing(action);
    try {
      const file = await generateImageFile();
      const shareData: any = {
        title: 'TRON BLOCK',
        text: t.shareCaption || 'Join the most powerful matrix system on TRON.',
      };

      if (action === 'share_native' && navigator.share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ ...shareData, files: [file] });
          return;
        } catch (e) {
          console.warn('Native sharing failed', e);
        }
      }

      // Fallback for specific platforms
      const url = referralLink;
      const text = shareData.text;
      if (action === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      } else if (action === 'telegram') {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
      } else if (action === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
      } else if (action === 'share_native') {
        // Ultimate fallback
        if (navigator.share) {
          await navigator.share({ ...shareData, url });
        } else {
          navigator.clipboard.writeText(`${text} ${url}`);
          alert('Link copied to clipboard!');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white border-4 border-black rounded-3xl md:rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-[30px_30px_100px_rgba(204,255,0,0.2)] flex flex-col lg:flex-row relative max-h-[95vh]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors lg:hidden">
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Preview Panel */}
        <div className="flex-1 p-2 md:p-6 lg:p-12 flex flex-col items-center justify-center bg-[#F1F3F5] border-b-4 lg:border-b-0 lg:border-r-4 border-black border-dashed overflow-y-auto min-h-0">
          <div ref={posterRef} className={`w-full max-w-[320px] md:w-[360px] aspect-[9/16] relative overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col justify-between shrink-0
            ${theme === 'cyber' ? 'bg-black text-white' : ''}
            ${theme === 'brutalist' ? 'bg-[#CCFF00] text-black' : ''}
            ${theme === 'neon' ? 'bg-[#0038FF] text-white' : ''}
          `}>
             {/* Dynamic Theme Elements - REMOVED backdrop-blur to fix capture */}
             {theme === 'cyber' && (
               <>
                 <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#0038FF]/40 rounded-full"></div>
                 <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#CCFF00]/30 rounded-full"></div>
                 <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:200px_200px]"></div>
                 <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
               </>
             )}
             {theme === 'brutalist' && (
               <>
                 <div className="absolute top-10 right-10 text-black/10 pointer-events-none"><Terminal className="w-64 h-64 rotate-12" /></div>
                 <div className="absolute inset-0 border-[10px] border-black/10 pointer-events-none"></div>
                 <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
               </>
             )}
             {theme === 'neon' && (
               <>
                 <div className="absolute top-[-5%] left-[-5%] w-48 h-48 bg-[#CCFF00]/60 rounded-full"></div>
                 <div className="absolute inset-x-0 top-[20%] h-[1px] bg-white/20"></div>
                 <div className="absolute inset-x-0 top-[40%] h-[1px] bg-white/20"></div>
                 <div className="absolute inset-x-0 top-[60%] h-[1px] bg-white/20"></div>
               </>
             )}

             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 md:mb-8">
                   <div className={`${theme === 'brutalist' ? 'bg-black text-white' : 'bg-white text-black'} font-black text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-sm`}>TRON</div>
                   <div className={`${theme === 'brutalist' ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00] text-black'} font-black text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-sm`}>BLOCK</div>
                </div>
                
                <h2 className={`text-4xl md:text-5xl font-black italic tracking-tighter leading-[0.85] uppercase mb-4
                  ${theme === 'brutalist' ? 'text-black' : 'text-white'}
                `}>
                  Join The <br/> <span className={theme === 'brutalist' ? 'text-[#0038FF]' : 'text-[#CCFF00]'}>Matrix.</span>
                </h2>
                <div className={`h-1 w-16 md:w-20 mb-6 md:mb-8 ${theme === 'cyber' ? 'bg-[#0038FF]' : (theme === 'brutalist' ? 'bg-black' : 'bg-[#CCFF00]')}`}></div>
                <p className={`font-bold italic uppercase text-[10px] md:text-xs tracking-tight max-w-[180px] md:max-w-[200px] opacity-80
                   ${theme === 'brutalist' ? 'text-black' : 'text-white'}
                `}>
                  World's most powerful on-chain matrix system. Build your team safely with smart contract verification.
                </p>
             </div>

             <div className="relative z-10 flex flex-col items-center">
                {/* Fixed border issue for capture */}
                <div className={`p-4 rounded-3xl border-[4px] mb-3 md:mb-4 bg-white
                  ${theme === 'cyber' ? 'border-[#0038FF] shadow-[0_0_40px_rgba(0,56,255,0.4)]' : ''}
                  ${theme === 'brutalist' ? 'border-black shadow-[8px_8px_0_0_#000]' : ''}
                  ${theme === 'neon' ? 'border-[#CCFF00] shadow-[0_0_40px_rgba(204,255,0,0.4)]' : ''}
                `}>
                  <QRCodeCanvas 
                    value={referralLink} 
                    size={160} 
                    level="H" 
                    includeMargin={false}
                    fgColor="#000000"
                  />
                </div>
                <div className={`px-4 py-2 rounded-full border-2 border-black font-black uppercase text-[10px] md:text-xs tracking-widest shadow-[4px_4px_0_0_#000]
                  ${theme === 'brutalist' ? 'bg-black text-[#CCFF00]' : 'bg-[#CCFF00] text-black'}
                `}>
                  ID: {userId || '100001'}
                </div>
             </div>

             <div className="relative z-10 pt-6 md:pt-8 border-t border-white/20">
                <div className="flex justify-between items-end">
                   <div>
                     <p className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest mb-1 opacity-60
                       ${theme === 'brutalist' ? 'text-black' : 'text-white'}
                     `}>NETWORK PROTOCOL</p>
                     <p className={`text-xs md:text-sm font-black italic
                       ${theme === 'brutalist' ? 'text-black' : 'text-white'}
                     `}>TRON NETWORK</p>
                   </div>
                   <div className="text-right">
                     <p className={`text-lg md:text-xl font-black italic
                       ${theme === 'brutalist' ? 'text-black' : 'text-white'}
                     `}>80 USDT</p>
                     <p className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest opacity-60
                       ${theme === 'brutalist' ? 'text-black' : 'text-white'}
                     `}>ACTIVATION FEE</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-[400px] p-6 lg:p-12 flex flex-col justify-between overflow-y-auto bg-white">
           <div>
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl md:text-3xl font-black text-black italic tracking-tighter uppercase">{t.posterGenerator}</h3>
                 <button onClick={onClose} className="hidden lg:flex w-10 h-10 rounded-full border-2 border-black items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-8">
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-4 block">Select Style</label>
                    <div className="grid grid-cols-3 gap-3">
                       {[
                         { id: 'cyber' as const, label: 'Cyber', color: 'bg-black' },
                         { id: 'brutalist' as const, label: 'Brutal', color: 'bg-[#CCFF00]' },
                         { id: 'neon' as const, label: 'Neon', color: 'bg-[#0038FF]' }
                       ].map(th => (
                         <button 
                           key={th.id}
                           onClick={() => setTheme(th.id)}
                           className={`p-3 rounded-2xl border-4 transition-all flex flex-col items-center gap-2 group
                             ${theme === th.id ? 'border-[#0038FF] bg-[#0038FF]/5' : 'border-black/5 hover:border-black'}
                           `}
                         >
                            <div className={`w-10 h-10 rounded-xl border-2 border-black shadow-[3px_3px_0_black] ${th.color}`}></div>
                            <span className="text-[10px] font-black uppercase">{th.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="p-6 bg-[#F1F3F5] rounded-3xl border-2 border-black/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Terminal className="w-4 h-4 text-[#0038FF]" />
                       <span className="text-[10px] font-bold text-black uppercase tracking-widest">Metadata</span>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[11px] font-bold text-black/50">User ID: <span className="text-black font-black">{userId || 'NONE'}</span></p>
                       <p className="text-[11px] font-bold text-black/50">Link: <span className="text-black font-black truncate block">{referralLink}</span></p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-12 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleAction('download')}
                  disabled={downloading || !!sharing}
                  className="w-full bg-[#CCFF00] text-black font-black py-5 rounded-2xl border-4 border-black uppercase tracking-widest text-sm shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles className="w-5 h-5" /></motion.div>
                      Generating HD...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Download Image
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                   {[
                     { 
                       id: 'twitter',
                       icon: Twitter, 
                       color: 'text-[#1DA1F2]', 
                     },
                     { 
                       id: 'telegram',
                       icon: Send, 
                       color: 'text-[#229ED9]', 
                     },
                     { 
                       id: 'whatsapp',
                       icon: MessageCircle, 
                       color: 'text-green-500', 
                     },
                     {
                       id: 'share_native',
                       icon: Share2,
                       color: 'text-black',
                     }
                   ].map((social) => (
                     <button 
                       key={social.id}
                       onClick={() => handleAction(social.id as any)}
                       disabled={!!sharing || downloading}
                       className="flex-1 bg-white border-4 border-black rounded-2xl py-4 flex items-center justify-center hover:bg-[#F1F3F5] transition-all active:scale-95 shadow-[4px_4px_0_0_#000] disabled:opacity-50 relative"
                     >
                       {sharing === social.id ? (
                         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles className="w-5 h-5" /></motion.div>
                       ) : (
                         <social.icon className={`w-5 h-5 md:w-6 md:h-6 ${social.color}`} fill={social.id === 'share_native' ? 'none' : 'currentColor'} />
                       )}
                     </button>
                   ))}
                </div>
              </div>
              <p className="text-center text-[10px] font-bold text-black/30 uppercase tracking-widest">Share directly with caption or save PNG</p>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Invite = () => {
  const { t } = useLanguage();
  const { isRegistered, userId, uplineId, stats, activities, totalRewards } = useMatrix();
  const [copied, setCopied] = React.useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = React.useState(false);
  
  const baseUrl = window.location.origin;
  const referralLink = isRegistered ? `${baseUrl}/?ref=${userId}` : `${baseUrl}/`;

  const referralStats = [
    { label: 'Total Invited', value: stats.directMembers.toString(), color: 'text-[#CCFF00]', icon: Users },
    { label: 'Successful Activations', value: stats.validSeats.toString(), color: 'text-green-500', icon: Zap },
    { label: 'Total Earned', value: `${totalRewards.toLocaleString()} USDT`, color: 'text-[#0038FF]', icon: TrendingUp }
  ];

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareCaption)}&url=${encodeURIComponent(referralLink)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(t.shareCaption)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(t.shareCaption + " " + referralLink)}`
  };

  const handleShare = (platform: 'twitter' | 'telegram' | 'whatsapp') => {
    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full pb-32">
      <AnimatePresence>
        <PosterModal 
          isOpen={isPosterModalOpen} 
          onClose={() => setIsPosterModalOpen(false)} 
          referralLink={referralLink}
          userId={userId}
          t={t}
        />
      </AnimatePresence>

      {/* Hero Section */}
      <section className="px-6 md:px-10 pt-32 pb-16 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-[#CCFF00] px-4 py-1.5 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] mb-8"
          >
            <Share2 className="w-5 h-5 text-black" />
            <span className="text-xs font-black uppercase text-black tracking-[0.2em]">{t.affiliateNetwork}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[clamp(3.5rem,10vw,120px)] font-black text-white leading-[0.8] uppercase tracking-tighter mb-8"
            style={{ textShadow: 'clamp(4px, 0.8vw, 10px) clamp(4px, 0.8vw, 10px) 0 #0038FF' }}
          >
            {t.inviteEarn}
          </motion.h1>

          <div className="w-full max-w-2xl mt-10">
             <p className="text-[#CCFF00] font-black uppercase tracking-[0.2em] text-[10px] mb-4">{t.referralLink}</p>
             <div className="bg-white border-4 border-black p-2 rounded-2xl md:rounded-[2rem] shadow-[10px_10px_0_0_#0038FF] flex items-center gap-2 group">
                <div className="flex-1 px-6 overflow-hidden">
                   <p className="text-black font-black text-xs md:text-xl truncate tracking-tight">{referralLink}</p>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="bg-[#0038FF] text-white px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#CCFF00] hover:text-black transition-all active:scale-95 shadow-[4px_4px_0_0_black]"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> <span>{t.copied}</span>
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                        <Copy className="w-4 h-4" /> <span>{t.copyLink}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
             </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 mb-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {referralStats.map((stat, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 + i * 0.1 }}
                 className="bg-white border-4 border-black p-8 rounded-[2.5rem] flex flex-col items-center text-center group shadow-[8px_8px_0_0_black] hover:translate-y-[-4px] transition-all"
               >
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-[#CCFF00] transition-colors border-2 border-black">
                     <stat.icon className={`w-6 h-6 text-black`} />
                  </div>
                  <p className="text-[11px] font-black uppercase text-black/40 tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black italic tracking-tighter text-black`}>{stat.value}</p>
               </motion.div>
             ))}
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Stats & Referrer */}
        <div className="space-y-12">
           {/* Bound Referrer */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white border-4 border-black p-8 rounded-[3rem] shadow-[10px_10px_0_0_#000] relative overflow-hidden"
            >
               <div className="flex items-start justify-between mb-8">
                  <div>
                     <p className="text-black/40 font-black uppercase text-[10px] tracking-widest mb-1">{t.boundReferrer}</p>
                     <h3 className="text-3xl font-black text-black italic tracking-tighter">{uplineId || 'NONE'}</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-black text-[#CCFF00] px-4 py-1.5 rounded-xl border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,0.1)]">
                     <Lock className="w-3 h-3" /> {t.referralLocked}
                  </div>
               </div>
              <div className="p-4 bg-[#F1F3F5] rounded-2xl border-2 border-black/5 flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#0038FF]" />
                 </div>
                 <p className="text-[10px] font-bold text-black/50 uppercase leading-tight italic">
                    {t.referralSecured}
                 </p>
              </div>
           </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="bg-[#0038FF] border-4 border-black p-8 rounded-[3rem] shadow-[8px_8px_0_0_#000] text-white"
               >
                  <Users className="w-8 h-8 text-[#CCFF00] mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{t.peopleInvited}</p>
                  <p className="text-4xl font-black italic tracking-tighter leading-none">{stats.directMembers}</p>
               </motion.div>
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="bg-white border-4 border-black p-8 rounded-[3rem] shadow-[8px_8px_0_0_#000]"
               >
                  <Zap className="w-8 h-8 text-[#0038FF] mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">{t.successfulActivations}</p>
                  <p className="text-4xl font-black italic tracking-tighter leading-none text-black">{stats.validSeats}</p>
               </motion.div>
            </div>

           {/* Buyback Rules Card */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-black border-4 border-[#CCFF00] p-8 md:p-10 rounded-[3rem] shadow-[12px_12px_0_0_#CCFF00] relative group"
           >
              <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">
                 <HelpCircle className="w-24 h-24 rotate-12" />
              </div>
              <h4 className="text-2xl font-black text-[#CCFF00] uppercase italic mb-6 leading-none flex items-center gap-3">
                 <QrCode className="w-6 h-6" /> {t.buybackRules}
              </h4>
              <p className="text-white/70 font-bold uppercase tracking-tight text-xs leading-relaxed italic relative z-10">
                 {t.buybackExplainer}
              </p>
           </motion.div>
        </div>

        {/* Right Column: Share Tools */}
        <div className="space-y-12">
           <div className="bg-white border-4 border-black rounded-[4rem] p-10 md:p-12 shadow-[15px_15px_0_0_#000] relative overflow-hidden flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black text-black uppercase italic tracking-tighter leading-none">{t.shareTools}</h3>
                 <div className="w-10 h-10 bg-[#CCFF00] rounded-xl border-2 border-black flex items-center justify-center shadow-[3px_3px_0_0_#000]">
                    <Share2 className="w-5 h-5 text-black" />
                 </div>
              </div>

               {/* Poster Mockup Preview */}
              <div 
                onClick={() => setIsPosterModalOpen(true)}
                className="w-full max-w-[280px] aspect-[9/16] bg-black rounded-[2rem] border-4 border-black shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden p-6 flex flex-col justify-between group cursor-zoom-in"
              >
                 <div className="absolute inset-0 bg-[#0038FF]/20 mix-blend-overlay group-hover:bg-[#0038FF]/40 transition-colors"></div>
                 
                 {/* Poster Content Mock */}
                 <div className="relative z-10">
                    <div className="flex items-center gap-1 mb-4">
                       <div className="bg-white text-black font-black text-[8px] px-2 py-0.5 rounded-sm">TRON</div>
                       <div className="bg-[#CCFF00] text-black font-black text-[8px] px-2 py-0.5 rounded-sm">BLOCK</div>
                    </div>
                    <h5 className="text-2xl font-black text-white italic leading-tight uppercase select-none">{t.joinTheMatrix}</h5>
                 </div>

                 <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-2xl border-4 border-[#CCFF00] shadow-xl">
                       <QRCodeCanvas value={referralLink} size={100} />
                    </div>
                    <p className="text-[#CCFF00] font-black uppercase text-[10px] tracking-[0.2em]">{t.joinWith80}</p>
                 </div>

                 {/* Visual noise/grain */}
                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:200px_200px]"></div>
              </div>

              <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button 
                   onClick={() => setIsPosterModalOpen(true)}
                   className="bg-[#0038FF] text-white font-black py-5 rounded-2xl border-4 border-black uppercase tracking-widest text-xs shadow-[6px_6px_0_0_#000] hover:bg-[#CCFF00] hover:text-black transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
                 >
                    <ImageIcon className="w-5 h-5" />
                    {t.posterGenerator}
                 </button>
                 <div className="flex gap-4">
                   <button 
                     onClick={() => handleShare('twitter')}
                     className="flex-1 bg-white border-4 border-black rounded-2xl flex items-center justify-center hover:bg-[#F1F3F5] transition-all active:scale-95 shadow-[4px_4px_0_0_#000]"
                   >
                      <Twitter className="w-6 h-6 text-[#1DA1F2]" fill="currentColor" />
                   </button>
                   <button 
                     onClick={() => handleShare('telegram')}
                     className="flex-1 bg-white border-4 border-black rounded-2xl flex items-center justify-center hover:bg-[#F1F3F5] transition-all active:scale-95 shadow-[4px_4px_0_0_#000]"
                   >
                      <Send className="w-6 h-6 text-[#229ED9]" fill="currentColor" />
                   </button>
                   <button 
                     onClick={() => handleShare('whatsapp')}
                     className="flex-1 bg-white border-4 border-black rounded-2xl flex items-center justify-center hover:bg-[#F1F3F5] transition-all active:scale-95 shadow-[4px_4px_0_0_#000]"
                   >
                      <MessageCircle className="w-6 h-6 text-green-500" fill="currentColor" />
                   </button>
                 </div>
              </div>
           </div>

           <div className="bg-[#CCFF00] border-4 border-black rounded-[3rem] p-8 md:p-10 shadow-[10px_10px_0_0_#0038FF] flex items-center justify-between group cursor-pointer hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_15px_rgba(0,0,0,0.05)] group-hover:rotate-12 transition-transform">
                    <ArrowUpRight className="w-8 h-8 text-[#CCFF00]" strokeWidth={3} />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-black uppercase italic leading-none">{t.tutorialCenter}</h4>
                    <p className="text-black/50 font-bold uppercase tracking-tight text-[10px] mt-1">{t.tutorialDesc}</p>
                 </div>
              </div>
              <ChevronRight className="w-8 h-8 text-black/20 group-hover:text-black transition-colors" />
           </div>
        </div>

      </div>
    </div>
  );
};

export default Invite;
