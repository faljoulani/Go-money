'use client';

import { useState } from 'react';
import CTA from '../../atoms/cta/cta';
import { useSf } from '../../../utils/hooks/useSf';
export default function SubscribeEmailForm({
  placeholder = 'Enter your email address',
  label = 'Email',
  button = 'Subscribe Now',
  endpoint = '/SubscriptionEmails',
  className = '',
}: {
  placeholder?: string;
  label?: string;
  button?: string;
  endpoint?: string;
  className?: string;
}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg('Please enter a valid email.');
      setState('err');
      return;
    }
    setState('loading');
    setMsg('');
    try {
      const res = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setState('ok');
      setMsg('Subscribed! Check your inbox.');
      setEmail('');
    } catch (err: any) {
      setState('err');
      setMsg('Could not subscribe. Please try again.');
      console.error(err);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      <label className="sr-only">{label}</label>
      <div className="mb-4 flex h-[56px] items-center rounded-2xl border border-[#DFE3EA] px-4 bg-white">
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#9DA3AE]"
          disabled={state === 'loading'}
          required
        />
      </div>
      <CTA
        borderColor="border-primary"
        variant="outline"
        icon="arrow"
        className="w-full rounded-[20px] border-[2px] px-6 py-[18px]"
        disabled={state === 'loading'}
        type="submit"
      >
        {state === 'loading' ? 'Submitting…' : button}
      </CTA>
      {msg && (
        <p className={`mt-2 text-sm ${state === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {msg}
        </p>
      )}
    </form>
  );
}

