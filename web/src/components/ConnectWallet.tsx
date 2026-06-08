'use client';
import type { WalletState } from '@/hooks/useWallet';

export default function ConnectWallet({
  publicKey,
  connecting,
  error,
  connect,
  disconnect,
}: WalletState) {
  if (publicKey) {
    return (
      <button
        onClick={disconnect}
        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-all border border-slate-100 hover:border-red-100"
      >
        Disconnect
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={connect}
        disabled={connecting}
        className="w-full px-8 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <p className="mt-4 text-xs font-bold text-red-500 uppercase tracking-tight">{error}</p>}
    </div>
  );
}
