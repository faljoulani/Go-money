'use client';

import * as React from 'react';

export type ResponseMessage = {
  // kept for future dynamic wiring; ignored for now
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
  reasonsTitle: string;
  reasonsDescription: string;
  actionsTitle: string;
  actionsDescription: string;
};

type Dir = 'rtl' | 'ltr';

/* ---------------- SUCCESS (static) ---------------- */

export function SuccessResponse({
  msg: _msg,
  dir = 'ltr',
  onBack,
}: {
  msg: ResponseMessage;
  dir?: Dir;
  onBack: () => void;
}) {
  const t =
    dir === 'rtl'
      ? {
          title: '🎉 أنت مؤهل للحصول على تمويلنا !',
          desc: 'خطوتك التالية هي إكمال التسجيل لنقوم بتصميم عرض بمعدل ربح وشروط تناسب احتياجاتك.',
          noteTitle: 'الشروط والأحكام',
          noteDesc:
            'سيتم تحديد معدل الربح والشروط النهائية بعد إتمام التسجيل ومراجعة سجلك الائتماني.',
          back: 'العودة إلى الآلة الحاسبة',
          cta: 'تنزيل التطبيق',
        }
      : {
          title: "🎉 You're Eligible for Our Financing !",
          desc: 'Based on the information you provided, you are preliminarily eligible for financing. Complete your registration now to discover your tailored offer!',
          noteTitle: 'Important Note',
          noteDesc:
            'The eligible amount is an estimate and may change based on the confirmation of your salary and credit score.',
          back: 'Back to Calculator',
          cta: 'Download Our App',
        };

  return (
    <section className="w-full" dir={dir}>
      <div className="mx-auto max-w-[1240px] rounded-3xl bg-surface-section mt-16 p-8 text-center">
        <div className="mx-auto mb-6 grid place-items-center">
          <img src="/assets/success.png" alt="success" className="h-24 w-24 object-contain" />
        </div>

        <h2 className="xs:text-[28px] md:text-[44px] font-semibold text-primary mb-3">{t.title}</h2>
        <p className="text-[16px] md:text-[18px] text-default max-w-3xl mx-auto">{t.desc}</p>

        <div className="mt-8 rounded-2xl border border-[#B9D7F2] dark:border-none dark:bg-[#23242C] bg-blue-100 p-4 text-[14px] max-w-4xl mx-auto">
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-2">
              <InfoIcon />
              <strong className="text-[#0045AB] dark:text-primaryAlt">{t.noteTitle}</strong>
            </div>
            <p className="mt-1 ml-6 text-default">{t.noteDesc}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border-2 border-primaryAlt text-primaryAlt font-semibold px-6 py-3 text-[15px] hover:opacity-90"
          >
            {t.back}
          </button>
          <a
            href="#"
            className="rounded-full bg-primaryAlt text-secondary font-bold px-6 py-3 text-[15px] hover:opacity-90"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAIL (static) ---------------- */

export function FailResponse({
  msg: _msg,
  dir = 'ltr',
  onBack,
}: {
  msg: ResponseMessage;
  dir?: Dir;
  onBack: () => void;
}) {
  const t =
    dir === 'rtl'
      ? {
          title: 'غير مؤهل بعد',
          desc: 'للأسف، لا يمكننا المضي قدمًا في طلبك في الوقت الحالي',
          reasonsTitle: 'قد يكون ذلك بسبب واحد أو أكثر من الأسباب التالية:',
          reasonsHtml:
            '• المعلومات التي تم التحقق منها لا تتوافق مع متطلبات سياساتنا الداخلية.<br/>• المعلومات التي تم التحقق منها لا تتوافق مع متطلبات سياساتنا الداخلية.<br/>• سجلّك الائتماني لا يفي حاليًا بمعايير الأهلية لدينا.',
          actionsTitle: 'لكن لا تقلق - هذا وضع مؤقت! إليك ما يمكنك فعله:',
          actionsHtml:
            '• استخدم Go Money بانتظام<br/>• سدد أي مستحقات معلقة<br/>• حاول مرة أخرى لاحقًا ',
          foot: 'نحن هنا عندما تكون جاهزًا.',
          back: 'العودة إلى الآلة الحاسبة',
        }
      : {
          title: 'Not Eligible Yet',
          desc: 'Unfortunately, we are unable to proceed with your application at this time',
          reasonsTitle: 'This could be due to one or more of the following reasons:',
          reasonsHtml:
            '• Your verified information does not meet our internal policy requirements.<br/>• Your current financial obligations are too high for us to offer a loan at this time.<br/>• Your credit history does not currently meet our eligibility criteria.',
          actionsTitle: 'But don’t worry — this isn’t permanent! Here’s what you can do:',
          actionsHtml:
            '• Use Go Money regularly<br/>• Repay any pending dues<br/>• Try again later',
          foot: 'We’re here when you’re ready.',
          back: 'Back to Calculator',
        };

  return (
    <section className="w-full" dir={dir}>
      <div className="mx-auto max-w-[1240px] rounded-3xl bg-surface-section mt-16 p-8 text-center">
        <div className="mx-auto mb-6 grid place-items-center">
          <img src="/assets/failed.png" alt="not-eligible" className="h-24 w-24 object-contain" />
        </div>

        <h2 className="text-[32px] md:text-[40px] font-semibold text-primary mb-2">{t.title}</h2>
        <p className="text-[16px] md:text-[18px] text-default max-w-3xl mx-auto">{t.desc}</p>

        <div
          className={`mx-auto mt-8 w-[80%] grid grid-cols-1 gap-4 ${
            dir === 'ltr' ? 'text-left' : 'text-right'
          }`}
        >
          <div className="rounded-xl dark:bg-[#23242C] bg-gray-100 p-5">
            <strong className="block mb-3 text-default">{t.reasonsTitle}</strong>
            <p
              className="leading-6 descriptionHtml"
              dangerouslySetInnerHTML={{ __html: t.reasonsHtml }}
            />
          </div>
        </div>

        <div
          className={`mx-auto mt-8 w-[80%] grid grid-cols-1 gap-4 ${
            dir === 'ltr' ? 'text-left' : 'text-right'
          }`}
        >
          <div className="rounded-xl dark:bg-[#23242C] bg-gray-100 p-5">
            <strong className="block text-default">{t.actionsTitle}</strong>
            <p
              className="leading-6 descriptionHtml"
              dangerouslySetInnerHTML={{ __html: t.actionsHtml }}
            />
          </div>
        </div>

        <p className="mt-8 text-default">{t.foot}</p>

        <div className="mt-8">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border-[3px] dark:border-primaryAlt border-[#010663] font-semibold text-primaryAlt px-6 py-3 text-[15px] hover:bg-gray-50"
          >
            {t.back}
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="var(--color-primary-alt)" />
      <circle cx="12" cy="7" r="1.3" fill="var(--color-secondary)" />
      <rect x="10.9" y="10.2" width="2.2" height="8.5" rx="1.1" fill="var(--color-secondary)" />
    </svg>
  );
}

