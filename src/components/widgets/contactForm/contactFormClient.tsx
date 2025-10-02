'use client';

import { useState, useEffect, useRef } from 'react';
import FullPageLoader from '../../atoms/fullPageLoader/fullPageLoader';
import CustomDropdown, { DropdownOption } from '../../atoms/dropdown/dropdown';

type Option = { id: string; label: string };
type Data = {
  title?: string;
  subTitle?: string;
  ctaText?: string;
  ctaHref?: string;

  firstNameLabel?: string;
  firstNamePlaceholder?: string;
  lastNameLabel?: string;
  lastNamePlaceholder?: string;

  phoneNumberLabel?: string;
  phoneNumberPlaceholder?: string;

  emailLabel?: string;
  emailPlaceholder?: string;

  requestTypeLabel?: string;
  requestTypeChoices?: Option[];
  requestTypePlacholder?: string;

  topicLabel?: string;
  topicPlaceholder?: string;

  notesLabel?: string;
  notesPlaceholder?: string;
};

type Props = {
  postUrl?: string;
  data: Data;
  dir?: 'ltr' | 'rtl' | 'auto';
};

function useDir(): 'rtl' | 'ltr' {
  const [dir, setDir] = useState<'rtl' | 'ltr'>('ltr');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const htmlDir = document.documentElement.getAttribute('dir');
      setDir(htmlDir === 'rtl' ? 'rtl' : 'ltr');
    }
  }, []);

  return dir;
}

