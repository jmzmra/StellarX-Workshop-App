'use client';
import { useState, useEffect } from 'react';
import {
  buildPaymentXDR,
  submitSignedXDR,
  pollTransaction,
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import { fetchBalances } from '@/lib/balances';
import { useNotification } from '@/components/Notification';

type Invoice = {
  id: string;
  description: string;
  amount: string;
  freelancer: string;
  status: 'pending' | 'paid';
  timestamp: number;
};

export default function GigPaymentRail({
  publicKey,
  refreshKey,
  onSent,
}: {
  publicKey: string;
  refreshKey: number;
  onSent: () => void;
}) {
  const [mode, setMode] = useState<'freelancer' | 'client'>('freelancer');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleCreateInvoice = () => {
    if (!description || !amount) return;
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substring(7),
      description,
      amount,
      freelancer: publicKey,
      status: 'pending',
      timestamp: Date.now(),
    };
    setInvoices([newInvoice, ...invoices]);
    setDescription('');
    setAmount('');
    notify('Invoice created!', 'success');
  };

  const handlePayout = async (invoice: Invoice) => {
    setLoading(true);
    notify('Processing payout...');
    try {
      const xdr = await buildPaymentXDR(publicKey, invoice.freelancer, invoice.amount, 'USDC');
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });

      if (signed.error) throw new Error(typeof signed.error === 'string' ? signed.error : 'Signing rejected');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);

      setInvoices(invoices.map((inv) => inv.id === invoice.id ? { ...inv, status: 'paid' } : inv));
      notify('Freelancer paid!', 'success');
      onSent();
    } catch (e: any) {
      notify(`Error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMode('freelancer')}
          className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            mode === 'freelancer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Freelancer
        </button>
        <button
          onClick={() => setMode('client')}
          className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            mode === 'client' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Client
        </button>
      </div>

      {mode === 'freelancer' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="What's this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-bold"
            />
            <div className="relative">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">USDC</span>
            </div>
          </div>
          <button
            onClick={handleCreateInvoice}
            disabled={!description || !amount}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-800 disabled:opacity-30"
          >
            Create Payment Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending invoices</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                <div>
                   <p className="text-sm font-bold text-slate-900">{inv.description}</p>
                   <p className="text-[10px] font-mono text-slate-400">{inv.freelancer.slice(0, 8)}...</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-indigo-600">{inv.amount} USDC</span>
                  {inv.status === 'pending' ? (
                    <button
                      onClick={() => handlePayout(inv)}
                      disabled={loading}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Paid</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
