'use client';
import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import GigPaymentRail from '@/components/GigPaymentRail';
import SendPayment from '@/components/SendPayment';
import { swapXlmToUsdc } from '@/lib/swap';
import { signAndSubmit } from '@/lib/sign';
import { useNotification } from '@/components/Notification';
import SavingsGoal from '@/components/SavingsGoal';

type View = 'home' | 'payments' | 'wallet';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [view, setView] = useState<View>('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapAmount, setSwapAmount] = useState('500');
  const { notify } = useNotification();

  const refresh = useCallback(() => {
    setTimeout(() => setRefreshKey((k) => k + 1), 1500);
  }, []);

  useEffect(() => {
    if (publicKey) refresh();
  }, [publicKey, refresh]);

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      notify('Address copied!', 'success');
    }
  };

  const handleSwap = async () => {
    if (!publicKey) return;
    if (!swapAmount || isNaN(Number(swapAmount)) || Number(swapAmount) <= 0) {
      notify('Invalid amount.', 'error');
      return;
    }

    setIsSwapping(true);
    notify(`Swapping ${swapAmount} XLM...`);
    try {
      const xdr = await swapXlmToUsdc(publicKey, swapAmount);
      await signAndSubmit(xdr, publicKey);
      notify('Swap complete!', 'success');
      refresh();
    } catch (e: any) {
      notify(`Swap failed: ${e.message}`, 'error');
    } finally {
      setIsSwapping(false);
    }
  };

  // While connecting or disconnected, stay on the login screen
  if (!publicKey) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">GigRail<span className="text-indigo-600">.ph</span></h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed text-lg">Instant global payment rail for talent.</p>
          <ConnectWallet {...wallet} />
          <p className="mt-8 text-[10px] font-black uppercase text-slate-300 tracking-widest">Powered by Stellar Network</p>
        </div>
      </main>
    );
  }

  const NavItem = ({ label, id }: { label: string; id: View }) => (
    <button
      onClick={() => setView(id)}
      className={`px-6 py-2 rounded-full text-sm font-black transition-all ${
        view === id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-500">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setView('home')}>
               <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white transition-transform group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="text-lg font-black text-slate-900 hidden sm:inline">GigRail</span>
            </div>
            <nav className="flex items-center gap-2 bg-slate-50 p-1 rounded-full">
              <NavItem id="home" label="Overview" />
              <NavItem id="payments" label="Invoices" />
              <NavItem id="wallet" label="Wallet" />
            </nav>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Connected</span>
                <button onClick={handleCopyAddress} className="text-xs font-mono font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                  {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                </button>
             </div>
             <ConnectWallet {...wallet} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {view === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Balances & Core Actions */}
              <div className="lg:col-span-8 space-y-8">
                <BalanceCard publicKey={publicKey!} refreshKey={refreshKey} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[240px]">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-2">Account Setup</h3>
                      <p className="text-xs text-slate-400 mb-6 font-medium">Activate your account and enable USDC to start receiving payments.</p>
                    </div>
                    <div className="space-y-4">
                      <FundAccount publicKey={publicKey!} onFunded={refresh} />
                      <AddTrustline publicKey={publicKey!} onDone={refresh} />
                    </div>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl flex flex-col justify-between min-h-[240px]">
                    <div>
                      <h3 className="text-lg font-black mb-2 text-slate-100">Exchange</h3>
                      <p className="text-xs text-slate-500 mb-6 font-medium">Convert test XLM into USDC for payment testing.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type="number"
                          value={swapAmount}
                          onChange={(e) => setSwapAmount(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder="Amount"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase">XLM</span>
                      </div>
                      <button 
                        onClick={handleSwap}
                        disabled={isSwapping}
                        className="w-full rounded-xl bg-indigo-500 py-3 font-black uppercase text-xs tracking-widest text-white hover:bg-indigo-400 transition-all disabled:opacity-30"
                      >
                        {isSwapping ? 'Processing...' : 'Swap to USDC'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-900">Payment Request</h3>
                      <button onClick={refresh} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Refresh Activity</button>
                   </div>
                   <GigPaymentRail publicKey={publicKey!} refreshKey={refreshKey} onSent={refresh} />
                </div>
              </div>

              {/* Right Column: Savings & Status */}
              <div className="lg:col-span-4 space-y-8">
                <SavingsGoal publicKey={publicKey!} refreshKey={refreshKey} />
                
                <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm relative overflow-hidden">
                   <div className="relative z-10">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Network Connectivity</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-600">Environment</span>
                           <span className="text-xs font-mono font-black text-indigo-600">TESTNET</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-600">Status</span>
                           <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">Live</span>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                   <div className="relative z-10">
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2 opacity-80">Did you know?</p>
                      <p className="text-sm font-medium leading-relaxed italic">Stellar transactions settle in ~5 seconds with sub-cent fees, making it perfect for gig payments.</p>
                   </div>
                   <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150"></div>
                </div>
              </div>
            </div>
          )}

          {view === 'payments' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Invoices</h2>
                    <p className="text-slate-500 font-medium">Create requests or settle pending payouts.</p>
                  </div>
                  <button onClick={refresh} className="w-fit px-4 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50">Sync Data</button>
               </div>
               <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                 <GigPaymentRail publicKey={publicKey!} refreshKey={refreshKey} onSent={refresh} />
               </div>
            </div>
          )}

          {view === 'wallet' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-3xl font-black text-slate-900">My Assets</h2>
               <BalanceCard publicKey={publicKey!} refreshKey={refreshKey} />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl">
                    <h3 className="text-xl font-black mb-2 text-slate-100">Send Funds</h3>
                    <p className="text-slate-500 text-sm mb-8 font-medium">Direct transfer to any Stellar address.</p>
                    <SendPayment publicKey={publicKey!} onSent={refresh} />
                  </div>
                  
                  <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black mb-2 text-slate-900">Wallet Controls</h3>
                      <p className="text-slate-400 text-sm mb-8 font-medium">Manage account activation and trustlines.</p>
                    </div>
                    <div className="space-y-4">
                       <FundAccount publicKey={publicKey!} onFunded={refresh} />
                       <AddTrustline publicKey={publicKey!} onDone={refresh} />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex justify-around sticky bottom-0 z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <button onClick={() => setView('home')} className={`p-3 rounded-2xl transition-all ${view === 'home' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
        </button>
        <button onClick={() => setView('payments')} className={`p-3 rounded-2xl transition-all ${view === 'payments' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        </button>
        <button onClick={() => setView('wallet')} className={`p-3 rounded-2xl transition-all ${view === 'wallet' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>
        </button>
      </nav>
    </div>
  );
}
