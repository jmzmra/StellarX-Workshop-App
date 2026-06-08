# GigRail PH

## Idea
- **Track:** Remittance / Financial Inclusion
- **Idea #:** Custom
- **One-liner:** Instant USDC payouts for Filipino freelancers with near-zero fees.

## Problem
Filipino freelancers on global platforms (Upwork, Fiverr, etc.) often wait 3–7 days to receive their earnings and lose 3–5% in intermediary fees and poor exchange rates. This delay and cost hinder their financial stability.

## How it uses Stellar
- **Asset (USDC):** Core payment unit to avoid volatility and high cross-border costs.
- **Trustlines:** Required for freelancers to receive USDC securely.
- **Classic Payments:** Used for sub-cent fees and 5-second settlement.
- **Horizon API:** Used to fetch real-time USDC balances.

## What works in the demo
- [x] Connect Freighter wallet (Testnet)
- [x] Fund account via Friendbot
- [x] Add USDC trustline
- [x] Freelancer: Create payment requests (Invoices)
- [x] Client: Approve and pay invoices instantly in USDC
- [x] Real-time balance updates and transaction confirmation

## Setup / run
- Network: **testnet**
- `cd web && npm install && npm run dev`
- Ensure Freighter is set to Testnet.
- USDC Issuer (Testnet): `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`


## Demo
- 2–4 min video link (show the core flow working on testnet):
- Public repo link:

## Submission checklist
- [ ] Public GitHub repo with a license (this scaffold ships MIT — update `LICENSE`)
- [ ] README explains problem, Stellar usage, and setup
- [ ] Demo video (2–4 min)
- [ ] Submitted via the workshop's official GitHub issue template
