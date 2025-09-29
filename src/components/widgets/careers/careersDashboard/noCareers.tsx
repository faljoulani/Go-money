import Image from 'next/image';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
      <Image
        src="/icons/file-search.png"
        alt="No jobs available"
        width={64}
        height={64}
        className="mb-6 opacity-70"
      />

      {/* Heading */}
      <h2 className="text-xl font-semibold text-default">
        <span className="ltr:inline rtl:hidden">Currently No Open Positions</span>
        <span className="rtl:inline ltr:hidden">لا يوجد وظائف متاحة حاليًا</span>
      </h2>

      {/* Paragraph */}
      <p className="mt-2 max-w-md text-sm text-default">
        <span className="ltr:inline rtl:hidden">
          We&apos;ll update this page as soon as new vacancies become available
        </span>
        <span className="rtl:inline ltr:hidden">
          سنقوم بتحديث هذه الصفحة بمجرد توفر وظائف شاغرة جديدة
        </span>
      </p>
    </div>
  );
}

