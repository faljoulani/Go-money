'use client';

import React, { useRef, useState } from 'react';

type Props = {
  header: string;
  submitLabel: string;
};

export function ContactFormClient({ header, submitLabel }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current!;
    const fd = new FormData(form);
    const payload: Record<string, any> = {};
    fd.forEach((v, k) => (payload[k] = v));
    // 👇 POC: prove data reached the frontend
    console.log('[POC] ContactForm payload:', payload);
    setSent(true);
  };

  if (sent) return <div>Thanks! We received your message.</div>;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <h2>{header}</h2>

      <div>
        <label htmlFor="cf-fullname">Full name</label><br/>
        <input id="cf-fullname" name="fullName" type="text" />
      </div>

      <div>
        <label htmlFor="cf-email">Email</label><br/>
        <input id="cf-email" name="email" type="email" />
      </div>

      <div>
        <label htmlFor="cf-message">Message</label><br/>
        <textarea id="cf-message" name="message" rows={4} />
      </div>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}
