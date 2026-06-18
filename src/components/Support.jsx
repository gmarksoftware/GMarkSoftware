import { useState } from 'react';

// SVG Icons for Contact Details
const PinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Technical Support',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('idle'); // idle | submitting | success

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: 'Technical Support', message: '' });
    }, 1500);
  };

  return (
    <section id="support" className="relative pt-32 pb-24 bg-transparent overflow-hidden min-h-[80vh] flex items-center">
      <div className="mesh-bg" />
      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full relative z-10">

        {/* Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Contact details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="text-xs font-bold text-accent-red uppercase tracking-[0.15em]">SUPPORT CENTER</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-title leading-tight text-text-primary tracking-tight">
              Support
            </h1>
            <p className="text-base text-text-secondary leading-relaxed max-w-xl">
              At G Mark Software Private Limited, we are committed to providing reliable support for our software products and services. If you need assistance with your account, technical issues, or general inquiries, please contact our support team.
            </p>

            <h2 className="text-xs font-bold text-accent-red uppercase tracking-[0.15em] mt-6">CONTACT INFORMATION</h2>

            <div className="flex flex-col gap-6">
              {/* Address */}
              <div className="flex items-center gap-5">
                <div className="w-11 h-11 rounded-full bg-bg-secondary border border-accent-red/30 flex items-center justify-center text-accent-red shrink-0" aria-hidden="true">
                  <PinIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">CORPORATE ADDRESS</span>
                  <address className="not-italic text-sm sm:text-base font-semibold text-text-primary">
                    Moshi, Pune, Maharashtra – 412105, India
                  </address>
                </div>
              </div>

              {/* Phone */}
              <a href="tel:+919657363967" className="flex items-center gap-5 group no-underline">
                <div className="w-11 h-11 rounded-full bg-bg-secondary border border-accent-red/30 flex items-center justify-center text-accent-red shrink-0 group-hover:bg-accent-red group-hover:text-text-primary group-hover:shadow-md group-hover:shadow-accent-red-glow transition-all duration-300" aria-hidden="true">
                  <PhoneIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">DIRECT HOTLINE</span>
                  <span className="text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent-red transition-colors duration-200">
                    +91-9657363967
                  </span>
                </div>
              </a>

              {/* Email */}
              <a href="mailto:gmarksoftware@gmail.com" className="flex items-center gap-5 group no-underline">
                <div className="w-11 h-11 rounded-full bg-bg-secondary border border-accent-red/30 flex items-center justify-center text-accent-red shrink-0 group-hover:bg-accent-red group-hover:text-text-primary group-hover:shadow-md group-hover:shadow-accent-red-glow transition-all duration-300" aria-hidden="true">
                  <MailIcon />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">EMAIL SUPPORT</span>
                  <span className="text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent-red transition-colors duration-200">
                    gmarksoftware@gmail.com
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Intake Form Card */}
          <div className="lg:col-span-7 p-8 sm:p-12 rounded-2xl bg-bg-secondary/40 border border-border-color backdrop-blur-md shadow-2xl relative">

            {formStatus !== 'success' ? (
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs font-semibold text-text-secondary">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="John Doe"
                      className="bg-bg-primary/50 border border-border-color focus:border-accent-red focus:bg-bg-tertiary focus:shadow-[0_0_10px_rgba(255,85,85,0.15)] rounded px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs font-semibold text-text-secondary">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="john@example.com"
                      className="bg-bg-primary/50 border border-border-color focus:border-accent-red focus:bg-bg-tertiary focus:shadow-[0_0_10px_rgba(255,85,85,0.15)] rounded px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-xs font-semibold text-text-secondary">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    className="bg-bg-primary/50 border border-border-color focus:border-accent-red focus:bg-bg-tertiary focus:shadow-[0_0_10px_rgba(255,85,85,0.15)] rounded px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 cursor-pointer"
                    value={formData.subject}
                    onChange={handleInputChange}
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Sales Inquiry">Sales Inquiry</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs font-semibold text-text-secondary">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Describe your issue or query..."
                    className="bg-bg-primary/50 border border-border-color focus:border-accent-red focus:bg-bg-tertiary focus:shadow-[0_0_10px_rgba(255,85,85,0.15)] rounded px-4 py-3 text-sm text-text-primary outline-none transition-all duration-200 min-h-[120px] resize-y"
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-red hover:bg-accent-red-hover text-text-primary py-3.5 rounded font-semibold text-sm cursor-pointer shadow-md shadow-accent-red-glow hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formStatus === 'submitting'}
                >
                  {formStatus === 'submitting' ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-accent-blue/10 border-2 border-accent-blue text-accent-blue flex items-center justify-center text-xl animate-pulse">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">Message Sent!</h3>
                <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                  We have received your message. Our support team will review it and follow up via email shortly.
                </p>
                <button
                  className="border border-white/10 hover:border-white/20 px-6 py-2.5 rounded text-sm text-text-primary hover:bg-white/5 transition-colors duration-200 mt-2"
                  onClick={() => setFormStatus('idle')}
                >
                  Submit Another Request
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
