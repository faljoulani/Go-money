'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';

type Nationality = string;
type ResultState = null | 'success' | 'fail';

type Choice = { id: string; title: string; value: string };
type LinkLike = string | { Href?: string } | Array<{ Href?: string }>;

type Message = {
  id?: string;

  title: string;
  description: string;

  noteTitle: string;
  noteDescription: string;

  primaryLabel: string;
  primaryUrl?: string; 

  downloadLabel: string;
  downloadUrl?: string;

  backLabel: string;
  backUrl?: string;

  validationText: string;

  imageUrl?: string; 
  imageAlt: string;

  // Fail-screen only
  reasonsTitle: string;
  reasonsDescription: string; 
  actionsTitle: string;
  actionsDescription: string;
};

export default function FinanceCalculatorClient({ cfg, lang }: { cfg: any; lang: string }) {
  const C = cfg ?? {};
  const dir: 'rtl' | 'ltr' = lang?.startsWith('ar') ? 'rtl' : 'ltr';

  const { post } = useSfMutation('api/default/eligibility/get');

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const parseNum = (v: number | '') => (v === '' ? null : Number(v));
  const formatSar = (n: number) =>
    new Intl.NumberFormat('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      n,
    );

  function useRangeVars(value: number, min: number, max: number, fill: string, rest: string) {
    const pct = useMemo(() => ((value - min) * 100) / (max - min), [value, min, max]);
    return useMemo(
      () => ({
        background: `linear-gradient(var(--grad-dir, to right), ${fill} ${pct}%, ${rest} ${pct}%)`,
      }),
      [pct, fill, rest],
    );
  }


const getHref = (v?: LinkLike | { url?: string } | null) =>
  !v ? undefined
  : typeof v === 'string' ? v
  : Array.isArray(v) ? v.find(x => x?.Href)?.Href
  : (v as any).Href ?? (v as any).url ?? undefined;

const getMediaUrl = (m?: any) =>
  m?.Url ||
  m?.MediaUrl ||
  m?.ThumbnailUrl ||
  (Array.isArray(m?.Urls) && m.Urls[0]) ||
  m?.imageUrl ||
  undefined;

type RawMessage = any;

function mapMessage(raw: RawMessage): Message {
  const title            = raw?.Title ?? raw?.title ?? '';
  const description      = raw?.Description ?? raw?.description ?? '';

  const noteTitle        = raw?.NoteTitle ?? raw?.note?.title ?? '';
  const noteDescription  = raw?.NoteDescription ?? raw?.note?.description ?? '';

  const primaryLabel     = raw?.ExploreLabel ?? raw?.actions?.explore?.label ?? '';
  const primaryUrl       = getHref(raw?.ExploreUrl ?? raw?.actions?.explore?.url);

  const downloadLabel    = raw?.DownloadLabel ?? raw?.actions?.download?.label ?? '';
  const downloadUrl      = getHref(raw?.DownloadUrl ?? raw?.actions?.download?.url);

  const backLabel        = raw?.BackLabel ?? raw?.actions?.back?.label ?? '';
  const backUrl          = getHref(raw?.BackUrl ?? raw?.actions?.back?.url);

  const validationText   = raw?.ValidationText ?? raw?.validationText ?? '';

  const imageUrl         = getMediaUrl(raw?.Image ?? raw);
  const imageAlt         = raw?.Image?.AlternativeText
                        ?? raw?.Image?.Title
                        ?? raw?.imageAlt
                        ?? title;

  const reasonsTitle       = raw?.ReasonsTitle ?? raw?.reasonsTitle ?? '';
  const reasonsDescription = raw?.ReasonsDescription ?? raw?.reasonsDescription ?? '';
  const actionsTitle       = raw?.ActionsTitle ?? raw?.actionsTitle ?? '';
  const actionsDescription = raw?.ActionsDescription ?? raw?.actionsDescription ?? '';

  return {
    id: raw?.Id ?? raw?.id,
    title,
    description,
    noteTitle,
    noteDescription,
    primaryLabel,
    primaryUrl,
    downloadLabel,
    downloadUrl,
    backLabel,
    backUrl,
    validationText,
    imageUrl,
    imageAlt,
    reasonsTitle,
    reasonsDescription,
    actionsTitle,
    actionsDescription,
  };
}

    

  const splitLines = (v?: string) =>
    (v || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const href = (v?: LinkLike): string | undefined => {
    if (!v) return undefined;
    if (typeof v === 'string') return v;
    if (Array.isArray(v)) return v.find((x) => x?.Href)?.Href || undefined;
    return v.Href || undefined;
  };
  const AMIN = C.labels.minimumFinanceAmount,
    AMAX = C.labels.maximumFinanceAmount,
    ASTEP = 500,
    ADEF = (AMAX + AMIN) / 2;
  const IMIN = C.labels.minimumEligibleInstallments,
    IMAX = C.labels.maximumEligibleInstallments,
    ISTEP = 1,
    IDEF = (IMAX + IMIN) / 2;

  const employerChoices: Choice[] = C.choices?.employerTypes ?? [];
  const lengthChoices: Choice[] = C.choices?.lengthOfServices ?? [];
  const nationalityChoices: Choice[] = C.choices?.nationalities ?? [];

  const employerOptions = employerChoices.length ? employerChoices.map((c) => c.title) : ['GML'];
  const lengthOptions = lengthChoices.length
    ? lengthChoices.map((c) => c.title)
    : ['3 Months', '6 Months', '1 Year', '2 Years', '3+ Years'];
  const nationalityOptions = nationalityChoices.length
    ? nationalityChoices.map((c) => c.title)
    : (['Saudi', 'Non-Saudi'] as string[]);

  // ---- state ----
  const [result, setResult] = useState<ResultState>(null);
  const [nationality, setNationality] = useState<Nationality>('saudi');
  const [employer, setEmployer] = useState('');
  const [serviceLength, setServiceLength] = useState(lengthOptions[0] ?? '3 Months');
  const [dob, setDob] = useState('');
  const [salary, setSalary] = useState<number | ''>('');
  const [requestedFinanceAmount, setRequestedFinanceAmount] = useState<number>(ADEF);
  const [installments, setInstallments] = useState<number>(IDEF);
  const [expenses, setExpenses] = useState<number | ''>('');
  const [mortgageLiabilities, setMortgageLiabilities] = useState<number | ''>('');
  const [monthlyFinancialLiabilities, setMonthlyFinancialLiabilities] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const amountFill = useRangeVars(requestedFinanceAmount, AMIN, AMAX, '#0B2A8E', '#C9CDD6');
  const instFill = useRangeVars(installments, IMIN, IMAX, '#0B2A8E', '#C9CDD6');

  // ---- age utils ----
  function calcAge(dobStr: string) {
    if (!dobStr) return '';
    const d = new Date(dobStr);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return String(age);
  }
  function calcAgeAtMaturity(dobStr: string, tenureMonths: number) {
    if (!dobStr) return '';
    const d = new Date(dobStr);
    const mat = new Date(d);
    mat.setMonth(mat.getMonth() + Number(tenureMonths || 0));
    return calcAge(mat.toISOString().slice(0, 10));
  }
  function mapLenOfService(choice: string) {
    const m = /(\d+)/.exec(choice || '');
    return m ? m[1] : '';
  }

  const messages: RawMessage[] = Array.isArray(C.messages) ? C.messages : [];
 const rawSuccess = messages[1] ?? null;
const rawFail    = messages[0] ?? null;

  const successMsg = mapMessage(rawSuccess || {});
  const failMsg = mapMessage(rawFail || {});




  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    const payload = {
      EmployerType: employer || 'GML',
      Nationality: nationality,
      Gender: 'Male',
      FinanceAmt: String(requestedFinanceAmount),
      Tenure: String(installments),
      MonthlyIncome: String(parseNum(salary)),
      lenOfService: mapLenOfService(serviceLength),
      ageAtApplication: calcAge(dob),
      AgeAtMaturity: calcAgeAtMaturity(dob, installments),
    };

    // const payload = {
    //   EmployerType: 'GML',
    //   Nationality: 'Saudi',
    //   Gender: 'Male',
    //   FinanceAmt: String(requestedFinanceAmount),
    //   Tenure: '12',
    //   MonthlyIncome: '50000',
    //   lenOfService: '5',
    //   ageAtApplication: '28',
    //   AgeAtMaturity: '29',
    // };
      try {
        const res = await post(payload);
        if (res?.Data?.IsEligible) setResult('success');
        else setResult('fail');
      } catch (err) {
        console.error('FinanceCalculator error:', err);
        setMsg(
       dir=== 'ltr'
         ? 'حدث خطأ ما. يُرجى المحاولة مرة أخرى.'
       : 'Something went wrong. Please try again.'
     );
      } finally {
        setSubmitting(false);
      }
    // try {
    //   if (Number(payload.FinanceAmt) > 7000) {
    //     setResult('success');
    //   } else setResult('fail');
    // } catch (err) {
    //   console.error('FinanceCalculator error:', err);
    //   setMsg(
    //     dir === 'ltr'
    //       ? 'حدث خطأ ما. يُرجى المحاولة مرة أخرى.'
    //       : 'Something went wrong. Please try again.',
    //   );
    // } finally {
    //   setSubmitting(false);
    // }
  }

  if (result === 'success') {
   
  let title = '', desc = '', noteTitle = '', noteDesc = '',
      backText = '', primaryText = '', primaryHref = '#', iconUrl = '';

  title       = successMsg.title;
  desc        = successMsg.description;
  noteTitle   = successMsg.noteTitle;
  noteDesc    = successMsg.noteDescription;
  backText    = successMsg.backLabel;
  primaryText = successMsg.primaryLabel;
  primaryHref = successMsg.primaryUrl || '#';
  iconUrl     = successMsg.imageUrl || '/assets/success.png';

    return (
      <section className="w-full" dir={dir}>
        <div className="mx-auto max-w-[1240px] rounded-3xl bg-white mt-16 p-8 text-center">
          <div className="mx-auto mb-6 grid place-items-center">
            <img
              src={iconUrl}
              alt={successMsg.imageAlt || 'success'}
              className="h-24 w-24 object-contain"
            />
          </div>

          <h2 className="xs:text-[28px] md:text-[44px] font-semibold text-[#0B2A8E] mb-3">
            {title}
          </h2>
          <p
            className="text-[16px] md:text-[18px] text-[#333] max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: desc }}
          />

          <div className="mt-8 rounded-2xl border border-[#B9D7F2] bg-[#E9F5FF] p-4 text-[13px] text-[#0B4F84] max-w-4xl mx-auto">
            <div className="flex flex-col items-start gap-2">
              <div className="flex gap-2">
                <InfoIcon />
                <strong>{noteTitle}</strong>
              </div>
              <div>
                <p className="mt-1 ml-6">{noteDesc}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-full border border-[#0B2A8E] text-[#0B2A8E] px-6 py-3 text-[15px] hover:bg-[#0B2A8E]/5"
            >
              {backText}
            </button>
            <a
              href={primaryHref}
              className="rounded-full bg-[#0B2A8E] text-white px-6 py-3 text-[15px] hover:opacity-90"
            >
              {primaryText}
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (result === 'fail') {
  let title = '', sub = '', reasonsTitle = '',
      actionsTitle = '', footer = '', backText = '', iconUrl = '';
  let reasonsLeft: string[] = [];
  let actionsLeft: string[] = [];

  title         = failMsg.title;
  sub           = failMsg.description;
  reasonsTitle  = failMsg.reasonsTitle;
  reasonsLeft   = splitLines(failMsg.reasonsDescription);
  actionsTitle  = failMsg.actionsTitle;
  actionsLeft   = splitLines(failMsg.actionsDescription);
  footer        = failMsg.validationText;
  backText      = failMsg.backLabel;
  iconUrl       = failMsg.imageUrl || '/assets/failed.png';



    return (
      <section className="w-full" dir={dir}>
        <div className="mx-auto max-w-[1240px] rounded-3xl bg-white mt-16 p-8 text-center">
          <div className="mx-auto mb-6 grid place-items-center">
            <img
              src={iconUrl}
              alt={failMsg.imageAlt || 'not-eligible'}
              className="h-24 w-24 object-contain"
            />
          </div>

          <h2 className="text-[32px] md:text-[40px] font-semibold text-[#0B2A8E] mb-2">{title}</h2>
          <p
            className="text-[16px] md:text-[18px] text-[#333] max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: sub }}
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#F4F6FA] p-5 text-left">
              <strong className="block mb-3 text-[#0B2A8E]">{reasonsTitle}</strong>
              <ul className="list-disc pl-5 space-y-2 text-[#333]">
                {reasonsLeft.map((r, i) => (
                  <li key={`rL-${i}`}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-[#F4F6FA] p-5 text-left">
              {/* optional second column later */}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#F4F6FA] p-5 text-left">
              <strong className="block text-[#0B2A8E]">{actionsTitle}</strong>
              <ul className="list-disc pl-5 space-y-2 text-[#333] mt-3">
                {actionsLeft.map((t, i) => (
                  <li key={`tL-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-[#F4F6FA] p-5 text-left">
              {/* optional second column later */}
            </div>
          </div>

          <p className="mt-8 text-[#555]">{footer}</p>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-full border border-[#0B2A8E] text-[#0B2A8E] px-6 py-3 text-[15px] hover:bg-[#0B2A8E]/5"
            >
              {backText}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-[1240px] rounded-3xl bg-white mt-16 p-8 shadow-sm"
      >
        <h2 className="text-[28px] font-semibold text-[#0B2A8E]">
          {C.title || 'Enter your Finance details'}
        </h2>

        <div className="mt-4">
          <p className="text-[15px] font-medium text-gray-700">
            {C.labels?.nationality || 'Choose nationality'}
          </p>
          <div className="mt-2 flex items-center gap-6">
            {nationalityOptions.map((label) => {
              const val = /non/i.test(label) ? 'nonsaudi' : 'saudi';
              const checked = nationality === (val as Nationality);
              return (
                <label key={label} className="inline-flex items-center gap-2">
                  <input
                    required
                    type="radio"
                    name="nationality"
                    value={val}
                    checked={checked}
                    onChange={() => setNationality(val as Nationality)}
                    className="h-4 w-4 accent-[#0B2A8E]"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label={C.labels?.employerType || 'Employer Type'}>
            <Select
              value={employer}
              onChange={setEmployer}
              placeholder={C.labels?.employerPlaceholder || 'Select Employer Type'}
              options={employerOptions}
            />
          </Field>

          <Field label={C.labels?.dateOfBirth || 'Date of Birth'} tooltip={C.popups?.dateOfBirth}>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder={C.labels?.dateOfBirthPlaceholder || 'Day/Month/Year'}
              className="sf-input"
            />
          </Field>

          <Field
            label={C.labels?.lengthOfServices || 'Length of Services'}
            tooltip={C.popups?.lengthOfServices}
          >
            <Select
              value={serviceLength}
              onChange={setServiceLength}
              placeholder={C.labels?.lengthOfServicesPlaceholder || 'Select length'}
              options={lengthOptions}
            />
          </Field>

          <Field
            label={C.labels?.monthlySalary || 'Monthly Salary'}
            tooltip={C.popups?.monthlySalary}
          >
            <CurrencyInput
              value={salary}
              onChange={setSalary}
              placeholder={C.labels?.monthlySalaryPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <Field
            label={C.labels?.requestedAmount || 'Requested Finance Amount'}
            tooltip={C.popups?.requestedAmount}
          >
            <div className="space-y-2">
              <CurrencyInput
                value={requestedFinanceAmount}
                onChange={(v) => setRequestedFinanceAmount(clamp(Number(v || 0), AMIN, AMAX))}
                placeholder={C.labels?.requestedAmountPlaceholder || '0.00 ﷼'}
              />
              <div className="text-xs text-gray-500">
                {`Maximum eligible amount is ${formatSar(AMAX)} SAR`}
              </div>

              <input
                required
                type="range"
                min={AMIN}
                max={AMAX}
                step={ASTEP}
                value={requestedFinanceAmount}
                onChange={(e) =>
                  setRequestedFinanceAmount(clamp(Number(e.target.value), AMIN, AMAX))
                }
                className="sf-range"
                style={amountFill as any}
                aria-label="Requested amount"
              />
            </div>
          </Field>

          <Field
            label={C.labels?.installments || 'Number of Installments'}
            tooltip={C.popups?.installments}
          >
            <div className="space-y-2">
              <div className="sf-input cursor-default flex items-center">
                {installments} {C.labels?.installmentsPlaceholder || 'Months'}
              </div>
              <div className="text-xs text-gray-500">
                {`Maximum eligible installments is ${IMAX} months`}
              </div>
              <input
                required
                type="range"
                min={IMIN}
                max={IMAX}
                step={ISTEP}
                value={installments}
                onChange={(e) => setInstallments(clamp(Number(e.target.value), IMIN, IMAX))}
                className="sf-range"
                style={instFill as any}
                aria-label="Installments"
              />
            </div>
          </Field>

          <Field
            label={C.labels?.totalMonthlyExpenses || 'Total Monthly Expenses'}
            tooltip={C.popups?.totalMonthlyExpenses}
          >
            <CurrencyInput
              value={expenses}
              onChange={setExpenses}
              placeholder={C.labels?.totalMonthlyExpensesPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <Field
            label={C.labels?.mortgageLiabilities || 'Mortgage Liabilities'}
            tooltip={C.popups?.mortgageLiabilities}
          >
            <CurrencyInput
              value={mortgageLiabilities}
              onChange={setMortgageLiabilities}
              placeholder={C.labels?.mortgageLiabilitiesPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <Field
            label={C.labels?.monthlyFinancialLiabilities || 'Monthly Financial Liabilities'}
            tooltip={C.popups?.monthlyFinancialLiabilities}
          >
            <CurrencyInput
              value={monthlyFinancialLiabilities}
              onChange={setMonthlyFinancialLiabilities}
              placeholder={C.labels?.monthlyFinancialLiabilitiesPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <div className="md:col-span-2 mt-2 rounded-2xl border border-[#B9D7F2] bg-[#E9F5FF] p-4 text-[13px] text-[#0B4F84]">
            <div className="flex items-start gap-2">
              <InfoIcon />
              <div>
                <strong>{C.popups?.note?.title || 'Important Note'}</strong>
                <p className="mt-1">
                  {C.popups?.note?.description ||
                    'This calculation is for guidance only. The results do not constitute a final offer and have no legal effect.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--navy,#0B2A8E)] px-6 py-3 text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : C.cta?.text || 'Check your eligibility Now'}
            <span aria-hidden className="rtl:rotate-180">
              ➜
            </span>
          </button>
        </div>

        {msg && (
          <p className="mt-3 text-center text-sm text-red-600" role="status">
            {msg}
          </p>
        )}
      </form>

      <style>{`
        .sf-input{
          height:48px;width:100%;border-radius:1rem;border:1px solid #DFE3EA;background:#fff;
          padding:0 1rem;font-size:14px;outline:none;
        }
        .sf-range{
          -webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:9999px;background:#c9cdd6;outline:none;
        }
        .sf-range::-webkit-slider-thumb{
          -webkit-appearance:none;appearance:none;height:18px;width:18px;border-radius:9999px;background:#fff;border:3px solid #0b2a8e;
          box-shadow:0 0 0 3px rgba(11,42,142,.1);cursor:pointer;
        }
        .sf-range::-moz-range-thumb{
          height:18px;width:18px;border-radius:9999px;background:#fff;border:3px solid #0b2a8e;
          box-shadow:0 0 0 3px rgba(11,42,142,.1);cursor:pointer;
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="text-[13px] font-medium text-gray-700">{label}</label>
        {!!tooltip && (
          <Tooltip content={tooltip}>
            <InfoIcon className="text-[#0B4F84]" />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sf-input appearance-none pr-10"
      >
        <option value="" disabled>
          {placeholder || 'Select…'}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
        ▾
      </span>
    </div>
  );
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  placeholder?: string;
}) {
  return (
    <input
      required
      inputMode="decimal"
      value={value === '' ? '' : String(value)}
      onChange={(e) => {
        const v = e.target.value.replace(/[^\d.]/g, '');
        onChange(v === '' ? '' : Number(v));
      }}
      placeholder={placeholder || '0.00 ﷼'}
      className="sf-input"
    />
  );
}

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex items-center">
      {children}
      <span
        dangerouslySetInnerHTML={{ __html: content }}
        className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 w-[15rem] rounded-xl shadow-md bg-white p-4 text-xs text-black opacity-0 group-hover:block group-hover:opacity-100"
      ></span>
    </span>
  );
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="12" fill="#0052CC" />
      <rect x="11" y="10" width="2" height="6" fill="white" />
      <circle cx="12" cy="7" r="1.2" fill="white" />
    </svg>
  );
}

