
import React from 'react';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { mainnet, bsc } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// WalletConnect Project ID (Generic placeholder)
const projectId = '76249e0c50f4a4f89d53f5a9e38d3505';

export const config = createConfig({
  chains: [mainnet, bsc],
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      showQrModal: true, // This enables the default modal for the WalletConnect connector
      metadata: {
        name: 'TRON BLOCK',
        description: 'On-chain decentralized matrix platform on TRON, BNB Chain, and Ethereum.',
        url: typeof window !== 'undefined' ? window.location.origin : '',
        icons: ['https://raw.githubusercontent.com/TokenPocket/tokenpocket-brand/master/TokenPocket-logo-round.png']
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
  },
});

const queryClient = new QueryClient();

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
