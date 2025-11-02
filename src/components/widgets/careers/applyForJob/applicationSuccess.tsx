import Image from 'next/image';
import Link from 'next/link';
import { useDirection } from '../../../../utils/helpers'; // assuming you already use this in other components

export default function ApplicationSuccess({ backHref }: { backHref?: string }) {
  const direction = useDirection();
  const isRtl = direction === 'rtl';

  const href = backHref || (isRtl ? 'الوظائف' : '/careers');

  return (
    <div className="rounded-3xl shadow-md bg-surface-section px-6 md:px-16 py-16 text-center">
      <div className="flex items-center justify-center">
        <span
          className="block h-[83px] w-[83px] bg-[#56D38C]"
          style={{
            WebkitMaskImage: 'url(/icons/circle-check-filled.png)',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskImage: 'url(/icons/circle-check-filled.png)',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
          aria-hidden
        />
      </div>

      {/* Heading */}
      <h2 className="mb-6 text-2xl md:text-4xl font-extrabold text-primary">
        <span className="ltr:inline rtl:hidden">
          Your application has been submitted successfully.
        </span>
        <span className="rtl:inline ltr:hidden">تم تقديم طلبك بنجاح!</span>
      </h2>

      {/* Paragraph */}
      <p className="mb-6 text-14px text-default">
        <span className="ltr:inline rtl:hidden">
          We’ll review your application and get back to you soon.
        </span>
        <span className="rtl:inline ltr:hidden">نحن نقوم بمراجعة طلبك وسيتم الرد عليك قريباً</span>
      </p>

      {/* CTA Button */}
      <Link
        href={href}
        className="inline-flex items-center gap-3 rounded-2xl bg-primaryAlt px-6 py-3 font-medium text-secondary hover:opacity-90"
      >
        <span className="ltr:inline rtl:hidden">Back to career</span>
        <span className="rtl:inline ltr:hidden">العودة الي الوظائف</span>

        <Image
          src="/icons/chevron-right.svg"
          alt=""
          width={24}
          height={24}
          className="
            h-5 w-5 shrink-0 cta-arrow
            text-white dark:text-black
            [filter:brightness(0)_invert(1)] dark:[filter:none]
          "
        />
      </Link>
    </div>
  );
}