export default function ContactFormClient({
  postUrl = 'api/default/customer-ticket/create',
  data,
  dir = 'auto',
}: Props) {
  const FIELD =
    'w-full h-[48px] px-3 py-3 rounded-[18px] text-black border border-[#BDBDBD] ' +
    'bg-white text-14px leading-[18px] outline-none focus:ring-2 focus:ring-[#0B2A8E]/20';
  const LABEL = 'mb-1 text-14px text-default leading-[18px]';
  const reqStar = <span className="text-[#E53935]"> *</span>;

  const [isLoading, setIsLoading] = useState(false);
  const [resStatus, setResStatus] = useState<null | 'success' | 'error'>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const dropdownOptions: DropdownOption[] = (data.requestTypeChoices ?? []).map((option) => ({
    id: option.id,
    label: option.label,
    value: (option.id ?? '').toString().toUpperCase(),
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResStatus(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const firstName = String(formData.get('firstName') || '').trim();
      const lastName = String(formData.get('lastName') || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || firstName || lastName;

      const phone = String(formData.get('phone') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const topic = String(formData.get('topic') || '').trim();
      const reqType =
        String(formData.get('requestType') || '')
          .trim()
          .toUpperCase() || 'COMPLAINT';
      const notes = String(formData.get('notes') || '').trim();

      const apiPayload = {
        customerName: fullName,
        phone,
        email,
        requestType: reqType,
        complaintCategory: topic || 'OTHERS',
        description: notes || `Request from ${fullName || email}`,
        channel: 'MOBILE.APPLICATION',
      };

      const response = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setResStatus('success');
      formRef.current?.reset();
    } catch (err) {
      console.error('Contact form submit failed:', err);
      setResStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  const Dir = useDir();

  return (
    <>
      {isLoading && <FullPageLoader />}

      <form ref={formRef} onSubmit={handleSubmit} dir={dir} className="space-y-5">
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          {/* First Name */}
          <div className="grid grid-cols-1 min-w-0">
            <label className={LABEL}>
              {data.firstNameLabel ?? 'First Name'}
              {reqStar}
            </label>
            <input
              name="firstName"
              placeholder={data.firstNamePlaceholder ?? ''}
              className={FIELD}
              required
              autoComplete="given-name"
              disabled={isLoading}
            />
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-1 min-w-0">
            <label className={LABEL}>
              {data.lastNameLabel ?? 'Last Name'}
              {reqStar}
            </label>
            <input
              name="lastName"
              placeholder={data.lastNamePlaceholder ?? ''}
              className={FIELD}
              required
              autoComplete="family-name"
              disabled={isLoading}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col min-w-0">
            <label className={LABEL}>
              {data.phoneNumberLabel ?? 'Phone Number'}
              {reqStar}
            </label>

            {/* Unified pill wrapper */}
            <div
              className="
                w-full sm:max-w-[326.5px] min-w-0
                box-border flex items-center
                rounded-[18px] border border-[#BDBDBD] bg-white
                overflow-hidden focus-within:ring-2 focus-within:ring-[#0B2A8E]/20
                divide-x divide-[#BDBDBD] rtl:divide-x-reverse
    "
            >
              {/* Prefix segment (no rounded, no border) */}
              <div className="px-3 h-[48px] inline-flex items-center gap-2 shrink-0 bg-white">
                <span aria-hidden className="inline-flex h-6 min-w-6 items-center justify-center">
                  🇸🇦
                </span>
                <span className="text-sm font-medium text-[#2B2B2B]">+966</span>
              </div>

              {/* Input (no border, no own radius) */}
              <input
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder={data.phoneNumberPlaceholder ?? ''}
                className="
        min-w-0 flex-1 h-[48px] px-3
        border-0 outline-none bg-transparent
        text-14px leading-6 text-[#2B2B2B]
        placeholder:text-[#BDBDBD]
      "
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col min-w-0">
            <label className={LABEL}>
              {data.emailLabel ?? 'Email'}
              {reqStar}
            </label>
            <input
              name="email"
              type="email"
              placeholder={data.emailPlaceholder ?? ''}
              className={FIELD}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          {/* Request Type */}
          <div className="flex flex-col min-w-0">
            <label className={LABEL}>
              {data.requestTypeLabel ?? 'Request type'} {reqStar}
            </label>

            <CustomDropdown
              name="requestType"
              options={dropdownOptions}
              placeholder={data.requestTypePlacholder ?? 'Select request type'}
              dir={dir}
              disabled={isLoading}
              className="relative w-full sm:max-w-[326.5px]"
              buttonClassName={`${FIELD} appearance-none text-left flex items-center justify-between ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              listClassName="absolute top-full left-0 right-0 mt-1 rounded-[12px] bg-white shadow-xl z-50 pointer-events-auto max-h-60 overflow-auto p-2"
              optionClassName="w-full mt-2 text-left rtl:text-right p-2 text-14px leading-[18px] text-default hover:bg-[#E6E8FF] rounded-[12px]"
            />
          </div>

          {/* Topic */}
          <div className="flex flex-col min-w-0">
            <label className={LABEL}>
              {data.topicLabel ?? 'Topic'}
              {reqStar}
            </label>
            <input
              name="topic"
              placeholder={data.topicPlaceholder ?? ''}
              className={FIELD}
              required
              autoComplete="off"
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2 min-w-0">
            <label className={LABEL}>
              {data.notesLabel ?? 'Notes'}
              {reqStar}
            </label>
            <textarea
              name="notes"
              placeholder={data.notesPlaceholder ?? ''}
              className={`${FIELD} h-[81px] w-full`}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm" aria-live="polite">
            {resStatus === 'success' &&
              (Dir === 'ltr' ? (
                <span className="text-green-600">Your message was successfully sent</span>
              ) : (
                <span className="text-green-600">تم إرسال رسالتك بنجاح</span>
              ))}
            {resStatus === 'error' &&
              (Dir === 'ltr' ? (
                <span className="text-red-600">There was a problem sending your message</span>
              ) : (
                <span className="text-red-600"> حدثت مشكلة أثناء إرسال رسالتك</span>
              ))}
          </span>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto rounded-[18px] px-6 py-3 text-white bg-primary focus:outline-none focus:ring-2 focus:ring-[#0B2A8E]/30 disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : (data.ctaText ?? 'Send Message')}
          </button>
        </div>
      </form>
    </>
  );
}

