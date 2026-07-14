import { useState } from 'react';
import { WavePath } from '@/components/ui/wave-path';
import { API_URL, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '@/config';

// Blog View
function BlogView() {
  const posts = [
    {
      title: "Real-Time Telemetry and Predictive Maintenance at Scale",
      excerpt: "How modern machine learning models analyze streaming sensor data to predict component failures before they occur in heavy machinery.",
      date: "June 18, 2026",
      readTime: "6 min read",
      tag: "Predictive AI"
    },
    {
      title: "Edge Computing Paradigms in Modern Industrial Digital Twins",
      excerpt: "Processing telemetry data directly at the edge nodes reduces latencies and network costs. Here is how we build hybrid architectures.",
      date: "June 12, 2026",
      readTime: "8 min read",
      tag: "Edge Computing"
    },
    {
      title: "Unified Namespace (UNS): The Architecture of Future Factories",
      excerpt: "Why the traditional ISA-95 automation pyramid is fading away, and how Unified Namespaces enable seamless OT-to-IT data integrations.",
      date: "May 29, 2026",
      readTime: "10 min read",
      tag: "IIoT Platforms"
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Blog Heading Panel */}
      <div className="relative rounded overflow-hidden p-8 md:p-12 bg-bg-secondary/40 border border-border-color/15">
        {/* Subtle Wave Graphics Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <svg className="w-full h-full" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0,100 C 150,150 250,50 400,100 C 550,150 650,50 800,100" stroke="#FF5A5F" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M 0,120 C 100,70 300,170 500,100 C 700,30 750,130 800,120" stroke="#38BDF8" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 space-y-4">
          <span className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em]">Insights & Telemetry</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            The Big Data Blog
          </h1>
          <p className="text-text-secondary max-w-xl font-sans text-sm md:text-base">
            Expert articles and case studies exploring the frontier of industrial automation, big data pipelines, and predictive artificial intelligence.
          </p>
        </div>
      </div>

      {/* Blog List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post, index) => (
          <div key={index} className="group p-6 rounded bg-bg-secondary/20 border border-border-color/10 hover:border-accent-red/30 hover:bg-bg-secondary/40 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-accent-red/10 text-accent-red border border-accent-red/20">
                {post.tag}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-text-primary group-hover:text-accent-red transition-colors duration-200">
                {post.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed font-sans">
                {post.excerpt}
              </p>
            </div>
            <div className="flex justify-between items-center text-xs text-text-muted pt-6 font-mono border-t border-border-color/5 mt-6">
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Contact View
function ContactView() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);

    const handleSuccess = () => {
      setSubmitted(true);
      setFormState({ name: '', email: '', phone: '', message: '' });
      setIsSubmitting(false);

      // Auto reset success message after 4 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    };

    // Try sending to local backend first
    fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formState.name,
        email: formState.email,
        subject: 'Contact Message',
        message: formState.message,
        phone: formState.phone
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Server responded with an error status: ' + res.status);
        }
        return res.json();
      })
      .then((data) => {
        console.log('SUCCESS! Sent via backend API', data);
        handleSuccess();
      })
      .catch((err) => {
        console.warn('Backend API submission failed, trying EmailJS client-side fallback...', err);

        // Direct EmailJS REST API fallback
        fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              name: formState.name,
              from_name: formState.name,
              email: formState.email,
              from_email: formState.email,
              phone: formState.phone || 'N/A',
              subject: 'Contact Message',
              message: formState.message
            }
          })
        })
          .then((res) => {
            if (!res.ok) {
              return res.text().then((text) => {
                throw new Error(text || `EmailJS returned status ${res.status}`);
              });
            }
            console.log('SUCCESS! Sent via client-side EmailJS fallback');
            handleSuccess();
          })
          .catch((emailJsErr) => {
            console.error('EmailJS fallback failed as well...', emailJsErr);
            alert('Failed to send message: ' + (emailJsErr.message || 'Unknown error'));
            setIsSubmitting(false);
          });
      });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
          Contact Us
        </h1>
        <p className="text-text-secondary font-sans text-sm md:text-base max-w-xl">
          Get in touch with our engineering or sales team. We typically respond within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Form Column */}
        <div className="md:col-span-3 p-6 rounded border border-border-color/15 bg-bg-secondary/30 backdrop-blur-md">
          {submitted ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 animate-scaleUp">
              <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
              <h3 className="text-xl font-bold text-text-primary">Message Sent Successfully!</h3>
              <p className="text-sm text-text-secondary font-sans">Thank you for reaching out. We will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-bg-tertiary/40 border border-border-color/20 focus:border-accent-red focus:bg-bg-tertiary outline-none px-4 py-2.5 rounded text-text-primary transition-all duration-200"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-bg-tertiary/40 border border-border-color/20 focus:border-accent-red focus:bg-bg-tertiary outline-none px-4 py-2.5 rounded text-text-primary transition-all duration-200"
                    placeholder="yourname@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">Contact Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  className="w-full bg-bg-tertiary/40 border border-border-color/20 focus:border-accent-red focus:bg-bg-tertiary outline-none px-4 py-2.5 rounded text-text-primary transition-all duration-200"
                  placeholder="Enter your contact number"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full bg-bg-tertiary/40 border border-border-color/20 focus:border-accent-red focus:bg-bg-tertiary outline-none px-4 py-2.5 rounded text-text-primary transition-all duration-200 resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded bg-accent-red hover:bg-accent-red-hover text-white font-bold transition-all duration-300 shadow-md shadow-accent-red/20 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded border border-border-color/10 bg-bg-secondary/15 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent-red">HQ Address</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-sans">
              G Mark Software Pvt. Ltd.<br />
              Moshi, Pune,<br />
              Maharashtra, India - 412105
            </p>
          </div>

          <div className="p-6 rounded border border-border-color/10 bg-bg-secondary/15 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-accent-red">Direct Contact</h3>
            <p className="text-sm text-text-secondary leading-relaxed font-sans">
              <strong>Phone:</strong> +91-9657363967<br />
              <strong>Email:</strong> gmarksoftware@gmail.com
            </p>
          </div>
        </div>
      </div>

      <WavePath className="my-2 text-accent-red/30 w-full" />
    </div>
  );
}

// Privacy View
function PrivacyView() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
        Privacy Policy
      </h1>

      <p className="text-base text-text-secondary leading-relaxed font-sans">
        At My Site, we specialize in delivering innovative software solutions tailored to your business needs. Our commitment to quality and security ensures your data is protected while enhancing your operational efficiency.
      </p>

      <p className="text-base text-text-secondary leading-relaxed font-sans">
        G Mark Software Private Limited ("G Mark", "we", "our", or "us") respects your privacy and is committed to protecting your information.
      </p>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-accent-red uppercase tracking-wider font-mono">
          Information We Collect
        </h2>
        <p className="text-base text-text-secondary leading-relaxed font-sans">
          To provide our services, we may collect personal information such as name, email address, phone number, company information, account login information, and machine, maintenance, and operational data entered by users.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-accent-red uppercase tracking-wider font-mono">
          How We Use Information
        </h2>
        <p className="text-base text-text-secondary leading-relaxed font-sans">
          We use the collected information to provide and maintain our software services, enable user authentication and account management, improve system performance and security, provide customer support, and comply with legal obligations.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-accent-red uppercase tracking-wider font-mono">
          Data Security
        </h2>
        <p className="text-base text-text-secondary leading-relaxed font-sans">
          We implement reasonable security measures, including secure access controls and encrypted data transmission, to protect your information from unauthorized access, disclosure, or misuse.
        </p>
      </div>
    </div>
  );
}

