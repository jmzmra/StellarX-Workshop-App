# Stellar GigRail

Cross-border gig payment rail that enables instant USDC payouts to Filipino freelancers using the Stellar network.

---

## Problem

Filipino freelancers working on global platforms (Upwork, Fiverr, remote clients, etc.) face slow and expensive payment systems:

- Payments take 3–7 days to arrive via traditional banking rails  
- Freelancers lose 3–5% in fees and FX conversion costs  
- Cashflow delays make it harder to access earned income when needed  

This is especially important in the Philippines where freelancers depend on fast, reliable access to international earnings.

---

## How It Works

1. A gig platform triggers a payout for a freelancer (USD amount)  
2. The system converts the payout into a USDC transfer instruction  
3. A Stellar transaction is created using the SDK and RPC layer  
4. The transaction is signed and submitted to the Stellar network  
5. USDC is transferred directly to the freelancer’s Stellar wallet  
6. Funds arrive in ~5 seconds and are immediately usable  

---

## How It Uses Stellar

This project uses Stellar as the settlement and payment layer:

- USDC asset transfers on the Stellar network  
- @stellar/stellar-sdk v14 for transaction construction  
- `rpc.Server` for interacting with the Stellar RPC endpoint  
- `rpc.assembleTransaction()` for building transactions  
- Classic Stellar payment operations (no custodial wallets)  
- Testnet deployment with mainnet-ready design  

Why Stellar:
- ⚡ Fast settlement (~5 seconds finality)  
- 💸 Sub-cent transaction fees  
- 🌍 Native support for USDC stablecoin transfers  
- 🔐 Non-custodial, account-based financial system  

---

## Track

Track 1: Remittance & Cross-Border Payments

---

## Tech Stack

- Framework: Node.js / TypeScript  
- Stellar SDK: @stellar/stellar-sdk v14  
- Network: Stellar Testnet  
- RPC: Soroban RPC (`rpc.Server`)  
- Testing: Vitest  

---

## Setup & Run

```bash
git clone https://github.com/jmzmra/StellarX-Workshop-App.git
cd web
npm install

# environment variables needed:
# NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org

npm run dev
