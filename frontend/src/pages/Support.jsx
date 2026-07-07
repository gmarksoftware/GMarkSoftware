import { WavePath } from '@/components/ui/wave-path';

export default function Support() {
  return (
    <section id="support" className="relative pt-32 pb-24 bg-transparent overflow-hidden min-h-[80vh] flex items-center border-b border-border-color">
      <div className="mesh-bg" />
      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full relative z-10 border-x border-border-color">
        <div className="flex flex-col gap-8 max-w-2xl text-left">
          
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-title leading-tight text-text-primary tracking-tight mb-6">
              Support
            </h1>
            <p className="text-base text-text-secondary leading-relaxed font-sans">
              At G Mark Software Private Limited, we are committed to providing reliable support for our software products and services.<br />
              If you need assistance with your account, technical issues, or general inquiries, please contact our support team.
            </p>
          </div>

          <WavePath className="my-2 text-accent-red/30" />

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary font-title tracking-tight">
              Contact Information
            </h2>
            
            <div className="space-y-3 font-sans text-text-secondary text-sm sm:text-base">
              <p className="font-semibold text-text-primary text-base sm:text-lg">
                G Mark Software Private Limited
              </p>
              <p className="flex items-center gap-3 leading-relaxed">
                <span className="text-lg">📍</span> Moshi, Pune, Maharashtra – 412105, India
              </p>
              <p className="flex items-center gap-3 leading-relaxed">
                <span className="text-lg">📞</span> <a href="tel:+919657363967" className="hover:text-accent-red text-text-secondary no-underline transition-colors duration-200">+91-9657363967</a>
              </p>
              <p className="flex items-center gap-3 leading-relaxed">
                <span className="text-lg">✉️</span> <a href="mailto:gmarksoftware@gmail.com" className="hover:text-accent-red text-text-secondary no-underline transition-colors duration-200">gmarksoftware@gmail.com</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
