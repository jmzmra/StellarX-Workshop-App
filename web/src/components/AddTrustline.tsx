'use client';
import { useState } from 'react';
import { buildAddUsdcTrustlineXDR } from '@/lib/trustline';
import { signAndSubmit } from '@/lib/sign';
import { useNotification } from '@/components/Notification';

export default function AddTrustline({
  publicKey,
  onDone,
}: {
  publicKey: string;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { notify } = useNotification();

  const add = async () => {
    setLoading(true);
    notify('Enabling USDC trustline on your account...');
    try {
      const xdr = await buildAddUsdcTrustlineXDR(publicKey);
      await signAndSubmit(xdr, publicKey);
      notify('USDC trustline established!', 'success');
      setIsDone(true);
      onDone();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Failed to add trustline', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-4 text-sm font-black uppercase tracking-widest text-emerald-600 border border-emerald-100">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        USDC Asset Active
      </div>
    );
  }

  return (
    <button
      onClick={add}
      disabled={loading}
      className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-50"
    >
      {loading ? 'Establishing...' : 'Enable USDC Asset'}
    </button>
  );
}
