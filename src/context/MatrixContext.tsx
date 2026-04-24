
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

// Standard ERC20 ABI for USDT
const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'recipient', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const;

const USDT_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum Mainnet
  56: '0x55d398326f99059fF775485246999027B3197955', // BSC Mainnet
};

const DEFAULT_RECEIVER = '0xYourMainReceiverAddressHere';

interface Activity {
  id: string;
  type: 'Upgrade' | 'Payout' | 'New Seat' | 'Reward' | 'Registration';
  desc: string;
  time: string;
  timestamp: number;
  color: string;
}

interface Seat {
  id: string;
  level: string;
  time: string;
  origin: string;
  participation: string;
  rewards: string;
  active: boolean;
  hash: string;
}

interface MatrixContextType {
  isRegistered: boolean;
  userId: string | null;
  uplineId: string | null;
  balance: number;
  totalRewards: number;
  currentLevel: number;
  seats: Seat[];
  activities: Activity[];
  referralCode: string;
  accountMode: 'production' | 'test' | 'demo';
  systemConfig: any | null;
  setAccountMode: (mode: 'production' | 'test' | 'demo') => void;
  register: (upline: string) => void;
  upgradeLevel: () => void;
  withdraw: (amount: number) => Promise<boolean>;
  checkAccountSecurity: () => Promise<void>;
  addActivity: (type: Activity['type'], desc: string, color: string) => void;
  refreshData: () => Promise<void>;
  executeUSDTTransfer: (amount: number) => Promise<string>;
  loading: boolean;
  stats: {
    directMembers: number;
    validSeats: number;
    teamVolume: number;
    totalUsers: number;
    totalTurnover: number;
    newUsers24h: number;
    turnover24h: number;
  };
}

const MatrixContext = createContext<MatrixContextType | undefined>(undefined);

