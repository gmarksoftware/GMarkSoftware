import React, { useState } from 'react';
import { X, CheckCircle2, Building2, Mail, Phone, ArrowRight, Shield, Clock, Loader2, AlertCircle } from 'lucide-react';
import { sendContactEmail } from '../utils/emailService';

export default function ExpertModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    workEmail: '',
    company: '',
    solutionArea: 'Smart Maintenance Management',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const name = formData.name.trim();
    const workEmail = formData.workEmail.trim();
    const message = formData.message.trim();

    if (!name) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!workEmail || !emailRegex.test(workEmail)) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!message) {
      setErrorMessage('Please enter your consultation requirements.');
      return;
    }

    setIsSubmitting(true);

    const title = formData.solutionArea ? `Consultation: ${formData.solutionArea}` : 'Expert Consultation Request';
    const time = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const res = await sendContactEmail({
      name,
      email: workEmail,
      workEmail,
      title,
      subject: title,
      time,
      company: formData.company.trim(),
      solutionArea: formData.solutionArea,
      message,
      category: 'Expert Consultation Modal'
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setErrorMessage('');
      setTimeout(() => {
        // Auto close after 3.5 seconds
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3500);
      }, 400);
    } else {
      setErrorMessage(res.error || 'Failed to submit consultation request. Please try again.');
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        style={{
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          animation: 'scaleUp 0.2s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-[#FAFCFE] shrink-0"
        >
          <div>
            <div 
              style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.72rem', 
                fontWeight: '700', 
                letterSpacing: '0.12em', 
                textTransform: 'uppercase',
                color: '#FC787D',
                marginBottom: '0.25rem' 
              }}
            >
              DIRECT ENGINEERING CONSULTATION
            </div>
            <h3 
              style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.35rem', 
                fontWeight: '800', 
                letterSpacing: '-0.025em',
                lineHeight: '1.2',
                color: '#1E293B',
                margin: 0
              }}
            >
              <span>Talk to a </span>
              <span style={{ color: '#FC787D' }}>Solutions Architect</span>
            </h3>
            <p 
              style={{ 
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.825rem', 
                color: '#4B5563', 
                marginTop: '0.35rem', 
                marginBottom: 0,
                lineHeight: '1.45' 
              }}
            >
              <strong style={{ color: '#1E293B', fontWeight: '600' }}>Simple, efficient, yet fully integrated.</strong>{' '}
              Connect directly with our enterprise engineering lead.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-3"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-7 overflow-y-auto">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(252, 120, 125, 0.12)', color: '#FC787D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.3rem', fontWeight: '800', color: '#1E293B', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                <span>Consultation Request </span>
                <span style={{ color: '#FC787D' }}>Received</span>
              </h4>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', color: '#4B5563', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
                Our systems engineering lead will review your operational requirements and connect with you within 4 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {errorMessage && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#FFF1F2',
                  border: '1.5px solid #FDB4B7',
                  color: '#991B1B',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  <AlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Robert Chen"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="modal-form-field"
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Work Email *
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="robert@enterprise.com"
                    value={formData.workEmail}
                    onChange={e => setFormData({...formData, workEmail: e.target.value})}
                    className="modal-form-field"
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Organization / Company *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Apex Industrial Group"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    className="modal-form-field"
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#1E293B',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Target Solution *
                  </label>
                  <select 
                    value={formData.solutionArea}
                    onChange={e => setFormData({...formData, solutionArea: e.target.value})}
                    className="modal-form-field"
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.85rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.875rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: '#1E293B',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    <option value="Smart Maintenance Management">Smart Maintenance (CMMS)</option>
                    <option value="Industrial IoT Telemetry">Industrial IoT & Telemetry</option>
                    <option value="Smart Agricultural Management">Smart Agricultural Management</option>
                    <option value="Unified Platform Architecture">Unified Platform Architecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Operational Scope / Technical Objectives
                </label>
                <textarea 
                  rows="3"
                  placeholder="Describe your current asset fleet, sensor integration requirements, or deployment timeline..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="modal-form-field"
                  style={{
                    width: '100%',
                    padding: '0.68rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#1E293B',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748B', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: '500' }}>
                  <Shield size={15} style={{ color: '#FC787D' }} />
                  <span>Enterprise NDA protected</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 text-white font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] select-none"
                  style={{
                    backgroundColor: '#FC787D',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    padding: '0.72rem 1.6rem',
                    borderRadius: '8px',
                    border: 'none',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(252, 120, 125, 0.25)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E86368'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FC787D'}
                >
                  {isSubmitting ? (
                    <>
                      <span>Sending...</span>
                      <Loader2 size={16} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Submit Inquiry</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-form-field:focus {
          border-color: #FC787D !important;
          box-shadow: 0 0 0 3px rgba(252, 120, 125, 0.12) !important;
        }
      `}</style>
    </div>
  );
}
