'use client';

import * as React from 'react';
import FullPageLoader from '../../atoms/fullPageLoader/fullPageLoader';

// Import the types and function from your existing file
type ApiNavItem = {
  children?: any[];
  [key: string]: any;
};

type ApiNavDropdown = ApiNavItem & {
  children: any[];
};

function isDropdown(item: ApiNavItem): item is ApiNavDropdown {
  return Array.isArray((item as any)?.children);
}

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

export default function ContactFormClient({
  postUrl = 'api/default/customer-ticket/create',
  data,
  dir = 'auto',
}: Props) {
  const FIELD =
    'w-full mx-auto h-[48px] px-3 py-3 rounded-[18px] text-[#BDBDBD] border border-[#BDBDBD] ' +
    'bg-white text-14px leading-[18px] outline-none focus:ring-2 focus:ring-[#0B2A8E]/20';
  const LABEL = 'mb-1 block text-14px text-default leading-[18px]';
  const reqStar = <span className="text-[#E53935]"> *</span>;

  const requestType = data.requestTypeChoices ?? [];

  const [isLoading, setIsLoading] = React.useState(false);
  const [resStatus, setResStatus] = React.useState<null | 'success' | 'error'>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside (similar to your navbar implementation)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const CustomDropdown = () => {
    const [selectedOption, setSelectedOption] = React.useState<Option | null>(null);

    const dropdownItem: ApiNavItem = {
      children: requestType.map((opt) => ({
        id: opt.id,
        label: opt.label,
        url: `#${opt.id}`,
      })),
    };

    if (isDropdown(dropdownItem)) {
      return (
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading}
            className={`${FIELD} appearance-none text-left flex items-center justify-between ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className={selectedOption ? 'text-default' : 'text-[#BDBDBD]'}>
              {selectedOption
                ? selectedOption.label
                : (data.requestTypePlacholder ?? 'Select request type')}
            </span>
            <svg
              className={`h-4 w-4 opacity-70 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div
              role="listbox"
              className="absolute top-full left-0 right-0 mt-1 rounded-[12px] bg-white shadow-xl z-50 pointer-events-auto max-h-60 overflow-auto p-2"
            >
              {dropdownItem.children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  role="option"
                  aria-selected={selectedOption?.id === child.id}
                  onClick={() => {
                    setSelectedOption({ id: child.id, label: child.label });
                    setIsDropdownOpen(false);
                  }}
                  className="w-full mt-2 text-left rtl:text-right p-2 text-14px leading-[18px] text-default hover:bg-[#E6E8FF] rounded-[12px]"
                >
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {isLoading && <FullPageLoader />}

      <form ref={formRef} onSubmit={handleSubmit} dir={dir} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          {/* First Name */}
          <div>
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
          <div>
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
          <div>
            <label className={LABEL}>
              {data.phoneNumberLabel ?? 'Phone Number'}
              {reqStar}
            </label>
            <div className="w-[326.5px] flex items-stretch gap-1">
              <div className="h-[48px] rounded-[18px] border border-[#BDBDBD] bg-white px-3 flex items-center gap-2">
                <span aria-hidden className="inline-flex h-6 min-w-6 items-center justify-center">
                  🇸🇦
                </span>
                <span className="text-sm font-medium text-[#2B2B2B]">+966</span>
              </div>
              <input
                name="phone"
                placeholder={data.phoneNumberPlaceholder ?? ''}
                className="flex-1 h-[48px] px-3 rounded-[18px] border border-[#BDBDBD] bg-white
                           text-14px leading-6 outline-none focus:ring-2 focus:ring-[#0B2A8E]/20"
                required
                inputMode="tel"
                autoComplete="tel"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
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

          <div>
            <label className={LABEL}>
              {data.requestTypeLabel ?? 'Request type'} {reqStar}
            </label>

            <CustomDropdown />

            <input type="hidden" name="requestType" />
          </div>

          <div>
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

          {/* Notes -> description */}
          <div className="col-span-2">
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

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm" aria-live="polite">
            {resStatus === 'success' && (
              <span className="text-green-600">Your message was successfully sent.</span>
            )}
            {resStatus === 'error' && (
              <span className="text-red-600">There was a problem sending your message.</span>
            )}
          </span>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-[18px] px-6 py-3 text-white bg-primary focus:outline-none focus:ring-2 focus:ring-[#0B2A8E]/30 disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : (data.ctaText ?? 'Send Message')}
          </button>
        </div>
      </form>
    </>
  );
}
