'use client';
import { useState, useEffect } from 'react';
import { fetchBalances, type Balances } from '@/lib/balances';

export default function BalanceCard({
  publicKey,
  refreshKey,
}: {
  publicKey: string;
  refreshKey: number;
}) {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBalances(publicKey)
      .then((b) => active && setBalances(b))
      .catch(() => active && setBalances(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [publicKey, refreshKey]);

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-28 rounded-3xl bg-gray-100 animate-pulse" />
        <div className="h-28 rounded-3xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (balances && !balances.funded) {
    return (
      <div className="mt-6 rounded-3xl border border-amber-100 bg-amber-50/50 p-6 text-center">
        <p className="text-sm font-bold text-amber-800">Account Not Activated</p>
        <p className="mt-1 text-xs text-amber-600">Fund your account with Friendbot to start transacting.</p>
      </div>
    );
  }

  if (!balances) {
    return (
      <div className="mt-6 rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-sm font-bold text-red-600">
        Failed to sync with Stellar network.
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-50 transition-transform group-hover:scale-150" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Network Native</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{balances.xlm}</span>
            <span className="text-xs font-bold text-slate-400">XLM</span>
          </div>
        </div>
      </div>
      
      <div className="group relative overflow-hidden rounded-3xl border border-indigo-50 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-indigo-50/50 transition-transform group-hover:scale-150" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Stable Asset</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-black text-indigo-600">{balances.usdc}</span>
            <span className="text-xs font-bold text-indigo-400">USDC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
