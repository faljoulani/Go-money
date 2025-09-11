export default function ContactFormClient() {
  return (
    <div className="w-full rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <form className="font-lufga">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-2 block text-[16px] font-semibold text-[#424242]">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Your First Name"
              disabled
              className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
              aria-required="true"
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
              disabled
              className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
              aria-required="true"
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
                disabled
                className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
                aria-required="true"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-[16px] font-semibold text-[#424242]">Email</label>
            <input
              type="email"
              placeholder="Example@email.com"
              disabled
              className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-2 block text-[16px] font-semibold text-[#424242]">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter the topic"
              disabled
              className="w-full rounded-[14px] border border-[#E7E9EF] bg-white px-5 py-4 text-[16px] text-[#424242] outline-none placeholder:text-[#BDBDBD]"
              aria-required="true"
            />
          </div>
          <div className="hidden md:block" />
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled
            className="rounded-2xl bg-[#0B2A8E] px-8 py-4 text-[18px] font-bold text-white"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}

