'use client';

import { useMemo, useState } from 'react';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { FinanceCalculatorEntity } from './financeCalculator.entity';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';

type Nationality = 'saudi' | 'nonsaudi';
type ResultState = null | 'success' | 'fail';
const MSG_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.Message.Message';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const parseNum = (v: number | '') => (v === '' ? null : Number(v));
const formatSar = (n: number) =>
  new Intl.NumberFormat('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function useRangeFill(value: number, min: number, max: number, fill: string, rest: string) {
  const pct = useMemo(() => ((value - min) * 100) / (max - min), [value, min, max]);
  return useMemo(
    () => ({ background: `linear-gradient(90deg, ${fill} ${pct}%, ${rest} ${pct}%)` }),
    [pct, fill, rest],
  );
}

const splitList = (v?: string) =>
  (v || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

type LinkLike = string | { Href?: string } | Array<{ Href?: string }>;
type MediaLike = any | any[];

type Message = {
  Title?: string;
  Description?: string;
  NoteTitle?: string;
  NoteDescription?: string;

  ExploreLabel?: string;
  DownloadLabel?: string;
  ExploreUrl?: LinkLike;
  BackLabel?: string;
  BackUrl?: LinkLike;

  ValidationText?: string;
  Image?: MediaLike;
  DownloadUrl?: MediaLike;

  ReasonsTitle?: string;
  ReasonsDescription?: string;
  ActionsTitle?: string;
  ActionsDescription?: string;
};

function getHref(v?: LinkLike): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.find((x) => x?.Href)?.Href || undefined;
  return v.Href || undefined;
}

function getMediaUrl(m?: MediaLike): string | undefined {
  const x = Array.isArray(m) ? m[0] : m;
  return (
    x?.Url ||
    x?.MediaUrl ||
    x?.ThumbnailUrl ||
    (Array.isArray(x?.Urls) ? x.Urls[0] : undefined) ||
    x?.EmbedUrl ||
    undefined
  );
}

