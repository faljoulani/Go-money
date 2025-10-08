'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import FullPageLoader from '../../atoms/fullPageLoader/fullPageLoader';
import CustomDropdown, { DropdownOption } from '../../atoms/dropdown/dropdown';
import { COUNTRY_LIST } from '../../../utils/countries-emoji';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';

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
  // console.log('ContactFormClient data:', data);
  const FIELD =
    'w-full h-[48px] px-3 py-3 rounded-[18px] text-[#9ca3af] border border-[#9ca3af] ' +
    'bg-surface-input text-14px leading-[18px] outline-none focus:ring-2 focus:ring-[#0B2A8E]/20';
  const LABEL = 'mb-[10px] text-14px text-default leading-[18px]';
  const reqStar = <span className="text-[#E53935]"> *</span>;

  const [isLoading, setIsLoading] = useState(false);
  const [resStatus, setResStatus] = useState<null | 'success' | 'error'>(null);
  const [selectedRequestType, setSelectedRequestType] = useState<string>('COMPLAINT');
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const DEFAULT_ISO2 = 'SA';
  const DEFAULT_DIAL = COUNTRY_LIST.find((c) => c.iso2 === DEFAULT_ISO2)?.dial ?? '+966';

  const [countryIso2, setCountryIso2] = useState<string>(DEFAULT_ISO2);
  const [countryDial, setCountryDial] = useState<string>(DEFAULT_DIAL);

  const countryOptions: DropdownOption[] = useMemo(
    () =>
      COUNTRY_LIST.map((c) => ({
        id: c.iso2,
        value: c.iso2,
        label: (
          <span className="flex items-center gap-2 text-default">
            <span className={`fi fi-${c.iso2.toLowerCase()}`} aria-hidden />
            {/* <span className="font-medium">{c.iso2}</span> */}
            <span className="">{c.dial}</span>
          </span>
        ),
      })),
    [],
  );
  const { post } = useSfMutation(postUrl);
  const onCountryChange = (opt: DropdownOption) => {
    const iso2 = String(opt.value ?? opt.id);
    const info = COUNTRY_LIST.find((c) => c.iso2 === iso2);
    setCountryIso2(iso2);
    setCountryDial(info?.dial ?? '');
  };

  const getdropdownOptions = (dir: 'ltr' | 'rtl'): DropdownOption[] => [
    {
      id: '1',
      value: 'COMPLAINT',
      label: dir === 'ltr' ? 'Complaint' : 'شكوى',
    },
    {
      id: '2',
      value: 'INQUIRY',
      label: dir === 'ltr' ? 'Inquiry' : 'استفسار',
    },
  ];

  const getDropdownOptionsTopics = (dir: 'ltr' | 'rtl'): DropdownOption[] => [
    {
      id: '1',
      value: 'ACCOUNT.ISSUE',
      label: dir === 'rtl' ? 'مشكلة في الحساب' : 'Account Issue',
    },
    {
      id: '2',
      value: 'PAYMENT.ISSUE',
      label: dir === 'rtl' ? 'مشكلة في الدفع' : 'Payment Issue',
    },
    {
      id: '3',
      value: 'TECHNICAL.ISSUE',
      label: dir === 'rtl' ? 'مشكلة تقنية' : 'Technical Issue',
    },
    {
      id: '4',
      value: 'PRODUCT.ISSUE',
      label: dir === 'rtl' ? 'مشكلة في المنتج' : 'Product Issue',
    },
    {
      id: '5',
      value: 'OTHERS',
      label: dir === 'rtl' ? 'أخرى' : 'Others',
    },
  ];
  const Direction = useDir(); // 'ltr' or 'rtl'
  const dropdownOptionsTopics: DropdownOption[] = getDropdownOptionsTopics(Direction);
  const dropdownOptions: DropdownOption[] = getdropdownOptions(Direction);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResStatus(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const firstName = String(formData.get('firstName') || '').trim();
      const lastName = String(formData.get('lastName') || '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || firstName || lastName;

      const localPhone = String(formData.get('phone') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const topic = String(formData.get('topic') || '').trim();

      const reqType = selectedRequestType;

      const notes = String(formData.get('notes') || '').trim();

      const apiPayload: Record<string, any> = {
        customerName: fullName,
        phone: `${countryDial}${localPhone}`,
        email,
        requestType: reqType,
        description: notes || `Request from ${fullName || email}`,
        channel: 'MOBILE.APPLICATION',
      };

      // Add complaintCategory **only if requestType is COMPLAINT**
      if (reqType === 'COMPLAINT') {
        apiPayload.complaintCategory = topic || selectedTopic || '';
      }

      await post(apiPayload);

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
    <div>
      {isLoading && <FullPageLoader />}

      <form ref={formRef} onSubmit={handleSubmit} dir={dir} className="space-y-5">
        <input type="hidden" name="requestType" value={selectedRequestType} />
        <div className="grid min-w-0 xs:grid-cols-1 gap-5 md:grid-cols-2 ">
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

          {/* Phone (flag · ISO2 · +code pill + local number input) */}
          <div className="flex flex-col min-w-0">
            <label className={LABEL}>
              {data.phoneNumberLabel ?? 'Phone Number'}
              {reqStar}
            </label>

            <div className="flex items-stretch gap-1">
              {/* Country pill dropdown */}
              <div className="relative inline-block mx-auto">
                <CustomDropdown
                  name="Country"
                  options={countryOptions}
                  placeholder="Select"
                  valueId={countryIso2}
                  onChange={onCountryChange}
                  className="relative inline-block"
                  buttonClassName={[
                    'inline-flex h-[48px] max-w-[100px] items-center justify-center gap-2',
                    'rounded-[18px] border border-[#BDBDBD] bg-surface-input px-3 mx-auto text-14px leading-[18px] text-[#2B2B2B]',
                    'focus:ring-2 focus:ring-[#0B2A8E]/20',
                    isLoading ? 'opacity-50 cursor-not-allowed' : '',
                  ].join(' ')}
                  listClassName="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 w-full overflow-auto rounded-[12px] bg-surface-page p-2 shadow-xl"
                  optionClassName="w-full mt-2 text-left rtl:text-right p-2 text-14px leading-[18px] text-default hover:bg-[#E6E8FF] dark:hover:bg-[#A6EFD9] rounded-[12px]"
                  disabled={isLoading}
                />
              </div>

              {/* Local number only */}
              <div className="flex-1">
                <input
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder={data.phoneNumberPlaceholder ?? ''}
                  className={FIELD}
                  disabled={isLoading}
                />
              </div>
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
              disabled={isLoading}
              onChange={(opt) => {
                const val = String(opt.value || '').toUpperCase();
                setSelectedRequestType(val);
                console.log('Selected request type:', val);
              }}
              className="relative w-full md:max-w-full sm:max-w-[326.5px]"
              buttonClassName={`${FIELD} appearance-none text-left flex items-center justify-between ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              listClassName="absolute top-full left-0 right-0 mt-1 rounded-[12px] bg-surface-page shadow-xl z-50 pointer-events-auto max-h-60 overflow-auto p-2"
              optionClassName="w-full mt-2 text-left rtl:text-right p-2 text-14px leading-[18px] text-default hover:bg-[#E6E8FF] rounded-[12px] dark:hover:bg-[#A6EFD9] dark:hover:text-whiteCta"
            />
          </div>

          {/* Topic */}
          <div className="flex flex-col min-w-0">
            <label className={LABEL}>
              {data.topicLabel ?? 'Topic'}
              {reqStar}
            </label>
            <CustomDropdown
              name="topic"
              options={dropdownOptionsTopics}
              placeholder={data.topicPlaceholder ?? 'Select topic'}
              disabled={isLoading || selectedRequestType === 'INQUIRY'}
              onChange={(opt) => {
                if (isLoading || selectedRequestType === 'INQUIRY') {
                  setSelectedTopic('');
                  return;
                }
                const topicValue = String(opt.value || '').toUpperCase();
                setSelectedTopic(topicValue);
              }}
              className="relative w-full md:max-w-full sm:max-w-[326.5px]"
              buttonClassName={`${FIELD} appearance-none text-left flex items-center justify-between ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              listClassName="absolute top-full left-0 right-0 mt-1 rounded-[12px] bg-surface-page shadow-xl z-50 pointer-events-auto max-h-60 overflow-auto p-2"
              optionClassName="w-full mt-2 text-left rtl:text-right p-2 text-14px leading-[18px] text-default hover:bg-[#E6E8FF] rounded-[12px] dark:hover:bg-[#A6EFD9] dark:hover:text-whiteCta"
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
            className="w-full sm:w-auto rounded-[18px] px-6 py-3 text-secondary bg-primaryAlt focus:outline-none focus:ring-2 focus:ring-[#0B2A8E]/30 disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : (data.ctaText ?? 'Send Message')}
          </button>
        </div>
      </form>
    </div>
  );
}