export const MatrixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, chainId, chain } = useAccount();
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [uplineId, setUplineId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0); 
  const [totalRewards, setTotalRewards] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [accountMode, setAccountMode] = useState<'production' | 'test' | 'demo'>('production');
  const [systemConfig, setSystemConfig] = useState<any | null>(null);

  const { writeContractAsync } = useWriteContract();

  const usdtAddress = chainId ? USDT_ADDRESSES[chainId] : undefined;

  // Real USDT Transfer logic
  const executeUSDTTransfer = async (amount: number) => {
    if (!address || !usdtAddress || !writeContractAsync) {
      throw new Error('Wallet not connected or unsupported chain');
    }

    try {
      // Typically USDT has 6 decimals on Ethereum, 18 on BSC. 
      const decimals = chainId === 1 ? 6 : 18;
      const amountBigInt = parseUnits(amount.toString(), decimals);

      const receiver = systemConfig?.receiverAddress || DEFAULT_RECEIVER;
      const hash = await writeContractAsync({
        address: usdtAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [receiver as `0x${string}`, amountBigInt],
        account: address,
        chain: chain,
      });

      return hash;
    } catch (err) {
      console.error('USDT Transfer Failed:', err);
      throw err;
    }
  };
  
  // Fetch system config on mount
  useEffect(() => {
    const fetchConfig = async (retries = 3) => {
      try {
        console.log('Fetching matrix config...');
        const response = await fetch('/api/matrix/config');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Matrix config fetched successfully:', data);
        setSystemConfig(data);
      } catch (error) {
        console.error('Failed to fetch matrix config:', error);
        if (typeof retries === 'number' && retries > 0) {
          console.log(`Retrying config fetch... (${4 - retries})`);
          setTimeout(() => fetchConfig(retries - 1), 2000);
        }
      }
    };
    fetchConfig();
  }, []);

  // Detect referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !isRegistered) {
      setUplineId(ref);
    }
  }, [isRegistered]);

  const [stats, setStats] = useState({
    directMembers: 0,
    validSeats: 0,
    teamVolume: 0,
    totalUsers: 142058,
    totalTurnover: 89412500,
    newUsers24h: 342,
    turnover24h: 124500
  });

  // Load state from Backend (MySQL)
  useEffect(() => {
    if (isConnected && address) {
      refreshStats();
      fetchAccountInfo();
    } else {
      setIsRegistered(false);
      setUserId(null);
      setSeats([]);
    }
  }, [isConnected, address]);

  const fetchAccountInfo = async () => {
    if (!address) return;
    try {
      const response = await fetch(`/api/matrix/account/${address}`);
      if (response.ok) {
        const data = await response.json();
        setIsRegistered(true);
        setUserId(data.user.id.toString());
        setUplineId(data.user.referral_id?.toString() || null);
        setBalance(parseFloat(data.user.balance));
        setTotalRewards(parseFloat(data.user.total_rewards));
        setCurrentLevel(data.user.level);
        setAccountMode(data.user.mode);
        
        // Map DB seats to frontend Seat objects
        const mappedSeats: Seat[] = data.seats.map((s: any) => ({
          id: s.id.toString(),
          level: s.level_name,
          time: new Date(s.created_at).toLocaleDateString(),
          origin: s.origin,
          participation: s.status === 'active' ? 'Active' : 'Locked',
          rewards: '0.00', // rewards would be calculated or fetched from earnings
          active: s.status === 'active',
          hash: s.tx_hash
        }));
        setSeats(mappedSeats);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Failed to fetch account info', error);
    }
  };

  const register = async (upline: string) => {
    if (!address) return;
    
    setLoading(true);
    try {
      const activationFee = systemConfig?.activationFee || 80;
      
      const txHash = await executeUSDTTransfer(activationFee);

      const response = await fetch('/api/matrix/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          uplineId: upline || '100001',
          mode: accountMode,
          txHash
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchAccountInfo();
        addActivity('Registration', `Account ID #${result.userId} Registered`, 'bg-[#CCFF00]');
      }
    } catch (error) {
      console.error('Registration failed', error);
      alert('Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);

  const upgradeLevel = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel > 10) return;
    
    // Use config if available, fallback to old values
    let cost = 0;
    if (systemConfig?.levels) {
      const levelData = systemConfig.levels.find((l: any) => l.rank === nextLevel);
      cost = levelData ? levelData.upgradeCost : 0;
    } else {
      const costs = [0, 80, 160, 400, 800, 1600, 4000, 12000, 40000, 160000, 1440000];
      cost = costs[nextLevel];
    }
    
    if (balance < cost) {
      alert('Insufficient USDT balance');
      return;
    }
    
    const levelName = systemConfig?.levels?.find((l: any) => l.rank === nextLevel)?.name || `V${nextLevel}`;
    
    // In a real app, this would be a POST to /api/matrix/upgrade
    fetch('/api/matrix/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, level: nextLevel })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        fetchAccountInfo();
        addActivity('Upgrade', `Ranked UP to ${levelName}`, 'bg-green-500');
      }
    }).catch(err => {
      console.error('Upgrade failed', err);
    });
  };

  const checkAccountSecurity = async () => {
    if (!address) return;
    try {
      const response = await fetch('/api/matrix/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, platform: 'web' })
      });
      const result = await response.json();
      console.log('Security Check:', result);
      if (result.riskScore > 80) {
        addActivity('Registration', 'High Risk Activity Detected', 'bg-red-500');
      }
    } catch (error) {
      console.error('Security check failed', error);
    }
  };

  const withdraw = async (amount: number): Promise<boolean> => {
    if (!address || amount <= 0 || totalRewards < amount) return false;
    
    try {
      const response = await fetch('/api/matrix/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount })
      });
      const result = await response.json();
      
      if (result.success) {
        setTotalRewards(prev => prev - amount);
        setBalance(prev => prev + amount);
        addActivity('Payout', `${amount} USDT Withdrawn to Wallet`, 'bg-[#CCFF00]');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Withdrawal failed', error);
      return false;
    }
  };

  const addActivity = (type: Activity['type'], desc: string, color: string) => {
    const newAct: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      desc,
      time: 'Just now',
      timestamp: Date.now(),
      color
    };
    setActivities(prev => [newAct, ...prev].slice(0, 20));
  };

  const refreshStats = React.useCallback(async (retries = 3) => {
    try {
      const response = await fetch('/api/matrix/stats');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStats(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      if (typeof retries === 'number' && retries > 0) {
        console.log(`Retrying stats fetch... (${4 - retries})`);
        setTimeout(() => refreshStats(retries - 1), 3000);
      }
    }
  }, []);

  const referralCode = userId || '';

  return (
    <MatrixContext.Provider value={{
      isRegistered,
      userId,
      uplineId,
      balance,
      totalRewards,
      currentLevel,
      seats,
      activities,
      referralCode,
      accountMode,
      systemConfig,
      setAccountMode,
      register,
      upgradeLevel,
      withdraw,
      checkAccountSecurity,
      addActivity,
      refreshStats,
      refreshData: fetchAccountInfo,
      executeUSDTTransfer,
      loading,
      stats
    }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => {
  const context = useContext(MatrixContext);
  if (context === undefined) {
    throw new Error('useMatrix must be used within a MatrixProvider');
  }
  return context;
};
