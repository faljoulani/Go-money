'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';

type Nationality = 'saudi' | 'nonsaudi';
type ResultState = null | 'success' | 'fail';

type Choice = { id: string; title: string; value: string };
type LinkLike = string | { Href?: string } | Array<{ Href?: string }>;

type Message = {
  id?: string;
  title?: string;
  description?: string;
  note?: { title?: string; description?: string };
  actions?: {
    explore?: { label?: string; url?: string };
    download?: { label?: string; url?: string };
    back?: { label?: string; url?: string };
  };
  validationText?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export default function FinanceCalculatorClient({ cfg }: { cfg: any }) {
  const C = cfg ?? {};
  const { post } = useSfMutation('api/default/eligibility/get');

  console.log('FinanceCalculator cfg', C);
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

  const lines = (v?: string) =>
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

  // ---- constants ----
  const AMIN = 1000,
    AMAX = 20000,
    ASTEP = 500,
    ADEF = 15000;
  const IMIN = 6,
    IMAX = 36,
    ISTEP = 1,
    IDEF = 24;

  // ---- options from cfg.choices ----
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

  const messages: Message[] = Array.isArray(C.messages) ? C.messages : [];
  const successMsg =
    messages.find((m) => /eligible/i.test(m.title || '')) ||
    messages.find((m) => /success/i.test(m.title || ''));
  const failMsg =
    messages.find((m) => /not\s*eligible|ineligible/i.test(m.title || '')) ||
    messages.find((m) => /fail|sorry/i.test(m.title || ''));

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

    try {
      const res = await post(payload);
      if (res?.Data?.IsEligible) setResult('success');
      else setResult('fail');
    } catch (err) {
      console.error('FinanceCalculator error:', err);
      setMsg('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }
  const Dir = useDir();
  if (result === 'success') {
    // Prepare variables for use in JSX below
    // let m: Message;
    let title: string;
    let desc: string;
    let noteTitle: string;
    let noteDesc: string;
    let backText: string;
    let primaryText: string;
    let primaryHref: string;
    let iconUrl: string;

    if (Dir === 'ltr') {
      // m = (successMsg as Message) || {};
      title = successMsg.title || 'You are Eligible for Our Financing';
      desc =
        successMsg.description ||
        'Based on the information you provided, you are preliminarily eligible for financing. Complete your registration now to discover your tailored offer!';
      noteTitle = successMsg.note?.title || 'Important Note';
      noteDesc =
        successMsg.note?.description ||
        'The eligible amount is an estimate and may change based on the confirmation of your salary and credit score.';
      backText = successMsg.actions?.back?.label || 'Back to Calculator';
      primaryText = successMsg.actions?.explore?.label || 'Download Our App';
      primaryHref = successMsg.actions?.explore?.url || '#';
      iconUrl = successMsg.imageUrl || '/assets/success.png';
    } else {
      // m = (successMsg as Message) || {};
      title = successMsg.title || 'أنت مؤهل للحصول على تمويلنا';
      desc =
        successMsg.description ||
        'استنادًا إلى المعلومات التي قدمتها، أنت مؤهل مبدئيًا للحصول على التمويل. أكمل تسجيلك الآن لاكتشاف العرض المصمم خصيصًا لك!';
      noteTitle = successMsg.note?.title || 'ملاحظة مهمة';
      noteDesc =
        successMsg.note?.description ||
        'المبلغ المؤهل هو تقديري وقد يتغير بناءً على تأكيد راتبك وتقييمك الائتماني.';
      backText = successMsg.actions?.back?.label || 'العودة إلى الحاسبة';
      primaryText = successMsg.actions?.explore?.label || 'حمّل تطبيقنا';
      primaryHref = successMsg.actions?.explore?.url || '#';
      iconUrl = successMsg.imageUrl || '/assets/success.png';
    }

    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1240px] rounded-3xl bg-white mt-16 p-8 text-center">
          <div className="mx-auto mb-6 grid place-items-center">
            <img
              src={iconUrl}
              alt={successMsg.imageAlt || 'success'}
              className="h-24 w-24 object-contain"
            />
          </div>
          <h2 className="xs:text-[28px] md:text-[44px] font-semibold text-[#0B2A8E] mb-3">{title}</h2>
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
    // let m: Message;
    let title: string;
    let sub: string;
    let reasonsTitle: string;
    let reasonsLeft: string[];
    let reasonsRight: string[];
    let actionsTitle: string;
    let actionsSub: string;
    let actionsLeft: string[];
    let actionsRight: string[];
    let footer: string;
    let backText: string;
    let iconUrl: string;

    if (Dir === 'ltr') {
      // m = (successMsg as Message) || {};
      title = failMsg?.title || 'Not Eligible Yet';
      sub =
        failMsg?.description ||
        'Unfortunately, we are unable to proceed with your application at this time.';
      reasonsTitle =
        failMsg?.note?.title || 'This could be due to one or more of the following reasons:';
      reasonsLeft = lines(failMsg?.note?.description) || [
        'Your verified information does not meet our internal policy requirements.',
        'Your current financial obligations are too high for us to offer a loan at this time.',
      ];
      reasonsRight = ['Your credit history does not currently meet our eligibility criteria.'];
      actionsTitle = failMsg?.actions?.explore?.label || 'But don’t worry — this isn’t permanent!';
      actionsSub = 'Here’s what you can do:';
      actionsLeft = ['Use Go Money regularly', 'Repay any pending dues'];
      actionsRight = ['Try again in 30 days'];
      footer = failMsg?.validationText || 'We’re here when you’re ready.';
      backText = failMsg?.actions?.back?.label || 'Back to Calculator';
      iconUrl = failMsg?.imageUrl || '/assets/failed.png';
    } else {
      // m = (successMsg as Message) || {};
      title = failMsg?.title || 'غير مؤهل حالياً';
      sub = failMsg?.description || 'للأسف، لا يمكننا متابعة طلبك في الوقت الحالي.';
      reasonsTitle = failMsg?.note?.title || 'قد يكون ذلك بسبب واحد أو أكثر من الأسباب التالية:';
      reasonsLeft = lines(failMsg?.note?.description) || [
        'المعلومات التي تم التحقق منها لا تتوافق مع متطلبات السياسات الداخلية لدينا.',
        'الالتزامات المالية الحالية الخاصة بك مرتفعة جدًا بحيث لا يمكننا تقديم قرض حالياً.',
      ];
      reasonsRight = ['سجلك الائتماني لا يفي حاليًا بمعايير الأهلية لدينا.'];
      actionsTitle = failMsg?.actions?.explore?.label || 'لا تقلق — هذا ليس دائماً!';
      actionsSub = 'إليك ما يمكنك فعله:';
      actionsLeft = ['استخدم Go Money بانتظام', 'سدّد أي مستحقات معلقة'];
      actionsRight = ['حاول مرة أخرى خلال 30 يومًا'];
      footer = failMsg?.validationText || 'سنكون هنا عندما تكون مستعدًا.';
      backText = failMsg?.actions?.back?.label || 'العودة إلى الحاسبة';
      iconUrl = failMsg?.imageUrl || '/assets/failed.png';
    }

    return (
      <section className="w-full">
        <div className="mx-auto max-w-[1240px] rounded-3xl bg-white mt-16 p-8 text-center">
          <div className="mx-auto mb-6 grid place-items-center">
            <img
              src={iconUrl}
              alt={failMsg?.imageAlt || 'not-eligible'}
              className="h-24 w-24 object-contain"
            />
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
                {C.validation?.requestedAmount ||
                  `Maximum eligible amount is ${formatSar(AMAX)} SAR`}
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
                {C.validation?.installments || `Maximum eligible installments is ${IMAX} months`}
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

