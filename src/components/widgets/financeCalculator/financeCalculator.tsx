'use client';

import { useMemo, useState } from 'react';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { FinanceCalculatorEntity } from './financeCalcualtor.entity';

type Nationality = 'saudi' | 'nonsaudi';

export default function FinanceCalculator(props: WidgetContext<FinanceCalculatorEntity>) {
  const attrs = htmlAttributes(props);
  const cfg = props.model.Properties;
  const title = cfg.Title || 'Enter your Finance details';

  const AMIN = Number(cfg.AmountMin ?? 1000);
  const AMAX = Number(cfg.AmountMax ?? 20000);
  const ASTEP = Number(cfg.AmountStep ?? 500);
  const ADEF = clampNumber(Number(cfg.AmountDefault ?? 15000), AMIN, AMAX);

  const IMIN = Number(cfg.InstallmentsMin ?? 6);
  const IMAX = Number(cfg.InstallmentsMax ?? 36);
  const ISTEP = Number(cfg.InstallmentsStep ?? 1);
  const IDEF = clampNumber(Number(cfg.InstallmentsDefault ?? 24), IMIN, IMAX);

  const [nationality, setNationality] = useState<Nationality>('saudi');
  const [employer, setEmployer] = useState('');
  const [serviceLength, setServiceLength] = useState('3 Months');
  const [dob, setDob] = useState('');
  const [salary, setSalary] = useState<number | ''>('');
  const [requestedFinanceAmount, setRequestedFinanceAmount] = useState<number>(ADEF);
  const [installments, setInstallments] = useState<number>(IDEF);
  const [expenses, setExpenses] = useState<number | ''>('');
  const [mortgageLiabilities, setMortgageLiabilities] = useState<number | ''>('');
  const [monthlyFinancialLiabilities, setMonthlyFinancialLiabilities] = useState<number | ''>('');

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');

  //for sliders
  const requestedAmountFill = useRangeFill(
    requestedFinanceAmount,
    AMIN,
    AMAX,
    '#0B2A8E',
    '#C9CDD6',
  );
  const installmentsFill = useRangeFill(installments, AMIN, AMAX, '#0B2A8E', '#C9CDD6');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
  }
  const financeCalculatorPayload = {
    nationality,
    employerType: employer || null,
    lengthOfSerices: serviceLength,
    dateOfBirth: dob || null,
    monthlySalary: parseNum(salary),
    requestedAmount: requestedFinanceAmount,
    installments,
    totalMonthlyExpenses: parseNum(expenses),
    mortgageLiabilites: parseNum(mortgageLiabilities),
    monthlyFinancialLiabilities: parseNum(monthlyFinancialLiabilities),
  };
  // POST request to API here
  console.log(attrs);
  return (
    <section {...attrs} className="w-full">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-[1120px] rounded-3xl bg-white p-6 shadow-sm"
      >
        <h2 className="text-[28px] font-semibold text-[#0B2A8E]">{title}</h2>
        <div className="mt-4">
          <p className="text-[15px] font-medium text-gray-700">Choose Nationality</p>
          <div className="mt-2 flex items-center gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="nationality"
                value="saudi"
                checked={nationality === 'saudi'}
                onChange={() => setNationality('saudi')}
                className="h-4 w-4 accent-[#0B2A8E]"
              />
              <span>Saudi</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="nationality"
                value="nonsaudi"
                checked={nationality === 'nonsaudi'}
                onChange={() => setNationality('nonsaudi')}
                className="h-4 w-4 accent-[#0B2A8E]"
              />
            </label>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Employer Type" tooltip>
            <Select
              value={employer}
              onChange={setEmployer}
              placeholder="Select Employer Type"
              options={['Option 1', 'Option 2', 'Option 3']}
            />
          </Field>
          <Field label="Date of Birth" tooltip right>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="sf-input"
            ></input>
          </Field>
          <Field label="Length of Services" tooltip>
            <Select
              value={serviceLength}
              onChange={setServiceLength}
              placeholder="3 Months"
              options={['3 Months', '6 Months', '1 Year', '2 Years', '3+ Years']}
            />
          </Field>
          <Field label="Monthly Salary" tooltip right>
            <CurrencyInput value={salary} onChange={setSalary} placeholder="0.00 ﷼" />
          </Field>
          <Field label="Requested Finance Amount" tooltip>
            <div className="space-y-2">
                <CurrencyInput 
                    value={requestedAmountFill} onChange={(v)=>setRequestedFinanceAmount(clampNumber(Number(v||0), AMIN, AMAX))}
                    placeholder ="0.00 ﷼"/>
            </div>
            <div className = "text-xs text-gray-500">
                Maximum elgibile amount is {formatSar(AMAX)} SAR
            </div>
            <input type="range" min={AMIN} max={AMAX} step={ASTEP} value={requestedAmountFill} onChange={(e) => setRequestedFinanceAmount}
          </Field>
        </div>
      </form>
    </section>
  );
}

