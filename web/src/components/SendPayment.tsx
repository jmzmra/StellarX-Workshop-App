'use client';
import { useState } from 'react';
import {
  buildPaymentXDR,
  submitSignedXDR,
  pollTransaction,
  type AssetCode,
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import { useNotification } from '@/components/Notification';

export default function SendPayment({
  publicKey,
  onSent,
}: {
  publicKey: string;
  onSent: () => void;
}) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<AssetCode>('XLM');
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleSend = async () => {
    setLoading(true);
    notify(`Preparing to send ${amount} ${asset}...`);
    try {
      const xdr = await buildPaymentXDR(publicKey, destination.trim(), amount, asset);

      notify('Waiting for Freighter signature...');
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing rejected');

      notify('Submitting payment to Stellar...');
      const hash = await submitSignedXDR(signed.signedTxXdr);

      notify('Confirming transaction on-chain...');
      await pollTransaction(hash);
      
      notify(`Successfully sent ${amount} ${asset}!`, 'success');
      setAmount('');
      setDestination('');
      onSent();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value as AssetCode)}
            className="w-full rounded-2xl border-slate-100 bg-slate-800 px-4 py-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
          >
            <option value="XLM">Native XLM</option>
            <option value="USDC">Stellar USDC</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-2xl border-slate-100 bg-slate-800 px-4 py-4 text-white font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Recipient Address</label>
        <input
          type="text"
          placeholder="G..."
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full rounded-2xl border-slate-100 bg-slate-800 px-4 py-4 text-xs font-mono text-indigo-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={loading || !destination || !amount}
        className="w-full rounded-2xl bg-indigo-600 py-4 font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-30 shadow-xl shadow-indigo-900/20"
      >
        {loading ? 'Processing...' : 'Execute Transfer'}
      </button>
    </div>
  );
}
