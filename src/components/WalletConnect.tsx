
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { X, Wallet, LogOut, ChevronRight, Copy } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export enum Network {
  ETHEREUM = 'Ethereum',
  BNB = 'BNBChain'
}

type ConnectionView = 'network' | 'wallet' | 'redirecting' | 'processing';

export const ConnectModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { isConnected } = useAccount();
  const { connect, connectors, isPending, variables } = useConnect();
  
  const [view, setView] = React.useState<ConnectionView>('network');
  const [selectedNetwork, setSelectedNetwork] = React.useState<Network | null>(null);
  const [redirectingWallet, setRedirectingWallet] = React.useState<string | null>(null);

  // Filter and map connectors to nicer names/logos
  const walletOptions = [
    { 
      name: 'OKX Wallet', 
      id: 'injected', 
      icon: 'https://static.okx.com/cdn/assets/imgs/247/E0B0B0B0B0B0B0B0.png',
      deepLink: (url: string) => `okx://wallet/dapp/details?dappUrl=${encodeURIComponent(url)}`,
      networks: [Network.ETHEREUM, Network.BNB]
    },
    { 
      name: 'MetaMask', 
      id: 'io.metamask', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/2/21/MetaMask_Logo.png',
      deepLink: (url: string) => `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, '')}`,
      networks: [Network.ETHEREUM, Network.BNB]
    },
    { 
      name: 'TokenPocket', 
      id: 'injected', 
      icon: 'https://raw.githubusercontent.com/TokenPocket/tokenpocket-brand/master/TokenPocket-logo-round.png',
      deepLink: (url: string) => `tpdapp://open?params=${encodeURIComponent(JSON.stringify({ url }))}`,
      networks: [Network.ETHEREUM, Network.BNB]
    },
    { 
      name: 'imToken', 
      id: 'injected', 
      icon: 'https://token.im/img/imToken-logo.png',
      deepLink: (url: string) => `imtokenv2://navigate/DappView?url=${encodeURIComponent(url)}`,
      networks: [Network.ETHEREUM, Network.BNB]
    },
    { 
      name: 'Trust Wallet', 
      id: 'injected', 
      icon: 'https://trustwallet.com/assets/images/media/assets/trust_primary_logo.png',
      deepLink: (url: string) => `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(url)}`,
      networks: [Network.ETHEREUM, Network.BNB]
    },
    { 
      name: 'WalletConnect', 
      id: 'walletConnect', 
      icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
      networks: [Network.ETHEREUM, Network.BNB]
    },
  ];

  const handleConnect = React.useCallback(async (opt: typeof walletOptions[0]) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hostUrl = window.location.origin + window.location.pathname;

    // Specific wallet detection
    const isOKX = !!(window as any).okxwallet;
    const isMetaMask = !!(window as any).ethereum?.isMetaMask;
    const isTokenPocket = !!(window as any).ethereum?.isTokenPocket;
    const isTrust = !!(window as any).ethereum?.isTrust;
    const isImToken = !!(window as any).imToken;

    let isTargetWalletDetected = false;
    if (opt.name === 'OKX Wallet') isTargetWalletDetected = isOKX;
    else if (opt.name === 'MetaMask') isTargetWalletDetected = isMetaMask;
    else if (opt.name === 'TokenPocket') isTargetWalletDetected = isTokenPocket;
    else if (opt.name === 'imToken') isTargetWalletDetected = isImToken;
    else if (opt.name === 'Trust Wallet') isTargetWalletDetected = isTrust;

    // Redirection logic for mobile
    if (isMobile && opt.id !== 'walletConnect' && !isTargetWalletDetected && opt.deepLink) {
      setRedirectingWallet(opt.name);
      setView('redirecting');
      
      const redirectUrl = new URL(hostUrl);
      redirectUrl.searchParams.set('autoConnect', opt.name);
      
      setTimeout(() => {
        window.location.href = opt.deepLink!(redirectUrl.toString());
      }, 1500);
      return;
    }

    // EVM connection via wagmi
    const connector = connectors.find((c) => c.id === opt.id) || connectors.find((c) => c.id === 'injected') || connectors[0];
    if (connector) {
      try {
        connect({ connector });
      } catch (err) {
        console.error('Connection error:', err);
        if (isMobile && opt.deepLink) {
          window.location.href = opt.deepLink(hostUrl);
        }
      }
    }
  }, [connect, connectors, selectedNetwork, onClose]);

  // Handle auto-connect from redirected mobile browser
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoConnectWallet = params.get('autoConnect');
    if (autoConnectWallet && !isConnected && connectors.length > 0 && !isPending && isOpen) {
      const opt = walletOptions.find(o => o.name === autoConnectWallet);
      if (opt) {
        handleConnect(opt);
        // Clean up URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('autoConnect');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [connectors, isConnected, isPending, handleConnect, isOpen]);

  // Reset view when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setView('network');
      setSelectedNetwork(null);
      setRedirectingWallet(null);
    }
  }, [isOpen]);

  const filteredWallets = selectedNetwork 
    ? walletOptions.filter(w => w.networks.includes(selectedNetwork))
    : [];

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-[400px] bg-white border-[3px] md:border-4 border-black p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[10px_10px_0_0_#0038FF] md:shadow-[20px_20px_0_0_#0038FF] flex flex-col max-h-[85vh] overflow-hidden"
          >
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={onClose}
                className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors border-2 border-black/5"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {view === 'network' && (
                <motion.div key="network" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-3xl md:text-4xl font-black text-black uppercase italic tracking-tighter leading-none mb-1">{t.selectNetwork}</h3>
                    <p className="text-black/40 font-bold uppercase tracking-tight text-[10px]">{t.chooseBlockchain}</p>
                  </div>
                  <div className="space-y-4 flex-1">
                    {[Network.ETHEREUM, Network.BNB].map((net) => (
                      <button
                        key={net}
                        onClick={() => {
                          setSelectedNetwork(net);
                          setView('wallet');
                        }}
                        className="w-full flex items-center gap-6 p-6 border-[3px] border-black rounded-[1.5rem] bg-white hover:bg-[#CCFF00] transition-all group shadow-[10px_10px_0_0_black]"
                      >
                         <div className="w-12 h-12 rounded-full border-[3px] border-black flex items-center justify-center bg-black group-hover:bg-white transition-colors">
                            {net === Network.ETHEREUM ? (
                              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-6 h-6 invert group-hover:invert-0" alt="" />
                            ) : (
                              <img src="https://cryptologos.cc/logos/bnb-bnb-logo.png" className="w-6 h-6" alt="" />
                            )}
                         </div>
                         <div className="text-left">
                            <span className="block text-2xl font-black text-black uppercase italic tracking-tighter leading-none">{net}</span>
                            <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{net === Network.ETHEREUM ? t.mainnetProtocol : t.smartChainV2}</span>
                         </div>
                        <ChevronRight className="w-6 h-6 text-black/20 group-hover:text-black transition-all ml-auto" strokeWidth={4} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {view === 'wallet' && (
                <motion.div key="wallet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                  <button onClick={() => setView('network')} className="text-[10px] font-black text-[#0038FF] uppercase tracking-widest mb-4 flex items-center gap-1 hover:underline">
                    &larr; {t.backToNetworks}
                  </button>
                  <div className="mb-8">
                    <h3 className="text-3xl md:text-4xl font-black text-black uppercase italic tracking-tighter leading-none mb-1">{selectedNetwork} {t.wallets}</h3>
                    <p className="text-black/40 font-bold uppercase tracking-tight text-[10px]">{t.connectTerminal}</p>
                  </div>
                  <div className="space-y-4 overflow-y-auto pr-2 flex-1 max-h-[400px] custom-scrollbar">
                    {filteredWallets.map((opt, i) => {
                      const isConnectingThis = isPending && (variables as any)?.connector?.id === opt.id;
                      return (
                        <motion.button
                          key={i}
                          whileHover={{ x: isPending ? 0 : 10 }}
                          disabled={isPending}
                          onClick={() => handleConnect(opt)}
                          className={`w-full flex items-center justify-between p-4 border-2 border-black rounded-2xl transition-all group shadow-[4px_4px_0_0_black] ${isPending ? 'opacity-50 cursor-not-allowed' : 'bg-[#F1F3F5] hover:bg-[#CCFF00] hover:shadow-[6px_6px_0_0_black]'}`}
                        >
                          <div className="flex items-center gap-4 text-left">
                             <div className="w-10 h-10 bg-white rounded-xl border-2 border-black flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden">
                               <img 
                                 src={opt.icon} 
                                 alt={opt.name} 
                                 className={`w-full h-full object-contain ${isConnectingThis ? 'animate-pulse' : ''}`}
                                 referrerPolicy="no-referrer"
                                 onError={(e) => {
                                   (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${opt.name[0]}&background=CCFF00&color=000&bold=true`;
                                 }}
                               />
                             </div>
                             <span className="text-lg font-black text-black italic tracking-tight">{opt.name}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {view === 'redirecting' && (
                <motion.div key="redirect" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-10">
                  <div className="w-24 h-24 bg-[#CCFF00] rounded-3xl border-4 border-black flex items-center justify-center mb-8 animate-bounce relative shadow-[10px_10px_0_0_black]">
                    <Wallet className="w-12 h-12 text-black" strokeWidth={3} />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0038FF] rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-black uppercase italic tracking-tighter mb-4">{t.opening} {redirectingWallet}</h3>
                  <p className="text-black/60 font-bold text-sm max-w-[260px] leading-relaxed mb-8 uppercase tracking-tight">
                    {t.redirectingDesc}
                  </p>
                  <button onClick={() => setView('wallet')} className="text-[10px] font-black text-[#0038FF] uppercase tracking-[0.2em] hover:underline">
                    {t.waitStaying}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 p-4 bg-[#0038FF]/5 rounded-2xl border-2 border-dashed border-black/10 flex-shrink-0">
               <p className="text-[9px] font-bold text-center text-black/40 uppercase leading-relaxed tracking-wider italic">
                 {t.agreeTerms}
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};


export const WalletButton: React.FC<{ expanded?: boolean }> = ({ expanded }) => {
  const { t } = useLanguage();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const shortenedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  if (isConnected && address) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-3 bg-[#CCFF00] border-4 border-black px-6 py-2.5 rounded-full shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all cursor-pointer ${expanded ? 'w-full justify-center' : ''}`}
        >
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse border border-black/20"></div>
          <span className="font-black text-black text-[13px] uppercase tracking-tighter">
            {shortenedAddress}
          </span>
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-white border-4 border-black rounded-[2rem] shadow-[10px_10px_0_0_#0038FF] z-50 overflow-hidden"
              >
                <div className="p-6 border-b-2 border-black/5">
                   <p className="text-[9px] font-black uppercase text-black/30 tracking-widest mb-1">{t.network}</p>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#0038FF]"></div>
                      <span className="text-sm font-black text-black">{chain?.name || t.unknownNetwork}</span>
                   </div>
                </div>
                <div className="p-2">
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText(address);
                       setShowDropdown(false);
                     }}
                     className="w-full flex items-center justify-between p-4 hover:bg-black/5 rounded-xl transition-colors group"
                   >
                     <span className="text-[11px] font-black uppercase text-black group-hover:text-[#0038FF]">{t.copyAddress}</span>
                     <Copy className="w-4 h-4 text-black/20 group-hover:text-[#0038FF]" />
                   </button>
                   <button 
                     onClick={handleDisconnect}
                     className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-xl transition-colors group"
                   >
                     <span className="text-[11px] font-black uppercase text-red-500">{t.disconnect}</span>
                     <LogOut className="w-4 h-4 text-red-200 group-hover:text-red-500" />
                   </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={`px-8 py-2.5 rounded-full border-4 border-black bg-white text-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_black] md:shadow-[6px_6px_0_0_black] hover:bg-[#CCFF00] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-3 ${expanded ? 'w-full justify-center text-lg md:text-xl py-4 md:py-5 rounded-xl md:rounded-2xl bg-[#CCFF00]' : 'text-[11px]'}`}
      >
        <Wallet className={expanded ? 'w-5 h-5 md:w-6 md:h-6' : 'w-4 h-4'} />
        {t.connect}
      </button>
      <ConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
