import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <section className="-mx-5 relative min-h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Background */}
      <img
        src={'assets/coming-soon/HeroSection.png'}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative w-full max-w-[1100px] mx-auto text-white">
        <div className="flex justify-center mb-[88px] mt-[100px] sm:-translate-y-30 lg:-translate-y-[40px]">
          <img
            src={'assets/coming-soon/Logo.png'}
            alt="Logo"
            className="pointer-events-none h-[72px] sm:h-14 md:h-16 w-[163px]"
          />
        </div>

        <div className="w-full flex flex-col items-center text-center">
          <h1 className="px-6 max-w-[620px] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Something exciting is <br className="hidden md:block" />
            on the way!
          </h1>

          <p className="sm:mt-4 max-w-[720px] px-6 text-sm sm:text-base text-white/85">
            We’re working hard to bring you something amazing. Stay tuned!
          </p>

          <div className="mt-14 sm:mt-16 lg:mt-28 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <a href="#" aria-label="Download on the App Store">
              <img
                src={'assets/coming-soon/AppStore.png'}
                alt="App Store"
                className="h-[40px] sm:h-[50px] hover:opacity-90 transition w-[100px] sm:w-[180px]"
              />
            </a>

            <a href="#" aria-label="Get it on Google Play">
              <img
                src={'assets/coming-soon/Google.png'}
                alt="Google Play"
                className="h-[40px] sm:h-[50px]  hover:opacity-90 transition w-[100px] sm:w-[180px]"
              />
            </a>

            <a href="#" aria-label="Explore it on AppGallery">
              <img
                src={'assets/coming-soon/AppGallary.png'}
                alt="AppGallery"
                className="h-[40px] sm:h-[50px]  hover:opacity-90 transition w-[100px] sm:w-[180px]"
              />
            </a>
          </div>
        </div>

        <div className="h-10 sm:h-12" />
      </div>
    </section>
  );
};

export default ComingSoon;

