// components/sections/SmartFeatures.tsx
import React from 'react';

type NewsletterProps = {
  title: string;
  description?: string;
  placeholder?: string;
  ctaText?: string;
};

type ContactItem = {
  label: string;
  value: string;
  icon?: React.ReactNode; // pass an icon if you like
};

type ContactProps = {
  title: string;
  description?: string;
  items?: ContactItem[];
  ctaText?: string;
};

type SmartFeaturesProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  newsletter: NewsletterProps;
  contact: ContactProps;
  className?: string;
};

export default function SmartFeatures({
  eyebrow,
  title,
  subtitle,
  newsletter,
  contact,
  className = '',
}: SmartFeaturesProps) {
  return (
    <section className={`w-full bg-[#F3F3F3] py-16 md:py-24 ${className}`}>
      <div className="mx-auto w-full max-w-[1240px] px-4 md:px-6">
        <header className="mb-10 md:mb-14">
          {eyebrow ? (
            <p className="font-lufga text-sm tracking-wide text-[#424242]/70">{eyebrow}</p>
          ) : null}
          <h2 className="font-lufga font-bold text-[40px] leading-[1.1] text-[#010663] md:text-[56px]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-[28px] leading-snug text-[#8A8A8A] md:text-[32px]">
              {subtitle}
            </p>
          ) : null}
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT: Newsletter */}
          <article className="relative rounded-[28px] bg-white p-5 md:p-8 shadow-sm">
            {/* subtle outline like your mock (blue stroke in figma) */}
            <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-2 ring-[#2A6BFF] opacity-[0.2]" />
            <div className="relative">
              <h3 className="font-lufga text-[26px] font-extrabold leading-tight text-[#010663] md:text-[28px]">
                {newsletter.title}
              </h3>
              {newsletter.description ? (
                <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-[#424242]">
                  {newsletter.description}
                </p>
              ) : null}
              <div className="mt-6">
                <NewsletterForm
                  placeholder={newsletter.placeholder ?? 'Enter your email address'}
                  ctaText={newsletter.ctaText ?? 'Subscribe Now'}
                />
              </div>
            </div>
          </article>

          {/* RIGHT: Contact */}
          <article className="relative rounded-[28px] bg-white p-5 md:p-8 shadow-sm">
            {/* corner accent */}
            <div className="pointer-events-none absolute right-0 top-0 h-[86px] w-[86px] rounded-t-[28px] rounded-bl-[28px] bg-[#0B2A8E]" />
            <div className="relative">
              <h3 className="font-lufga text-[26px] font-extrabold leading-tight text-[#010663] md:text-[28px]">
                {contact.title}
              </h3>
              {contact.description ? (
                <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-[#424242]">
                  {contact.description}
                </p>
              ) : null}

              {/* cards */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(contact.items ?? []).map((item, i) => (
                  <div
                    key={`${item.label}-${i}`}
                    className="rounded-xl border border-[#000]/10 p-4"
                  >
                    <div className="flex items-center gap-2 text-[#424242]">
                      {item.icon ? <span aria-hidden>{item.icon}</span> : null}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="mt-2 h-px w-full bg-[#000]/10" />
                    <p className="mt-2 font-medium text-[#010663]">{item.value}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-6 inline-flex w-full items-center justify-center rounded-[16px] border-2 border-[#010663] px-6 py-4 text-[18px] font-bold text-[#010663] transition-[box-shadow,transform] active:scale-[0.99] md:w-auto md:px-10"
              >
                {contact.ctaText ?? 'Contact Us'}
                <span className="ml-2" aria-hidden>
                  ›
                </span>
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------- tiny client form ---------- */
function NewsletterForm({ placeholder, ctaText }: { placeholder: string; ctaText: string }) {
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        // hook into your API / Sitefinity endpoint here
      }}
    >
      <input
        type="email"
        required
        placeholder={placeholder}
        className="h-[56px] rounded-[16px] border border-[#000]/10 px-4 text-[16px] outline-none placeholder:text-[#A0A0A0]"
      />
      <button
        type="submit"
        className="h-[56px] rounded-[16px] border-2 border-[#010663] text-[#010663] text-[18px] font-bold flex items-center justify-center"
      >
        {ctaText}
        <span className="ml-2" aria-hidden>
          ›
        </span>
      </button>
    </form>
  );
}

