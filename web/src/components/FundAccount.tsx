'use client';
import { useState } from 'react';
import { fundTestnetAccount } from '@/lib/stellar';
import { useNotification } from '@/components/Notification';

export default function FundAccount({
  publicKey,
  onFunded,
}: {
  publicKey: string;
  onFunded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const fund = async () => {
    setLoading(true);
    notify('Requesting testnet XLM from Friendbot...');
    try {
      await fundTestnetAccount(publicKey);
      notify('Account funded successfully! 10,000 XLM added.', 'success');
      onFunded();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Funding failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={fund}
      disabled={loading}
      className="w-full rounded-2xl bg-amber-400 py-4 text-sm font-black uppercase tracking-widest text-amber-950 transition-all hover:bg-amber-500 hover:shadow-lg active:scale-95 disabled:opacity-50 shadow-md shadow-amber-100"
    >
      {loading ? 'Processing...' : 'Request 10,000 XLM'}
    </button>
  );
}