// Employees View
function EmployeesView() {
  const employees = [
    { name: 'Shaba Mujawar', role: 'Chief Technology Officer', dept: 'Engineering', status: 'Active', email: 'shaba@gmark.com' },
    { name: 'John Doe', role: 'Lead AI Researcher', dept: 'Data Science', status: 'Active', email: 'john.doe@gmark.com' },
    { name: 'Jane Smith', role: 'Industrial IoT Architect', dept: 'IIoT Lab', status: 'Active', email: 'jane.smith@gmark.com' },
    { name: 'Robert Chen', role: 'Cloud Infrastructure Lead', dept: 'Operations', status: 'Active', email: 'robert.chen@gmark.com' },
    { name: 'Alice Johnson', role: 'UI/UX Product Designer', dept: 'Design', status: 'Active', email: 'alice.j@gmark.com' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
        Employees List
      </h1>

      <div className="overflow-x-auto rounded border border-border-color/15 bg-bg-secondary/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-color/20 bg-bg-tertiary/60">
              <th className="px-6 py-4 text-xs font-mono font-bold text-accent-red uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-mono font-bold text-accent-red uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-mono font-bold text-accent-red uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-xs font-mono font-bold text-accent-red uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-mono font-bold text-accent-red uppercase tracking-wider">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color/10 font-sans text-sm text-text-secondary">
            {employees.map((emp, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors duration-150">
                <td className="px-6 py-4 font-semibold text-text-primary">{emp.name}</td>
                <td className="px-6 py-4">{emp.role}</td>
                <td className="px-6 py-4">{emp.dept}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-muted">{emp.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// GMarkAboutView
function GMarkAboutView() {
  const coreValues = [
    {
      title: 'Innovation',
      desc: 'Continuously pushing boundaries to design and engineer state-of-the-art products.'
    },
    {
      title: 'Reliability',
      desc: 'Crafting high-availability systems engineered for security, scale, and resilience.'
    },
    {
      title: 'Velocity',
      desc: 'Delivering rapid development cycles and lightning-fast software performance.'
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn text-left">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-bold text-accent-red uppercase tracking-[0.2em]">Who We Are</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary">
          About G Mark
        </h1>
        <p className="text-base text-text-secondary leading-relaxed font-sans max-w-3xl">
          G Mark Software Private Limited is a premium enterprise IT solutions provider, specialized in building next-generation digital platforms, IoT telemetry networks, and predictive AI systems.
        </p>
      </div>

      <WavePath className="my-2 text-accent-red/30 w-full" />

      {/* Grid: Mission and Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Card */}
        <div className="p-6 rounded-xl bg-bg-secondary/40 border border-border-color/15 backdrop-blur-md hover:border-accent-red/20 transition-all duration-300 flex flex-col justify-start text-left space-y-4">
          <div className="w-10 h-10 rounded bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red">
            <span className="material-symbols-outlined text-xl">rocket_launch</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary">Our Mission</h3>
          <p className="text-sm text-text-secondary leading-relaxed font-sans">
            To deliver intuitive, high-tech digital systems that empower organizations to shift effortlessly from the physical world to the digital age, boosting operational efficiency and growth.
          </p>
        </div>

        {/* Vision Card */}
        <div className="p-6 rounded-xl bg-bg-secondary/40 border border-border-color/15 backdrop-blur-md hover:border-accent-red/20 transition-all duration-300 flex flex-col justify-start text-left space-y-4">
          <div className="w-10 h-10 rounded bg-accent-red/10 border border-accent-red/20 flex items-center justify-center text-accent-red">
            <span className="material-symbols-outlined text-xl">visibility</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary">Our Vision</h3>
          <p className="text-sm text-text-secondary leading-relaxed font-sans">
            We envision a future powered by intelligent data. By leveraging real-time telemetry, predictive analytics, and scalable cloud architectures, we pave the way for smarter industrial decision-making.
          </p>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="p-8 rounded-xl border border-border-color/10 bg-bg-secondary/20 backdrop-blur-md space-y-6">
        <h3 className="text-center font-mono text-xs font-bold text-accent-red uppercase tracking-[0.25em]">
          Our Core Values
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-stretch">
          {coreValues.map((val, index) => (
            <div key={index} className={`space-y-2 px-4 ${index > 0 ? 'md:border-l md:border-border-color/15' : ''}`}>
              <h4 className="text-lg font-semibold text-text-primary">{val.title}</h4>
              <p className="text-xs text-text-secondary leading-relaxed font-sans max-w-xs mx-auto">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MoreLayout({ activeTab, onTabChange }) {
  // Tabs: 'gmark' | 'contact' | 'privacy'

  const menuItems = [
    { label: 'About G Mark', id: 'gmark' },
    { label: 'Contact Us', id: 'contact' },
    { label: 'Privacy Policy', id: 'privacy' }
  ];

  return (
    <div className="relative min-h-[calc(100vh-6rem)] pt-36 pb-24 bg-transparent overflow-hidden">
      {/* Background radial spotlight */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,90,95,0.03),transparent_70%)]" />

      <div className="w-full px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* Left Side: Active Tab Content */}
          <div className="lg:col-span-3 space-y-8 min-h-[500px]">
            {activeTab === 'gmark' && <GMarkAboutView />}
            {activeTab === 'contact' && <ContactView />}
            {activeTab === 'privacy' && <PrivacyView />}
          </div>

          {/* Right Side: Tab Menu */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 space-y-6 lg:border-l lg:border-border-color/20 lg:pl-8">
              <ul className="flex flex-col gap-4 list-none m-0 p-0 text-left">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onTabChange) onTabChange(item.id);
                      }}
                      className={`text-[1.1rem] font-medium transition-colors duration-200 block py-1 ${activeTab === item.id
                        ? 'text-accent-red font-semibold'
                        : 'text-text-secondary hover:text-accent-red'
                        }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
