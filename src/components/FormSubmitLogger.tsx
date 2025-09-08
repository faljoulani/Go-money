// components/FormSubmitLogger.tsx
'use client';
import { useEffect } from 'react';

export default function FormSubmitLogger() {
  useEffect(() => {
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement | null;
      if (!form || form.tagName !== 'FORM') return;

      const fd = new FormData(form);
      const payload: Record<string, any> = {};
      fd.forEach((v, k) => {
        const val = v instanceof File ? (v.name || '') : v;
        if (payload[k] === undefined) payload[k] = val;
        else payload[k] = Array.isArray(payload[k]) ? [...payload[k], val] : [payload[k], val];
      });

      // Try to show the form code-name if present (nice-to-have)
      const nameAttr = form.getAttribute('data-sf-form-name') || form.getAttribute('name') || 'unknown-form';
      const method = (form.getAttribute('method') || 'GET').toUpperCase();
      const action = form.getAttribute('action') || '';
+
      console.log(`[POC] Sitefinity OOB form "${nameAttr}" submitted:`, { method, action, payload });
      // Do NOT preventDefault; let Sitefinity continue (thank-you/redirect)
    };

    document.addEventListener('submit', onSubmit, true); // capture phase
    return () => document.removeEventListener('submit', onSubmit, true);
  }, []);

  return null;
}
