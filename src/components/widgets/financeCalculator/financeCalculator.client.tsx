'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSfMutation } from '../../../utils/hooks/useSfMutation';
import { SuccessResponse, FailResponse, type ResponseMessage } from './responseMessage';
import clsx from 'clsx';

type Nationality = 'Saudi' | 'Non-Saudi';
type ResultState = null | 'success' | 'fail';

type Choice = { id: string; title: string; value: string };
type LinkLike = string | { Href?: string } | Array<{ Href?: string }>;

function useOutsideClose<T extends HTMLElement>(
  open: boolean,
  ref: React.RefObject<T>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, ref, onClose]);
}

export default function FinanceCalculatorClient({ cfg, lang }: { cfg: any; lang: string }) {
  const C = cfg ?? {};
  const dir: 'rtl' | 'ltr' = lang?.startsWith('ar') ? 'rtl' : 'ltr';
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const root = formRef.current;
    if (!root) return;

    const replaceAttrs = (el: Element) => {
      const a = el as HTMLInputElement | HTMLTextAreaElement | HTMLElement;

      if ('placeholder' in a && a.placeholder) a.placeholder = normalizeCurrencyText(a.placeholder);
      if (a.title) a.title = normalizeCurrencyText(a.title);
      const aria = a.getAttribute('aria-label');
      if (aria) a.setAttribute('aria-label', normalizeCurrencyText(aria));

      if (a instanceof HTMLElement) {
        if (
          ['LABEL', 'SMALL', 'SPAN', 'DIV', 'P'].includes(a.tagName) &&
          a.childElementCount === 0
        ) {
          const t = a.textContent ?? '';
          const newT = normalizeCurrencyText(t);
          if (newT !== t) a.textContent = newT;
        }
      }
    };

    root.querySelectorAll('input, textarea, label, small, span, p, div').forEach(replaceAttrs);

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === 'attributes' && m.target) replaceAttrs(m.target as Element);
        if (m.type === 'childList') {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === 1) {
              const el = n as Element;
              replaceAttrs(el);
              el.querySelectorAll('input, textarea, label, small, span, p, div').forEach(
                replaceAttrs,
              );
            }
          });
        }
      }
    });
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label'],
    });
    return () => mo.disconnect();
  }, [dir]);

  const { post } = useSfMutation('api/default/eligibility/get');

  function normalizeNationality(input: string): Nationality {
    const s = (input || '').trim();

    if (/non/i.test(s) || /غير\s*سعود[ىي]/i.test(s)) return 'Non-Saudi';

    if (/saud/i.test(s) || /سعود[ىي]/i.test(s)) return 'Saudi';

    return 'Saudi';
  }
  function normalizeCurrencyText(s: string) {
    if (!s) return s;
    return s.replace(SAR_ONLY, RIYAL_SYMBOL).replace(RIYAL_ONLY, RIYAL_SYMBOL);
  }
  const roundToStep = (n: number, step: number) => Math.round(n / step) * step;
  const clampStep = (n: number, min: number, max: number, step: number) =>
    clamp(roundToStep(n, step), min, max);
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const parseNum = (v: number | '') => (v === '' ? null : Number(v));
  const formatSar = (n: number) => new Intl.NumberFormat('en-SA').format(n);
  const MIN_AGE = 21;
  const MAX_AGE = 70;
  const MAX_MATURITY_AGE = 150;
  const RIYAL_SYMBOL = '\u{FDFC}';

  const SAR_ONLY = /\bSAR\b/gi;

  const RIYAL_ONLY = /(?<!\p{Script=Arabic})ريال(?!\p{Script=Arabic})/gu;

  const t = (en: string, ar: string) => (dir === 'ltr' ? en : ar);

  function validateAges(dobStr: string, tenureMonths: number) {
    if (!dobStr) return t('Enter your date of birth.', 'أدخل تاريخ الميلاد.');
    const dob = new Date(dobStr);
    const now = new Date();
    if (Number.isNaN(dob.getTime()))
      return t('Enter a valid date of birth.', 'أدخل تاريخ ميلاد صالحًا.');
    if (dob > now)
      return t(
        'Date of birth cannot be in the future.',
        'لا يمكن أن يكون تاريخ الميلاد في المستقبل.',
      );

    const appAge = Number(calcAge(dobStr));
    const matAge = Number(calcAgeAtMaturity(dobStr, tenureMonths));

    if (appAge < MIN_AGE)
      return t(
        `You must be at least ${MIN_AGE} years old.`,
        `يجب ألا يقل عمرك عن ${MIN_AGE} عامًا.`,
      );
    if (appAge > MAX_AGE)
      return t(
        `You must be at maximum ${MAX_AGE} years old.`,
        `يجب ألا يزيد عمرك عن ${MAX_AGE} عامًا.`,
      );
    if (matAge > MAX_MATURITY_AGE)
      return t(
        `Your age at the end of the financing cannot exceed ${MAX_MATURITY_AGE} years.`,
        `يجب ألا يزيد عمرك عند نهاية التمويل عن ${MAX_MATURITY_AGE} عامًا.`,
      );

    return null;
  }
  function apiErrorMessage() {
    return t(
      'We couldn’t submit your request right now. Please try again.',
      'تعذّر إرسال طلبك الآن. يُرجى المحاولة مرة أخرى.',
    );
  }
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
    !v
      ? undefined
      : typeof v === 'string'
        ? v
        : Array.isArray(v)
          ? v.find((x) => x?.Href)?.Href
          : ((v as any).Href ?? (v as any).url ?? undefined);

  const getMediaUrl = (m?: any) =>
    m?.Url ||
    m?.MediaUrl ||
    m?.ThumbnailUrl ||
    (Array.isArray(m?.Urls) && m.Urls[0]) ||
    m?.imageUrl ||
    undefined;

  type RawMessage = any;

  function mapMessage(raw: RawMessage): ResponseMessage {
    const title = raw?.Title ?? raw?.title ?? '';
    const description = raw?.Description ?? raw?.description ?? '';

    const noteTitle = raw?.NoteTitle ?? raw?.note?.title ?? '';
    const noteDescription = raw?.NoteDescription ?? raw?.note?.description ?? '';

    const primaryLabel = raw?.ExploreLabel ?? raw?.actions?.explore?.label ?? '';
    const primaryUrl = getHref(raw?.ExploreUrl ?? raw?.actions?.explore?.url);

    const downloadLabel = raw?.DownloadLabel ?? raw?.actions?.download?.label ?? '';
    const downloadUrl = getHref(raw?.DownloadUrl ?? raw?.actions?.download?.url);

    const backLabel = raw?.BackLabel ?? raw?.actions?.back?.label ?? '';
    const backUrl = getHref(raw?.BackUrl ?? raw?.actions?.back?.url);

    const validationText = raw?.ValidationText ?? raw?.validationText ?? '';

    const imageUrl = getMediaUrl(raw?.Image ?? raw);
    const imageAlt = raw?.Image?.AlternativeText ?? raw?.Image?.Title ?? raw?.imageAlt ?? title;

    const reasonsTitle = raw?.ReasonsTitle ?? raw?.reasonsTitle ?? '';
    const reasonsDescription = raw?.ReasonsDescription ?? raw?.reasonsDescription ?? '';
    const actionsTitle = raw?.ActionsTitle ?? raw?.actionsTitle ?? '';
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

  const AMIN = C.labels.minimumFinanceAmount,
    AMAX = C.labels.maximumFinanceAmount,
    ASTEP = 100,
    ADEF = Math.trunc((AMIN + AMAX) / 2);
  const IMIN = C.labels.minimumEligibleInstallments,
    IMAX = C.labels.maximumEligibleInstallments,
    ISTEP = 1,
    IDEF = Math.trunc((IMIN + IMAX) / 2);

  const employerSectorChoices: Choice[] = C.choices?.employerSectorChoices ?? [];
  const employerChoices: Choice[] = C.choices?.employerTypes ?? [];
  const lengthChoices: Choice[] = C.choices?.lengthOfServices ?? [];
  const nationalityChoices: Choice[] = C.choices?.nationalities ?? [];

  const employerSectorOptions: Choice[] = employerSectorChoices.length
    ? employerSectorChoices
    : [
        { id: 'GOVERNMENT', title: 'Government', value: 'GOVERNMENT' },
        { id: 'PRV', title: 'Private', value: 'PRV' },
        { id: 'PNS', title: 'Retired', value: 'PNS' },
      ];

  const employerOptions: Choice[] = employerChoices.length
    ? employerChoices
    : [
        { id: 'GOV', title: 'Civilian', value: 'GOV' },
        { id: 'GML', title: 'Military', value: 'GML' },
        { id: 'MOE', title: 'Ministry Of Education', value: 'MOE' },
        { id: 'SMG', title: 'Semi Government', value: 'SMG' },
      ];

  const lengthOptions: Choice[] = lengthChoices.length
    ? lengthChoices
    : [
        { id: '3', title: 'Less than 3 Months', value: '3' },
        { id: '6', title: '3 - 6 Months', value: '6' },
        { id: '12', title: 'More than 6 Months', value: '12' },
      ];

  const nationalityOptions = nationalityChoices.length
    ? nationalityChoices.map((c) => c.title)
    : (['Saudi', 'Non-Saudi'] as string[]);

  // ---- state ----
  const [result, setResult] = useState<ResultState>(null);
  const [nationality, setNationality] = useState<Nationality>('Saudi');
  const [employerSector, setEmployerSector] = useState<string>(
    employerSectorOptions[0]?.value ?? '',
  );

  const [employer, setEmployer] = useState<string>(employerOptions[0]?.value);
  const [serviceLength, setServiceLength] = useState<string>(lengthOptions[0]?.value ?? '3');
  const [dob, setDob] = useState('');
  const [salary, setSalary] = useState<number | ''>('');
  const [requestedFinanceAmount, setRequestedFinanceAmount] = useState<number>(ADEF);
  const [reqAmtField, setReqAmtField] = useState<string>(String(ADEF));

  const [installments, setInstallments] = useState<number>(IDEF);
  const [instField, setInstField] = useState<string>(String(IDEF));

  const [expenses, setExpenses] = useState<number | ''>('');
  const [mortgageLiabilities, setMortgageLiabilities] = useState<number | ''>('');
  const [monthlyFinancialLiabilities, setMonthlyFinancialLiabilities] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [apiDown, setApiDown] = useState(false);
  const lastPayloadRef = useRef<any>(null);

  const GOV_SECTOR_KEYS = ['GVT', 'GOV', 'GOVERNMENT'];
  const isGovSector = GOV_SECTOR_KEYS.includes((employerSector || '').toUpperCase());

  useEffect(() => {
    if (!isGovSector) {
      setEmployer('');
    } else if (!employer) {
      setEmployer('GOV');
    }
  }, [employerSector]);

  const amountFill = useRangeVars(
    requestedFinanceAmount,
    AMIN,
    AMAX,
    'var(--color-primary-alt)',
    '#C9CDD6',
  );
  const instFill = useRangeVars(installments, IMIN, IMAX, 'var(--color-primary-alt)', '#C9CDD6');

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
    const dob = new Date(dobStr);
    const maturity = new Date();
    maturity.setMonth(maturity.getMonth() + Number(tenureMonths || 0));

    let age = maturity.getFullYear() - dob.getFullYear();
    const m = maturity.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && maturity.getDate() < dob.getDate())) age--;

    return String(age);
  }
  function mapLenOfService(choice: string) {
    const m = /(\d+)/.exec(choice || '');
    return m ? m[1] : '';
  }

  const messages: RawMessage[] = Array.isArray(C.messages) ? C.messages : [];
  const rawSuccess = messages[1] ?? null;
  const rawFail = messages[0] ?? null;

  const successMsg = mapMessage(rawSuccess || {});
  const failMsg = mapMessage(rawFail || {});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setApiDown(false);
    const sectorToEmployerType: Record<string, string> = {
      PRV: 'PRV',
      PNS: 'PNS',
    };

    const sectorKey = (employerSector || '').toUpperCase();

    const employerTypeForPayload = isGovSector
      ? employer || 'GOV'
      : sectorToEmployerType[sectorKey] || '';
    const payload = {
      employerTypeForPayload,
      Nationality: nationality,

      Gender: 'Male',
      FinanceAmt: String(requestedFinanceAmount),
      Tenure: String(installments),
      MonthlyIncome: String(parseNum(salary)),
      lenOfService: mapLenOfService(serviceLength),
      ageAtApplication: calcAge(dob),
      AgeAtMaturity: calcAgeAtMaturity(dob, installments),
    };
    const ageErr = validateAges(dob, installments);
    if (ageErr) {
      setMsg(ageErr);
      setSubmitting(false);
      return;
    }

    lastPayloadRef.current = payload;

    try {
      const res = await post(payload);
      if (res?.Data?.IsEligible) setResult('success');
      else setResult('fail');
    } catch (err) {
      setApiDown(true);
      setMsg(apiErrorMessage());
    } finally {
      setSubmitting(false);
    }
  }
  const success: ResponseMessage = successMsg;
  const fail: ResponseMessage = failMsg;

  function ScrollTopOnMount({ children }: { children: React.ReactNode }) {
    useEffect(() => {
      window.scrollTo({ top: 450, behavior: 'smooth' });
    }, []);
    return <>{children}</>;
  }
  if (result === 'success') {
    return (
      <ScrollTopOnMount>
        <SuccessResponse msg={success} dir={dir} onBack={() => setResult(null)} />
      </ScrollTopOnMount>
    );
  }

  if (result === 'fail') {
    return (
      <ScrollTopOnMount>
        <FailResponse msg={fail} dir={dir} onBack={() => setResult(null)} />
      </ScrollTopOnMount>
    );
  }
  return (
    <section className="w-full mt-32">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="mx-auto max-w-[1240px] rounded-3xl bg-secondary mt-16 p-8 shadow-sm "
      >
        <h2 className="xs:text-[24px] md:text-[28px] font-bold text-primary">
          {C.title || 'Enter your Finance details'}
        </h2>
        <div className="mt-4">
          <p className="text-[15px] font-medium text-default">{C.labels?.nationality}</p>
          <div className="mt-2 flex items-center gap-6">
            {nationalityOptions.map((label) => {
              const val = normalizeNationality(label);
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
                    className="h-4 w-4 accent-primaryAlt"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label={C.labels?.employerSectorLabel} tooltip={C.popups?.employerSector}>
            <Select
              value={employerSector}
              onChange={setEmployerSector}
              placeholder={C.labels?.employerSectorPlaceholder}
              options={employerSectorOptions}
            />
          </Field>
          {isGovSector && (
            <Field label={C.labels?.employerType}>
              <Select
                value={employer}
                onChange={setEmployer}
                placeholder={C.labels?.employerPlaceholder}
                options={employerOptions}
              />
            </Field>
          )}

          <Field label={C.labels?.dateOfBirth} tooltip={C.popups?.dateOfBirth}>
            <div className="relative date-wrap">
              <input
                required
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={`sf-input  value-accent bg-secondary date-input ${dob ? 'has-value' : ''} ${dir === 'rtl' ? 'text-right' : ''} riyals-font`}
                data-placeholder={C.labels?.dateOfBirthPlaceholder}
              />
              <span aria-hidden className="date-icon" />
            </div>
          </Field>
          <Field label={C.labels?.lengthOfServices} tooltip={C.popups?.lengthOfServices}>
            <Select
              value={serviceLength}
              onChange={setServiceLength}
              placeholder={C.labels?.lengthOfServicesPlaceholder}
              options={lengthOptions}
            />
          </Field>

          <Field label={C.labels?.monthlySalary} tooltip={C.popups?.monthlySalary}>
            <CurrencyInput
              value={salary}
              onChange={setSalary}
              placeholder={C.labels?.monthlySalaryPlaceholder}
            />
          </Field>

          <Field label={C.labels?.requestedAmount} tooltip={C.popups?.requestedAmount}>
            <div className="space-y-2">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={AMIN}
                max={AMAX}
                step={ASTEP}
                value={reqAmtField}
                onChange={(e) => {
                  const raw = e.target.value;

                  if (raw === '') {
                    setReqAmtField('');
                    return;
                  }

                  if (!/^\d+$/.test(raw)) return;

                  setReqAmtField(raw);
                }}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  const safe = Number.isFinite(n) ? n : AMIN;
                  const clamped = clamp(safe, AMIN, AMAX);
                  setRequestedFinanceAmount(clamped);
                  setReqAmtField(String(clamped));
                }}
                className="sf-input bg-secondary riyals-font value-accent"
                aria-label={C.labels?.requestedAmount}
                placeholder={C.labels?.requestedAmountPlaceholder || 'ريال'}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                }}
              />

              <div className="text-xs text-gray-500 riyals-font">
                {dir === 'ltr' ? (
                  <>
                    Amount must be between {formatSar(AMIN)} {RIYAL_SYMBOL} and {formatSar(AMAX)}{' '}
                    {RIYAL_SYMBOL}
                  </>
                ) : (
                  <>
                    يرجى إدخال مبلغ يتراوح بين {RIYAL_SYMBOL} {formatSar(AMIN)} و {RIYAL_SYMBOL}{' '}
                    {formatSar(AMAX)}
                  </>
                )}
              </div>

              <input
                type="range"
                min={AMIN}
                max={AMAX}
                step={ASTEP}
                value={requestedFinanceAmount}
                onChange={(e) => {
                  const n = clampStep(Number(e.target.value), AMIN, AMAX, ASTEP);
                  setRequestedFinanceAmount(n);
                  setReqAmtField(String(n));
                }}
                className="sf-range bg-primaryAlt"
                style={amountFill as any}
                aria-label="Requested amount"
              />
            </div>
          </Field>

          <Field label={C.labels?.installments} tooltip={C.popups?.installments}>
            <div className="space-y-2">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={IMIN}
                max={IMAX}
                value={instField}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setInstField('');
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  setInstField(raw);
                }}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  const clamped = clamp(Number.isFinite(n) ? n : IMIN, IMIN, IMAX);
                  setInstallments(clamped);
                  setInstField(String(clamped));
                }}
                className="sf-input bg-secondary value-accent"
                aria-label={C.labels?.installments}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                }}
              />

              <div className="text-xs text-gray-500">
                {dir === 'ltr'
                  ? `Maximum eligible installments is ${IMAX} months`
                  : `الحد الأقصى لعدد الأقساط هو ${IMAX} شهرًا`}
              </div>

              <input
                type="range"
                min={IMIN}
                max={IMAX}
                step={ISTEP}
                value={installments}
                onChange={(e) => {
                  const n = clamp(Number(e.target.value), IMIN, IMAX);
                  setInstallments(n);
                  setInstField(String(n));
                }}
                className="sf-range"
                style={instFill as any}
                aria-label="Installments"
              />
            </div>
          </Field>

          <Field label={C.labels?.totalMonthlyExpenses} tooltip={C.popups?.totalMonthlyExpenses}>
            <CurrencyInput
              value={expenses}
              onChange={setExpenses}
              placeholder={C.labels?.totalMonthlyExpensesPlaceholder}
            />
          </Field>

          <Field label={C.labels?.mortgageLiabilities} tooltip={C.popups?.mortgageLiabilities}>
            <CurrencyInput
              value={mortgageLiabilities}
              onChange={setMortgageLiabilities}
              placeholder={C.labels?.mortgageLiabilitiesPlaceholder}
            />
          </Field>

          <Field
            label={C.labels?.monthlyFinancialLiabilities}
            tooltip={C.popups?.monthlyFinancialLiabilities}
          >
            <CurrencyInput
              value={monthlyFinancialLiabilities}
              onChange={setMonthlyFinancialLiabilities}
              placeholder={C.labels?.monthlyFinancialLiabilitiesPlaceholder}
            />
          </Field>

          <div className="md:col-span-2 mt-2 rounded-2xl border border-[#B9D7F2] dark:border-none  dark:bg-[#23242C] bg-blue-100 p-4  text-[14px] text-primaryAlt">
            <div className="flex flex-col">
              <div className="flex gap-2">
                <InfoIcon />
                <strong className="text-[#0045AB] dark:text-primaryAlt">
                  {C.popups?.note?.title || 'Important Note'}
                </strong>
              </div>
              <div className="ml-6">
                <p className="mt-1 text-default">
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
            className="inline-flex items-center gap-2 rounded-full bg-primaryAlt px-6 py-3 text-secondary hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : C.cta?.text || 'Check your eligibility Now'}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="cta-arrow "
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {msg && (
          <p className="mt-3 text-center text-sm text-red-600" role="status">
            {msg}
          </p>
        )}
      </form>

      <style>{`
      :root {
    --icon-size: 28px;
    --icon-offset: 12px;
  }

 
  .select-wrap { position: relative; }

  .select-caret{
    position:absolute;
    top:50%;
    right:var(--icon-offset);
    transform:translateY(-50%);
    width:var(--icon-size);
    height:var(--icon-size);
    pointer-events:none;
    background-color: var(--color-primary-alt);
    -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.7 9.7a1 1 0 0 1 1.4 0L12 13.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 11.1a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.7 9.7a1 1 0 0 1 1.4 0L12 13.6l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L6.7 11.1a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E") no-repeat center / contain;
  }

  [dir='rtl'] .select-caret{
    left:var(--icon-offset);
    right:auto;
    transform:translateY(-50%) scaleX(-1);
  }

  
  .date-wrap { position: relative; }

  .date-icon{
    position:absolute;
    top:50%;
    right:var(--icon-offset);
    transform:translateY(-50%);
    width:var(--icon-size);
    height:var(--icon-size);
    pointer-events:none;
    background-color: var(--color-primary-alt);
    -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z'/%3E%3C/svg%3E") no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9ZM5 6a1 1 0 0 0-1 1v1h16V7a1 1 0 0 0-1-1H5Z'/%3E%3C/svg%3E") no-repeat center / contain;
  }

  [dir='rtl'] .date-icon{
    left:var(--icon-offset);
    right:auto;
  }

  input[type="date"]::-webkit-calendar-picker-indicator{
    opacity:0;
    position:absolute;
    right:0; left:auto;
    width:100%; height:100%;
    cursor:pointer;
  }
  [dir='rtl'] input[type="date"]::-webkit-calendar-picker-indicator{
    left:0; right:auto;
  }

  .ltr\\:pr-12{ padding-right:3rem; }
  .rtl\\:pl-12{ padding-left:3rem; }
        .sf-input{
          height:3.5rem;width:100%;border-radius:1rem;border:1px solid #DFE3EA;
          padding:0 1rem;font-size:14px;outline:none;
        }
        .sf-range{
          -webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:9999px;outline:none;
        }
        .sf-range::-webkit-slider-thumb{
          -webkit-appearance:none;appearance:none;height:18px;width:18px;border-radius:9999px;background:var(--range-inner-circle);border:3px solid var(--color-primary-alt);
          box-shadow:0 0 0 3px rgba(11,42,142,.1);cursor:pointer;
        }
        .sf-range::-moz-range-thumb{
          height:18px;width:18px;border-radius:9999px;background:#fff;border:3px solid #0b2a8e;
          box-shadow:0 0 0 3px rgba(11,42,142,.1);cursor:pointer;
        }

.date-input::-webkit-datetime-edit { color: transparent; !important }
.date-input:invalid:focus::-webkit-datetime-edit { color: transparent !important; }
.date-input:invalid::-webkit-datetime-edit-day-field {color:transparent; !important}

.date-input:focus::-webkit-datetime-edit,
.date-input.has-value::-webkit-datetime-edit { color: inherit; !important }

/* Firefox (date can fall back to text) */
.date-input::-moz-placeholder { opacity: 0; }
.date-input::-ms-input-placeholder { opacity: 0; }
.date-input::placeholder { opacity: 0; }

.date-input:not(.has-value)::before {
  color: #9AA3B2;           /* soft gray */
  /* or: color: rgba(0,0,0,.45); */
}



/* dark theme */
.dark .date-input:not(.has-value)::before {
  color: #7B8190;        
}

.date-input:invalid:not(.has-value)::before {
  color: #9AA3B2;          
}
.date-input{
display:none
  position: absolute;
}
.date-input:not(.has-value)::before{
  content: attr(data-placeholder);
  position: absolute;
  inset-block-start: 50%;
  transform: translateY(-50%);
  color: var(--color-default);
  pointer-events: none;
      max-inline-size: calc(100% - 3.5rem);

}
.date-input.has-value::before{ content: ""; }
.date-input:dir(ltr):not(.has-value)::before{
  inset-inline-start: 1rem;     
  inset-inline-end: 2.5rem;    
  text-align: left;
}.value-accent { color: #010663; }

/* While placeholder is showing, keep your normal placeholder color */
.value-accent:placeholder-shown { color: var(--color-default); }

/* Dark theme: do NOT change anything */
.dark .value-accent { color: inherit; }
.dark .value-accent:placeholder-shown { color: var(--color-default); }

.date-input:dir(rtl):not(.has-value)::before{
  inset-inline-end: 1rem;      
  inset-inline-start: 2.5rem;   
  text-align: right;
}

.date-input::-webkit-datetime-edit { color: transparent; }
.date-input:focus::-webkit-datetime-edit,
.date-input.has-value::-webkit-datetime-edit { color: inherit; }
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
        <label className="text-[13px] font-medium text-default">{label}</label>
        {!!tooltip && (
          <Tooltip content={tooltip}>
            <InfoIcon className="text-default " />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

// --- Select component ---

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className,
}: {
  className?: string;
  value: string;
  onChange: (v: string) => void;
  options: Choice[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const label = selected?.title ?? placeholder ?? 'Select…';

  useOutsideClose(open, wrapRef, () => setOpen(false));

  const [minW, setMinW] = useState<number>(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setMinW(el.offsetWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <div ref={wrapRef} className="relative select-wrap w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={clsx(
          'sf-input bg-secondary ltr:pr-10 rtl:pl-10 flex items-center justify-between',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          `${className}`,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={clsx('truncate', selected ? 'text-default' : 'text-gray-500')}>
          {label}
        </span>
        <span aria-hidden className="select-caret" />
      </button>

      {open && (
        <ul
          role="listbox"
          className={clsx(
            'absolute z-50 top-full mt-1 max-h-60 w-full overflow-auto rounded-[12px] shadow-xl',
            'bg-white dark:bg-[#0B1220] border border-black/5',
            'ltr:left-0 rtl:right-0',
          )}
          style={{ minWidth: minW || undefined }}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li
                key={opt.id || opt.value}
                role="option"
                aria-selected={active}
                tabIndex={0}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
                className={clsx(
                  'p-2 text-14px  leading-[18px]  cursor-pointer',
                  'text-default',
                  'hover:bg-primaryAlt hover:text-secondary',
                  active && 'bg-[#E9EDF7] dark:bg-[#1E2533]',
                )}
              >
                {opt.title}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CurrencyInput({
  className,
  value,
  onChange,
  placeholder,
}: {
  className?: string;
  value: number | '';
  onChange: (v: number | '') => void;
  placeholder?: string;
}) {
  return (
    <input
      required
      inputMode="decimal"
      type="number"
      value={value === '' ? '' : String(value)}
      onChange={(e) => {
        const v = e.target.value.replace(/[^\d.]/g, '');
        onChange(v === '' ? '' : Number(v));
      }}
      placeholder={placeholder || '0.00 ﷼'}
      className="sf-input bg-secondary riyals-font value-accent "
      onKeyDown={(e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
      }}
    />
  );
}

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex items-center">
      {children}
      <span
        dangerouslySetInnerHTML={{ __html: content }}
        className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 w-[15rem] rounded-xl shadow-md bg-surface-input p-4 text-xs text-default opacity-0 group-hover:block group-hover:opacity-100 descriptionHtml"
      ></span>
    </span>
  );
}

export function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={`h-[20px] w-[20px] ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="var(--color-primary-alt)" />

      <circle cx="12" cy="7" r="1.3" fill="var(--color-secondary)" />

      <rect x="10.9" y="10.2" width="2.2" height="8.5" rx="1.1" fill="var(--color-secondary)" />
    </svg>
  );
}

