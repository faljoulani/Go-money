'use client';
import { useState } from 'react';
import FullPageLoader from '../../atoms/fullPageLoader/fullPageLoader';

export default function ContactFormClient() {
  const [resStatus, setResStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contactUsObj, setContactUsObj] = useState({
    title: 'New inquiry 3',
    firstName: 'Omar 2',
    lastName: 'Khatib',
    mobileNumber: '+97150000000',
    email: 'omar@example.com',
    topic: 'Need help with onboarding.',
  });

  const submitContactUSForm = async (e) => {
    e.preventDefault();
    //validations
    if (true) {
      setIsLoading(true);
      const res = await fetch('/api/default/ContactUsLists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactUsObj),
      });
      setIsLoading(false);
      console.log('response ----> ', res);
    }
  };

  return (
    <>
      {isLoading && <FullPageLoader />}
      <div className="w-full rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 md:p-8">
        <form className="font-lufga" onSubmit={submitContactUSForm}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className="mb-2 block text-[16px] font-semibold text-[#424242]">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Your First Name"
                className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
                aria-required="true"
                value={contactUsObj.firstName}
                onChange={(e) =>
                  setContactUsObj((prev) => ({ ...prev, firstName: e.target.value }))
                }
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-2 block text-[16px] font-semibold text-[#424242]">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Your Last Name"
                className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
                aria-required="true"
                value={contactUsObj.lastName}
                onChange={(e) => setContactUsObj((prev) => ({ ...prev, lastName: e.target.value }))}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-[16px] font-semibold text-[#424242]">
                Phone Number <span className="text-red-500">*</span>
              </label>

              <div className="flex items-stretch gap-3">
                {/* KSA prefix box */}
                <div className="flex items-center gap-2 rounded-[14px] border border-[#E7E9EF] bg-white px-4 py-3">
                  {/* Simple KSA emblem circle (placeholder) */}
                  <span
                    aria-hidden
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0FA958] text-white"
                  >
                    SA
                  </span>
                  <span className="text-[16px] font-semibold text-[#424242]">+966</span>
                </div>

                {/* Number field */}
                <input
                  type="tel"
                  placeholder="00 000 0000"
                  className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
                  aria-required="true"
                  value={contactUsObj.mobileNumber}
                  onChange={(e) =>
                    setContactUsObj((prev) => ({ ...prev, mobileNumber: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-[16px] font-semibold text-[#424242]">Email</label>
              <input
                type="email"
                placeholder="Example@email.com"
                className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
                value={contactUsObj.email}
                onChange={(e) => setContactUsObj((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-2 block text-[16px] font-semibold text-[#424242]">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter the topic"
                className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
                aria-required="true"
                value={contactUsObj.topic}
                onChange={(e) => setContactUsObj((prev) => ({ ...prev, topic: e.target.value }))}
              />
            </div>
            <div className="hidden md:block" />
          </div>

          {/* CTA */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="rounded-2xl bg-[#0B2A8E] px-8 py-4 text-[18px] font-bold text-white"
            >
              Send Message
            </button>
          </div>
          {/* <div className="flex justify-end">
            <div className="text-red-400">
              <div className="rtl:hidden">Your message was successfly sent</div>
              <div className="ltr:hidden">لقد تم ارسال رسالتك</div>
            </div>
            <div className="text-green-400">Your message was successfly sent</div>
          </div> */}
        </form>
      </div>
    </>
  );
}

