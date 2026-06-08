'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  contractConfigured,
  readSavingsState,
  buildContributeXDR,
  buildInitXDR,
  type SavingsState,
} from '@/lib/contract';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import { useNotification } from '@/components/Notification';

export default function SavingsGoal({ publicKey, refreshKey }: { publicKey: string | null, refreshKey: number }) {
  const configured = contractConfigured();
  const [state, setState] = useState<SavingsState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [amount, setAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000');
  const [busy, setBusy] = useState(false);
  const { notify } = useNotification();

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    try {
      setState(await readSavingsState());
    } catch (e: unknown) {
      console.error('Failed to read contract:', e);
      // If reading fails, we assume it needs initialization
      setState({ saved: 0n, target: 0n });
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const handleInit = async () => {
    if (!publicKey) return;
    setBusy(true);
    notify('Initializing goal...');
    try {
      const xdr = await buildInitXDR(publicKey, Number(targetAmount));
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing rejected');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      notify('Goal set!', 'success');
      await refresh();
    } catch (e: any) {
      notify(`Failed: ${e.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  const contribute = async () => {
    if (!publicKey) return;
    setBusy(true);
    notify('Saving contribution...');
    try {
      const xdr = await buildContributeXDR(publicKey, Number(amount));
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing rejected');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      notify('Saved!', 'success');
      setAmount('');
      await refresh();
    } catch (e: any) {
      notify(`Failed: ${e.message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Smart Savings</h2>
        <p className="text-xs text-slate-500">Deploy contract to enable.</p>
      </div>
    );
  }

  const pct =
    state && state.target > 0n
      ? Math.min(100, Math.round((Number(state.saved) / Number(state.target)) * 100))
      : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Savings Goal</h2>
        {loading && <div className="h-4 w-4 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>}
      </div>

      {!loading && state && state.target === 0n && (
        <div className="space-y-4">
           <p className="text-xs text-slate-500">Set a USDC target to track on-chain.</p>
           <div className="flex gap-2">
              <input
                type="number"
                placeholder="Target"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="flex-1 rounded-xl border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
              <button
                onClick={handleInit}
                disabled={busy || !publicKey || !targetAmount}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
              >
                Set
              </button>
           </div>
        </div>
      )}

      {!loading && state && state.target > 0n && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
               <span className="text-2xl font-black text-slate-900">{state.saved.toString()}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase">/ {state.target.toString()} Goal</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 transition-all duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 rounded-xl border-slate-100 bg-slate-50 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
            <button
              onClick={contribute}
              disabled={busy || !publicKey || !amount}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 shadow-md shadow-slate-200"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
