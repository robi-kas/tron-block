# TRON BLOCK Matrix System Documentation

## Overview
TRON BLOCK is a decentralized matrix network protocol built with a focus on sustainability, transparency, and global reach. It utilizes USDT (BSC/ETH/TRON) as the primary currency for activations, upgrades, and rewards.

## Core Features
1. **Dynamic Matrix Structure**: Level-based progression (V1 to V10).
2. **Real USDT Integration**: Multi-chain support (simulated integration points provided).
3. **Automated Buyback**: System reinvestment to ensure long-term ecosystem health.
4. **Differential Bonus**: Rewards calculated based on team performance and rank gaps.
5. **Admin Dashboard**: Full control over system rules, user management, and transaction monitoring.

## System Management (Admin Panel)
- **Access**: Navigate to `/admin`.
- **Default Credentials**: `admin` / `admin123` (Change immediately in `server.ts` or database).
- **Functionality**:
    - **Dashboard**: High-level protocol stats.
    - **User Directory**: View all node addresses, levels, and balances.
    - **Order History**: Real-time monitoring of deposits and activations.
    - **System Rules**: Direct control over activation fees, rank requirements, and reward ratios.

## Transaction Flow
1. **Wallet Connection**: Users connect via `wagmi` (MetaMask, WalletConnect, etc.).
2. **Registration**: Requires 80 USDT activation fee (configurable).
3. **Deposits**: Funds internal balance for seamless matrix participation.
4. **Upgrades**: Users climb ranks (V1 -> V10) by meeting direct referral and team volume requirements.

## Technical Setup
- **Frontend**: React + Vite + Tailwind CSS + motion for animations.
- **Backend**: Express + better-sqlite3 (Local persistent database).
- **Web3**: ethers.js + viem for blockchain interactions.

## Deployment Instructions
1. `npm install`
2. `npm run dev` (Starts Express server on port 3000).
3. Ensure `.env` is configured (see `.env.example`).
