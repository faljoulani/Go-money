'use client';

import { useState } from 'react';
import CTA from '../../atoms/cta/cta';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';
export default function SubscribeEmailForm({
  placeholder = 'Enter your email address',
  label = 'Email',
  button = 'Subscribe Now',
  endpoint = 'api/default/subscriptions',
  className = '',
}: {
  placeholder?: string;
  label?: string;
  button?: string;
  endpoint?: string;
  className?: string;
}) {
  const { post } = useSfMutation(endpoint);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
     const isRTL =
    (typeof document !== 'undefined' &&
      document?.documentElement?.getAttribute('dir') === 'rtl') ||
    false;

  const MSG = {
    invalid: isRTL ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please enter a valid email.',
    ok:      isRTL ? 'تم الاشتراك! تحقق من بريدك الوارد.' : 'Subscribed! Check your inbox.',
    fail:    isRTL ? 'تعذر إتمام الاشتراك. يرجى المحاولة مرة أخرى.' : 'Could not subscribe. Please try again.',
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setMsg(MSG.invalid);
    setState('err');
    return;
  }

  setState('loading');
  setMsg('');
    try {
    const res = await post({ Email: email });
    if (!res?.Email) throw new Error(await res.text?.());
    setState('ok');
    setMsg(MSG.ok);
    setEmail('');
  } catch (err: any) {
    setState('err');
    setMsg(MSG.fail);
    console.error(err);
  }
  }

  return (
    <div className="flex flex-col justify-end h-full">
      <form onSubmit={onSubmit} className={className} noValidate>
        <label className="sr-only">{label}</label>
        <div className="mb-4 flex xs:h-12 md:h-14 items-center xs:rounded-[18px] md:rounded-[20px] border border-[#DFE3EA] px-4 bg-surface-section">
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
          colorText="text-primaryAlt"
          borderColor="border-primaryAlt"
          variant="outline"
          icon="arrow"
          className="w-full xs:rounded-[18px] md:rounded-[20px] border-[2px] px-6 py-[18px] text-lg font-medium tracking-[-0.025%em] xs:h-12 md:h-14"
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
    </div>
  );
}