const lines = (v?: string) =>
  (v || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

export default function FinanceCalculator(props: WidgetContext<FinanceCalculatorEntity>) {
  const attrs = htmlAttributes(props);
  const cfg = props.model.Properties || ({} as FinanceCalculatorEntity);
  const { post } = useSfMutation('api/default/eligibility/get');

  console.log('CFG:', cfg);

  const successMsg = (cfg as any).SuccessMessage as Message | undefined;
  const failMsg = (cfg as any).FailMessage as Message | undefined;

  console.log('SSSSSSS:', successMsg);
  console.log('ffffffff:', failMsg);
  console.log(successMsg?.Title);

  const AMIN = 1000,
    AMAX = 20000,
    ASTEP = 500,
    ADEF = 15000;
  const IMIN = 6,
    IMAX = 36,
    ISTEP = 1,
    IDEF = 24;

  const [result, setResult] = useState<ResultState>(null);
  const [nationality, setNationality] = useState<Nationality>('saudi');
  const [employer, setEmployer] = useState('');
  const [serviceLength, setServiceLength] = useState(
    cfg.LengthOfServicesChoices?.[0] ?? '3 Months',
  );
  const [dob, setDob] = useState('');
  const [salary, setSalary] = useState<number | ''>('');
  const [requestedFinanceAmount, setRequestedFinanceAmount] = useState<number>(ADEF);
  const [installments, setInstallments] = useState<number>(IDEF);
  const [expenses, setExpenses] = useState<number | ''>('');
  const [mortgageLiabilities, setMortgageLiabilities] = useState<number | ''>('');
  const [monthlyFinancialLiabilities, setMonthlyFinancialLiabilities] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const amountFill = useRangeFill(requestedFinanceAmount, AMIN, AMAX, '#0B2A8E', '#C9CDD6');
  const instFill = useRangeFill(installments, IMIN, IMAX, '#0B2A8E', '#C9CDD6');
function calcAge(dob: string) {
  if (!dob) return '';
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return String(age);
}

function calcAgeAtMaturity(dob: string, tenureMonths: number) {
  if (!dob) return '';
  const d = new Date(dob);
  const maturity = new Date(d);
  maturity.setMonth(maturity.getMonth() + Number(tenureMonths || 0));
  return calcAge(maturity.toISOString().slice(0,10));
}

function mapLenOfService(choice: string) {
  const m = /(\d+)/.exec(choice || '');
  return m ? m[1] : '';
}
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
    //   FinanceAmt: 0,
    //   Tenure: '12',
    //   MonthlyIncome: 0,
    //   lenOfService: 0,
    //   ageAtApplication: 0,
    //   AgeAtMaturity: 0,
    // };

    console.log('FinanceCalculator payload:', payload);

    try {
      const res = await post(payload);
      console.log('FinanceCalculator response:', res);

      if (res?.Data?.IsEligible) {
        setResult('success');
      } else {
        setResult('fail');
      }
    } catch (err) {
      console.error('FinanceCalculator error:', err);
    } finally {
      setSubmitting(false);
    }

    // setTimeout(() => {
    //   setSubmitting(false);
    //   setResult(requestedFinanceAmount >= 15000 ? 'success' : 'fail');
    // }, 400);
  }

  const nationalityOptions = cfg.NationalityChoices?.length
    ? cfg.NationalityChoices
    : (['Saudi', 'Non-Saudi'] as string[]);

  const employerOptions = cfg.EmployerChoices?.length
    ? cfg.EmployerChoices
    : ['Government', 'Semi-government', 'Private'];

  const lengthOptions = cfg.LengthOfServicesChoices?.length
    ? cfg.LengthOfServicesChoices
    : ['3 Months', '6 Months', '1 Year', '2 Years', '3+ Years'];

  if (result === 'success') {
    const iconUrl = getMediaUrl(successMsg?.Image) || '/assets/success.png';
    const title = successMsg?.Title || 'You are Eligible for Our Financing';
    const desc =
      successMsg?.Description ||
      'Based on the information you provided, you are preliminarily eligible for financing. Complete your registration now to discover your tailored offer!';
    const noteTitle = successMsg?.NoteTitle || 'Important Note';
    const noteDesc =
      successMsg?.NoteDescription ||
      'The eligible amount is an estimate and may change based on the confirmation of your salary and credit score.';
    const backText = successMsg?.BackLabel || 'Back to Calculator';
    const primaryText = successMsg?.ExploreLabel || 'Download Our App';
    const primaryHref = getHref(successMsg?.ExploreUrl) || '#';

    return (
      <section {...attrs} className="w-full">
        <div className="mx-auto max-w-[1120px] rounded-3xl bg-white p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 grid place-items-center">
            <img src={iconUrl} alt="success" className="h-24 w-24 object-contain" />
          </div>
          <h2 className="text-[36px] md:text-[44px] font-semibold text-[#0B2A8E] mb-3">{title}</h2>
          <p className="text-[16px] md:text-[18px] text-[#333] max-w-3xl mx-auto">{desc}</p>

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
    const iconUrl = getMediaUrl(failMsg?.Image) || '/assets/failed.png';
    const title = failMsg?.Title || 'Not Eligible Yet';
    const sub =
      failMsg?.Description ||
      'Unfortunately, we are unable to proceed with your application at this time.';

    const reasonsTitle =
      failMsg?.ReasonsTitle || 'This could be due to one or more of the following reasons:';
    const reasonsLeft = lines(failMsg?.ReasonsDescription) || [
      'Your verified information does not meet our internal policy requirements.',
      'Your current financial obligations are too high for us to offer a loan at this time.',
    ];
    const reasonsRight = ['Your credit history does not currently meet our eligibility criteria.'];

    const actionsTitle = failMsg?.ActionsTitle || 'But don’t worry — this isn’t permanent!';
    const actionsSub = 'Here’s what you can do:';
    const actionsLeft = lines(failMsg?.ActionsDescription) || [
      'Use Go Money regularly',
      'Repay any pending dues',
    ];
    const actionsRight = ['Try again in 30 days'];
    const footer = failMsg?.ValidationText || 'We’re here when you’re ready.';
    const backText = failMsg?.BackLabel || 'Back to Calculator';

    return (
      <section {...attrs} className="w-full">
        <div className="mx-auto max-w-[1120px] rounded-3xl bg-white p-8 md:p-12 text-center">
          <div className="mx-auto mb-6 grid place-items-center">
            <img src={iconUrl} alt="not-eligible" className="h-24 w-24 object-contain" />
          </div>
          <h2 className="text-[32px] md:text-[40px] font-semibold text-[#0B2A8E] mb-2">{title}</h2>
          <p className="text-[16px] md:text-[18px] text-[#333] max-w-3xl mx-auto">{sub}</p>

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
              <ul className="list-disc pl-5 space-y-2 text-[#333]">
                {reasonsRight.map((r, i) => (
                  <li key={`rR-${i}`}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#F4F6FA] p-5 text-left">
              <strong className="block text-[#0B2A8E]">{actionsTitle}</strong>
              <span className="block text-[#333] mb-3">{actionsSub}</span>
              <ul className="list-disc pl-5 space-y-2 text-[#333]">
                {actionsLeft.map((t, i) => (
                  <li key={`tL-${i}`}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-[#F4F6FA] p-5 text-left">
              <ul className="list-disc pl-5 space-y-2 text-[#333]">
                {actionsRight.map((t, i) => (
                  <li key={`tR-${i}`}>{t}</li>
                ))}
              </ul>
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
    <section {...attrs} className="w-full">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-[1120px] rounded-3xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-[28px] font-semibold text-[#0B2A8E]">
          {cfg.Title || 'Enter your Finance details'}
        </h2>

        <div className="mt-4">
          <p className="text-[15px] font-medium text-gray-700">
            {cfg.NationalityLabelChoices || 'Choose nationality'}
          </p>
          <div className="mt-2 flex items-center gap-6">
            {nationalityOptions.map((label) => {
              const val = /non/i.test(label) ? 'nonsaudi' : 'saudi';
              const checked = nationality === val;
              return (
                <label key={label} className="inline-flex items-center gap-2">
                  <input
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
          <Field label={cfg.EmployerTypeLabel || 'Employer Type'} tooltip={cfg.EmployerTypePopup}>
            <Select
              value={employer}
              onChange={setEmployer}
              placeholder={cfg.EmployerPlaceholder || 'Select Employer Type'}
              options={employerOptions}
            />
          </Field>

          <Field label={cfg.DateOfBirthLabel || 'Date of Birth'} tooltip={cfg.DateOfBirthPopup}>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder={cfg.DateOfBirthPlaceholder || 'Day/Month/Year'}
              className="sf-input"
            />
          </Field>

          <Field
            label={cfg.LengthOfServicesLabel || 'Length of Services'}
            tooltip={cfg.LengthOfServicesPopup}
          >
            <Select
              value={serviceLength}
              onChange={setServiceLength}
              placeholder={cfg.LengthOfServicesPlaceholder || 'Select length'}
              options={lengthOptions}
            />
          </Field>

          <Field
            label={cfg.MonthlySalaryLabel || 'Monthly Salary'}
            tooltip={cfg.MonthlySalaryPopup}
          >
            <CurrencyInput
              value={salary}
              onChange={setSalary}
              placeholder={cfg.MonthlySalaryPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <Field
            label={cfg.RequestedFinanceAmountLabel || 'Requested Finance Amount'}
            tooltip={cfg.RequestedFinanceAmountPopup}
          >
            <div className="space-y-2">
              <CurrencyInput
                value={requestedFinanceAmount}
                onChange={(v) => setRequestedFinanceAmount(clamp(Number(v || 0), AMIN, AMAX))}
                placeholder={cfg.RequestedFinanceAmountPlaceholder || '0.00 ﷼'}
              />
              <div className="text-xs text-gray-500">
                {cfg.RequestedFinanceAmountValidation ||
                  `Maximum eligible amount is ${formatSar(AMAX)} SAR`}
              </div>
              <input
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
            label={cfg.NumberOfInstallmentsLabel || 'Number of Installments'}
            tooltip={cfg.NumberOfInstallmentsPopup}
          >
            <div className="space-y-2">
              <div className="sf-input cursor-default flex  items-center">
                {installments} {cfg.NumberOfInstallmentsPlaceholder || 'Months'}
              </div>
              <div className="text-xs text-gray-500">
                {cfg.NumberOfInstallmentsValidation ||
                  `Maximum eligible installments is ${IMAX} months`}
              </div>
              <input
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
            label={cfg.TotalMonthlyExpensesLabel || 'Total Monthly Expenses'}
            tooltip={cfg.TotalMonthlyExpensesPopup}
          >
            <CurrencyInput
              value={expenses}
              onChange={setExpenses}
              placeholder={cfg.TotalMonthlyExpensesPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <Field
            label={cfg.MortgageLiabilitiesLabel || 'Mortgage Liabilities'}
            tooltip={cfg.MortgageLiabilitiesPopup}
          >
            <CurrencyInput
              value={mortgageLiabilities}
              onChange={setMortgageLiabilities}
              placeholder={cfg.MortgageLiabilitiesPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <Field
            label={cfg.MonthlyFinancialLiabilitiesLabel || 'Monthly Financial Liabilities'}
            tooltip={cfg.MonthlyFinancialLiabilitiesPopup}
          >
            <CurrencyInput
              value={monthlyFinancialLiabilities}
              onChange={setMonthlyFinancialLiabilities}
              placeholder={cfg.MonthlyFinancialLiabilitiesPlaceholder || '0.00 ﷼'}
            />
          </Field>

          <div className="md:col-span-2 mt-2 rounded-2xl border border-[#B9D7F2] bg-[#E9F5FF] p-4 text-[13px] text-[#0B4F84]">
            <div className="flex items-start gap-2">
              <InfoIcon />
              <div>
                <strong>{cfg.NoteTitle || 'Important Note'}</strong>
                <p className="mt-1">
                  {cfg.NoteDescription ||
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
            {submitting ? 'Submitting…' : cfg.CtaText || 'Check your eligibility Now'}
            <span aria-hidden>➜</span>
          </button>
        </div>

        {msg && (
          <p className="mt-3 text-center text-sm text-gray-700" role="status">
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
      <div className={`mb-2 flex items-center gap-2`}>
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
      <span className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 w-[15rem] rounded-xl shadow-md bg-white p-4 text-xs text-black opacity-0 group-hover:block group-hover:opacity-100">
        {content}
      </span>
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

