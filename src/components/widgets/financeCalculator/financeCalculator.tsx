'use client';

import { useMemo, useState } from 'react';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { FinanceCalculatorEntity } from './financeCalculator.entity';

type Nationality = 'saudi' | 'nonsaudi';
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

export default function FinanceCalculator(props: WidgetContext<FinanceCalculatorEntity>) {
  const attrs = htmlAttributes(props);
  const cfg = props.model.Properties || ({} as FinanceCalculatorEntity);

  const AMIN = 1000,
    AMAX = 20000,
    ASTEP = 500,
    ADEF = 15000;
  const IMIN = 6,
    IMAX = 36,
    ISTEP = 1,
    IDEF = 24;

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    //temporary
    const payload = {
      nationality,
      employerType: employer || null,
      lengthOfServices: serviceLength,
      dateOfBirth: dob || null,
      monthlySalary: parseNum(salary),
      requestedAmount: requestedFinanceAmount,
      installments,
      totalMonthlyExpenses: parseNum(expenses),
      mortgageLiabilities: parseNum(mortgageLiabilities),
      monthlyFinancialLiabilities: parseNum(monthlyFinancialLiabilities),
    };

    console.log('FinanceCalculator payload:', payload);
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

          <Field
            label={cfg.DateOfBirthLabel || 'Date of Birth'}
            tooltip={cfg.DateOfBirthPopup}
            right
          >
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder={cfg.DateOfBirthPlaceholder || 'DD/MM/YYYY'}
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
            right
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
                style={amountFill}
                aria-label="Requested amount"
              />
            </div>
          </Field>

          <Field
            label={cfg.NumberOfInstallmentsLabel || 'Number of Installments'}
            tooltip={cfg.NumberOfInstallmentsPopup}
            right
          >
            <div className="space-y-2">
              <div className="sf-input cursor-default">
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
                style={instFill}
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
            right
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
  right,
  children,
}: {
  label: string;
  tooltip?: string;
  right?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className={`mb-2 flex items-center ${right ? 'justify-between' : 'gap-2'}`}>
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
      <span className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:block group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

