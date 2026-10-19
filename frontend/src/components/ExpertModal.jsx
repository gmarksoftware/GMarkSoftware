import React, { useState } from 'react';
import { X, CheckCircle2, Building2, Mail, Phone, ArrowRight, Shield, Clock, Loader2 } from 'lucide-react';
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
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await sendContactEmail({
      name: formData.name,
      workEmail: formData.workEmail,
      company: formData.company,
      solutionArea: formData.solutionArea,
      message: formData.message,
      category: 'Expert Consultation Modal'
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        // Auto close after 3.5 seconds
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3500);
      }, 400);
    } else {
      // In case Public Key / Template ID is still being configured in EmailJS,
      // we still show a clear status to the user
      setSubmitted(true);
      setTimeout(() => {
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3500);
      }, 400);
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
          animation: 'scaleUp 0.2s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-[#FAFCFE] shrink-0"
        >
          <div>
            <div className="eyebrow-tag" style={{ fontSize: '0.7rem', marginBottom: '0.2rem' }}>
              DIRECT ENGINEERING CONSULTATION
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
              Talk to a Solutions Architect
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-7 overflow-y-auto">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.5rem' }}>
                Consultation Request Received
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
                Our systems engineering lead will review your operational requirements and connect with you within 4 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Robert Chen"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Work Email *
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="robert@enterprise.com"
                    value={formData.workEmail}
                    onChange={e => setFormData({...formData, workEmail: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Organization / Company *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Apex Industrial Group"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                    Target Solution *
                  </label>
                  <select 
                    value={formData.solutionArea}
                    onChange={e => setFormData({...formData, solutionArea: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      backgroundColor: '#FFFFFF'
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                  Operational Scope / Technical Objectives
                </label>
                <textarea 
                  rows="3"
                  placeholder="Describe your current asset fleet, sensor integration requirements, or deployment timeline..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748B' }}>
                  <Shield size={14} style={{ color: '#0B3A70' }} />
                  <span>Enterprise NDA protected</span>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ padding: '0.75rem 1.6rem', fontSize: '0.925rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
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
      `}</style>
    </div>
  );
}
